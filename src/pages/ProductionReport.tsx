import { useEffect } from "react";
import { FileDown, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProductionReport = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AgentOrion — Production Readiness Report";
  }, []);

  const handleDownload = () => {
    window.print();
  };

  return (
    <>
      {/* Print-specific styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; font-size: 11pt; }
          .print-container { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
          .print-container h1 { font-size: 22pt; }
          .print-container h2 { font-size: 16pt; break-after: avoid; }
          .print-container h3 { font-size: 13pt; break-after: avoid; }
          .print-container table { break-inside: avoid; }
          .page-break { break-before: page; }
        }
      `}</style>

      {/* Toolbar - hidden when printing */}
      <div className="no-print sticky top-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <FileDown size={16} /> Download PDF
        </button>
      </div>

      {/* Report Content */}
      <div className="print-container max-w-3xl mx-auto px-6 py-10 text-foreground">
        <h1 className="text-3xl font-bold mb-1">AgentOrion — Production Readiness Report</h1>
        <p className="text-sm text-muted-foreground mb-8">Prepared {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>

        <hr className="border-border mb-8" />

        {/* TABLE OF CONTENTS */}
        <div className="mb-10">
          <h2 className="text-xl font-bold mb-3">Table of Contents</h2>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Production Requirements Overview</li>
            <li>Required Integrations</li>
            <li>Infrastructure &amp; Deployment</li>
            <li>Subscription Tiers &amp; Fees</li>
            <li>Subscription Activation Roadmap</li>
            <li>Growth Upgrade Feature</li>
            <li>Security Measures</li>
          </ol>
        </div>

        {/* SECTION 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">1. Production Requirements Overview</h2>
          <p className="mb-4 text-sm leading-relaxed">
            AgentOrion is a mobile-first SaaS platform for real estate agents. Before going live, several critical integrations, infrastructure items, and security measures must be addressed. This document provides a comprehensive checklist.
          </p>
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden mb-4">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-3 py-2 font-semibold">Category</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
                <th className="text-left px-3 py-2 font-semibold">Priority</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Stripe Payments", "Not connected", "Critical"],
                ["Resend (Email Delivery)", "Not connected", "Critical"],
                ["MLS / SimplyRETS API", "Not connected", "Critical"],
                ["ElevenLabs Voice Agent ID", "Needs configuration", "High"],
                ["Custom Domain", "Not configured", "High"],
                ["Auth Email Templates", "Default (unbranded)", "Medium"],
                ["Error Monitoring (Sentry)", "Not installed", "High"],
                ["Rate Limiting (public endpoints)", "Not implemented", "High"],
                ["Terms of Service / Privacy Policy", "Missing", "Critical"],
                ["SSL / HTTPS", "Handled by Lovable", "Done ✓"],
                ["Database RLS Policies", "Implemented", "Done ✓"],
                ["Role-Based Access (RBAC)", "Implemented", "Done ✓"],
              ].map(([cat, status, priority], i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/30"}>
                  <td className="px-3 py-2">{cat}</td>
                  <td className="px-3 py-2">{status}</td>
                  <td className="px-3 py-2 font-medium">{priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* SECTION 2 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">2. Required Integrations</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">Stripe (Payments &amp; Billing)</h3>
          <p className="text-sm leading-relaxed mb-2">
            Stripe is required to activate paid subscriptions (Growth and Pro). Currently, the UpgradeModal contains mock upgrade logic that updates the database directly. In production, this must be replaced with Stripe Checkout sessions and webhook-driven subscription management.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Create Growth ($29/mo) and Pro ($59/mo) products in Stripe Dashboard</li>
            <li>Generate a Stripe Secret Key and store it as a backend secret</li>
            <li>Implement a Stripe Checkout edge function</li>
            <li>Implement a Stripe Webhook edge function to sync subscription events</li>
            <li>Implement Stripe Customer Portal for self-service billing</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Resend (Transactional Email)</h3>
          <p className="text-sm leading-relaxed mb-2">
            The outreach queue system (<code>process-outreach-queue</code>) and nurture sequences require an email delivery provider. Resend is the selected provider.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Create a Resend account and verify your sending domain</li>
            <li>Generate an API key and store as a backend secret</li>
            <li>The <code>sync-resend</code> edge function is already scaffolded</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">MLS / SimplyRETS</h3>
          <p className="text-sm leading-relaxed mb-2">
            The <code>sync-mls</code> edge function requires live SimplyRETS credentials to pull real listing data. Currently it uses demo credentials.
          </p>
          <ul className="list-disc list-inside text-sm space-y-1 mb-4">
            <li>Obtain SimplyRETS API key and secret</li>
            <li>Store credentials as backend secrets</li>
            <li>Test sync with production MLS feed</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">ElevenLabs (Voice Agent)</h3>
          <p className="text-sm leading-relaxed mb-2">
            The Voice Agent component requires a configured ElevenLabs Agent ID. The conversation token edge function is ready but needs the agent to be created in ElevenLabs.
          </p>
        </section>

        {/* SECTION 3 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">3. Infrastructure &amp; Deployment</h2>
          <ul className="list-disc list-inside text-sm space-y-2">
            <li><strong>Custom Domain:</strong> Connect your domain (e.g., agentorion.com) via Project Settings → Domains. Required for branded sharing URLs and OG meta tags.</li>
            <li><strong>Auth Email Templates:</strong> Customize confirmation and password reset emails with your brand. Available through backend configuration.</li>
            <li><strong>Error Monitoring:</strong> Integrate a service like Sentry for real-time error tracking and alerting.</li>
            <li><strong>Rate Limiting:</strong> Add rate limiting to public-facing edge functions (lead capture, OG endpoints) to prevent abuse.</li>
            <li><strong>Legal Pages:</strong> Create Terms of Service and Privacy Policy pages. These are required for app store compliance, Stripe, and general production readiness.</li>
            <li><strong>Backup Strategy:</strong> Configure regular database backups (available via Lovable Cloud settings).</li>
          </ul>
        </section>

        {/* SECTION 4 */}
        <div className="page-break" />
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">4. Subscription Tiers &amp; Fees</h2>
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden mb-4">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-3 py-2 font-semibold">Feature</th>
                <th className="text-center px-3 py-2 font-semibold">Free ($0/mo)</th>
                <th className="text-center px-3 py-2 font-semibold">Growth ($29/mo)</th>
                <th className="text-center px-3 py-2 font-semibold">Pro ($59/mo)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Active Funnels", "1", "Unlimited", "Unlimited"],
                ["Leads per Month", "5", "Unlimited", "Unlimited"],
                ["Voice Minutes / Month", "0 (Locked)", "30 minutes", "Unlimited"],
                ["Ad Budget Slider", "—", "✓", "✓"],
                ["Ad Integration (Meta, Google, TikTok)", "—", "✓", "✓"],
                ["Retargeting Audience Builder", "—", "✓", "✓"],
                ["Pro Mode Toggle", "—", "—", "✓"],
                ["A/B Split Testing", "—", "—", "✓"],
                ["Cohort Analytics", "—", "—", "✓"],
                ["Attribution Dashboard", "—", "—", "✓"],
                ["Advanced ROI Reports", "—", "—", "✓"],
                ["Data Export", "—", "—", "✓"],
                ["Revenue Verification", "—", "—", "✓"],
              ].map(([feature, free, growth, pro], i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/30"}>
                  <td className="px-3 py-2 font-medium">{feature}</td>
                  <td className="px-3 py-2 text-center">{free}</td>
                  <td className="px-3 py-2 text-center">{growth}</td>
                  <td className="px-3 py-2 text-center">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-sm leading-relaxed">
            Feature access is enforced server-side via the <code>get_feature_flags(user_id)</code> SQL function. The UI uses <code>FeatureGate</code>, <code>UpgradeBanner</code>, <code>UsageMeter</code>, and <code>UpgradeModal</code> components to gate and promote upgrades contextually.
          </p>
        </section>

        {/* SECTION 5 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">5. Subscription Activation Roadmap</h2>
          <p className="text-sm leading-relaxed mb-4">
            The following steps are required to move from the current mock subscription system to live Stripe-powered billing:
          </p>
          <ol className="list-decimal list-inside text-sm space-y-3">
            <li>
              <strong>Enable Stripe Integration:</strong> Connect Stripe via Lovable's native Stripe integration. This provides tools for creating products, prices, and managing checkout sessions.
            </li>
            <li>
              <strong>Create Stripe Products:</strong> Create two products in Stripe — "Growth" at $29/mo and "Pro" at $59/mo — each with a monthly recurring price.
            </li>
            <li>
              <strong>Replace UpgradeModal Logic:</strong> Currently, <code>UpgradeModal.tsx</code> directly upserts into the <code>subscriptions</code> table. This must be replaced with a call to a <code>create-checkout-session</code> edge function that creates a Stripe Checkout session and redirects the user to Stripe's hosted payment page.
            </li>
            <li>
              <strong>Create Webhook Handler:</strong> Build a <code>stripe-webhook</code> edge function that listens for <code>checkout.session.completed</code>, <code>customer.subscription.updated</code>, and <code>customer.subscription.deleted</code> events. These events update the <code>subscriptions</code> table with the correct tier and status.
            </li>
            <li>
              <strong>Implement Customer Portal:</strong> Use Stripe's Customer Portal so users can manage their billing, update payment methods, and cancel subscriptions from within the Settings page.
            </li>
            <li>
              <strong>Test End-to-End:</strong> Use Stripe's test mode to verify the full lifecycle — signup → checkout → subscription active → downgrade → cancellation.
            </li>
          </ol>
        </section>

        {/* SECTION 6 */}
        <div className="page-break" />
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">6. Growth Upgrade Feature</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">What It Is</h3>
          <p className="text-sm leading-relaxed mb-4">
            The "Growth Upgrade" is a behavioral, context-aware upsell system designed to convert Free-tier users to the Growth plan ($29/mo). It uses usage data and engagement signals to trigger upgrade prompts at the moment a user is most likely to convert.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">How It Previously Worked</h3>
          <p className="text-sm leading-relaxed mb-2">The system had three components:</p>
          <ol className="list-decimal list-inside text-sm space-y-2 mb-4">
            <li>
              <strong>Behavioral Triggers (SubscriptionContext):</strong> The <code>SubscriptionProvider</code> monitors usage in real-time. When a Free user exceeds 1 funnel or 10 leads, it sets <code>upgradeTarget: "growth"</code> and opens the <code>UpgradeModal</code> with a contextual reason (e.g., "You're using multiple funnels — unlock unlimited funnels with Growth.").
            </li>
            <li>
              <strong>Upgrade Banner (UpgradeBanner):</strong> A soft-prompt banner that appears on the dashboard when a Free user approaches their limits (≥1 funnel or ≥5 leads). It says: "You're close to Growth — unlock unlimited funnels + smarter spend for $29/mo." and includes an "Upgrade to Growth" CTA.
            </li>
            <li>
              <strong>Upgrade Modal (UpgradeModal):</strong> A full-screen animated modal showing Growth-specific content: current usage meters (funnels, leads), feature list, and a one-click upgrade button.
            </li>
          </ol>

          <h3 className="text-lg font-semibold mt-4 mb-2">Current Status</h3>
          <p className="text-sm leading-relaxed mb-4">
            The behavioral trigger in <code>SubscriptionContext.tsx</code> (line 153-157) is currently <strong>suspended</strong> — the <code>triggerUpgrade</code> function body is commented out. This was done during development to avoid constant modal popups. The <code>UpgradeBanner</code> and <code>UpgradeModal</code> components remain fully functional.
          </p>

          <h3 className="text-lg font-semibold mt-4 mb-2">How to Re-Activate</h3>
          <ol className="list-decimal list-inside text-sm space-y-2 mb-4">
            <li>
              <strong>Uncomment the trigger:</strong> In <code>src/contexts/SubscriptionContext.tsx</code>, uncomment lines 155-156 inside the <code>triggerUpgrade</code> callback to restore the modal-opening behavior.
            </li>
            <li>
              <strong>Connect Stripe first:</strong> Before re-enabling, ensure Stripe is connected so the "Upgrade" button actually processes a payment instead of performing a mock database update.
            </li>
            <li>
              <strong>Test suppression:</strong> The 10-minute suppression timer (<code>dismissedUntil</code>) prevents repeated popups after a user dismisses the modal. Verify this works correctly in production.
            </li>
          </ol>

          <h3 className="text-lg font-semibold mt-4 mb-2">Growth → Pro Upsell</h3>
          <p className="text-sm leading-relaxed mb-4">
            The same system also handles Growth → Pro upsells. When a Growth user exceeds 3 funnels or interacts with analytics 5+ times, the modal targets Pro ($59/mo) with relevant messaging about A/B testing, cohort analytics, and attribution.
          </p>
        </section>

        {/* SECTION 7 */}
        <section className="mb-10">
          <h2 className="text-xl font-bold mb-4">7. Security Measures</h2>

          <h3 className="text-lg font-semibold mt-4 mb-2">Already Implemented ✓</h3>
          <ul className="list-disc list-inside text-sm space-y-2 mb-4">
            <li><strong>Row Level Security (RLS):</strong> All tables have RLS policies enforcing ownership-based access. Authenticated users can only read/write their own data. Public funnel and market pages use anon-role policies restricted to "live" status records.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Roles are stored in a separate <code>user_roles</code> table (not on the profile). The <code>has_role()</code> function uses <code>SECURITY DEFINER</code> to prevent RLS recursion. Admin functions (<code>admin_list_users</code>, <code>admin_update_user</code>, <code>admin_delete_user</code>) check admin role server-side.</li>
            <li><strong>Authentication:</strong> Standard email/password auth with email verification required. No anonymous signups. Password reset flow is implemented.</li>
            <li><strong>HTTPS/SSL:</strong> Handled automatically by the hosting platform.</li>
            <li><strong>Protected Routes:</strong> All authenticated pages wrapped in <code>ProtectedRoute</code> component.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Recommended Before Production</h3>
          <ul className="list-disc list-inside text-sm space-y-2 mb-4">
            <li><strong>Rate Limiting on Public Endpoints:</strong> The lead capture form, OG meta functions, and public funnel pages should have rate limiting to prevent spam and abuse. This can be implemented at the edge function level using IP-based throttling or a service like Upstash.</li>
            <li><strong>Input Validation &amp; Sanitization:</strong> Ensure all user inputs (funnel forms, lead capture, NLP commands) are validated and sanitized server-side to prevent XSS and injection attacks.</li>
            <li><strong>CORS Configuration:</strong> Review edge function CORS headers. Currently set to allow all origins (<code>*</code>). In production, restrict to your custom domain.</li>
            <li><strong>API Key Rotation Policy:</strong> Establish a process for rotating Stripe, Resend, ElevenLabs, and MLS API keys periodically.</li>
            <li><strong>Webhook Signature Verification:</strong> The Stripe webhook handler must verify the <code>stripe-signature</code> header to prevent spoofed events.</li>
            <li><strong>Content Security Policy (CSP):</strong> Add CSP headers to prevent loading of unauthorized scripts or resources.</li>
            <li><strong>Credential Encryption:</strong> The <code>integration_connections</code> table stores CRM credentials as JSON. Consider encrypting these at rest using database-level encryption or Vault.</li>
            <li><strong>Audit Logging:</strong> Add logging for sensitive admin actions (user deletion, role changes) for compliance and debugging.</li>
            <li><strong>Session Management:</strong> Review session token expiry and refresh token handling. Ensure sessions expire after a reasonable period of inactivity.</li>
            <li><strong>GDPR / Data Deletion:</strong> Implement a "Delete My Data" flow for end users to comply with privacy regulations. Cascade deletes should remove all user-associated records.</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4 mb-2">Security Checklist Summary</h3>
          <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-3 py-2 font-semibold">Measure</th>
                <th className="text-left px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["RLS on all tables", "✓ Done"],
                ["RBAC via user_roles table", "✓ Done"],
                ["Email verification required", "✓ Done"],
                ["No anonymous signups", "✓ Done"],
                ["Protected routes (frontend)", "✓ Done"],
                ["HTTPS / SSL", "✓ Done"],
                ["Rate limiting", "⚠ Needed"],
                ["Input sanitization", "⚠ Needed"],
                ["CORS restriction", "⚠ Needed"],
                ["Stripe webhook verification", "⚠ Needed"],
                ["CSP headers", "⚠ Needed"],
                ["Credential encryption", "⚠ Recommended"],
                ["Audit logging", "⚠ Recommended"],
                ["GDPR data deletion", "⚠ Recommended"],
              ].map(([measure, status], i) => (
                <tr key={i} className={i % 2 === 0 ? "" : "bg-muted/30"}>
                  <td className="px-3 py-2">{measure}</td>
                  <td className="px-3 py-2">{status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* FOOTER */}
        <hr className="border-border my-8" />
        <p className="text-xs text-muted-foreground text-center">
          AgentOrion Production Readiness Report — Confidential — {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
};

export default ProductionReport;
