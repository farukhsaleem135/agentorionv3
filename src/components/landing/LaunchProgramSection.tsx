import { motion } from "framer-motion";

const weeks = [
  { num: "1", label: "Foundation", desc: "Set up your brand, funnels, and credibility assets" },
  { num: "2", label: "Momentum", desc: "Launch campaigns and start capturing leads" },
  { num: "3", label: "Pipeline", desc: "Nurture leads and build your closing pipeline" },
  { num: "4", label: "Closing", desc: "Convert leads and close your first deals" },
];

const LaunchProgramSection = () => (
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
          New Agent? Go From Zero to Closing Pipeline in 30 Days
        </h2>
        <p className="text-text-secondary text-base sm:text-lg max-w-[660px] mx-auto">
          AgentOrion's structured launch program guides new agents through exactly what to do each week to generate their first leads and build their first closing pipeline. Experienced agents use it to systematize and automate what they already know.
        </p>
      </motion.div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Connecting line — desktop only */}
        <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px border-t-2 border-dashed border-border-subtle" />

        {weeks.map((w, i) => (
          <motion.div
            key={w.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto w-14 h-14 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mb-4" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
              <span className="font-jetbrains font-bold text-orion-blue text-lg">W{w.num}</span>
            </div>
            <h3 className="font-satoshi font-bold text-lg text-text-primary mb-2">{w.label}</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-[200px] mx-auto">{w.desc}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <a
          href="/auth"
          className="inline-flex items-center justify-center font-satoshi font-bold text-text-inverse bg-orion-blue px-8 py-4 rounded-xl text-base glow-orion hover:scale-[1.02] transition-transform"
        >
          Start Your 30 Day Launch — Free
        </a>
      </div>
    </div>
  </section>
);

export default LaunchProgramSection;
