import { motion } from "framer-motion";
import { Zap, PenTool, BarChart3 } from "lucide-react";

const cards = [
  {
    icon: Zap,
    color: "var(--color-signal-green)",
    title: "Autopilot Follow-Up",
    body: "AgentOrion automatically follows up with every lead at the right temperature so warm leads never go cold while you're closing other deals.",
  },
  {
    icon: PenTool,
    color: "var(--color-pulse-gold)",
    title: "Consistent Content",
    body: "AI generates your market updates, blog posts, and social media content every week — keeping you top of mind with your sphere of influence without adding hours to your day.",
  },
  {
    icon: BarChart3,
    color: "var(--color-orion-blue)",
    title: "Pipeline Visibility",
    body: "See every lead, every funnel, and every opportunity in one dashboard. Know exactly where your next deal is coming from before your current one closes.",
  },
];

const ExperiencedAgentSection = () => (
  <section className="py-20 sm:py-28 bg-bg-subtle" style={{ transition: "background-color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
          Already Selling? Build the Pipeline That Never Dries Up.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[660px] mx-auto">
          AgentOrion gives experienced agents the automation and AI tools to keep leads coming in consistently — even during your busiest closing months.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {cards.map((c, i) => (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8 hover:-translate-y-1 hover:border-border-brand/50 transition-all duration-300"
            style={{ transition: "background-color 350ms ease, border-color 350ms ease, transform 300ms ease" }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5" style={{ backgroundColor: `color-mix(in srgb, ${c.color} 10%, transparent)` }}>
              <c.icon size={20} style={{ color: c.color }} />
            </div>
            <h3 className="font-satoshi font-bold text-lg text-text-primary mb-2">{c.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{c.body}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            const el = document.querySelector("#how-it-works");
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 80;
              window.scrollTo({ top: y, behavior: "smooth" });
            }
          }}
          className="inline-flex items-center justify-center font-satoshi font-bold text-text-primary border border-border-default px-8 py-4 rounded-xl text-base hover:border-border-brand/50 transition-all"
          style={{ transition: "all 350ms ease" }}
        >
          See How It Works for Experienced Agents
        </button>
      </div>
    </div>
  </section>
);

export default ExperiencedAgentSection;
