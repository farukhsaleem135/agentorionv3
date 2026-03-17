import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { TrendingDown, TrendingUp, Minus, BarChart3, Clock, Users, DollarSign, Loader2, X, Download, Check } from "lucide-react";
import { generateInsightsReport } from "@/utils/generateInsightsReport";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMode } from "@/contexts/ModeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import ModeToggle from "@/components/ModeToggle";
import FeatureGate from "@/components/FeatureGate";
import ProAnalyticsDashboard from "@/components/ProAnalyticsDashboard";
import ABTestingControls from "@/components/ABTestingControls";
import RetargetingAudienceBuilder from "@/components/RetargetingAudienceBuilder";
import WeeklyGrowthSummary from "@/components/WeeklyGrowthSummary";
import ROIConfidencePanel from "@/components/ROIConfidencePanel";
import { Button } from "@/components/ui/button";

const BANNER_DISMISS_KEY = "agentorion-insights-banner-dismissed";

const Insights = () => {
  const { user } = useAuth();
  const { isPro } = useMode();
  const { tier, trackEvent } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportDone, setReportDone] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(() => {
    const ts = localStorage.getItem(BANNER_DISMISS_KEY);
    if (!ts) return false;
    return Date.now() - parseInt(ts) < 7 * 24 * 60 * 60 * 1000;
  });
  const [marketStats, setMarketStats] = useState<{ label: string; value: string; change: string; trend: "up" | "down" | "flat" }[]>([
    { label: "Active Funnels", value: "0", change: "—", trend: "flat" },
    { label: "Total Views", value: "0", change: "—", trend: "flat" },
    { label: "Total Leads", value: "0", change: "—", trend: "flat" },
    { label: "Avg Conversion", value: "0%", change: "—", trend: "flat" },
  ]);
  const [performanceMetrics, setPerformanceMetrics] = useState([
    { icon: Clock, label: "Avg Response Time", value: "<30s", target: "< 30s", hit: true },
    { icon: Users, label: "Lead Conversion", value: "0%", target: "> 10%", hit: false },
    { icon: BarChart3, label: "Listing Views", value: "0", target: "> 100", hit: false },
    { icon: DollarSign, label: "Pipeline Value", value: "$0", target: "> $100K", hit: false },
  ]);

  useEffect(() => {
    if (!user) return;
    const fetchInsights = async () => {
      const [funnelsRes, leadsRes, listingsRes] = await Promise.all([
        supabase.from("funnels").select("id, views, leads_count, status"),
        supabase.from("funnel_leads").select("id, temperature, created_at", { count: "exact" }),
        supabase.from("listings").select("price, views, status"),
      ]);
      const funnels = funnelsRes.data || [];
      const leads = leadsRes.data || [];
      const listings = listingsRes.data || [];
      const activeFunnels = funnels.filter(f => f.status === "live").length;
      const totalViews = funnels.reduce((s, f) => s + f.views, 0);
      const totalLeads = funnels.reduce((s, f) => s + f.leads_count, 0);
      const avgConv = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0.0";
      const hotLeads = leads.filter(l => l.temperature === "hot").length;
      const totalListingViews = listings.reduce((s, l) => s + l.views, 0);
      const pipelineValue = listings.reduce((sum, l) => {
        const p = String(l.price || "").replace(/[^0-9.]/g, "");
        return sum + (parseFloat(p) || 0);
      }, 0);
      const pipeline = pipelineValue >= 1000000
        ? `$${(pipelineValue / 1000000).toFixed(1)}M`
        : pipelineValue >= 1000
          ? `$${(pipelineValue / 1000).toFixed(0)}K`
          : `$${pipelineValue}`;
      setMarketStats([
        { label: "Active Funnels", value: String(activeFunnels), change: `${funnels.length} total`, trend: activeFunnels > 0 ? "up" : "flat" },
        { label: "Total Views", value: totalViews.toLocaleString(), change: `${funnels.length} funnels`, trend: totalViews > 0 ? "up" : "flat" },
        { label: "Total Leads", value: String(totalLeads), change: `${hotLeads} hot`, trend: totalLeads > 0 ? "up" : "flat" },
        { label: "Avg Conversion", value: `${avgConv}%`, change: "views → leads", trend: parseFloat(avgConv) > 5 ? "up" : parseFloat(avgConv) > 0 ? "flat" : "down" },
      ]);
      setPerformanceMetrics([
        { icon: Clock, label: "Avg Response Time", value: "<30s", target: "< 30s", hit: true },
        { icon: Users, label: "Lead Conversion", value: `${avgConv}%`, target: "> 10%", hit: parseFloat(avgConv) > 10 },
        { icon: BarChart3, label: "Listing Views", value: totalListingViews.toLocaleString(), target: "> 100", hit: totalListingViews > 100 },
        { icon: DollarSign, label: "Pipeline Value", value: pipeline, target: "> $100K", hit: pipelineValue > 100000 },
      ]);
      setLoading(false);
    };
    fetchInsights();
  }, [user]);

  const trendIcon = {
    up: <TrendingUp size={14} className="text-signal-green" />,
    down: <TrendingDown size={14} className="text-alert-red" />,
    flat: <Minus size={14} className="text-text-muted" />,
  };

  const dismissBanner = () => {
    localStorage.setItem(BANNER_DISMISS_KEY, String(Date.now()));
    setBannerDismissed(true);
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={20} className="animate-spin text-text-muted" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-text-primary">Insights</h1>
          <div className="flex items-center gap-2">
            {isPro ? (
              <Button
                size="sm"
                disabled={reportLoading}
                onClick={async () => {
                  if (!user) return;
                  setReportLoading(true);
                  setReportDone(false);
                  try {
                    await generateInsightsReport(user.id, user.email || "Agent");
                    trackEvent("report_download");
                    setReportDone(true);
                    setTimeout(() => setReportDone(false), 2000);
                  } catch (e) {
                    console.error("Report generation failed", e);
                  } finally {
                    setReportLoading(false);
                  }
                }}
                className="gap-1.5"
              >
                {reportLoading ? <Loader2 size={14} className="animate-spin" /> : reportDone ? <Check size={14} /> : <Download size={14} />}
                {reportLoading ? "Generating…" : reportDone ? "Downloaded" : "Download Report"}
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="sm" disabled className="opacity-50 cursor-not-allowed gap-1.5">
                      <Download size={14} />
                      Download Report
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upgrade to Pro to download your performance report</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ModeToggle />
          </div>
        </div>

        {/* Upgrade banner for non-Pro users */}
        {tier !== "pro" && !bannerDismissed && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-5 p-4 rounded-[var(--radius-lg)] border border-border-brand overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(45,107,228,0.1), rgba(107,63,160,0.1))" }}
          >
            <button onClick={dismissBanner} className="absolute top-3 right-3 p-1 rounded text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
            <p className="text-sm text-text-primary font-medium mb-1 pr-6">
              You're missing Pro Analytics
            </p>
            <p className="text-xs text-text-secondary mb-3">
              Funnel conversion charts, ROI panels, and AI anomaly detection.
            </p>
            <Button variant="pro-badge" size="sm">
              Unlock Pro Analytics
            </Button>
          </motion.div>
        )}

        {isPro ? (
          <div className="space-y-6">
            <FeatureGate feature="attribution_dashboard" upgradeMessage="Upgrade to Pro for advanced analytics and multi-touch attribution.">
              <ProAnalyticsDashboard />
            </FeatureGate>
            <FeatureGate feature="split_testing" upgradeMessage="Upgrade to Pro to run A/B tests on your funnel headlines.">
              <ABTestingControls />
            </FeatureGate>
            <FeatureGate feature="retargeting" upgradeMessage="Upgrade to Growth or Pro to build retargeting audience segments.">
              <RetargetingAudienceBuilder />
            </FeatureGate>
            <WeeklyGrowthSummary />
            <ROIConfidencePanel />
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="font-display text-sm font-semibold text-text-primary mb-3 px-1">Funnel Performance</h3>
              <div className="grid grid-cols-2 gap-3">
                {marketStats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-bg-surface p-4 border border-border-subtle hover:border-border-strong hover:-translate-y-0.5"
                    style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", transition: "all var(--transition-base)" }}
                  >
                    <p className="text-[11px] text-text-tertiary mb-1">{stat.label}</p>
                    <p className="font-mono text-lg font-bold text-text-primary">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {trendIcon[stat.trend as keyof typeof trendIcon]}
                      <span className="text-xs text-text-tertiary">{stat.change}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <h3 className="font-display text-sm font-semibold text-text-primary mb-3 px-1">Your Performance</h3>
          </>
        )}
      </div>

      {!isPro && (
        <div className="px-5 space-y-3">
          {performanceMetrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-bg-surface p-4 border border-border-subtle flex items-center gap-4 hover:border-border-strong hover:-translate-y-0.5"
              style={{ borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-card)", transition: "all var(--transition-base)" }}
            >
              <div className="w-10 h-10 rounded-lg bg-orion-blue/10 flex items-center justify-center shrink-0">
                <m.icon size={18} className="text-orion-blue" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{m.label}</p>
                <p className="text-[11px] text-text-tertiary">Target: {m.target}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-lg font-bold text-text-primary">{m.value}</p>
                <span className={`text-[10px] font-semibold ${m.hit ? "text-signal-green" : "text-text-muted"}`}>
                  {m.hit ? "✓ On track" : "— Below target"}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </MobileShell>
  );
};

export default Insights;
