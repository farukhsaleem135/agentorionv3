import { motion } from "framer-motion";
import StarField from "./StarField";

const CTABanner = () => (
  <section className="relative py-24 sm:py-32 overflow-hidden bg-bg-subtle border-t border-b border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(45,107,228,0.12), transparent 70%)",
        transition: "background 200ms ease",
      }}
    />
    <StarField count={50} />
    <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-orion-blue text-xs font-medium mb-4 inline-block">✦ Start Today</span>
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[56px] text-text-primary mb-6 leading-tight">
          Your competition is already using AI. Are you?
        </h2>
        <p className="text-text-secondary text-base sm:text-lg mb-8 max-w-xl mx-auto">
          Join 2,400+ agents navigating smarter with AgentOrion. Free to start. No credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
          <a
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center font-satoshi font-bold text-white bg-orion-blue px-8 py-4 rounded-xl text-base glow-orion hover:scale-[1.02] transition-transform"
          >
            Launch Your First Funnel Free
          </a>
          <a
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center font-medium text-text-primary border border-text-primary/20 px-8 py-4 rounded-xl text-base hover:border-text-primary/40 transition-colors"
          >
            Talk to a Human First
          </a>
        </div>
        <p className="text-text-muted text-sm font-bold font-inter mb-2">
          No card. No contract. No catch.
        </p>
        <p className="text-text-muted text-sm">
          ✓ 14-Day Free Trial &nbsp;·&nbsp; ✓ No Credit Card &nbsp;·&nbsp; ✓ Cancel Anytime
        </p>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
