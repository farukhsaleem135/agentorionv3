import { motion } from "framer-motion";
import StarField from "./StarField";

const PositioningStatement = () => (
  <section className="relative py-20 sm:py-28 overflow-hidden bg-bg-overlay border-t border-b border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(45,107,228,0.10), transparent 70%)",
        transition: "background 200ms ease",
      }}
    />
    <StarField count={40} />
    <div className="relative z-10 max-w-3xl mx-auto text-center px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-6 leading-tight">
          Built for Real Estate Agents Who Are Serious About Building a Business.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
          AgentOrion integrates with local MLS data to give you real-time listing data, neighborhood intelligence, and market insights that generic national platforms cannot provide. When you create a funnel, write a blog post, or generate a market report, AgentOrion uses actual local data from your market — not generic national statistics that mean nothing to your clients.
        </p>
      </motion.div>
    </div>
  </section>
);

export default PositioningStatement;
