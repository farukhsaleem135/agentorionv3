import { motion } from "framer-motion";
import { Users, Link2, Plus, ArrowRight } from "lucide-react";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const IntegrationsSection = () => (
  <section id="integrations" className="relative py-24 sm:py-32 overflow-hidden" style={{ backgroundColor: "#0A0E1A" }}>
    <div className="absolute top-0 left-0 right-0 h-px" style={{ backgroundColor: "rgba(45,107,228,0.15)" }} />

    <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div {...fadeUp} className="text-center mb-16">
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-white mb-4">
          Connects With The Tools You Already Use
        </h2>
        <p className="text-lg max-w-[640px] mx-auto" style={{ color: "#94A3B8" }}>
          AgentOrion integrates natively with the platforms serious real estate agents rely on — with more connections coming as our community grows.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Card 1 — Follow Up Boss */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0 }}
          className="rounded-2xl p-7 flex flex-col"
          style={{ minHeight: 340, backgroundColor: "#141B2D", border: "1px solid #2D6BE4" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(45,107,228,0.15)" }}>
              <Users size={22} style={{ color: "#2D6BE4" }} />
            </div>
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white"
              style={{ backgroundColor: "#2D6BE4" }}
            >
              Featured Integration
            </span>
          </div>
          <h3 className="font-satoshi font-bold text-lg mb-2 text-white">Follow Up Boss</h3>
          <p className="text-sm font-inter leading-relaxed flex-1" style={{ color: "#CBD5E1" }}>
            AgentOrion captures and qualifies your leads with AI. Follow Up Boss manages your relationships. Together they are the complete system for a serious producing agent.
          </p>
          <div className="mt-4">
            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "#475569" }}>
              Coming Q4 2026
            </span>
          </div>
        </motion.div>

        {/* Card 2 — Universal Webhook */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-7 flex flex-col"
          style={{ minHeight: 340, backgroundColor: "#141B2D", border: "1px solid #2D6BE4" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(45,107,228,0.15)" }}>
              <Link2 size={22} style={{ color: "#2D6BE4" }} />
            </div>
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ backgroundColor: "rgba(45,107,228,0.1)", color: "#2D6BE4", borderColor: "rgba(45,107,228,0.3)" }}
            >
              Universal Connection
            </span>
          </div>
          <h3 className="font-satoshi font-bold text-lg mb-2 text-white">Connect Any CRM</h3>
          <p className="text-sm font-inter leading-relaxed flex-1" style={{ color: "#CBD5E1" }}>
            AgentOrion's universal webhook export sends your leads directly to any platform that accepts webhooks — LionDesk, Chime, HubSpot, Salesforce, and hundreds more. One connection. Every platform.
          </p>
          <div className="mt-4">
            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "#475569" }}>
              Coming Q4 2026
            </span>
          </div>
        </motion.div>

        {/* Card 3 — Coming Soon Pipeline */}
        <motion.div
          {...fadeUp}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-7 flex flex-col"
          style={{ minHeight: 340, backgroundColor: "#141B2D", border: "1px solid #2D6BE4" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <Plus size={22} style={{ color: "#6B7280" }} />
            </div>
            <span
              className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#9CA3AF", borderColor: "rgba(255,255,255,0.1)" }}
            >
              Growing Ecosystem
            </span>
          </div>
          <h3 className="font-satoshi font-bold text-lg mb-2 text-white">More Integrations Coming</h3>
          <p className="text-sm font-inter leading-relaxed flex-1" style={{ color: "#CBD5E1" }}>
            Our integration roadmap is driven by what our agents need most. Have a platform you rely on? Tell us and we will prioritize it.
          </p>
          <div className="mt-4 flex items-center justify-between">
            <span className="inline-flex px-3 py-1 rounded-full text-[11px] font-semibold text-white" style={{ backgroundColor: "#475569" }}>
              Driven By Agent Demand
            </span>
            <a
              href="mailto:support@agentorion.com?subject=AgentOrion%20Integration%20Request"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: "#2D6BE4" }}
            >
              Request <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Trust line */}
      <motion.p {...fadeUp} className="text-center text-sm font-inter" style={{ color: "rgba(255,255,255,0.5)" }}>
        AgentOrion connects to your existing workflow — not the other way around.
      </motion.p>
    </div>
  </section>
);

export default IntegrationsSection;
