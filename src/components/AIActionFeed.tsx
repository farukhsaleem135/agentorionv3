import { motion } from "framer-motion";
import { Sparkles, ChevronRight, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AISuggestion {
  id: string;
  text: string;
  subtext?: string;
  type: "urgent" | "opportunity" | "nurture";
  path: string;
}

const typeStyles = {
  urgent: "border-l-hot bg-hot/5",
  opportunity: "border-l-primary bg-primary/5",
  nurture: "border-l-info bg-info/5",
};

const typeIcons = {
  urgent: "bg-hot/15 text-hot",
  opportunity: "bg-primary/15 text-primary",
  nurture: "bg-info/15 text-info",
};

const AIActionFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);

  useEffect(() => {
    if (!user) return;

    const build = async () => {
      const [leadsRes, funnelsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id, name, temperature, created_at, budget, email, phone, status, urgency_score, seller_prediction_score"),
        supabase.from("funnels").select("id, name, views, leads_count, status"),
      ]);

      const items: AISuggestion[] = [];
      const leads = leadsRes.data || [];
      const funnels = funnelsRes.data || [];

      // High-urgency leads
      const urgentLeads = leads.filter(l => (l.urgency_score || 0) >= 70 && l.status !== "closed");
      if (urgentLeads.length > 0) {
        const lead = urgentLeads[0];
        items.push({
          id: "urgent-lead",
          text: `${lead.name || "A lead"} has high urgency (score: ${lead.urgency_score}) — reach out today`,
          subtext: "High-intent leads convert 3× faster with same-day follow-up",
          type: "urgent",
          path: `/leads/${lead.id}`,
        });
      }

      // Stalled leads (created >48h ago, still open, warm/hot)
      const stalledLeads = leads.filter(l => {
        const age = Date.now() - new Date(l.created_at).getTime();
        return age > 48 * 60 * 60 * 1000 && l.status !== "closed" && (l.temperature === "hot" || l.temperature === "warm");
      });
      if (stalledLeads.length > 0) {
        items.push({
          id: "stalled",
          text: `${stalledLeads.length} lead${stalledLeads.length > 1 ? "s" : ""} haven't been contacted in 48+ hours`,
          subtext: "Auto-nurture recommended to prevent cooling",
          type: "nurture",
          path: "/leads",
        });
      }

      // Low-converting funnel
      const activeFunnels = funnels.filter(f => (f.status === "active" || f.status === "live") && f.views >= 10);
      const lowConv = activeFunnels.filter(f => f.views > 0 && (f.leads_count / f.views) < 0.02);
      if (lowConv.length > 0) {
        items.push({
          id: "low-conv",
          text: `"${lowConv[0].name}" has low conversion (${((lowConv[0].leads_count / lowConv[0].views) * 100).toFixed(1)}%)`,
          subtext: "Try A/B testing the headline or adjusting the CTA",
          type: "opportunity",
          path: "/funnels",
        });
      }

      // Budget leads (high budget, not closed)
      const highBudget = leads.filter(l => {
        const b = parseFloat(String(l.budget || "").replace(/[^0-9.]/g, ""));
        return b >= 500000 && l.status !== "closed";
      });
      if (highBudget.length > 0 && items.length < 3) {
        items.push({
          id: "high-value",
          text: `${highBudget.length} high-value lead${highBudget.length > 1 ? "s" : ""} in your pipeline`,
          subtext: "Prioritize personal outreach for better close rates",
          type: "opportunity",
          path: "/leads",
        });
      }

      // Likely sellers (predictive intelligence)
      const likelySellers = leads.filter(l => (l.seller_prediction_score || 0) >= 60 && l.status !== "closed");
      if (likelySellers.length > 0 && items.length < 3) {
        items.push({
          id: "likely-sellers",
          text: `${likelySellers.length} lead${likelySellers.length > 1 ? "s" : ""} predicted likely to sell`,
          subtext: "AI detected seller signals — send a CMA or home valuation offer",
          type: "urgent",
          path: likelySellers.length === 1 ? `/leads/${likelySellers[0].id}` : "/leads",
        });
      }

      // Fallback
      if (items.length === 0) {
        items.push({
          id: "create-funnel",
          text: "Create a targeted funnel to start generating qualified leads",
          subtext: "AI builds your landing page in seconds",
          type: "opportunity",
          path: "/funnels",
        });
      }

      setSuggestions(items.slice(0, 3));
    };

    build();
  }, [user]);

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
          <Brain size={12} className="text-primary" />
        </div>
        <h3 className="font-display text-sm font-semibold text-foreground">AI Recommendations</h3>
      </div>
      {suggestions.map((s, i) => (
        <motion.button
          key={s.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => navigate(s.path)}
          className={`w-full text-left rounded-xl p-3.5 border border-border ${typeStyles[s.type]} border-l-[3px] flex items-center gap-3 touch-target active:scale-[0.98] transition-transform`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeIcons[s.type]}`}>
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">{s.text}</p>
            {s.subtext && <p className="text-[11px] text-muted-foreground mt-0.5">{s.subtext}</p>}
          </div>
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        </motion.button>
      ))}
    </div>
  );
};

export default AIActionFeed;
