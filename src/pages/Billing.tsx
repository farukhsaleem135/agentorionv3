import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { CreditCard, Crown, ArrowUpRight, CheckCircle2, Calendar, Receipt, XCircle, Loader2 } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const { toast } = useToast();
  const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
  const [periodEnd, setPeriodEnd] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const currentTier = tier || "free";
  const info = TIER_INFO[currentTier] || TIER_INFO.free;

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("cancel_at_period_end, current_period_end")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setCancelAtPeriodEnd(data.cancel_at_period_end || false);
          setPeriodEnd(data.current_period_end);
        }
      });
  }, [user]);

  const handleUpgrade = () => {
    setUpgradeReason("");
    setShowUpgrade(true);
  };

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const { data, error } = await supabase.functions.invoke("cancel-subscription");
      if (error) throw error;
      setCancelAtPeriodEnd(true);
      if (data?.current_period_end) setPeriodEnd(data.current_period_end);
      toast({
        title: "Subscription canceled",
        description: "You'll keep access until the end of your billing period.",
      });
    } catch (err: any) {
      toast({
        title: "Cancellation failed",
        description: err.message || "Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setCanceling(false);
      setShowCancelDialog(false);
    }
  };

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : null;

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4 max-w-2xl mx-auto">
        <h1 className="font-display text-xl font-bold text-foreground mb-5">Billing & Plan</h1>

        {/* Cancellation notice */}
        {cancelAtPeriodEnd && currentTier !== "free" && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive"
          >
            Your subscription is set to cancel{formattedPeriodEnd ? ` on ${formattedPeriodEnd}` : " at the end of your billing period"}.
            You'll retain access to {info.label} features until then.
          </motion.div>
        )}

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
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
              cancelAtPeriodEnd
                ? "bg-destructive/10 text-destructive"
                : "bg-primary/10 text-primary"
            }`}>
              {cancelAtPeriodEnd ? "Canceling" : "Active"}
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

          {currentTier !== "brokerage" && !cancelAtPeriodEnd && (
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
              <p className="text-[11px] text-muted-foreground">
                {formattedPeriodEnd ? `Renews ${formattedPeriodEnd}` : "Monthly"}
              </p>
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

        {/* Cancel Subscription */}
        {currentTier !== "free" && !cancelAtPeriodEnd && (
          <button
            onClick={() => setShowCancelDialog(true)}
            className="w-full flex items-center justify-center gap-2 p-4 mt-6 rounded-xl border border-destructive/20 text-destructive text-sm font-medium active:scale-[0.98] transition-transform"
          >
            <XCircle size={16} />
            Cancel Subscription
          </button>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel your {info.label} plan?</AlertDialogTitle>
            <AlertDialogDescription>
              Your subscription will remain active until the end of your current billing period
              {formattedPeriodEnd ? ` (${formattedPeriodEnd})` : ""}. After that, you'll be downgraded
              to the Free plan. You can re-subscribe anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={canceling}>Keep Plan</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={canceling}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {canceling ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
              {canceling ? "Canceling..." : "Yes, Cancel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MobileShell>
  );
};

export default Billing;
