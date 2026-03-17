import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Rocket, BarChart3 } from "lucide-react";
import { useSubscription, Tier } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const UpgradeModal = () => {
  const {
    showUpgrade, setShowUpgrade,
    upgradeTarget, setUpgradeTarget,
    tier: currentTier,
    usage,
    flags,
    refreshSubscription,
    trackEvent,
  } = useSubscription();
  const { user } = useAuth();
  const { toast } = useToast();
  const [upgrading, setUpgrading] = useState(false);

  const handleUpgrade = async (targetTier: Tier) => {
    if (!user) return;
    setUpgrading(true);

    const { error } = await supabase
      .from("subscriptions")
      .update({
        tier: targetTier,
        billing_period: "monthly",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      })
      .eq("user_id", user.id);

    if (error) {
      await supabase.from("subscriptions").insert({
        user_id: user.id,
        tier: targetTier,
        billing_period: "monthly",
        status: "active",
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
      });
    }

    trackEvent("upgrade_accepted", { from: currentTier, to: targetTier });
    await refreshSubscription();
    setUpgrading(false);
    setShowUpgrade(false);
    toast({
      title: `Upgraded to ${targetTier.charAt(0).toUpperCase() + targetTier.slice(1)}!`,
      description: "Your features have been unlocked.",
    });
  };

  const handleDismiss = () => {
    trackEvent("upgrade_dismissed", { target: upgradeTarget, tier: currentTier });
    setShowUpgrade(false);
  };

  const target = upgradeTarget || "growth";

  return (
    <AnimatePresence>
      {showUpgrade && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] bg-background/90 backdrop-blur-md flex items-end sm:items-center justify-center"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="w-full max-w-md mx-4 mb-0 sm:mb-0 rounded-t-2xl sm:rounded-2xl bg-card border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {target === "growth" ? <GrowthContent onClose={handleDismiss} /> : <ProContent onClose={handleDismiss} />}

            {/* CTAs */}
            <div className="px-5 pb-6 pt-2 space-y-2.5 safe-bottom">
              <button
                onClick={() => handleUpgrade(target)}
                disabled={upgrading}
                className="w-full py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform shadow-glow disabled:opacity-50"
              >
                {upgrading
                  ? "Upgrading..."
                  : target === "growth"
                    ? "Upgrade to Growth — $29/mo"
                    : "Upgrade to Pro — $59/mo"}
              </button>
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl text-muted-foreground text-xs font-medium active:scale-[0.98] transition-transform"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GrowthContent = ({ onClose }: { onClose: () => void }) => {
  const { usage, flags } = useSubscription();
  const funnelPct = Math.min((usage.funnelCount / flags.max_funnels) * 100, 100);
  const leadPct = Math.min((usage.leadCount / flags.max_leads_per_month) * 100, 100);

  const features = [
    "Unlimited funnels — launch as many as you need",
    "Smart budget control with ad management",
    "Retargeting automation to recapture visitors",
    "Easy plain-English ROI dashboard",
  ];

  return (
    <div className="px-5 pt-6">
      {/* Close */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Rocket size={20} className="text-primary" />
        </div>
        <button
          onClick={onClose}
          className="p-2 -mr-2 -mt-1"
          aria-label="Close"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      <h2 className="font-display text-lg font-bold text-foreground mb-1">
        🚀 Level Up Your Lead Game
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        You're generating demand — now unlock the tools to turn it into predictable closings.
      </p>

      {/* Usage progress */}
      <div className="space-y-3 mb-5">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-muted-foreground">Funnels</span>
            <span className="text-[11px] font-medium text-foreground">{usage.funnelCount} / {flags.max_funnels}</span>
          </div>
          <Progress value={funnelPct} className="h-2" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-muted-foreground">Leads this month</span>
            <span className="text-[11px] font-medium text-foreground">{usage.leadCount} / {flags.max_leads_per_month}</span>
          </div>
          <Progress value={leadPct} className="h-2" />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-2.5 mb-4">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={11} className="text-primary" />
            </div>
            <span className="text-[12px] text-foreground leading-snug">{f}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─── Pro Content ─── */
const ProContent = ({ onClose }: { onClose: () => void }) => {
  const features = [
    "Full attribution tracking across all channels",
    "A/B testing engine for headline & funnel variants",
    "Retargeting segmentation builder",
    "Cohort & funnel analytics with drop-off analysis",
    "Exportable performance reports",
  ];

  return (
    <div className="px-5 pt-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <BarChart3 size={20} className="text-primary" />
        </div>
        <button onClick={onClose} className="p-2 -mr-2 -mt-1" aria-label="Close">
          <X size={16} className="text-muted-foreground" />
        </button>
      </div>

      <h2 className="font-display text-lg font-bold text-foreground mb-1">
        📈 Ready to Optimize Like a Pro?
      </h2>
      <p className="text-xs text-muted-foreground mb-5">
        You're running serious growth — Pro gives you precision.
      </p>

      <div className="space-y-2.5 mb-4">
        {features.map((f) => (
          <div key={f} className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
              <Check size={11} className="text-primary" />
            </div>
            <span className="text-[12px] text-foreground leading-snug">{f}</span>
          </div>
        ))}
      </div>

      {/* Confidence reinforcement */}
      <div className="bg-primary/5 border border-primary/15 rounded-xl p-3 mb-4">
        <p className="text-[11px] text-muted-foreground italic leading-relaxed">
          "Agents using Pro see clearer cost insights and make more confident decisions."
        </p>
      </div>
    </div>
  );
};

export default UpgradeModal;
