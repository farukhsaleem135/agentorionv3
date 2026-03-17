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
    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* New Agent Track */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 text-center" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
            <h3 className="font-satoshi font-bold text-2xl sm:text-3xl text-text-primary mb-3">
              Your First Lead Is Waiting
            </h3>
            <p className="text-text-secondary text-base mb-6">
              Start your free 30-day trial. Launch your first funnel today.
            </p>
            <a
              href="/auth"
              className="inline-flex items-center justify-center font-satoshi font-bold text-white bg-orion-blue px-8 py-4 rounded-xl text-base glow-orion hover:scale-[1.02] transition-transform"
            >
              Start My 30 Day Launch — Free
            </a>
          </div>

          {/* Experienced Agent Track */}
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 text-center" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
            <h3 className="font-satoshi font-bold text-2xl sm:text-3xl text-text-primary mb-3">
              Ready to Stop the Feast or Famine Cycle?
            </h3>
            <p className="text-text-secondary text-base mb-6">
              See how AgentOrion automates your pipeline in under 30 minutes.
            </p>
            <a
              href="/auth"
              className="inline-flex items-center justify-center font-satoshi font-bold text-text-primary border border-border-default px-8 py-4 rounded-xl text-base hover:border-border-brand/50 transition-all"
              style={{ transition: "all 350ms ease" }}
            >
              Get Started Free — 30 Days on Us
            </a>
          </div>
        </div>

        <p className="text-text-muted text-sm text-center mt-6">
          No card. No contract. No catch.
        </p>
      </motion.div>
    </div>
  </section>
);

export default CTABanner;
