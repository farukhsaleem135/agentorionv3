import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Tier = "free" | "growth" | "pro";

export interface FeatureFlags {
  tier: Tier;
  unlimited_funnels: boolean;
  ad_integration: boolean;
  retargeting: boolean;
  budget_slider: boolean;
  pro_mode: boolean;
  attribution_dashboard: boolean;
  split_testing: boolean;
  cohort_analytics: boolean;
  advanced_roi: boolean;
  data_export: boolean;
  revenue_verification: boolean;
  max_funnels: number;
  max_leads_per_month: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  tier: "free",
  unlimited_funnels: false,
  ad_integration: false,
  retargeting: false,
  budget_slider: false,
  pro_mode: false,
  attribution_dashboard: false,
  split_testing: false,
  cohort_analytics: false,
  advanced_roi: false,
  data_export: false,
  revenue_verification: false,
  max_funnels: 1,
  max_leads_per_month: 5,
};

interface UsageData {
  funnelCount: number;
  leadCount: number;
  analyticsClicks: number;
  voiceMinutesUsed: number;
}

// Voice minute limits per tier
export const VOICE_MINUTE_LIMITS: Record<Tier, number> = {
  free: 0,
  growth: 30,
  pro: -1, // unlimited
};

interface SubscriptionContextType {
  tier: Tier;
  flags: FeatureFlags;
  usage: UsageData;
  loading: boolean;
  canUseFeature: (flag: keyof FeatureFlags) => boolean;
  trackEvent: (eventType: string, eventData?: Record<string, unknown>) => void;
  refreshSubscription: () => Promise<void>;
  showUpgrade: boolean;
  setShowUpgrade: (v: boolean) => void;
  upgradeReason: string;
  setUpgradeReason: (r: string) => void;
  upgradeTarget: "growth" | "pro";
  setUpgradeTarget: (t: "growth" | "pro") => void;
  shouldShowBanner: (target: "growth" | "pro") => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used within SubscriptionProvider");
  return ctx;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags>(DEFAULT_FLAGS);
  const [usage, setUsage] = useState<UsageData>({ funnelCount: 0, leadCount: 0, analyticsClicks: 0, voiceMinutesUsed: 0 });
  const [loading, setLoading] = useState(true);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState("");
  const [upgradeTarget, setUpgradeTarget] = useState<"growth" | "pro">("growth");
  const [dismissedUntil, setDismissedUntil] = useState<number>(0);

  const fetchFlags = useCallback(async () => {
    if (!user) { setFlags(DEFAULT_FLAGS); setLoading(false); return; }

    const { data, error } = await supabase.rpc("get_feature_flags", { p_user_id: user.id });
    if (!error && data) {
      setFlags(data as unknown as FeatureFlags);
    }
    setLoading(false);
  }, [user]);

  const fetchUsage = useCallback(async () => {
    if (!user) return;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const [funnelsRes, leadsRes, eventsRes, voiceRes] = await Promise.all([
      supabase.from("funnels").select("id", { count: "exact", head: true }),
      supabase.from("funnel_leads").select("id", { count: "exact", head: true }),
      supabase.from("usage_events").select("id", { count: "exact", head: true }).eq("event_type", "analytics_click"),
      supabase.from("usage_events").select("event_data").eq("event_type", "voice_call").gte("created_at", monthStart.toISOString()),
    ]);

    // Sum voice minutes from event_data.duration_minutes
    const voiceMinutes = (voiceRes.data || []).reduce((sum, e: any) => {
      const mins = e.event_data?.duration_minutes || 0;
      return sum + mins;
    }, 0);

    setUsage({
      funnelCount: funnelsRes.count || 0,
      leadCount: leadsRes.count || 0,
      analyticsClicks: eventsRes.count || 0,
      voiceMinutesUsed: Math.round(voiceMinutes * 10) / 10,
    });
  }, [user]);

  useEffect(() => {
    fetchFlags();
    fetchUsage();
  }, [fetchFlags, fetchUsage]);

  const canUseFeature = (flag: keyof FeatureFlags) => {
    const val = flags[flag];
    return typeof val === "boolean" ? val : true;
  };

  const trackEvent = useCallback(async (eventType: string, eventData?: Record<string, unknown>) => {
    if (!user) return;
    await supabase.from("usage_events").insert([{
      user_id: user.id,
      event_type: eventType,
      event_data: (eventData || {}) as any,
    }]);
    // Refresh usage after tracking
    fetchUsage();
  }, [user, fetchUsage]);

  const refreshSubscription = async () => {
    await fetchFlags();
    await fetchUsage();
  };

  const triggerUpgrade = useCallback((reason: string) => {
    // Suspended during development/testing phase
    // setUpgradeReason(reason);
    // setShowUpgrade(true);
  }, []);

  // Behavioral upgrade triggers — tier-aware
  useEffect(() => {
    if (loading || Date.now() < dismissedUntil) return;
    const t = flags.tier;

    // Free → Growth triggers
    if (t === "free") {
      if (usage.funnelCount > 1) {
        setUpgradeTarget("growth");
        triggerUpgrade("You're using multiple funnels — unlock unlimited funnels with Growth.");
        return;
      }
      if (usage.leadCount > 5) {
        setUpgradeTarget("growth");
        triggerUpgrade("You've exceeded the free lead limit. Upgrade to Growth to keep growing.");
        return;
      }
      if (usage.analyticsClicks > 5) {
        setUpgradeTarget("pro");
        triggerUpgrade("You're exploring analytics frequently — Pro gives you full attribution.");
        return;
      }
    }

    // Growth → Pro triggers
    if (t === "growth") {
      if (usage.funnelCount > 3) {
        setUpgradeTarget("pro");
        triggerUpgrade("You're running 3+ funnels — Pro gives you A/B testing and cohort analytics.");
        return;
      }
      if (usage.analyticsClicks > 5) {
        setUpgradeTarget("pro");
        triggerUpgrade("You're a power user of analytics — Pro unlocks full attribution and exports.");
        return;
      }
    }
  }, [loading, flags.tier, usage, triggerUpgrade, dismissedUntil]);

  const shouldShowBanner = useCallback((target: "growth" | "pro"): boolean => {
    const t = flags.tier;
    if (target === "growth" && t === "free") {
      return usage.funnelCount >= 1 || usage.leadCount >= 5;
    }
    if (target === "pro" && (t === "free" || t === "growth")) {
      return usage.analyticsClicks >= 3 || usage.funnelCount >= 3;
    }
    return false;
  }, [flags.tier, usage]);

  return (
    <SubscriptionContext.Provider value={{
      tier: flags.tier,
      flags,
      usage,
      loading,
      canUseFeature,
      trackEvent,
      refreshSubscription,
      showUpgrade,
      setShowUpgrade: (v: boolean) => {
        setShowUpgrade(v);
        if (!v) setDismissedUntil(Date.now() + 600000); // suppress for 10 min
      },
      upgradeReason,
      setUpgradeReason,
      upgradeTarget,
      setUpgradeTarget,
      shouldShowBanner,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
