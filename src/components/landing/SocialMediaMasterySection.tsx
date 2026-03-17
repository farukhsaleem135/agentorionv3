import { motion } from "framer-motion";

const platforms = [
  { icon: "📘", label: "Facebook Authority" },
  { icon: "💼", label: "LinkedIn Credibility" },
  { icon: "📸", label: "Instagram Presence" },
  { icon: "🎬", label: "YouTube Videos" },
  { icon: "✍️", label: "Blog Posts" },
  { icon: "📧", label: "Email Newsletter" },
];

const SocialMediaMasterySection = () => (
  <section className="py-20 sm:py-28 bg-bg-base" style={{ transition: "background-color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <h2 className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary mb-4">
          Stop Posting. Start Dominating.
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[660px] mx-auto">
          AgentOrion AI generates complete social media content for Facebook, LinkedIn, Instagram, YouTube, and your blog — so you become the go-to real estate expert in your market.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {platforms.map((p, i) => (
          <motion.div
            key={p.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="bg-bg-surface border border-border-subtle rounded-xl p-5 text-center hover:-translate-y-1 hover:border-border-brand/50 transition-all duration-300"
            style={{ transition: "background-color 350ms ease, border-color 350ms ease, transform 300ms ease" }}
          >
            <span className="text-3xl mb-3 block">{p.icon}</span>
            <span className="text-text-secondary text-xs font-medium">{p.label}</span>
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
          See How It Works
        </button>
      </div>
    </div>
  </section>
);

export default SocialMediaMasterySection;
