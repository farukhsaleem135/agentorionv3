import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.5 },
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex items-start gap-3 mb-4">
    <span className="font-jetbrains font-bold text-orion-blue text-lg shrink-0">{value}</span>
    <span className="text-text-secondary text-sm leading-relaxed">{label}</span>
  </div>
);

const ProblemSection = () => (
  <section className="py-20 sm:py-28 bg-bg-subtle" style={{ transition: "background-color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.h2
        {...fadeUp}
        className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary text-center mb-16"
      >
        Two Different Problems. One Powerful Platform.
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* New Agent Column */}
        <motion.div
          {...fadeUp}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8"
          style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-border-subtle text-orion-blue text-xs font-bold mb-6" style={{ transition: "background-color 350ms ease" }}>
            New Agent
          </span>
          <StatItem value="87%" label="of new agents fail within 5 years" />
          <StatItem value="90-180" label="days before a first paycheck arrives" />
          <StatItem value="vs." label="Competing against established agents with years of sphere of influence" />
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-text-secondary text-sm leading-relaxed">
              Most lead generation tools are built for established agents with existing pipelines. AgentOrion was built for the agent who is just getting started and cannot afford to wait.
            </p>
          </div>
        </motion.div>

        {/* Experienced Agent Column */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-bg-surface border border-border-subtle rounded-2xl p-7 sm:p-8"
          style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-border-subtle text-signal-green text-xs font-bold mb-6" style={{ transition: "background-color 350ms ease" }}>
            Experienced Agent
          </span>
          <StatItem value="73%" label="of agents report inconsistent lead flow as their top business challenge" />
          <StatItem value="15+" label="hours per week spent on manual follow-up and content creation" />
          <StatItem value="⚠" label="Most agents lose warm leads simply because follow-up falls through the cracks" />
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <p className="text-text-secondary text-sm leading-relaxed">
              You have the skills and the experience. What you need is a system that runs your lead generation on autopilot so you can focus on what you do best — closing deals.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default ProblemSection;
