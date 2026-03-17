/**
 * Funnel-type → real estate keyword mapping for Unsplash hero image search.
 * Shared between frontend components and referenced by backend edge functions.
 */

export const FUNNEL_TYPE_KEYWORDS: Record<string, string[]> = {
  buyer: [
    'modern home exterior curb appeal',
    'beautiful house front door',
    'luxury residential home',
    'new home keys handshake',
    'dream home suburban neighborhood',
  ],
  seller: [
    'for sale sign luxury home',
    'home staging living room',
    'real estate sold sign',
    'beautiful home interior modern',
    'house exterior professional photo',
  ],
  fsbo: [
    'for sale by owner home',
    'home sale sign yard',
    'house keys close up',
    'residential property exterior',
    'homeowner front porch',
  ],
  expired: [
    'house for sale empty',
    'real estate opportunity home',
    'home price reduction',
    'property fresh start',
    'residential home sunlight',
  ],
  'pre-foreclosure': [
    'home financial fresh start',
    'house keys hope',
    'residential property solution',
    'home equity opportunity',
    'neighborhood house sunlight',
  ],
  first_time_buyer: [
    'first home excited couple keys',
    'young couple new home',
    'starter home suburban',
    'happy homeowners front door',
    'new homeowner keys celebration',
  ],
  luxury: [
    'luxury mansion exterior',
    'high end home interior',
    'luxury real estate pool',
    'modern luxury home architecture',
    'premium residential estate',
  ],
  investor: [
    'investment property residential',
    'rental property exterior',
    'real estate investment portfolio',
    'multi family home property',
    'property investment opportunity',
  ],
  relocation: [
    'moving boxes new home',
    'family new neighborhood',
    'relocation new city aerial',
    'new city skyline neighborhood',
    'family moving new house',
  ],
  downsizer: [
    'cozy small home exterior',
    'modern condo exterior',
    'empty nester home',
    'townhouse modern exterior',
    'comfortable smaller home',
  ],
  'cash-offer': [
    'cash sale home fast',
    'quick home sale keys',
    'house sold fast sign',
    'real estate cash transaction',
    'home sale closing table',
  ],
  valuation: [
    'home appraisal value',
    'house value neighborhood',
    'residential property worth',
    'home equity value',
    'neighborhood home prices',
  ],
  'home-value': [
    'home appraisal value',
    'house value neighborhood',
    'residential property worth',
    'home equity value',
    'neighborhood home prices',
  ],
  net_proceeds: [
    'home sale profit calculator',
    'real estate closing documents',
    'home sale proceeds check',
    'seller net proceeds closing',
    'real estate financial planning',
  ],
  open_house: [
    'open house sign modern home',
    'home tour interior staging',
    'open house welcome door',
    'staged home living room',
    'real estate open house visitors',
  ],
  market_report: [
    'real estate market aerial neighborhood',
    'housing market neighborhood overview',
    'residential street aerial view',
    'suburban neighborhood aerial',
    'real estate market data charts',
  ],
  custom: [
    'modern home exterior professional',
    'residential real estate hero',
    'beautiful neighborhood street',
    'luxury home curb appeal',
    'professional real estate photography',
  ],
};

/**
 * Normalize funnel type string to a key in FUNNEL_TYPE_KEYWORDS.
 */
export function normalizeFunnelTypeKey(raw: string): string {
  const t = raw.toLowerCase().trim().replace(/[\s]+/g, '_');
  const aliases: Record<string, string> = {
    'first-time': 'first_time_buyer',
    'first-time-buyer': 'first_time_buyer',
    'first_time': 'first_time_buyer',
    'firsttimebuyer': 'first_time_buyer',
    'net-proceeds': 'net_proceeds',
    'netproceeds': 'net_proceeds',
    'open-house': 'open_house',
    'openhouse': 'open_house',
    'market-report': 'market_report',
    'marketreport': 'market_report',
    'home_value': 'home-value',
    'homevalue': 'home-value',
    'cash_offer': 'cash-offer',
    'cashoffer': 'cash-offer',
    'pre_foreclosure': 'pre-foreclosure',
    'preforeclosure': 'pre-foreclosure',
  };
  return aliases[t] || (FUNNEL_TYPE_KEYWORDS[t] ? t : 'custom');
}

/**
 * Get a random keyword for a funnel type.
 */
export function getRandomKeyword(funnelType: string): string {
  const key = normalizeFunnelTypeKey(funnelType);
  const keywords = FUNNEL_TYPE_KEYWORDS[key] || FUNNEL_TYPE_KEYWORDS.custom;
  return keywords[Math.floor(Math.random() * keywords.length)];
}

/**
 * Get default search term for a funnel type (first keyword).
 */
export function getDefaultSearchTerm(funnelType: string): string {
  const key = normalizeFunnelTypeKey(funnelType);
  const keywords = FUNNEL_TYPE_KEYWORDS[key] || FUNNEL_TYPE_KEYWORDS.custom;
  return keywords[0];
}
