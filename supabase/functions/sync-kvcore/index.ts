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
      .from("integration_connections")
      .select("credentials, status")
      .eq("user_id", userId)
      .eq("provider", "kvcore")
      .single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "kvCORE is not connected. Please add your API key in Integrations." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string; api_secret?: string };

    // kvCORE API - fetch leads
    const kvcoreResponse = await fetch("https://api.kvcore.com/v2/leads", {
      headers: {
        Authorization: `Bearer ${creds.api_key}`,
        "Content-Type": "application/json",
      },
    });

    if (!kvcoreResponse.ok) {
      const errBody = await kvcoreResponse.text();
      return new Response(
        JSON.stringify({ error: `kvCORE API error [${kvcoreResponse.status}]: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const kvcoreData = await kvcoreResponse.json();
    const leads = kvcoreData.data || kvcoreData.leads || [];

    const { data: funnels } = await supabase.from("funnels").select("id").eq("user_id", userId).limit(1);
    if (!funnels?.length) {
      return new Response(
        JSON.stringify({ error: "No funnels found. Create a funnel first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const funnelId = funnels[0].id;
    let synced = 0;

    for (const lead of leads.slice(0, 100)) {
      const email = lead.email || null;
      const phone = lead.phone || lead.cell_phone || null;
      const name = `${lead.first_name || ""} ${lead.last_name || ""}`.trim();
      if (!name && !email) continue;

      if (email) {
        const { data: existing } = await supabase
          .from("funnel_leads").select("id").eq("funnel_id", funnelId).eq("email", email).maybeSingle();

        if (existing) {
          await supabase.from("funnel_leads").update({ name, phone }).eq("id", existing.id);
        } else {
          await supabase.from("funnel_leads").insert({
            funnel_id: funnelId, name, email, phone,
            temperature: "warm", status: "open", intent: "Imported from kvCORE",
          });
        }
        synced++;
      }
    }

    await supabase.from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", userId).eq("provider", "kvcore");

    return new Response(
      JSON.stringify({ success: true, synced, total: leads.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-kvcore error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
