import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import StarField from "./StarField";

const WaitlistSection = () => {
  return (
    <section id="waitlist" className="relative py-24 sm:py-32 overflow-hidden bg-gradient-surface" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
      <StarField count={50} />
      <div className="relative z-10 max-w-[640px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-border-subtle border border-border-brand mb-6" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
            <span className="text-orion-blue text-xs font-bold font-inter">✦ Early Access</span>
          </div>

          {/* Headline */}
          <h2 className="font-satoshi font-bold text-4xl sm:text-[52px] text-text-primary leading-tight mb-4">
            Start Free For 30 Days.
          </h2>

          {/* Sub */}
          <p className="text-text-secondary text-lg font-inter max-w-[500px] mx-auto mb-10 leading-relaxed">
            Try AgentOrion Growth free for 30 days — no credit card required. Cancel anytime.
          </p>

          {/* CTA Button */}
          <div className="mb-6">
            <a
              href="/auth"
              className="inline-flex items-center gap-2 bg-orion-blue text-white font-satoshi font-bold text-[16px] px-8 py-4 rounded-lg hover:shadow-[0_0_28px_rgba(45,107,228,0.45)] hover:scale-[1.02] hover:-translate-y-px transition-all"
            >
              <Rocket size={18} />
              Start My Free 30 Days
            </a>
          </div>

          {/* Trust text */}
          <p className="text-text-muted text-sm font-inter mb-8">
            No credit card required. 30-day free trial on the Growth plan. Cancel anytime.
          </p>

          {/* Social proof counter */}
          <p className="mb-6">
            <span className="font-satoshi font-bold text-xl text-orion-blue">400+</span>
            <span className="text-text-tertiary text-sm font-inter ml-2">agents already growing with AgentOrion</span>
          </p>

          {/* Micro-trust */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {[
              "Full Growth plan features",
              "No credit card ever required",
              "Cancel anytime",
            ].map((item) => (
              <span key={item} className="text-text-muted text-[12px] font-inter flex items-center gap-1">
                <span className="text-text-muted">✓</span> {item}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default WaitlistSection;
