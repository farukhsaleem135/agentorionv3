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
      .eq("user_id", userId).eq("provider", "youtube_ads").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "YouTube Ads is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // YouTube Ads uses the same Google Ads API
    const creds = connection.credentials as { api_key: string; customer_id: string };
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list_campaigns";
    const customerId = creds.customer_id.replace(/-/g, "");

    if (action === "list_campaigns") {
      const gaResponse = await fetch(
        `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:searchStream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${creds.api_key}`,
            "developer-token": creds.api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: "SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type FROM campaign WHERE campaign.advertising_channel_type = 'VIDEO' ORDER BY campaign.id LIMIT 50",
          }),
        }
      );

      if (!gaResponse.ok) {
        const errBody = await gaResponse.text();
        return new Response(
          JSON.stringify({ error: `YouTube/Google Ads API error [${gaResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const gaData = await gaResponse.json();

      await supabase.from("integration_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId).eq("provider", "youtube_ads");

      return new Response(
        JSON.stringify({ success: true, data: gaData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_video_performance") {
      const gaResponse = await fetch(
        `https://googleads.googleapis.com/v18/customers/${customerId}/googleAds:searchStream`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${creds.api_key}`,
            "developer-token": creds.api_key,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: "SELECT campaign.name, metrics.impressions, metrics.video_views, metrics.clicks, metrics.cost_micros, metrics.video_view_rate FROM campaign WHERE campaign.advertising_channel_type = 'VIDEO' AND segments.date DURING LAST_30_DAYS LIMIT 20",
          }),
        }
      );

      if (!gaResponse.ok) {
        const errBody = await gaResponse.text();
        return new Response(
          JSON.stringify({ error: `YouTube/Google Ads API error [${gaResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const gaData = await gaResponse.json();
      return new Response(
        JSON.stringify({ success: true, data: gaData }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list_campaigns' or 'get_video_performance'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-youtube-ads error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
