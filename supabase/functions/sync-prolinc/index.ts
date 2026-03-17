import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { data: connection } = await supabase
      .from("integration_connections").select("credentials, status")
      .eq("user_id", userId).eq("provider", "prolinc").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "PROLINC is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string; agent_id: string };

    // PROLINC API - fetch referrals for agent
    const plResponse = await fetch(
      `https://api.prolinc.co/v1/agents/${encodeURIComponent(creds.agent_id)}/referrals`,
      { headers: { Authorization: `Bearer ${creds.api_key}`, "Content-Type": "application/json" } }
    );

    if (!plResponse.ok) {
      const errBody = await plResponse.text();
      return new Response(
        JSON.stringify({ error: `PROLINC API error [${plResponse.status}]: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const plData = await plResponse.json();
    const referrals = plData.referrals || plData.data || [];

    const { data: funnels } = await supabase.from("funnels").select("id").eq("user_id", userId).limit(1);
    if (!funnels?.length) {
      return new Response(JSON.stringify({ error: "No funnels found." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const funnelId = funnels[0].id;
    let synced = 0;

    for (const ref of referrals.slice(0, 50)) {
      const email = ref.client_email || ref.email || null;
      const phone = ref.client_phone || ref.phone || null;
      const name = ref.client_name || `${ref.first_name || ""} ${ref.last_name || ""}`.trim();
      if (!name && !email) continue;

      if (email) {
        const { data: existing } = await supabase
          .from("funnel_leads").select("id").eq("funnel_id", funnelId).eq("email", email).maybeSingle();
        if (!existing) {
          await supabase.from("funnel_leads").insert({
            funnel_id: funnelId, name, email, phone,
            temperature: "warm", status: "open", intent: "Referral from PROLINC",
          });
          synced++;
        }
      }
    }

    await supabase.from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", userId).eq("provider", "prolinc");

    return new Response(
      JSON.stringify({ success: true, synced, total: referrals.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-prolinc error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
