import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Crown } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { useLocation } from "react-router-dom";
import { getWizardFlow } from "@/data/wizardContent";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Progress } from "@/components/ui/progress";

const WizardOverlay = () => {
  const { isOpen, close, currentStep, setCurrentStep } = useWizard();
  const { pathname } = useLocation();
  const { tier, setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();

  const flow = getWizardFlow(pathname);
  if (!flow) return null;

  const totalSteps = flow.steps.length;
  const step = flow.steps[currentStep] || flow.steps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isPro = tier === "pro";

  const handleProLink = () => {
    setUpgradeTarget("pro");
    setUpgradeReason(flow.proUnlockSummary || "Unlock Pro features to accelerate your growth.");
    setShowUpgrade(true);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/70 backdrop-blur-md"
          onClick={close}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 32 }}
            className="absolute bottom-0 left-0 right-0 max-w-lg mx-auto bg-card border-t border-border rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-muted" />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Sparkles size={16} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-base font-bold text-foreground leading-tight">
                      {flow.screenTitle}
                    </h2>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                      {flow.screenDescription}
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-xl bg-secondary active:scale-95 transition-transform"
                  aria-label="Close guide"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-3 flex items-center gap-2">
                <Progress value={progressPercent} className="h-1.5 flex-1" />
                <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
            </div>

            {/* Step content */}
            <div className="px-5 pb-3 min-h-[160px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="rounded-xl bg-secondary/60 border border-border p-4">
                    <h3 className="font-display text-sm font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-[13px] text-secondary-foreground leading-relaxed">
                      {step.body}
                    </p>

                    {step.proTip && !isPro && (
                      <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-accent/10 border border-accent/20">
                        <Crown size={14} className="text-accent mt-0.5 shrink-0" />
                        <p className="text-[12px] text-accent leading-snug">
                          {step.proTip}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="px-5 pb-6 flex items-center gap-2">
              {!isFirst && (
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium text-foreground active:scale-95 transition-transform"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}

              <div className="flex-1" />

              {isFirst && (
                <button
                  onClick={close}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground active:scale-95 transition-transform"
                >
                  Skip
                </button>
              )}

              {!isLast ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-cta text-sm font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  {flow.proUnlockSummary && !isPro && (
                    <button
                      onClick={handleProLink}
                      className="flex items-center gap-1 px-4 py-2.5 rounded-xl bg-accent/15 border border-accent/25 text-sm font-medium text-accent active:scale-95 transition-transform"
                    >
                      <Crown size={14} />
                      See Pro
                    </button>
                  )}
                  <button
                    onClick={close}
                    className="flex items-center gap-1 px-5 py-2.5 rounded-xl bg-gradient-cta text-sm font-semibold text-primary-foreground shadow-glow active:scale-95 transition-transform"
                  >
                    Got it
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WizardOverlay;
