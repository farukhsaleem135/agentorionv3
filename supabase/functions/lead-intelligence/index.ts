import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// --- Prompt builders ---

function buildScorePrompt(lead: any, seed: string) {
  return `You are a real estate lead intelligence AI and conversion strategist. Analyze this lead with precision and provide scoring, recommendations, and actionable next steps.

ANALYSIS RULES:
- Every recommendation must reference specific data points from the lead profile
- Scoring must account for market conditions, lead behavior signals, and conversion probability
- Risk factors and strengths must be specific to THIS lead, never generic
- Urgency assessment must be based on timeline, temperature, and financing status
- Recommended actions must be concrete and immediately actionable
- Unique analysis seed: ${seed}

Lead data:
- Name: ${lead.name || "Unknown"}
- Temperature: ${lead.temperature || "cold"}
- Budget: ${lead.budget || "Not provided"}
- Timeline: ${lead.timeline || "Not provided"}
- Intent: ${lead.intent || "Not specified"}
- Financing: ${lead.financing_status || "Unknown"}
- Urgency Score: ${lead.urgency_score || 0}
- Source: ${lead.source || "Direct"}
- Days since capture: ${lead.days_since_capture || 0}
- Has phone: ${lead.has_phone ? "Yes" : "No"}
- Has email: ${lead.has_email ? "Yes" : "No"}

Provide analysis using the tool.`;
}

function buildMessagePrompt(lead: any, seed: string) {
  return `You are a real estate messaging expert who creates deeply personalized outreach. Generate messages that feel individually crafted, not mass-produced.

MESSAGE RULES:
- Every message must reference at least ONE specific detail from the lead's profile (budget, timeline, intent, area)
- SMS must be under 160 chars, conversational, with one clear ask
- Email must be under 150 words with a specific value proposition in the first sentence
- Social caption must match platform-native tone
- Call opener must reference something specific to build instant rapport
- NEVER use generic phrases like "I hope this finds you well" or "I wanted to reach out"
- Each message must use a different angle — not just rephrased versions of the same idea
- Unique message seed: ${seed}

Lead: ${lead.name || "Prospect"}
Temperature: ${lead.temperature || "cold"}
Budget: ${lead.budget || "Not specified"}
Timeline: ${lead.timeline || "Not specified"}
Intent: ${lead.intent || "General inquiry"}
Channel requested: ${lead.channel || "all"}
Agent name: ${lead.agent_name || "Your Agent"}

Generate messages optimized for conversion. Each must feel hand-written for this specific person.`;
}

function buildCoachPrompt(lead: any, seed: string) {
  return `You are a real estate sales coach AI providing real-time, actionable coaching for a specific lead interaction.

COACHING RULES:
- Advice must be specific to THIS lead's profile, situation, and engagement level
- Include the "why" behind each recommendation
- Script suggestions must reference the lead's specific details (name, budget, timeline)
- Warnings must be based on concrete signals, not generic caution
- Every tip must be immediately actionable — not vague motivation
- Customize coaching for the lead's intent (buyer vs seller) and temperature
- Unique coaching seed: ${seed}

Lead: ${lead.name || "Unknown"}
Temperature: ${lead.temperature || "cold"}
Budget: ${lead.budget || "Not specified"}
Timeline: ${lead.timeline || "Not specified"}
Status: ${lead.status || "open"}
Days without contact: ${lead.days_without_contact || 0}
Financing: ${lead.financing_status || "Unknown"}

Provide specific, actionable coaching advice tailored to this exact situation.`;
}

function buildPredictSellerPrompt(lead: any, seed: string) {
  return `You are a predictive real estate intelligence AI specializing in seller probability modeling. Analyze this homeowner/lead to predict the likelihood they will list their property for sale in the next 12 months.

PREDICTION RULES:
- Score 0–100 representing the probability of listing in the next 12 months
- Base prediction on ALL available signals: intent, timeline, budget, financing status, temperature, behavioral cues
- If intent is "Selling" or mentions selling, weight heavily
- Timeline urgency increases score: "ASAP" or "1-3 months" = high; "6-12 months" = moderate
- Hot temperature with selling intent = very high score
- Consider life events implied by data (relocation, downsizing, upgrading, financial distress)
- Equity estimate should be inferred from budget/price data when available
- Prediction reasons must be specific and cite data points
- Recommended outreach must be seller-specific (CMA offer, home valuation, prep checklist)
- Unique seed: ${seed}

Lead data:
- Name: ${lead.name || "Unknown"}
- Temperature: ${lead.temperature || "cold"}
- Budget: ${lead.budget || "Not provided"}
- Timeline: ${lead.timeline || "Not provided"}
- Intent: ${lead.intent || "Not specified"}
- Financing: ${lead.financing_status || "Unknown"}
- Urgency Score: ${lead.urgency_score || 0}
- Source: ${lead.source || "Direct"}
- Days since capture: ${lead.days_since_capture || 0}
- Has phone: ${lead.has_phone ? "Yes" : "No"}
- Has email: ${lead.has_email ? "Yes" : "No"}
- Ownership Timeline: ${lead.ownership_timeline || "Unknown"}

Provide your prediction using the tool.`;
}

// --- Tool schemas ---

const scoreTools = [
  {
    type: "function",
    function: {
      name: "score_lead",
      description: "Return AI lead scoring analysis with specific, data-driven insights",
      parameters: {
        type: "object",
        properties: {
          ai_score: { type: "number", description: "Score 0-100 based on likelihood to convert" },
          conversion_probability: { type: "string", description: "Specific probability with reasoning" },
          recommended_channel: { type: "string", enum: ["sms", "email", "call"] },
          best_time: { type: "string", description: "Best time to reach out with reasoning" },
          next_action: { type: "string", description: "Specific, immediately actionable next step" },
          risk_factors: { type: "array", items: { type: "string" } },
          strengths: { type: "array", items: { type: "string" } },
          urgency: { type: "string", enum: ["act_now", "follow_up_today", "nurture", "monitor"] },
        },
        required: ["ai_score", "conversion_probability", "recommended_channel", "best_time", "next_action", "risk_factors", "strengths", "urgency"],
        additionalProperties: false,
      },
    },
  },
];

const messageTools = [
  {
    type: "function",
    function: {
      name: "generate_messages",
      description: "Return personalized, unique multi-channel messages",
      parameters: {
        type: "object",
        properties: {
          sms: { type: "string" },
          email_subject: { type: "string" },
          email_body: { type: "string" },
          social_caption: { type: "string" },
          call_opener: { type: "string" },
          message_tone: { type: "string", enum: ["casual", "professional", "urgent", "educational"] },
        },
        required: ["sms", "email_subject", "email_body", "social_caption", "call_opener", "message_tone"],
        additionalProperties: false,
      },
    },
  },
];

const coachTools = [
  {
    type: "function",
    function: {
      name: "coaching_advice",
      description: "Return specific, actionable sales coaching for this lead",
      parameters: {
        type: "object",
        properties: {
          headline: { type: "string" },
          advice: { type: "array", items: { type: "string" } },
          warning: { type: "string" },
          script_suggestion: { type: "string" },
        },
        required: ["headline", "advice", "warning", "script_suggestion"],
        additionalProperties: false,
      },
    },
  },
];

const predictSellerTools = [
  {
    type: "function",
    function: {
      name: "predict_seller",
      description: "Return predictive seller intelligence with scoring and recommended actions",
      parameters: {
        type: "object",
        properties: {
          seller_prediction_score: { type: "number", description: "0-100 probability of listing in next 12 months" },
          prediction_reasons: { type: "array", items: { type: "string" }, description: "Specific reasons driving this prediction" },
          equity_estimate: { type: "string", description: "Estimated equity range or 'Unknown' if insufficient data" },
          ownership_timeline: { type: "string", description: "Estimated ownership duration or stage" },
          likely_motivation: { type: "string", description: "Primary motivation for selling (e.g., upgrading, relocating, financial)" },
          recommended_approach: { type: "string", description: "Best outreach strategy for this potential seller" },
          prep_pack_items: { type: "array", items: { type: "string" }, description: "3-5 items for a Seller Prep Pack (CMA, staging tips, etc.)" },
          urgency: { type: "string", enum: ["imminent", "likely_soon", "possible", "unlikely"], description: "How soon they might list" },
        },
        required: ["seller_prediction_score", "prediction_reasons", "equity_estimate", "ownership_timeline", "likely_motivation", "recommended_approach", "prep_pack_items", "urgency"],
        additionalProperties: false,
      },
    },
  },
];

// --- Action config ---

const actionConfig: Record<string, {
  buildPrompt: (lead: any, seed: string) => string;
  tools: any[];
  toolName: string;
}> = {
  score: { buildPrompt: buildScorePrompt, tools: scoreTools, toolName: "score_lead" },
  message: { buildPrompt: buildMessagePrompt, tools: messageTools, toolName: "generate_messages" },
  coach: { buildPrompt: buildCoachPrompt, tools: coachTools, toolName: "coaching_advice" },
  predict_seller: { buildPrompt: buildPredictSellerPrompt, tools: predictSellerTools, toolName: "predict_seller" },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { lead, action } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const seed = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const selectedAction = action || "score";
    const config = actionConfig[selectedAction] || actionConfig.score;

    const prompt = config.buildPrompt(lead, seed);

    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a real estate AI intelligence system. Be specific, data-driven, and deeply personalized. Never produce generic or templated outputs. Every analysis and message must reference specific details from the lead's profile." },
          { role: "user", content: prompt },
        ],
        tools: config.tools,
        tool_choice: { type: "function", function: { name: config.toolName } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned from AI");

    const result = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("lead-intelligence error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
