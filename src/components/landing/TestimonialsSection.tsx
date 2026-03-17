import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  { quote: "Coming Soon — Agent stories will appear here as our community grows", name: "Agent Story #1", role: "Coming Soon" },
  { quote: "Coming Soon — Agent stories will appear here as our community grows", name: "Agent Story #2", role: "Coming Soon" },
  { quote: "Coming Soon — Agent stories will appear here as our community grows", name: "Agent Story #3", role: "Coming Soon" },
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
        Real Agents. Real Results.
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
            <p className="text-text-secondary text-sm leading-relaxed mb-6 italic">"{t.quote}"</p>
            <div>
              <p className="text-text-primary text-sm font-semibold">{t.name}</p>
              <p className="text-text-tertiary text-xs">{t.role}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
