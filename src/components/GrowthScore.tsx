import { motion } from "framer-motion";
import { TrendingUp, Zap, Share2, Heart, ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const GrowthScore = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    score: 0,
    responseTime: "<30s",
    conversionRate: "0%",
    socialReach: "—",
    satisfaction: "—",
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [funnelsRes, leadsRes, contentRes] = await Promise.all([
        supabase.from("funnels").select("views, leads_count, status"),
        supabase.from("funnel_leads").select("id, temperature"),
        supabase.from("content").select("views, likes"),
      ]);
      const funnels = funnelsRes.data || [];
      const leads = leadsRes.data || [];
      const content = contentRes.data || [];

      const totalViews = funnels.reduce((s, f) => s + f.views, 0);
      const totalLeads = funnels.reduce((s, f) => s + f.leads_count, 0);
      const convRate = totalViews > 0 ? ((totalLeads / totalViews) * 100) : 0;
      const hotPct = leads.length > 0 ? (leads.filter(l => l.temperature === "hot").length / leads.length) * 100 : 0;
      const contentViews = content.reduce((s, c) => s + c.views, 0);
      const contentLikes = content.reduce((s, c) => s + c.likes, 0);

      // Growth score: weighted combination
      const funnelScore = Math.min(funnels.filter(f => f.status === "live").length * 15, 30);
      const convScore = Math.min(convRate * 4, 25);
      const leadScore = Math.min(totalLeads * 2, 20);
      const hotScore = Math.min(hotPct, 15);
      const contentScore = Math.min((content.length * 2) + (contentViews / 100), 10);
      const score = Math.min(Math.round(funnelScore + convScore + leadScore + hotScore + contentScore), 100);

      setMetrics({
        score,
        responseTime: "<30s",
        conversionRate: `${convRate.toFixed(1)}%`,
        socialReach: contentViews > 1000 ? `${(contentViews / 1000).toFixed(1)}K` : String(contentViews),
        satisfaction: contentLikes > 0 && contentViews > 0 ? `${((contentLikes / contentViews) * 100).toFixed(0)}%` : "—",
      });
    };
    load();
  }, [user]);

  const circumference = 2 * Math.PI * 44;
  const progress = (metrics.score / 100) * circumference;

  const getScoreColor = () => {
    if (metrics.score >= 70) return "text-success";
    if (metrics.score >= 40) return "text-warning";
    return "text-muted-foreground";
  };

  const subMetrics = [
    { icon: Zap, label: "Response", value: metrics.responseTime, color: "text-primary" },
    { icon: TrendingUp, label: "Conversion", value: metrics.conversionRate, color: "text-success" },
    { icon: Share2, label: "Reach", value: metrics.socialReach, color: "text-info" },
    { icon: Heart, label: "Engagement", value: metrics.satisfaction, color: "text-hot" },
  ];

  return (
    <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card" role="region" aria-label="Growth Score">
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24 shrink-0" aria-label={`Growth score: ${metrics.score} out of 100`}>
          <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke="url(#growthGrad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <defs>
              <linearGradient id="growthGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(152 82% 48%)" />
                <stop offset="100%" stopColor="hsl(158 72% 38%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`font-display text-2xl font-bold ${getScoreColor()}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {metrics.score}
            </motion.span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Score</span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-2 gap-2.5">
          {subMetrics.map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <m.icon size={13} className={m.color} />
              <div>
                <p className="text-[10px] text-muted-foreground">{m.label}</p>
                <p className="text-xs font-semibold text-foreground">{m.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {metrics.score < 50 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-3 pt-3 border-t border-border flex items-start gap-2"
        >
          <ArrowUpRight size={12} className="text-primary mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Launch more live funnels and follow up with hot leads to boost your score.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default GrowthScore;
