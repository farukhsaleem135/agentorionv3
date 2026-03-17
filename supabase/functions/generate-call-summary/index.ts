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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");

    const { lead_id, transcript, duration_seconds } = await req.json();
    if (!lead_id || !transcript) throw new Error("Missing lead_id or transcript");

    // Fetch lead context
    const { data: lead } = await supabase
      .from("funnel_leads")
      .select("name, temperature, budget, timeline, intent, status")
      .eq("id", lead_id)
      .single();

    const systemPrompt = `You are a real estate AI analyst. Generate a concise call summary from a voice conversation transcript between an agent and a lead. Extract key insights, action items, and sentiment.`;

    const userPrompt = `Lead: ${lead?.name || "Unknown"} (${lead?.temperature || "unknown"} temperature, ${lead?.intent || "unknown"} intent)
Duration: ${duration_seconds ? Math.round(duration_seconds / 60) + " minutes" : "Unknown"}

TRANSCRIPT:
${transcript}

Generate a structured summary.`;

    const tools = [{
      type: "function",
      function: {
        name: "create_call_summary",
        description: "Create a structured call summary",
        parameters: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-3 sentence call overview" },
            key_topics: { type: "array", items: { type: "string" }, description: "Main topics discussed" },
            action_items: { type: "array", items: { type: "string" }, description: "Follow-up actions needed" },
            sentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"] },
            buying_signals: { type: "array", items: { type: "string" }, description: "Buying/selling intent signals detected" },
            objections_raised: { type: "array", items: { type: "string" }, description: "Objections or concerns mentioned" },
            confidence_score: { type: "number", description: "0-100 confidence the lead will convert based on call" },
            recommended_next_step: { type: "string", description: "AI-recommended next action" },
            temperature_change: { type: "string", enum: ["upgrade", "same", "downgrade"], description: "Whether lead temperature should change" },
            new_temperature: { type: "string", enum: ["hot", "warm", "cold"], description: "Suggested new temperature if changed" },
          },
          required: ["summary", "key_topics", "action_items", "sentiment", "confidence_score", "recommended_next_step", "temperature_change"],
          additionalProperties: false,
        },
      },
    }];

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "create_call_summary" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, try again shortly" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const result = JSON.parse(toolCall.function.arguments);

    // Save summary as a conversation entry with metadata
    await supabase.from("lead_conversations").insert({
      lead_id,
      channel: "voice",
      direction: "inbound",
      role: "system",
      content: result.summary,
      metadata: {
        type: "call_summary",
        duration_seconds,
        key_topics: result.key_topics,
        action_items: result.action_items,
        sentiment: result.sentiment,
        buying_signals: result.buying_signals || [],
        objections_raised: result.objections_raised || [],
        confidence_score: result.confidence_score,
        recommended_next_step: result.recommended_next_step,
        temperature_change: result.temperature_change,
        new_temperature: result.new_temperature,
      },
      sentiment_score: result.sentiment === "very_positive" ? 0.9 :
        result.sentiment === "positive" ? 0.7 :
        result.sentiment === "neutral" ? 0.5 :
        result.sentiment === "negative" ? 0.3 : 0.1,
    });

    // Auto-update lead temperature if changed
    if (result.temperature_change !== "same" && result.new_temperature) {
      await supabase.from("funnel_leads").update({
        temperature: result.new_temperature,
        ai_next_step: result.recommended_next_step,
      }).eq("id", lead_id);
    }

    // Check confidence threshold for autonomous follow-up
    const { data: agentSettings } = await supabase
      .from("agent_settings")
      .select("confidence_threshold, auto_send_enabled")
      .eq("user_id", user.id)
      .maybeSingle();

    const threshold = agentSettings?.confidence_threshold ?? 70;
    const shouldAutoFollowUp = agentSettings?.auto_send_enabled && result.confidence_score >= threshold;

    return new Response(
      JSON.stringify({
        ...result,
        auto_follow_up_triggered: shouldAutoFollowUp,
        confidence_threshold: threshold,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-call-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
