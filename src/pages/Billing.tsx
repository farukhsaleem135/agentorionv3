import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { CreditCard, Crown, ArrowUpRight, CheckCircle2, Calendar, Receipt } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";


const TIER_INFO: Record<string, { label: string; price: string; features: string[] }> = {
  free: { label: "Free", price: "$0/mo", features: ["1 funnel", "50 leads/mo", "Basic insights"] },
  growth: { label: "Growth", price: "$29/mo", features: ["5 funnels", "500 leads/mo", "AI content", "Ad campaigns"] },
  pro: { label: "Pro", price: "$79/mo", features: ["Unlimited funnels", "Unlimited leads", "Autopilot", "Market Intel", "Priority support"] },
  team: { label: "Team", price: "$149/mo", features: ["Everything in Pro", "5 seats", "Team analytics", "Shared funnels"] },
  brokerage: { label: "Brokerage", price: "$399/mo", features: ["Everything in Team", "Unlimited seats", "Brokerage dashboard", "White-label"] },
};

const Billing = () => {
  const { tier, setShowUpgrade, setUpgradeReason } = useSubscription();
  const { user } = useAuth();

  const currentTier = tier || "free";
  const info = TIER_INFO[currentTier] || TIER_INFO.free;

  const handleUpgrade = () => {
    setUpgradeReason("");
    setShowUpgrade(true);
  };

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4 max-w-2xl mx-auto">
        <h1 className="font-display text-xl font-bold text-foreground mb-5">Billing & Plan</h1>

        {/* Current Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl p-5 border border-border shadow-card mb-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                <Crown size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">{info.label} Plan</h2>
                <p className="text-sm text-muted-foreground">{info.price}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
              Active
            </span>
          </div>

          <div className="space-y-2 pt-3 border-t border-border">
            {info.features.map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 size={14} className="text-primary shrink-0" />
                {f}
              </div>
            ))}
          </div>

          {currentTier !== "brokerage" && (
            <Button onClick={handleUpgrade} className="w-full mt-4 gap-2">
              <ArrowUpRight size={16} />
              Upgrade Plan
            </Button>
          )}
        </motion.div>

        {/* Billing Details */}
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <CreditCard size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Payment Method</p>
              <p className="text-[11px] text-muted-foreground">
                {currentTier === "free" ? "No payment method on file" : "Managed via Stripe"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Calendar size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Billing Cycle</p>
              <p className="text-[11px] text-muted-foreground">Monthly</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border"
          >
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
              <Receipt size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Invoices</p>
              <p className="text-[11px] text-muted-foreground">View and download past invoices</p>
            </div>
          </motion.div>
        </div>
      </div>
    </MobileShell>
  );
};

export default Billing;
