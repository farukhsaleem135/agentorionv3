import MobileShell from "@/components/MobileShell";
import MetricCard from "@/components/MetricCard";
import AIActionFeed from "@/components/AIActionFeed";
import AutopilotActionFeed from "@/components/AutopilotActionFeed";
import GrowthScore from "@/components/GrowthScore";
import ROISummary from "@/components/ROISummary";
import BudgetSlider from "@/components/BudgetSlider";
import ModeToggle from "@/components/ModeToggle";
import UsageMeter from "@/components/UsageMeter";
import FeatureGate from "@/components/FeatureGate";
import UpgradeBanner from "@/components/UpgradeBanner";
import ChurnPrevention from "@/components/ChurnPrevention";
import NLPCommandBar from "@/components/NLPCommandBar";
import WelcomeScreen, { ONBOARDING_KEY } from "@/components/WelcomeScreen";
import { Button } from "@/components/ui/button";
import { useMode } from "@/contexts/ModeContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Users, Building2, MessageSquare, TrendingUp, Plus, Bell, Zap, PlayCircle, BarChart3, Shield, MapPin, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(() => localStorage.getItem(ONBOARDING_KEY) !== "true");
  const [activateWizardOnMount, setActivateWizardOnMount] = useState(false);
  const { user } = useAuth();
  const { isAutopilot } = useMode();
  const [metrics, setMetrics] = useState({ leads: 0, listings: 0, pipeline: "$0", convRate: "0%", score: 0, hotLeads: 0 });
  const [displayName, setDisplayName] = useState("Agent");
  const [isAdmin, setIsAdmin] = useState(false);
  const [brandColor, setBrandColor] = useState<string | null | undefined>(undefined);
  const [profileData, setProfileData] = useState<Record<string, any> | null>(null);
  const [brandColorPromptDismissed, setBrandColorPromptDismissed] = useState(
    () => localStorage.getItem('brand_color_prompt_dismissed') === 'true'
  );

  const dismissWelcome = useCallback((openWizard: boolean) => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShowWelcome(false);
    if (openWizard) setActivateWizardOnMount(true);
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchMetrics = async () => {
      const [leadsRes, listingsRes, profileRes, funnelsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id, temperature", { count: "exact" }),
        supabase.from("listings").select("price"),
        supabase.from("profiles").select("display_name, brand_color, market_area, avg_sale_price, bio, license_state").eq("user_id", user.id).maybeSingle(),
        supabase.from("funnels").select("views, leads_count"),
      ]);
      const totalViews = (funnelsRes.data || []).reduce((s: number, f: any) => s + f.views, 0);
      const totalFunnelLeads = (funnelsRes.data || []).reduce((s: number, f: any) => s + f.leads_count, 0);
      const convRate = totalViews > 0 ? ((totalFunnelLeads / totalViews) * 100).toFixed(1) : "0.0";
      const pipelineValue = (listingsRes.data || []).reduce((sum: number, l: any) => {
        const p = String(l.price || "").replace(/[^0-9.]/g, "");
        return sum + (parseFloat(p) || 0);
      }, 0);
      const pipeline = pipelineValue >= 1000000
        ? `$${(pipelineValue / 1000000).toFixed(1)}M`
        : pipelineValue >= 1000
          ? `$${(pipelineValue / 1000).toFixed(0)}K`
          : `$${pipelineValue}`;
      const listingCount = (listingsRes.data || []).length;
      const leadCount = leadsRes.count || 0;
      const hotLeads = (leadsRes.data || []).filter((l: any) => l.temperature === "hot").length;
      const leadsScore = Math.min(leadCount * 5, 30);
      const listingsScore = Math.min(listingCount * 10, 20);
      const funnelsScore = Math.min((funnelsRes.data || []).length * 10, 20);
      const convScore = Math.min(parseFloat(convRate) * 3, 30);
      setMetrics({
        leads: leadCount, listings: listingCount, pipeline,
        convRate: `${convRate}%`,
        score: Math.min(Math.round(leadsScore + listingsScore + funnelsScore + convScore), 100),
        hotLeads,
      });
      const name = profileRes.data?.display_name
        || user.user_metadata?.display_name
        || user.email?.split("@")[0]
        || "Agent";
      setDisplayName(name);
      setBrandColor(profileRes.data?.brand_color ?? null);
      setProfileData(profileRes.data ?? null);
    };
    fetchMetrics();
  }, [user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const quickActions = isAutopilot
    ? [
        { label: "Launch Funnel", icon: Zap, path: "/funnels", desc: "AI-generated", primary: true },
        { label: "View Leads", icon: Users, path: "/leads", desc: `${metrics.hotLeads} hot`, primary: false },
        { label: "Market Intel", icon: MapPin, path: "/market-intel", desc: "Neighborhoods", primary: false },
        { label: "Insights", icon: BarChart3, path: "/insights", desc: "Market data", primary: false },
      ]
    : [
        { label: "Launch Funnel", icon: Zap, path: "/funnels", desc: "AI-powered", primary: true },
        { label: "Add Lead", icon: Users, path: "/leads", desc: "Manual entry", primary: false },
        { label: "Market Intel", icon: MapPin, path: "/market-intel", desc: "Neighborhoods", primary: false },
        { label: "Analytics", icon: BarChart3, path: "/insights", desc: "Deep dive", primary: false },
      ];

  const createOptions = [
    { label: "New Listing", icon: Building2, path: "/listings" },
    { label: "Add Lead", icon: Users, path: "/leads" },
    { label: "Create Content", icon: PlayCircle, path: "/content" },
    { label: "New Funnel", icon: Zap, path: "/funnels" },
  ];

  if (showWelcome) {
    return (
      <WelcomeScreen
        onWatchDemo={() => dismissWelcome(true)}
        onJumpIn={() => dismissWelcome(true)}
        onSkip={() => dismissWelcome(false)}
      />
    );
  }

  return (
    <MobileShell activateWizard={activateWizardOnMount}>
      {/* Header */}
      <div className="px-5 pt-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] text-text-tertiary font-medium uppercase tracking-wider">{greeting()}</p>
            <h1 className="font-display text-xl font-bold text-text-primary mt-0.5">{displayName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/leads?filter=hot")}
              className="relative p-2.5 rounded-xl bg-bg-elevated touch-target active:scale-95"
              style={{ transition: "all var(--transition-base)" }}
            >
              <Bell size={18} className="text-text-primary" />
              {metrics.hotLeads > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-alert-red rounded-full flex items-center justify-center text-[9px] font-bold text-white">
                  {metrics.hotLeads}
                </span>
              )}
            </button>
            <Button size="icon" onClick={() => setShowMenu(true)}>
              <Plus size={18} />
            </Button>
          </div>
        </div>
        <ModeToggle />
      </div>

      {/* Autopilot glow wrapper */}
      <div
        className={`px-5 space-y-4 mt-3 ${isAutopilot ? "rounded-2xl mx-3 p-3" : ""}`}
        style={isAutopilot ? { border: "1px solid rgba(45,107,228,0.2)", boxShadow: "0 0 30px rgba(45,107,228,0.08)" } : undefined}
      >
        {/* BRAND COLOR PROMPT — shown only when brand_color is null */}
        {brandColor === null && !brandColorPromptDismissed && (
          <div
            className="w-full rounded-xl px-5 py-4 mb-4 flex items-center justify-between gap-4"
            style={{
              background: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-orion-blue)',
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-orion-blue)' }}
              >
                <span className="text-white text-sm">✦</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Set your brand color to personalize your funnels
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your CTA buttons are currently using the default color.
                  Add your brand color in Settings to make every funnel yours.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => navigate('/settings')}
                className="px-4 py-2 rounded-lg text-xs font-bold text-white transition-all"
                style={{ background: 'var(--color-orion-blue)' }}
              >
                Set Color
              </button>
              <button
                onClick={() => {
                  setBrandColorPromptDismissed(true);
                  localStorage.setItem('brand_color_prompt_dismissed', 'true');
                }}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}
        {/* PROFILE COMPLETENESS INDICATOR */}
        {(() => {
          const HIGH_IMPACT_FIELDS = [
            { key: 'display_name', label: 'Your name' },
            { key: 'market_area', label: 'Market area' },
            { key: 'avg_sale_price', label: 'Average sale price' },
            { key: 'bio', label: 'Bio / value proposition' },
            { key: 'brand_color', label: 'Brand color' },
            { key: 'license_state', label: 'License state' },
          ];
          const missing = HIGH_IMPACT_FIELDS.filter(
            f => !profileData?.[f.key]
          );
          if (missing.length === 0) return null;
          return (
            <div className="w-full rounded-xl px-5 py-4 mb-4 bg-card border border-border">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-foreground">
                  Complete your profile to improve funnel quality
                </p>
                <button
                  onClick={() => navigate('/settings')}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary text-primary-foreground transition-all"
                >
                  Complete Profile
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {missing.map(field => (
                  <span
                    key={field.key}
                    className="text-xs px-2.5 py-1 rounded-full border border-amber-500/40 text-amber-500 bg-amber-500/10"
                  >
                    {field.label} missing
                  </span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Missing fields cause AgentOrion to use generic copy in your funnels. Adding them takes 2 minutes.
              </p>
            </div>
          );
        })()}
        <NLPCommandBar />
        <UsageMeter />
        <UpgradeBanner target="growth" />
        <UpgradeBanner target="pro" />
        <ChurnPrevention />

        {isAutopilot ? (
          <>
            <ROISummary totalSpend="$0" leadsGenerated={metrics.leads} appointmentsBooked={0} pipelineValue={metrics.pipeline} />
            <FeatureGate feature="budget_slider" upgradeMessage="Upgrade to Growth to control your daily ad budget and maximize ROI.">
              <BudgetSlider />
            </FeatureGate>
            <AutopilotActionFeed />
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GrowthScore />
            </motion.div>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Active Leads" value={String(metrics.leads)} change={`${metrics.hotLeads} hot`} positive icon={<Users size={16} />} />
              <MetricCard label="Listings" value={String(metrics.listings)} change="Properties" positive icon={<Building2 size={16} />} />
              <MetricCard label="Response Time" value="<30s" change="Avg today" positive icon={<MessageSquare size={16} />} />
              <MetricCard label="Pipeline" value={metrics.pipeline} change="Total value" positive icon={<TrendingUp size={16} />} />
            </div>
            <AIActionFeed />
          </>
        )}

        {/* Admin CTA */}
        {isAdmin && (
          <Button variant="ghost" className="w-full justify-start gap-3 h-auto py-4" onClick={() => navigate("/admin")}>
            <div className="w-10 h-10 rounded-lg bg-orion-blue/10 flex items-center justify-center">
              <Shield size={18} className="text-orion-blue" />
            </div>
            <div className="text-left flex-1">
              <span className="text-sm font-semibold text-text-primary block">Admin Dashboard</span>
              <span className="text-[11px] text-text-tertiary">Manage users, roles & settings</span>
            </div>
          </Button>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="font-display text-sm font-semibold text-text-primary mb-3 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2.5">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] border touch-target active:scale-[0.97] group ${
                  action.primary
                    ? "bg-orion-blue/10 border-orion-blue/30 hover:border-orion-blue"
                    : "bg-bg-surface border-border-subtle hover:border-border-strong"
                }`}
                style={{ transition: "all var(--transition-base)" }}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${action.primary ? "bg-orion-blue/20" : "bg-orion-blue/10"}`}>
                  <action.icon size={16} className="text-orion-blue" />
                </div>
                <div className="text-left">
                  <span className="text-sm font-medium text-text-primary block leading-tight">{action.label}</span>
                  <span className="text-[10px] text-text-tertiary">{action.desc}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>


      {/* Create Menu */}
      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={() => setShowMenu(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-bg-elevated border-t border-border-subtle rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-border-default rounded-full mx-auto mb-5" />
              <h3 className="font-display text-base font-bold text-text-primary mb-4">Create New</h3>
              <div className="grid grid-cols-2 gap-2.5">
                {createOptions.map((opt) => (
                  <Button
                    key={opt.label}
                    variant="secondary"
                    className="h-auto py-4 justify-start gap-3"
                    onClick={() => { setShowMenu(false); navigate(opt.path); }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-bg-surface flex items-center justify-center">
                      <opt.icon size={16} className="text-orion-blue" />
                    </div>
                    <span className="text-sm font-medium text-text-primary">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileShell>
  );
};

export default Index;
