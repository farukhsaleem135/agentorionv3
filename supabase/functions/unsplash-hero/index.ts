import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Cache scoring version — bump this when scoring/query logic changes
// Any cached result with a different version is treated as a cache MISS
const CURRENT_SCORING_VERSION = 'v3_photographer_diverse';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Accepted funnel types ──
const VALID_FUNNEL_TYPES = [
  "buyer","first_time_buyer","seller","net_proceeds","relocation",
  "luxury","open_house","market_report",
  "valuation","home-value","cash-offer","fsbo","expired","pre-foreclosure","custom",
] as const;

// SEARCH_QUERIES v3 — Short compositional queries (3-4 words max)
// Unsplash search returns dramatically fewer results for 5+ word queries.
// 3-word queries: 800-6000+ results. 5-word queries: <40 results.
// Tags are NOT returned by the search API — only description and alt_description
// are available for filtering/scoring.

const SEARCH_QUERIES: Record<string, { primary: string[]; secondary: string[] }> = {

  buyer: {
    primary: [
      'modern home interior',
      'bright living room',
      'contemporary kitchen design',
      'home exterior curb appeal',
      'suburban house sunny',
      'new home construction',
    ],
    secondary: [
      'residential architecture interior',
      'home entryway design',
      'house front yard',
    ],
  },

  first_time_buyer: {
    primary: [
      'bright home interior',
      'modern living room',
      'contemporary kitchen',
      'home exterior sunny',
      'suburban neighborhood house',
      'cozy home interior',
    ],
    secondary: [
      'residential interior bright',
      'affordable home exterior',
      'house neighborhood street',
    ],
  },

  seller: {
    primary: [
      'luxury home exterior',
      'home exterior dusk',
      'residential neighborhood aerial',
      'home facade architecture',
      'home curb appeal',
      'house twilight exterior',
    ],
    secondary: [
      'residential architecture exterior',
      'real estate photography',
      'neighborhood tree-lined street',
    ],
  },

  net_proceeds: {
    primary: [
      'luxury home exterior',
      'home facade architecture',
      'home curb appeal',
      'house twilight exterior',
      'residential architecture',
      'modern home exterior',
    ],
    secondary: [
      'real estate photography',
      'residential exterior sunny',
      'home exterior landscape',
    ],
  },

  relocation: {
    primary: [
      'modern home interior',
      'home exterior sunny',
      'suburban house neighborhood',
      'contemporary kitchen',
      'bright living room',
      'inviting home interior',
    ],
    secondary: [
      'residential interior bright',
      'home exterior landscape',
      'home entryway design',
    ],
  },

  valuation: {
    primary: [
      'luxury home exterior',
      'upscale neighborhood aerial',
      'modern residential architecture',
      'elegant home facade',
      'executive home exterior',
      'home exterior landscape',
    ],
    secondary: [
      'residential architecture exterior',
      'luxury home curb appeal',
      'neighborhood professional photography',
    ],
  },

  "home-value": {
    primary: [
      'luxury home exterior',
      'upscale neighborhood',
      'modern residential architecture',
      'elegant home facade',
      'executive home exterior',
      'home curb appeal',
    ],
    secondary: [
      'residential architecture exterior',
      'luxury home landscape',
      'neighborhood aerial photography',
    ],
  },

  "cash-offer": {
    primary: [
      'house keys table',
      'home exterior sold',
      'clean home interior',
      'modern bungalow exterior',
      'simple home exterior',
      'residential property sunny',
    ],
    secondary: [
      'home exterior clean',
      'residential property',
      'house for sale',
    ],
  },

  open_house: {
    primary: [
      'bright living room',
      'home interior staging',
      'open plan living',
      'model home interior',
      'staged living room',
      'open kitchen living',
    ],
    secondary: [
      'home staging photography',
      'modern home interior',
      'interior architecture bright',
    ],
  },

  market_report: {
    primary: [
      'residential neighborhood aerial',
      'modern residential architecture',
      'suburban homes street',
      'neighborhood tree-lined',
      'residential exterior architecture',
      'home exterior sunny',
    ],
    secondary: [
      'residential architecture exterior',
      'suburban neighborhood',
      'modern home exterior',
    ],
  },

  luxury: {
    primary: [
      'luxury estate pool',
      'luxury home architecture',
      'luxury interior marble',
      'penthouse city view',
      'modern villa exterior',
      'estate grand entrance',
    ],
    secondary: [
      'luxury residential architecture',
      'high-end home exterior',
      'upscale interior design',
    ],
  },

  fsbo: {
    primary: [
      'clean home interior',
      'modern home exterior',
      'suburban house sunny',
      'simple home exterior',
      'residential architecture',
      'home exterior clean',
    ],
    secondary: [
      'home exterior simple',
      'residential property',
      'bright interior architecture',
    ],
  },

  expired: {
    primary: [
      'elegant home facade',
      'home exterior landscape',
      'suburban home twilight',
      'modern home exterior',
      'residential architecture',
      'home curb appeal',
    ],
    secondary: [
      'real estate photography',
      'neighborhood street',
      'residential exterior',
    ],
  },

  "pre-foreclosure": {
    primary: [
      'clean home interior',
      'simple home exterior',
      'modern bungalow exterior',
      'suburban house sunny',
      'home exterior simple',
      'residential property',
    ],
    secondary: [
      'bright interior architecture',
      'residential exterior',
      'affordable home exterior',
    ],
  },

  custom: {
    primary: [
      'modern home interior',
      'residential architecture exterior',
      'luxury home living',
      'modern home exterior',
      'inviting home interior',
      'residential architecture',
    ],
    secondary: [
      'home interior architecture',
      'residential exterior',
      'modern home design',
    ],
  },

};

// MARKET TIER QUERY MODIFIERS
const MARKET_TIER_QUERY_OVERRIDES: Record<string, string[]> = {
  luxury: [
    'luxury estate architecture',
    'luxury home modern',
    'luxury interior marble',
    'mansion exterior pool',
    'penthouse city view',
  ],
  value: [
    'clean suburban home exterior sunny blue sky curb appeal',
    'traditional ranch house front yard manicured lawn',
    'affordable starter home exterior well-maintained neighborhood',
    'modest bungalow exterior tree-lined street sunny',
    'suburban neighborhood homes quiet street aerial photography',
    'cheerful home exterior flower garden front porch',
    'simple clean home exterior blue sky white clouds',
  ],
};

// NEIGHBORHOOD CONTEXT MODIFIERS (shortened for Unsplash compatibility)
const REGIONAL_STYLE_MODIFIERS: Record<string, string> = {
  phoenix:        'desert modern architecture',
  scottsdale:     'luxury desert contemporary',
  tucson:         'southwest adobe architecture',
  'las vegas':    'luxury contemporary nevada',
  miami:          'tropical architecture pool',
  orlando:        'florida contemporary home',
  tampa:          'coastal contemporary home',
  nashville:      'southern farmhouse home',
  charlotte:      'traditional brick home',
  atlanta:        'southern brick columns',
  'los angeles':  'california modern architecture',
  'san diego':    'coastal california home',
  'san francisco':'victorian urban architecture',
  'new york':     'brownstone urban architecture',
  boston:         'colonial brick architecture',
  chicago:        'chicago bungalow brick',
  seattle:        'northwest contemporary cedar',
  portland:       'craftsman home exterior',
  dallas:         'texas home suburban',
  houston:        'texas home exterior',
  austin:         'modern contemporary austin',
  'san antonio':  'spanish colonial texas',
};

// ═══════════════════════════════════════════════════════════════
// PHASE A — HARD EXCLUSION FILTERS (non-negotiable reject words)
// ═══════════════════════════════════════════════════════════════
const HARD_REJECT_WORDS = [
  // Irrelevant Lifestyle
  "pet","pets","dog","cat","puppy","kitten",
  "food","restaurant","coffee","cooking","recipe","cuisine",
  "wedding","bride","groom","baby","toddler","newborn",
  "beach","vacation","mountain","travel",
  "car","vehicle","motorcycle",
  "fitness","gym","workout",
  "fashion","clothing","runway",
  // Corporate / Stock Photo Signals
  "handshake","meeting","conference","corporate",
  "office team","business team","suit",
  "realtor","real estate agent","sold sign",
  // Architecture / Interior Only (most funnels)
  "skyscraper","apartment interior",
  "empty room","minimal design",
  // Legacy reject words
  "abstract","pattern","texture","flat lay","mockup",

  // Generic stock photography scenarios
  'business meeting',
  'office building',
  'briefcase',
  'laptop',
  'phone call',
  'whiteboard',
  'team meeting',
  'coworking',
  'workspace',

  // Food and lifestyle contamination
  'cafe',
  'meal',
  'kitchen appliance',

  // People-heavy scenarios
  'group of people',
  'crowd',
  'party',
  'celebration',
  'children playing',
  'pet',

  // Outdoor non-residential
  'public park',
  'nature landscape',
  'lake',
  'river',
  'hiking',
  'forest',

  // Urban non-residential
  'downtown',
  'city skyline',
  'street photography',
  'urban decay',
];

// "living room" is only allowed for buyer, first_time_buyer, open_house
const CONDITIONAL_REJECT: Record<string, string[]> = {
  living_room: ["first_time_buyer", "buyer", "open_house", "relocation"],
};

// ═══════════════════════════════════════════════════════════════
// PHASE A — FUNNEL MUST-HAVE SIGNAL DEFINITIONS
// Updated for compositional/architectural photography approach.
// People presence removed — new scoring penalizes people in hero images.
// ═══════════════════════════════════════════════════════════════
interface MustHaveRule {
  requireAll: string[][]; // each sub-array is an OR group; image must match at least one from EVERY group
}

const MUST_HAVE_SIGNALS: Record<string, MustHaveRule> = {
  buyer: {
    requireAll: [
      ["house","home","interior","exterior","living room","kitchen","architecture","residential","front door","porch","neighborhood","yard","entryway"],
    ],
  },
  first_time_buyer: {
    requireAll: [
      ["house","home","interior","exterior","living room","kitchen","apartment","architecture","residential","entryway"],
    ],
  },
  seller: {
    requireAll: [
      ["exterior","facade","curb","front yard","porch","front door","house","home","yard","architecture","residential","neighborhood","driveway","landscaping"],
    ],
  },
  net_proceeds: {
    requireAll: [
      ["exterior","facade","house","home","architecture","residential","neighborhood","curb"],
    ],
  },
  relocation: {
    requireAll: [
      ["house","home","interior","exterior","living room","kitchen","architecture","residential"],
    ],
  },
  luxury: {
    requireAll: [
      ["balcony","terrace","skyline","penthouse","modern home","luxury","mansion","pool","contemporary","estate","villa","marble","architecture","interior"],
    ],
  },
  open_house: {
    requireAll: [
      ["interior","living room","staging","open plan","bright","airy","home","house","kitchen","furnished","model home"],
    ],
  },
  market_report: {
    requireAll: [
      ["neighborhood","residential","architecture","exterior","home","house","aerial","suburban","street"],
    ],
  },
};

// Alias must-have rules for related funnel types
const MUST_HAVE_ALIASES: Record<string, string> = {
  valuation: "seller",
  "home-value": "seller",
  "cash-offer": "buyer",
  fsbo: "seller",
  expired: "seller",
  "pre-foreclosure": "buyer",
  custom: "buyer",
};

// ── Normalize funnel_type ──
function normalizeFunnelType(raw: string): string | null {
  const t = raw.toLowerCase().trim().replace(/[\s]+/g, "_");
  const aliases: Record<string, string> = {
    "first-time":"first_time_buyer","first-time-buyer":"first_time_buyer","first_time":"first_time_buyer","firsttimebuyer":"first_time_buyer",
    "net-proceeds":"net_proceeds","netproceeds":"net_proceeds","open-house":"open_house","openhouse":"open_house",
    "market-report":"market_report","marketreport":"market_report","home_value":"home-value","homevalue":"home-value",
    "cash_offer":"cash-offer","cashoffer":"cash-offer","pre_foreclosure":"pre-foreclosure","preforeclosure":"pre-foreclosure",
  };
  return aliases[t] || (SEARCH_QUERIES[t] ? t : null);
}

function buildCacheKey(funnelType: string, queries: string[], marketTier: string = 'mid_market'): string {
  return `v6_${funnelType}_${marketTier}__${queries.sort().join("|").substring(0, 100)}`;
}

// Get combined text from photo metadata for checking
function getMetaText(photo: any): string {
  const parts = [
    photo.description || "",
    photo.alt_description || "",
  ];
  if (Array.isArray(photo.tags)) {
    for (const t of photo.tags) {
      parts.push(typeof t === "string" ? t : t.title || "");
    }
  }
  return parts.join(" ").toLowerCase();
}

// ── Fisher-Yates shuffle for query diversity ──
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ── Brand color to Unsplash color filter ──
function getBrandColorFilter(brandColor: string): string {
  if (!brandColor) return '';
  const hex = brandColor.replace('#', '').toLowerCase();
  if (hex.length < 6) return '';
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '';

  if (r > 150 && g > 150 && b > 150) return 'white';
  if (b > r + 40 && b > g + 20) return 'teal';
  if (r > b + 60 && g < 140) return 'orange';
  if (r > 180 && g > 120 && b < 80) return 'yellow';
  return '';
}

// ── Build Unsplash API URL ──
// No color filter (kills 90%+ of results). No per_page>10 (free tier cap).
function buildUnsplashUrl(query: string): string {
  const params = new URLSearchParams({
    query,
    per_page: '30',
    orientation: 'landscape',
    content_filter: 'high',
    order_by: 'relevant',
  });
  return `https://api.unsplash.com/search/photos?${params.toString()}`;
}

// ═══════════════════════════════════════════════════════════════
// FILTER 1: Hard exclusion — reject if ANY banned word appears
// ═══════════════════════════════════════════════════════════════
function shouldHardReject(photo: any, funnelType: string): boolean {
  const text = getMetaText(photo);

  for (const word of HARD_REJECT_WORDS) {
    if (text.includes(word)) return true;
  }

  // Conditional rejects
  if (text.includes("living room") && !(CONDITIONAL_REJECT.living_room || []).includes(funnelType)) {
    return true;
  }

  return false;
}

// ═══════════════════════════════════════════════════════════════
// FILTER 2: Must-have signal — image must match required signals
// ═══════════════════════════════════════════════════════════════
function passesMustHaveSignals(photo: any, funnelType: string): boolean {
  const ruleKey = MUST_HAVE_SIGNALS[funnelType] ? funnelType : MUST_HAVE_ALIASES[funnelType];
  if (!ruleKey) return true;
  const rule = MUST_HAVE_SIGNALS[ruleKey];
  if (!rule) return true;

  const text = getMetaText(photo);

  for (const orGroup of rule.requireAll) {
    const matched = orGroup.some(keyword => text.includes(keyword));
    if (!matched) return false;
  }
  return true;
}

// ═══════════════════════════════════════════════════════════════
// PRE-FILTER: Hero composition filter — before scoring
// ═══════════════════════════════════════════════════════════════
function passesHeroCompositionFilter(photo: any, marketTier: string = 'mid_market'): boolean {
  const width = photo.width ?? 0;
  const height = photo.height ?? 0;
  const ratio = width / Math.max(height, 1);

  if (width < 1920) return false;
  if (ratio < 1.3) return false;
  if (ratio > 3.5) return false;

  const hasAnyText = (photo.description ?? '').length > 3 ||
                     (photo.alt_description ?? '').length > 3;
  if (!hasAnyText) return false;

  // VALUE TIER HARD EXCLUSION
  // Completely remove luxury-signaling images before they reach scoring
  if (marketTier === 'value') {
    const desc = (
      (photo.description ?? '') + ' ' + (photo.alt_description ?? '')
    ).toLowerCase();
    const hardLuxuryExclusions = [
      'luxury', 'mansion', 'estate', 'penthouse', 'marble',
      'infinity pool', 'grand staircase', 'wine cellar', 'chandelier',
      'ultra-luxury', 'high-end interior', 'luxury interior',
    ];
    if (hardLuxuryExclusions.some(t => desc.includes(t))) return false;
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════
// scorePhoto v2 — Professional real estate hero photography scoring
// ═══════════════════════════════════════════════════════════════
function scorePhoto(photo: any, funnelType: string, marketTier: string): number {
  let score = 0;
  const desc = (
    (photo.description ?? '') + ' ' +
    (photo.alt_description ?? '') + ' ' +
    (photo.tags?.map((t: any) => t.title ?? '').join(' ') ?? '')
  ).toLowerCase();

  // ── RESOLUTION QUALITY (0–25 points)
  const width = photo.width ?? 0;
  const height = photo.height ?? 0;
  if (width >= 4000) score += 25;
  else if (width >= 3000) score += 20;
  else if (width >= 2400) score += 14;
  else if (width >= 1920) score += 8;
  else score -= 20;

  // ── ASPECT RATIO (0–15 points)
  const ratio = width / Math.max(height, 1);
  if (ratio >= 1.9 && ratio <= 2.4) score += 15;
  else if (ratio >= 1.6 && ratio < 1.9) score += 10;
  else if (ratio >= 1.4 && ratio < 1.6) score += 5;
  else if (ratio < 1.2) score -= 10;

  // ── PROFESSIONAL PHOTOGRAPHY SIGNALS (0–30 points)
  const professionalSignals = [
    'architecture', 'architectural', 'interior design', 'real estate photography',
    'professional photography', 'wide angle', 'natural light', 'bright interior',
    'modern design', 'contemporary', 'staging', 'curb appeal',
    'professional real estate', 'luxury interior', 'open plan', 'open concept',
    'hardwood floor', 'hardwood floors', 'vaulted ceiling', 'cathedral ceiling',
    'floor-to-ceiling', 'marble', 'quartz', 'granite', 'custom cabinetry',
  ];
  const professionalHits = professionalSignals.filter(s => desc.includes(s)).length;
  score += Math.min(professionalHits * 6, 30);

  // ── LIGHTING QUALITY (0–20 points)
  const lightingSignals: [string, number][] = [
    ['natural light', 12],
    ['sunlight', 10],
    ['bright', 8],
    ['golden hour', 14],
    ['dusk', 14],
    ['twilight', 14],
    ['daylight', 8],
    ['airy', 8],
    ['well-lit', 10],
    ['morning light', 10],
  ];
  for (const [signal, points] of lightingSignals) {
    if (desc.includes(signal)) { score += points; break; }
  }

  // ── FUNNEL TYPE ALIGNMENT (0–20 points)
  const funnelAlignmentSignals: Record<string, string[]> = {
    buyer: [
      'living room', 'kitchen', 'modern home', 'family home',
      'suburban', 'front porch', 'front door', 'entryway', 'exterior',
    ],
    seller: [
      'home exterior', 'curb appeal', 'facade', 'driveway',
      'front yard', 'landscaping', 'neighborhood', 'architectural',
    ],
    valuation: [
      'luxury home', 'upscale', 'executive', 'estate',
      'grand', 'elegant', 'premium', 'high-end',
    ],
    cash_offer: [
      'simple', 'clean', 'modest', 'starter', 'bungalow',
      'traditional', 'suburban home', 'well-maintained',
    ],
    open_house: [
      'living room', 'staging', 'interior', 'open plan',
      'bright interior', 'model home', 'show home', 'furnished',
    ],
    luxury: [
      'luxury', 'estate', 'mansion', 'villa', 'penthouse',
      'infinity pool', 'grand', 'marble', 'panoramic', 'high-end',
    ],
    custom: [
      'home', 'house', 'residential', 'interior', 'exterior',
    ],
  };
  const alignmentWords = funnelAlignmentSignals[funnelType] ?? funnelAlignmentSignals.custom;
  const alignmentHits = alignmentWords.filter(w => desc.includes(w)).length;
  score += Math.min(alignmentHits * 5, 20);

  // ── MARKET TIER ALIGNMENT (0–15 points)
  if (marketTier === 'luxury') {
    const luxuryTerms = ['luxury', 'estate', 'premium', 'high-end', 'marble', 'villa', 'grand', 'penthouse'];
    const luxHits = luxuryTerms.filter(t => desc.includes(t)).length;
    score += Math.min(luxHits * 5, 15);
    const nonLuxuryTerms = ['modest', 'affordable', 'starter', 'budget', 'basic'];
    if (nonLuxuryTerms.some(t => desc.includes(t))) score -= 20;
  } else if (marketTier === 'value') {
    // LUXURY SIGNAL PENALTY — expanded term list, heavier penalty
    const luxuryPenaltyTerms = [
      'mansion', 'estate', 'grand', 'penthouse', 'ultra-luxury',
      'luxury', 'luxury living', 'luxury home', 'luxury interior',
      'high-end', 'upscale', 'premium', 'marble', 'fireplace',
      'infinity pool', 'wine cellar', 'chandelier', 'vaulted',
      'cathedral ceiling', 'floor-to-ceiling windows', 'panoramic',
      'executive', 'gated', 'custom cabinetry', 'quartz countertop',
    ];
    const luxuryPenaltyHits = luxuryPenaltyTerms.filter(t => desc.includes(t)).length;

    // Progressive penalty
    if (luxuryPenaltyHits === 1) score -= 20;
    if (luxuryPenaltyHits === 2) score -= 35;
    if (luxuryPenaltyHits >= 3) score -= 50;

    // APPROACHABLE SIGNAL BONUS
    const approachableTerms = [
      'suburban', 'neighborhood', 'family home', 'starter home',
      'traditional', 'bungalow', 'ranch', 'cozy', 'modest',
      'affordable', 'simple', 'clean exterior', 'well-maintained',
      'front porch', 'backyard', 'tree-lined', 'quiet street',
    ];
    const approachableHits = approachableTerms.filter(t => desc.includes(t)).length;
    score += Math.min(approachableHits * 6, 18);
  }

  // ── PEOPLE PRESENCE PENALTY
  const peopleTerms = [
    'people', 'person', 'man', 'woman', 'family', 'couple', 'children',
    'kids', 'agent', 'realtor', 'smiling', 'portrait', 'standing',
    'sitting', 'group', 'crowd',
  ];
  const hasPeople = peopleTerms.some(t => desc.includes(t));
  if (hasPeople) {
    if (marketTier === 'luxury') score -= 5;
    else score -= 18;
  }

  // ── DARKNESS / MOODY PENALTY
  const darkTerms = ['dark', 'moody', 'dramatic lighting', 'shadow', 'night', 'low light', 'dark interior'];
  if (darkTerms.some(t => desc.includes(t))) score -= 15;

  // ── INTERIOR vs EXTERIOR BALANCE
  const interiorPreferred = ['open_house', 'buyer'];
  const exteriorPreferred = ['seller', 'valuation', 'cash_offer'];
  const isInterior = ['interior', 'indoor', 'inside', 'living room', 'kitchen', 'bedroom'].some(t => desc.includes(t));
  const isExterior = ['exterior', 'outdoor', 'outside', 'facade', 'curb', 'driveway', 'front yard'].some(t => desc.includes(t));

  if (interiorPreferred.includes(funnelType) && isInterior) score += 8;
  if (exteriorPreferred.includes(funnelType) && isExterior) score += 8;
  if (exteriorPreferred.includes(funnelType) && isInterior && !isExterior) score -= 6;

  // ── STOCK PHOTOGRAPHY PENALTY
  const stockSignals = [
    'white background', 'isolated', 'cutout', 'transparent background',
    'clip art', 'vector', 'illustration', 'infographic',
    'business people', 'office', 'corporate', 'handshake',
  ];
  if (stockSignals.some(t => desc.includes(t))) score -= 25;

  // ── UNSPLASH QUALITY SIGNALS
  const likes = photo.likes ?? 0;
  if (likes >= 500) score += 8;
  else if (likes >= 200) score += 5;
  else if (likes >= 50) score += 2;

  // Attach score to photo object for diagnostic logging
  photo._score = score;

  return score;
}

// ═══════════════════════════════════════════════════════════════
// DIAGNOSTICS INTERFACE
// ═══════════════════════════════════════════════════════════════
interface PipelineDiagnostics {
  funnel_id?: string;
  funnel_type: string;
  market_tier: string;
  regional_modifier: string;
  queries_executed: string[];
  raw_from_unsplash: number;
  rejected_by_exclusion: number;
  rejected_by_must_have: number;
  rejected_by_composition: number;
  passed_all_filters: number;
  used_secondary: boolean;
  recently_used_deprioritized: number;
  final_selected_ids: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const UNSPLASH_ACCESS_KEY = Deno.env.get("UNSPLASH_ACCESS_KEY") || Deno.env.get("UNSPLASH_API_KEY");
    if (!UNSPLASH_ACCESS_KEY) throw new Error("UNSPLASH_ACCESS_KEY not configured");

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const body = await req.json();
    const {
      action,
      funnel_id,
      funnel_type,
      photo_id,
      brand_color,
      market_tier = 'mid_market',
      target_neighborhoods = '',
      avg_sale_price,
    } = body;

    // ── ACTION: debug ──
    if (action === "debug") {
      const testQuery = funnel_type || "bright modern home interior natural light";
      const url = buildUnsplashUrl(testQuery);
      const res = await fetch(url, {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`, 'Accept-Version': 'v1' },
      });
      const data = await res.json();
      return new Response(JSON.stringify({
        request_url: url, status: res.status,
        rate_limit_remaining: res.headers.get("X-Ratelimit-Remaining"),
        total_results: data?.total ?? null,
        results_count: data?.results?.length ?? 0,
        sample_descriptions: (data?.results || []).slice(0, 5).map((r: any) => ({
          id: r.id,
          desc: r.description,
          alt: r.alt_description,
          tags: (r.tags || []).map((t: any) => t.title || ""),
        })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── Validate funnel_type ──
    function requireFunnelType(): string {
      if (!funnel_type) throw new Error("funnel_type is required. Accepted values: " + VALID_FUNNEL_TYPES.join(", "));
      const normalized = normalizeFunnelType(funnel_type);
      if (!normalized) throw new Error(`Invalid funnel_type "${funnel_type}". Accepted: ${VALID_FUNNEL_TYPES.join(", ")}`);
      return normalized;
    }

    // ── Derive market tier from avg_sale_price if not explicitly set ──
    let resolvedMarketTier = market_tier;
    if (market_tier === 'mid_market') {
      const rawPriceStr = String(avg_sale_price ?? '0');
      let priceResolved = parseFloat(rawPriceStr.replace(/[$,\s]/g, '')) || 0;
      // Handle "$1.2M" format
      if (rawPriceStr.toLowerCase().includes('m')) {
        priceResolved = (parseFloat(rawPriceStr.replace(/[$,\sM]/gi, '')) || 0) * 1000000;
      }
      if (priceResolved >= 800000) resolvedMarketTier = 'luxury';
      else if (priceResolved > 0 && priceResolved < 200000) resolvedMarketTier = 'value';

      console.log(`[unsplash-hero] Price derivation: raw="${rawPriceStr}" parsed=${priceResolved} → tier="${resolvedMarketTier}"`);
    }

    // ── Resolve regional modifier from target neighborhoods ──
    let regionalModifier = '';
    if (target_neighborhoods) {
      const neighborhoodLower = String(target_neighborhoods).toLowerCase();
      for (const [region, modifier] of Object.entries(REGIONAL_STYLE_MODIFIERS)) {
        if (neighborhoodLower.includes(region)) {
          regionalModifier = modifier;
          break;
        }
      }
    }

    // ── Fetch photos from Unsplash for a set of queries ──
    async function fetchPhotos(queries: string[]): Promise<any[]> {
      const allPhotos: any[] = [];
      const seenIds = new Set<string>();

      for (const query of queries) {
        const url = buildUnsplashUrl(query);
        const res = await fetch(url, {
          headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`, 'Accept-Version': 'v1' },
        });
        if (!res.ok) {
          console.warn(`[unsplash-hero] API error for "${query}": ${res.status}`);
          continue;
        }
        const data = await res.json();
        console.log(`[unsplash-hero] query="${query}" → ${data.results?.length || 0} raw results`);

        for (const photo of data.results || []) {
          if (seenIds.has(photo.id)) continue;
          seenIds.add(photo.id);
          allPhotos.push({
            id: photo.id,
            url_regular: photo.urls.regular,
            url_full: photo.urls.full,
            url_raw: photo.urls.raw,
            photographer_id: photo.user.id ?? '',
            photographer_name: photo.user.name,
            photographer_profile_url: `${photo.user.links.html}?utm_source=AgentOrion&utm_medium=referral`,
            unsplash_photo_page_url: `${photo.links.html}?utm_source=AgentOrion&utm_medium=referral`,
            download_location: photo.links.download_location,
            width: photo.width,
            height: photo.height,
            description: photo.description || photo.alt_description,
            alt_description: photo.alt_description,
            tags: (photo.tags || []).map((t: any) => t.title || ""),
            likes: photo.likes ?? 0,
          });
        }
      }
      return allPhotos;
    }

    // ── Get recently used photo IDs for diversity ──
    async function getRecentlyUsedIds(): Promise<Set<string>> {
      const { data } = await supabase.from("funnel_hero_images")
        .select("unsplash_photo_id")
        .eq("source", "unsplash")
        .not("unsplash_photo_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(20);
      return new Set((data || []).map((r: any) => r.unsplash_photo_id).filter(Boolean));
    }

    // ═══════════════════════════════════════════════════════════
    // PHOTOGRAPHER-DIVERSE SELECTION
    // Selects top N scoring images while enforcing one image per photographer.
    // Falls back to allowing duplicates only for high-scoring images.
    // ═══════════════════════════════════════════════════════════
    const MINIMUM_ACCEPTABLE_SCORE = 20;

    function selectDiverseTopPhotos(
      scoredPhotos: { photo: any; score: number }[],
      count: number = 3
    ): { photo: any; score: number }[] {
      const selected: { photo: any; score: number }[] = [];
      const usedPhotographerIds = new Set<string>();
      const usedPhotographerNames = new Set<string>();

      // First pass — strict one-per-photographer, above minimum score only
      for (const entry of scoredPhotos) {
        if (selected.length >= count) break;
        if (entry.score < MINIMUM_ACCEPTABLE_SCORE) continue;

        const photographerId = entry.photo.photographer_id ?? '';
        const photographerName = (entry.photo.photographer_name ?? '').toLowerCase();

        const photographerAlreadyUsed =
          (photographerId && usedPhotographerIds.has(photographerId)) ||
          (photographerName && usedPhotographerNames.has(photographerName));

        if (!photographerAlreadyUsed) {
          selected.push(entry);
          if (photographerId) usedPhotographerIds.add(photographerId);
          if (photographerName) usedPhotographerNames.add(photographerName);
        }
      }

      // Second pass — if still need photos and ran out of unique photographers,
      // allow a second image from an already-used photographer
      // but only if it scores within 10 points of the top score
      if (selected.length < count) {
        const topScore = scoredPhotos[0]?.score ?? 0;
        for (const entry of scoredPhotos) {
          if (selected.length >= count) break;
          if (selected.includes(entry)) continue;
          if (entry.score < MINIMUM_ACCEPTABLE_SCORE) continue;
          if (entry.score < topScore - 10) continue;
          selected.push(entry);
        }
      }

      // Third pass — if still short, take whatever scores above minimum
      if (selected.length < count) {
        for (const entry of scoredPhotos) {
          if (selected.length >= count) break;
          if (selected.includes(entry)) continue;
          if (entry.score >= MINIMUM_ACCEPTABLE_SCORE) {
            selected.push(entry);
          }
        }
      }

      return selected;
    }

    // ═══════════════════════════════════════════════════════════
    // FULL PIPELINE: fetch → hard reject → composition filter → must-have → score
    // ═══════════════════════════════════════════════════════════
    async function runPipeline(normalizedType: string, forFunnelId?: string): Promise<{ photos: any[]; diagnostics: PipelineDiagnostics }> {
      const querySet = SEARCH_QUERIES[normalizedType] ?? SEARCH_QUERIES.custom;
      const allQueriesExecuted: string[] = [];
      let totalRaw = 0;
      let totalExclusionRejects = 0;
      let totalMustHaveRejects = 0;
      let totalCompositionRejects = 0;
      let usedSecondary = false;

      // Build primary queries with market tier and regional overrides
      let primaryQueries = [...querySet.primary];

      if (resolvedMarketTier === 'luxury' && MARKET_TIER_QUERY_OVERRIDES.luxury) {
        primaryQueries = [...MARKET_TIER_QUERY_OVERRIDES.luxury, ...primaryQueries.slice(0, 2)];
      } else if (resolvedMarketTier === 'value' && MARKET_TIER_QUERY_OVERRIDES.value) {
        primaryQueries = [...MARKET_TIER_QUERY_OVERRIDES.value, ...primaryQueries.slice(0, 2)];
      }

      if (regionalModifier && primaryQueries.length > 0) {
        const regionalQuery = `${primaryQueries[0]} ${regionalModifier}`;
        primaryQueries = [regionalQuery, ...primaryQueries];
      }

      // Helper to run a batch of queries through all filters
      // Must-have is now a SOFT filter: photos that pass get a scoring bonus,
      // but photos that fail are still included (they just score lower).
      // This prevents empty results when Unsplash descriptions are sparse.
      async function fetchAndFilter(queries: string[], existingIds: Set<string>): Promise<{ passed: any[]; soft: any[] }> {
        allQueriesExecuted.push(...queries);
        const rawPhotos = await fetchPhotos(queries);
        totalRaw += rawPhotos.length;

        const afterExclusion: any[] = [];
        for (const p of rawPhotos) {
          if (existingIds.has(p.id)) continue;
          if (shouldHardReject(p, normalizedType)) {
            totalExclusionRejects++;
            continue;
          }
          afterExclusion.push(p);
        }

        // Composition pre-filter (hard — resolution/ratio requirements)
        const afterComposition: any[] = [];
        for (const p of afterExclusion) {
          if (passesHeroCompositionFilter(p, resolvedMarketTier)) {
            afterComposition.push(p);
          } else {
            totalCompositionRejects++;
          }
        }

        // Must-have is now soft — separate into passed and soft-failed
        const passed: any[] = [];
        const soft: any[] = [];
        for (const p of afterComposition) {
          if (passesMustHaveSignals(p, normalizedType)) {
            passed.push(p);
          } else {
            totalMustHaveRejects++;
            soft.push(p);
          }
        }

        return { passed, soft };
      }

      const acceptedIds = new Set<string>();
      const primaryResult = await fetchAndFilter(primaryQueries, acceptedIds);
      // Must-have passed photos go first, soft-failed photos are fallback
      let accepted = [...primaryResult.passed, ...primaryResult.soft];
      accepted.forEach(p => acceptedIds.add(p.id));

      console.log(`[unsplash-hero] PRIMARY type="${normalizedType}" tier="${resolvedMarketTier}" raw=${totalRaw} excl=${totalExclusionRejects} comp=${totalCompositionRejects} must=${totalMustHaveRejects} mustPassed=${primaryResult.passed.length} softFallback=${primaryResult.soft.length}`);

      // FAILSAFE: if fewer than 3 pass hard+soft, try secondary queries
      if (accepted.length < 3) {
        console.log(`[unsplash-hero] FAILSAFE: only ${accepted.length} passed, trying secondary queries`);
        usedSecondary = true;
        const secondaryQueries = shuffleArray(querySet.secondary);
        const secondaryResult = await fetchAndFilter(secondaryQueries, acceptedIds);
        accepted = [...accepted, ...secondaryResult.passed, ...secondaryResult.soft];
        [...secondaryResult.passed, ...secondaryResult.soft].forEach(p => acceptedIds.add(p.id));
        console.log(`[unsplash-hero] After secondary: ${accepted.length} total accepted`);
      }

      // Diversity: deprioritize recently used
      const recentIds = await getRecentlyUsedIds();
      const fresh = accepted.filter(p => !recentIds.has(p.id));
      const reused = accepted.filter(p => recentIds.has(p.id));
      const diversePool = [...fresh, ...reused];

      // Score and rank — must-have passed photos get a bonus in scorePhoto
      // via funnel alignment signals, so they naturally rank higher
      const scored = diversePool
        .map(p => ({ photo: p, score: scorePhoto(p, normalizedType, resolvedMarketTier) }))
        .sort((a, b) => b.score - a.score);

      // Photographer-diverse selection instead of simple slice
      const topPhotos = selectDiverseTopPhotos(scored, 3);
      const topPhotoIds = new Set(topPhotos.map(s => s.photo.id));
      const rejectedPhotos = scored.filter(s => !topPhotoIds.has(s.photo.id));
      // Build final list: selected first, then remaining scored
      const finalScored = [...topPhotos.map(s => s.photo), ...rejectedPhotos.map(s => s.photo)];

      const diagnostics: PipelineDiagnostics = {
        funnel_id: forFunnelId,
        funnel_type: normalizedType,
        market_tier: resolvedMarketTier,
        regional_modifier: regionalModifier,
        queries_executed: allQueriesExecuted,
        raw_from_unsplash: totalRaw,
        rejected_by_exclusion: totalExclusionRejects,
        rejected_by_must_have: totalMustHaveRejects,
        rejected_by_composition: totalCompositionRejects,
        passed_all_filters: accepted.length,
        used_secondary: usedSecondary,
        recently_used_deprioritized: reused.length,
        final_selected_ids: topPhotos.map(s => s.photo.id),
      };

      // Structured diagnostic log for selection verification
      console.log(JSON.stringify({
        event: 'unsplash_selection_complete',
        funnel_type: normalizedType,
        resolved_market_tier: resolvedMarketTier,
        avg_sale_price_received: avg_sale_price,
        cache_hit: false,
        scoring_version: CURRENT_SCORING_VERSION,
        queries_used: allQueriesExecuted.slice(0, 5),
        total_candidates_fetched: totalRaw,
        passed_hard_exclusion: totalRaw - totalExclusionRejects,
        passed_composition_filter: accepted.length,
        total_scored: scored.length,
        top_3_scores: topPhotos.map(s => ({
          id: s.photo.id,
          score: s.score,
          photographer_id: s.photo.photographer_id ?? '',
          photographer_name: s.photo.photographer_name ?? '',
          description: (s.photo.alt_description ?? '').substring(0, 60),
        })),
        photographer_diversity: new Set(topPhotos.map(s => s.photo.photographer_id ?? s.photo.photographer_name ?? '')).size,
        lowest_rejected_score: rejectedPhotos.length > 0 ? rejectedPhotos[rejectedPhotos.length - 1].score : null,
        highest_rejected_score: rejectedPhotos.length > 0 ? rejectedPhotos[0].score : null,
        highest_rejected_description: rejectedPhotos.length > 0 ? (rejectedPhotos[0].photo.alt_description ?? '').substring(0, 60) : null,
        score_spread: topPhotos.length > 0 && rejectedPhotos.length > 0
          ? topPhotos[0].score - rejectedPhotos[rejectedPhotos.length - 1].score
          : null,
      }));

      return { photos: finalScored, diagnostics };
    }

    // ── ACTION: search ──
    if (action === "search") {
      const normalizedType = requireFunnelType();
      const querySet = SEARCH_QUERIES[normalizedType] ?? SEARCH_QUERIES.custom;
      const cacheKey = buildCacheKey(normalizedType, querySet.primary, resolvedMarketTier);

      console.log(`[unsplash-hero] SEARCH type="${normalizedType}" tier="${resolvedMarketTier}"`);

      // Check cache — must match current scoring version
      const { data: cached } = await supabase.from("unsplash_cache")
        .select("results, expires_at, scoring_version")
        .eq("keyword_set", cacheKey)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cached && cached.scoring_version === CURRENT_SCORING_VERSION) {
        console.log(JSON.stringify({
          event: 'unsplash_cache_hit',
          funnel_type: normalizedType,
          resolved_market_tier: resolvedMarketTier,
          scoring_version: cached.scoring_version,
          cache_key: cacheKey,
        }));
        return new Response(JSON.stringify({ photos: cached.results, funnel_type: normalizedType, cache: "hit" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (cached) {
        console.log(`[unsplash-hero] Cache VERSION MISMATCH for "${normalizedType}": cached=${cached.scoring_version} current=${CURRENT_SCORING_VERSION} → regenerating`);
      }

      const { photos, diagnostics } = await runPipeline(normalizedType);
      const finalPhotos = photos.slice(0, 12);

      console.log(`[unsplash-hero] SEARCH result: ${finalPhotos.length} photos`);

      if (finalPhotos.length === 0) {
        return new Response(JSON.stringify({ error: `No images found for "${normalizedType}".`, funnel_type: normalizedType, diagnostics }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Cache results (12h TTL) with scoring version
      await supabase.from("unsplash_cache").upsert({
        keyword_set: cacheKey,
        results: finalPhotos,
        fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
        scoring_version: CURRENT_SCORING_VERSION,
        photographer_ids: finalPhotos.slice(0, 3).map((p: any) => p.photographer_id ?? '').filter(Boolean),
      }, { onConflict: "keyword_set" });

      return new Response(JSON.stringify({ photos: finalPhotos, funnel_type: normalizedType, cache: "miss", diagnostics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: assign ──
    if (action === "assign") {
      if (!funnel_id) throw new Error("funnel_id is required");
      const normalizedType = requireFunnelType();
      const querySet = SEARCH_QUERIES[normalizedType] ?? SEARCH_QUERIES.custom;
      const cacheKey = buildCacheKey(normalizedType, querySet.primary, resolvedMarketTier);

      console.log(`[unsplash-hero] ASSIGN funnel_id="${funnel_id}" type="${normalizedType}" tier="${resolvedMarketTier}"`);

      let photos: any[] = [];
      let diagnostics: PipelineDiagnostics;

      // Check cache — must match current scoring version
      const { data: cached } = await supabase.from("unsplash_cache")
        .select("results, expires_at, scoring_version")
        .eq("keyword_set", cacheKey)
        .gte("expires_at", new Date().toISOString())
        .maybeSingle();

      const cacheValid = cached && cached.scoring_version === CURRENT_SCORING_VERSION;

      if (cacheValid) {
        photos = cached.results as any[];
        diagnostics = {
          funnel_id,
          funnel_type: normalizedType,
          market_tier: resolvedMarketTier,
          regional_modifier: regionalModifier,
          queries_executed: ["(from cache)"],
          raw_from_unsplash: 0,
          rejected_by_exclusion: 0,
          rejected_by_must_have: 0,
          rejected_by_composition: 0,
          passed_all_filters: photos.length,
          used_secondary: false,
          recently_used_deprioritized: 0,
          final_selected_ids: photos.slice(0, 3).map((p: any) => p.id),
        };
        console.log(JSON.stringify({
          event: 'unsplash_cache_hit',
          funnel_type: normalizedType,
          resolved_market_tier: resolvedMarketTier,
          scoring_version: cached.scoring_version,
          cache_key: cacheKey,
          action: 'assign',
        }));
      } else {
        if (cached) {
          console.log(`[unsplash-hero] ASSIGN cache VERSION MISMATCH: cached=${cached.scoring_version} current=${CURRENT_SCORING_VERSION} → regenerating`);
        }
        const result = await runPipeline(normalizedType, funnel_id);
        photos = result.photos;
        diagnostics = result.diagnostics;
        if (photos.length > 0) {
          await supabase.from("unsplash_cache").upsert({
            keyword_set: cacheKey,
            results: photos.slice(0, 12),
            fetched_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
            scoring_version: CURRENT_SCORING_VERSION,
            photographer_ids: photos.slice(0, 3).map((p: any) => p.photographer_id ?? '').filter(Boolean),
          }, { onConflict: "keyword_set" });
        }
      }

      if (photos.length === 0) {
        console.error(`[unsplash-hero] ASSIGN: No photos for "${normalizedType}". Diagnostics: ${JSON.stringify(diagnostics)}`);
        return new Response(JSON.stringify({ error: "No photos found for this funnel type", funnel_type: normalizedType, diagnostics }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Pick top 3 (already scored/ranked)
      const top3 = photos.slice(0, 3);
      const variants = ["A", "B", "C"];

      top3.forEach((photo: any, i: number) => {
        console.log(`[unsplash-hero] SELECTED variant=${variants[i]} funnel_id="${funnel_id}" type="${normalizedType}" photo_id="${photo.id}" desc="${(photo.description || "").slice(0, 100)}"`);
      });
      console.log(`[unsplash-hero] PIPELINE DIAGNOSTICS: ${JSON.stringify(diagnostics)}`);

      // Delete existing Unsplash variants for this funnel
      await supabase.from("funnel_hero_images").delete().eq("funnel_id", funnel_id).eq("source", "unsplash");

      // Insert new variants
      const inserts = top3.map((photo: any, i: number) => ({
        funnel_id,
        variant: variants[i],
        source: "unsplash",
        image_url: photo.url_regular,
        unsplash_photo_id: photo.id,
        photographer_name: photo.photographer_name,
        photographer_profile_url: photo.photographer_profile_url,
        unsplash_photo_page_url: photo.unsplash_photo_page_url,
        download_location_url: photo.download_location,
        is_active: true,
      }));

      const { data: heroImages, error: insertError } = await supabase.from("funnel_hero_images").insert(inserts).select();
      if (insertError) {
        console.error("[unsplash-hero] Insert error:", insertError);
        throw new Error("Failed to assign hero images");
      }

      // Update funnel's hero_image_url
      await supabase.from("funnels").update({ hero_image_url: top3[0].url_regular }).eq("id", funnel_id);

      // Trigger Unsplash downloads for compliance
      for (const photo of top3) {
        if (photo.download_location) {
          try {
            await fetch(`${photo.download_location}?client_id=${UNSPLASH_ACCESS_KEY}`);
          } catch (e) {
            console.error("[unsplash-hero] Download trigger failed:", e);
          }
        }
      }

      return new Response(JSON.stringify({ heroes: heroImages, funnel_type: normalizedType, diagnostics }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── ACTION: trigger_download ──
    if (action === "trigger_download") {
      if (!photo_id) throw new Error("photo_id required");
      const { data: hero } = await supabase.from("funnel_hero_images")
        .select("download_location_url, download_triggered")
        .eq("unsplash_photo_id", photo_id)
        .eq("download_triggered", false)
        .maybeSingle();
      if (hero?.download_location_url) {
        await fetch(`${hero.download_location_url}?client_id=${UNSPLASH_ACCESS_KEY}`);
        await supabase.from("funnel_hero_images").update({ download_triggered: true }).eq("unsplash_photo_id", photo_id);
      }
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[unsplash-hero] ERROR:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
