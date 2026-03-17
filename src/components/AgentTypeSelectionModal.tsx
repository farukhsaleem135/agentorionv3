import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, TrendingUp, ArrowRight, Sparkles, Clock, Shield, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import StarField from "@/components/landing/StarField";
import OrionLogo from "@/components/landing/OrionLogo";

type AgentType = "new" | "experienced";
type ModalStep = "select" | "confirm";

interface AgentTypeSelectionModalProps {
  onComplete: (agentType: AgentType, navigate: string) => void;
  onSkip: () => void;
}

const AgentTypeSelectionModal = ({ onComplete, onSkip }: AgentTypeSelectionModalProps) => {
  const [step, setStep] = useState<ModalStep>("select");
  const [selectedType, setSelectedType] = useState<AgentType | null>(null);

  const handleSelect = (type: AgentType) => {
    setSelectedType(type);
    setStep("confirm");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-base overflow-auto">
      <StarField count={60} />
      <div className="relative z-10 w-full max-w-[640px] mx-auto px-6 py-10 flex flex-col items-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <OrionLogo variant="splash" />
        </motion.div>

        <AnimatePresence mode="wait">
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <h1 className="font-satoshi font-bold text-[28px] sm:text-[36px] text-text-primary text-center leading-tight">
                Welcome to AgentOrion
              </h1>
              <p className="font-inter text-base text-text-secondary text-center max-w-[480px] mt-3">
                Tell us about where you are in your career.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mt-8">
                {/* New Agent Card */}
                <button
                  onClick={() => handleSelect("new")}
                  className="text-left bg-bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 cursor-pointer hover:-translate-y-[3px] hover:border-orion-blue/50 hover:shadow-brand group"
                  style={{ transition: "all var(--transition-base)" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-orion-blue/15 flex items-center justify-center mb-4">
                    <Rocket size={24} className="text-orion-blue" />
                  </div>
                  <p className="font-satoshi font-bold text-lg text-text-primary">I Am a New Agent</p>
                  <p className="font-inter text-sm text-text-secondary mt-2 leading-relaxed">
                    I am in my first 1–2 years and need to build my lead generation system from scratch. I want the 30 Day Launch Program.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orion-blue group-hover:gap-2.5 transition-all">
                      Start My Launch Program <ArrowRight size={14} />
                    </span>
                  </div>
                </button>

                {/* Experienced Agent Card */}
                <button
                  onClick={() => handleSelect("experienced")}
                  className="text-left bg-bg-surface border border-border-subtle rounded-[var(--radius-lg)] p-6 cursor-pointer hover:-translate-y-[3px] hover:border-signal-green/50 hover:shadow-brand group"
                  style={{ transition: "all var(--transition-base)" }}
                >
                  <div className="w-12 h-12 rounded-xl bg-signal-green/15 flex items-center justify-center mb-4">
                    <TrendingUp size={24} className="text-signal-green" />
                  </div>
                  <p className="font-satoshi font-bold text-lg text-text-primary">I Am an Experienced Agent</p>
                  <p className="font-inter text-sm text-text-secondary mt-2 leading-relaxed">
                    I have been selling for years but need a more consistent and automated approach to lead generation.
                  </p>
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-green group-hover:gap-2.5 transition-all">
                      Build My Automated Pipeline <ArrowRight size={14} />
                    </span>
                  </div>
                </button>
              </div>

              {/* Reassurance */}
              <div className="w-full mt-8 border-t border-border-subtle pt-5">
                <div className="flex flex-wrap items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-signal-green shrink-0" />
                    <span className="font-inter text-[13px] text-text-muted">Your data is secure</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-orion-blue shrink-0" />
                    <span className="font-inter text-[13px] text-text-muted">First funnel live in 10 min</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onSkip}
                className="font-inter text-[13px] text-text-disabled text-center mt-4 hover:text-text-muted transition-colors"
              >
                Skip for now — take me to the dashboard
              </button>
            </motion.div>
          )}

          {step === "confirm" && selectedType === "new" && (
            <motion.div
              key="new-confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-orion-blue/15 flex items-center justify-center mb-5">
                <Rocket size={32} className="text-orion-blue" />
              </div>
              <h1 className="font-satoshi font-bold text-[26px] sm:text-[32px] text-text-primary text-center leading-tight">
                Welcome — Your First Lead Funnel Will Be Live in 10 Minutes
              </h1>
              <p className="font-inter text-lg text-text-secondary text-center max-w-[480px] mt-3">
                We have built a day-by-day guide to take you from today to your first closing pipeline.
              </p>
              <p className="font-inter text-sm text-text-muted text-center max-w-[440px] mt-2">
                Every task takes 15–30 minutes and is powered by AI.
              </p>

              <Button
                className="mt-8 bg-orion-blue hover:bg-orion-blue/90 text-white px-8 py-3 h-auto text-base font-semibold rounded-xl"
                onClick={() => onComplete("new", "/launch-program")}
              >
                <Sparkles size={18} className="mr-2" /> Start Day 1 Now
              </Button>

              <button
                onClick={() => setStep("select")}
                className="font-inter text-[13px] text-text-muted text-center mt-4 hover:text-text-primary transition-colors"
              >
                ← Go back
              </button>
              <button
                onClick={onSkip}
                className="font-inter text-[13px] text-text-disabled text-center mt-2 hover:text-text-muted transition-colors"
              >
                Skip for now — take me to the dashboard
              </button>
            </motion.div>
          )}

          {step === "confirm" && selectedType === "experienced" && (
            <motion.div
              key="exp-confirm"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="w-full flex flex-col items-center mt-6"
            >
              <div className="w-16 h-16 rounded-2xl bg-signal-green/15 flex items-center justify-center mb-5">
                <TrendingUp size={32} className="text-signal-green" />
              </div>
              <h1 className="font-satoshi font-bold text-[26px] sm:text-[32px] text-text-primary text-center leading-tight">
                Welcome Back to Consistent Lead Generation
              </h1>
              <p className="font-inter text-lg text-text-secondary text-center max-w-[480px] mt-3">
                Let AgentOrion run your pipeline while you focus on closing.
              </p>
              <p className="font-inter text-sm text-text-muted text-center max-w-[440px] mt-2">
                In the next 30 minutes you can have your first AI lead funnel live, your Autopilot follow-up active, and your first week of social media content generated.
              </p>

              <Button
                className="mt-8 bg-signal-green hover:bg-signal-green/90 text-white px-8 py-3 h-auto text-base font-semibold rounded-xl"
                onClick={() => onComplete("experienced", "/")}
              >
                <TrendingUp size={18} className="mr-2" /> Set Up My Automated Pipeline
              </Button>

              <button
                onClick={() => setStep("select")}
                className="font-inter text-[13px] text-text-muted text-center mt-4 hover:text-text-primary transition-colors"
              >
                ← Go back
              </button>
              <button
                onClick={onSkip}
                className="font-inter text-[13px] text-text-disabled text-center mt-2 hover:text-text-muted transition-colors"
              >
                Skip for now — take me to the dashboard
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AgentTypeSelectionModal;
