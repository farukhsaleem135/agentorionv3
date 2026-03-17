import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign_id, action } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: campaign, error: campErr } = await supabase
      .from("ad_campaigns")
      .select("*, funnels(name, slug, target_area)")
      .eq("id", campaign_id)
      .single();

    if (campErr || !campaign) throw new Error("Campaign not found");

    switch (action) {
      case "publish_meta": {
        const META_ACCESS_TOKEN = Deno.env.get("META_ACCESS_TOKEN");
        const META_AD_ACCOUNT_ID = Deno.env.get("META_AD_ACCOUNT_ID");

        if (!META_ACCESS_TOKEN || !META_AD_ACCOUNT_ID) {
          // Graceful degradation — save as ready but flag missing keys
          await supabase.from("ad_campaigns").update({
            status: "pending_api_key",
          }).eq("id", campaign_id);

          return new Response(JSON.stringify({
            success: false,
            status: "pending_api_key",
            message: "Meta Ads API keys not configured yet. Campaign saved and will publish once keys are added.",
            campaign_id,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // When keys are available, publish to Meta
        const metaResponse = await fetch(
          `https://graph.facebook.com/v19.0/act_${META_AD_ACCOUNT_ID}/campaigns`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: campaign.name,
              objective: "OUTCOME_LEADS",
              status: "PAUSED",
              special_ad_categories: ["HOUSING"],
              access_token: META_ACCESS_TOKEN,
            }),
          }
        );

        const metaResult = await metaResponse.json();
        if (metaResult.error) throw new Error(metaResult.error.message);

        await supabase.from("ad_campaigns").update({
          status: "active",
          external_campaign_id: metaResult.id,
        }).eq("id", campaign_id);

        return new Response(JSON.stringify({
          success: true,
          external_id: metaResult.id,
          platform: "meta",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "publish_google": {
        const GOOGLE_ADS_TOKEN = Deno.env.get("GOOGLE_ADS_TOKEN");
        const GOOGLE_ADS_CUSTOMER_ID = Deno.env.get("GOOGLE_ADS_CUSTOMER_ID");

        if (!GOOGLE_ADS_TOKEN || !GOOGLE_ADS_CUSTOMER_ID) {
          await supabase.from("ad_campaigns").update({
            status: "pending_api_key",
          }).eq("id", campaign_id);

          return new Response(JSON.stringify({
            success: false,
            status: "pending_api_key",
            message: "Google Ads API keys not configured yet. Campaign saved and will publish once keys are added.",
            campaign_id,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Google Ads API integration placeholder
        await supabase.from("ad_campaigns").update({
          status: "active",
          external_campaign_id: `google_${Date.now()}`,
        }).eq("id", campaign_id);

        return new Response(JSON.stringify({
          success: true,
          platform: "google",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "publish_tiktok": {
        const TIKTOK_ACCESS_TOKEN = Deno.env.get("TIKTOK_ACCESS_TOKEN");
        const TIKTOK_ADVERTISER_ID = Deno.env.get("TIKTOK_ADVERTISER_ID");

        if (!TIKTOK_ACCESS_TOKEN || !TIKTOK_ADVERTISER_ID) {
          await supabase.from("ad_campaigns").update({
            status: "pending_api_key",
          }).eq("id", campaign_id);

          return new Response(JSON.stringify({
            success: false,
            status: "pending_api_key",
            message: "TikTok Ads API keys not configured yet. Campaign saved and will publish once keys are added.",
            campaign_id,
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        const ttResponse = await fetch(
          "https://business-api.tiktok.com/open_api/v1.3/campaign/create/",
          {
            method: "POST",
            headers: {
              "Access-Token": TIKTOK_ACCESS_TOKEN,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              advertiser_id: TIKTOK_ADVERTISER_ID,
              campaign_name: campaign.name,
              objective_type: "LEAD_GENERATION",
              budget_mode: "BUDGET_MODE_DAY",
              budget: campaign.daily_budget || 20,
            }),
          }
        );

        const ttResult = await ttResponse.json();
        if (ttResult.code !== 0) {
          throw new Error(ttResult.message || "TikTok API error");
        }

        await supabase.from("ad_campaigns").update({
          status: "active",
          external_campaign_id: ttResult.data?.campaign_id || `tiktok_${Date.now()}`,
        }).eq("id", campaign_id);

        return new Response(JSON.stringify({
          success: true,
          external_id: ttResult.data?.campaign_id,
          platform: "tiktok",
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "pause": {
        await supabase.from("ad_campaigns").update({ status: "paused" }).eq("id", campaign_id);
        return new Response(JSON.stringify({ success: true, status: "paused" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      case "resume": {
        await supabase.from("ad_campaigns").update({ status: "active" }).eq("id", campaign_id);
        return new Response(JSON.stringify({ success: true, status: "active" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (e) {
    console.error("publish-ad error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
