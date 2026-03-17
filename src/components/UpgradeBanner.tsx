import { motion } from "framer-motion";
import { useSubscription, Tier } from "@/contexts/SubscriptionContext";

interface UpgradeBannerProps {
  target: "growth" | "pro";
}

const UpgradeBanner = ({ target }: UpgradeBannerProps) => {
  const { tier, setShowUpgrade, setUpgradeTarget, trackEvent } = useSubscription();

  // Don't show if already on target tier or higher
  const tierOrder: Tier[] = ["free", "growth", "pro"];
  if (tierOrder.indexOf(tier) >= tierOrder.indexOf(target)) return null;

  const config = target === "growth"
    ? {
        emoji: "📊",
        text: "You're close to Growth — unlock unlimited funnels + smarter spend for $29/mo.",
        cta: "Upgrade to Growth",
      }
    : {
        emoji: "🔍",
        text: "Want deeper insights and funnel control? Pro gives you full analytics.",
        cta: "Try Pro",
      };

  const handleClick = () => {
    trackEvent("banner_upgrade_click", { target });
    setUpgradeTarget(target);
    setShowUpgrade(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 flex items-center gap-3"
    >
      <span className="text-base shrink-0">{config.emoji}</span>
      <p className="text-[11px] text-foreground flex-1 leading-snug">{config.text}</p>
      <button
        onClick={handleClick}
        className="shrink-0 px-3 py-1.5 rounded-lg bg-gradient-cta text-primary-foreground text-[11px] font-semibold active:scale-95 transition-transform whitespace-nowrap"
      >
        {config.cta}
      </button>
    </motion.div>
  );
};

export default UpgradeBanner;
