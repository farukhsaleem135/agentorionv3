import { motion } from "framer-motion";
import { Rocket, Users, Trophy, PlayCircle, Play } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Rocket,
    title: "Launch Your Funnel",
    desc: "Choose a funnel type, set your target market, and let AI generate the entire page — headline, copy, CTA, and nurture sequence — in under 60 seconds.",
  },
  {
    num: "02",
    icon: Users,
    title: "Capture & Score Leads",
    desc: "Leads flow into your dashboard automatically. AgentOrion scores them by urgency, assigns AI next steps, and fires off your nurture sequence without you lifting a finger.",
  },
  {
    num: "03",
    icon: Trophy,
    title: "Close More Deals",
    desc: "Your Growth Score tells you exactly where to focus. Autopilot handles the follow-up. You show up to the conversations that matter and close.",
  },
];

const scrollToSection = (id: string) => {
  const el = document.querySelector(id);
  if (el) {
    const y = el.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
};

const HowItWorks = () => (
  <section id="how-it-works" className="py-24 sm:py-32 bg-gradient-surface" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-satoshi font-bold text-3xl sm:text-4xl lg:text-[48px] text-text-primary text-center mb-20"
      >
        Navigate. Automate. Close.
      </motion.h2>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
        {/* Connecting line — desktop only */}
        <div className="hidden lg:block absolute top-14 left-[16.6%] right-[16.6%] h-px border-t-2 border-dashed border-border-subtle" />

        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="relative text-center"
          >
            <div className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center mb-6" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
              <s.icon size={24} className="text-orion-blue" />
            </div>
            <p className="font-satoshi font-bold text-6xl lg:text-7xl text-border-subtle mb-3 select-none">{s.num}</p>
            <h3 className="font-satoshi font-bold text-xl text-text-primary mb-3">{s.title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* Inline CTA after steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex justify-center mt-16"
      >
        <a
          href="/auth"
          className="inline-flex items-center justify-center font-satoshi font-bold text-text-inverse bg-orion-blue px-8 py-4 rounded-xl text-base glow-orion hover:scale-[1.02] transition-transform"
        >
          Start For Free — It Takes 3 Minutes
        </a>
      </motion.div>

      {/* Inline Demo CTA block */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-col items-center mt-12 max-w-[560px] mx-auto"
      >
        {/* Divider */}
        <div className="w-[120px] h-px bg-border-subtle mb-8" />

        {/* Pulsing icon */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="mb-3"
        >
          <PlayCircle size={32} className="text-orion-blue" />
        </motion.div>

        <h3 className="font-satoshi font-bold text-[22px] text-text-primary text-center mb-3">
          Want to see this in action?
        </h3>
        <p className="font-inter text-[15px] text-text-secondary text-center max-w-[400px] mb-6">
          Watch how an agent goes from signup to live funnel — with leads flowing in — in under 10 minutes.
        </p>

        {/*
          DEMO VIDEO CTA — ACTIVATION INSTRUCTIONS:
          When the demo video is ready, replace the onClick smooth-scroll behavior
          with a modal video player. Recommended implementation:
          1. Set state: const [videoOpen, setVideoOpen] = useState(false)
          2. On click: setVideoOpen(true)
          3. Render a Framer Motion AnimatePresence modal overlay containing:
             - Backdrop: rgba(7,11,20,0.92) with backdrop-blur-sm
             - Inner card: var(--color-bg-surface), border-radius var(--radius-xl)
             - Video embed: <iframe> or react-player pointing to YouTube/Vimeo URL
             - Close button: X icon top-right, var(--color-text-muted)
          4. Replace the scrollTo below with: onClick={() => setVideoOpen(true)}
          Suggested video URL variable: const DEMO_VIDEO_URL = ""; // paste URL here
        */}
        <button
          onClick={() => scrollToSection("#how-it-works")}
          className="inline-flex items-center justify-center gap-2 font-satoshi font-bold text-text-secondary border border-border-default px-8 py-3.5 rounded-[var(--radius-md)] text-[15px] hover:border-orion-blue hover:text-text-primary hover:bg-bg-elevated/50"
          style={{ transition: "all var(--transition-base)" }}
        >
          <Play size={16} fill="currentColor" className="shrink-0" />
          See AgentOrion In Action
        </button>

        {/* UPDATE THIS TEXT when video is live: change to "▶ 90-second demo — watch how agents launch their first funnel" */}
        <p className="text-text-muted text-xs font-inter text-center mt-3">
          ▶ 90-second walkthrough — no signup required to watch
        </p>
      </motion.div>
    </div>
  </section>
);

export default HowItWorks;
