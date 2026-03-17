# AgentOrion — Complete Platform Feature Documentation

**Version:** MVP 1.0  
**Date:** February 2026  
**Purpose:** Comprehensive feature inventory for AI-driven improvement analysis

---

## 1. Platform Overview

AgentOrion is a mobile-first SaaS platform designed for real estate agents to automate lead generation, nurture, and conversion. It combines AI-powered content creation, funnel building, CRM integrations, and analytics into a single dashboard with two operating modes: **Manual** (hands-on) and **Autopilot** (AI-driven).

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Supabase (auth, database, edge functions, storage), Recharts, shadcn/ui.

---

## 2. Monetization & Subscription Tiers

| Feature | Free | Growth ($29/mo) | Pro ($59/mo) |
|---|---|---|---|
| Active Funnels | 1 | Unlimited | Unlimited |
| Leads/Month | 10 | Unlimited | Unlimited |
| AI Content Generation | Basic | Full | Full |
| Ad Budget Slider | ❌ | ✅ | ✅ |
| Retargeting Audiences | ❌ | ❌ | ✅ |
| A/B Testing Controls | ❌ | ❌ | ✅ |
| Pro Analytics Dashboard | ❌ | ❌ | ✅ |
| ROI Confidence Panel | ❌ | ❌ | ✅ |
| Weekly Growth Summary | ❌ | ❌ | ✅ |
| Autonomous Engagement | ❌ | ❌ | ✅ |

- Feature gating is enforced via backend SQL function `get_feature_flags(user_id)`.
- `FeatureGate` component wraps UI sections; shows upgrade prompts for locked features.
- `UpgradeBanner` and `UpgradeModal` handle upsell with tier-specific content.
- `UsageMeter` tracks funnel/lead consumption against tier limits.
- `ChurnPrevention` component surfaces retention-oriented messaging.

---

## 3. Authentication & User Management

### 3.1 Auth System
- Email/password signup and login (`src/pages/Auth.tsx`)
- Password reset flow (`src/pages/ResetPassword.tsx`)
- Protected routes via `ProtectedRoute` component
- Auth context (`AuthContext`) provides `user`, `signOut`, session management
- Onboarding flow (`src/pages/Onboarding.tsx`) for new users

### 3.2 Role-Based Access Control
- Roles: `admin`, `moderator`, `user` (enum `app_role`)
- `user_roles` table maps users to roles
- Admin functions: `admin_list_users`, `admin_update_user`, `admin_delete_user`
- Admin dashboard (`src/pages/Admin.tsx`) for user/role management
- `has_role(user_id, role)` SQL function for permission checks

### 3.3 Team Management
- `team_members` table with invite workflow (email, role, status)
- `InviteTeamMemberModal` for sending invitations
- Team page (`src/pages/Team.tsx`) for managing members
- Roles per team: owner, member

### 3.4 User Profiles
- `profiles` table: display_name, avatar, bio, phone, company info, brand color, license state, market area, growth goals, commission rate, avg sale price, target closings
- Profile editing in Settings with live logo preview

---

## 4. Dashboard & Navigation

### 4.1 Mobile Shell
- `MobileShell` wrapper provides consistent mobile-first layout
- `BottomNav` for primary navigation (Home, Leads, Listings, Content, Insights)
- Responsive design optimized for touch interactions

### 4.2 Home Dashboard (`src/pages/Index.tsx`)
- Dynamic greeting based on time of day
- Real-time metrics: Active Leads, Listings, Response Time, Pipeline Value
- Mode toggle (Manual ↔ Autopilot)
- NLP Command Bar (⌘K) for natural language commands
- Quick Actions grid (context-aware per mode)
- Create Menu (bottom sheet) for new items
- Admin CTA for admin users
- Growth Score widget
- Usage Meter with tier limits

### 4.3 Mode System
- **Manual Mode:** Hands-on dashboard with metric cards, AI suggestions, Growth Score
- **Autopilot Mode:** ROI Summary, Budget Slider, Autopilot Action Feed
- `ModeContext` manages toggle state globally
- `ModeToggle` component for switching

---

## 5. Funnel Engine

### 5.1 Funnel Types
- Buyer Lead Capture
- Seller/Home Valuation
- Open House Registration
- Cash Offer
- Custom funnels

### 5.2 Creation Workflow (4-step wizard)
1. **Template Selection** — Choose funnel type from visual grid
2. **Target Configuration** — Area, price range, ZIP codes
3. **Tone & Focus** — Professional, friendly, urgent, luxury, etc.
4. **CTA & Publish** — Call-to-action text, AI generation, publish

### 5.3 AI Content Generation
- Edge function `generate-funnel` calls AI model
- Generates: headline, subheadline, body content, CTA, trust block, video script, social copy (Facebook, Instagram, TikTok, LinkedIn, email), nurture sequence (5-step drip)
- Dynamic year injection (uses current year)
- Category-aware prompts (buyer vs seller vs open house)

### 5.4 Public Funnel Pages (`/f/:slug`)
- SEO-optimized with meta tags, OG tags, JSON-LD potential
- Agent branding (logo, company name, brand color)
- Animated sections: hero, problem, value props, trust block, social proof
- `LeadCaptureFlow` component for form submission
- View tracking via `increment_funnel_views` RPC
- Responsive, mobile-first design

### 5.5 Funnel Management
- List view with status, stats (views, leads, conversion rate)
- Pause/resume, delete, share (Facebook, Twitter, LinkedIn, email)
- QR code generation for each funnel
- Preview modal
- Copy link functionality
- Performance metrics (total views, total leads, avg conversion)

---

## 6. Lead Management

### 6.1 Lead Database (`funnel_leads` table)
- Fields: name, email, phone, temperature (hot/warm/cold), status, budget, timeline, intent, tags, deal_side, financing_status
- AI scoring: `ai_score`, `ai_score_reasons`, `ai_next_step`
- Revenue tracking: `estimated_revenue`, `actual_revenue`, `revenue_status`
- Urgency scoring: `urgency_score`
- Behavior timeline (JSON)
- Assignment: `assigned_to` for team distribution

### 6.2 Lead Views
- Lead list (`src/pages/Leads.tsx`) with filtering by temperature
- Lead detail (`src/pages/LeadDetail.tsx`) with full profile
- `LeadCard` component for list items
- `LeadIntelligencePanel` for AI insights per lead
- Hot lead badge notifications

### 6.3 Lead Intelligence
- Edge function `lead-intelligence` for AI-powered analysis
- Behavior timeline tracking
- Sentiment scoring on conversations
- AI-generated next steps

### 6.4 Lead Conversations
- `lead_conversations` table: content, channel (sms/email/call), direction, role, sentiment_score
- Multi-channel conversation history

### 6.5 Lead Verification
- `lead_verifications` table: verification_type, quality_score, fraud_flags
- Automated quality scoring

### 6.6 Lead Notes & Tags
- `lead_notes` table: content, note_type (manual/ai)
- `lead_tags` table: custom tagging system

### 6.7 Lead Notifications
- `LeadNotificationProvider` and `useLeadNotifications` hook
- Real-time hot lead alerts
- Bell icon with count badge on dashboard

### 6.8 Close Lead Modal
- `CloseLeadModal` for marking deals as won/lost with revenue

---

## 7. Listings Management

### 7.1 Listings Database
- Fields: address, price, beds, baths, sqft, status, image, days_on_market, views
- User-scoped (user_id)

### 7.2 Listings UI
- `src/pages/Listings.tsx` — list/grid view
- `ListingCard` component
- Add/edit listing forms
- Pipeline value calculation on dashboard

---

## 8. Content Studio

### 8.1 Content Types
- Video scripts
- Social media copy
- Ad copy
- Blog posts
- Email templates

### 8.2 AI Content Generation
- Edge function `generate-content` for AI-powered writing
- `ConversionCopywriter` component for ad/marketing copy
- `AdCopyGenerator` for platform-specific ad content
- Content database: title, body, type, status (draft/published), views, likes, duration

### 8.3 Content Portfolio
- Public portfolio page (`/portfolio/:userId`)
- Shareable content showcase

---

## 9. Campaigns & Advertising

### 9.1 Campaign Management (`src/pages/Campaigns.tsx`)
- `ad_campaigns` table: name, platform, status, headline, description, CTA, daily_budget, target_audience
- Performance tracking: impressions, clicks, leads_generated, total_spend
- A/B variant support (`ab_variant` field)
- Linked to funnels via `funnel_id`

### 9.2 Ad Publishing
- Edge function `publish-ad` for deploying ads
- Platform support: Meta (Facebook/Instagram), Google, TikTok, YouTube

### 9.3 Advanced Features (Pro)
- `ABTestingControls` — A/B test management
- `RetargetingAudienceBuilder` — Custom audience creation
- `BudgetSlider` — Daily ad budget control (Growth+)

---

## 10. Seller Suite (`src/pages/SellerSuite.tsx`)

### 10.1 Features
- AI-powered Automated Valuation Model (AVM)
- Cash Offer funnels
- Home value landing pages
- Seller-specific ad presets

### 10.2 Seller Valuations Database
- `seller_valuations` table: address, estimated_value, confidence_score, valuation_data, status
- Linked to funnels and leads

---

## 11. Analytics & Insights

### 11.1 Basic Analytics (`src/pages/Insights.tsx`)
- Market stats: total funnels, conversion rate, active leads
- Performance metrics: pipeline value, listings, growth trends
- Mode-aware display (Manual vs Autopilot)

### 11.2 Pro Analytics Dashboard
- Funnel conversion comparison charts (BarChart)
- Lead acquisition timeline (AreaChart, 14-day)
- Lead temperature distribution (PieChart)
- Top/worst funnel performance
- Week-over-week trend analysis
- AI anomaly detection (stalled funnels, hot lead surges, conversion drops)

### 11.3 ROI & Growth (Pro)
- `ROISummary` — Total spend, leads generated, appointments booked, pipeline value
- `ROIConfidencePanel` — Confidence scoring for ROI projections
- `WeeklyGrowthSummary` — Weekly digest of growth metrics
- `GrowthScore` — Composite score (leads + listings + funnels + conversion)

---

## 12. AI & Automation

### 12.1 NLP Command Bar
- Natural language interface (⌘K / Ctrl+K)
- Edge function `nlp-command` processes commands
- Auto-navigation to relevant pages
- Command history stored in `nlp_commands` table
- Suggestion prompts for common actions

### 12.2 AI Action Feeds
- `AIActionFeed` (Manual mode) — Urgent, nurture, opportunity suggestions
- `AutopilotActionFeed` (Autopilot mode) — Prioritized action items
- Data-driven: queries leads/funnels for actionable insights
- Types: urgent (high urgency score), nurture (stale leads), opportunity (high budget), insight (conversion data)

### 12.3 Autonomous Outreach
- `AutonomousEngagement` component
- Edge functions: `autonomous-outreach`, `schedule-outreach`, `process-outreach-queue`
- `outreach_queue` table: channel, body, subject, status, scheduled_at, delivery tracking
- `outreach_sequences` table: multi-step sequences with trigger conditions
- Agent settings: `agent_settings` table (auto_send, max_daily_messages, quiet_hours, timezone)

### 12.4 Nurture Templates
- `NurtureTemplates` component for drip campaign management
- AI-generated nurture sequences (5-step) included in funnel generation

### 12.5 Lead Capture Chat
- `LeadCaptureChat` — Conversational lead qualification
- `LeadCaptureFlow` — Form-based capture with progressive disclosure

---

## 13. Integrations

### 13.1 CRM Integrations
- Follow Up Boss (`sync-followupboss`)
- LionDesk (`sync-liondesk`)
- kvCORE (`sync-kvcore`)
- HubSpot (`sync-hubspot`)
- Chime (`sync-chime`)
- Prolinc (`sync-prolinc`)
- `IntegrationConnectModal` for credential input
- `integration_connections` table: provider, credentials, status, sync_config, last_synced_at

### 13.2 MLS Integration
- `MLSSyncPanel` component
- Edge function `sync-mls`
- Property data sync

### 13.3 Calendar Integrations
- Google Calendar (`sync-google-calendar`)
- Outlook Calendar (`sync-outlook`)
- `TourScheduler` for booking property tours
- `tour_requests` table: lead_id, listing_id, date, time, status, ai_confirmed

### 13.4 Messaging Integrations
- Twilio SMS (`sync-twilio`)
- Resend Email (`sync-resend`)

### 13.5 Ad Platform Integrations
- Google Ads (`sync-google-ads`)
- Meta/Facebook Ads (`sync-meta-ads`)
- TikTok Ads (`sync-tiktok-ads`)
- YouTube Ads (`sync-youtube-ads`)

### 13.6 Voice AI
- ElevenLabs TTS (`elevenlabs-tts` edge function)

### 13.7 Integration Architecture
- Credential fields defined in `integrationCredentials.ts`
- Sync mapping in `integrationSyncMap.ts`
- Connection status tracking per provider
- `src/pages/Integrations.tsx` — Central integration hub

---

## 14. Branding & Personalization

### 14.1 Brand Bible (`src/pages/BrandBible.tsx`)
- Identity section: mission, values, personality
- Visual system: color palette, gradients, shadows, spacing
- Typography: font scales, display vs body
- Voice: tone pillars, do/don't guidelines
- Messaging: elevator pitch, taglines, microcopy rules

### 14.2 Agent Branding
- Custom brand color (applied to funnels)
- Company logo URL with live preview
- Company name display
- Brand persistence across public pages

### 14.3 Personalization Engine
- Channel preference (SMS, email, call, auto)
- Best time slot selection
- Tone preference (casual, professional, friendly, auto)
- Script length preference
- Feature toggles: auto follow-up, smart timing, behavior tracking
- AI-derived insight text

---

## 15. Guided Experiences

### 15.1 Wizard System
- `WizardContext` + `WizardOverlay` — Step-by-step guides per route
- `wizardFlows` registry: 14 routes with multi-step content
- Pro tips gated by subscription tier
- Progress tracking with Back/Next/Skip navigation

### 15.2 Hybrid Guide System
- `HybridGuideContext` + `HybridGuide` — 4-phase guides (Explain → Assist → Execute → Optimize)
- `hybridFlows` registry with actionable buttons per phase
- Action types: navigate, AI-execute, AI-draft, info, copy
- Pro-only actions with upgrade prompts
- `HybridGuideButton` for triggering guides

---

## 16. Database Schema Summary

### Tables (20)
1. `profiles` — User profiles and branding
2. `subscriptions` — Tier, billing, Stripe IDs
3. `user_roles` — RBAC assignments
4. `team_members` — Team invites and membership
5. `funnels` — Funnel definitions and content
6. `funnel_leads` — Lead records with AI scoring
7. `lead_conversations` — Multi-channel chat history
8. `lead_notes` — Manual and AI notes
9. `lead_tags` — Custom lead tags
10. `lead_verifications` — Quality and fraud checks
11. `listings` — Property listings
12. `content` — Generated content library
13. `ad_campaigns` — Ad campaign management
14. `agent_settings` — Automation preferences
15. `outreach_queue` — Scheduled outreach messages
16. `outreach_sequences` — Multi-step drip sequences
17. `integration_connections` — Third-party connections
18. `nlp_commands` — Command history
19. `usage_events` — Analytics event tracking
20. `seller_valuations` — Property valuations
21. `tour_requests` — Showing/tour scheduling

### Edge Functions (17)
`generate-funnel`, `generate-content`, `lead-intelligence`, `nlp-command`, `publish-ad`, `autonomous-outreach`, `schedule-outreach`, `process-outreach-queue`, `elevenlabs-tts`, `sync-mls`, `sync-followupboss`, `sync-liondesk`, `sync-kvcore`, `sync-hubspot`, `sync-chime`, `sync-prolinc`, `sync-google-calendar`, `sync-outlook`, `sync-twilio`, `sync-resend`, `sync-google-ads`, `sync-meta-ads`, `sync-tiktok-ads`, `sync-youtube-ads`

### SQL Functions (4)
`get_feature_flags`, `has_role`, `admin_list_users`, `admin_update_user`, `admin_delete_user`, `increment_funnel_views`

---

## 17. Current Limitations & MVP Gaps

1. **No real payment processing** — Subscription upgrades write directly to DB; no Stripe integration
2. **Simulated integrations** — CRM/MLS/ad sync edge functions exist but lack production API connections
3. **No email delivery** — Outreach queue processes messages but actual sending (Twilio/Resend) requires live API keys
4. **No pagination** — Lead/funnel/content lists load all records (will degrade at scale)
5. **Limited error handling** — Edge functions lack retry logic, rate limiting, and circuit breakers
6. **No real-time sync** — Supabase Realtime not enabled on any tables
7. **No file upload** — Logo/images require URL input, no direct upload to storage
8. **No mobile app** — Web-only, though designed mobile-first
9. **No multi-language** — English only
10. **No audit logging** — No change history for sensitive operations
11. **Security audit needed** — RLS policies need comprehensive review for production

---

*Generated for AI analysis — February 2026*
