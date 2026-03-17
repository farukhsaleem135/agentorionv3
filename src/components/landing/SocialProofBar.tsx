import { motion } from "framer-motion";

const logos = ["Follow Up Boss", "kvCORE", "HubSpot", "LionDesk", "Google Ads", "Meta Ads"];

const SocialProofBar = () => (
  <section className="py-16 bg-bg-subtle overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
    <p className="text-center text-xs uppercase tracking-[0.2em] text-text-muted mb-8 px-4">
      Built for agents already using
    </p>
    <div className="relative">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex gap-16 whitespace-nowrap"
      >
        {[...logos, ...logos].map((name, i) => (
          <span
            key={i}
            className="text-text-disabled hover:text-text-primary transition-colors duration-300 text-lg font-satoshi font-medium cursor-default select-none"
          >
            {name}
          </span>
        ))}
      </motion.div>
    </div>
    <div className="flex justify-center mt-10">
      <div className="h-px w-32" style={{ background: "linear-gradient(to right, transparent, var(--color-border-subtle), transparent)" }} />
    </div>
    <div className="flex justify-center mt-4">
      <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-border-subtle text-pulse-gold text-xs font-medium" style={{ transition: "background-color 350ms ease" }}>
        ⚡ CRM Integrations Coming Q3 2026
      </span>
    </div>
  </section>
);

export default SocialProofBar;
