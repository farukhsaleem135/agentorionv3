import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  BarChart3, TrendingUp, Users, Zap, Target, Eye,
  ArrowDownRight, ArrowUpRight, Minus, AlertTriangle,
  Lightbulb, ChevronRight
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Area, AreaChart,
  ReferenceLine
} from "recharts";

interface FunnelStats {
  name: string;
  views: number;
  leads: number;
  convRate: number;
}

interface Anomaly {
  type: "warning" | "success" | "info";
  message: string;
}

const CHART_COLORS = [
  "hsl(38 92% 55%)",
  "hsl(199 89% 48%)",
  "hsl(142 71% 45%)",
  "hsl(280 65% 60%)",
  "hsl(175 60% 45%)",
];

const TEMP_COLORS: Record<string, string> = {
  hot: "hsl(0 72% 51%)",
  warm: "hsl(38 92% 55%)",
  cold: "hsl(199 89% 48%)",
};

const ProAnalyticsDashboard = () => {
  const { user } = useAuth();
  const [funnelStats, setFunnelStats] = useState<FunnelStats[]>([]);
  const [leadsByTemp, setLeadsByTemp] = useState<{ name: string; value: number }[]>([]);
  const [leadTimeline, setLeadTimeline] = useState<{ date: string; leads: number }[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [topMetrics, setTopMetrics] = useState({
    totalViews: 0,
    totalLeads: 0,
    avgConv: "0.0",
    bestFunnel: "—",
    worstDropoff: "—",
    weekOverWeek: 0,
  });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [funnelsRes, leadsRes] = await Promise.all([
        supabase.from("funnels").select("id, name, views, leads_count, status, type"),
        supabase.from("funnel_leads").select("id, temperature, created_at, funnel_id, ai_score, urgency_score"),
      ]);

      const funnels = funnelsRes.data || [];
      const leads = leadsRes.data || [];

      // Funnel conversion stats
      const stats: FunnelStats[] = funnels.map((f) => ({
        name: f.name.length > 14 ? f.name.slice(0, 14) + "…" : f.name,
        views: f.views,
        leads: f.leads_count,
        convRate: f.views > 0 ? parseFloat(((f.leads_count / f.views) * 100).toFixed(1)) : 0,
      }));
      setFunnelStats(stats);

      // Top metrics
      const totalViews = funnels.reduce((s, f) => s + f.views, 0);
      const totalLeads = funnels.reduce((s, f) => s + f.leads_count, 0);
      const avgConv = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0.0";
      const best = stats.length > 0 ? stats.reduce((a, b) => (b.convRate > a.convRate ? b : a)) : null;
      const worst = stats.filter(s => s.views > 0).length > 0
        ? stats.filter(s => s.views > 0).reduce((a, b) => (a.convRate < b.convRate ? a : b))
        : null;

      // Week-over-week lead change
      const oneWeekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const thisWeek = leads.filter(l => l.created_at >= oneWeekAgo).length;
      const lastWeek = leads.filter(l => l.created_at >= twoWeeksAgo && l.created_at < oneWeekAgo).length;
      const wow = lastWeek > 0 ? Math.round(((thisWeek - lastWeek) / lastWeek) * 100) : thisWeek > 0 ? 100 : 0;

      setTopMetrics({
        totalViews,
        totalLeads,
        avgConv,
        bestFunnel: best?.name || "—",
        worstDropoff: worst?.name || "—",
        weekOverWeek: wow,
      });

      // Leads by temperature
      const tempMap: Record<string, number> = { hot: 0, warm: 0, cold: 0 };
      leads.forEach((l) => {
        const t = l.temperature || "cold";
        tempMap[t] = (tempMap[t] || 0) + 1;
      });
      setLeadsByTemp(
        Object.entries(tempMap).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }))
      );

      // Lead timeline (last 14 days)
      const days: Record<string, number> = {};
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days[d.toISOString().slice(5, 10)] = 0;
      }
      leads.forEach((l) => {
        const key = l.created_at.slice(5, 10);
        if (key in days) days[key]++;
      });
      setLeadTimeline(Object.entries(days).map(([date, leads]) => ({ date, leads })));

      // Anomaly detection
      const detected: Anomaly[] = [];
      const stalledFunnels = funnels.filter(f => f.status === "live" && f.views > 50 && f.leads_count === 0);
      if (stalledFunnels.length > 0) {
        detected.push({ type: "warning", message: `${stalledFunnels.length} live funnel${stalledFunnels.length > 1 ? "s" : ""} with views but zero leads — review CTA and form placement.` });
      }
      const hotCount = leads.filter(l => l.temperature === "hot").length;
      if (hotCount > 3) {
        detected.push({ type: "success", message: `${hotCount} hot leads in pipeline — prioritize follow-up for maximum conversion.` });
      }
      if (parseFloat(avgConv) > 0 && parseFloat(avgConv) < 2) {
        detected.push({ type: "warning", message: "Overall conversion below 2%. A/B test headlines and consider stronger social proof." });
      }
      if (wow > 30) {
        detected.push({ type: "success", message: `Lead volume up ${wow}% week-over-week — momentum is building.` });
      } else if (wow < -20 && lastWeek > 0) {
        detected.push({ type: "warning", message: `Lead volume dropped ${Math.abs(wow)}% this week. Consider increasing ad spend or launching a new funnel.` });
      }
      setAnomalies(detected);
    };
    load();
  }, [user]);

  const metricCards = [
    { label: "Total Views", value: topMetrics.totalViews.toLocaleString(), icon: Eye, trend: topMetrics.totalViews > 0 ? "up" as const : "flat" as const },
    { label: "Total Leads", value: String(topMetrics.totalLeads), icon: Users, trend: topMetrics.totalLeads > 0 ? "up" as const : "flat" as const },
    { label: "Avg Conversion", value: `${topMetrics.avgConv}%`, icon: Target, trend: parseFloat(topMetrics.avgConv) > 5 ? "up" as const : "flat" as const },
    { label: "WoW Change", value: `${topMetrics.weekOverWeek > 0 ? "+" : ""}${topMetrics.weekOverWeek}%`, icon: TrendingUp, trend: topMetrics.weekOverWeek > 0 ? "up" as const : topMetrics.weekOverWeek < 0 ? "down" as const : "flat" as const },
  ];

  const trendIcons = {
    up: <ArrowUpRight size={12} className="text-success" />,
    down: <ArrowDownRight size={12} className="text-destructive" />,
    flat: <Minus size={12} className="text-muted-foreground" />,
  };

  const anomalyStyles = {
    warning: { bg: "bg-warning/10", border: "border-warning/30", icon: AlertTriangle, color: "text-warning" },
    success: { bg: "bg-success/10", border: "border-success/30", icon: Zap, color: "text-success" },
    info: { bg: "bg-info/10", border: "border-info/30", icon: Lightbulb, color: "text-info" },
  };

  return (
    <div className="space-y-5" role="region" aria-label="Pro Analytics Dashboard">
      {/* AI Anomalies & Insights */}
      {anomalies.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center gap-2 px-1 mb-1">
            <Lightbulb size={14} className="text-primary" />
            <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">AI Insights</h3>
          </div>
          {anomalies.map((a, i) => {
            const style = anomalyStyles[a.type];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`${style.bg} border ${style.border} rounded-lg px-3.5 py-2.5 flex items-start gap-2.5`}
              >
                <style.icon size={14} className={`${style.color} shrink-0 mt-0.5`} />
                <p className="text-[11px] text-foreground/90 leading-relaxed">{a.message}</p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Attribution Overview */}
      <div>
        <div className="flex items-center gap-2 px-1 mb-3">
          <BarChart3 size={16} className="text-primary" />
          <h3 className="font-display text-xs font-semibold text-foreground uppercase tracking-wider">Attribution</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {metricCards.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                  <m.icon size={14} className="text-muted-foreground" />
                </div>
                {trendIcons[m.trend]}
              </div>
              <p className="font-display text-lg font-bold text-foreground mt-2">{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.label}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lead Acquisition Trend (Area chart for premium feel) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
      >
        <h4 className="font-display text-sm font-semibold text-foreground mb-4">Lead Acquisition (14 Days)</h4>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={leadTimeline}>
            <defs>
              <linearGradient id="leadGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(38 92% 55%)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(38 92% 55%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="hsl(222 25% 16%)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 9 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222 41% 9%)",
                border: "1px solid hsl(222 25% 16%)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Area
              type="monotone"
              dataKey="leads"
              stroke="hsl(38 92% 55%)"
              strokeWidth={2}
              fill="url(#leadGrad)"
              dot={{ r: 3, fill: "hsl(38 92% 55%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Funnel Conversion Chart */}
      {funnelStats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
        >
          <h4 className="font-display text-sm font-semibold text-foreground mb-1">Funnel Conversion Rates</h4>
          <p className="text-[10px] text-muted-foreground mb-4">Views → Lead conversion by funnel</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={funnelStats} barSize={20}>
              <XAxis
                dataKey="name"
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                unit="%"
                width={32}
              />
              <ReferenceLine y={5} stroke="hsl(142 71% 45%)" strokeDasharray="3 3" strokeOpacity={0.5} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 41% 9%)",
                  border: "1px solid hsl(222 25% 16%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(210 40% 96%)" }}
              />
              <Bar dataKey="convRate" name="Conv %" radius={[6, 6, 0, 0]}>
                {funnelStats.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.convRate >= 5 ? "hsl(142 71% 45%)" : entry.convRate >= 2 ? "hsl(38 92% 55%)" : "hsl(0 72% 51%)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-muted-foreground mt-2 text-center">
            <span className="inline-block w-2 h-2 rounded-full bg-success mr-1" />≥5%
            <span className="inline-block w-2 h-2 rounded-full bg-warning mx-1 ml-3" />2-5%
            <span className="inline-block w-2 h-2 rounded-full bg-destructive mx-1 ml-3" />&lt;2%
          </p>
        </motion.div>
      )}

      {/* Lead Segmentation */}
      {leadsByTemp.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
        >
          <h4 className="font-display text-sm font-semibold text-foreground mb-4">Lead Segmentation</h4>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={leadsByTemp}
                  cx="50%"
                  cy="50%"
                  innerRadius={32}
                  outerRadius={52}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {leadsByTemp.map((entry) => (
                    <Cell key={entry.name} fill={TEMP_COLORS[entry.name] || CHART_COLORS[0]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {leadsByTemp.map((item) => {
                const total = leadsByTemp.reduce((s, i) => s + i.value, 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={item.name} className="flex items-center gap-2.5">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: TEMP_COLORS[item.name] || CHART_COLORS[0] }}
                    />
                    <span className="text-xs text-muted-foreground capitalize flex-1">{item.name}</span>
                    <span className="text-xs font-semibold text-foreground">{item.value}</span>
                    <span className="text-[10px] text-muted-foreground w-8 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Drop-off Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-gradient-card rounded-xl p-5 border border-border shadow-card"
      >
        <h4 className="font-display text-sm font-semibold text-foreground mb-3">Performance Summary</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">🏆 Top converting</span>
            <span className="text-xs font-semibold text-success">{topMetrics.bestFunnel}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">⚠️ Needs attention</span>
            <span className="text-xs font-semibold text-warning">{topMetrics.worstDropoff}</span>
          </div>
          <div className="pt-2 border-t border-border">
            <div className="flex items-start gap-2">
              <ChevronRight size={12} className="text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Focus on improving your lowest performer. Small CTA or headline changes can lift conversion 2-3x.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProAnalyticsDashboard;
