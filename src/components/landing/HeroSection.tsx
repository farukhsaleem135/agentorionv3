import { motion } from "framer-motion";
import { Play } from "lucide-react";
import StarField from "./StarField";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-bg-base pt-28 sm:pt-32 pb-16 sm:pb-24" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
      <div
        className="hero-gradient-bloom absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 35% 40%, rgba(45,107,228,0.15), transparent 70%)",
          transition: "background 200ms ease",
        }}
      />
      <div
        className="hero-gradient-bloom-secondary absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 40% 40% at 75% 70%, rgba(107,63,160,0.10), transparent 60%)",
          transition: "background 200ms ease",
        }}
      />
      <StarField count={100} />

      <div className="relative z-10 max-w-[900px] mx-auto text-center px-4 sm:px-6">
        {/* Eyebrow */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-brand/40 bg-border-subtle/60 mb-6" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
          <span className="text-orion-blue text-xs">✦</span>
          <span className="text-orion-blue text-xs font-medium tracking-wide">AI-Powered Real Estate Growth Platform</span>
        </motion.div>

        {/* H1 */}
        <motion.h1 {...fadeUp(0.15)} className="font-satoshi font-bold text-[42px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight text-text-primary mb-6">
          The AI Platform Real Estate Agents{" "}
          <span className="text-gradient-orion">Actually Need</span>
        </motion.h1>

        {/* Sub */}
        <motion.p {...fadeUp(0.3)} className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-[660px] mx-auto mb-8 leading-relaxed">
          Whether you're just getting started or have been selling for years — AgentOrion gives you the AI-powered lead generation, automation, and content system to build a consistent, predictable real estate business.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <a
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center font-satoshi font-bold text-text-inverse bg-orion-blue px-8 py-3.5 rounded-[var(--radius-md)] text-[15px] shadow-brand hover:bg-orion-blue-hover hover:-translate-y-px hover:shadow-[0_0_28px_rgba(45,107,228,0.45)] active:scale-[0.98]"
            style={{ transition: "all var(--transition-base)" }}
          >
            Start My Free 30 Days — No Credit Card Required
          </a>
          <button
            onClick={() => scrollToSection("#how-it-works")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-satoshi font-bold text-text-secondary border border-border-default px-8 py-3.5 rounded-[var(--radius-md)] text-[15px] hover:border-orion-blue hover:text-text-primary hover:bg-bg-elevated/50"
            style={{ transition: "all var(--transition-base)" }}
          >
            <Play size={16} fill="currentColor" className="shrink-0" />
            Watch How It Works
          </button>
        </motion.div>

        {/* Trust line */}
        <motion.p {...fadeUp(0.6)} className="text-text-tertiary text-sm mt-4">
          Join real estate agents across the country already using AgentOrion to generate leads and close more deals
        </motion.p>
      </div>
    </section>
  );
};

export default HeroSection;
