import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useMode } from "@/contexts/ModeContext";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ProRecommendationBanner = () => {
  const { isAutopilot, setMode } = useMode();
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!user || !isAutopilot || dismissed) return;
    const check = async () => {
      const [leadsRes, funnelsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id", { count: "exact", head: true }),
        supabase.from("funnels").select("id", { count: "exact", head: true }),
      ]);
      const leadCount = leadsRes.count || 0;
      const funnelCount = funnelsRes.count || 0;
      if (leadCount >= 100 || funnelCount >= 3) {
        setShow(true);
      }
    };
    check();
  }, [user, isAutopilot, dismissed]);

  if (!isAutopilot || !show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="bg-gradient-gold rounded-xl p-4 flex items-start gap-3 shadow-gold"
        >
          <Sparkles size={18} className="text-primary-foreground shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-primary-foreground">You may benefit from Pro Mode</p>
            <p className="text-xs text-primary-foreground/80 mt-0.5">
              Unlock full analytics, A/B testing controls, and audience segmentation.
            </p>
            <button
              onClick={() => setMode("pro")}
              className="mt-2 text-xs font-bold text-primary-foreground underline underline-offset-2"
            >
              Switch to Pro →
            </button>
          </div>
          <button
            onClick={() => { setShow(false); setDismissed(true); }}
            className="p-1 rounded-lg hover:bg-primary-foreground/10 transition-colors"
          >
            <X size={14} className="text-primary-foreground" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProRecommendationBanner;
