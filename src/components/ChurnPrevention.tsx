import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ChurnPrevention = () => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const checkUsageDrop = useCallback(async () => {
    if (!user || dismissed) return;

    // Check if user dismissed recently (24h cooldown)
    const dismissedAt = localStorage.getItem(`churn-dismissed-${user.id}`);
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 86400000) return;

    // Check recent activity: compare last 7 days vs previous 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    const [recentRes, previousRes] = await Promise.all([
      supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", sevenDaysAgo.toISOString()),
      supabase
        .from("usage_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", fourteenDaysAgo.toISOString())
        .lt("created_at", sevenDaysAgo.toISOString()),
    ]);

    const recentCount = recentRes.count || 0;
    const previousCount = previousRes.count || 0;

    // Also check if user has no funnels or no leads as a "cold start" signal
    const [funnelsRes, leadsRes] = await Promise.all([
      supabase.from("funnels").select("id", { count: "exact", head: true }),
      supabase.from("funnel_leads").select("id", { count: "exact", head: true }),
    ]);

    const funnelCount = funnelsRes.count || 0;
    const leadCount = leadsRes.count || 0;

    // Churn signals
    if (previousCount > 3 && recentCount === 0) {
      setMessage("We noticed you haven't been active recently. Need help optimizing your funnels?");
      setShow(true);
    } else if (funnelCount === 0) {
      setMessage("You haven't created a funnel yet. Launch your first one to start capturing leads automatically.");
      setShow(true);
    } else if (funnelCount > 0 && leadCount === 0) {
      setMessage("Your funnels are set up but haven't captured leads yet. Let's review your targeting to improve results.");
      setShow(true);
    } else if (previousCount > 5 && recentCount <= 1) {
      setMessage("Your activity has dropped this week. A quick funnel review could boost your pipeline.");
      setShow(true);
    }
  }, [user, dismissed]);

  useEffect(() => {
    // Delay check to not compete with other loading
    const timer = setTimeout(checkUsageDrop, 3000);
    return () => clearTimeout(timer);
  }, [checkUsageDrop]);

  const handleDismiss = () => {
    setShow(false);
    setDismissed(true);
    if (user) {
      localStorage.setItem(`churn-dismissed-${user.id}`, String(Date.now()));
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-gradient-card rounded-xl p-4 border border-primary/20 shadow-card"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-foreground">Need Help Optimizing?</h4>
                <button onClick={handleDismiss} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <X size={12} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{message}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    handleDismiss();
                    window.location.href = "/funnels";
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[11px] font-semibold active:scale-95 transition-transform"
                >
                  <TrendingUp size={10} />
                  Review Funnels
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-muted-foreground text-[11px] font-medium active:scale-95 transition-transform"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChurnPrevention;
