import MobileShell from "@/components/MobileShell";
import { motion, AnimatePresence } from "framer-motion";
import PromoteFunnelModal from "@/components/PromoteFunnelModal";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
  Plus,
  Zap,
  Home,
  DollarSign,
  Banknote,
  UserCheck,
  Gem,
  Plane,
  MapPin,
  BarChart3,
  Sparkles,
  Globe,
  Eye,
  Users,
  Link2,
  Linkedin,
  Mail,
  Twitter,
  Facebook,
  ChevronRight,
  X,
  ArrowRight,
  QrCode,
  Share2,
  TrendingUp,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Pause,
  Play,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Calendar,
  Star,
  Settings,
  CheckCircle,
  Megaphone,
  Database,
} from "lucide-react";
import FunnelDesignStep, { layoutStyles, colorThemes, typographyOptions, densityOptions, cornerStyles, ctaButtonStyles } from "@/components/FunnelDesignStep";
import { useState, useEffect, useCallback } from "react";

interface FunnelTemplate {
  id: string;
  name: string;
  icon: React.ElementType;
  desc: string;
  color: string;
}

const standardTemplates: FunnelTemplate[] = [
  { id: "buyer", name: "Buyer Funnel", icon: UserCheck, desc: "Capture & qualify active buyers", color: "text-info" },
  { id: "seller", name: "Seller Funnel", icon: DollarSign, desc: "Attract listing appointments", color: "text-primary" },
  { id: "cash-offer", name: "Cash Offer", icon: Banknote, desc: "Instant cash offer lead magnet", color: "text-primary" },
  { id: "valuation", name: "Home Valuation", icon: Home, desc: "Instant home value lead magnet", color: "text-primary" },
  { id: "net-proceeds", name: "Net Proceeds", icon: TrendingUp, desc: "Rate-adjusted net sheet tool", color: "text-primary" },
  { id: "first-time", name: "First-Time Buyer", icon: Sparkles, desc: "Education-first buyer funnel", color: "text-info" },
  { id: "luxury", name: "Luxury Buyer", icon: Gem, desc: "Premium, high-AOV capture", color: "text-primary" },
  { id: "relocation", name: "Relocation", icon: Plane, desc: "Out-of-market mover funnel", color: "text-info" },
  { id: "open-house", name: "Open House", icon: MapPin, desc: "QR-powered walk-in capture", color: "text-info" },
  { id: "market-report", name: "Market Report", icon: BarChart3, desc: "Hyperlocal insights funnel", color: "text-info" },
  { id: "custom", name: "Custom AI Funnel", icon: Zap, desc: "AI generates from your brief", color: "text-primary" },
];

const highIntentTemplates: FunnelTemplate[] = [
  { id: "fsbo", name: "FSBO Capture", icon: AlertTriangle, desc: "Convert For Sale By Owner sellers", color: "text-warm" },
  { id: "expired", name: "Expired Listing", icon: Clock, desc: "Re-engage expired listing owners", color: "text-destructive" },
  { id: "pre-foreclosure", name: "Pre-Foreclosure", icon: ShieldAlert, desc: "Help distressed homeowners", color: "text-warm" },
];

const templates: FunnelTemplate[] = [...standardTemplates, ...highIntentTemplates];

interface DbFunnel {
  id: string;
  name: string;
  type: string;
  status: string;
  slug: string;
  views: number;
  leads_count: number;
  headline: string | null;
  subheadline: string | null;
  body_content: string | null;
  hero_image_url: string | null;
  created_at: string;
}

const steps = [
  { label: "Target", desc: "City, zip, or neighborhood" },
  { label: "Focus", desc: "Buyer or seller intent" },
  { label: "Design", desc: "Layout & color theme" },
  { label: "Tone", desc: "Style & CTA" },
  { label: "Publish", desc: "AI generates & publishes" },
];

const PUBLISHED_APP_ORIGIN = "https://agentorionv3.lovable.app";

const getPublicOrigin = () => {
  if (typeof window === "undefined") return PUBLISHED_APP_ORIGIN;

  // In preview, always use the published app URL for shareable links
  if (window.location.hostname.includes("lovableproject.com") || window.location.hostname.includes("lovable.app")) {
    return PUBLISHED_APP_ORIGIN;
  }

  return window.location.origin;
};

const getFunnelUrl = (slug: string) => `${getPublicOrigin()}/f/${slug}`;
const getShareUrl = (slug: string, cacheKey?: string) => {
  const params = new URLSearchParams({ slug, v: "2" });
  if (cacheKey) params.set("k", cacheKey);
  return `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/funnel-og?${params.toString()}`;
};
const getQrUrl = (slug: string) =>
  `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(getFunnelUrl(slug))}`;

const Funnels = () => {
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTemplate, setSelectedTemplate] = useState<FunnelTemplate | null>(null);
  const [createStep, setCreateStep] = useState(0);
  const [selectedTone, setSelectedTone] = useState<string | null>(null);
  const [selectedCta, setSelectedCta] = useState<string | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<string | null>(null);
  const [targetArea, setTargetArea] = useState("");
  const [zipCodes, setZipCodes] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [customBrief, setCustomBrief] = useState("");
  const [selectedLayout, setSelectedLayout] = useState<string | null>("bold");
  const [selectedColorTheme, setSelectedColorTheme] = useState<string | null>("modern-neutral");
  const [customColors, setCustomColors] = useState<{ primary: string; secondary: string; accent: string } | null>(null);
  const [selectedTypography, setSelectedTypography] = useState("modern-sans");
  const [selectedDensity, setSelectedDensity] = useState("standard");
  const [selectedCornerStyle, setSelectedCornerStyle] = useState("rounded");
  const [selectedCtaStyle, setSelectedCtaStyle] = useState("pill");
  const [sectionOrder, setSectionOrder] = useState<string[]>(["hero", "stats", "form", "trust"]);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [unsplashMeta, setUnsplashMeta] = useState<{ unsplash_photo_id: string; photographer_name: string; photographer_profile_url: string; unsplash_photo_page_url: string; download_location_url?: string } | null>(null);

  // Expanded wizard fields
  const [marketCondition, setMarketCondition] = useState<'sellers' | 'balanced' | 'buyers'>('balanced');
  const [prospectProfile, setProspectProfile] = useState('');
  const [uniqueValueProp, setUniqueValueProp] = useState('');
  const [targetNeighborhoods, setTargetNeighborhoods] = useState('');
  const [urgencySignals, setUrgencySignals] = useState<string[]>([]);
  const [proofPoint1, setProofPoint1] = useState('');
  const [proofPoint2, setProofPoint2] = useState('');
  const [proofPoint3, setProofPoint3] = useState('');
  const [competitorClaims, setCompetitorClaims] = useState<string[]>([]);
  const [followUpMechanism, setFollowUpMechanism] = useState<'instant_ai' | 'personal_call' | 'calendar' | 'instant_valuation'>('instant_ai');
  const [customAudience, setCustomAudience] = useState('');

  const [funnels, setFunnels] = useState<DbFunnel[]>([]);
  const [loadingFunnels, setLoadingFunnels] = useState(true);
  const [qrFunnel, setQrFunnel] = useState<DbFunnel | null>(null);
  const [previewFunnel, setPreviewFunnel] = useState<DbFunnel | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [shareFunnel, setShareFunnel] = useState<DbFunnel | null>(null);
  const [promoteFunnel, setPromoteFunnel] = useState<DbFunnel | null>(null);

  // Profile context for image engine
  const [profileCtx, setProfileCtx] = useState<{ brand_color: string | null; avg_sale_price: number | null } | null>(null);

  // MLS/IDX awareness step
  const [idxConnected, setIdxConnected] = useState(true); // default true to hide step until loaded
  const [mlsDismissedThisSession, setMlsDismissedThisSession] = useState(false);

  const MLS_FUNNEL_TYPES = ["valuation", "market-report", "open-house"];
  const shouldShowMlsStep = selectedTemplate && MLS_FUNNEL_TYPES.includes(selectedTemplate.id) && !idxConnected && !mlsDismissedThisSession;
  // When MLS step is active, insert it as step 0 and shift all others by 1
  const mlsStepOffset = shouldShowMlsStep ? 1 : 0;

  const fetchFunnels = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("funnels")
      .select("id, name, type, status, slug, views, leads_count, headline, subheadline, body_content, hero_image_url, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setFunnels(data);
    setLoadingFunnels(false);
  }, [user]);

  useEffect(() => {
    fetchFunnels();
    // Fetch profile for image engine context + idx_connected
    if (user?.id) {
      supabase.from("profiles").select("brand_color, avg_sale_price, idx_connected").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => {
          if (data) {
            setProfileCtx(data);
            setIdxConnected(!!(data as any).idx_connected);
          }
        });
    }
  }, [fetchFunnels, user?.id]);

  // Handle preset from Seller Suite
  useEffect(() => {
    const preset = searchParams.get("preset");
    if (preset) {
      const template = templates.find(t => t.id === preset);
      if (template) {
        handleTemplateSelect(template);
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  // Scroll to top when wizard step changes
  useEffect(() => {
    // The wizard content is inside a fixed modal with overflow-auto containers
    // Target those containers directly since window/body scroll is locked
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    // Target the actual scrollable wizard container
    const scrollContainers = document.querySelectorAll('.flex-1.overflow-auto');
    scrollContainers.forEach(el => el.scrollTo({ top: 0, behavior: 'instant' }));
  }, [createStep]);

  // Hide background scrollbar when create modal is open
  useEffect(() => {
    if (showCreate) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showCreate]);

  const handleTemplateSelect = (t: FunnelTemplate) => {
    setSelectedTemplate(t);
    setCreateStep(0);
    setShowCreate(true);
  };

  const handleClose = () => {
    setShowCreate(false);
    setSelectedTemplate(null);
    setCreateStep(0);
    setSelectedTone(null);
    setSelectedCta(null);
    setSelectedFocus(null);
    setTargetArea("");
    setZipCodes("");
    setPriceMin("");
    setPriceMax("");
    setCustomBrief("");
    setSelectedLayout("bold");
    setSelectedColorTheme("modern-neutral");
    setCustomColors(null);
    setSelectedTypography("modern-sans");
    setSelectedDensity("standard");
    setSelectedCornerStyle("rounded");
    setSelectedCtaStyle("pill");
    setSectionOrder(["hero", "stats", "form", "trust"]);
    setHeroImageUrl(null);
    setUnsplashMeta(null);
    setMarketCondition('balanced');
    setProspectProfile('');
    setUniqueValueProp('');
    setTargetNeighborhoods('');
    setUrgencySignals([]);
    setProofPoint1('');
    setProofPoint2('');
    setProofPoint3('');
    setCompetitorClaims([]);
    setFollowUpMechanism('instant_ai');
    setCustomAudience('');
  };

  const handleShare = (funnel: DbFunnel) => {
    setShareFunnel(funnel);
  };

  const openExternalShare = (url: string) => {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) {
      window.location.href = url;
    }
  };

  const handleCopyLink = async (slug: string, id: string) => {
    const url = getFunnelUrl(slug);
    await navigator.clipboard.writeText(url);
    setCopied(id);
    toast({ title: "Link copied to clipboard!", description: url });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDeleteFunnel = async (id: string) => {
    if (!window.confirm("Delete this funnel? This cannot be undone.")) return;
    const { error } = await supabase.from("funnels").delete().eq("id", id).eq("user_id", user!.id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Funnel deleted" });
      await fetchFunnels();
      if (previewFunnel?.id === id) setPreviewFunnel(null);
    }
  };

  const handleTogglePause = async (funnel: DbFunnel) => {
    const newStatus = funnel.status === "paused" ? "live" : "paused";
    const { error } = await supabase.from("funnels").update({ status: newStatus }).eq("id", funnel.id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus === "live" ? "Funnel resumed" : "Funnel paused" });
      await fetchFunnels();
      if (previewFunnel?.id === funnel.id) setPreviewFunnel({ ...funnel, status: newStatus });
    }
  };

  const handlePublish = async () => {
    if (!selectedTemplate) return;
    setIsPublishing(true);
    try {
      const resp = await supabase.functions.invoke("generate-funnel", {
        body: {
          type: selectedTemplate.id,
          target_area: targetArea,
          zip_codes: zipCodes,
          focus: selectedFocus,
          price_min: priceMin,
          price_max: priceMax,
          tone: selectedTone,
          cta: selectedCta,
          user_id: user?.id,
          custom_brief: customBrief || undefined,
          layout_style: selectedLayout || "bold",
          color_theme: selectedColorTheme || "modern-neutral",
          custom_colors: customColors || undefined,
          typography: selectedTypography,
          density: selectedDensity,
          corner_style: selectedCornerStyle,
          cta_style: selectedCtaStyle,
          section_order: sectionOrder,
          hero_image_url: heroImageUrl || undefined,
          unsplash_meta: unsplashMeta || undefined,
          market_condition: marketCondition,
          prospect_profile: prospectProfile || undefined,
          unique_value_prop: uniqueValueProp || undefined,
          target_neighborhoods: targetNeighborhoods || undefined,
          urgency_signals: urgencySignals.length ? urgencySignals : undefined,
          proof_points: [proofPoint1, proofPoint2, proofPoint3].filter(Boolean).length ? [proofPoint1, proofPoint2, proofPoint3].filter(Boolean) : undefined,
          competitor_claims: competitorClaims.length ? competitorClaims : undefined,
          follow_up_mechanism: followUpMechanism,
          custom_audience: customAudience || undefined,
        },
      });

      // Handle 403 upgrade_required from backend limit check
      // supabase.functions.invoke sets resp.error on non-2xx, so we must parse it
      if (resp.error) {
        // Try to extract the JSON body from the FunctionsHttpError
        let errorBody: any = null;
        try {
          // FunctionsHttpError has a context property with the response
          const ctx = (resp.error as any)?.context;
          if (ctx && typeof ctx.json === 'function') {
            errorBody = await ctx.json();
          }
        } catch { /* ignore parse failures */ }

        if (errorBody?.upgrade_required) {
          setUpgradeTarget("growth");
          setUpgradeReason(errorBody.message || "You've reached your free plan funnel limit. Upgrade to create unlimited funnels.");
          setShowUpgrade(true);
          handleClose();
          return;
        }
        throw new Error(errorBody?.message || resp.error.message || "Failed to generate funnel");
      }

      const result = resp.data;
      if (result?.error) throw new Error(result.error);

      toast({
        title: "🚀 Funnel Published!",
        description: `"${result.funnel?.name || selectedTemplate.name}" is now live and capturing leads.`,
      });

      handleClose();
      await fetchFunnels();
      // Scroll to top after funnel is created
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
    } catch (e: any) {
      console.error("Publish error:", e);
      toast({
        title: "Failed to publish",
        description: e.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const totalViews = funnels.reduce((sum, f) => sum + f.views, 0);
  const totalLeads = funnels.reduce((sum, f) => sum + f.leads_count, 0);
  const avgConv = totalViews > 0 ? ((totalLeads / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-xs text-text-tertiary">Growth Engine</p>
            <h1 className="font-display text-xl font-bold text-text-primary">Funnels</h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-orion-blue text-white text-sm font-display font-bold touch-target active:scale-95 hover:bg-orion-blue-hover hover:-translate-y-px"
            style={{ boxShadow: "var(--shadow-brand)", transition: "all var(--transition-base)" }}
          >
            <Plus size={16} />
            Create New Funnel
          </button>
        </div>

        {/* Mobile full-width CTA */}
        <button
          onClick={() => setShowCreate(true)}
          className="w-full mt-3 py-3.5 rounded-[var(--radius-md)] bg-orion-blue text-white text-sm font-display font-bold active:scale-[0.98] sm:hidden"
          style={{ boxShadow: "var(--shadow-brand)", transition: "all var(--transition-base)" }}
        >
          <Plus size={16} className="inline mr-2" />
          Create New Funnel
        </button>
      </div>

      <div className="px-5 space-y-6">
        {/* Active Funnels from DB */}
        {loadingFunnels ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : funnels.length > 0 ? (
          <div>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3 px-1">
              Your Funnels ({funnels.length})
            </h3>
            <div className="space-y-3">
              {funnels.map((funnel, i) => (
                <motion.div
                  key={funnel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <h4 className="text-sm font-semibold text-foreground truncate">{funnel.name}</h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                            funnel.status === "live"
                              ? "bg-success/20 text-success"
                              : funnel.status === "paused"
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {funnel.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground capitalize">{funnel.type.replace(/-/g, " ")}</p>
                    </div>
                    <button
                      onClick={() => setPreviewFunnel(funnel)}
                      className="p-1.5 rounded-lg hover:bg-secondary transition-colors shrink-0"
                    >
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Eye size={12} className="text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">{funnel.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">{funnel.leads_count} leads</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <TrendingUp size={12} className="text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">
                        {funnel.views > 0 ? ((funnel.leads_count / funnel.views) * 100).toFixed(1) : "0.0"}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(funnel.slug, funnel.id)}
                      className="flex-1 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary text-[11px] text-muted-foreground truncate active:scale-[0.98] transition-transform"
                    >
                      {copied === funnel.id ? <Check size={10} className="text-success shrink-0" /> : <Link2 size={10} className="shrink-0" />}
                      <span className="truncate">{getFunnelUrl(funnel.slug).replace(/^https?:\/\//, '')}</span>
                    </button>
                    <button
                      onClick={() => setQrFunnel(funnel)}
                      className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
                    >
                      <QrCode size={14} className="text-foreground" />
                    </button>
                    <button
                      onClick={() => handleShare(funnel)}
                      className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
                    >
                      <Share2 size={14} className="text-foreground" />
                    </button>
                    <button
                      onClick={() => handleTogglePause(funnel)}
                      className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
                      title={funnel.status === "paused" ? "Resume" : "Pause"}
                    >
                      {funnel.status === "paused" ? <Play size={14} className="text-success" /> : <Pause size={14} className="text-warm" />}
                    </button>
                    <button
                      onClick={() => setPromoteFunnel(funnel)}
                      className="p-2 rounded-lg border border-primary/30 active:scale-95 transition-transform"
                      title="Promote funnel"
                    >
                      <Megaphone size={14} className="text-primary" />
                    </button>
                    <button
                      onClick={() => handleDeleteFunnel(funnel.id)}
                      className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
                      title="Delete funnel"
                    >
                      <Trash2 size={14} className="text-destructive" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : null}

        {/* Template Grid */}
        {/* Standard Funnels */}
        <div>
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 px-1">Create New Funnel</h3>
          <div className="grid grid-cols-2 gap-3">
            {standardTemplates.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  onClick={() => handleTemplateSelect(t)}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-border touch-target active:scale-[0.97] transition-transform text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                    <Icon size={16} className={t.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* High-Intent Funnels */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <h3 className="font-display text-sm font-semibold text-foreground">High-Intent Funnels</h3>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-warm/20 text-warm">Niche</span>
          </div>
          <p className="text-[11px] text-muted-foreground mb-3 px-1">Target motivated sellers with niche-specific landing pages, scripts, and nurture sequences.</p>
          <div className="grid grid-cols-2 gap-3">
            {highIntentTemplates.map((t, i) => {
              const Icon = t.icon;
              return (
                <motion.button
                  key={t.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  onClick={() => handleTemplateSelect(t)}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-warm/30 touch-target active:scale-[0.97] transition-transform text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-warm/10 flex items-center justify-center">
                    <Icon size={16} className={t.color} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground leading-tight">{t.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{t.desc}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={14} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">Funnel Performance</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="font-display text-lg font-bold text-foreground">{totalViews.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">Total Views</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-foreground">{totalLeads}</p>
              <p className="text-[10px] text-muted-foreground">Leads Captured</p>
            </div>
            <div>
              <p className="font-display text-lg font-bold text-primary">{avgConv}%</p>
              <p className="text-[10px] text-muted-foreground">Avg Conv. Rate</p>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {qrFunnel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setQrFunnel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">QR Code</h3>
                <button onClick={() => setQrFunnel(null)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4 truncate">{qrFunnel.name}</p>
              <div className="bg-foreground rounded-xl p-4 flex items-center justify-center mb-4">
                <img
                  src={getQrUrl(qrFunnel.slug)}
                  alt={`QR code for ${qrFunnel.name}`}
                  className="w-48 h-48"
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center mb-4 break-all">
                {getFunnelUrl(qrFunnel.slug)}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCopyLink(qrFunnel.slug, qrFunnel.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  {copied === qrFunnel.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  Copy Link
                </button>
                <a
                  href={getQrUrl(qrFunnel.slug)}
                  download={`${qrFunnel.slug}-qr.png`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold active:scale-95 transition-transform shadow-glow"
                >
                  Download QR
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareFunnel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/90 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setShareFunnel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-card"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">Share Funnel</h3>
                <button onClick={() => setShareFunnel(null)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4 truncate">{shareFunnel.name}</p>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <button
                  onClick={() => openExternalShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(shareFunnel.slug, shareFunnel.id))}`)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  <Facebook size={16} className="text-info" />
                  Facebook
                </button>
                <button
                  onClick={() => openExternalShare(`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(shareFunnel.slug, shareFunnel.id))}&text=${encodeURIComponent(shareFunnel.headline || shareFunnel.name)}`)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  <Twitter size={16} className="text-info" />
                  Twitter / X
                </button>
                <button
                  onClick={() => openExternalShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(getShareUrl(shareFunnel.slug, shareFunnel.id))}`)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  <Linkedin size={16} className="text-info" />
                  LinkedIn
                </button>
                <a
                  href={`mailto:?subject=${encodeURIComponent(shareFunnel.headline || shareFunnel.name)}&body=${encodeURIComponent(getFunnelUrl(shareFunnel.slug))}`}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  <Mail size={16} className="text-primary" />
                  Email
                </a>
                <button
                  onClick={async () => {
                    const socialUrl = getShareUrl(shareFunnel.slug, shareFunnel.id);
                    await navigator.clipboard.writeText(socialUrl);
                    setCopied(shareFunnel.id);
                    toast({ title: "Social link copied!", description: socialUrl });
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className="flex items-center gap-2 p-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-95 transition-transform"
                >
                  {copied === shareFunnel.id ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  Copy Social Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFunnel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Funnel Preview</p>
                  <h2 className="font-display text-lg font-bold text-foreground truncate">{previewFunnel.name}</h2>
                </div>
                <button
                  onClick={() => setPreviewFunnel(null)}
                  className="p-2.5 rounded-xl bg-secondary touch-target active:scale-95 transition-transform"
                >
                  <X size={18} className="text-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-auto px-5 pb-8 space-y-5">
                {/* Simulated landing page preview */}
                <div className="rounded-2xl border border-border overflow-hidden shadow-card relative">
                  {previewFunnel.hero_image_url ? (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${previewFunnel.hero_image_url})` }}
                    >
                      <div className="absolute inset-0 bg-black/50" />
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-card" />
                  )}
                  <div className="relative p-6 text-center border-b border-border/40">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 inline-block ${
                      previewFunnel.status === "live" ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"
                    }`}>
                      {previewFunnel.status}
                    </span>
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {previewFunnel.headline || previewFunnel.name}
                    </h3>
                    {previewFunnel.subheadline && (
                      <p className="text-sm text-white/70">{previewFunnel.subheadline}</p>
                    )}
                  </div>
                  {previewFunnel.body_content && (
                    <div className="p-5">
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                        {previewFunnel.body_content.slice(0, 300)}
                        {previewFunnel.body_content.length > 300 && "..."}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-display text-lg font-bold text-foreground">{previewFunnel.views}</p>
                    <p className="text-[10px] text-muted-foreground">Views</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-display text-lg font-bold text-foreground">{previewFunnel.leads_count}</p>
                    <p className="text-[10px] text-muted-foreground">Leads</p>
                  </div>
                  <div className="bg-card border border-border rounded-xl p-3 text-center">
                    <p className="font-display text-lg font-bold text-primary">
                      {previewFunnel.views > 0 ? ((previewFunnel.leads_count / previewFunnel.views) * 100).toFixed(1) : "0.0"}%
                    </p>
                    <p className="text-[10px] text-muted-foreground">Conv.</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleCopyLink(previewFunnel.slug, previewFunnel.id)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground active:scale-[0.97] transition-transform"
                  >
                    {copied === previewFunnel.id ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                    Copy Link
                  </button>
                  <button
                    onClick={() => {
                      setPreviewFunnel(null);
                      setQrFunnel(previewFunnel);
                    }}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground active:scale-[0.97] transition-transform"
                  >
                    <QrCode size={14} />
                    QR Code
                  </button>
                  <button
                    onClick={() => handleShare(previewFunnel)}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-card border border-border text-sm font-medium text-foreground active:scale-[0.97] transition-transform"
                  >
                    <Share2 size={14} />
                    Share
                  </button>
                  <button
                    onClick={() => window.open(getFunnelUrl(previewFunnel.slug), "_blank")}
                    className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold active:scale-[0.97] transition-transform shadow-glow"
                  >
                    <ExternalLink size={14} />
                    Open
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Funnel Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute inset-0 flex flex-col"
            >
              <div className="flex items-center justify-between px-5 pt-6 pb-4">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {selectedTemplate ? selectedTemplate.name : "Choose Template"}
                  </p>
                  <h2 className="font-display text-lg font-bold text-foreground">Create Funnel</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isPublishing}
                  className="p-2.5 rounded-xl bg-secondary touch-target active:scale-95 transition-transform disabled:opacity-50"
                >
                  <X size={18} className="text-foreground" />
                </button>
              </div>

              {!selectedTemplate ? (
                <div className="flex-1 overflow-auto px-5 pb-8">
                  <p className="text-sm text-muted-foreground mb-4">Pick a funnel type. AI handles the rest.</p>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setSelectedTemplate(t);
                            setCreateStep(0);
                          }}
                          className="flex flex-col items-start gap-2 p-4 rounded-xl bg-card border border-border touch-target active:scale-[0.97] transition-transform text-left"
                        >
                          <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                            <Icon size={16} className={t.color} />
                          </div>
                          <p className="text-sm font-medium text-foreground">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-auto px-5 pb-8">
                  {/* Progress — only show for non-MLS steps */}
                  {!(createStep === 0 && shouldShowMlsStep) && (
                  <div className="flex items-center gap-1 mb-6">
                    {steps.map((s, i) => {
                      const adjustedStep = createStep - mlsStepOffset;
                      return (
                      <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`h-1 w-full rounded-full transition-colors ${i <= adjustedStep ? "bg-primary" : "bg-secondary"}`} />
                        <span className={`text-[9px] font-medium ${i <= adjustedStep ? "text-primary" : "text-muted-foreground"}`}>
                          {s.label}
                        </span>
                      </div>
                      );
                    })}
                  </div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={createStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* MLS/IDX Connection Awareness Step */}
                      {createStep === 0 && shouldShowMlsStep && (
                        <div className="space-y-5">
                          <div className="bg-card border border-border rounded-xl p-5 text-center">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--color-orion-blue)', opacity: 0.15 }}>
                              <Database size={28} style={{ color: 'var(--color-orion-blue)' }} />
                            </div>
                            <h3 className="font-display text-base font-bold text-foreground mb-2">
                              Power This Funnel With Real MLS Data
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                              Connect your MLS/IDX credentials to populate this funnel with real local listings, live market data, and accurate comparable sales. MLS-powered funnels convert significantly better than AI-estimated content alone.
                            </p>
                            <div className="text-left space-y-3 mb-6">
                              {[
                                "Real listing data pulled directly from your MLS",
                                "Live market statistics for your target area",
                                "Accurate comparable sales for valuation funnels",
                              ].map((benefit) => (
                                <div key={benefit} className="flex items-start gap-2.5">
                                  <CheckCircle size={16} style={{ color: 'var(--color-signal-green)' }} className="shrink-0 mt-0.5" />
                                  <span className="text-sm text-foreground">{benefit}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  handleClose();
                                  navigate("/settings");
                                }}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-transform"
                                style={{ background: 'var(--color-orion-blue)', boxShadow: 'var(--shadow-brand)' }}
                              >
                                Connect My MLS/IDX Data
                              </button>
                              <button
                                onClick={() => {
                                  setMlsDismissedThisSession(true);
                                  setCreateStep(0);
                                }}
                                className="flex-1 py-3 rounded-xl text-sm font-medium border active:scale-95 transition-transform"
                                style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-secondary)' }}
                              >
                                Continue Without MLS Data
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {createStep === (0 + mlsStepOffset) && !(createStep === 0 && shouldShowMlsStep) && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Target Area</label>
                            <input
                              type="text"
                              value={targetArea}
                              onChange={(e) => setTargetArea(e.target.value)}
                              placeholder="e.g. Austin, TX or 78701"
                              className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Zip Codes (optional)</label>
                            <input
                              type="text"
                              value={zipCodes}
                              onChange={(e) => setZipCodes(e.target.value)}
                              placeholder="78701, 78702, 78704"
                              className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          {selectedTemplate?.id === "custom" && (
                            <div>
                              <label className="text-sm font-medium text-foreground mb-2 block">Your Brief for AI</label>
                              <textarea
                                value={customBrief}
                                onChange={(e) => setCustomBrief(e.target.value)}
                                placeholder="Describe what you want this funnel to do. E.g. 'Target first-time buyers in downtown Austin who are priced out of single-family homes — focus on condos under $400K with low HOA fees. Emphasize affordability and walkability.'"
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                              />
                              <p className="text-[10px] text-muted-foreground mt-1">The more detail you provide, the better the AI output.</p>
                            </div>
                          )}
                        </div>
                      )}

                      {createStep === (1 + mlsStepOffset) && (
                        <div className="space-y-4">
                          <label className="text-sm font-medium text-foreground mb-2 block">Choose Funnel Type</label>
                          {/* FUNNEL TYPE SELECTION — 6 cards */}
                          <div className="grid grid-cols-2 gap-3 w-full">
                            {[
                              {
                                value: 'buyer',
                                label: 'Buyer Lead Capture',
                                description: 'Attract buyers actively searching in your market',
                                icon: Home,
                                iconColor: 'var(--color-orion-blue)',
                                tag: 'Most Popular'
                              },
                              {
                                value: 'seller',
                                label: 'Seller / Home Valuation',
                                description: "Capture homeowners curious about their home's worth",
                                icon: DollarSign,
                                iconColor: 'var(--color-pulse-gold)',
                                tag: null
                              },
                              {
                                value: 'open_house',
                                label: 'Open House Registration',
                                description: 'Collect attendee info and follow up automatically',
                                icon: Calendar,
                                iconColor: 'var(--color-signal-green)',
                                tag: null
                              },
                              {
                                value: 'cash_offer',
                                label: 'Cash Offer',
                                description: 'Target homeowners who want a fast, certain sale',
                                icon: Zap,
                                iconColor: 'var(--color-nebula-purple)',
                                tag: null
                              },
                              {
                                value: 'luxury',
                                label: 'Luxury / Move-Up Buyer',
                                description: 'Premium positioning for $700K+ market segments',
                                icon: Star,
                                iconColor: 'var(--color-pulse-gold)',
                                tag: null
                              },
                              {
                                value: 'custom',
                                label: 'Custom Funnel',
                                description: 'You define the audience and angle',
                                icon: Settings,
                                iconColor: 'var(--color-text-muted)',
                                tag: null
                              },
                            ].map((type) => {
                              const IconComponent = type.icon;
                              const isSelected = selectedFocus === type.value;
                              return (
                                <div
                                  key={type.value}
                                  onClick={() => setSelectedFocus(type.value)}
                                  className="relative cursor-pointer rounded-lg p-4 border transition-all duration-200"
                                  style={{
                                    background: isSelected ? 'var(--color-bg-elevated)' : 'var(--color-bg-surface)',
                                    borderColor: isSelected ? 'var(--color-orion-blue)' : 'var(--color-border-subtle)',
                                    boxShadow: isSelected ? 'var(--shadow-brand)' : 'none',
                                  }}
                                >
                                  {type.tag && !isSelected && (
                                    <span className="absolute top-2 right-2 text-xs font-bold px-2 py-0.5 rounded-full"
                                      style={{ background: 'var(--color-orion-blue)', color: 'white' }}>
                                      {type.tag}
                                    </span>
                                  )}
                                  {isSelected && (
                                    <CheckCircle size={14} className="absolute top-2 right-2"
                                      style={{ color: 'var(--color-signal-green)' }} />
                                  )}
                                  <IconComponent size={22} style={{ color: type.iconColor }} className="mb-2" />
                                  <div className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                    {type.label}
                                  </div>
                                  <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                    {type.description}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Custom audience input */}
                          {selectedFocus === 'custom' && (
                            <div className="mt-3 w-full">
                              <label className="block text-xs font-semibold mb-1"
                                style={{ color: 'var(--color-text-secondary)' }}>
                                Describe your target audience in one sentence
                              </label>
                              <input
                                type="text"
                                maxLength={200}
                                placeholder="e.g., First-time buyers in suburban Phoenix earning $80K–$120K household income"
                                value={customAudience}
                                onChange={e => setCustomAudience(e.target.value)}
                                className="w-full rounded-lg px-3 py-2 text-sm border"
                                style={{
                                  background: 'var(--color-bg-elevated)',
                                  borderColor: 'var(--color-border-default)',
                                  color: 'var(--color-text-primary)',
                                }}
                              />
                              <div className="text-right text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                                {customAudience.length}/200
                              </div>
                            </div>
                          )}

                          <div className="mt-4">
                            <label className="text-sm font-medium text-foreground mb-2 block">Price Range</label>
                            <div className="flex gap-3">
                              <input
                                type="text"
                                value={priceMin}
                                onChange={(e) => setPriceMin(e.target.value)}
                                placeholder="$300K"
                                className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                              <input
                                type="text"
                                value={priceMax}
                                onChange={(e) => setPriceMax(e.target.value)}
                                placeholder="$800K"
                                className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {createStep === 2 && (
                        <FunnelDesignStep
                          selectedLayout={selectedLayout}
                          onSelectLayout={setSelectedLayout}
                          selectedTheme={selectedColorTheme}
                          onSelectTheme={setSelectedColorTheme}
                          customColors={customColors}
                          onCustomColorsChange={setCustomColors}
                          selectedTypography={selectedTypography}
                          onSelectTypography={setSelectedTypography}
                          selectedDensity={selectedDensity}
                          onSelectDensity={setSelectedDensity}
                          selectedCornerStyle={selectedCornerStyle}
                          onSelectCornerStyle={setSelectedCornerStyle}
                          selectedCtaStyle={selectedCtaStyle}
                          onSelectCtaStyle={setSelectedCtaStyle}
                          targetArea={targetArea}
                          sectionOrder={sectionOrder}
                          onSectionOrderChange={setSectionOrder}
                          heroImageUrl={heroImageUrl}
                          onHeroImageChange={setHeroImageUrl}
                          onUnsplashMetaChange={setUnsplashMeta}
                          funnelType={selectedTemplate?.id}
                          brandColor={profileCtx?.brand_color ?? undefined}
                          avgSalePrice={profileCtx?.avg_sale_price}
                          targetNeighborhoods={targetNeighborhoods}
                        />
                      )}

                      {createStep === 3 && (
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Tone</label>
                            <div className="grid grid-cols-2 gap-3">
                              {["Educational", "Premium", "Aggressive", "Friendly"].map((tone) => (
                                <button
                                  key={tone}
                                  onClick={() => setSelectedTone(tone)}
                                  className={`p-3 rounded-xl border text-sm font-medium touch-target active:scale-[0.97] transition-transform ${
                                    selectedTone === tone ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-foreground"
                                  }`}
                                >
                                  {tone}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Call-to-Action</label>
                            <div className="grid grid-cols-1 gap-2">
                              {["Schedule a Call", "Get Your Free Report", "See Available Homes", "Get Pre-Approved"].map((cta) => (
                                <button
                                  key={cta}
                                  onClick={() => setSelectedCta(cta)}
                                  className={`p-3 rounded-xl border text-sm touch-target active:scale-[0.97] transition-transform text-left ${
                                    selectedCta === cta ? "bg-primary/10 border-primary text-primary font-semibold" : "bg-card border-border text-foreground"
                                  }`}
                                >
                                  {cta}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {createStep === 4 && (
                        <div className="space-y-5">
                          <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card text-center">
                            {isPublishing ? (
                              <>
                                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                                  <Loader2 size={24} className="animate-spin text-primary" />
                                </div>
                                <h3 className="font-display text-base font-bold text-foreground mb-1">
                                  AI is Building Your Funnel...
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                  Generating landing page, lead capture, nurture sequence, video script, and social distribution assets.
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="w-14 h-14 rounded-2xl bg-gradient-cta flex items-center justify-center mx-auto mb-3 shadow-glow">
                                  <Sparkles size={24} className="text-primary-foreground" />
                                </div>
                                <h3 className="font-display text-base font-bold text-foreground mb-1">
                                  Ready to Generate & Publish
                                </h3>
                                <p className="text-xs text-muted-foreground mb-4">
                                  AI will create your complete funnel with landing page, lead capture, nurture emails, video script, and social captions.
                                </p>

                                <div className="text-left space-y-2 mb-4">
                                  {targetArea && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Area</span>
                                      <span className="text-foreground font-medium">{targetArea}</span>
                                    </div>
                                  )}
                                  {selectedFocus && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Focus</span>
                                      <span className="text-foreground font-medium">{selectedFocus}</span>
                                    </div>
                                  )}
                                  {selectedLayout && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Layout</span>
                                      <span className="text-foreground font-medium">
                                        {layoutStyles.find(l => l.id === selectedLayout)?.name || selectedLayout}
                                      </span>
                                    </div>
                                  )}
                                  {(selectedColorTheme || customColors) && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Theme</span>
                                      <span className="text-foreground font-medium">
                                        {customColors ? "Custom Brand" : colorThemes.find(c => c.id === selectedColorTheme)?.name || selectedColorTheme}
                                      </span>
                                    </div>
                                  )}
                                  {selectedTypography && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Typography</span>
                                      <span className="text-foreground font-medium">
                                        {typographyOptions.find(t => t.id === selectedTypography)?.name || selectedTypography}
                                      </span>
                                    </div>
                                  )}
                                  {selectedDensity && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Density</span>
                                      <span className="text-foreground font-medium capitalize">{selectedDensity}</span>
                                    </div>
                                  )}
                                  {selectedCornerStyle && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Corners</span>
                                      <span className="text-foreground font-medium capitalize">{selectedCornerStyle}</span>
                                    </div>
                                  )}
                                  {selectedCtaStyle && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">CTA Style</span>
                                      <span className="text-foreground font-medium capitalize">{selectedCtaStyle}</span>
                                    </div>
                                  )}
                                  {selectedTone && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">Tone</span>
                                      <span className="text-foreground font-medium">{selectedTone}</span>
                                    </div>
                                  )}
                                  {selectedCta && (
                                    <div className="flex justify-between text-xs px-2">
                                      <span className="text-muted-foreground">CTA</span>
                                      <span className="text-foreground font-medium">{selectedCta}</span>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  <div className="flex gap-3 mt-8">
                    {createStep > 0 && (
                      <button
                        onClick={() => setCreateStep((s) => s - 1)}
                        disabled={isPublishing}
                        className="flex-1 py-3.5 rounded-xl bg-secondary text-foreground text-sm font-semibold touch-target active:scale-95 transition-transform disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (createStep < 4) setCreateStep((s) => s + 1);
                        else handlePublish();
                      }}
                      disabled={isPublishing}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold touch-target active:scale-95 transition-transform shadow-glow disabled:opacity-70"
                    >
                      {isPublishing ? (
                        <>
                          <Loader2 size={16} className="animate-spin" /> Generating...
                        </>
                      ) : createStep < 4 ? (
                        <>
                          Next <ArrowRight size={16} />
                        </>
                      ) : (
                        <>
                          Publish Funnel <Zap size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Promote Modal */}
      {promoteFunnel && (
        <PromoteFunnelModal
          open={!!promoteFunnel}
          onOpenChange={(open) => { if (!open) setPromoteFunnel(null); }}
          funnelSlug={promoteFunnel.slug}
          funnelName={promoteFunnel.name}
        />
      )}
    </MobileShell>
  );
};

export default Funnels;
