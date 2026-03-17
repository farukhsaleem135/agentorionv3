export interface WizardStep {
  title: string;
  body: string;
  proTip?: string;
}

export interface WizardFlow {
  screenTitle: string;
  screenDescription: string;
  steps: WizardStep[];
  proUnlockSummary?: string;
}

export const wizardFlows: Record<string, WizardFlow> = {
  "/": {
    screenTitle: "Your AI-Powered Dashboard",
    screenDescription: "Your command center where AI insights, automation status, and real-time metrics come together.",
    steps: [
      {
        title: "Growth Score & AI Insights",
        body: "Your Growth Score is calculated by AI based on pipeline activity, lead engagement, and conversion velocity. It updates automatically as your business evolves.",
      },
      {
        title: "AI Action Feed",
        body: "The AI Action Feed shows real-time updates: leads scored, messages drafted, tours scheduled, and campaigns optimized — all handled by your AI assistant.",
      },
      {
        title: "Autopilot vs Pro Mode",
        body: "Toggle between Autopilot (AI handles everything — outreach, budgets, A/B tests) and Pro Mode (you get full manual control with advanced analytics).",
        proTip: "Pro Mode unlocks attribution dashboards, cohort analytics, and granular campaign controls.",
      },
      {
        title: "Quick Actions",
        body: "Tap any quick action card to instantly create leads, listings, content, funnels, or analyze neighborhoods with Market Intel. Use the + button in the top-right for fast access from anywhere.",
      },
      {
        title: "ROI Summary & Budget",
        body: "See your total ad spend, leads generated, and estimated pipeline value at a glance. In Autopilot mode, the AI allocates your budget automatically.",
      },
      {
        title: "Weekly Growth Summary",
        body: "Every week, the AI generates a plain-English report of what happened: new leads, conversions, top-performing campaigns, and recommended next steps.",
      },
    ],
    proUnlockSummary: "Pro unlocks advanced ROI tracking, predictive analytics, A/B testing controls, and full campaign attribution.",
  },

  "/autopilot": {
    screenTitle: "Autonomous Features",
    screenDescription: "Your AI workforce — automated outreach, lead scoring, and engagement that runs 24/7.",
    steps: [
      {
        title: "Autopilot Master Toggle",
        body: "The main toggle activates or pauses all autonomous outreach. When ON, AI drafts and sends messages to leads based on their temperature and behavior. When OFF, messages are drafted but never sent.",
      },
      {
        title: "Delivery Channels",
        body: "Connect Twilio for SMS and Resend for email. The AI uses your credentials to send messages on your behalf. Go to Integrations to set these up if they show 'Not connected'.",
      },
      {
        title: "Lead Scheduler Module",
        body: "Every 30 minutes, this module scans your leads by temperature (Hot, Warm, Cold) and drafts personalized AI messages. Hot leads get priority, cold leads get nurture sequences.",
      },
      {
        title: "Outreach Processor Module",
        body: "Every 5 minutes, the processor picks up queued messages and delivers them via Twilio (SMS) or Resend (email). Failed deliveries are retried up to 3 times.",
      },
      {
        title: "Lead Intelligence Module",
        body: "On-demand AI scoring analyzes each lead's behavior, engagement history, and profile to generate a conversion score (0–100) and recommend your best next action.",
      },
      {
        title: "Tour Scheduling Module",
        body: "When a lead requests a tour, this module auto-books it, syncs with your connected calendar (Google/Outlook), and sends confirmation messages.",
      },
      {
        title: "Outreach Queue & Stats",
        body: "Monitor all outreach in real time: Pending (awaiting send), Scheduled (timed for later), Sent (delivered), and Failed (needs attention). The activity feed shows every message with lead name, channel, and delivery status.",
      },
      {
        title: "Daily Limits & Quiet Hours",
        body: "Control how aggressively the AI operates. Set a daily message cap and quiet hours (e.g., 9 PM – 8 AM) so leads are never contacted at inappropriate times.",
        proTip: "Pro users get unlimited daily messages, priority queue processing, and advanced scheduling rules.",
      },
    ],
    proUnlockSummary: "Pro unlocks unlimited messaging, advanced scheduling rules, multi-channel sequences, and priority queue processing.",
  },

  "/leads": {
    screenTitle: "Lead Management",
    screenDescription: "Your leads live here. Add, track, score, and nurture every prospect in one place.",
    steps: [
      {
        title: "Add a new lead",
        body: "Tap the + button at the top. Enter the lead's name, phone, and email. Hit Save. The AI will score them automatically.",
      },
      {
        title: "Filter by temperature",
        body: "Use the Hot, Warm, Cold filters to focus on leads most likely to convert right now.",
      },
      {
        title: "Tap a lead to see details",
        body: "Open any lead card to view their score, timeline, notes, and next steps. Add tags to organize them your way.",
      },
      {
        title: "Update lead status",
        body: "Mark leads as New, Contacted, Qualified, or Closed. This keeps your pipeline accurate and your follow-ups on track.",
      },
      {
        title: "What to avoid",
        body: "Don't let leads sit without a status update for more than 48 hours. Speed-to-lead is everything in real estate.",
      },
    ],
    proUnlockSummary: "Pro adds predictive lead scoring, smart sorting by close probability, and automated qualification.",
  },

  "/leads/:id": {
    screenTitle: "Lead Detail",
    screenDescription: "Deep-dive into a single lead. View their full timeline, add notes, and plan your next move.",
    steps: [
      {
        title: "Review the AI score",
        body: "The score tells you how likely this lead is to convert. Check the score reasons to understand why.",
      },
      {
        title: "Add notes",
        body: "Tap Add Note to log your conversations, observations, or next steps. Notes help the AI refine its recommendations.",
      },
      {
        title: "Tag your leads",
        body: "Use tags like 'First-time buyer', 'Investor', or 'Relocation' to segment and filter later.",
      },
      {
        title: "Check AI next step",
        body: "The AI suggests your best next action. Follow it to maximize your conversion rate.",
        proTip: "Pro users get AI-optimized follow-up timing and automated sequence suggestions.",
      },
    ],
    proUnlockSummary: "Pro unlocks behavior timeline analysis and AI-generated nurture sequences for each lead.",
  },

  "/listings": {
    screenTitle: "Listings Manager",
    screenDescription: "Add and manage your property listings. Then use the built-in AI to create ads and promote them on Facebook, Instagram, Google, or any social media platform.",
    steps: [
      {
        title: "Add a listing",
        body: "Tap + to create a new listing. Enter the address, price, beds, baths, and square footage.",
      },
      {
        title: "Track performance",
        body: "Each listing shows views and days on market. Use this to know which properties need more marketing.",
      },
      {
        title: "Promote with AI-generated ads",
        body: "Tap 'Promote This Listing' on any card. The AI instantly generates ad copy, social posts, and listing descriptions you can post on Facebook, Instagram, Google Ads, or any platform.",
      },
      {
        title: "Post anywhere",
        body: "Copy the AI-generated content and paste it directly to Facebook, Instagram, LinkedIn, TikTok, or run it as a paid ad on Meta or Google. One listing = unlimited marketing.",
      },
      {
        title: "Update status",
        body: "Keep listings current — mark them as Active, Pending, or Sold to maintain pipeline accuracy.",
      },
      {
        title: "Get the best results",
        body: "Add complete details and high-quality photos. Then promote every active listing. The more you promote, the more leads you capture.",
        proTip: "Pro users can sync listings from MLS and auto-generate social content for every new listing.",
      },
    ],
    proUnlockSummary: "Pro adds MLS sync, AI-powered listing descriptions, A/B ad variants, and automated social posts for each property.",
  },

  "/funnels": {
    screenTitle: "Lead Capture Funnels",
    screenDescription: "Build AI-powered landing pages that capture leads on autopilot. Share them anywhere.",
    steps: [
      {
        title: "Create a funnel",
        body: "Tap Create Funnel. Choose from standard templates (Buyer, Seller, Valuation) or High-Intent Niche funnels (FSBO, Expired Listing, Pre-Foreclosure) for motivated sellers.",
      },
      {
        title: "High-Intent Niche Funnels",
        body: "FSBO, Expired, and Pre-Foreclosure funnels use niche-specific qualification flows and AI scripts designed for motivated seller outreach. Each generates tailored landing pages, nurture sequences, and social copy.",
      },
      {
        title: "Customize your funnel",
        body: "Review the AI-generated headline, body, and CTA. Tweak anything that doesn't match your voice.",
      },
      {
        title: "Share your funnel",
        body: "Copy the link and share it on social media, in ads, or via text. Every visitor who fills out the form becomes a lead.",
      },
      {
        title: "Brand your funnels",
        body: "Go to Settings → Edit Profile → Branding to add your company name, logo, phone, website, and brand color. Once saved, every public funnel automatically displays your branding in the header and footer.",
      },
      {
        title: "Track performance",
        body: "Monitor views and leads captured on each funnel card. Low conversion? Try a different headline or CTA.",
      },
      {
        title: "What to avoid",
        body: "Don't create too many funnels for the same area. Focus on 1–2 per neighborhood and optimize them.",
        proTip: "Pro users can A/B test headlines and CTAs to find the highest-converting version automatically.",
      },
    ],
    proUnlockSummary: "Pro unlocks unlimited funnels, A/B split testing, and advanced conversion analytics.",
  },

  "/content": {
    screenTitle: "Content Studio",
    screenDescription: "Generate social posts, video scripts, ad copy, and AI voiceovers — all from one screen.",
    steps: [
      {
        title: "Choose your content type",
        body: "Select from Listing Hook, Buyer Tips, Market Update, or Just Sold templates. Each uses AI-optimized prompts for real estate.",
      },
      {
        title: "Generate with AI",
        body: "Tap any template and the AI writes a full script or post in seconds. It's saved automatically to your content library.",
      },
      {
        title: "Create Video Voiceover",
        body: "Tap the 🔊 icon on any content card (or 'Create Video Voiceover' inside the detail view) to generate an AI voiceover using ElevenLabs. The audio plays instantly and downloads as an MP3.",
      },
      {
        title: "How to make a video",
        body: "1) Generate a script here. 2) Tap the voiceover button to get an MP3. 3) Open a video tool like CapCut, InShot, or Canva. 4) Add your listing photos/clips. 5) Drop in the AI voiceover. Done — professional video in minutes.",
      },
      {
        title: "Connect ElevenLabs",
        body: "To use AI voiceover, go to Integrations → AI / Voice → ElevenLabs and enter your API key. Get one free at elevenlabs.io.",
      },
      {
        title: "Ad Copy & Conversion Copy",
        body: "Use the Ad Copy Generator for Facebook/Google/Instagram ads, or the Conversion Copywriter for SMS, email, call scripts, and social captions — each with A/B variants.",
      },
      {
        title: "Edit and publish",
        body: "Review any AI draft, copy it to your clipboard, then paste to your social platforms. Publish to make it visible in your public portfolio.",
        proTip: "Pro users get advanced templates, A/B copy variants, and performance-optimized content scheduling.",
      },
    ],
    proUnlockSummary: "Pro adds A/B copy variants, advanced templates, AI-driven content scheduling, and premium voice options.",
  },

  "/insights": {
    screenTitle: "Analytics & Insights",
    screenDescription: "Understand what's working. Track conversions, pipeline health, and marketing ROI.",
    steps: [
      {
        title: "Read your key metrics",
        body: "Focus on conversion rate, cost per lead, and pipeline value. These three numbers tell the whole story.",
      },
      {
        title: "Check funnel performance",
        body: "See which funnels generate the most leads and which need optimization.",
      },
      {
        title: "Review trends over time",
        body: "Look at weekly and monthly trends to spot growth patterns or areas that need attention.",
      },
      {
        title: "What to avoid",
        body: "Don't obsess over vanity metrics like views alone. Focus on leads captured and conversion rates.",
        proTip: "Pro users get full attribution modeling, conversion probability forecasting, and data export.",
      },
    ],
    proUnlockSummary: "Pro unlocks conversion probability modeling, full attribution dashboards, and CSV/PDF data export.",
  },

  "/team": {
    screenTitle: "Team Dashboard",
    screenDescription: "Manage your team, assign leads, and track everyone's performance.",
    steps: [
      {
        title: "View team members",
        body: "See everyone on your team with their performance metrics at a glance.",
      },
      {
        title: "Assign leads",
        body: "Distribute leads to team members based on their specialty or availability.",
      },
      {
        title: "Track performance",
        body: "Monitor each member's conversion rate, response time, and pipeline value.",
      },
      {
        title: "Get the best results",
        body: "Set clear targets and review team metrics weekly. Accountability drives results.",
        proTip: "Pro users get advanced lead routing rules, automated assignment, and team comparison analytics.",
      },
    ],
    proUnlockSummary: "Pro adds smart lead routing, automated assignment rules, and detailed team performance comparisons.",
  },

  "/settings": {
    screenTitle: "Settings & Preferences",
    screenDescription: "Configure your profile, CRM connections, referral network, and AI personalization — all from one place.",
    steps: [
      {
        title: "General Tab — Your Profile",
        body: "Tap 'Edit Profile' to update your display name, city, license state, and bio. This info personalizes your dashboard, AI-generated content, and public-facing funnels.",
      },
      {
        title: "General Tab — Subscription",
        body: "View your current plan (Starter, Growth, or Pro) and tap to compare tiers or upgrade. Your plan determines feature limits like funnel count, AI messages, and integrations.",
      },
      {
        title: "General Tab — Notifications",
        body: "Configure which alerts you receive: new lead alerts, hot lead escalation, tour reminders, outreach updates, and weekly performance summaries. Toggle each on or off.",
      },
      {
        title: "General Tab — Privacy & Security",
        body: "Review your security posture: data encryption (AES-256), API credential protection, row-level security on your database, and session management. All are active by default.",
      },
      {
        title: "CRM Tab — Connect Your CRM",
        body: "Link external CRM systems like FollowUpBoss, kvCORE, LionDesk, or HubSpot. Connected CRMs auto-sync leads so you never double-enter data.",
        proTip: "Pro users get real-time bidirectional CRM sync and automated lead routing rules.",
      },
      {
        title: "Referrals Tab — Referral Network",
        body: "Build and manage your referral network. Track referral partners, see incoming and outgoing referrals, and monitor referral-generated revenue.",
      },
      {
        title: "AI Tab — Personalization Engine",
        body: "Fine-tune how the AI writes and communicates on your behalf. Set your preferred tone, writing style, and content focus so all AI-generated copy sounds like you.",
        proTip: "Pro users unlock advanced AI voice training and custom prompt templates.",
      },
      {
        title: "Branding — Personalize Your Funnels",
        body: "Tap 'Edit Profile' and scroll to the Branding section. Add your company name, logo URL, phone, website, and brand color. This info automatically appears on all your public funnels — header, footer, and CTA buttons.",
        proTip: "Pro users will get per-funnel branding overrides and custom domain support.",
      },
    ],
    proUnlockSummary: "Pro includes advanced CRM sync, AI voice training, priority support, and unlimited usage across all features.",
  },

  "/campaigns": {
    screenTitle: "Campaign Manager",
    screenDescription: "Create, manage, and optimize ad campaigns across Meta and Google from one place.",
    steps: [
      {
        title: "Create a campaign",
        body: "Tap 'New Campaign' to set up an ad. Choose your platform (Meta or Google), set a budget, and let the AI generate your ad copy.",
      },
      {
        title: "AI-generated ad copy",
        body: "The AI writes headlines, descriptions, and CTAs tailored to your target audience. Review and tweak before publishing.",
      },
      {
        title: "Monitor performance",
        body: "Track impressions, clicks, leads generated, and spend for each campaign. Pause or adjust underperformers.",
      },
      {
        title: "Optimize your budget",
        body: "Focus spend on campaigns with the lowest cost-per-lead. The AI suggests budget shifts based on performance.",
        proTip: "Pro users get automated budget optimization, A/B ad variants, and cross-platform attribution.",
      },
    ],
    proUnlockSummary: "Pro unlocks automated budget optimization, A/B ad variants, and full cross-platform attribution.",
  },

  "/seller": {
    screenTitle: "Seller Suite",
    screenDescription: "Generate automated valuation reports and win more listing appointments.",
    steps: [
      {
        title: "Run an AVM report",
        body: "Enter any property address and the AI generates an instant market valuation with comparable sales and neighborhood trends.",
      },
      {
        title: "Share with sellers",
        body: "Use the valuation as a conversation starter. Send it to prospective sellers to demonstrate your market expertise.",
      },
      {
        title: "Track valuations",
        body: "All generated reports are saved here. Monitor which addresses convert into listing appointments.",
      },
      {
        title: "Convert to listings",
        body: "When a seller responds, move them into your lead pipeline and begin your listing presentation workflow.",
        proTip: "Pro users get cash offer funnels, enhanced neighborhood analytics, and automated seller drip campaigns.",
      },
    ],
    proUnlockSummary: "Pro adds cash offer funnels, enhanced neighborhood analytics, and automated seller drip campaigns.",
  },

  "/integrations": {
    screenTitle: "Integrations Hub",
    screenDescription: "Connect your CRM, MLS, calendar, ads, messaging, and AI voice accounts.",
    steps: [
      {
        title: "Connect your CRM",
        body: "Link FollowUpBoss, kvCORE, or other CRMs to sync leads automatically. No more double-entry.",
      },
      {
        title: "Sync your MLS",
        body: "Connect your MLS/IDX feed to auto-import listings and keep property data current.",
      },
      {
        title: "Link your calendar",
        body: "Connect Google or Outlook Calendar so tour requests and appointments sync automatically.",
      },
      {
        title: "Ad platform accounts",
        body: "Link your Meta, Google, TikTok, and YouTube Ads accounts to publish campaigns directly.",
      },
      {
        title: "Messaging — Twilio & Resend",
        body: "Connect Twilio for automated SMS outreach and Resend for email delivery. Required for the Autopilot engine.",
      },
      {
        title: "AI / Voice — ElevenLabs",
        body: "Add your ElevenLabs API key to unlock AI voiceover generation. Once connected, you can turn any video script into a professional voiceover from the Content page.",
        proTip: "Pro users get real-time bidirectional sync, automated lead routing to CRM, and premium voice options.",
      },
    ],
    proUnlockSummary: "Pro unlocks real-time bidirectional sync, automated lead routing, calendar conflict detection, and premium AI voices.",
  },

  "/brand": {
    screenTitle: "Brand Bible",
    screenDescription: "Your brand identity guide — colors, typography, voice, and visual standards.",
    steps: [
      {
        title: "Review your brand identity",
        body: "This page documents your brand's visual system: colors, fonts, and design principles.",
      },
      {
        title: "Use it as a reference",
        body: "When creating content or sharing with designers, use this as your single source of truth.",
      },
    ],
  },

  "/market-intel": {
    screenTitle: "Hyper-Local Market Intelligence",
    screenDescription: "Analyze neighborhoods, visualize opportunity heatmaps, and auto-generate SEO pages that capture leads.",
    steps: [
      {
        title: "Add a Neighborhood",
        body: "Tap the + button to open the Submarket Analyzer. Enter a neighborhood name, city, and state. The AI generates an Opportunity Score (0–100), market temperature, pricing data, and a full SEO-ready neighborhood guide.",
      },
      {
        title: "Market Heatmap",
        body: "The heatmap shows all your analyzed neighborhoods as color-coded tiles. Green = high opportunity, yellow = moderate, red = competitive. Tap any tile to view its public SEO page.",
      },
      {
        title: "Neighborhood Cards",
        body: "Each card displays Avg Sale Price, Days on Market, Buyer Demand, Competition Score, and an AI-generated summary. Use these to compare submarkets at a glance.",
      },
      {
        title: "Public SEO Pages",
        body: "Every analyzed neighborhood automatically generates a public page at /market/[slug] with JSON-LD structured data, AI-written content, market highlights, and a lead capture form — all optimized for search engines.",
      },
      {
        title: "Lead Capture from SEO Pages",
        body: "Visitors to your public market pages can request a full report. Their info is captured as a warm lead, tagged with the neighborhood, and added to your pipeline automatically.",
      },
      {
        title: "Track Performance",
        body: "Monitor page views and leads captured for each neighborhood. Focus your marketing on high-opportunity areas that drive the most organic traffic.",
        proTip: "Pro users get automated market refresh, trending alerts, and multi-city intelligence.",
      },
    ],
    proUnlockSummary: "Pro unlocks automated market refresh, trending neighborhood alerts, comparative analytics, and multi-city intelligence.",
  },
};

/**
 * Match the current pathname to a wizard flow key.
 * Handles dynamic routes like /leads/:id
 */
export function getWizardFlow(pathname: string): WizardFlow | null {
  // Exact match first
  if (wizardFlows[pathname]) return wizardFlows[pathname];

  // Dynamic route matching
  if (/^\/leads\/[^/]+$/.test(pathname)) return wizardFlows["/leads/:id"];

  return null;
}
