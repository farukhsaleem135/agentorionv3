import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles, Crown, Eye, Zap, Send, Copy, PenTool, Loader2 } from "lucide-react";
import { useHybridGuide } from "@/contexts/HybridGuideContext";
import { useLocation, useNavigate } from "react-router-dom";
import { getHybridFlow, phaseConfig, HybridAction, HybridPhase } from "@/data/hybridFlows";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Progress } from "@/components/ui/progress";

const iconMap = {
  sparkles: Sparkles,
  send: Send,
  navigate: ChevronRight,
  copy: Copy,
  crown: Crown,
  zap: Zap,
  eye: Eye,
  pen: PenTool,
};

const phaseIconMap: Record<string, typeof Eye> = {
  eye: Eye,
  sparkles: Sparkles,
  zap: Zap,
  crown: Crown,
};

const phaseColorMap: Record<string, string> = {
  info: "bg-info/15 text-info",
  primary: "bg-primary/15 text-primary",
  success: "bg-success/15 text-success",
  accent: "bg-accent/15 text-accent",
};

const HybridGuide = () => {
  const { isOpen, close, currentStep, setCurrentStep, executingAction, setExecutingAction } = useHybridGuide();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { tier, setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();

  const flow = getHybridFlow(pathname);
  if (!flow) return null;

  const totalSteps = flow.steps.length;
  const step = flow.steps[currentStep] || flow.steps[0];
  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;
  const isPro = tier === "pro";

  const config = phaseConfig[step.phase];
  const PhaseIcon = phaseIconMap[config.icon] || Eye;

  const handleAction = (action: HybridAction) => {
    if (action.proOnly && !isPro) {
      setUpgradeTarget("pro");
      setUpgradeReason(action.description || "Unlock this feature with Pro.");
      setShowUpgrade(true);
      return;
    }

    if (action.type === "navigate") {
      close();
      if (action.payload) navigate(action.payload);
    } else if (action.type === "ai-execute" || action.type === "ai-draft") {
      setExecutingAction(action.payload || action.label);
      // Simulate AI execution feedback
      setTimeout(() => {
        setExecutingAction(null);
        // Move to next step after AI action
        if (!isLast) setCurrentStep(currentStep + 1);
      }, 2000);
    } else if (action.type === "info") {
      // Info actions just acknowledge
      if (!isLast) setCurrentStep(currentStep + 1);
    }
  };

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
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${phaseColorMap[config.color]} flex items-center justify-center shrink-0`}>
                    <PhaseIcon size={16} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-display text-base font-bold text-foreground leading-tight truncate">
                      {flow.screenTitle}
                    </h2>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 truncate">
                      {flow.greeting}
                    </p>
                  </div>
                </div>
                <button
                  onClick={close}
                  className="p-2 rounded-xl bg-secondary active:scale-95 transition-transform shrink-0 ml-2"
                  aria-label="Close guide"
                >
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* Phase indicators + progress */}
              <div className="mt-3 flex items-center gap-1.5">
                {flow.steps.map((s, i) => {
                  const pc = phaseConfig[s.phase];
                  const isActive = i === currentStep;
                  const isDone = i < currentStep;
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentStep(i)}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        isActive
                          ? "bg-primary shadow-glow"
                          : isDone
                            ? "bg-primary/40"
                            : "bg-muted"
                      }`}
                      aria-label={`${pc.label} step`}
                    />
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  config.color === "info" ? "text-info" :
                  config.color === "primary" ? "text-primary" :
                  config.color === "success" ? "text-success" :
                  "text-accent"
                }`}>
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {currentStep + 1} / {totalSteps}
                </span>
              </div>
            </div>

            {/* Step content */}
            <div className="px-5 pb-3 min-h-[180px]">
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

                    {/* AI Actions */}
                    {step.actions && step.actions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {step.actions.map((action, idx) => {
                          const ActionIcon = iconMap[action.icon] || Sparkles;
                          const isExecuting = executingAction === (action.payload || action.label);
                          const isLocked = action.proOnly && !isPro;

                          return (
                            <button
                              key={idx}
                              onClick={() => handleAction(action)}
                              disabled={!!executingAction}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all active:scale-[0.98] disabled:opacity-60 ${
                                isLocked
                                  ? "bg-accent/5 border-accent/15 hover:bg-accent/10"
                                  : "bg-primary/5 border-primary/15 hover:bg-primary/10"
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                isLocked ? "bg-accent/15" : "bg-primary/15"
                              }`}>
                                {isExecuting ? (
                                  <Loader2 size={14} className="animate-spin text-primary" />
                                ) : isLocked ? (
                                  <Crown size={14} className="text-accent" />
                                ) : (
                                  <ActionIcon size={14} className="text-primary" />
                                )}
                              </div>
                              <div className="text-left flex-1 min-w-0">
                                <span className="text-[13px] font-medium text-foreground block leading-tight">
                                  {action.label}
                                </span>
                                {action.description && (
                                  <span className="text-[11px] text-muted-foreground leading-snug">
                                    {action.description}
                                  </span>
                                )}
                              </div>
                              {isLocked && (
                                <span className="text-[10px] text-accent font-medium shrink-0">Pro</span>
                              )}
                              {isExecuting && (
                                <span className="text-[10px] text-primary font-medium shrink-0">Working...</span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Pro Tip */}
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

export default HybridGuide;
