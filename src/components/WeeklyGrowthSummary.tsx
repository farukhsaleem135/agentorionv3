import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Users, Eye, Zap, Calendar, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface WeeklySummaryData {
  period: string;
  newLeads: number;
  prevLeads: number;
  totalViews: number;
  topFunnel: string;
  hotLeads: number;
  convRate: string;
  recommendations: string[];
}

const WeeklyGrowthSummary = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<WeeklySummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSummary = async () => {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const [leadsRes, prevLeadsRes, funnelsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id, temperature, created_at").gte("created_at", weekAgo),
        supabase.from("funnel_leads").select("id").gte("created_at", twoWeeksAgo).lt("created_at", weekAgo),
        supabase.from("funnels").select("id, name, views, leads_count, status"),
      ]);

      const leads = leadsRes.data || [];
      const prevLeads = prevLeadsRes.data || [];
      const funnels = funnelsRes.data || [];

      const totalViews = funnels.reduce((s, f) => s + f.views, 0);
      const totalLeads = funnels.reduce((s, f) => s + f.leads_count, 0);
      const convRate = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0.0";
      const hotLeads = leads.filter((l) => l.temperature === "hot").length;
      const best = funnels.length > 0
        ? funnels.reduce((a, b) => (b.leads_count > a.leads_count ? b : a))
        : null;

      const recommendations: string[] = [];
      if (leads.length === 0) recommendations.push("Launch your first funnel to start capturing leads.");
      if (hotLeads > 0) recommendations.push(`Follow up with ${hotLeads} hot lead${hotLeads !== 1 ? "s" : ""} — they're most likely to convert.`);
      if (parseFloat(convRate) < 5 && totalViews > 0) recommendations.push("Conversion below 5%. Test stronger headlines or add video testimonials.");
      if (funnels.filter((f) => f.status === "live").length < 2) recommendations.push("Diversify with at least 2 live funnels for consistent lead flow.");
      if (leads.length > prevLeads.length && leads.length > 3) recommendations.push("Strong growth! Consider scaling ad budget to compound results.");

      const now = new Date();
      const start = new Date(Date.now() - 7 * 86400000);
      const period = `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;

      setSummary({
        period,
        newLeads: leads.length,
        prevLeads: prevLeads.length,
        totalViews,
        topFunnel: best?.name || "—",
        hotLeads,
        convRate: `${convRate}%`,
        recommendations,
      });
      setLoading(false);
    };
    fetchSummary();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!summary) return null;

  const leadChange = summary.prevLeads > 0
    ? Math.round(((summary.newLeads - summary.prevLeads) / summary.prevLeads) * 100)
    : summary.newLeads > 0 ? 100 : 0;

  const statCards = [
    { icon: Users, label: "New Leads", value: String(summary.newLeads), change: leadChange },
    { icon: Eye, label: "Total Views", value: summary.totalViews.toLocaleString() },
    { icon: TrendingUp, label: "Conv Rate", value: summary.convRate },
    { icon: Zap, label: "Hot Leads", value: String(summary.hotLeads) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      role="region"
      aria-label="Weekly Growth Summary"
    >
      <div className="flex items-center gap-2 px-1">
        <Calendar size={16} className="text-primary" />
        <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">Weekly Summary</h3>
      </div>

      <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs text-muted-foreground">{summary.period}</span>
          {leadChange !== 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${
              leadChange > 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
            }`}>
              {leadChange > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {leadChange > 0 ? "+" : ""}{leadChange}% vs last week
            </div>
          )}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {statCards.map((s) => (
            <div key={s.label} className="bg-secondary/50 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <s.icon size={12} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{s.label}</span>
              </div>
              <p className="font-display text-lg font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top funnel */}
        <div className="flex items-center justify-between py-2 border-t border-border mb-3">
          <span className="text-xs text-muted-foreground">Top performing funnel</span>
          <span className="text-xs font-semibold text-foreground">{summary.topFunnel}</span>
        </div>

        {/* Recommendations */}
        {summary.recommendations.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-foreground mb-2">Recommended Actions</p>
            <div className="space-y-2">
              {summary.recommendations.map((rec, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary text-xs mt-0.5">→</span>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default WeeklyGrowthSummary;
