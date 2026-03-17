{/*
  POST-SIGNUP WELCOME SCREEN
  Appears once only — on first login after account creation.
  Controlled by localStorage flag 'agentorion-onboarding-seen'.

  DEMO VIDEO INTEGRATION CHECKLIST (complete when video is ready):
  [ ] Set DEMO_VIDEO_URL constant at top of file
  [ ] Replace "Watch Demo" card onClick with video modal open
  [ ] After video modal closes, proceed to dashboard with wizard
  [ ] Consider adding video thumbnail image to "Watch Demo" card
      (use a screenshot of the first frame — drives higher click rate
      than icon-only cards per standard onboarding research)
  [ ] A/B test: "Watch The Demo First" vs "See It In 90 Seconds"
      for card title — measure wizard completion rate as success metric
*/}

import { motion } from "framer-motion";
import { PlayCircle, Zap, Shield, Clock, X } from "lucide-react";
import StarField from "@/components/landing/StarField";
import OrionLogo from "@/components/landing/OrionLogo";

export const ONBOARDING_KEY = "agentorion-onboarding-seen";

interface WelcomeScreenProps {
  onWatchDemo: () => void;
  onJumpIn: () => void;
  onSkip: () => void;
}

const WelcomeScreen = ({ onWatchDemo, onJumpIn, onSkip }: WelcomeScreenProps) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base overflow-auto">
      <StarField count={60} />
      <div className="relative z-10 w-full max-w-[600px] mx-auto px-8 py-12 flex flex-col items-center">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <OrionLogo variant="splash" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="font-satoshi font-bold text-[32px] sm:text-[42px] text-text-primary text-center mt-6"
        >
          Welcome to AgentOrion.
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="font-inter text-lg text-text-secondary text-center max-w-[480px] mt-4"
        >
          You're 10 minutes away from your first live funnel and your first captured lead. Let's get you there.
        </motion.p>

        {/* Two Path Cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-10"
        >
          {/* Card 1 — Watch Demo */}
          {/*
            DEMO VIDEO — POST-SIGNUP ACTIVATION:
            When demo video is ready:
            1. On click, open video modal (same modal as landing page)
            2. After modal closes, proceed to dashboard with wizard active
            3. const DEMO_VIDEO_URL = ""; // paste URL here — same variable as landing page
            4. Consider auto-advancing to dashboard after video completes using
               onEnded callback from react-player
          */}
          <button
            onClick={onWatchDemo}
            className="text-left bg-bg-surface border border-border-brand rounded-[var(--radius-lg)] p-7 cursor-pointer hover:-translate-y-[3px] hover:shadow-brand group"
            style={{ transition: "all var(--transition-base)" }}
          >
            <PlayCircle size={28} className="text-orion-blue" />
            <p className="font-satoshi font-bold text-lg text-text-primary mt-3">
              Watch The Demo First
            </p>
            <p className="font-inter text-sm text-text-secondary mt-2">
              See exactly how AgentOrion works before you dive in. 90 seconds.
            </p>
            <p className="font-inter text-xs text-text-muted mt-4">
              ▶ Recommended for new users
            </p>
          </button>

          {/* Card 2 — Jump In */}
          <button
            onClick={onJumpIn}
            className="text-left bg-bg-elevated border border-border-subtle rounded-[var(--radius-lg)] p-7 cursor-pointer hover:-translate-y-0.5 hover:border-border-default group"
            style={{ transition: "all var(--transition-base)" }}
          >
            <Zap size={28} className="text-signal-green" />
            <p className="font-satoshi font-bold text-lg text-text-primary mt-3">
              Jump Right In
            </p>
            <p className="font-inter text-sm text-text-secondary mt-2">
              Go straight to your dashboard. The wizard will guide you step by step.
            </p>
            <p className="font-inter text-xs text-text-muted mt-4">
              ⚡ For agents ready to launch now
            </p>
          </button>
        </motion.div>

        {/* Reassurance Strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="w-full mt-8 border-t border-border-subtle pt-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-signal-green shrink-0" />
              <span className="font-inter text-[13px] text-text-muted">Your data is secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-orion-blue shrink-0" />
              <span className="font-inter text-[13px] text-text-muted">First funnel live in 10 min</span>
            </div>
            <div className="flex items-center gap-2">
              <X size={14} className="text-text-disabled shrink-0" />
              <span className="font-inter text-[13px] text-text-muted">No credit card needed</span>
            </div>
          </div>
        </motion.div>

        {/* Skip */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.1 }}
          onClick={onSkip}
          className="font-inter text-[13px] text-text-disabled text-center mt-4 hover:text-text-muted"
          style={{ transition: "color var(--transition-base)" }}
        >
          Skip intro and go to dashboard →
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
