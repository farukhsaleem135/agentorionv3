import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const BudgetSlider = () => {
  const { user } = useAuth();
  const [budget, setBudget] = useState([20]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("agent_settings")
        .select("daily_ad_budget")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) setBudget([data.daily_ad_budget]);
      setLoaded(true);
    };
    load();
  }, [user]);

  const persist = useCallback(
    async (value: number) => {
      if (!user) return;
      setSaving(true);
      const { data: existing } = await supabase
        .from("agent_settings")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("agent_settings")
          .update({ daily_ad_budget: value })
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("agent_settings")
          .insert({ user_id: user.id, daily_ad_budget: value });
      }
      setSaving(false);
    },
    [user]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-sm font-semibold text-foreground">Daily Ad Budget</h3>
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary">
          {saving ? (
            <Loader2 size={13} className="text-primary animate-spin" />
          ) : (
            <DollarSign size={13} className="text-primary" />
          )}
          <span className="font-display text-sm font-bold text-foreground">{budget[0]}/day</span>
        </div>
      </div>
      <Slider
        value={budget}
        onValueChange={setBudget}
        onValueCommit={(v) => persist(v[0])}
        min={5}
        max={50}
        step={5}
        className="w-full"
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-muted-foreground">$5</span>
        <span className="text-[10px] text-muted-foreground">$50</span>
      </div>
      <p className="text-xs text-muted-foreground mt-3">
        Budget is automatically allocated across your active funnels for maximum ROI.
      </p>
    </motion.div>
  );
};

export default BudgetSlider;
