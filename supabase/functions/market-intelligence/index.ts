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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error("Auth error:", authError?.message, "user:", !!user);
      throw new Error("Unauthorized");
    }

    const { action, neighborhood, city, state, zip_codes, market_area_id } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    if (action === "analyze") {
      // Generate market intelligence for a neighborhood
      const prompt = `You are a hyper-local real estate market intelligence analyst. Analyze the following neighborhood/submarket and provide comprehensive market data.

Neighborhood: ${neighborhood}
City: ${city || "Unknown"}
State: ${state || "Unknown"}
Zip Codes: ${(zip_codes || []).join(", ") || "Not specified"}

Generate realistic, data-driven market intelligence for this specific area. Base your analysis on typical market patterns for this geographic region.`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash",
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: "Analyze this submarket and return structured intelligence." },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_market_analysis",
                description: "Return structured market intelligence for the neighborhood",
                parameters: {
                  type: "object",
                  properties: {
                    avg_sale_price: { type: "number", description: "Average sale price in USD" },
                    median_dom: { type: "integer", description: "Median days on market" },
                    inventory_count: { type: "integer", description: "Active listing count" },
                    price_trend: { type: "string", enum: ["rising", "stable", "declining"] },
                    demand_score: { type: "integer", description: "Buyer demand 0-100" },
                    competition_score: { type: "integer", description: "Agent competition 0-100" },
                    opportunity_score: { type: "integer", description: "Overall opportunity 0-100" },
                    market_temp: { type: "string", enum: ["hot", "warm", "neutral", "cool", "cold"] },
                    summary: { type: "string", description: "2-3 sentence market summary" },
                    highlights: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string" },
                          value: { type: "string" },
                          trend: { type: "string", enum: ["up", "down", "flat"] },
                        },
                        required: ["label", "value", "trend"],
                      },
                      description: "4-6 key market highlights",
                    },
                    seo_title: { type: "string", description: "SEO title under 60 chars" },
                    seo_description: { type: "string", description: "SEO meta description under 160 chars" },
                    seo_content: { type: "string", description: "800-1200 word SEO-optimized neighborhood guide in markdown. Include sections: Overview, Market Trends, Schools & Amenities, Why Move Here, Investment Potential." },
                    latitude: { type: "number" },
                    longitude: { type: "number" },
                  },
                  required: ["avg_sale_price", "median_dom", "inventory_count", "price_trend", "demand_score", "competition_score", "opportunity_score", "market_temp", "summary", "highlights", "seo_title", "seo_description", "seo_content", "latitude", "longitude"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_market_analysis" } },
        }),
      });

      if (!response.ok) {
        const status = response.status;
        if (status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (status === 402) {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw new Error(`AI error: ${status}`);
      }

      const aiData = await response.json();
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("No analysis returned");

      const analysis = JSON.parse(toolCall.function.arguments);

      // Generate slug
      const slug = neighborhood.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      // Upsert market area
      const { data: marketArea, error: upsertError } = await supabase
        .from("market_areas")
        .upsert({
          user_id: user.id,
          name: neighborhood,
          slug,
          city: city || null,
          state: state || null,
          zip_codes: zip_codes || [],
          latitude: analysis.latitude,
          longitude: analysis.longitude,
          avg_sale_price: analysis.avg_sale_price,
          median_dom: analysis.median_dom,
          inventory_count: analysis.inventory_count,
          price_trend: analysis.price_trend,
          demand_score: analysis.demand_score,
          competition_score: analysis.competition_score,
          opportunity_score: analysis.opportunity_score,
          market_temp: analysis.market_temp,
          ai_summary: analysis.summary,
          ai_highlights: analysis.highlights,
          seo_title: analysis.seo_title,
          seo_description: analysis.seo_description,
          seo_content: analysis.seo_content,
          structured_data: {
            "@context": "https://schema.org",
            "@type": "Place",
            name: neighborhood,
            address: { "@type": "PostalAddress", addressLocality: city, addressRegion: state },
          },
          status: "published",
          last_analyzed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id,slug" })
        .select()
        .single();

      if (upsertError) throw upsertError;

      return new Response(JSON.stringify({ ...analysis, id: marketArea.id, slug }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "increment_views") {
      if (!market_area_id) throw new Error("market_area_id required");
      await supabase.rpc("increment_funnel_views", { p_funnel_id: market_area_id });
      // We can't use that RPC for market_areas, so do a manual update
      const { data: ma } = await supabase.from("market_areas").select("views").eq("id", market_area_id).single();
      if (ma) {
        await supabase.from("market_areas").update({ views: (ma.views || 0) + 1 }).eq("id", market_area_id);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("market-intelligence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
