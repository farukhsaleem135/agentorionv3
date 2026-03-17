import { createClient } from "npm:@supabase/supabase-js@2";

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
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    // Fetch user's Follow Up Boss credentials
    const { data: connection, error: connError } = await supabase
      .from("integration_connections")
      .select("credentials, status")
      .eq("user_id", userId)
      .eq("provider", "followupboss")
      .single();

    if (connError || !connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "Follow Up Boss is not connected. Please add your API key in Integrations." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string };
    const apiKey = creds.api_key;

    // Fetch contacts from Follow Up Boss API
    const fubResponse = await fetch("https://api.followupboss.com/v1/people", {
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":")}`,
        "Content-Type": "application/json",
      },
    });

    if (!fubResponse.ok) {
      const errBody = await fubResponse.text();
      return new Response(
        JSON.stringify({ error: `Follow Up Boss API error [${fubResponse.status}]: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const fubData = await fubResponse.json();
    const contacts = fubData.people || [];

    // Get user's funnels to find a target funnel for imported leads
    const { data: funnels } = await supabase
      .from("funnels")
      .select("id")
      .eq("user_id", userId)
      .limit(1);

    if (!funnels?.length) {
      return new Response(
        JSON.stringify({ error: "No funnels found. Create a funnel first to sync leads into." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const funnelId = funnels[0].id;
    let synced = 0;

    for (const contact of contacts.slice(0, 100)) {
      const email = contact.emails?.[0]?.value || null;
      const phone = contact.phones?.[0]?.value || null;
      const name = `${contact.firstName || ""} ${contact.lastName || ""}`.trim();

      if (!name && !email) continue;

      // Upsert by email to avoid duplicates
      if (email) {
        const { data: existing } = await supabase
          .from("funnel_leads")
          .select("id")
          .eq("funnel_id", funnelId)
          .eq("email", email)
          .maybeSingle();

        if (existing) {
          await supabase.from("funnel_leads").update({ name, phone }).eq("id", existing.id);
        } else {
          await supabase.from("funnel_leads").insert({
            funnel_id: funnelId,
            name,
            email,
            phone,
            temperature: "warm",
            status: "open",
            intent: "Imported from Follow Up Boss",
          });
        }
        synced++;
      }
    }

    // Update last_synced_at
    await supabase
      .from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("provider", "followupboss");

    return new Response(
      JSON.stringify({ success: true, synced, total_contacts: contacts.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-followupboss error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
