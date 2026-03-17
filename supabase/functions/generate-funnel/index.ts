import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── MARKET CONDITION CONTEXT BUILDER ──
function getMarketConditionContext(condition: string, funnelType: string): string {
  const isSeller = ['seller', 'valuation', 'cash_offer', 'cash-offer'].includes(funnelType);
  const contexts: Record<string, Record<string, string>> = {
    sellers: {
      buyer:  "MARKET ALERT: Strong seller's market — low inventory, buyers face competition. Create genuine urgency. Buyers who hesitate lose homes. Emphasize speed and decisiveness.",
      seller: "MARKET CONTEXT: Sellers hold leverage. Avoid urgency for sellers. Emphasize maximizing value and finding the right buyer, not the fastest one.",
    },
    balanced: {
      buyer:  "MARKET CONTEXT: Balanced market — moderate urgency appropriate. Emphasize value, neighborhood quality, and the agent's guidance through a competitive but accessible market.",
      seller: "MARKET CONTEXT: Balanced market means sellers need strategic positioning. Emphasize pricing expertise and marketing reach.",
    },
    buyers: {
      buyer:  "MARKET CONTEXT: Buyer's market — buyers have leverage, inventory is available. Remove urgency entirely. Emphasize selection and negotiating power.",
      seller: "MARKET ALERT: Buyer's market — sellers face real competition. Address seller anxiety directly. Position agent as expert who wins in challenging conditions.",
    },
  };
  const side = isSeller ? 'seller' : 'buyer';
  return contexts[condition]?.[side] ?? contexts.balanced[side];
}

// ── PROSPECT PROFILE CONTEXT BUILDER ──
function getProspectContext(prospectProfile: string): string {
  const profiles: Record<string, string> = {
    first_time:           "TARGET: First-time buyers — excited but anxious, fear mistakes, don't fully know the process. Warm, educational tone. Remove fear. Zero jargon.",
    move_up:              "TARGET: Move-up buyers — already own, ready to upgrade. Primary concern is timing: selling current home while buying next. Acknowledge complexity, position agent as making the transition smooth.",
    investor:             "TARGET: Real estate investors — analytical, numbers-driven. Lead with ROI, cash flow, cap rate. Skip emotional appeals entirely.",
    relocating:           "TARGET: Relocating buyers unfamiliar with local market. They need a trusted local guide. Emphasize neighborhood knowledge and ability to help from a distance.",
    downsizer:            "TARGET: Downsizers — lifestyle transition, often emotionally significant. Acknowledge meaning of selling a family home. Emphasize smooth, respectful process.",
    luxury:               "TARGET: Luxury buyers — value discretion and expertise. Never use urgency tactics. Refined, specific copy. Lifestyle over process.",
    curious_homeowner:    "TARGET: Homeowners curious about value, not committed to selling. Low-pressure essential. Lead with the value of information, not the call to action.",
    motivated_seller:     "TARGET: Motivated sellers ready in 30–90 days. They want efficiency and certainty. Emphasize speed, track record, clear process.",
    inherited_property:   "TARGET: Estate sale — emotionally complex, often unfamiliar with process. Compassionate, clear, zero pressure. Position agent as a trusted guide.",
    investor_liquidating: "TARGET: Investor selling property — analytical, focused on net proceeds and timeline. Lead with numbers and process efficiency.",
    life_change:          "TARGET: Divorce or life change — sensitive situation requiring professionalism and discretion. Empathetic but efficient tone.",
    upgrading:            "TARGET: Selling to buy bigger — dual transaction anxiety. Position agent as experienced coordinator of both sides.",
  };
  return profiles[prospectProfile] ?? "TARGET: General real estate prospect.";
}

// ── CLICHÉ BLACKLIST ──
const CLICHE_BLACKLIST = `
BANNED PHRASES — NEVER use any of the following under any circumstances:
"Find your dream home", "Your dream home awaits", "Dream home", "Perfect home", "Forever home",
"Don't miss this opportunity", "Act now", "Limited time", "Priced to sell", "Won't last long",
"Motivated seller", "Must see", "Nestled in", "Boasting", "Charming", "Cozy", "Stunning" (without specifics),
"Local expertise", "Born and raised", "Best customer service", "Top producer", "Number one agent",
"Full service", "I'm different", "I truly care", "Passionate about real estate",
"Move-in ready" (as headline), "Family oriented", "Hard working",
Any phrase that could appear verbatim in another agent's marketing without modification.
If you are about to use any of these, stop and choose a more specific, differentiated alternative.
`.trim();

// Uniqueness engine: randomized creative frameworks
function getUniquenessDirectives(): string {
  const frameworks = [
    "Fear of Missing Out (FOMO) — emphasize scarcity and urgency",
    "Authority & Social Proof — lead with credibility and results",
    "Pain-Agitate-Solution — surface the problem before the fix",
    "Before-After-Bridge — paint the transformation",
    "Problem-Promise-Proof-Push — structured persuasion",
    "Contrarian — challenge conventional wisdom about the market",
    "Story-Led — open with a micro-narrative",
    "Data-Led — open with a surprising statistic",
  ];
  const voices = [
    "Confident market insider who shares privileged insights",
    "Empathetic advisor who deeply understands client anxiety",
    "Data-driven analyst who backs every claim with evidence",
    "Neighborhood expert with hyperlocal authority",
  ];
  const hooks = [
    "Open with a question that challenges assumptions",
    "Open with a bold market prediction",
    "Open with a specific success metric",
    "Open with a relatable client frustration",
  ];
  return `
UNIQUENESS DIRECTIVES:
- Framework: ${frameworks[Math.floor(Math.random() * frameworks.length)]}
- Voice: ${voices[Math.floor(Math.random() * voices.length)]}
- Hook: ${hooks[Math.floor(Math.random() * hooks.length)]}
- Seed: ${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── AI GATEWAY HELPER ──
async function callAI(apiKey: string, model: string, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const resp = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: maxTokens,
    }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error("RATE_LIMIT");
    if (resp.status === 402) throw new Error("CREDITS_EXHAUSTED");
    const errText = await resp.text();
    console.error("AI gateway error:", resp.status, errText);
    throw new Error("AI generation failed");
  }

  const result = await resp.json();
  const finishReason = result.choices?.[0]?.finish_reason;
  if (finishReason === "length") {
    console.warn(`[callAI] Response truncated (finish_reason=length) for model=${model}, maxTokens=${maxTokens}`);
  }
  return result.choices?.[0]?.message?.content ?? "";
}

serve(async (req) => {
  console.log("[generate-funnel] Function started", {
    method: req.method,
    envVars: Object.keys(Deno.env.toObject()).sort(),
  });
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const {
      type, target_area, zip_codes, focus, price_min, price_max, tone, cta, user_id,
      custom_brief, layout_style, color_theme, custom_colors, typography, density,
      corner_style, cta_style, section_order, hero_image_url, unsplash_meta,
      // New expanded fields
      market_condition = 'balanced',
      prospect_profile = '',
      unique_value_prop = '',
      target_neighborhoods = '',
      urgency_signals = [],
      proof_points = [],
      competitor_claims = [],
      follow_up_mechanism = 'instant_ai',
      custom_audience = '',
    } = body;

    const requestedHeroUrl = typeof hero_image_url === "string" ? hero_image_url.trim() : "";

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    // resolvedArea computed after profile fetch below

    // ── SUPABASE CLIENT ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ── FREE TIER LIMIT CHECK ─────────────────────────────────────
    const { data: limitData, error: limitError } = await supabase
      .rpc('check_user_limits', { p_user_id: user_id });

    if (limitError) {
      console.error('Limit check failed:', limitError);
      // Fail open on limit check errors — do not block legitimate users
    } else if (limitData && !limitData.can_create_funnel) {
      return new Response(
        JSON.stringify({
          error: 'Funnel limit reached',
          message: `Your free plan includes 1 funnel. You currently have ${limitData.current_funnels} active funnel. Upgrade to Growth or Pro to create unlimited funnels.`,
          limit_type: 'funnels',
          current: limitData.current_funnels,
          maximum: limitData.max_funnels,
          tier: limitData.tier,
          upgrade_required: true,
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    // ── END LIMIT CHECK ───────────────────────────────────────────

    // ── PROFILE FETCH ──
    const { data: profile } = await supabase
      .from('profiles')
      .select(
        'display_name, company_name, market_area, license_state, ' +
        'avg_sale_price, commission_rate, target_closings, growth_goal, bio, brand_color, city'
      )
      .eq('user_id', user_id)
      .single();

    // Resolve area with profile fallbacks (after profile fetch)
    const resolvedArea = target_area || profile?.market_area || profile?.city || 'Not specified';

    // ── SLUG GENERATION: /f/agent-name/funnel-name format ──
    const agentName = (profile?.display_name || 'agent').trim();
    const agentSlug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const funnelName = (resolvedArea === 'Not specified' ? type : `${type}-${resolvedArea}`);
    const funnelSlug = funnelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Check for collisions within same agent
    const baseSlug = `${agentSlug}/${funnelSlug}`;
    const { data: existingSlugs } = await supabase
      .from('funnels')
      .select('slug')
      .like('slug', `${baseSlug}%`);

    let slug: string;
    if (!existingSlugs || existingSlugs.length === 0) {
      slug = baseSlug;
    } else {
      // Add short suffix only when collision exists
      const suffix = Date.now().toString(36).slice(-4);
      slug = `${baseSlug}-${suffix}`;
    }

    // ── TOP FUNNEL PERFORMANCE FETCH ──
    const { data: topFunnels } = await supabase
      .from('funnels')
      .select('type, headline, tone, conversion_rate')
      .eq('user_id', user_id)
      .not('conversion_rate', 'is', null)
      .order('conversion_rate', { ascending: false })
      .limit(3);

    // ── MARKET TIER DERIVATION — Priority: wizard price input > profile avg_sale_price ──
    const parsePrice = (val: string | number | undefined | null): number => {
      if (!val) return 0;
      const str = String(val).trim().toLowerCase();
      
      // Remove currency symbols and commas first
      const cleaned = str.replace(/[$,\s]/g, '');
      
      // Handle suffix multipliers — K, M, B
      if (cleaned.endsWith('b')) {
        return parseFloat(cleaned) * 1_000_000_000;
      }
      if (cleaned.endsWith('m')) {
        return parseFloat(cleaned) * 1_000_000;
      }
      if (cleaned.endsWith('k')) {
        return parseFloat(cleaned) * 1_000;
      }
      
      // Plain number — no suffix
      return parseFloat(cleaned) || 0;
    };



    const wizardPriceMin = parsePrice(price_min);
    const wizardPriceMax = parsePrice(price_max);
    const wizardMidpoint = wizardPriceMin > 0 && wizardPriceMax > 0
      ? (wizardPriceMin + wizardPriceMax) / 2
      : wizardPriceMax > 0
        ? wizardPriceMax
        : wizardPriceMin > 0
          ? wizardPriceMin
          : 0;

    const profileAvgPrice = parsePrice(profile?.avg_sale_price);
    const priceForTierDerivation = wizardMidpoint > 0 ? wizardMidpoint : profileAvgPrice;

    const marketTier =
      priceForTierDerivation >= 800000 ? 'luxury' :
      priceForTierDerivation >= 400000 ? 'premium' :
      priceForTierDerivation >= 200000 ? 'mid_market' : 'value';

    // Descriptive only — no dollar amounts to prevent AI anchoring
    const marketTierLabel: Record<string, string> = {
      luxury:     'luxury market segment',
      premium:    'premium market segment',
      mid_market: 'mid-market segment',
      value:      'entry-level and value market segment',
    };

    console.log('GENERATE-FUNNEL PRICE DEBUG:', {
      price_min_raw: price_min,
      price_max_raw: price_max,
      wizardPriceMin,
      wizardPriceMax,
      wizardMidpoint,
      profileAvgPrice,
      priceForTierDerivation,
      marketTier,
    });

    // ── TYPE DETECTION ──
    const isSeller = type?.toLowerCase().includes("seller") || type?.toLowerCase().includes("valuation") || type?.toLowerCase().includes("home-value") || type?.toLowerCase() === "cash_offer" || type?.toLowerCase() === "cash-offer";
    const isOpenHouse = type?.toLowerCase().includes("open-house") || type?.toLowerCase().includes("open_house");
    const isFsbo = type?.toLowerCase() === "fsbo";
    const isExpired = type?.toLowerCase() === "expired";
    const isPreForeclosure = type?.toLowerCase() === "pre-foreclosure";
    const isHighIntent = isFsbo || isExpired || isPreForeclosure;
    const currentYear = new Date().getFullYear();
    const audienceSegment = isFsbo ? "FSBO sellers" : isExpired ? "expired listing owners" : isPreForeclosure ? "pre-foreclosure homeowners" : isSeller ? "sellers" : isOpenHouse ? "open house attendees" : "buyers";

    // ── NICHE DIRECTIVES ──
    let nicheDirectives = "";
    if (isFsbo) {
      nicheDirectives = `
=== FSBO NICHE DIRECTIVES ===
Targeting FSBO homeowners. TONE: Empathetic, non-pushy, educational. NEVER criticize FSBO decision.
ANGLE: Show VALUE an agent adds (net more money, less stress, legal protection) without condescension.
PAIN POINTS: Pricing mistakes, low showings, legal liability, negotiation disadvantage.
CTA FRAMING: "Free FSBO Analysis", "See What You Could Net With an Agent".
NURTURE: 3+ emails educating on FSBO pitfalls with specific stats.`;
    } else if (isExpired) {
      nicheDirectives = `
=== EXPIRED LISTING NICHE DIRECTIVES ===
Targeting expired listing owners. TONE: Understanding, strategic, results-focused. Acknowledge frustration.
ANGLE: "Different strategy, different result." Focus on what went wrong and how to fix it.
PAIN POINTS: Wasted time, bad marketing, overpricing, wrong agent.
CTA FRAMING: "Free Re-Listing Strategy", "See Why It Didn't Sell".`;
    } else if (isPreForeclosure) {
      nicheDirectives = `
=== PRE-FORECLOSURE NICHE DIRECTIVES ===
Targeting homeowners facing foreclosure. TONE: Compassionate, confidential, solution-oriented. NEVER shame.
ANGLE: "You have options." Help them understand alternatives.
PAIN POINTS: Confusion about options, fear of losing equity, legal deadlines.
COMPLIANCE: Not financial/legal advice. Recommend consulting professionals.`;
    }

    // ── BUILD CONTEXT BLOCKS ──
    const proofPoints = proof_points?.length ? proof_points : [];

    const neighborhoodContext = target_neighborhoods
      ? `SPECIFIC NEIGHBORHOODS: ${target_neighborhoods}. Use these names naturally — specificity increases prospect recognition and conversion.`
      : '';

    const urgencyContext = (urgency_signals as string[]).includes('No specific urgency — evergreen')
      ? 'URGENCY: Evergreen funnel — no urgency tactics. Focus on value and expertise.'
      : (urgency_signals as string[]).length > 0
        ? `URGENCY SIGNALS (weave one naturally into copy — do not list all):\n${(urgency_signals as string[]).map((s: string) => `- ${s}`).join('\n')}`
        : '';

    const proofContext = proofPoints.length > 0
      ? `AGENT PROOF POINTS (reference naturally, not as a list):\n${proofPoints.map((p: string) => `- ${p}`).join('\n')}`
      : 'No specific proof points provided. Use general market expertise angle.';

    const uvpContext = unique_value_prop
      ? `AGENT'S UNIQUE VALUE (their words — reference this):\n"${unique_value_prop}"`
      : profile?.bio
        ? `AGENT BIO (use as positioning context):\n"${profile.bio}"`
        : '';

    const competitorContext = (competitor_claims as string[]).length > 0 && !(competitor_claims as string[]).includes('Not sure / skip this')
      ? `COMPETITOR POSITIONING TO AVOID — do not position ${profile?.display_name ?? 'this agent'} using these overused angles:\n${(competitor_claims as string[]).map((c: string) => `- "${c}"`).join('\n')}\nFind an angle these competitors cannot claim.`
      : '';

    const topFunnelContext = topFunnels?.length
      ? `WHAT HAS WORKED FOR THIS AGENT BEFORE:\n${topFunnels.map((f: any) => `- ${f.type} funnel, ${f.tone} tone — headline: "${f.headline}"`).join('\n')}`
      : '';

    const followUpLabel: Record<string, string> = {
      instant_ai:         'Automated AI text + email sent within 60 seconds of form submission',
      personal_call:      'Agent will call personally — high-touch, personal follow-up',
      calendar:           'Prospect is directed to book time on the agent\'s calendar',
      instant_valuation:  'Prospect is immediately shown an AI-generated home valuation',
    };

    const priceRange = (() => {
      const fmt = (n: number): string => {
        if (n >= 1_000_000) {
          return `$${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
        }
        if (n >= 1_000) {
          return `$${Math.round(n / 1_000)}K`;
        }
        if (n > 0) {
          console.warn('PRICE FORMAT WARNING: unexpectedly small value', n);
          return `$${Math.round(n)}`;
        }
        return 'Not specified';
      };
      if (wizardPriceMin > 0 && wizardPriceMax > 0) return `${fmt(wizardPriceMin)} to ${fmt(wizardPriceMax)}`;
      if (wizardPriceMax > 0) return `up to ${fmt(wizardPriceMax)}`;
      if (wizardPriceMin > 0) return `above ${fmt(wizardPriceMin)}`;
      const raw = [price_min, price_max].filter(Boolean).join(' to ');
      return raw || 'Not specified';
    })();

    console.log('PRICE RANGE FINAL:', { priceRange, marketTier });

    console.log('GENERATE-FUNNEL PRICE DEBUG:', JSON.stringify({
      price_min, price_max, wizardPriceMin, wizardPriceMax, wizardMidpoint,
      profileAvgPrice, priceForTierDerivation, marketTier, priceRange,
    }));
    const uniqueness = getUniquenessDirectives();

    // ══════════════════════════════════════════════════════════════
    // STAGE 1: STRATEGY BRIEF (fast, reasoning-focused model)
    // ══════════════════════════════════════════════════════════════
    const strategySystemPrompt = `You are a senior real estate marketing strategist. Analyze the situation and produce a strategic brief only — 4 to 5 sentences. Do not write any copy yet. Plain text, no headers, no bullets.`;

    const strategyUserPrompt = `
AGENT: ${profile?.display_name ?? 'Agent'} at ${profile?.company_name ?? 'Brokerage'}
MARKET: ${resolvedArea}${target_neighborhoods ? `, focusing on ${target_neighborhoods}` : ''}
MARKET SEGMENT: ${marketTierLabel[marketTier]}
TARGET PRICE RANGE FOR THIS FUNNEL: ${priceRange}
CRITICAL: The price range above is the agent's specific target for this funnel. All copy and market references must be calibrated to this exact price range. Do not reference or imply any other price range.
FUNNEL TYPE: ${type}${custom_audience ? ` — custom audience: ${custom_audience}` : ''}
PROSPECT: ${prospect_profile || 'General'}

${getMarketConditionContext(market_condition, type)}
${getProspectContext(prospect_profile)}
${uvpContext}
${proofContext}
${competitorContext}

Identify in 4–5 sentences:
1. The single most compelling angle for this agent in this market for this prospect type
2. The primary emotional state of the target prospect and how copy should speak to it
3. The one thing this agent can claim that competitors cannot
4. The right balance of urgency vs. reassurance for this market condition
`.trim();

    let strategyBrief = "";
    try {
      strategyBrief = await callAI(
        GEMINI_API_KEY,
        "gemini-2.5-flash",
        strategySystemPrompt,
        strategyUserPrompt,
        400
      );
    } catch (e) {
      console.warn("Strategy brief generation failed, proceeding without:", e);
      strategyBrief = "No strategy brief available. Generate content based on available context.";
    }

    // ══════════════════════════════════════════════════════════════
    // STAGE 2: CONTENT GENERATION (full content model)
    // ══════════════════════════════════════════════════════════════
    const generationSystemPrompt = `You are AgentOrion's AI content engine — the most sophisticated real estate marketing copywriter available to independent agents. The current year is ${currentYear}.

Your output must meet these standards:
1. Every piece of copy must be specific to this agent, this market, and this prospect type
2. No generic real estate marketing language whatsoever
3. Every claim must be believable and specific — vague claims are worthless
4. The headline must stop a scrolling prospect cold
5. Copy must speak to what the prospect is actually feeling — not what agents wish they felt

${CLICHE_BLACKLIST}

${uniqueness}`;

    const generationUserPrompt = `
STRATEGIC BRIEF FOR THIS FUNNEL:
${strategyBrief}

AGENT: ${profile?.display_name ?? 'Agent'} | ${profile?.company_name ?? ''} | ${resolvedArea}, ${profile?.license_state ?? ''}
MARKET SEGMENT: ${marketTierLabel[marketTier]}

TARGET PRICE RANGE — THIS IS THE EXACT RANGE TO USE IN ALL COPY: ${priceRange}
This price range came directly from the agent's funnel setup. Every reference to property values, budgets, or price points in the generated copy must reflect this range specifically. Do not substitute, adjust, or override this range based on any other context in this prompt. If the copy references a price point, it must fall within ${priceRange}.

FUNNEL TYPE: ${type} (${audienceSegment})
PROSPECT PROFILE: ${prospect_profile || 'General'}
TONE: ${tone || 'Educational'}
CTA: ${cta || 'Schedule a Call'}
CTA: ${cta || 'Schedule a Call'}

${nicheDirectives}
${getMarketConditionContext(market_condition, type)}
${neighborhoodContext}
${urgencyContext}
${proofContext}
${uvpContext}
${competitorContext}
${topFunnelContext}

FOLLOW-UP MECHANISM: After form submission — ${followUpLabel[follow_up_mechanism] ?? follow_up_mechanism}
Write the CTA button text and post-submit message to match this mechanism exactly.

${custom_brief ? `
AGENT'S CUSTOM BRIEF — PRIMARY CREATIVE DIRECTION:
"${custom_brief}"
All content must align with this brief.
` : ''}

LAYOUT: ${layout_style || 'bold'} | THEME: ${color_theme || 'modern-neutral'} | TYPOGRAPHY: ${typography || 'modern-sans'}
DENSITY: ${density || 'standard'} | CORNERS: ${corner_style || 'rounded'} | CTA STYLE: ${cta_style || 'pill'}

Generate the complete funnel content package. Return ONLY a valid JSON object with exactly these keys — no preamble, no markdown fences. Keep email bodies to 2-3 sentences each. Keep video_script under 120 words.

{
  "name": "Short funnel name including area",
  "headline": "6–10 words. Specific. Stops scrolling.",
  "subheadline": "1 sentence expanding the headline.",
  "body_content": "2 short paragraphs max.",
  "trust_block": "2–3 credibility statements with numbers.",
  "cta_button_text": "4–6 words max.",
  "cta_subtext": "One reassurance line.",
  "post_submit_message": "1 sentence confirming next step.",
  "video_script": "45–60 second script. Pattern interrupt open, CTA close. Under 120 words.",
  "social_captions": {
    "instagram": "Hook + 1 paragraph + 5 hashtags",
    "facebook": "Hook + value + CTA",
    "linkedin": "Professional angle + market insight",
    "tiktok": "Hook in 3 words + quick value + CTA",
    "sms": "Under 160 chars"
  },
  "nurture_emails": [
    { "day": 0, "subject": "Subject line", "preview_text": "Under 90 chars", "body": "2-3 sentences. Warm follow-up." },
    { "day": 2, "subject": "Subject line", "preview_text": "Under 90 chars", "body": "2-3 sentences. Value-add." },
    { "day": 5, "subject": "Subject line", "preview_text": "Under 90 chars", "body": "2-3 sentences. Social proof." },
    { "day": 10, "subject": "Subject line", "preview_text": "Under 90 chars", "body": "2-3 sentences. Re-engagement." },
    { "day": 21, "subject": "Subject line", "preview_text": "Under 90 chars", "body": "2-3 sentences. Nurture." }
  ],
  "problem_section": {
    "title": "Under 10 words",
    "subtitle": "Under 25 words",
    "points": ["Pain point 1", "Pain point 2", "Pain point 3"]
  },
  "value_props": [
    { "title": "Prop 1 title", "desc": "Specific benefit" },
    { "title": "Prop 2 title", "desc": "Specific benefit" },
    { "title": "Prop 3 title", "desc": "Specific benefit" }
  ],
  "seo_meta_title": "Under 60 characters.",
  "seo_meta_description": "Under 155 characters."
}
`.trim();

    let content: any;
    try {
      const rawContent = await callAI(
        GEMINI_API_KEY,
        "gemini-2.5-flash",
        generationSystemPrompt,
        generationUserPrompt,
        8000
      );

      // Parse JSON — handle possible markdown fences
      const cleaned = rawContent.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      try {
        content = JSON.parse(cleaned);
      } catch (parseErr) {
        // Attempt naive JSON repair for truncated responses
        console.warn("Initial JSON parse failed, attempting repair...");
        let repaired = cleaned;
        // Close any unterminated strings
        const quoteCount = (repaired.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) repaired += '"';
        // Close open structures
        const opens = (repaired.match(/[{[]/g) || []).length;
        const closes = (repaired.match(/[}\]]/g) || []).length;
        for (let i = 0; i < opens - closes; i++) {
          // Guess whether to close with } or ]
          repaired += repaired.lastIndexOf('[') > repaired.lastIndexOf('{') ? ']' : '}';
        }
        content = JSON.parse(repaired);
        console.info("JSON repair succeeded");
      }
    } catch (e: any) {
      if (e.message === "RATE_LIMIT") {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (e.message === "CREDITS_EXHAUSTED") {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("Content generation/parse error:", e);
      throw new Error("AI generation failed");
    }

    // ── CONTENT METADATA FOR PERFORMANCE LEARNING ──
    const contentMetadata = {
      headline_word_count: content.headline?.split(' ').length ?? 0,
      tone_used: tone,
      market_condition,
      prospect_profile,
      funnel_type: type,
      market_tier: marketTier,
      has_proof_points: proofPoints.length > 0,
      has_neighborhoods: !!target_neighborhoods,
      has_uvp: !!unique_value_prop,
      urgency_signals_used: urgency_signals,
      follow_up_mechanism,
      competitor_claims_avoided: competitor_claims,
      strategy_brief: strategyBrief,
      generated_at: new Date().toISOString(),
      model_version: 'v2_contextual_two_stage',
    };

    // ── SAVE TO DATABASE ──
    const { data: funnel, error: dbError } = await supabase
      .from("funnels")
      .insert({
        name: content.name || `${type} Funnel — ${resolvedArea !== 'Not specified' ? resolvedArea : 'New'}`,
        type,
        status: "live",
        slug,
        target_area: target_area || resolvedArea,
        zip_codes,
        focus: (() => {
          // Map focus to allowed check constraint values: 'Buyers', 'Sellers', 'Both'
          const f = (focus || '').toLowerCase();
          if (f.includes('seller')) return 'Sellers';
          if (f.includes('both')) return 'Both';
          return 'Buyers';
        })(),
        price_min,
        price_max,
        tone,
        cta: content.cta_button_text || cta,
        headline: content.headline,
        subheadline: content.subheadline,
        body_content: content.body_content,
        trust_block: content.trust_block,
        video_script: content.video_script,
        social_copy: content.social_captions,
        nurture_sequence: content.nurture_emails,
        problem_section: content.problem_section || null,
        value_props: content.value_props || null,
        user_id: user_id || null,
        layout_style: layout_style || "bold",
        color_theme: color_theme || "modern-neutral",
        custom_colors: custom_colors || null,
        typography: typography || "modern-sans",
        density: density || "standard",
        corner_style: corner_style || "rounded",
        cta_style: cta_style || "pill",
        section_order: section_order || ["hero", "stats", "form", "trust"],
        hero_image_url: requestedHeroUrl || null,
        content_metadata: contentMetadata,
      })
      .select()
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      throw new Error("Failed to save funnel");
    }

    // ── HERO IMAGE ORCHESTRATION ──
    // Auto-assign Unsplash hero images (A/B/C) unless user selected one
    if (!requestedHeroUrl && funnel?.id) {
      try {
        const heroResp = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsplash-hero`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
            },
            body: JSON.stringify({
              action: "assign",
              funnel_id: funnel.id,
              funnel_type: type,
              brand_color: profile?.brand_color ?? '',
              market_tier: marketTier,
              avg_sale_price: profile?.avg_sale_price ?? '',
              target_neighborhoods: target_neighborhoods ?? '',
            }),
          }
        );

        if (!heroResp.ok) {
          console.error("Hero assign failed:", await heroResp.text());
        }
      } catch (heroErr) {
        console.error("Hero assign error:", heroErr);
      }

      // Hard guarantee: ensure funnel has a hero_image_url
      const { data: refreshedFunnel } = await supabase
        .from("funnels")
        .select("hero_image_url")
        .eq("id", funnel.id)
        .maybeSingle();

      if (!refreshedFunnel?.hero_image_url) {
        console.warn("[generate-funnel] Missing hero_image_url after assign, applying fallback");

        const { data: existingHero } = await supabase
          .from("funnel_hero_images")
          .select("id, variant, image_url")
          .eq("funnel_id", funnel.id)
          .eq("is_active", true)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (existingHero?.image_url) {
          await supabase
            .from("funnels")
            .update({ hero_image_url: existingHero.image_url })
            .eq("id", funnel.id);
        } else {
          try {
            const searchResp = await fetch(
              `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsplash-hero`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
                },
                body: JSON.stringify({
                  action: "search",
                  funnel_type: type,
                  brand_color: profile?.brand_color ?? '',
                  market_tier: marketTier,
                  avg_sale_price: profile?.avg_sale_price ?? '',
                  target_neighborhoods: target_neighborhoods ?? '',
                }),
              }
            );

            if (searchResp.ok) {
              const searchData = await searchResp.json();
              const fallbackPhoto = searchData?.photos?.[0];

              if (fallbackPhoto?.url_regular) {
                await supabase
                  .from("funnels")
                  .update({ hero_image_url: fallbackPhoto.url_regular })
                  .eq("id", funnel.id);

                await supabase.from("funnel_hero_images").insert({
                  funnel_id: funnel.id,
                  variant: "A",
                  source: "unsplash",
                  image_url: fallbackPhoto.url_regular,
                  unsplash_photo_id: fallbackPhoto.id || null,
                  photographer_name: fallbackPhoto.photographer_name || null,
                  photographer_profile_url: fallbackPhoto.photographer_profile_url || null,
                  unsplash_photo_page_url: fallbackPhoto.unsplash_photo_page_url || null,
                  download_location_url: fallbackPhoto.download_location || null,
                  is_active: true,
                });
              }
            }
          } catch (fallbackErr) {
            console.error("[generate-funnel] Hero fallback error:", fallbackErr);
          }
        }
      }
    }

    // If user selected an Unsplash image manually, create funnel_hero_images record
    if (requestedHeroUrl && unsplash_meta && funnel?.id) {
      await supabase.from("funnel_hero_images").insert({
        funnel_id: funnel.id,
        variant: "A",
        source: "unsplash",
        image_url: requestedHeroUrl,
        unsplash_photo_id: unsplash_meta.unsplash_photo_id,
        photographer_name: unsplash_meta.photographer_name,
        photographer_profile_url: unsplash_meta.photographer_profile_url,
        unsplash_photo_page_url: unsplash_meta.unsplash_photo_page_url,
        download_location_url: unsplash_meta.download_location_url || null,
        is_active: true,
      });
    }

    // Last-resort fallback
    if (funnel?.id) {
      const { data: finalCheck } = await supabase
        .from("funnels")
        .select("hero_image_url")
        .eq("id", funnel.id)
        .maybeSingle();

      if (!finalCheck?.hero_image_url) {
        await supabase
          .from("funnels")
          .update({ hero_image_url: "/og-default.png" })
          .eq("id", funnel.id);
      }
    }

    const { data: finalSavedFunnel } = await supabase
      .from("funnels")
      .select("*")
      .eq("id", funnel.id)
      .maybeSingle();

    return new Response(JSON.stringify({ funnel: finalSavedFunnel || funnel, content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-funnel error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
