import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Building2 } from "lucide-react";

const tiers = [
  {
    name: "Free",
    price: "$0",
    badge: "Get Started",
    target: "Try AgentOrion with no commitment",
    description: "Perfect for agents who want to explore AgentOrion before committing.",
    features: ["1 active funnel", "Basic lead capture", "Community access"],
    cta: "Get Started Free",
    highlighted: false,
    badgeStyle: "default" as const,
  },
  {
    name: "Launch Plan",
    price: "$29",
    badge: "Most Popular — New Agents",
    target: "For agents in their first 1–3 years",
    description: "Everything you need to get through the Commission Desert and into your first five closings — including the complete 30 Day Launch Program and Social Media Mastery Guide.",
    features: ["Unlimited funnels", "30 Day Launch Program", "Social Media Mastery Guide", "AI lead generation", "Autopilot Lead Follow-Up", "Market Intelligence", "30-day free trial"],
    cta: "Start My 30 Day Launch — Free",
    highlighted: true,
    badgeStyle: "brand" as const,
  },
  {
    name: "Pro",
    price: "$59",
    badge: "Best for Experienced Agents",
    target: "For established agents who want maximum AI power",
    description: "The complete AgentOrion suite for experienced agents who are serious about building a consistent, automated lead generation machine.",
    features: ["Everything in Launch Plan", "Downloadable performance reports", "Advanced AI features", "Priority support", "Custom branding on funnels"],
    cta: "Start Free Trial",
    highlighted: false,
    badgeStyle: "accent" as const,
  },
  {
    name: "Team",
    price: "$149",
    badge: "For Growing Teams",
    target: "For agent teams of 2–5 members",
    description: "Give your entire team the AI-powered lead generation and content tools they need — managed from a single dashboard.",
    features: ["Everything in Pro for up to 5 agents", "Shared lead pipeline", "Team performance dashboard", "Team content library", "Consolidated billing"],
    cta: "Start Team Trial",
    highlighted: false,
    badgeStyle: "default" as const,
  },
  {
    name: "Brokerage",
    price: "$399",
    badge: "Enterprise",
    target: "For brokerages and large teams",
    description: "Deploy AgentOrion across your entire brokerage. Give every agent the tools they need to generate leads from day one — and retain them longer because they make money faster.",
    features: ["Everything in Team for unlimited agents", "Brokerage branding & customization", "Agent onboarding program", "Dedicated account manager", "Volume pricing available", "Custom MLS integration support"],
    cta: "Contact Us",
    highlighted: false,
    badgeStyle: "default" as const,
  },
];

type CellValue = string | boolean;

const comparisonRows: { feature: string; free: CellValue; launch: CellValue; pro: CellValue; team: CellValue; brokerage: CellValue }[] = [
  { feature: "Active Funnels", free: "1", launch: "Unlimited", pro: "Unlimited", team: "Unlimited", brokerage: "Unlimited" },
  { feature: "Leads Per Month", free: "5", launch: "Unlimited", pro: "Unlimited", team: "Unlimited", brokerage: "Unlimited" },
  { feature: "30 Day Launch Program", free: false, launch: true, pro: true, team: true, brokerage: true },
  { feature: "Social Media Mastery Guide", free: false, launch: true, pro: true, team: true, brokerage: true },
  { feature: "AI Content Generation", free: "Basic", launch: "Full", pro: "Full", team: "Full", brokerage: "Full" },
  { feature: "Autopilot Follow-Up", free: false, launch: true, pro: true, team: true, brokerage: true },
  { feature: "Market Intelligence", free: false, launch: true, pro: true, team: true, brokerage: true },
  { feature: "Downloadable Reports", free: false, launch: false, pro: true, team: true, brokerage: true },
  { feature: "Advanced AI Features", free: false, launch: false, pro: true, team: true, brokerage: true },
  { feature: "Custom Branding", free: false, launch: false, pro: true, team: true, brokerage: true },
  { feature: "Team Members", free: "—", launch: "1", pro: "1", team: "Up to 5", brokerage: "Unlimited" },
  { feature: "Shared Pipeline", free: false, launch: false, pro: false, team: true, brokerage: true },
  { feature: "Team Dashboard", free: false, launch: false, pro: false, team: true, brokerage: true },
  { feature: "Brokerage Branding", free: false, launch: false, pro: false, team: false, brokerage: true },
  { feature: "Dedicated Account Manager", free: false, launch: false, pro: false, team: false, brokerage: true },
  { feature: "Priority Support", free: false, launch: false, pro: true, team: true, brokerage: true },
];

const CellContent = ({ value }: { value: CellValue }) => {
  if (value === true) return <Check size={16} className="text-signal-green mx-auto" />;
  if (value === false) return <span className="text-text-disabled">—</span>;
  return <span className="text-text-primary text-sm font-inter">{value}</span>;
};

const PricingSection = () => {
  const [showTable, setShowTable] = useState(false);
  const navigate = useNavigate();

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  const handlePlanClick = (tierName: string) => {
    // Map tier names to plan IDs
    const planMap: Record<string, string> = {
      "Free": "",
      "Launch Plan": "growth",
      "Pro": "pro",
      "Team": "team",
      "Brokerage": "brokerage",
    };
    const plan = planMap[tierName];
    if (!plan) {
      navigate("/auth");
      return;
    }
    // Navigate to auth with plan intent
    navigate(`/auth?plan=${plan}`);
  };

  return (
    <section id="pricing" className="relative py-24 sm:py-32 bg-bg-base overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
            One Platform. Every Stage of Your Real Estate Career.
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Start free for 30 days. Upgrade as your business grows. No contracts. Cancel anytime.
          </p>
        </motion.div>

        {/* Pricing Cards — scrollable on mobile */}
        <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-5 md:overflow-visible md:pb-0 items-start">
          {tiers.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative rounded-2xl p-6 border snap-center flex-shrink-0 w-[280px] md:w-auto ${
                t.highlighted
                  ? "bg-bg-elevated border-border-brand md:scale-105 z-10"
                  : "bg-bg-surface border-border-subtle"
              }`}
              style={{
                boxShadow: t.highlighted ? "var(--shadow-brand), 0 0 40px rgba(45,107,228,0.15)" : "var(--shadow-card)",
                transition: "background-color 350ms ease, border-color 350ms ease, box-shadow 350ms ease",
              }}
            >
              {t.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                    t.badgeStyle === "brand"
                      ? "text-white"
                      : t.badgeStyle === "accent"
                        ? "bg-orion-blue/10 text-orion-blue border border-orion-blue/30"
                        : "bg-bg-elevated text-text-secondary border border-border-subtle"
                  }`}
                  style={t.badgeStyle === "brand" ? { background: "var(--gradient-brand)" } : undefined}
                >
                  {t.badge}
                </div>
              )}

              <div className="mb-5 mt-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-3 ${
                  t.highlighted ? "text-white bg-orion-blue/20 border border-orion-blue/40" : "bg-border-subtle text-text-secondary"
                }`} style={{ transition: "background-color 350ms ease" }}>
                  {t.name}
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-satoshi font-bold text-3xl text-text-primary">{t.price}</span>
                  <span className="text-text-tertiary text-sm">/mo</span>
                </div>
                <p className="text-text-tertiary text-xs font-medium mt-1">{t.target}</p>
              </div>

              <p className="text-text-secondary text-[13px] leading-relaxed mb-5 min-h-[60px]">{t.description}</p>

              <ul className="space-y-2.5 mb-6">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-[13px] text-text-secondary">
                    <Check size={14} className={`mt-0.5 shrink-0 ${t.highlighted ? "text-orion-blue" : "text-signal-green"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => t.name === "Brokerage" ? window.location.href = "mailto:hello@agentorion.com?subject=Brokerage Demo Request" : handlePlanClick(t.name)}
                className={`block w-full text-center py-2.5 rounded-xl text-sm font-bold font-satoshi transition-all ${
                  t.highlighted
                    ? "bg-orion-blue text-white glow-orion hover:scale-[1.02]"
                    : "border border-border-subtle text-text-primary hover:border-border-brand/50"
                }`}
                style={{ transition: "all 350ms ease" }}
              >
                {t.cta}
              </button>
            </motion.div>
          ))}
        </div>

        {/* Brokerage Callout */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 rounded-2xl border border-border-brand/30 p-8 sm:p-10 text-center"
          style={{
            background: "linear-gradient(135deg, rgba(45,107,228,0.05) 0%, rgba(45,107,228,0.02) 100%)",
            boxShadow: "0 0 40px rgba(45,107,228,0.08)",
          }}
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-xl bg-orion-blue/10 flex items-center justify-center">
              <Building2 size={24} className="text-orion-blue" />
            </div>
          </div>
          <h3 className="font-satoshi font-bold text-xl sm:text-2xl text-text-primary mb-3">
            Are You a Brokerage Principal or Team Leader?
          </h3>
          <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
            AgentOrion partners with brokerages to give every new agent a structured 30 Day Launch Program from day one. Agents who generate leads faster stay longer. Talk to us about volume pricing and custom onboarding for your team.
          </p>
          <a
            href="mailto:hello@agentorion.com?subject=Brokerage Demo Request"
            className="inline-flex items-center gap-2 bg-orion-blue text-white px-6 py-3 rounded-xl font-bold font-satoshi text-sm glow-orion hover:scale-[1.02] transition-all"
          >
            Schedule a Brokerage Demo
          </a>
        </motion.div>

        <p className="text-center text-text-tertiary text-sm font-inter mt-8">
          Not sure which plan? Start Free — upgrade when you're ready. No pressure, ever.
        </p>

        {/* Compare All Features */}
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

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="overflow-hidden flex justify-center"
            >
              <div className="mt-8 w-full overflow-x-auto bg-bg-surface border border-border-subtle rounded-xl" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
                <div className="min-w-[700px]">
                  <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] bg-bg-subtle px-4 sm:px-6 py-3" style={{ transition: "background-color 350ms ease" }}>
                    <span className="text-text-secondary text-[13px] font-bold font-inter">Feature</span>
                    <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Free</span>
                    <span className="text-orion-blue text-[13px] font-bold font-inter text-center">Launch</span>
                    <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Pro</span>
                    <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Team</span>
                    <span className="text-text-secondary text-[13px] font-bold font-inter text-center">Brokerage</span>
                  </div>
                  {comparisonRows.map((row, i) => (
                    <div
                      key={row.feature}
                      className={`grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] px-4 sm:px-6 items-center min-h-[44px] ${
                        i % 2 === 0 ? "bg-bg-surface" : "bg-bg-subtle"
                      }`}
                      style={{ transition: "background-color 350ms ease" }}
                    >
                      <span className="text-text-primary text-sm font-inter py-2.5">{row.feature}</span>
                      <div className="text-center py-2.5"><CellContent value={row.free} /></div>
                      <div className="text-center py-2.5"><CellContent value={row.launch} /></div>
                      <div className="text-center py-2.5"><CellContent value={row.pro} /></div>
                      <div className="text-center py-2.5"><CellContent value={row.team} /></div>
                      <div className="text-center py-2.5"><CellContent value={row.brokerage} /></div>
                    </div>
                  ))}
                  <div className="bg-bg-base px-4 sm:px-6 py-4 text-center" style={{ transition: "background-color 350ms ease" }}>
                    <span className="text-text-secondary text-sm font-inter">Ready to get started? </span>
                    <button onClick={scrollToPricing} className="text-orion-blue text-sm font-inter font-bold hover:underline">
                      Choose your plan ↑
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-10">
          <span className="text-text-muted text-[13px] font-inter flex items-center gap-1.5">
            <span className="text-text-tertiary">🔒</span> No contracts — cancel anytime
          </span>
          <span className="text-text-muted text-[13px] font-inter flex items-center gap-1.5">
            <Check size={14} className="text-text-tertiary" /> 30-day free trial on paid plans
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
