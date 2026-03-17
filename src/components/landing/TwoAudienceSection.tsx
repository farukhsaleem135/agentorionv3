import { motion } from "framer-motion";
import { Rocket, TrendingUp } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const TwoAudienceSection = () => (
  <section className="py-20 sm:py-28 bg-bg-base" style={{ transition: "background-color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* New Agent Card */}
        <motion.div
          {...fadeUp}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 hover:-translate-y-1 hover:border-border-brand/50 transition-all duration-300"
          style={{ transition: "background-color 350ms ease, border-color 350ms ease, transform 300ms ease" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(45,107,228,0.1)" }}>
            <Rocket size={24} className="text-orion-blue" />
          </div>
          <h3 className="font-satoshi font-bold text-2xl text-text-primary mb-3">Just Getting Started?</h3>
          <p className="text-text-secondary text-[15px] leading-relaxed mb-6">
            The Commission Desert is real. 87% of new agents fail within 5 years — not because they lack skill but because they lack a system. AgentOrion gives you instant credibility, AI-powered lead funnels, and a structured 30 Day Launch Program that takes you from day one to your first closing pipeline.
          </p>
          <a
            href="/auth"
            className="inline-flex items-center justify-center font-satoshi font-bold text-text-inverse bg-orion-blue px-6 py-3 rounded-xl text-sm glow-orion hover:scale-[1.02] transition-transform"
          >
            Start Your 30 Day Launch — Free
          </a>
        </motion.div>

        {/* Experienced Agent Card */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 hover:-translate-y-1 hover:border-border-brand/50 transition-all duration-300"
          style={{ transition: "background-color 350ms ease, border-color 350ms ease, transform 300ms ease" }}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: "rgba(46,204,138,0.1)" }}>
            <TrendingUp size={24} className="text-signal-green" />
          </div>
          <h3 className="font-satoshi font-bold text-2xl text-text-primary mb-3">Ready to Stop the Feast or Famine Cycle?</h3>
          <p className="text-text-secondary text-[15px] leading-relaxed mb-6">
            You know how to close deals. The problem is you're so focused on closing that you stop generating leads — and then the pipeline dries up. AgentOrion automates your lead generation so your pipeline keeps growing even when you're heads-down in transactions.
          </p>
          <button
            onClick={() => {
              const el = document.querySelector("#how-it-works");
              if (el) {
                const y = el.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
            className="inline-flex items-center justify-center font-satoshi font-bold text-text-primary border border-border-default px-6 py-3 rounded-xl text-sm hover:border-border-brand/50 transition-all"
            style={{ transition: "all 350ms ease" }}
          >
            See How AgentOrion Works
          </button>
        </motion.div>
      </div>
    </div>
  </section>
);

export default TwoAudienceSection;
