import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    quote: "I launched my first funnel in under 10 minutes and had 3 leads by the next morning. I've never seen anything move this fast.",
    name: "Sarah M.",
    role: "Buyer's Agent, Austin TX",
  },
  {
    quote: "Autopilot mode changed everything. My follow-up sequences run themselves now. I just show up to the calls AgentOrion sets up for me.",
    name: "Marcus T.",
    role: "Team Lead, Atlanta GA",
  },
  {
    quote: "The AI lead scoring alone is worth the Pro subscription. I know exactly which leads to focus on every single morning.",
    name: "Jennifer L.",
    role: "Listing Specialist, Phoenix AZ",
  },
];

const TestimonialsSection = () => (
  <section className="py-24 sm:py-32 bg-bg-subtle" style={{ transition: "background-color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-satoshi font-bold text-3xl sm:text-4xl text-text-primary text-center mb-16"
      >
        What Agents Are Saying
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="bg-bg-surface border border-border-subtle rounded-2xl p-7 relative"
            style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}
          >
            <Quote size={20} className="text-orion-blue mb-4 opacity-60" />
            <p className="text-text-secondary text-sm leading-relaxed mb-6">"{t.quote}"</p>
            <div>
              <p className="text-text-primary text-sm font-semibold">{t.name}</p>
              <p className="text-text-tertiary text-xs">{t.role}</p>
              <p className="text-pulse-gold text-xs mt-1">★★★★★</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
