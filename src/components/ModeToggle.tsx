import { useMode } from "@/contexts/ModeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Zap, Settings2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ModeToggle = () => {
  const { mode, setMode } = useMode();
  const { canUseFeature, setShowUpgrade, setUpgradeTarget } = useSubscription();

  const handleProClick = () => {
    if (!canUseFeature("pro_mode")) {
      setUpgradeTarget("pro");
      setShowUpgrade(true);
      return;
    }
    setMode("pro");
  };

  const proButton = (
    <button
      onClick={handleProClick}
      className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        mode === "pro" ? "text-primary-foreground" : "text-muted-foreground"
      }`}
    >
      {mode === "pro" && (
        <motion.div
          layoutId="mode-pill"
          className="absolute inset-0 bg-gradient-cta rounded-lg"
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
        />
      )}
      {!canUseFeature("pro_mode") ? (
        <Lock size={10} className="relative z-10" />
      ) : (
        <Settings2 size={12} className="relative z-10" />
      )}
      <span className="relative z-10">Insights</span>
    </button>
  );

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border">
      <button
        onClick={() => setMode("autopilot")}
        className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          mode === "autopilot" ? "text-primary-foreground" : "text-muted-foreground"
        }`}
      >
        {mode === "autopilot" && (
          <motion.div
            layoutId="mode-pill"
            className="absolute inset-0 bg-gradient-cta rounded-lg"
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
          />
        )}
        <Zap size={12} className="relative z-10" />
        <span className="relative z-10">Autopilot</span>
      </button>
      {!canUseFeature("pro_mode") ? (
        <Tooltip>
          <TooltipTrigger asChild>{proButton}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Upgrade to Pro to unlock advanced analytics
          </TooltipContent>
        </Tooltip>
      ) : (
        proButton
      )}
    </div>
  );
};

export default ModeToggle;
