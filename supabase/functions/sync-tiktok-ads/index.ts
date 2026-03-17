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
      .eq("user_id", userId).eq("provider", "tiktok_ads").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "TikTok Ads is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { access_token: string; advertiser_id: string };
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list_campaigns";

    if (action === "list_campaigns") {
      const ttResponse = await fetch(
        "https://business-api.tiktok.com/open_api/v1.3/campaign/get/",
        {
          method: "POST",  
          headers: {
            "Access-Token": creds.access_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            advertiser_id: creds.advertiser_id,
            page_size: 50,
          }),
        }
      );

      if (!ttResponse.ok) {
        const errBody = await ttResponse.text();
        return new Response(
          JSON.stringify({ error: `TikTok Ads API error [${ttResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ttData = await ttResponse.json();

      await supabase.from("integration_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId).eq("provider", "tiktok_ads");

      return new Response(
        JSON.stringify({ success: true, campaigns: ttData.data?.list || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "get_report") {
      const ttResponse = await fetch(
        "https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/",
        {
          method: "POST",
          headers: {
            "Access-Token": creds.access_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            advertiser_id: creds.advertiser_id,
            report_type: "BASIC",
            data_level: "AUCTION_CAMPAIGN",
            dimensions: ["campaign_id"],
            metrics: ["spend", "impressions", "clicks", "conversion", "cpc", "ctr"],
            start_date: body.start_date || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0],
            end_date: body.end_date || new Date().toISOString().split("T")[0],
          }),
        }
      );

      if (!ttResponse.ok) {
        const errBody = await ttResponse.text();
        return new Response(
          JSON.stringify({ error: `TikTok Ads API error [${ttResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const ttData = await ttResponse.json();
      return new Response(
        JSON.stringify({ success: true, report: ttData.data?.list || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list_campaigns' or 'get_report'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-tiktok-ads error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
