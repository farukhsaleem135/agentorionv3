import { useEffect, useState } from "react";

const FeaturesDoc = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const el = document.getElementById("doc-content");
    if (el) {
      await navigator.clipboard.writeText(el.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    document.title = "AgentOrion — Platform Features";
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6 md:p-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">AgentOrion — Platform Features</h1>
        <button
          onClick={handleCopy}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {copied ? "✓ Copied!" : "Copy All Text"}
        </button>
      </div>

      <div id="doc-content" className="prose prose-sm max-w-none space-y-6 text-gray-800 leading-relaxed">

        <p><strong>Version:</strong> MVP 1.0 &nbsp;|&nbsp; <strong>Date:</strong> February 2026 &nbsp;|&nbsp; <strong>Purpose:</strong> Comprehensive feature inventory for AI-driven improvement analysis</p>

        <hr />

        <h2>1. Platform Overview</h2>
        <p>AgentOrion is a mobile-first SaaS platform designed for real estate agents to automate lead generation, nurture, and conversion. It combines AI-powered content creation, funnel building, CRM integrations, and analytics into a single dashboard with two operating modes: <strong>Manual</strong> (hands-on) and <strong>Autopilot</strong> (AI-driven).</p>
        <p><strong>Tech Stack:</strong> React, TypeScript, Vite, Tailwind CSS, Framer Motion, Supabase (auth, database, edge functions, storage), Recharts, shadcn/ui.</p>

        <hr />

        <h2>2. Monetization & Subscription Tiers</h2>
        <table className="w-full text-left text-sm border-collapse">
          <thead><tr className="border-b"><th className="py-2">Feature</th><th>Free</th><th>Growth ($29/mo)</th><th>Pro ($59/mo)</th></tr></thead>
          <tbody>
            <tr className="border-b"><td className="py-1">Active Funnels</td><td>1</td><td>Unlimited</td><td>Unlimited</td></tr>
            <tr className="border-b"><td className="py-1">Leads/Month</td><td>10</td><td>Unlimited</td><td>Unlimited</td></tr>
            <tr className="border-b"><td className="py-1">AI Content Generation</td><td>Basic</td><td>Full</td><td>Full</td></tr>
            <tr className="border-b"><td className="py-1">Ad Budget Slider</td><td>❌</td><td>✅</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">Retargeting Audiences</td><td>❌</td><td>❌</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">A/B Testing Controls</td><td>❌</td><td>❌</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">Pro Analytics Dashboard</td><td>❌</td><td>❌</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">ROI Confidence Panel</td><td>❌</td><td>❌</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">Weekly Growth Summary</td><td>❌</td><td>❌</td><td>✅</td></tr>
            <tr className="border-b"><td className="py-1">Autonomous Engagement</td><td>❌</td><td>❌</td><td>✅</td></tr>
          </tbody>
        </table>
        <ul>
          <li>Feature gating enforced via backend SQL function <code>get_feature_flags(user_id)</code>.</li>
          <li><code>FeatureGate</code> component wraps UI sections; shows upgrade prompts for locked features.</li>
          <li><code>UpgradeBanner</code> and <code>UpgradeModal</code> handle upsell with tier-specific content.</li>
          <li><code>UsageMeter</code> tracks funnel/lead consumption against tier limits.</li>
          <li><code>ChurnPrevention</code> component surfaces retention-oriented messaging.</li>
        </ul>

        <hr />

        <h2>3. Authentication & User Management</h2>
        <h3>3.1 Auth System</h3>
        <ul>
          <li>Email/password signup and login</li>
          <li>Password reset flow</li>
          <li>Protected routes via <code>ProtectedRoute</code> component</li>
          <li>Auth context provides user, signOut, session management</li>
          <li>Onboarding flow for new users</li>
        </ul>
        <h3>3.2 Role-Based Access Control</h3>
        <ul>
          <li>Roles: admin, moderator, user (enum app_role)</li>
          <li>user_roles table maps users to roles</li>
          <li>Admin functions: admin_list_users, admin_update_user, admin_delete_user</li>
          <li>Admin dashboard for user/role management</li>
          <li>has_role(user_id, role) SQL function for permission checks</li>
        </ul>
        <h3>3.3 Team Management</h3>
        <ul>
          <li>team_members table with invite workflow (email, role, status)</li>
          <li>InviteTeamMemberModal for sending invitations</li>
          <li>Team page for managing members</li>
        </ul>
        <h3>3.4 User Profiles</h3>
        <ul>
          <li>profiles table: display_name, avatar, bio, phone, company info, brand color, license state, market area, growth goals, commission rate, avg sale price, target closings</li>
          <li>Profile editing in Settings with live logo preview</li>
        </ul>

        <hr />

        <h2>4. Dashboard & Navigation</h2>
        <h3>4.1 Mobile Shell</h3>
        <ul>
          <li>MobileShell wrapper provides consistent mobile-first layout</li>
          <li>BottomNav for primary navigation (Home, Leads, Listings, Content, Insights)</li>
          <li>Responsive design optimized for touch interactions</li>
        </ul>
        <h3>4.2 Home Dashboard</h3>
        <ul>
          <li>Dynamic greeting based on time of day</li>
          <li>Real-time metrics: Active Leads, Listings, Response Time, Pipeline Value</li>
          <li>Mode toggle (Manual ↔ Autopilot)</li>
          <li>NLP Command Bar (⌘K) for natural language commands</li>
          <li>Quick Actions grid (context-aware per mode)</li>
          <li>Create Menu (bottom sheet) for new items</li>
          <li>Admin CTA for admin users</li>
          <li>Growth Score widget and Usage Meter with tier limits</li>
        </ul>
        <h3>4.3 Mode System</h3>
        <ul>
          <li><strong>Manual Mode:</strong> Hands-on dashboard with metric cards, AI suggestions, Growth Score</li>
          <li><strong>Autopilot Mode:</strong> ROI Summary, Budget Slider, Autopilot Action Feed</li>
          <li>ModeContext manages toggle state globally; ModeToggle component for switching</li>
        </ul>

        <hr />

        <h2>5. Funnel Engine</h2>
        <h3>5.1 Funnel Types</h3>
        <ul><li>Buyer Lead Capture</li><li>Seller/Home Valuation</li><li>Open House Registration</li><li>Cash Offer</li><li>Custom funnels</li></ul>
        <h3>5.2 Creation Workflow (4-step wizard)</h3>
        <ol><li>Template Selection — Choose funnel type from visual grid</li><li>Target Configuration — Area, price range, ZIP codes</li><li>Tone & Focus — Professional, friendly, urgent, luxury, etc.</li><li>CTA & Publish — Call-to-action text, AI generation, publish</li></ol>
        <h3>5.3 AI Content Generation</h3>
        <ul>
          <li>Edge function generate-funnel calls AI model</li>
          <li>Generates: headline, subheadline, body content, CTA, trust block, video script, social copy (Facebook, Instagram, TikTok, LinkedIn, email), nurture sequence (5-step drip)</li>
          <li>Dynamic year injection (uses current year)</li>
          <li>Category-aware prompts (buyer vs seller vs open house)</li>
        </ul>
        <h3>5.4 Public Funnel Pages</h3>
        <ul>
          <li>SEO-optimized with meta tags, OG tags</li>
          <li>Agent branding (logo, company name, brand color)</li>
          <li>Animated sections: hero, problem, value props, trust block, social proof</li>
          <li>LeadCaptureFlow component for form submission</li>
          <li>View tracking via increment_funnel_views RPC</li>
        </ul>
        <h3>5.5 Funnel Management</h3>
        <ul>
          <li>List view with status, stats (views, leads, conversion rate)</li>
          <li>Pause/resume, delete, share (Facebook, Twitter, LinkedIn, email)</li>
          <li>QR code generation, preview modal, copy link</li>
        </ul>

        <hr />

        <h2>6. Lead Management</h2>
        <h3>6.1 Lead Database</h3>
        <ul>
          <li>Fields: name, email, phone, temperature (hot/warm/cold), status, budget, timeline, intent, tags, deal_side, financing_status</li>
          <li>AI scoring: ai_score, ai_score_reasons, ai_next_step</li>
          <li>Revenue tracking: estimated_revenue, actual_revenue, revenue_status</li>
          <li>Urgency scoring and behavior timeline (JSON)</li>
          <li>Assignment: assigned_to for team distribution</li>
        </ul>
        <h3>6.2 Lead Views</h3>
        <ul><li>Lead list with filtering by temperature</li><li>Lead detail with full profile</li><li>LeadCard component, LeadIntelligencePanel for AI insights</li><li>Hot lead badge notifications</li></ul>
        <h3>6.3–6.8 Additional Lead Features</h3>
        <ul>
          <li>Lead Intelligence via edge function for AI-powered analysis</li>
          <li>Multi-channel conversation history (SMS/email/call) with sentiment scoring</li>
          <li>Lead verification with quality scoring and fraud detection</li>
          <li>Manual and AI notes, custom tagging system</li>
          <li>Real-time hot lead alerts with bell icon badge</li>
          <li>Close Lead Modal for marking deals as won/lost with revenue</li>
        </ul>

        <hr />

        <h2>7. Listings Management</h2>
        <ul>
          <li>Fields: address, price, beds, baths, sqft, status, image, days_on_market, views</li>
          <li>List/grid view, ListingCard component, add/edit forms</li>
          <li>Pipeline value calculation on dashboard</li>
        </ul>

        <hr />

        <h2>8. Content Studio</h2>
        <ul>
          <li>Content types: video scripts, social media copy, ad copy, blog posts, email templates</li>
          <li>AI Content Generation via edge function</li>
          <li>ConversionCopywriter and AdCopyGenerator components</li>
          <li>Content database: title, body, type, status (draft/published), views, likes, duration</li>
          <li>Public portfolio page for shareable content showcase</li>
        </ul>

        <hr />

        <h2>9. Campaigns & Advertising</h2>
        <ul>
          <li>ad_campaigns table: name, platform, status, headline, description, CTA, daily_budget, target_audience</li>
          <li>Performance tracking: impressions, clicks, leads_generated, total_spend</li>
          <li>A/B variant support, linked to funnels</li>
          <li>Ad publishing edge function for Meta, Google, TikTok, YouTube</li>
          <li>Pro features: ABTestingControls, RetargetingAudienceBuilder, BudgetSlider (Growth+)</li>
        </ul>

        <hr />

        <h2>10. Seller Suite</h2>
        <ul>
          <li>AI-powered Automated Valuation Model (AVM)</li>
          <li>Cash Offer funnels, home value landing pages</li>
          <li>Seller-specific ad presets</li>
          <li>seller_valuations table: address, estimated_value, confidence_score, valuation_data, status</li>
        </ul>

        <hr />

        <h2>11. Analytics & Insights</h2>
        <ul>
          <li>Basic: market stats, performance metrics, mode-aware display</li>
          <li>Pro: funnel conversion charts, lead acquisition timeline, temperature distribution pie chart, top/worst funnel performance, week-over-week trends, AI anomaly detection</li>
          <li>ROI Summary, ROI Confidence Panel, Weekly Growth Summary, Growth Score</li>
        </ul>

        <hr />

        <h2>12. AI & Automation</h2>
        <ul>
          <li><strong>NLP Command Bar:</strong> Natural language interface (⌘K), auto-navigation, command history</li>
          <li><strong>AI Action Feeds:</strong> Urgent/nurture/opportunity suggestions, data-driven from leads/funnels</li>
          <li><strong>Autonomous Outreach:</strong> Outreach queue, sequences, agent settings (auto_send, quiet hours, max daily messages)</li>
          <li><strong>Nurture Templates:</strong> Drip campaign management, AI-generated 5-step sequences</li>
          <li><strong>Lead Capture Chat:</strong> Conversational qualification and form-based progressive disclosure</li>
        </ul>

        <hr />

        <h2>13. Integrations</h2>
        <ul>
          <li><strong>CRM:</strong> Follow Up Boss, LionDesk, kvCORE, HubSpot, Chime, Prolinc</li>
          <li><strong>MLS:</strong> Property data sync via MLSSyncPanel</li>
          <li><strong>Calendar:</strong> Google Calendar, Outlook Calendar, TourScheduler</li>
          <li><strong>Messaging:</strong> Twilio SMS, Resend Email</li>
          <li><strong>Ad Platforms:</strong> Google Ads, Meta/Facebook Ads, TikTok Ads, YouTube Ads</li>
          <li><strong>Voice AI:</strong> ElevenLabs TTS</li>
          <li>Central integration hub with credential management and sync status tracking</li>
        </ul>

        <hr />

        <h2>14. Branding & Personalization</h2>
        <ul>
          <li><strong>Brand Bible:</strong> Identity, visual system, typography, voice, messaging guidelines</li>
          <li><strong>Agent Branding:</strong> Custom brand color, company logo, name display across public pages</li>
          <li><strong>Personalization Engine:</strong> Channel/time/tone/length preferences, auto follow-up, smart timing, behavior tracking</li>
        </ul>

        <hr />

        <h2>15. Guided Experiences</h2>
        <ul>
          <li><strong>Wizard System:</strong> Step-by-step guides per route (14 routes), pro tips, progress tracking</li>
          <li><strong>Hybrid Guide:</strong> 4-phase guides (Explain → Assist → Execute → Optimize), actionable buttons, pro-only upgrade prompts</li>
        </ul>

        <hr />

        <h2>16. Database Schema Summary</h2>
        <p><strong>21 Tables:</strong> profiles, subscriptions, user_roles, team_members, funnels, funnel_leads, lead_conversations, lead_notes, lead_tags, lead_verifications, listings, content, ad_campaigns, agent_settings, outreach_queue, outreach_sequences, integration_connections, nlp_commands, usage_events, seller_valuations, tour_requests</p>
        <p><strong>17+ Edge Functions:</strong> generate-funnel, generate-content, lead-intelligence, nlp-command, publish-ad, autonomous-outreach, schedule-outreach, process-outreach-queue, elevenlabs-tts, sync-mls, sync-followupboss, sync-liondesk, sync-kvcore, sync-hubspot, sync-chime, sync-prolinc, sync-google-calendar, sync-outlook, sync-twilio, sync-resend, sync-google-ads, sync-meta-ads, sync-tiktok-ads, sync-youtube-ads</p>
        <p><strong>6 SQL Functions:</strong> get_feature_flags, has_role, admin_list_users, admin_update_user, admin_delete_user, increment_funnel_views</p>

        <hr />

        <h2>17. Current Limitations & MVP Gaps</h2>
        <ol>
          <li>No real payment processing — Subscription upgrades write directly to DB; no Stripe integration</li>
          <li>Simulated integrations — CRM/MLS/ad sync edge functions exist but lack production API connections</li>
          <li>No email delivery — Outreach queue processes messages but actual sending requires live API keys</li>
          <li>No pagination — Lead/funnel/content lists load all records (will degrade at scale)</li>
          <li>Limited error handling — Edge functions lack retry logic, rate limiting, circuit breakers</li>
          <li>No real-time sync — Realtime not enabled on any tables</li>
          <li>No file upload — Logo/images require URL input, no direct upload to storage</li>
          <li>No mobile app — Web-only, though designed mobile-first</li>
          <li>No multi-language — English only</li>
          <li>No audit logging — No change history for sensitive operations</li>
          <li>Security audit needed — RLS policies need comprehensive review for production</li>
        </ol>

        <hr />
        <p><em>Generated for AI analysis — February 2026</em></p>
      </div>
    </div>
  );
};

export default FeaturesDoc;
