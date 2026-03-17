/**
 * Hybrid Guidance System — Flow Data
 * Each screen has a 4-phase flow: Explain → Assist → Execute → Optimize
 * with contextual AI actions and Pro-tier nudges.
 */

export interface HybridAction {
  label: string;
  icon: "sparkles" | "send" | "navigate" | "copy" | "crown" | "zap" | "eye" | "pen";
  type: "navigate" | "ai-execute" | "ai-draft" | "info" | "copy";
  /** Route path for navigate, or edge-function identifier for AI actions */
  payload?: string;
  proOnly?: boolean;
  description?: string;
}

export type HybridPhase = "explain" | "assist" | "execute" | "optimize";

export interface HybridStep {
  phase: HybridPhase;
  title: string;
  body: string;
  actions?: HybridAction[];
  proTip?: string;
}

export interface HybridFlow {
  screenTitle: string;
  greeting: string;
  screenDescription: string;
  steps: HybridStep[];
  quickActions?: HybridAction[];
  proUnlockSummary?: string;
}

export const hybridFlows: Record<string, HybridFlow> = {
  "/": {
    screenTitle: "Your Growth Dashboard",
    greeting: "Let's accelerate your growth today.",
    screenDescription: "Your command center for leads, listings, and revenue.",
    steps: [
      {
        phase: "explain",
        title: "What you're looking at",
        body: "This dashboard shows your Growth Score, active leads, listings, and pipeline value — all updating in real time. It's the pulse of your business.",
      },
      {
        phase: "assist",
        title: "I can help right now",
        body: "Based on your current metrics, here are the highest-impact actions you can take right now.",
        actions: [
          { label: "Create a lead funnel", icon: "zap", type: "navigate", payload: "/funnels" },
          { label: "Generate ad copy", icon: "sparkles", type: "navigate", payload: "/content" },
          { label: "Analyze a neighborhood", icon: "eye", type: "navigate", payload: "/market-intel" },
          { label: "View hot leads", icon: "eye", type: "navigate", payload: "/leads" },
        ],
      },
      {
        phase: "execute",
        title: "Let me do it for you",
        body: "I can create a new lead capture funnel targeting your market area right now. One tap and it's live.",
        actions: [
          { label: "Build a funnel for me", icon: "zap", type: "navigate", payload: "/funnels", description: "AI creates headline, body, and CTA" },
        ],
      },
      {
        phase: "optimize",
        title: "Your next best move",
        body: "Agents who create 2+ funnels in their first week see 3x more leads. Consider creating a buyer and a seller funnel to capture both sides.",
        proTip: "Pro unlocks predictive analytics, A/B testing, and automated budget optimization to maximize your ROI.",
      },
    ],
    proUnlockSummary: "Pro unlocks advanced ROI tracking, budget optimization, and predictive analytics on your dashboard.",
  },

  "/leads": {
    screenTitle: "Lead Management",
    greeting: "Let's work your pipeline.",
    screenDescription: "Add, score, and nurture every prospect in one place.",
    steps: [
      {
        phase: "explain",
        title: "How leads work here",
        body: "Every lead is AI-scored automatically. Hot leads need immediate attention. Warm leads need nurturing. Cold leads need re-engagement. The AI watches behavior signals and updates scores in real time.",
      },
      {
        phase: "assist",
        title: "I'll help you prioritize",
        body: "I can score your leads, suggest the best follow-up action, and draft a message — all based on their behavior and profile.",
        actions: [
          { label: "Score all leads", icon: "sparkles", type: "ai-execute", payload: "score-leads", description: "AI analyzes and re-scores your pipeline" },
          { label: "Add a new lead", icon: "pen", type: "navigate", payload: "/leads" },
        ],
      },
      {
        phase: "execute",
        title: "Let me draft your follow-up",
        body: "Select a lead and I'll generate a personalized SMS or email based on their temperature, budget, and timeline. Ready to send in seconds.",
        actions: [
          { label: "Draft follow-up messages", icon: "send", type: "navigate", payload: "/content", description: "AI writes personalized outreach" },
        ],
      },
      {
        phase: "optimize",
        title: "Speed wins deals",
        body: "Respond to new leads within 5 minutes. Agents who respond in under 30 seconds convert 2x more. Set up your notifications and keep your pipeline moving.",
        proTip: "Pro adds predictive lead scoring, smart sorting by close probability, and automated qualification sequences.",
      },
    ],
    proUnlockSummary: "Pro adds predictive lead scoring, smart sorting by close probability, and automated qualification.",
  },

  "/leads/:id": {
    screenTitle: "Lead Intelligence",
    greeting: "Let's close this deal.",
    screenDescription: "Deep-dive into this lead's profile, behavior, and next steps.",
    steps: [
      {
        phase: "explain",
        title: "Everything about this lead",
        body: "You're looking at their AI quality score, behavioral signals, notes, and tags. The score updates as you add more information and as the lead interacts with your funnels.",
      },
      {
        phase: "assist",
        title: "I've analyzed this lead",
        body: "Based on their profile, I can suggest the best next action, draft a follow-up message, or update their score with new information.",
        actions: [
          { label: "Get AI recommendation", icon: "sparkles", type: "ai-execute", payload: "lead-intelligence", description: "Personalized next-step coaching" },
          { label: "Draft a message", icon: "send", type: "ai-draft", payload: "follow-up", description: "SMS/email based on this lead's profile" },
          { label: "Start voice call", icon: "zap", type: "ai-execute", payload: "voice-agent", description: "AI voice agent with shared memory" },
        ],
      },
      {
        phase: "execute",
        title: "Ready to act",
        body: "I can update this lead's status, add tags for segmentation, or generate a tailored nurture sequence. Just tell me what you need.",
        actions: [
          { label: "Generate nurture sequence", icon: "zap", type: "ai-execute", payload: "nurture-sequence", proOnly: true, description: "Multi-step automated follow-up" },
        ],
      },
      {
        phase: "optimize",
        title: "Pro tip for this lead",
        body: "Leads with complete profiles (name, phone, email, budget, timeline) score 40% higher and are 2x more likely to convert. Fill in any missing details above.",
        proTip: "Pro unlocks behavior timeline analysis and AI-generated nurture sequences tailored to each lead.",
      },
    ],
    proUnlockSummary: "Pro unlocks behavior timeline analysis and AI-generated nurture sequences for each lead.",
  },

  "/listings": {
    screenTitle: "Listings Manager",
    greeting: "Let's market your properties.",
    screenDescription: "Manage listings and generate AI-powered marketing for every property.",
    steps: [
      {
        phase: "explain",
        title: "Your property command center",
        body: "Add listings here, then use AI to generate ads, social posts, and listing descriptions. Each listing tracks views and days on market so you know what needs attention.",
      },
      {
        phase: "assist",
        title: "I can promote any listing",
        body: "Pick a listing and I'll generate ad copy for Facebook, Google, and Instagram in seconds. You can also get listing descriptions and social posts.",
        actions: [
          { label: "Generate ad copy", icon: "sparkles", type: "navigate", payload: "/content", description: "AI creates platform-ready ads" },
          { label: "Add new listing", icon: "pen", type: "navigate", payload: "/listings" },
        ],
      },
      {
        phase: "execute",
        title: "One-tap marketing",
        body: "I'll create a complete marketing package for your top listing — ad headline, description, CTA, and social posts. Copy and post anywhere.",
        actions: [
          { label: "Create marketing package", icon: "zap", type: "navigate", payload: "/content", description: "Full ad suite for your listing" },
        ],
      },
      {
        phase: "optimize",
        title: "Maximize visibility",
        body: "Listings with AI-generated ads get 5x more views. Promote every active listing and update statuses promptly to maintain pipeline accuracy.",
        proTip: "Pro users can sync listings from MLS and auto-generate social content for every new listing.",
      },
    ],
    proUnlockSummary: "Pro adds MLS sync, AI-powered listing descriptions, A/B ad variants, and automated social posts.",
  },

  "/funnels": {
    screenTitle: "Lead Capture Funnels",
    greeting: "Let's capture more leads.",
    screenDescription: "Build AI-powered landing pages that convert visitors into leads.",
    steps: [
      {
        phase: "explain",
        title: "How funnels drive growth",
        body: "Each funnel is an AI-generated landing page with a headline, body copy, and lead capture form. Standard funnels target buyers and sellers. High-Intent funnels (FSBO, Expired, Pre-Foreclosure) target motivated sellers with niche-specific scripts and qualification flows.",
      },
      {
        phase: "assist",
        title: "I'll build one for you",
        body: "Choose a standard funnel for broad lead capture, or a High-Intent niche funnel for motivated seller outreach. The AI tailors everything — headlines, scripts, nurture emails, and social copy.",
        actions: [
          { label: "Create a buyer funnel", icon: "zap", type: "ai-execute", payload: "create-funnel-buyer", description: "AI-generated buyer landing page" },
          { label: "Create a seller funnel", icon: "zap", type: "ai-execute", payload: "create-funnel-seller", description: "AI-generated seller landing page" },
          { label: "Create FSBO funnel", icon: "zap", type: "ai-execute", payload: "create-funnel-fsbo", description: "Target For Sale By Owner sellers" },
          { label: "Create Expired funnel", icon: "zap", type: "ai-execute", payload: "create-funnel-expired", description: "Re-engage expired listings" },
        ],
      },
      {
        phase: "execute",
        title: "Share and capture",
        body: "Once your funnel is live, copy the link and share it on Facebook, Instagram, in ads, or via text. Every form submission auto-scores and enters your pipeline.",
      },
      {
        phase: "optimize",
        title: "Optimize for conversions",
        body: "Focus on 1–2 funnels per neighborhood. High-Intent funnels typically convert 2–3x better because they target motivated sellers. Low conversion? Try a different headline or CTA.",
        proTip: "Pro unlocks A/B split testing, unlimited funnels, and advanced conversion analytics.",
      },
    ],
    proUnlockSummary: "Pro unlocks unlimited funnels, A/B split testing, and advanced conversion analytics.",
  },

  "/content": {
    screenTitle: "Content Studio",
    greeting: "Let's create content that converts.",
    screenDescription: "Generate marketing copy, video scripts, and ads using AI.",
    steps: [
      {
        phase: "explain",
        title: "Your AI content engine",
        body: "Choose from video scripts, social posts, ad copy, or conversion copywriting. The AI generates ready-to-use content tailored to your listings and market.",
      },
      {
        phase: "assist",
        title: "What do you need?",
        body: "I can generate any type of content right now. Pick a format and I'll create it instantly.",
        actions: [
          { label: "Generate video script", icon: "sparkles", type: "ai-execute", payload: "listing-hook", description: "15s property teaser" },
          { label: "Create ad copy", icon: "sparkles", type: "ai-execute", payload: "ad-copy", description: "Facebook & Google ads" },
          { label: "Write SMS/Email/Social", icon: "pen", type: "ai-execute", payload: "conversion-copy", description: "Follow-up & social scripts" },
        ],
      },
      {
        phase: "execute",
        title: "Content on demand",
        body: "I'm generating your content now. Review it, tweak anything, then copy and post to your platforms.",
      },
      {
        phase: "optimize",
        title: "Consistency is key",
        body: "Post 3–5 times per week for maximum reach. Mix video, social posts, and ads. The AI adapts to what performs best.",
        proTip: "Pro users get A/B copy variants, advanced templates, and AI-driven content scheduling.",
      },
    ],
    proUnlockSummary: "Pro adds A/B copy variants, advanced templates, and AI-driven content scheduling.",
  },

  "/insights": {
    screenTitle: "Analytics & Insights",
    greeting: "Let's understand your numbers.",
    screenDescription: "Track conversions, pipeline health, and marketing ROI.",
    steps: [
      {
        phase: "explain",
        title: "Reading your data",
        body: "Focus on three numbers: conversion rate, cost per lead, and pipeline value. These tell you if your marketing is working, how efficiently, and how much revenue is in play.",
      },
      {
        phase: "assist",
        title: "I'll interpret for you",
        body: "Based on your current metrics, here's what I recommend focusing on to drive the most growth.",
        actions: [
          { label: "Get AI analysis", icon: "sparkles", type: "ai-execute", payload: "insights-analysis", description: "AI interprets your metrics" },
        ],
      },
      {
        phase: "execute",
        title: "Act on insights",
        body: "I can create new funnels, adjust your marketing, or prioritize your lead follow-ups based on what the data shows.",
        actions: [
          { label: "Optimize my pipeline", icon: "zap", type: "navigate", payload: "/leads", description: "Focus on highest-value leads" },
        ],
      },
      {
        phase: "optimize",
        title: "Data-driven growth",
        body: "Review your analytics weekly. Agents who check insights regularly and adjust strategy see 40% faster growth.",
        proTip: "Pro unlocks conversion probability modeling, full attribution dashboards, and data export.",
      },
    ],
    proUnlockSummary: "Pro unlocks conversion probability modeling, full attribution dashboards, and CSV/PDF data export.",
  },

  "/team": {
    screenTitle: "Team Dashboard",
    greeting: "Let's optimize your team.",
    screenDescription: "Manage assignments, track performance, and scale.",
    steps: [
      {
        phase: "explain",
        title: "Your team at a glance",
        body: "See every team member's performance — conversion rate, response time, and pipeline value. Use this to identify coaching opportunities and top performers.",
      },
      {
        phase: "assist",
        title: "Smart lead distribution",
        body: "I can recommend how to distribute leads based on each member's specialty, capacity, and conversion rate.",
        actions: [
          { label: "Suggest lead routing", icon: "sparkles", type: "ai-execute", payload: "team-routing", description: "AI-optimized assignments" },
        ],
      },
      {
        phase: "execute",
        title: "Assign and automate",
        body: "I can assign leads to the best-matched team member automatically based on their specialty and availability.",
      },
      {
        phase: "optimize",
        title: "Accountability drives results",
        body: "Set clear weekly targets and review team metrics every Monday. Teams with regular reviews close 25% more deals.",
        proTip: "Pro adds smart lead routing, automated assignment rules, and detailed team performance comparisons.",
      },
    ],
    proUnlockSummary: "Pro adds smart lead routing, automated assignment rules, and detailed team performance comparisons.",
  },

  "/settings": {
    screenTitle: "Settings",
    greeting: "Let's configure your workspace.",
    screenDescription: "Manage your profile, integrations, and subscription.",
    steps: [
      {
        phase: "explain",
        title: "Personalize your experience",
        body: "Update your profile, connect integrations, and manage your subscription here. Complete profiles get better AI-generated content.",
      },
      {
        phase: "assist",
        title: "Quick setup check",
        body: "I'll check what's configured and what's missing to help you get the most out of the platform.",
        actions: [
          { label: "Check my setup", icon: "eye", type: "info", description: "Review profile completeness" },
        ],
      },
      {
        phase: "execute",
        title: "Update your profile",
        body: "Add your name, market area, and photo. This personalizes your dashboard and improves AI content quality.",
      },
      {
        phase: "optimize",
        title: "Unlock more power",
        body: "Agents with complete profiles and connected integrations see 30% better AI content quality and faster lead response times.",
        proTip: "Pro includes priority support, advanced integrations, and unlimited usage across all features.",
      },
    ],
    proUnlockSummary: "Pro includes priority support, advanced integrations, and unlimited usage across all features.",
  },

  "/campaigns": {
    screenTitle: "Campaign Manager",
    greeting: "Let's launch some ads.",
    screenDescription: "Create and manage ad campaigns across Meta and Google.",
    steps: [
      {
        phase: "explain",
        title: "Your ad command center",
        body: "Create campaigns for Meta and Google Ads from one place. The AI generates ad copy, you set the budget, and the system tracks impressions, clicks, and leads generated.",
      },
      {
        phase: "assist",
        title: "I'll write your ads",
        body: "Pick a platform and I'll generate headlines, descriptions, and CTAs optimized for real estate lead generation.",
        actions: [
          { label: "Generate Meta ad", icon: "sparkles", type: "ai-execute", payload: "ad-copy-meta", description: "AI-written Facebook/Instagram ad" },
          { label: "Generate Google ad", icon: "sparkles", type: "ai-execute", payload: "ad-copy-google", description: "AI-written Google Search ad" },
        ],
      },
      {
        phase: "execute",
        title: "Publish in one tap",
        body: "Once your ad copy looks right, publish directly to Meta or Google. The system handles the rest.",
        actions: [
          { label: "Create new campaign", icon: "zap", type: "navigate", payload: "/campaigns", description: "Set up and launch a campaign" },
        ],
      },
      {
        phase: "optimize",
        title: "Optimize your spend",
        body: "Shift budget to campaigns with the lowest cost-per-lead. Pause underperformers quickly — every dollar matters.",
        proTip: "Pro unlocks automated budget optimization, A/B ad variants, and cross-platform attribution dashboards.",
      },
    ],
    proUnlockSummary: "Pro unlocks automated budget optimization, A/B ad variants, and full cross-platform attribution.",
  },

  "/seller": {
    screenTitle: "Seller Suite",
    greeting: "Let's win more listings.",
    screenDescription: "Generate AVM reports and convert sellers into listing clients.",
    steps: [
      {
        phase: "explain",
        title: "Your listing acquisition tool",
        body: "Enter any address and the AI generates an instant market valuation with comparables and neighborhood trends. Use these reports to start conversations with potential sellers.",
      },
      {
        phase: "assist",
        title: "I'll run the numbers",
        body: "Give me an address and I'll create a professional valuation report you can share with sellers immediately.",
        actions: [
          { label: "Generate AVM report", icon: "sparkles", type: "navigate", payload: "/seller", description: "AI-powered home valuation" },
        ],
      },
      {
        phase: "execute",
        title: "Share and convert",
        body: "Send the report to prospective sellers via text or email. It demonstrates market expertise and opens the door to a listing appointment.",
      },
      {
        phase: "optimize",
        title: "From valuation to listing",
        body: "Agents who send AVM reports within 24 hours of initial contact have a 3x higher listing conversion rate. Speed and expertise win.",
        proTip: "Pro adds cash offer funnels, enhanced neighborhood analytics, and automated seller drip campaigns.",
      },
    ],
    proUnlockSummary: "Pro adds cash offer funnels, enhanced neighborhood analytics, and automated seller drip campaigns.",
  },

  "/integrations": {
    screenTitle: "Integrations Hub",
    greeting: "Let's connect your tools.",
    screenDescription: "Sync your CRM, MLS, calendar, and ad accounts.",
    steps: [
      {
        phase: "explain",
        title: "Your connected ecosystem",
        body: "Link your CRM, MLS feed, calendar, and ad accounts to automate data flow. No more copy-pasting between tools — everything syncs in real time.",
      },
      {
        phase: "assist",
        title: "I'll help you connect",
        body: "I can guide you through connecting each integration. Most take under 2 minutes to set up.",
        actions: [
          { label: "Connect CRM", icon: "zap", type: "navigate", payload: "/integrations", description: "FollowUpBoss, kvCORE, etc." },
          { label: "Sync Calendar", icon: "zap", type: "navigate", payload: "/integrations", description: "Google or Outlook Calendar" },
        ],
      },
      {
        phase: "execute",
        title: "Activate sync",
        body: "Once connected, leads, listings, and appointments sync automatically. The system handles deduplication and conflict resolution.",
      },
      {
        phase: "optimize",
        title: "Full automation",
        body: "Agents with all integrations connected save 5+ hours per week on data entry. Connect everything and let the system work for you.",
        proTip: "Pro unlocks real-time bidirectional sync, automated lead routing to CRM, and calendar conflict detection.",
      },
    ],
    proUnlockSummary: "Pro unlocks real-time bidirectional sync, automated lead routing, and calendar conflict detection.",
  },

  "/brand": {
    screenTitle: "Brand Bible",
    greeting: "Your brand identity guide.",
    screenDescription: "Colors, typography, voice, and visual standards.",
    steps: [
      {
        phase: "explain",
        title: "Your brand source of truth",
        body: "This page documents your visual system — colors, fonts, gradients, and design principles. Use it as a reference when creating content or sharing with designers.",
      },
      {
        phase: "optimize",
        title: "Consistency builds trust",
        body: "Agents with consistent branding across all channels build 2x more trust with prospects. Keep your content aligned with these guidelines.",
      },
    ],
  },

  "/market-intel": {
    screenTitle: "Market Intelligence",
    greeting: "Let's find your next opportunity.",
    screenDescription: "Analyze neighborhoods, visualize heatmaps, and generate SEO lead magnets.",
    steps: [
      {
        phase: "explain",
        title: "How Market Intel works",
        body: "Add any neighborhood and the AI generates an Opportunity Score (0–100), market temperature (Hot/Warm/Cool/Cold), key metrics (Avg Price, DOM, Inventory, Demand), and a full SEO article. Each analysis creates a public page that ranks on Google and captures leads automatically.",
      },
      {
        phase: "assist",
        title: "I'll analyze any submarket",
        body: "Pick a neighborhood and I'll generate intelligence in seconds — opportunity score, pricing data, and a full SEO page with lead capture.",
        actions: [
          { label: "Analyze a neighborhood", icon: "sparkles", type: "navigate", payload: "/market-intel", description: "AI generates market intelligence" },
          { label: "View public pages", icon: "eye", type: "info", description: "Each area gets a /market/slug page" },
        ],
      },
      {
        phase: "execute",
        title: "Build your market map",
        body: "Analyze 3–5 neighborhoods in your farm area. The heatmap lights up with opportunity scores, helping you identify where to focus your marketing and which areas generate the most organic leads.",
        actions: [
          { label: "Add another submarket", icon: "zap", type: "navigate", payload: "/market-intel", description: "Build a multi-area heatmap" },
        ],
      },
      {
        phase: "optimize",
        title: "SEO lead generation",
        body: "Agents with 5+ published neighborhood pages capture 4x more organic leads. Each page is optimized with JSON-LD structured data and AI-written content. Share the links on social media to amplify reach.",
        proTip: "Pro unlocks automated market refresh, trending neighborhood alerts, and multi-city intelligence.",
      },
    ],
    proUnlockSummary: "Pro unlocks automated market refresh, trending neighborhood alerts, comparative analytics, and multi-city intelligence.",
  },
};

/**
 * Match the current pathname to a hybrid flow key.
 */
export function getHybridFlow(pathname: string): HybridFlow | null {
  if (hybridFlows[pathname]) return hybridFlows[pathname];
  if (/^\/leads\/[^/]+$/.test(pathname)) return hybridFlows["/leads/:id"];
  return null;
}

/** Phase metadata for UI rendering */
export const phaseConfig: Record<HybridPhase, { label: string; icon: string; color: string }> = {
  explain: { label: "Understand", icon: "eye", color: "info" },
  assist: { label: "Assist", icon: "sparkles", color: "primary" },
  execute: { label: "Execute", icon: "zap", color: "success" },
  optimize: { label: "Optimize", icon: "crown", color: "accent" },
};
