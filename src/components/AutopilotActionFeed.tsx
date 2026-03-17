import { motion } from "framer-motion";
import { Sparkles, ChevronRight, AlertCircle, TrendingUp, Clock, Users, Phone, Zap, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ActionItem {
  id: string;
  text: string;
  subtext?: string;
  type: "urgent" | "opportunity" | "nurture" | "insight";
  path: string;
  icon: typeof AlertCircle;
}

const typeStyles = {
  urgent: "border-l-hot bg-hot/5",
  opportunity: "border-l-primary bg-primary/5",
  nurture: "border-l-info bg-info/5",
  insight: "border-l-success bg-success/5",
};

const typeIcons = {
  urgent: "bg-hot/15 text-hot",
  opportunity: "bg-primary/15 text-primary",
  nurture: "bg-info/15 text-info",
  insight: "bg-success/15 text-success",
};

const AutopilotActionFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionItem[]>([]);

  useEffect(() => {
    if (!user) return;

    const buildActions = async () => {
      const [leadsRes, funnelsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id, temperature, created_at, name, phone, email, status, seller_prediction_score"),
        supabase.from("funnels").select("id, name, views, leads_count, status"),
      ]);

      const items: ActionItem[] = [];
      const leads = leadsRes.data || [];
      const funnels = funnelsRes.data || [];

      // Hot leads needing immediate response
      const hotLeads = leads.filter((l) => l.temperature === "hot" && l.status !== "closed");
      if (hotLeads.length > 0) {
        const firstName = hotLeads[0].name?.split(" ")[0] || "A lead";
        items.push({
          id: "hot-leads",
          text: hotLeads.length === 1
            ? `${firstName} is a hot lead — respond now`
            : `${hotLeads.length} hot leads need your response`,
          subtext: hotLeads.length === 1 && hotLeads[0].phone ? "Tap to call or text" : "Prioritize these for highest conversion",
          type: "urgent",
          path: hotLeads.length === 1 ? `/leads/${hotLeads[0].id}` : "/leads",
          icon: Phone,
        });
      }

      // Recent leads in last 24h
      const recentLeads = leads.filter(
        (l) => new Date(l.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      );
      if (recentLeads.length > 0) {
        items.push({
          id: "recent-leads",
          text: `${recentLeads.length} new lead${recentLeads.length > 1 ? "s" : ""} in the last 24 hours`,
          subtext: "Review and qualify before they go cold",
          type: "opportunity",
          path: "/leads",
          icon: Users,
        });
      }

      // Funnel performance — actionable insight
      const activeFunnels = funnels.filter((f) => f.status === "active" || f.status === "live");
      if (activeFunnels.length >= 2) {
        const sorted = [...activeFunnels].sort((a, b) => {
          const rateA = a.views > 0 ? a.leads_count / a.views : 0;
          const rateB = b.views > 0 ? b.leads_count / b.views : 0;
          return rateB - rateA;
        });
        const best = sorted[0];
        const convRate = best.views > 0 ? ((best.leads_count / best.views) * 100).toFixed(1) : "0";
        items.push({
          id: "funnel-perf",
          text: `"${best.name}" is converting at ${convRate}%`,
          subtext: "Consider increasing its budget for more leads",
          type: "insight",
          path: "/funnels",
          icon: TrendingUp,
        });
      }

      // Warm leads to nurture
      const warmLeads = leads.filter((l) => l.temperature === "warm" && l.status !== "closed");
      if (warmLeads.length > 0) {
        items.push({
          id: "warm-nurture",
          text: `${warmLeads.length} warm lead${warmLeads.length > 1 ? "s" : ""} ready for nurture`,
          subtext: "Send a follow-up to keep momentum",
          type: "nurture",
          path: "/leads",
          icon: Clock,
        });
      }

      // Likely sellers
      const likelySellers = leads.filter(l => (l.seller_prediction_score || 0) >= 60 && l.status !== "closed");
      if (likelySellers.length > 0) {
        items.push({
          id: "likely-sellers",
          text: `${likelySellers.length} lead${likelySellers.length > 1 ? "s" : ""} predicted likely to sell`,
          subtext: "Run a Seller Prediction to generate a prep pack",
          type: "insight",
          path: likelySellers.length === 1 ? `/leads/${likelySellers[0].id}` : "/leads",
          icon: Home,
        });
      }

      // No funnels yet
      if (funnels.length === 0) {
        items.push({
          id: "launch-funnel",
          text: "Launch your first funnel to start capturing leads",
          subtext: "AI generates everything in under 30 seconds",
          type: "opportunity",
          path: "/funnels",
          icon: Zap,
        });
      }

      // No leads yet but has funnels
      if (leads.length === 0 && funnels.length > 0) {
        items.push({
          id: "share-funnel",
          text: "Share your funnel link to start capturing leads",
          subtext: "Post it on social media or send it to prospects",
          type: "opportunity",
          path: "/funnels",
          icon: Users,
        });
      }

      setActions(items.slice(0, 4));
    };

    buildActions();
  }, [user]);

  if (actions.length === 0) return null;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <div className="w-5 h-5 rounded-md bg-primary/15 flex items-center justify-center">
          <Sparkles size={12} className="text-primary" />
        </div>
        <h3 className="font-display text-sm font-semibold text-foreground">What to Do Now</h3>
      </div>
      {actions.map((a, i) => (
        <motion.button
          key={a.id}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.06 }}
          onClick={() => navigate(a.path)}
          className={`w-full text-left rounded-xl p-3.5 border border-border ${typeStyles[a.type]} border-l-[3px] flex items-center gap-3 touch-target active:scale-[0.98] transition-transform`}
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeIcons[a.type]}`}>
            <a.icon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-snug">{a.text}</p>
            {a.subtext && <p className="text-[11px] text-muted-foreground mt-0.5">{a.subtext}</p>}
          </div>
          <ChevronRight size={14} className="text-muted-foreground shrink-0" />
        </motion.button>
      ))}
    </div>
  );
};

export default AutopilotActionFeed;
