import { motion } from "framer-motion";
import { ArrowUp, Play } from "lucide-react";
import StarField from "./StarField";

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: "easeOut" as const },
});

const HeroSection = () => {
  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex flex-col items-center justify-center overflow-hidden bg-bg-base pt-28 sm:pt-32 pb-16 sm:pb-24" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
      {/* Gradient blooms */}
      <div
        className="hero-gradient-bloom absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 35% 40%, rgba(45,107,228,0.15), transparent 70%)",
          transition: "background 200ms ease",
        }}
      />
      <div
        className="hero-gradient-bloom-secondary absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 40% 40% at 75% 70%, rgba(107,63,160,0.10), transparent 60%)",
          transition: "background 200ms ease",
        }}
      />
      <StarField count={100} />

      <div className="relative z-10 max-w-[900px] mx-auto text-center px-4 sm:px-6">
        {/* Eyebrow */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border-brand/40 bg-border-subtle/60 mb-6" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
          <span className="text-orion-blue text-xs">✦</span>
          <span className="text-orion-blue text-xs font-medium tracking-wide">AI-Powered Real Estate Automation</span>
        </motion.div>

        {/* H1 */}
        <motion.h1 {...fadeUp(0.15)} className="font-satoshi font-bold text-[42px] sm:text-[56px] lg:text-[72px] leading-[1.05] tracking-tight text-text-primary mb-6">
          Your{" "}
          <span className="text-gradient-orion">North Star</span>
          {" "}for Real Estate Growth.
        </motion.h1>

        {/* Sub */}
        <motion.p {...fadeUp(0.3)} className="text-text-secondary text-base sm:text-lg lg:text-xl max-w-[600px] mx-auto mb-8 leading-relaxed">
          AgentOrion unifies lead generation, AI nurturing, funnel building, and analytics into one intelligent platform — so your business grows whether you're working or not.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.45)} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-3">
          <a
            href="/auth"
            className="w-full sm:w-auto inline-flex items-center justify-center font-satoshi font-bold text-text-inverse bg-orion-blue px-8 py-3.5 rounded-[var(--radius-md)] text-[15px] shadow-brand hover:bg-orion-blue-hover hover:-translate-y-px hover:shadow-[0_0_28px_rgba(45,107,228,0.45)] active:scale-[0.98]"
            style={{ transition: "all var(--transition-base)" }}
          >
            Start Free — No Credit Card
          </a>
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 font-satoshi font-bold text-text-secondary border border-border-default px-8 py-3.5 rounded-[var(--radius-md)] text-[15px] hover:border-orion-blue hover:text-text-primary hover:bg-bg-elevated/50"
            style={{ transition: "all var(--transition-base)" }}
          >
            <Play size={16} fill="currentColor" className="shrink-0" />
            See AgentOrion In Action
          </button>
        </motion.div>

        {/* UPDATE THIS TEXT when video is live: change to "▶ 90-second demo — watch how agents launch their first funnel" */}
        <motion.p {...fadeUp(0.5)} className="text-text-muted text-xs font-inter text-center mt-3">
          ▶ 90-second walkthrough — no signup required to watch
        </motion.p>

        {/* Social Proof */}
        <motion.p {...fadeUp(0.6)} className="text-text-tertiary text-sm mt-4">
          ★★★★★ Trusted by 2,400+ real estate agents · No contracts · Cancel anytime
        </motion.p>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: [0, -8, 0] }}
          transition={{ opacity: { duration: 0.6, delay: 0.75 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.5 } }}
          className="mt-12 sm:mt-16 mx-auto max-w-[800px]"
        >
          <div className="bg-bg-surface border border-border-subtle rounded-xl overflow-hidden" style={{ boxShadow: "var(--shadow-hero)", transition: "background-color 350ms ease, border-color 350ms ease, box-shadow 350ms ease" }}>
            {/* Browser chrome */}
            <div className="flex items-center px-3 py-2 bg-bg-subtle border-b border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
              <div className="flex items-center gap-2">
                <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]" />
                <div className="w-[10px] h-[10px] rounded-full bg-[#28C840]" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-border-subtle rounded px-4 py-1 w-[200px] text-center" style={{ transition: "background-color 350ms ease" }}>
                  <span className="text-text-muted text-[11px] font-inter">app.agentorion.com</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" style={{ backgroundColor: "var(--color-signal-green-bg)", borderColor: "var(--color-signal-green)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-signal-green animate-[pulse_1.5s_ease-in-out_infinite]" />
                <span className="text-signal-green text-[10px] font-bold font-inter">AUTOPILOT ON</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-5">
                <div className="bg-bg-subtle rounded-lg p-3 sm:p-4 border border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
                  <p className="text-text-tertiary text-[10px] sm:text-[11px] mb-1 font-inter">Active Leads</p>
                  <p className="font-jetbrains text-xl sm:text-[28px] font-bold text-pulse-gold">47</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp size={10} className="text-signal-green" />
                    <span className="text-signal-green text-[10px] font-inter">+12% this week</span>
                  </div>
                </div>
                <div className="bg-bg-subtle rounded-lg p-3 sm:p-4 border border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
                  <p className="text-text-tertiary text-[10px] sm:text-[11px] mb-1 font-inter">Pipeline Value</p>
                  <p className="font-jetbrains text-xl sm:text-[28px] font-bold text-signal-green">$2.4M</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp size={10} className="text-signal-green" />
                    <span className="text-signal-green text-[10px] font-inter">+$340K</span>
                  </div>
                </div>
                <div className="bg-bg-subtle rounded-lg p-3 sm:p-4 border border-border-subtle" style={{ transition: "background-color 350ms ease, border-color 350ms ease" }}>
                  <p className="text-text-tertiary text-[10px] sm:text-[11px] mb-1 font-inter">Growth Score</p>
                  <div className="flex items-center gap-2">
                    <p className="font-jetbrains text-xl sm:text-[28px] font-bold text-orion-blue">82<span className="text-base">/100</span></p>
                    <svg width="28" height="28" viewBox="0 0 28 28" className="hidden sm:block">
                      <circle cx="14" cy="14" r="11" fill="none" stroke="var(--color-border-subtle)" strokeWidth="3" />
                      <circle cx="14" cy="14" r="11" fill="none" stroke="var(--color-orion-blue)" strokeWidth="3" strokeDasharray={`${2 * Math.PI * 11 * 0.82} ${2 * Math.PI * 11 * 0.18}`} strokeLinecap="round" transform="rotate(-90 14 14)" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div>
                <p className="text-text-tertiary text-[11px] font-inter mb-2">Lead Activity — Last 7 Days</p>
                <svg viewBox="0 0 280 80" className="w-full h-auto" preserveAspectRatio="none">
                  {[
                    { h: 28, d: "M" },
                    { h: 45, d: "T" },
                    { h: 35, d: "W" },
                    { h: 58, d: "T" },
                    { h: 50, d: "F" },
                    { h: 65, d: "S" },
                    { h: 42, d: "S" },
                  ].map((bar, i) => (
                    <g key={i}>
                      <rect
                        x={i * 40 + 4}
                        y={68 - bar.h}
                        width={28}
                        height={bar.h}
                        rx={4}
                        fill="var(--color-orion-blue)"
                        opacity={0.7}
                      />
                      <rect
                        x={i * 40 + 4}
                        y={68 - bar.h}
                        width={28}
                        height={3}
                        rx={1.5}
                        fill="var(--color-orion-blue)"
                        style={{ filter: "drop-shadow(0 -2px 4px var(--color-orion-blue))" }}
                      />
                      <text
                        x={i * 40 + 18}
                        y={78}
                        textAnchor="middle"
                        fill="var(--color-text-muted)"
                        fontSize="9"
                        fontFamily="JetBrains Mono, monospace"
                      >
                        {bar.d}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
