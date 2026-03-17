import { ReactNode } from "react";
import { useSubscription, FeatureFlags } from "@/contexts/SubscriptionContext";
import { Lock } from "lucide-react";

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
  upgradeMessage?: string;
}

const FeatureGate = ({ feature, children, fallback, upgradeMessage }: FeatureGateProps) => {
  const { canUseFeature, setShowUpgrade, setUpgradeReason } = useSubscription();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  if (fallback) return <>{fallback}</>;

  return (
    <div
      onClick={() => {
        setUpgradeReason(upgradeMessage || `Upgrade your plan to unlock this feature.`);
        setShowUpgrade(true);
      }}
      className="relative rounded-xl border border-border bg-card/50 p-5 cursor-pointer active:scale-[0.98] transition-transform overflow-hidden"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
          <Lock size={16} className="text-muted-foreground" />
        </div>
        <p className="text-xs font-medium text-muted-foreground text-center px-4">
          {upgradeMessage || "Upgrade to unlock"}
        </p>
        <span className="text-[10px] text-primary font-semibold">View Plans →</span>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default FeatureGate;
