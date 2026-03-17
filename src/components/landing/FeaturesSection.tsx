import { motion } from "framer-motion";
import { Filter, Shield, Zap, Globe, Rocket, Share2 } from "lucide-react";
import StarField from "./StarField";

const features = [
  { icon: Filter, color: "var(--color-orion-blue)", title: "AI Lead Funnels", body: "Launch unlimited branded lead capture funnels powered by local MLS data. Buyer funnels, seller funnels, FSBO funnels, and 13 more — all AI-generated in minutes.", tag: "Core Feature" },
  { icon: Shield, color: "var(--color-nebula-purple)", title: "Instant Credibility", body: "AI generates your professional bio, market expertise content, and branded funnels in under 10 minutes. New agents look established. Experienced agents look exceptional.", tag: "AI-Powered" },
  { icon: Zap, color: "var(--color-signal-green)", title: "Automated Follow-Up", body: "AgentOrion AI drafts personalized follow-up messages for every lead temperature — hot, warm, and cold — so no opportunity falls through the cracks.", tag: "Automation" },
  { icon: Globe, color: "var(--color-pulse-gold)", title: "Market Intelligence", body: "Real-time local market data gives you the neighborhood expertise clients expect from a true local expert — regardless of how long you've been in the business.", tag: "Data-Driven" },
  { icon: Rocket, color: "var(--color-orion-blue)", title: "30 Day Launch Program", body: "A structured day-by-day guide that takes new agents from zero to their first closing pipeline in their first month. Experienced agents use it to systematize what they already do.", tag: "Program" },
  { icon: Share2, color: "var(--color-nebula-purple)", title: "Social Media Mastery Guide", body: "A complete AI-powered content system that builds your personal brand across Facebook, LinkedIn, Instagram, YouTube, and your own blog — generating inbound leads permanently.", tag: "Content" },
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
          Everything You Need to Build a Consistent Real Estate Business
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[600px] mx-auto">
          Six powerful tools — one intelligent platform designed for agents at every stage.
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
