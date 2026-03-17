import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const manualBenefits = [
  "AI-powered lead suggestions every morning",
  "Growth Score updated in real time",
  "Quick action grid for one-tap tasks",
  "Full visibility into every lead and funnel",
];

const autopilotBenefits = [
  "Autonomous outreach sequences running 24/7",
  "AI action feed surfaces your highest-value opportunities",
  "Budget optimization across all active ad campaigns",
  "ROI tracking updated daily — no manual reporting",
];

const ModeShowcase = () => {
  const [autopilot, setAutopilot] = useState(false);

  return (
    <section className="relative py-24 sm:py-32 bg-bg-surface overflow-hidden" style={{ transition: "background-color 350ms ease" }}>
      {/* Ambient glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: autopilot
            ? "radial-gradient(ellipse 50% 60% at 65% 50%, rgba(45,107,228,0.08), transparent 70%)"
            : "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(30,42,58,0.05), transparent 70%)",
        }}
        transition={{ duration: 0.8 }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-satoshi font-bold text-3xl sm:text-4xl text-text-primary text-center mb-4"
        >
          Two Modes. One Platform.
        </motion.h2>
        <p className="text-text-secondary text-center mb-16 max-w-lg mx-auto">
          Choose hands-on control or let AI run the business. Switch anytime.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-bold font-inter transition-colors ${!autopilot ? "text-text-primary" : "text-text-muted"}`}>
            Manual Mode
          </span>
          <button
            onClick={() => setAutopilot(!autopilot)}
            className="relative w-16 h-8 rounded-full cursor-pointer transition-colors duration-300"
            style={{
              background: autopilot
                ? "var(--gradient-brand)"
                : "var(--color-border-subtle)",
            }}
          >
            <motion.div
              className="absolute top-[2px] w-7 h-7 rounded-full bg-white shadow-lg"
              animate={{ left: autopilot ? 34 : 2 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          </button>
          <span className={`text-sm font-bold font-inter transition-colors ${autopilot ? "text-text-primary" : "text-text-muted"}`}>
            Autopilot Mode
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Manual */}
          <motion.div
            animate={{ opacity: autopilot ? 0.4 : 1 }}
            transition={{ duration: 0.4 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-8"
            style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}
          >
            <span className="inline-block px-3 py-1 rounded-full bg-border-subtle text-text-primary text-xs font-bold font-inter mb-4" style={{ transition: "background-color 350ms ease" }}>
              Manual Mode
            </span>
            <h3 className="font-inter font-bold text-2xl text-text-primary mb-3">Stay in control of every move.</h3>
            <p className="text-text-secondary text-[15px] mb-6 leading-relaxed font-inter">
              Hands-on dashboard with AI suggestions, Growth Score, lead prioritization, and quick actions — built for agents who want to direct their own business.
            </p>
            <ul className="space-y-3">
              {manualBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={16} className="text-signal-green mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Autopilot */}
          <motion.div
            animate={{
              opacity: autopilot ? 1 : 0.4,
              borderColor: autopilot ? "var(--color-orion-blue)" : "var(--color-border-subtle)",
              boxShadow: autopilot ? "0 0 40px rgba(45,107,228,0.25)" : "0 0 0px transparent",
            }}
            transition={{ duration: 0.4 }}
            className="border rounded-2xl p-8 relative"
            style={{
              backgroundColor: autopilot ? "rgba(45,107,228,0.04)" : "var(--color-bg-surface)",
              transition: "background-color 350ms ease",
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <motion.span
                animate={{
                  background: autopilot
                    ? "var(--gradient-brand)"
                    : "var(--color-border-subtle)",
                }}
                className="inline-block px-3 py-1 rounded-full text-white text-xs font-bold font-inter"
              >
                Autopilot Mode
              </motion.span>
            </div>
            <h3 className="font-inter font-bold text-2xl text-text-primary mb-3">Let AI run the business while you close deals.</h3>
            <p className="text-text-secondary text-[15px] mb-6 leading-relaxed font-inter">
              Autonomous outreach, AI action feeds, budget optimization, and ROI tracking — all running in the background while you focus on clients.
            </p>
            <ul className="space-y-3">
              {autopilotBenefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm text-text-secondary">
                  <Check size={16} className="text-orion-blue mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <AnimatePresence>
              {autopilot && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 8 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-signal-green"
                  style={{ backgroundColor: "var(--color-signal-green-bg)" }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-signal-green animate-[pulse_1.5s_ease-in-out_infinite]" />
                  <span className="text-signal-green text-[11px] font-bold font-inter">AI ACTIVE</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ModeShowcase;
