import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Uniqueness seed: randomized creative direction to prevent duplicate outputs
function getUniquenessDirectives(): string {
  const angles = [
    "Lead with a surprising local market statistic",
    "Open with a counterintuitive insight about timing",
    "Start with a relatable homeowner frustration",
    "Begin with a bold prediction about the neighborhood",
    "Frame around a recent market shift or rate change",
    "Lead with a success story pattern",
    "Open with a myth-busting approach",
    "Start with a 'what most agents won't tell you' angle",
  ];
  const tones = ["conversational authority", "data-driven confidence", "empathetic expertise", "bold market insider"];
  const structures = [
    "Problem → Insight → Solution → CTA",
    "Question → Data → Answer → Action",
    "Myth → Truth → Proof → Next Step",
    "Story → Lesson → Application → CTA",
  ];
  return `UNIQUENESS DIRECTIVES (follow these exactly):
- Creative angle: ${angles[Math.floor(Math.random() * angles.length)]}
- Voice: ${tones[Math.floor(Math.random() * tones.length)]}
- Structure: ${structures[Math.floor(Math.random() * structures.length)]}
- Unique seed: ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

const GEO_AEO_LAYER = `
AI-SEARCH OPTIMIZATION RULES (apply to ALL content):
1. GEO (Generative Engine Optimization): Write so AI systems (ChatGPT, Gemini, Perplexity) will quote and surface this content. Use entity-rich phrasing, explicit context markers (e.g., "In [City]'s [Neighborhood]…"), and authoritative factual statements.
2. AEO (Answer Engine Optimization): Lead every section with a direct, quotable answer. Use "The answer is…" or "Here's what to know…" patterns. Structure for zero-click featured snippets.
3. AISO (AI Search Optimization): Make content machine-readable with clear semantic structure, named entities, specific numbers, and structured lists. Avoid vague generalities.
4. LLM SEO: Write content that LLMs can easily parse, summarize, and recommend. Use clean hierarchy, explicit topic sentences, and high signal-to-noise ratio.
5. UNIQUENESS: Every output must be 100% unique. Never produce generic or templated-sounding copy. Vary sentence structure, vocabulary, and framing.
6. AUDIENCE TARGETING: Deeply customize tone, pain points, motivations, and local references for the specific audience segment.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context } = await req.json();

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const uniqueness = getUniquenessDirectives();

    // Custom context requests (ad-copy, conversion-copy, etc.)
    const isCustom = (type === "ad-copy" || type === "conversion-copy") && context;

    // Handle valuation type separately with its own schema
    if (type === "valuation") {
      const valuationResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GEMINI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: "You are a real estate valuation expert. Generate realistic property valuations based on market data patterns. Always respond with the requested JSON structure via the tool call." },
            { role: "user", content: context },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "create_valuation",
                description: "Create a property valuation report",
                parameters: {
                  type: "object",
                  properties: {
                    estimated_value: { type: "number", description: "Estimated market value of the property in USD" },
                    price_per_sqft: { type: "number", description: "Price per square foot in USD" },
                    comp_range_low: { type: "number", description: "Low end of comparable sales range" },
                    comp_range_high: { type: "number", description: "High end of comparable sales range" },
                    market_trend: { type: "string", enum: ["appreciating", "stable", "declining"], description: "Current market trend" },
                    neighborhood_score: { type: "number", description: "Neighborhood desirability score from 1-10" },
                    days_on_market_avg: { type: "number", description: "Average days on market for similar properties" },
                  },
                  required: ["estimated_value", "price_per_sqft", "comp_range_low", "comp_range_high", "market_trend", "neighborhood_score", "days_on_market_avg"],
                  additionalProperties: false,
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "create_valuation" } },
        }),
      });

      if (!valuationResponse.ok) {
        const errText = await valuationResponse.text();
        console.error("AI gateway error:", valuationResponse.status, errText);
        throw new Error("AI valuation generation failed");
      }

      const valResult = await valuationResponse.json();
      const valToolCall = valResult.choices?.[0]?.message?.tool_calls?.[0];
      if (!valToolCall) throw new Error("No tool call returned from AI for valuation");

      const valuationData = JSON.parse(valToolCall.function.arguments);
      return new Response(JSON.stringify(valuationData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const templatePrompts: Record<string, string> = {
      "listing-hook": `Create a 15-second vertical video script for a real estate listing hook.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Attention-grabbing opening line that creates instant curiosity
- 2-3 property highlights using specific, entity-rich language (exact neighborhood, price point, unique features)
- Call-to-action that drives immediate engagement
- Format: scene-by-scene with voiceover text
- Must be 100% unique — never generic "beautiful home" language
- Include a localized micro-answer: "If you're looking for [type] in [area], here's what to know…"`,

      "buyer-tips": `Write a 30-second educational video script about buying a home in today's market.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Cover ONE specific, actionable tip (rates, competition, pre-approval, negotiation, etc.)
- Open with a direct answer: "The #1 thing buyers need to know right now is…"
- Include a specific data point or market insight
- Use AEO-friendly structure: Answer → Context → Action Step
- Must feel like expert advice, not generic tips
- Naturally embed relevant search terms (mortgage rates, home buying process, first-time buyer, etc.)`,

      "market-update": `Write a concise local market update script for social media.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Lead with the most impactful stat (median price, inventory shift, days on market change)
- Structure as: Key Finding → What It Means → What To Do
- Use entity-rich, location-specific phrasing
- Include comparative context (month-over-month, year-over-year)
- End with an audience-specific action step
- Must be quotable by AI search engines as a market authority source`,

      "just-sold": `Write a 'Just Sold' social media post celebrating a successful closing.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Congratulate buyers with genuine warmth (not generic)
- Highlight ONE specific market challenge that was overcome
- Include a subtle but powerful social proof element
- Soft CTA for potential sellers — frame as an authority statement
- Use location-specific language and entity-rich descriptions
- Structure for AI discoverability: Result → Challenge → How → CTA`,

      "youtube-script": `Write a full YouTube video script (5-8 minutes) for a real estate agent's channel.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Hook (first 10 seconds): A bold, curiosity-driven opening that stops the scroll
- Intro: Establish authority and tell viewers exactly what they'll learn
- 3-5 main sections with clear H2-style headings, each delivering a specific insight
- Each section must open with a direct answer (AEO-optimized)
- Include specific data points, local market references, and entity-rich phrasing
- Engagement prompts: "Comment below if…", "Like if you agree…"
- Outro: Strong CTA (subscribe, call, visit website)
- Format: Write as a spoken script with [B-ROLL] and [ON CAMERA] cues
- Must be SEO-optimized for YouTube search (include suggested title and 3 tags)
- Deeply customize for the target audience's pain points and motivations`,

      "blog-post": `Write a comprehensive, SEO-optimized blog post (800-1200 words) for a real estate agent's website.
${uniqueness}
${GEO_AEO_LAYER}
Requirements:
- Title: Under 60 characters, includes primary keyword and location
- Meta description: Under 160 characters, compelling click-through
- Opening paragraph: Direct answer to the implied search query (AEO-optimized)
- 4-6 H2 sections with clear, keyword-rich headings
- Each section opens with a quotable summary sentence for AI systems
- Include a FAQ section (3-5 questions) with concise, direct answers
- Use bullet points, numbered lists, and bold key terms for scannability
- Include specific local data, neighborhood names, price ranges, and market stats
- Natural keyword clusters with synonym expansion and LSI terms
- Internal link suggestions: "[Link: Related topic]"
- CTA tailored to the target audience segment
- Write in a helpful, authoritative tone — not salesy`,
    };

    // For ad-copy/conversion-copy, context IS the full prompt.
    // For all other templates, append context as audience targeting directives.
    let prompt: string;
    if (isCustom) {
      prompt = context;
    } else {
      const basePrompt = templatePrompts[type] || templatePrompts["listing-hook"];
      prompt = context
        ? `${basePrompt}\n\nAUDIENCE & MARKET CONTEXT (use these to deeply customize the content):\n${context}`
        : basePrompt;
    }

    let systemMessage: string;
    let toolSchema: Record<string, unknown>;

    if (type === "ad-copy") {
      systemMessage = `You are an expert advertising copywriter specializing in real estate digital ads.
${GEO_AEO_LAYER}
${uniqueness}

CRITICAL RULES:
- Generate concise, high-converting ad copy optimized for AI-driven ad platforms
- Headlines must be entity-rich, specific, and include high-intent phrasing
- Descriptions must contain clear value propositions with localized micro-answers
- CTAs must be action-oriented with AI-search-friendly language
- Every ad must be 100% unique — vary structure, vocabulary, and angle each time
- Include implicit FAQ-style answers (e.g., "Looking for 3-bed homes under $500K in [Area]? Here's your edge.")
- Return ONLY: line 1 = headline, line 2 = description, line 3 = CTA button text. No labels, no prefixes.`;
      toolSchema = {
        name: "create_content",
        description: "Create structured ad copy for a real estate advertisement",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Ad headline — entity-rich, specific, under 60 characters, includes location/price/audience signal" },
            body: { type: "string", description: "Ad description — persuasive with a direct value answer, under 150 characters" },
            duration: { type: "string", description: "Call-to-action button text, e.g. 'See Available Homes →'" },
          },
          required: ["title", "body", "duration"],
          additionalProperties: false,
        },
      };
    } else if (type === "conversion-copy") {
      systemMessage = `You are an expert conversion copywriter for real estate agents. Write persuasive marketing copy — NOT video scripts, NOT scene descriptions.
${GEO_AEO_LAYER}
${uniqueness}

CRITICAL RULES:
- Write actual text copy for SMS, email, phone scripts, landing pages, or social media posts
- Never use scene directions, camera instructions, or video formatting
- Every piece must open with a direct answer or value statement (AEO pattern)
- Include entity-rich phrasing with specific locations, price points, and audience segments
- Structure with semantic headings and clean hierarchy for LLM parsing
- Generate Version A and Version B that use DIFFERENT angles, structures, and hooks
- Include 2-3 conversion tips that are specific and data-driven
- Each version must be 100% unique from the other and from any previous output
- Embed natural keyword clusters and LSI terms for search discoverability`;
      toolSchema = {
        name: "create_content",
        description: "Create marketing copy for real estate agents",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "A short label for this copy piece" },
            body: { type: "string", description: "The full marketing copy with Version A and Version B variants clearly separated. Include 2-3 conversion tips at the end. Use plain text formatting." },
            duration: { type: "string", description: "The channel this copy is for, e.g. 'SMS', 'Email', 'Call Script'" },
          },
          required: ["title", "body", "duration"],
          additionalProperties: false,
        },
      };
    } else {
      systemMessage = `You are an elite real estate content creator and AI-search strategist.
${GEO_AEO_LAYER}
${uniqueness}

CRITICAL RULES:
- Every piece opens with a direct, quotable answer or value statement
- Use structured, scannable formatting: short paragraphs, bullet insights, step-by-step breakdowns
- Include entity-rich, location-aware language when context is provided
- Write in a way that AI systems will surface, quote, and recommend this content
- Include implicit FAQ patterns and "if you're this type of client" segmentation
- Every output must be 100% unique — vary angle, structure, vocabulary, and framing
- High signal-to-noise: every sentence must add value, no filler`;
      toolSchema = {
        name: "create_content",
        description: "Create structured content for a real estate social media post or video script",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Catchy, entity-rich title under 8 words that AI systems would surface" },
            body: { type: "string", description: "The full script or post content, structured with AEO/GEO optimization" },
            duration: { type: "string", description: "Estimated duration (e.g. '0:15', '0:30', '1:00')" },
          },
          required: ["title", "body", "duration"],
          additionalProperties: false,
        },
      };
    }
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GEMINI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-2.5-flash",
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: prompt },
        ],
        tools: [
          {
            type: "function",
            function: toolSchema,
          },
        ],
        tool_choice: { type: "function", function: { name: "create_content" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      throw new Error("AI generation failed");
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];
    let content;
    if (toolCall) {
      content = JSON.parse(toolCall.function.arguments);
    } else {
      // Fallback: try to parse from message content
      const msgContent = aiResult.choices?.[0]?.message?.content;
      if (msgContent) {
        try {
          const jsonMatch = msgContent.match(/\{[\s\S]*\}/);
          content = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        } catch { content = null; }
      }
      if (!content) {
        content = { title: "Generated Content", body: msgContent || "Content generation returned an unexpected format. Please try again.", duration: null };
      }
    }

    return new Response(JSON.stringify(content), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
