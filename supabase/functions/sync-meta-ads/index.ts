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
      .eq("user_id", userId).eq("provider", "meta_ads").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "Meta Ads is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { access_token: string; ad_account_id: string };
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list_campaigns";

    if (action === "list_campaigns") {
      const metaResponse = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(creds.ad_account_id)}/campaigns?fields=id,name,status,daily_budget,lifetime_budget,objective&access_token=${creds.access_token}`
      );

      if (!metaResponse.ok) {
        const errBody = await metaResponse.text();
        return new Response(
          JSON.stringify({ error: `Meta Ads API error [${metaResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const metaData = await metaResponse.json();

      await supabase.from("integration_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId).eq("provider", "meta_ads");

      return new Response(
        JSON.stringify({ success: true, campaigns: metaData.data || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create_campaign" && body.campaign) {
      const metaResponse = await fetch(
        `https://graph.facebook.com/v21.0/${encodeURIComponent(creds.ad_account_id)}/campaigns`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body.campaign,
            access_token: creds.access_token,
          }),
        }
      );

      if (!metaResponse.ok) {
        const errBody = await metaResponse.text();
        return new Response(
          JSON.stringify({ error: `Meta Ads API error [${metaResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const created = await metaResponse.json();
      return new Response(
        JSON.stringify({ success: true, campaign_id: created.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_insights" && body.campaign_id) {
      const metaResponse = await fetch(
        `https://graph.facebook.com/v21.0/${body.campaign_id}/insights?fields=impressions,clicks,spend,cpc,ctr,reach&access_token=${creds.access_token}`
      );

      if (!metaResponse.ok) {
        const errBody = await metaResponse.text();
        return new Response(
          JSON.stringify({ error: `Meta Ads API error [${metaResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const insights = await metaResponse.json();
      return new Response(
        JSON.stringify({ success: true, insights: insights.data || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list_campaigns', 'create_campaign', or 'get_insights'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-meta-ads error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
