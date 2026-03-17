import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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
    const { command, user_id } = await req.json();
    if (!command) throw new Error("No command provided");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Parse intent using AI
    const parseResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a real estate CRM command parser. Parse the user's natural language command into a structured action. Available intents:
- navigate: Go to a page (leads, funnels, listings, content, insights, settings, campaigns)
- filter_leads: Filter leads by temperature, intent, timeline, source
- draft_message: Draft outreach/follow-up for specific leads (by temperature, name, etc.)
- create_funnel: Start creating a new funnel
- show_stats: Show specific metrics or analytics
- route_leads: Auto-assign leads based on criteria (temperature, intent, etc.)
- search: Search across leads, listings, or funnels by keyword

Return a JSON object with: intent, params (object with relevant filters/values), display_text (human-readable description of what you'll do), route (if navigation, the path to go to).

Route mapping: leads=/leads, funnels=/funnels, listings=/listings, content=/content, insights=/insights, settings=/settings, campaigns=/campaigns, autopilot=/autopilot`,
          },
          { role: "user", content: command },
        ],
        tools: [{
          type: "function",
          function: {
            name: "parse_command",
            description: "Parse a natural language command",
            parameters: {
              type: "object",
              properties: {
                intent: { type: "string", enum: ["navigate", "filter_leads", "draft_message", "create_funnel", "show_stats", "route_leads", "search"] },
                params: { type: "object" },
                display_text: { type: "string" },
                route: { type: "string", description: "Route path if navigation" },
              },
              required: ["intent", "display_text"],
              additionalProperties: false,
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "parse_command" } },
      }),
    });

    if (!parseResponse.ok) {
      const errText = await parseResponse.text();
      console.error("AI gateway error:", parseResponse.status, errText);
      if (parseResponse.status === 429) throw new Error("AI rate limit reached. Please try again in a moment.");
      if (parseResponse.status === 402) throw new Error("AI credits exhausted. Please add funds in workspace settings.");
      throw new Error("Failed to parse command");
    }

    const aiResult = await parseResponse.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");

    const parsed = JSON.parse(toolCall.function.arguments);
    let result: Record<string, unknown> = { ...parsed };

    // Step 2: Execute intent-specific logic
    switch (parsed.intent) {
      case "navigate": {
        // Route is already set by AI parser
        if (!result.route) result.route = "/leads";
        break;
      }

      case "filter_leads": {
        let query = supabase.from("funnel_leads").select("id, name, temperature, email, intent, timeline, ai_score");
        if (parsed.params?.temperature) query = query.eq("temperature", parsed.params.temperature);
        if (parsed.params?.intent) query = query.eq("intent", parsed.params.intent);
        if (parsed.params?.status) query = query.eq("status", parsed.params.status);
        const { data: leads } = await query.order("ai_score", { ascending: false }).limit(20);
        result.data = leads || [];
        result.count = leads?.length || 0;
        if (result.count === 0) result.display_text = "No leads match those filters.";
        break;
      }

      case "draft_message": {
        // Fetch matching leads
        const temp = parsed.params?.temperature || "warm";
        const { data: leads } = await supabase
          .from("funnel_leads")
          .select("id, name, email, phone, temperature, intent, timeline, budget, ai_next_step")
          .eq("temperature", temp)
          .order("ai_score", { ascending: false })
          .limit(5);

        if (!leads || leads.length === 0) {
          result.display_text = `No ${temp} leads found to draft a message for.`;
          result.data = [];
          break;
        }

        const leadSummary = leads.map((l: any) =>
          `- ${l.name || "Unknown"} (${l.email || "no email"}, intent: ${l.intent || "unknown"}, timeline: ${l.timeline || "unknown"}, budget: ${l.budget || "unknown"})`
        ).join("\n");

        // Generate draft using AI
        const draftResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${GEMINI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `You are a real estate agent's AI assistant. Write a professional, warm follow-up message for leads. Keep it concise (3-5 sentences), personalized, and include a clear call-to-action. Write the message as if the agent is sending it directly. Do not include subject lines or greetings like "Dear" — start conversationally.`,
              },
              {
                role: "user",
                content: `Draft a follow-up message for these ${temp} leads:\n${leadSummary}\n\nWrite a single template message that could work for all of them, personalizing with [Name] placeholder.`,
              },
            ],
          }),
        });

        if (!draftResponse.ok) {
          throw new Error("Failed to generate draft message");
        }

        const draftResult = await draftResponse.json();
        const draftText = draftResult.choices?.[0]?.message?.content || "Could not generate draft.";

        result.display_text = `Draft follow-up for ${leads.length} ${temp} lead${leads.length > 1 ? "s" : ""}:`;
        result.draft = draftText;
        result.lead_count = leads.length;
        result.leads_targeted = leads.map((l: any) => ({ name: l.name, email: l.email, temperature: l.temperature }));
        break;
      }

      case "create_funnel": {
        result.route = "/funnels";
        result.display_text = "Opening the Funnels page where you can create a new funnel.";
        result.action = "create_funnel";
        break;
      }

      case "show_stats": {
        const [leadsRes, funnelsRes, listingsRes] = await Promise.all([
          supabase.from("funnel_leads").select("id, temperature", { count: "exact" }),
          supabase.from("funnels").select("id, views, leads_count, status"),
          supabase.from("listings").select("id, status, views"),
        ]);
        const leads = leadsRes.data || [];
        const funnels = funnelsRes.data || [];
        const listings = listingsRes.data || [];
        result.data = {
          total_leads: leadsRes.count || leads.length,
          hot_leads: leads.filter((l: any) => l.temperature === "hot").length,
          warm_leads: leads.filter((l: any) => l.temperature === "warm").length,
          cold_leads: leads.filter((l: any) => l.temperature === "cold").length,
          active_funnels: funnels.filter((f: any) => f.status === "live").length,
          total_funnel_views: funnels.reduce((s: number, f: any) => s + (f.views || 0), 0),
          active_listings: listings.filter((l: any) => l.status === "active").length,
          total_listing_views: listings.reduce((s: number, l: any) => s + (l.views || 0), 0),
        };
        break;
      }

      case "route_leads": {
        const targetTemp = parsed.params?.temperature || parsed.params?.source_temperature;
        const destination = parsed.params?.destination || parsed.params?.assigned_to || "priority";

        let query = supabase.from("funnel_leads").select("id, name, temperature, intent");
        if (targetTemp) query = query.eq("temperature", targetTemp);
        if (parsed.params?.intent) query = query.eq("intent", parsed.params.intent);
        if (parsed.params?.deal_side) query = query.eq("deal_side", parsed.params.deal_side);
        const { data: matchedLeads } = await query.limit(50);

        const count = matchedLeads?.length || 0;
        if (count === 0) {
          result.display_text = "No leads matched the routing criteria.";
          result.data = [];
        } else {
          // Tag the leads
          const tags = matchedLeads!.map((l: any) => l.name || l.id).slice(0, 5);
          result.display_text = `Identified ${count} lead${count > 1 ? "s" : ""} for "${destination}" routing.`;
          result.data = {
            leads_matched: count,
            destination: destination,
            sample_leads: tags,
            note: count > 5 ? `...and ${count - 5} more` : undefined,
          };
          result.action = "route_confirmation";
        }
        break;
      }

      case "search": {
        const keyword = parsed.params?.query || parsed.params?.keyword || command;

        // Search across leads, funnels, and listings in parallel
        const [leadsSearch, funnelsSearch, listingsSearch] = await Promise.all([
          supabase.from("funnel_leads")
            .select("id, name, email, temperature, intent")
            .or(`name.ilike.%${keyword}%,email.ilike.%${keyword}%`)
            .limit(10),
          supabase.from("funnels")
            .select("id, name, status, type")
            .ilike("name", `%${keyword}%`)
            .limit(5),
          supabase.from("listings")
            .select("id, address, price, status")
            .ilike("address", `%${keyword}%`)
            .limit(5),
        ]);

        const totalResults =
          (leadsSearch.data?.length || 0) +
          (funnelsSearch.data?.length || 0) +
          (listingsSearch.data?.length || 0);

        result.display_text = totalResults > 0
          ? `Found ${totalResults} result${totalResults > 1 ? "s" : ""} for "${keyword}".`
          : `No results found for "${keyword}".`;

        result.data = {
          leads: leadsSearch.data || [],
          funnels: funnelsSearch.data || [],
          listings: listingsSearch.data || [],
        };
        result.search_query = keyword;
        break;
      }

      default: {
        result.display_text = `I understood your request but the "${parsed.intent}" action is not yet supported.`;
        break;
      }
    }

    // Log the command
    await supabase.from("nlp_commands").insert({
      user_id,
      command_text: command,
      parsed_intent: parsed.intent,
      parsed_params: parsed.params || {},
      result,
    }).then(() => {}, () => {}); // swallow logging errors

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("nlp-command error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
