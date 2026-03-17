import { motion } from "framer-motion";
import { Users, Target, MessageCircle, Calendar, Info, ArrowRight } from "lucide-react";
import StarField from "./StarField";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

interface Integration {
  name: string;
  chip: string;
  chipColor: "gold" | "green" | "blue";
  note?: string;
}

const chipStyles = {
  gold: "border-pulse-gold text-pulse-gold",
  green: "border-signal-green text-signal-green",
  blue: "border-orion-blue text-orion-blue",
};

const chipBg = {
  gold: "var(--color-pulse-gold-bg)",
  green: "var(--color-signal-green-bg)",
  blue: "rgba(45,107,228,0.1)",
};

const IntegrationRow = ({ item }: { item: Integration }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-border-subtle last:border-b-0">
    <div className="flex-1">
      <span className="text-text-disabled font-bold text-[13px] font-inter">{item.name}</span>
      {item.note && <p className="text-text-muted text-[12px] font-inter mt-0.5">{item.note}</p>}
    </div>
    <span className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold font-inter shrink-0 ${chipStyles[item.chipColor]}`} style={{ backgroundColor: chipBg[item.chipColor] }}>
      {item.chip}
    </span>
  </div>
);

const StatusBadge = ({ label, color }: { label: string; color: "gold" | "green" | "blue" }) => (
  <span className={`inline-flex px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-inter ${chipStyles[color]}`} style={{ backgroundColor: chipBg[color] }}>
    {label}
  </span>
);

const crmIntegrations: Integration[] = [
  { name: "Follow Up Boss", chip: "Q3 2026", chipColor: "gold" },
  { name: "kvCORE", chip: "Q3 2026", chipColor: "gold" },
  { name: "HubSpot", chip: "Q4 2026", chipColor: "gold" },
  { name: "LionDesk", chip: "Q4 2026", chipColor: "gold" },
  { name: "Chime", chip: "Q4 2026", chipColor: "gold" },
  { name: "Prolinc", chip: "Q4 2026", chipColor: "gold" },
];

const adIntegrations: Integration[] = [
  { name: "Google Ads", chip: "Live", chipColor: "green" },
  { name: "Meta / Facebook Ads", chip: "Live", chipColor: "green" },
  { name: "TikTok Ads", chip: "Live", chipColor: "green" },
  { name: "YouTube Ads", chip: "Live", chipColor: "green" },
];

const commIntegrations: Integration[] = [
  { name: "SMS Follow-Up", chip: "Included", chipColor: "green", note: "Automated SMS sent to every new lead — no account setup required" },
  { name: "Email Sequences", chip: "Included", chipColor: "green", note: "Nurture emails delivered automatically — ready the moment you publish" },
  { name: "AI Voice Follow-Up", chip: "Included", chipColor: "green", note: "AI voice calls your leads within minutes of capture — zero configuration" },
];

const calendarIntegrations: Integration[] = [
  { name: "Google Calendar", chip: "Live", chipColor: "green" },
  { name: "Outlook Calendar", chip: "Live", chipColor: "green" },
];

const scrollToWaitlist = () => {
  const el = document.querySelector("#waitlist");
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const IntegrationsSection = () => (
  <section id="integrations" className="relative py-24 sm:py-32 bg-bg-subtle overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
    <StarField count={60} />
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div {...fadeUp} className="text-center mb-16">
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
          Connect AgentOrion To Your World
        </h2>
        <p className="text-text-secondary text-lg max-w-[580px] mx-auto">
          AgentOrion works alongside the tools agents already use — and replaces the ones they shouldn't have to pay for separately.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {/* Card 1: CRM */}
        <motion.div {...fadeUp} transition={{ delay: 0 }} className="bg-bg-surface border border-border-subtle rounded-2xl p-7 hover:border-border-brand hover:-translate-y-[3px] transition-all duration-300" style={{ transition: "background-color 350ms ease, border-color 300ms ease, transform 300ms ease" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Users size={24} className="text-orion-blue" />
              <span className="font-inter font-bold text-base text-text-primary">CRM Integrations</span>
            </div>
            <StatusBadge label="Coming Q3 2026" color="gold" />
          </div>
          <p className="text-text-tertiary text-sm font-inter mt-2 mb-4">
            Sync AgentOrion leads, scores, and AI insights directly into your existing CRM — no manual data entry, no missed follow-ups.
          </p>
          <div className="mb-4">
            {crmIntegrations.map((item) => (
              <IntegrationRow key={item.name} item={item} />
            ))}
          </div>
          <button onClick={scrollToWaitlist} className="inline-flex items-center gap-1.5 text-orion-blue text-sm font-inter font-medium hover:underline">
            Join the CRM waitlist → get notified first <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Card 2: Ad Platforms */}
        <motion.div {...fadeUp} transition={{ delay: 0.1 }} className="bg-bg-surface border border-border-subtle rounded-2xl p-7 hover:border-border-brand hover:-translate-y-[3px] transition-all duration-300" style={{ transition: "background-color 350ms ease, border-color 300ms ease, transform 300ms ease" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Target size={24} className="text-signal-green" />
              <span className="font-inter font-bold text-base text-text-primary">Ad Platforms</span>
            </div>
            <StatusBadge label="Live Now" color="green" />
          </div>
          <p className="text-text-tertiary text-sm font-inter mt-2 mb-4">
            Launch and manage Google, Meta, TikTok, and YouTube ad campaigns directly from your AgentOrion dashboard — no agency required.
          </p>
          <div className="mb-4">
            {adIntegrations.map((item) => (
              <IntegrationRow key={item.name} item={item} />
            ))}
          </div>
          <p className="text-text-muted text-[13px] font-inter">
            Ad platform connections use your own ad account credentials. AgentOrion never holds your billing information.
          </p>
        </motion.div>

        {/* NO-SETUP CALLOUT — addresses the #1 objection before it forms */}
        <div
          className="w-full rounded-xl px-6 py-4 mb-6 flex items-center gap-3 lg:col-span-2"
          style={{
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-signal-green)',
          }}
        >
          <span className="text-lg">✦</span>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            SMS, email, and AI voice are{' '}
            <span style={{ color: 'var(--color-signal-green)', fontWeight: 700 }}>
              fully included
            </span>
            {' '}— no Twilio account, no Resend account, no ElevenLabs account.
            AgentOrion handles everything.
          </p>
        </div>

        {/* Card 3: Communication */}
        <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="bg-bg-surface border border-border-subtle rounded-2xl p-7 hover:border-border-brand hover:-translate-y-[3px] transition-all duration-300" style={{ transition: "background-color 350ms ease, border-color 300ms ease, transform 300ms ease" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <MessageCircle size={24} className="text-nebula-purple" />
              <span className="font-inter font-bold text-base text-text-primary">Communication</span>
            </div>
            <StatusBadge label="Live Now" color="green" />
          </div>
          <p className="text-text-tertiary text-sm font-inter mt-2 mb-4">
            Reach every lead by SMS, email, and AI voice — automatically, within minutes of capture. AgentOrion's outreach engine is fully built in. No vendor accounts, no API keys, no configuration. Flip the switch and it works.
          </p>
          <div className="mb-4">
            {commIntegrations.map((item) => (
              <IntegrationRow key={item.name} item={item} />
            ))}
          </div>
          <p className="text-text-muted text-[13px] font-inter italic">
            All communication channels are fully managed by AgentOrion — no external accounts or API keys needed.
          </p>
        </motion.div>

        {/* Card 4: Calendar, Scheduling & MLS */}
        <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="bg-bg-surface border border-border-subtle rounded-2xl p-7 hover:border-border-brand hover:-translate-y-[3px] transition-all duration-300" style={{ transition: "background-color 350ms ease, border-color 300ms ease, transform 300ms ease" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Calendar size={24} className="text-pulse-gold" />
              <span className="font-inter font-bold text-base text-text-primary">Calendar, Scheduling & MLS</span>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge label="Live Now" color="green" />
              <StatusBadge label="Available" color="blue" />
            </div>
          </div>
          <p className="text-text-tertiary text-sm font-inter mt-2 mb-4">
            Sync your calendar for automated tour scheduling, and connect your MLS to pull live listing data, days on market, and property details directly into your dashboard.
          </p>
          <div className="mb-3">
            {calendarIntegrations.map((item) => (
              <IntegrationRow key={item.name} item={item} />
            ))}
          </div>
          <div className="flex items-center gap-2 py-2 mb-3">
            <div className="flex-1 h-px bg-border-subtle" />
            <span className="text-text-muted text-[11px] font-inter">MLS Data</span>
            <div className="flex-1 h-px bg-border-subtle" />
          </div>
          <IntegrationRow item={{ name: "MLS Data Sync", chip: "Available", chipColor: "blue" }} />

          <div className="mt-4 rounded-r-lg p-3 sm:p-4" style={{ backgroundColor: "rgba(45,107,228,0.06)", borderLeft: "3px solid var(--color-orion-blue)" }}>
            <div className="flex items-start gap-2">
              <Info size={14} className="text-orion-blue mt-0.5 shrink-0" />
              <div>
                <span className="text-text-primary text-[13px] font-bold font-inter">How MLS connection works: </span>
                <span className="text-text-secondary text-[13px] font-inter">
                  Your MLS board provides API credentials through your member portal. AgentOrion uses these credentials to sync your active listings and market data — we never store your MLS login. Setup instructions are provided inside the app during onboarding.
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Zapier bridge */}
      <motion.div {...fadeUp} className="flex justify-center mb-10">
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 sm:p-8 max-w-[680px] w-full flex flex-col sm:flex-row items-center sm:items-start gap-5" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
          <span className="text-[#FF4A00] font-inter font-bold text-[32px] leading-none shrink-0">Z</span>
          <div>
            <h3 className="font-inter font-bold text-lg text-text-primary mb-1">Connect 8,000+ More Apps via Zapier</h3>
            <p className="text-text-secondary text-sm font-inter mb-3">
              Pro plan includes Zapier connectivity — link AgentOrion to virtually any tool in your workflow without writing a single line of code.
            </p>
            <span className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold" style={{ background: "var(--gradient-brand)" }}>
              Pro Feature
            </span>
          </div>
        </div>
      </motion.div>

      {/* CRM Waitlist CTA */}
      <motion.div {...fadeUp} className="flex justify-center mb-10">
        <button
          onClick={scrollToWaitlist}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border-default text-text-secondary font-medium text-sm hover:border-border-brand hover:text-text-primary hover:bg-bg-elevated transition-all"
          style={{ transition: "all 350ms ease" }}
        >
          Join The CRM Integration Waitlist →
        </button>
      </motion.div>

      {/* Legal disclaimer */}
      <p className="text-text-disabled text-[12px] font-inter text-center max-w-[700px] mx-auto leading-relaxed">
        SMS, email, and AI voice follow-up are included features of AgentOrion. Message and data rates may apply for SMS delivery. AI voice calls are subject to applicable telecommunications regulations in your jurisdiction. AgentOrion manages all third-party service relationships on your behalf. AgentOrion is not affiliated with, endorsed by, or in official partnership with Follow Up Boss, kvCORE, HubSpot, LionDesk, Chime, Prolinc, Google, Meta, TikTok, YouTube, or Zapier. All product names and logos are trademarks of their respective owners. CRM integration timelines are targets and subject to change.
      </p>
    </div>
  </section>
);

export default IntegrationsSection;
