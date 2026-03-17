import { useSubscription, VOICE_MINUTE_LIMITS } from "@/contexts/SubscriptionContext";
import { motion } from "framer-motion";
import { Mic } from "lucide-react";

const UsageMeter = () => {
  const { tier, flags, usage, setShowUpgrade, setUpgradeReason } = useSubscription();

  const funnelLimit = flags.max_funnels === -1 ? Infinity : flags.max_funnels;
  const leadLimit = flags.max_leads_per_month === -1 ? Infinity : flags.max_leads_per_month;
  const voiceLimit = VOICE_MINUTE_LIMITS[tier];
  const voiceUnlimited = voiceLimit === -1;

  const funnelPct = funnelLimit === Infinity ? 0 : Math.min((usage.funnelCount / funnelLimit) * 100, 100);
  const leadPct = leadLimit === Infinity ? 0 : Math.min((usage.leadCount / leadLimit) * 100, 100);
  const voicePct = voiceUnlimited ? 0 : voiceLimit > 0 ? Math.min((usage.voiceMinutesUsed / voiceLimit) * 100, 100) : 0;

  const showFunnels = funnelLimit !== Infinity;
  const showLeads = leadLimit !== Infinity;
  const showVoice = tier !== "pro"; // Show for free (locked) and growth (metered)

  if (!showFunnels && !showLeads && !showVoice) return null;

  const handleClick = () => {
    setUpgradeReason(
      tier === "free"
        ? `You're using ${usage.funnelCount}/${funnelLimit} funnels and ${usage.leadCount}/${leadLimit} leads. Upgrade to unlock more.`
        : "Upgrade to Pro for unlimited access and advanced analytics."
    );
    setShowUpgrade(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-xl p-4 border border-border shadow-card cursor-pointer active:scale-[0.98] transition-transform"
      onClick={handleClick}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display text-xs font-semibold text-foreground">Plan Usage</h4>
        <span className="text-[10px] font-semibold text-primary capitalize">{tier} Plan</span>
      </div>
      {showFunnels && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Funnels</span>
            <span>{usage.funnelCount} / {funnelLimit}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${funnelPct >= 100 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${funnelPct}%` }}
            />
          </div>
        </div>
      )}
      {showLeads && (
        <div className="mb-2">
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <span>Leads this month</span>
            <span>{usage.leadCount} / {leadLimit}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${leadPct >= 100 ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${leadPct}%` }}
            />
          </div>
        </div>
      )}
      {showVoice && (
        <div>
          <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
            <div className="flex items-center gap-1">
              <Mic size={10} />
              <span>Voice minutes</span>
            </div>
            {tier === "free" ? (
              <span className="text-destructive font-semibold">Locked</span>
            ) : (
              <span>{usage.voiceMinutesUsed} / {voiceLimit} min</span>
            )}
          </div>
          {tier !== "free" && (
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${voicePct >= 90 ? "bg-destructive" : "bg-primary"}`}
                style={{ width: `${voicePct}%` }}
              />
            </div>
          )}
          {tier === "free" && (
            <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
              <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: "100%" }} />
            </div>
          )}
        </div>
      )}
      <p className="text-[10px] text-muted-foreground mt-2 text-center">Tap to view plans →</p>
    </motion.div>
  );
};

export default UsageMeter;