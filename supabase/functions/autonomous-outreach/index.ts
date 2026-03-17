import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface LeadContext {
  name: string | null;
  email: string | null;
  phone: string | null;
  temperature: string | null;
  budget: string | null;
  timeline: string | null;
  intent: string | null;
  financing_status: string | null;
  urgency_score: number | null;
  source: string;
  created_at: string;
  conversation_history: Array<{ role: string; content: string; channel: string }>;
}

// Uniqueness seed for outreach messages
function getOutreachSeed(): string {
  const openers = [
    "Reference a specific local market insight",
    "Lead with empathy about their situation",
    "Open with a personalized observation",
    "Start with a value-first offer",
    "Begin with a time-sensitive opportunity",
    "Open with a question that shows you understand their needs",
  ];
  const styles = [
    "warm and neighborly",
    "professionally confident",
    "casually knowledgeable",
    "directly helpful",
  ];
  return `UNIQUENESS: Use this opener style: "${openers[Math.floor(Math.random() * openers.length)]}". Voice: ${styles[Math.floor(Math.random() * styles.length)]}. Seed: ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}. NEVER use generic phrases like "I hope this message finds you well" or "I wanted to reach out". Every message must feel hand-written for THIS specific person.`;
}

const OUTREACH_OPTIMIZATION = `
AI-OPTIMIZED OUTREACH RULES:
1. Every message must open with a direct value statement or personalized insight — never a generic greeting
2. Reference specific details from the lead's profile (budget, timeline, area, intent) to prove relevance
3. Use entity-rich language: specific neighborhoods, price points, property types
4. Include one micro-answer pattern: "The answer to [their likely question] is…"
5. Each message must be 100% unique — vary structure, vocabulary, angle, and hook
6. Customize tone and pain points for the specific audience segment (buyer vs seller, first-time vs investor, etc.)
7. Embed natural conversation hooks that invite a specific response
8. For SMS: under 160 chars, conversational, one clear ask
9. For email: under 4 sentences, professional warmth, specific value proposition
10. NEVER sound like a template or mass message
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, lead_id, channel, custom_context } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch lead data + conversation history
    const { data: lead, error: leadErr } = await supabase
      .from("funnel_leads")
      .select("*, funnels(name, type, target_area)")
      .eq("id", lead_id)
      .single();

    if (leadErr || !lead) throw new Error("Lead not found");

    const { data: conversations } = await supabase
      .from("lead_conversations")
      .select("role, content, channel, created_at")
      .eq("lead_id", lead_id)
      .order("created_at", { ascending: true })
      .limit(20);

    const leadContext: LeadContext = {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      temperature: lead.temperature,
      budget: lead.budget,
      timeline: lead.timeline,
      intent: lead.intent,
      financing_status: lead.financing_status,
      urgency_score: lead.urgency_score,
      source: lead.funnels?.name || "Direct",
      created_at: lead.created_at,
      conversation_history: (conversations || []).map((c: any) => ({
        role: c.role,
        content: c.content,
        channel: c.channel,
      })),
    };

    const uniqueSeed = getOutreachSeed();

    let systemPrompt: string;
    let userPrompt: string;
    let toolSchema: Record<string, unknown>;

    const leadSummary = `Lead: ${lead.name || "Unknown"} | Temp: ${lead.temperature || "unknown"} | Budget: ${lead.budget || "unknown"} | Timeline: ${lead.timeline || "unknown"} | Intent: ${lead.intent || "unknown"} | Financing: ${lead.financing_status || "unknown"} | Source: ${leadContext.source} | Area: ${lead.funnels?.target_area || "unknown"} | Urgency: ${lead.urgency_score || 0}/100`;

    const conversationContext = leadContext.conversation_history.length > 0
      ? `\n\nPrevious conversation:\n${leadContext.conversation_history.map(c => `[${c.channel}] ${c.role}: ${c.content}`).join("\n")}`
      : "\n\nNo previous conversations with this lead.";

    switch (action) {
      case "draft_initial_outreach":
        systemPrompt = `You are a top-performing real estate agent's AI assistant crafting the FIRST outreach to a new lead.
${OUTREACH_OPTIMIZATION}
${uniqueSeed}
Rules: Be warm, personal, non-pushy. Reference their specific situation (budget, area, timeline). Focus on building rapport and getting a response. The message must feel like it was written specifically for this person after reviewing their profile.`;
        userPrompt = `${leadSummary}\nChannel: ${channel || "sms"}\n\nDraft the initial outreach message.${conversationContext}`;
        toolSchema = {
          name: "draft_outreach",
          description: "Create a personalized, AI-optimized outreach message",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Email subject line (only for email channel) — must be specific and curiosity-driven" },
              body: { type: "string", description: "The outreach message body — personalized, entity-rich, never generic" },
              tone: { type: "string", description: "The tone used: friendly, professional, urgent" },
              follow_up_delay_hours: { type: "number", description: "Suggested hours before follow-up if no response" },
              best_time_to_send: { type: "string", description: "Suggested best time to send" },
            },
            required: ["body", "tone", "follow_up_delay_hours", "best_time_to_send"],
            additionalProperties: false,
          },
        };
        break;

      case "draft_follow_up":
        systemPrompt = `You are a top-performing real estate agent's AI assistant drafting a follow-up message.
${OUTREACH_OPTIMIZATION}
${uniqueSeed}
Rules: Reference what was previously discussed. Offer NEW value (market insight, new listing, rate change, neighborhood update). Create urgency without being pushy. Must add information not in previous messages.`;
        userPrompt = `${leadSummary}\nChannel: ${channel || "sms"}\n\nDraft a follow-up message.${conversationContext}`;
        toolSchema = {
          name: "draft_outreach",
          description: "Create a personalized follow-up message with new value",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Email subject line" },
              body: { type: "string", description: "The follow-up message — must reference previous context and add new value" },
              tone: { type: "string", description: "The tone used" },
              follow_up_delay_hours: { type: "number", description: "Suggested hours before next follow-up" },
              best_time_to_send: { type: "string", description: "Suggested best time to send" },
            },
            required: ["body", "tone", "follow_up_delay_hours", "best_time_to_send"],
            additionalProperties: false,
          },
        };
        break;

      case "draft_reactivation":
        systemPrompt = `You are a real estate agent's AI assistant reactivating a cold or dormant lead.
${OUTREACH_OPTIMIZATION}
${uniqueSeed}
Rules: Use a creative hook — a market change, price drop, new listing, seasonal opportunity, rate shift, or neighborhood development. Make it feel like you're thinking of them specifically because of something that happened in their target market. Never sound like a mass re-engagement blast.`;
        userPrompt = `${leadSummary}\nChannel: ${channel || "sms"}\nTarget area: ${lead.funnels?.target_area || "local market"}\n\nDraft a reactivation message.${conversationContext}`;
        toolSchema = {
          name: "draft_outreach",
          description: "Create a creative reactivation message for a dormant lead",
          parameters: {
            type: "object",
            properties: {
              subject: { type: "string", description: "Email subject line" },
              body: { type: "string", description: "The reactivation message — must have a specific, timely hook" },
              hook_type: { type: "string", description: "The hook used: market_update, new_listing, price_drop, seasonal, rate_change" },
              tone: { type: "string", description: "The tone used" },
              follow_up_delay_hours: { type: "number", description: "Suggested hours before next follow-up" },
            },
            required: ["body", "hook_type", "tone", "follow_up_delay_hours"],
            additionalProperties: false,
          },
        };
        break;

      case "generate_call_script":
        systemPrompt = `You are a real estate agent's AI assistant generating a conversion-optimized call script.
${OUTREACH_OPTIMIZATION}
${uniqueSeed}
Rules: Include opening line that references something specific about the lead. 2-3 qualifying questions tailored to their situation. Objection handlers for their likely concerns (based on budget/timeline/temperature). Closing CTA to set an appointment. Must be conversational, not robotic. Customize for ${lead.intent || "buyer/seller"} intent.`;
        userPrompt = `${leadSummary}\n\nGenerate a call script for this lead.${conversationContext}`;
        toolSchema = {
          name: "generate_script",
          description: "Create a personalized, conversion-optimized call script",
          parameters: {
            type: "object",
            properties: {
              opening: { type: "string", description: "Personalized opening line referencing lead's specific situation" },
              qualifying_questions: { type: "array", items: { type: "string" }, description: "2-3 qualifying questions tailored to this lead" },
              objection_handlers: { type: "array", items: { type: "object", properties: { objection: { type: "string" }, response: { type: "string" } }, required: ["objection", "response"], additionalProperties: false }, description: "Anticipated objections and responses based on lead profile" },
              closing_cta: { type: "string", description: "Closing CTA to book appointment" },
              best_time_to_call: { type: "string", description: "Suggested best time to call" },
            },
            required: ["opening", "qualifying_questions", "objection_handlers", "closing_cta", "best_time_to_call"],
            additionalProperties: false,
          },
        };
        break;

      case "analyze_and_recommend":
        systemPrompt = `You are a real estate lead conversion strategist with deep expertise in buyer/seller psychology and market dynamics.
${OUTREACH_OPTIMIZATION}
Rules: Analyze this lead's complete profile and conversation history. Provide specific, actionable intelligence — not generic advice. Every recommendation must reference specific data points from the lead's profile. Factor in their target area, budget, timeline, and engagement patterns.`;
        userPrompt = `${leadSummary}\n\nAnalyze this lead and recommend next actions.${conversationContext}`;
        toolSchema = {
          name: "analyze_lead",
          description: "Provide data-driven lead analysis and strategic recommendations",
          parameters: {
            type: "object",
            properties: {
              conversion_probability: { type: "number", description: "Estimated conversion probability 0-100 with reasoning" },
              recommended_action: { type: "string", description: "The single best next action — specific and actionable" },
              optimal_channel: { type: "string", description: "Best channel: sms, email, call, or dm — with reasoning" },
              timing: { type: "string", description: "When to take action and why" },
              red_flags: { type: "array", items: { type: "string" }, description: "Specific concerns based on this lead's data" },
              opportunities: { type: "array", items: { type: "string" }, description: "Specific opportunities to leverage" },
              engagement_score: { type: "number", description: "Lead engagement level 0-100" },
            },
            required: ["conversion_probability", "recommended_action", "optimal_channel", "timing", "red_flags", "opportunities", "engagement_score"],
            additionalProperties: false,
          },
        };
        break;

      case "verify_lead":
        systemPrompt = `You are a lead quality verification specialist for real estate.
Rules: Analyze the lead data for quality indicators, fraud signals, and verification status. Check valid contact info patterns, realistic budget/timeline, engagement signals, and suspicious patterns. Be specific about what you find.`;
        userPrompt = `${leadSummary}\n\nVerify this lead's quality.${conversationContext}`;
        toolSchema = {
          name: "verify_lead",
          description: "Verify lead quality and detect potential issues",
          parameters: {
            type: "object",
            properties: {
              quality_score: { type: "number", description: "Overall quality score 0-100" },
              is_verified: { type: "boolean", description: "Whether this lead passes quality checks" },
              verification_notes: { type: "string", description: "Summary of verification findings" },
              fraud_flags: { type: "array", items: { type: "string" }, description: "Any fraud or quality red flags" },
              contact_quality: { type: "string", description: "Contact info quality: high, medium, low" },
              intent_confidence: { type: "string", description: "Intent confidence: high, medium, low" },
            },
            required: ["quality_score", "is_verified", "verification_notes", "fraud_flags", "contact_quality", "intent_confidence"],
            additionalProperties: false,
          },
        };
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (custom_context) {
      userPrompt += `\n\nAdditional context: ${custom_context}`;
    }

    const toolName = toolSchema.name as string;

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{ type: "function", function: toolSchema }],
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned from AI");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ action, lead_id, channel, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("autonomous-outreach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
