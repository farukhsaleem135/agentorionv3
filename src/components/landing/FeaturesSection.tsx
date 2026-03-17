import { motion } from "framer-motion";
import { Filter, Brain, Zap, PenTool, Target, BarChart3 } from "lucide-react";
import StarField from "./StarField";

const features = [
  { icon: Filter, color: "var(--color-orion-blue)", title: "AI Funnel Builder", body: "Launch buyer, seller, and open house funnels in minutes. AI writes every headline, CTA, and nurture sequence for you.", tag: "Core Feature" },
  { icon: Brain, color: "var(--color-nebula-purple)", title: "Lead Intelligence", body: "Every lead is automatically scored, tagged, and prioritized. Know exactly who to call, when to call, and what to say.", tag: "AI-Powered" },
  { icon: Zap, color: "var(--color-signal-green)", title: "Autopilot Mode", body: "Flip the switch and AgentOrion texts, emails, and calls every new lead automatically — no setup, no integrations, no extra accounts. Your follow-up runs itself.", tag: "Automation" },
  { icon: PenTool, color: "var(--color-pulse-gold)", title: "Content Studio", body: "Generate social posts, video scripts, ad copy, and email campaigns tailored to your brand voice and market.", tag: "AI Content" },
  { icon: Target, color: "var(--color-orion-blue)", title: "Campaign Manager", body: "Build, launch, and track Google, Meta, and TikTok ad campaigns directly from your AgentOrion dashboard.", tag: "Multi-Channel" },
  { icon: BarChart3, color: "var(--color-nebula-purple)", title: "Pro Analytics", body: "Funnel conversion rates, lead acquisition timelines, ROI confidence panels, and weekly AI growth summaries.", tag: "Pro Tier" },
];

const scrollToPricing = () => {
  const el = document.querySelector("#pricing");
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const FeaturesSection = () => (
  <section id="features" className="relative py-24 sm:py-32 bg-bg-base overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
    <StarField count={60} />
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
          One Platform. Total Intelligence.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[560px] mx-auto">
          Every tool a high-performing agent needs, unified under one AI-powered command center.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 hover:-translate-y-1 hover:border-border-brand/50 transition-all duration-300"
            style={{ transition: "background-color 350ms ease, border-color 350ms ease, transform 300ms ease" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `color-mix(in srgb, ${f.color} 10%, transparent)` }}>
              <f.icon size={20} style={{ color: f.color }} />
            </div>
            <h3 className="font-satoshi font-bold text-lg text-text-primary mb-2">{f.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed mb-4">{f.body}</p>
            <span className="inline-block px-3 py-1 rounded-full bg-border-subtle text-text-tertiary text-xs font-medium" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>{f.tag}</span>
          </motion.div>
        ))}
      </div>

      {/* Bridge CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mt-12"
      >
        <button
          onClick={scrollToPricing}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border-default text-text-secondary font-medium text-sm hover:border-border-brand hover:text-text-primary hover:bg-bg-elevated transition-all"
          style={{ transition: "all 350ms ease" }}
        >
          See All Features →
        </button>
      </motion.div>
    </div>
  </section>
);

export default FeaturesSection;
