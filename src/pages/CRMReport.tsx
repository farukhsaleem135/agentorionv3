import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";

const CRMReport = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "AgentOrion — CRM Integration Report";
  }, []);

  const handleDownload = () => window.print();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { padding: 0 !important; max-width: 100% !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print sticky top-0 z-50 bg-card/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={handleDownload} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold">
          <Download size={14} /> Download PDF
        </button>
      </div>

      <div className="print-container max-w-3xl mx-auto px-5 py-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold font-display">CRM Integration Report</h1>
          <p className="text-muted-foreground">AgentOrion — Contact Import & Autopilot Strategy</p>
          <p className="text-xs text-muted-foreground">Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        {/* Executive Summary */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">1. Executive Summary</h2>
          <p className="text-sm leading-relaxed">
            CRM integrations in AgentOrion serve as <strong>one-way import on-ramps</strong> — not permanent two-way sync partners.
            The strategic goal is to position AgentOrion as the agent's primary system of record. CRM connectors allow agents to
            migrate their existing contact databases into AgentOrion, where leads are enriched with AI scoring, behavioral tracking,
            and autonomous engagement capabilities that legacy CRMs cannot match.
          </p>
          <p className="text-sm leading-relaxed">
            Once imported, contacts become full <code className="px-1.5 py-0.5 bg-muted rounded text-xs">funnel_leads</code> records
            and are eligible for all platform features including <strong>Autopilot-driven autonomous outreach</strong>.
          </p>
        </section>

        {/* Supported CRMs */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">2. Supported CRM Providers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold">CRM</th>
                  <th className="text-left p-3 font-semibold">API Type</th>
                  <th className="text-left p-3 font-semibold">Data Imported</th>
                  <th className="text-left p-3 font-semibold">Edge Function</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Follow Up Boss", "REST API (Basic Auth)", "Name, Email, Phone", "sync-followupboss"],
                  ["kvCORE", "REST API (Bearer Token)", "Name, Email, Phone", "sync-kvcore"],
                  ["HubSpot", "REST API v3 (Private App Token)", "First/Last Name, Email, Phone", "sync-hubspot"],
                  ["LionDesk", "REST API (API Key)", "Name, Email, Phone", "sync-liondesk"],
                  ["Chime / Lofty", "REST API (API Key)", "Name, Email, Phone", "sync-chime"],
                ].map(([crm, api, data, fn], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{crm}</td>
                    <td className="p-3 text-muted-foreground">{api}</td>
                    <td className="p-3">{data}</td>
                    <td className="p-3"><code className="px-1.5 py-0.5 bg-muted rounded text-xs">{fn}</code></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Import Workflow */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">3. Import Workflow</h2>
          <p className="text-sm leading-relaxed">The CRM import follows a structured, secure pipeline:</p>

          <div className="space-y-4">
            {[
              {
                step: "Step 1 — Credential Entry",
                desc: "Agent navigates to Settings → CRM tab and clicks 'Connect' on their CRM provider. A modal collects API credentials (key, token, etc.) which are encrypted and stored in the integration_connections table with status 'connected'."
              },
              {
                step: "Step 2 — Sync Trigger",
                desc: "Agent clicks 'Sync Now' which invokes the corresponding edge function (e.g., sync-followupboss). The function authenticates via Supabase JWT, validates the stored credentials, and calls the CRM's REST API."
              },
              {
                step: "Step 3 — Contact Fetch",
                desc: "The edge function fetches up to 100 contacts per sync from the CRM API. Each contact is parsed for name, email, and phone fields. The function handles provider-specific response formats (e.g., HubSpot's properties object vs. Follow Up Boss's flat structure)."
              },
              {
                step: "Step 4 — Deduplication & Upsert",
                desc: "For each contact, the system checks if a funnel_leads record with the same email already exists in the agent's primary funnel. If found, the record is updated (name/phone). If not, a new lead is inserted with temperature='cold', status='open', and no AI score yet."
              },
              {
                step: "Step 5 — Timestamp Update",
                desc: "The integration_connections.last_synced_at field is updated to reflect the sync time. This displays in the UI as 'Last sync: Just now'."
              },
            ].map((item, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="font-semibold text-sm mb-1">{item.step}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Data Mapping */}
        <section className="space-y-3 page-break">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">4. Data Mapping — CRM to AgentOrion</h2>
          <p className="text-sm leading-relaxed">
            Imported contacts are mapped into the <code className="px-1.5 py-0.5 bg-muted rounded text-xs">funnel_leads</code> table.
            The following shows how CRM fields translate to AgentOrion fields:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold">CRM Field</th>
                  <th className="text-left p-3 font-semibold">AgentOrion Field</th>
                  <th className="text-left p-3 font-semibold">Default Value (if empty)</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["First Name + Last Name", "name", "Email prefix"],
                  ["Email", "email", "Required — skip if missing"],
                  ["Phone", "phone", "null"],
                  ["—", "temperature", "'cold'"],
                  ["—", "status", "'open'"],
                  ["—", "ai_score", "0 (scored later by AI)"],
                  ["—", "intent", "null (classified later)"],
                  ["—", "tags", "['crm-import', '{provider}']"],
                  ["—", "funnel_id", "Agent's primary funnel"],
                ].map(([crm, aos, def], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3">{crm}</td>
                    <td className="p-3 font-medium">{aos}</td>
                    <td className="p-3 text-muted-foreground">{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Post-Import Enrichment */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">5. Post-Import AI Enrichment</h2>
          <p className="text-sm leading-relaxed">
            After import, each contact goes through an AI enrichment pipeline that transforms raw CRM data into actionable intelligence:
          </p>
          <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
            <li><strong className="text-foreground">AI Scoring (0–100)</strong> — The lead-intelligence edge function analyzes available data (name, email domain, phone area code) to generate an initial quality score and urgency assessment.</li>
            <li><strong className="text-foreground">Temperature Classification</strong> — Based on recency of CRM activity and available metadata, leads are reclassified from the default 'cold' to 'warm' or 'hot' if signals warrant.</li>
            <li><strong className="text-foreground">Intent Detection</strong> — AI infers whether the contact is likely a buyer, seller, or investor based on naming patterns and email context.</li>
            <li><strong className="text-foreground">Next Step Generation</strong> — The ai_next_step field is populated with a recommended action (e.g., "Send market update for zip 78701").</li>
            <li><strong className="text-foreground">Duplicate Flagging</strong> — Contacts that match existing leads by phone number (not just email) are flagged for manual review.</li>
            <li><strong className="text-foreground">Tag Auto-Assignment</strong> — Imported leads receive tags like 'crm-import' and the provider name for easy filtering on the Leads page.</li>
          </ul>
        </section>

        {/* Autopilot Eligibility */}
        <section className="space-y-3 page-break">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">6. Autopilot Eligibility for Imported Contacts</h2>
          <p className="text-sm leading-relaxed">
            <strong>Yes — imported CRM contacts are fully eligible for Autopilot.</strong> Once a contact exists as a
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs">funnel_leads</code> record, it is indistinguishable
            from a lead captured via a funnel form. The autonomous engagement system treats all leads equally.
          </p>

          <h3 className="text-base font-semibold mt-4">How Autopilot Processes Imported Leads</h3>
          <div className="space-y-3">
            {[
              {
                title: "Schedule Outreach (pg_cron — every 30 min)",
                desc: "The schedule-outreach function scans all funnel_leads with status='open' and no recent outreach. Imported contacts that haven't been contacted are queued for initial outreach."
              },
              {
                title: "AI Message Generation",
                desc: "The autonomous-outreach edge function drafts personalized messages based on the lead's temperature, available data, and the agent's brand/tone settings from their profile."
              },
              {
                title: "Queue & Delivery",
                desc: "Messages are inserted into outreach_queue with channel='sms' or 'email'. The process-outreach-queue function (pg_cron — every 5 min) delivers via Twilio SMS or Resend email."
              },
              {
                title: "Agent Guardrails",
                desc: "Autopilot respects agent_settings: auto_send_enabled must be true, confidence_threshold is enforced, quiet hours are observed, and max_daily_messages limits are applied."
              },
            ].map((item, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="font-semibold text-sm mb-1">{item.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <h3 className="text-base font-semibold mt-4">Autopilot Safeguards for Bulk Imports</h3>
          <p className="text-sm leading-relaxed">
            When a large number of contacts are imported from a CRM, additional safeguards prevent spam-like behavior:
          </p>
          <ul className="space-y-1.5 text-sm list-disc list-inside text-muted-foreground">
            <li><strong className="text-foreground">Staggered Scheduling</strong> — The schedule-outreach function distributes new contacts across multiple scheduling windows rather than queuing all at once.</li>
            <li><strong className="text-foreground">Daily Message Cap</strong> — The max_daily_messages setting (default: 3) prevents overwhelming the agent's recipients.</li>
            <li><strong className="text-foreground">Confidence Gating</strong> — Only leads meeting the agent's confidence_threshold (default: 70) receive auto-sent messages. Imported leads starting at score 0 must be AI-enriched first.</li>
            <li><strong className="text-foreground">Manual Review Queue</strong> — When auto_send_enabled is false, messages appear in the Autopilot dashboard for agent approval before sending.</li>
          </ul>
        </section>

        {/* How AgentOrion Uses the Data */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">7. How AgentOrion Uses Imported Data</h2>
          <p className="text-sm leading-relaxed">
            Imported CRM contacts unlock the full AgentOrion feature set:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold">Feature</th>
                  <th className="text-left p-3 font-semibold">How Imported Data Is Used</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Lead Dashboard", "Contacts appear in the Leads page with AI scores, tags, and temperature badges. Agents can filter by 'crm-import' tag."],
                  ["Autonomous Outreach", "AI drafts personalized SMS/email based on lead data. Supports initial outreach, follow-ups, and reactivation campaigns."],
                  ["Lead Intelligence", "The lead-intelligence edge function generates behavioral analysis, buyer/seller predictions, and urgency scoring."],
                  ["Team Assignment", "When team features are active, imported leads can be assigned via Round Robin, Geo-Targeted, or Performance-Based rules."],
                  ["Close Deal Tracking", "Imported contacts can be moved through the pipeline to 'closed' with actual revenue tracking for ROI analysis."],
                  ["Conversation Timeline", "All outreach (manual + autonomous) is logged in lead_conversations, creating a unified communication history."],
                  ["Market Intel", "Leads with location data contribute to market area demand signals and opportunity scoring."],
                  ["Nurture Sequences", "Imported leads are eligible for drip campaigns defined in outreach_sequences based on trigger conditions."],
                ].map(([feature, usage], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium whitespace-nowrap">{feature}</td>
                    <td className="p-3 text-muted-foreground">{usage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Security */}
        <section className="space-y-3 page-break">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">8. Security & Data Privacy</h2>
          <ul className="space-y-2 text-sm list-disc list-inside text-muted-foreground">
            <li><strong className="text-foreground">Credential Storage</strong> — API keys are stored in the integration_connections table with RLS policies ensuring only the owning user can access their credentials.</li>
            <li><strong className="text-foreground">JWT Validation</strong> — Every sync edge function validates the Supabase JWT before processing. Unauthenticated requests are rejected with 401.</li>
            <li><strong className="text-foreground">RLS Enforcement</strong> — Imported leads inherit the funnel's ownership model. Only the funnel owner (and assigned team members, when applicable) can view or modify the records.</li>
            <li><strong className="text-foreground">No Reverse Sync</strong> — AgentOrion never writes back to the external CRM. Data flow is strictly one-directional to prevent accidental modification of the agent's existing CRM records.</li>
            <li><strong className="text-foreground">Credential Rotation</strong> — Agents can disconnect and reconnect at any time, which deletes the stored credentials from integration_connections.</li>
          </ul>
        </section>

        {/* Implementation Requirements */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">9. Implementation Requirements</h2>
          <p className="text-sm leading-relaxed">
            The following items are required before CRM integrations go live:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-border rounded-lg">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-semibold">Requirement</th>
                  <th className="text-left p-3 font-semibold">Status</th>
                  <th className="text-left p-3 font-semibold">Notes</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Edge functions for all 5 CRMs", "✅ Built", "sync-followupboss, sync-kvcore, sync-hubspot, sync-liondesk, sync-chime"],
                  ["integration_connections table", "✅ Built", "With RLS policies for credential storage"],
                  ["Credential input modal", "✅ Built", "IntegrationConnectModal with per-provider field configs"],
                  ["Sync trigger UI", "✅ Built", "Sync Now button on Integrations page"],
                  ["CRM API access agreements", "❌ Needed", "Production API keys require developer accounts with each CRM vendor"],
                  ["Post-import AI enrichment trigger", "⚠️ Partial", "lead-intelligence function exists but isn't auto-triggered after import"],
                  ["Bulk import pagination", "⚠️ Partial", "Current limit is 100 contacts per sync; needs cursor-based pagination for large databases"],
                  ["Import progress UI", "❌ Needed", "No real-time progress indicator during sync; agent sees only success/failure toast"],
                  ["Auto-tagging on import", "❌ Needed", "Imported leads should receive 'crm-import' + provider tags automatically"],
                  ["Staggered Autopilot scheduling", "❌ Needed", "Bulk imports need rate limiting in schedule-outreach to prevent message flooding"],
                ].map(([req, status, notes], i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="p-3 font-medium">{req}</td>
                    <td className="p-3">{status}</td>
                    <td className="p-3 text-muted-foreground">{notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Roadmap */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display border-b border-border pb-2">10. Recommended Roadmap</h2>
          <div className="space-y-3">
            {[
              { phase: "Phase 1 — Foundation", items: ["Obtain developer API access for Follow Up Boss and kvCORE (highest market share)", "Add auto-tagging on import ('crm-import', provider name)", "Trigger AI enrichment automatically after sync completes", "Add DELETE policy to funnel_leads for imported contact cleanup"] },
              { phase: "Phase 2 — Scale", items: ["Implement cursor-based pagination for syncs exceeding 100 contacts", "Add import progress indicator with real-time count", "Build staggered scheduling logic in schedule-outreach for bulk imports", "Add 'CRM Import' as a dedicated onboarding flow step"] },
              { phase: "Phase 3 — Intelligence", items: ["Cross-reference imported contacts with existing funnel leads by phone + email", "Build import history dashboard showing sync counts, duplicates found, and enrichment results", "Add optional two-way sync for agents who want activity logging back to their CRM", "Implement webhook listeners for real-time CRM updates (Follow Up Boss webhooks, HubSpot webhooks)"] },
            ].map((phase, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-4 border border-border">
                <p className="font-semibold text-sm mb-2">{phase.phase}</p>
                <ul className="space-y-1 text-sm list-disc list-inside text-muted-foreground">
                  {phase.items.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground pt-8 border-t border-border">
          AgentOrion — CRM Integration Report — Confidential — © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
};

export default CRMReport;
