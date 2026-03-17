import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    sub: "Get started, no card required",
    features: ["1 Active Funnel", "5 Leads/Month", "Basic AI Content", "AgentOrion Dashboard", "Lead Management"],
    cta: "Start Free",
    highlighted: false,
    badge: null,
  },
  {
    name: "Growth",
    price: "$29",
    sub: "For agents ready to scale",
    features: ["Unlimited Funnels", "Unlimited Leads", "Full AI Content", "Ad Budget Slider", "CRM Integrations (Q3 2026)", "Team Access"],
    cta: "Start Growth — Free 30 Days",
    highlighted: false,
    badge: "30 Day Free Trial",
  },
  {
    name: "Pro",
    price: "$59",
    sub: "Billed monthly. Cancel anytime.",
    features: ["Everything in Growth", "Retargeting Audiences", "A/B Testing Controls", "Pro Analytics Dashboard", "ROI Confidence Panel", "Weekly Growth Summary", "Autonomous Engagement", "Priority Support"],
    cta: "Start Pro Free",
    highlighted: true,
    badge: "Most Popular",
  },
];

type CellValue = string | boolean;

const comparisonRows: { feature: string; free: CellValue; growth: CellValue; pro: CellValue }[] = [
  { feature: "Active Funnels", free: "1", growth: "Unlimited", pro: "Unlimited" },
  { feature: "Leads Per Month", free: "5", growth: "Unlimited", pro: "Unlimited" },
  { feature: "AI Content Generation", free: "Basic", growth: "Full", pro: "Full" },
  { feature: "Ad Platform Connections", free: true, growth: true, pro: true },
  { feature: "Ad Budget Slider", free: false, growth: true, pro: true },
  { feature: "CRM Integration (Q3 2026)", free: false, growth: true, pro: true },
  { feature: "MLS Data Sync", free: false, growth: true, pro: true },
  { feature: "Calendar Integration", free: true, growth: true, pro: true },
  { feature: "SMS Follow-Up", free: false, growth: true, pro: true },
  { feature: "Retargeting Audiences", free: false, growth: false, pro: true },
  { feature: "A/B Testing Controls", free: false, growth: false, pro: true },
  { feature: "Pro Analytics Dashboard", free: false, growth: false, pro: true },
  { feature: "ROI Confidence Panel", free: false, growth: false, pro: true },
  { feature: "Weekly Growth Summary", free: false, growth: false, pro: true },
  { feature: "Autonomous Engagement", free: false, growth: false, pro: true },
  { feature: "Zapier Integration", free: false, growth: false, pro: true },
  { feature: "Team Member Access", free: false, growth: "3 seats", pro: "Unlimited" },
  { feature: "Priority Support", free: false, growth: false, pro: true },
];

const CellContent = ({ value }: { value: CellValue }) => {
  if (value === true) return <Check size={16} className="text-signal-green mx-auto" />;
  if (value === false) return <span className="text-text-disabled">—</span>;
  return <span className="text-text-primary text-sm font-inter">{value}</span>;
};

const PricingSection = () => {
  const [showTable, setShowTable] = useState(false);

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-bg-base overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
            Simple Pricing. Serious Results.
          </h2>
          <p className="text-text-secondary text-lg">Start free. Upgrade when your pipeline demands it.</p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative rounded-2xl p-7 sm:p-8 border ${
                t.highlighted
                  ? "bg-bg-elevated border-border-brand scale-[1.02] lg:scale-105"
                  : "bg-bg-surface border-border-subtle"
              }`}
              style={{
                boxShadow: t.highlighted ? "var(--shadow-brand), 0 0 40px rgba(45,107,228,0.15)" : "var(--shadow-card)",
                transition: "background-color 350ms ease, border-color 350ms ease, box-shadow 350ms ease",
              }}
            >
              {t.badge && (
                <div
                  className="absolute -top-3 right-6 px-3 py-1 rounded-full text-white text-xs font-bold"
                  style={{ background: t.highlighted ? "var(--gradient-brand)" : "var(--color-orion-blue)" }}
                >
                  {t.badge}
                </div>
              )}
              <div className="mb-6">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                  t.highlighted ? "text-white bg-orion-blue/20 border border-orion-blue/40" : "bg-border-subtle text-text-secondary"
                }`} style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
                  {t.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-satoshi font-bold text-4xl sm:text-5xl text-text-primary">{t.price}</span>
                  <span className="text-text-tertiary text-sm">/mo</span>
                </div>
                <p className="text-text-tertiary text-sm mt-1">{t.sub}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-text-secondary">
                    <Check size={15} className={`mt-0.5 shrink-0 ${t.highlighted ? "text-orion-blue" : "text-signal-green"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="/auth"
                className={`block text-center py-3 rounded-xl text-sm font-bold font-satoshi transition-all ${
                  t.highlighted
                    ? "bg-orion-blue text-white glow-orion hover:scale-[1.02]"
                    : "border border-border-subtle text-text-primary hover:border-border-brand/50"
                }`}
                style={{ transition: "all 350ms ease" }}
              >
                {t.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Microcopy */}
        <p className="text-center text-text-tertiary text-sm font-inter mt-8">
          Not sure which plan? Start Free — upgrade when you're ready. No pressure, ever.
        </p>

        {/* Compare toggle */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setShowTable(!showTable)}
            className="inline-flex items-center gap-1.5 text-orion-blue font-inter font-bold text-sm hover:underline transition-colors"
          >
            Compare all features
            <motion.span animate={{ rotate: showTable ? 180 : 0 }} transition={{ duration: 0.3 }}>
              <ChevronDown size={16} />
            </motion.span>
          </button>
        </div>

        {/* Comparison table */}
        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden flex justify-center"
            >
              <div className="mt-8 w-full max-w-[860px] bg-bg-surface border border-border-subtle rounded-xl overflow-hidden" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
                {/* Header */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr] bg-bg-subtle px-4 sm:px-6 py-3" style={{ transition: "background-color 350ms ease" }}>
                  <span className="text-text-secondary text-[13px] font-bold font-inter">Feature</span>
                  <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Free</span>
                  <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Growth</span>
                  <span className="text-orion-blue text-[13px] font-bold font-inter text-center">Pro</span>
                </div>
                {/* Rows */}
                {comparisonRows.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`grid grid-cols-[2fr_1fr_1fr_1fr] px-4 sm:px-6 items-center min-h-[48px] ${
                      i % 2 === 0 ? "bg-bg-surface" : "bg-bg-subtle"
                    }`}
                    style={{ transition: "background-color 350ms ease" }}
                  >
                    <span className="text-text-primary text-sm font-inter py-3">{row.feature}</span>
                    <div className="text-center py-3"><CellContent value={row.free} /></div>
                    <div className="text-center py-3"><CellContent value={row.growth} /></div>
                    <div className="text-center py-3"><CellContent value={row.pro} /></div>
                  </div>
                ))}
                {/* Bottom CTA */}
                <div className="bg-bg-base px-4 sm:px-6 py-4 text-center" style={{ transition: "background-color 350ms ease" }}>
                  <span className="text-text-secondary text-sm font-inter">Ready to get started? </span>
                  <button onClick={scrollToPricing} className="text-orion-blue text-sm font-inter font-bold hover:underline">
                    Choose your plan ↑
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Trust bar */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10">
          <span className="text-text-muted text-[13px] font-inter flex items-center gap-1.5">
            <span className="text-text-tertiary">🔒</span> No contracts — cancel anytime
          </span>
          <span className="text-text-muted text-[13px] font-inter flex items-center gap-1.5">
            <Check size={14} className="text-text-tertiary" /> 30-day free trial on Growth plan
          </span>
          <span className="text-text-muted text-[13px] font-inter flex items-center gap-1.5">
            <span className="text-text-tertiary">⚡</span> Setup in under 10 minutes
          </span>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
