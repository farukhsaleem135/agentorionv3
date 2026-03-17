import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Shield, TrendingUp, Clock, Star, ChevronDown, CheckCircle2 } from "lucide-react";
import LeadCaptureFlow from "@/components/LeadCaptureFlow";
import PremiumHeroBackground from "@/components/PremiumHeroBackground";
import { motion } from "framer-motion";
import { type BrightnessResult } from "@/utils/imageBrightness";
import { hexToHsl } from "@/utils/colorUtils";
import UnsplashAttribution from "@/components/UnsplashAttribution";

interface HeroImage {
  id: string;
  variant: string;
  source: string;
  image_url: string;
  unsplash_photo_id: string | null;
  photographer_name: string | null;
  photographer_profile_url: string | null;
  unsplash_photo_page_url: string | null;
  download_location_url: string | null;
}

interface ProblemSection {
  title: string;
  subtitle: string;
  points: string[];
}

interface ValueProp {
  title: string;
  desc: string;
}

interface FunnelData {
  id: string;
  name: string;
  headline: string | null;
  subheadline: string | null;
  body_content: string | null;
  cta: string | null;
  trust_block: string | null;
  type: string;
  status: string;
  target_area: string | null;
  user_id: string | null;
  focus: string | null;
  problem_section: ProblemSection | null;
  value_props: ValueProp[] | null;
  hero_image_url: string | null;
  layout_style: string | null;
  color_theme: string | null;
  custom_colors: { primary: string; secondary: string; accent: string } | null;
  typography: string | null;
  density: string | null;
  corner_style: string | null;
  cta_style: string | null;
  section_order: string[] | null;
}

interface AgentBranding {
  display_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  phone: string | null;
  website: string | null;
  brand_color: string | null;
}

function getFunnelCategory(type: string, focus?: string | null): "seller" | "buyer" | "open-house" {
  const t = type.toLowerCase().replace(/[_-]/g, " ");
  if (t.includes("seller") || t.includes("valuation") || t.includes("home value")) return "seller";
  if (t.includes("open house") || t.includes("open-house")) return "open-house";
  // For custom/generic types, check the focus field
  if (focus) {
    const f = focus.toLowerCase();
    if (f.includes("seller")) return "seller";
  }
  return "buyer";
}

function getHeroStats(category: "seller" | "buyer" | "open-house") {
  if (category === "seller") {
    return [
      { icon: TrendingUp, label: "Avg. Sale-to-List", value: "98.7%" },
      { icon: Clock, label: "Avg. Days on Market", value: "14" },
      { icon: Star, label: "Client Satisfaction", value: "4.9/5" },
    ];
  }
  if (category === "open-house") {
    return [
      { icon: Clock, label: "Limited Spots", value: "Available" },
      { icon: Star, label: "Exclusive Preview", value: "Yes" },
      { icon: Shield, label: "Private Showing", value: "Included" },
    ];
  }
  return [
    { icon: Shield, label: "Homes Closed", value: "200+" },
    { icon: Clock, label: "Avg. Close Time", value: "28 days" },
    { icon: Star, label: "Client Rating", value: "4.9/5" },
  ];
}

function getProblemSection(category: "seller" | "buyer" | "open-house") {
  if (category === "seller") {
    return {
      title: "Is Now the Right Time to Sell?",
      subtitle: "Most sellers leave money on the table because they don't understand today's market dynamics.",
      points: [
        "Pricing too high means sitting on the market — pricing too low means losing equity.",
        "The right strategy can net you 5-12% more than average.",
        "Commission transparency matters — know exactly what you're paying and why.",
      ],
    };
  }
  if (category === "open-house") {
    return {
      title: "Don't Miss This Opportunity",
      subtitle: "The best properties don't stay available long in this market.",
      points: [
        "Homes in this area are selling within days of listing.",
        "Get insider access before the general public.",
        "Limited showing slots available — first come, first served.",
      ],
    };
  }
  return {
    title: "How to Win in Today's Market",
    subtitle: "Competing for homes is harder than ever. Here's how smart buyers are winning.",
    points: [
      "Interest rates are shifting — the right timing strategy matters more than ever.",
      "Most buyers lose 3-5 offers before winning one. We help you win on the first.",
      "Pre-approval alone isn't enough. You need a competitive offer strategy.",
    ],
  };
}

function getValueProps(category: "seller" | "buyer" | "open-house") {
  if (category === "seller") {
    return [
      { title: "Net Proceeds Preview", desc: "See what you'll actually take home after costs, commissions, and fees — before you commit." },
      { title: "Market Velocity Report", desc: "Real-time data on how fast homes like yours are selling and at what price point." },
      { title: "Transparent Pricing", desc: "Full breakdown of our compensation structure. No hidden fees, no surprises." },
    ];
  }
  if (category === "open-house") {
    return [
      { title: "Priority Access", desc: "Get first dibs on the property before it hits the open market." },
      { title: "Expert Walkthrough", desc: "Personal guided tour with market insights for the property and neighborhood." },
      { title: "Instant Alerts", desc: "Be first to know about similar properties the moment they hit the market." },
    ];
  }
  return [
    { title: "Buying Power Analysis", desc: "Understand exactly what you can afford — including hidden costs most buyers miss." },
    { title: "Competitive Strategy", desc: "A personalized approach to making offers that win, even in multiple-offer situations." },
    { title: "Market Intelligence", desc: "Hyper-local data on pricing trends, inventory, and the best time to buy." },
  ];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const FunnelPublic = () => {
  const params = useParams();
  // Support both /f/:agentSlug/:funnelSlug (new) and /f/:slug (legacy)
  const slug = params.agentSlug && params.funnelSlug
    ? `${params.agentSlug}/${params.funnelSlug}`
    : params.slug;
  const [funnel, setFunnel] = useState<FunnelData | null>(null);
  const [branding, setBranding] = useState<AgentBranding | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeHero, setActiveHero] = useState<HeroImage | null>(null);
  const [heroAttribution, setHeroAttribution] = useState<HeroImage | null>(null);
  const [sessionId] = useState(() => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const [heroBrightness, setHeroBrightness] = useState<BrightnessResult>({
    averageBrightness: 128,
    isDark: false,
    isLight: false,
    overlayStrength: 'strong',
    textColorClass: 'text-white',
    subTextColorClass: 'text-white/80',
  });

  const resolveHeroAttribution = useCallback((heroImages: HeroImage[] | null | undefined, fallbackImageUrl: string | null) => {
    if (!heroImages || heroImages.length === 0) return null;

    const byMatchingImage = fallbackImageUrl
      ? heroImages.find((h) => h.image_url === fallbackImageUrl && !!h.photographer_name)
      : null;

    if (byMatchingImage) return byMatchingImage;

    const withMetadata = heroImages.find((h) => !!h.photographer_name && (!!h.unsplash_photo_page_url || !!h.unsplash_photo_id));
    if (withMetadata) return withMetadata;

    return null;
  }, []);

  // Brightness callback — reuses already-loaded img element (no double-fetch)
  const handleBrightnessAnalyzed = useCallback((result: BrightnessResult) => {
    setHeroBrightness(result);
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!slug) { setNotFound(true); setLoading(false); return; }

      // Step 1: Fetch funnel by slug — entry point, cannot be parallelized
      const { data, error } = await supabase
        .from("funnels")
        .select("id, name, headline, subheadline, body_content, cta, trust_block, type, status, target_area, user_id, focus, problem_section, value_props, hero_image_url, layout_style, color_theme, custom_colors, typography, density, corner_style, cta_style, section_order")
        .eq("slug", slug)
        .maybeSingle();

      if (error || !data) { setNotFound(true); setLoading(false); return; }

      // Step 2: Fire profile AND hero images queries simultaneously
      const [profileResult, heroImagesResult] = await Promise.all([
        data.user_id
          ? supabase
              .from("profiles")
              .select("display_name, company_name, company_logo_url, phone, website, brand_color")
              .eq("user_id", data.user_id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
        supabase
          .from("funnel_hero_images")
          .select("id, variant, source, image_url, unsplash_photo_id, photographer_name, photographer_profile_url, unsplash_photo_page_url, download_location_url")
          .eq("funnel_id", data.id)
          .order("variant"),
      ]);

      // Set all state at once — single re-render instead of three
      const funnelData: FunnelData = {
        ...data,
        focus: data.focus ?? null,
        problem_section: data.problem_section as unknown as ProblemSection | null,
        value_props: data.value_props as unknown as ValueProp[] | null,
        custom_colors: data.custom_colors as unknown as FunnelData["custom_colors"],
        section_order: data.section_order ?? null,
      };
      setFunnel(funnelData);

      if (profileResult.data) setBranding(profileResult.data);

      const heroImages = heroImagesResult.data;
      setHeroAttribution(resolveHeroAttribution(heroImages, data.hero_image_url));

      if (heroImages && heroImages.length > 0) {
        // Prefer variant "A" to stay consistent with OG meta tags (funnel-og picks variant A)
        const variantA = heroImages.find((h: HeroImage) => h.variant === "A");
        const selected = variantA || heroImages[0];
        setActiveHero(selected);

        // Inject preload hint the moment image URL is known
        // Fires before re-render — saves ~100-200ms LCP latency
        if (selected?.image_url && selected.image_url.includes('unsplash.com')) {
          const existingPreload = document.querySelector('link[rel="preload"][as="image"]');
          if (!existingPreload) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.setAttribute('fetchpriority', 'high');

            const isMobile = window.innerWidth <= 640;
            const preloadWidth = isMobile ? 390 : 1080;
            const url = new URL(selected.image_url);
            url.searchParams.set('w', String(preloadWidth));
            url.searchParams.set('fm', 'webp');
            url.searchParams.set('q', isMobile ? '70' : '80');
            url.searchParams.set('fit', 'crop');
            url.searchParams.set('crop', 'entropy');
            preloadLink.href = url.toString();

            preloadLink.setAttribute('imagesrcset',
              [390, 640, 828, 1080, 1440, 1920]
                .map(w => {
                  const u = new URL(selected.image_url);
                  u.searchParams.set('w', String(w));
                  u.searchParams.set('fm', 'webp');
                  u.searchParams.set('q', w <= 400 ? '70' : '80');
                  u.searchParams.set('fit', 'crop');
                  u.searchParams.set('crop', 'entropy');
                  return `${u.toString()} ${w}w`;
                })
                .join(', ')
            );
            preloadLink.setAttribute('imagesizes', '100vw');
            document.head.appendChild(preloadLink);
          }
        }

        // Track hero_rendered event (fire-and-forget)
        supabase.from("hero_events").insert({
          funnel_id: data.id,
          hero_image_id: selected.id,
          variant: selected.variant,
          session_id: sessionId,
          event_type: "hero_rendered",
        }).then(() => {});

        // Trigger Unsplash download if needed
        if (selected.source === "unsplash" && selected.unsplash_photo_id) {
          supabase.functions.invoke("unsplash-hero", {
            body: { action: "trigger_download", photo_id: selected.unsplash_photo_id },
          }).catch(() => {});
        }
      }

      supabase.rpc("increment_funnel_views", { p_funnel_id: data.id });

      // Track page_view event
      supabase.from("hero_events").insert({
        funnel_id: data.id,
        hero_image_id: heroImages?.[0]?.id || null,
        variant: heroImages?.[0]?.variant || "none",
        session_id: sessionId,
        event_type: "page_view",
      }).then(() => {});

      setLoading(false);
    };
    load();
  }, [slug, sessionId, resolveHeroAttribution]);

  useEffect(() => {
    if (!funnel) return;
    const title = funnel.headline || funnel.name;
    const description = funnel.subheadline || `${funnel.type.replace(/-/g, " ")} — ${funnel.target_area || "Real Estate"}`;
    document.title = title;

    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`) || document.querySelector(`meta[name="${property}"]`);
      if (el) { el.setAttribute("content", content); }
      else {
        el = document.createElement("meta");
        el.setAttribute(property.startsWith("og:") ? "property" : "name", property);
        el.setAttribute("content", content);
        document.head.appendChild(el);
      }
    };
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:type", "website");
    setMeta("twitter:card", "summary");
    setMeta("description", description);

    // Fallback preload for hero image
    const heroUrl = activeHero?.image_url;
    if (heroUrl && !document.querySelector('link[rel="preload"][as="image"]')) {
      const preloadLink = document.createElement('link');
      preloadLink.rel = 'preload';
      preloadLink.as = 'image';
      preloadLink.setAttribute('fetchpriority', 'high');
      preloadLink.href = heroUrl;
      document.head.appendChild(preloadLink);
    }

    return () => { document.title = "AgentOrion — AI Real Estate Growth Platform"; };
  }, [funnel, activeHero]);

  // ── Resolve design options into concrete styles (must be before early returns) ──
  const theme = useMemo(() => {
    if (!funnel) return null;
    const colorThemeMap: Record<string, { primary: string; bg: string; accent: string }> = {
      "modern-neutral": { primary: "hsl(220 10% 20%)", bg: "hsl(220 26% 9%)", accent: "hsl(160 84% 39%)" },
      "luxury-gold": { primary: "hsl(36 100% 56%)", bg: "hsl(0 0% 8%)", accent: "hsl(36 100% 56%)" },
      "tech-blue": { primary: "hsl(220 80% 50%)", bg: "hsl(222 47% 20%)", accent: "hsl(220 80% 50%)" },
      "warm-earth": { primary: "hsl(15 60% 45%)", bg: "hsl(20 30% 25%)", accent: "hsl(15 60% 45%)" },
      "high-contrast": { primary: "hsl(152 82% 48%)", bg: "hsl(0 0% 5%)", accent: "hsl(152 82% 48%)" },
      "vibrant": { primary: "hsl(260 70% 55%)", bg: "hsl(260 30% 12%)", accent: "hsl(340 80% 55%)" },
    };
    const ct = funnel.color_theme || "modern-neutral";
    const base = colorThemeMap[ct] || colorThemeMap["modern-neutral"];

    // Priority: custom colors > brand_color > theme default
    const accentColor =
      funnel.custom_colors?.accent ||
      (branding?.brand_color ? hexToHsl(branding.brand_color) : null) ||
      base.accent;
    const bgColor = funnel.custom_colors?.secondary || base.bg;

    const fontMap: Record<string, string> = {
      "modern-sans": "'Inter', sans-serif",
      "geometric": "'Space Grotesk', sans-serif",
      "classic-serif": "Georgia, serif",
      "elegant-serif": "'Playfair Display', Georgia, serif",
    };
    const fontFamily = fontMap[funnel.typography || "modern-sans"] || fontMap["modern-sans"];

    const radiusMap: Record<string, string> = { sharp: "0px", rounded: "12px", pill: "999px" };
    const borderRadius = radiusMap[funnel.corner_style || "rounded"] || "12px";

    const densityMap: Record<string, { py: string; gap: string }> = {
      compact: { py: "py-10 md:py-14", gap: "space-y-3" },
      standard: { py: "py-16 md:py-20", gap: "space-y-4" },
      spacious: { py: "py-20 md:py-28", gap: "space-y-6" },
    };
    const spacing = densityMap[funnel.density || "standard"] || densityMap["standard"];

    return { accentColor, bgColor, fontFamily, borderRadius, spacing };
  }, [funnel, branding]);

  // TEMPORARY DIAGNOSTIC — remove after confirming brand_color state
  console.log('THEME DEBUG:', {
    brand_color_from_branding: branding?.brand_color,
    resolved_accent_color: theme?.accentColor,
    funnel_custom_colors: funnel?.custom_colors,
    color_theme: funnel?.color_theme,
    branding_object: branding,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !funnel || !theme) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground text-sm">This funnel doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const category = getFunnelCategory(funnel.type, funnel.focus);
  const stats = getHeroStats(category);
  const problem = funnel.problem_section || getProblemSection(category);
  const valueProps = funnel.value_props || getValueProps(category);

  const resolvedHeroImageUrl = activeHero?.image_url || funnel.hero_image_url || "/og-default.png";

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: theme.fontFamily, backgroundColor: theme.bgColor }}>
      {/* ═══ AGENT BRANDING BAR ═══ */}
      {branding && (branding.company_name || branding.company_logo_url) && (
        <div className="funnel-gradient-hero py-4 px-6" style={{ borderBottom: "1px solid hsl(var(--funnel-border) / 0.3)" }}>
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {branding.company_logo_url && (
                <img src={branding.company_logo_url} alt={branding.company_name || "Agent"} className="h-10 w-auto rounded-md object-contain" />
              )}
              {branding.company_name && (
                <span className="font-display text-base font-bold funnel-fg">{branding.company_name}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {branding.phone && (
                <a href={`tel:${branding.phone}`} className="text-xs funnel-fg-muted hover:opacity-80 transition-opacity">{branding.phone}</a>
              )}
              {branding.website && (
                <a href={branding.website.startsWith("http") ? branding.website : `https://${branding.website}`} target="_blank" rel="noopener noreferrer" className="text-xs funnel-accent hover:underline">{branding.website.replace(/^https?:\/\//, "")}</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ HERO — Premium animated background ═══ */}
      <section className="relative overflow-hidden">
        {/* Premium hero background — use rotated hero image or funnel default */}
        <PremiumHeroBackground
          primaryColor={theme.accentColor}
          baseColor={theme.bgColor}
          heroImageUrl={resolvedHeroImageUrl}
          variant="full"
          overlayStrength={heroBrightness.overlayStrength}
          onBrightnessAnalyzed={handleBrightnessAnalyzed}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="relative max-w-2xl mx-auto px-6 pt-16 pb-12 md:pt-24 md:pb-16 text-center"
        >
          {/* Category badge */}
          <motion.div variants={fadeUp}>
            <span className="inline-block px-4 py-1.5 rounded-full border funnel-border funnel-accent text-xs font-bold uppercase tracking-widest mb-6" style={{ borderColor: `${theme.accentColor.replace(")", " / 0.2)")}`, backgroundColor: `${theme.accentColor.replace(")", " / 0.08)")}` }}>
              {funnel.type.replace(/[-_]/g, " ")}
              {funnel.target_area ? ` • ${funnel.target_area}` : ""}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className={`font-display text-3xl md:text-5xl font-bold ${heroBrightness.textColorClass} mb-4 leading-[1.1] tracking-tight`}
            style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5), 0 2px 12px rgba(0,0,0,0.3)' }}
          >
            {funnel.headline || funnel.name}
          </motion.h1>

          {/* Subheadline — guard against stale $0K price values */}
          {funnel.subheadline && !/\$0K\s*(to\s*\$0K)?/i.test(funnel.subheadline) && (
            <motion.p
              variants={fadeUp}
              className={`text-base md:text-lg ${heroBrightness.subTextColorClass} max-w-lg mx-auto mb-8 leading-relaxed`}
              style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
            >
              {funnel.subheadline}
            </motion.p>
          )}

          {/* Primary CTA */}
          <motion.div variants={fadeUp} className="mb-10">
            <LeadCaptureFlow
              funnelId={funnel.id}
              funnelType={funnel.type}
              funnelCategory={category}
              ctaText={funnel.cta || "Get Started"}
              variant="hero"
              accentColor={theme.accentColor}
              borderRadius={theme.borderRadius}
              ctaStyle={funnel.cta_style || "pill"}
            />
          </motion.div>

          {/* Micro-trust stats */}
          <motion.div
            variants={fadeUp}
            className="flex items-center justify-center gap-6 md:gap-10"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Icon size={14} style={{ color: theme.accentColor }} />
                  <span className={`font-display text-lg md:text-xl font-bold ${heroBrightness.textColorClass}`} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>{value}</span>
                </div>
                <span className={`text-[10px] md:text-xs ${heroBrightness.subTextColorClass} uppercase tracking-wider`}>{label}</span>
              </div>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div variants={fadeUp} className="mt-12">
            <ChevronDown size={20} className="mx-auto animate-bounce" style={{ color: "hsl(215 14% 55% / 0.4)" }} />
          </motion.div>
        </motion.div>

        {/* Unsplash Attribution Overlay — bottom left of hero image */}
        {(heroAttribution?.photographer_name || activeHero?.photographer_name) && (
          <UnsplashAttribution
            photographerName={(heroAttribution?.photographer_name || activeHero?.photographer_name)!}
            photographerProfileUrl={heroAttribution?.photographer_profile_url || activeHero?.photographer_profile_url}
          />
        )}
      </section>

      {/* ═══ PROBLEM FRAMING — Light background for contrast ═══ */}
      <section className={`relative ${theme.spacing.py} funnel-light-bg`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="relative max-w-2xl mx-auto px-6"
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold funnel-light-fg mb-3 text-center">
            {problem.title}
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm md:text-base funnel-light-fg-muted text-center mb-10 max-w-lg mx-auto">
            {problem.subtitle}
          </motion.p>
          <div className={theme.spacing.gap}>
            {problem.points.map((point, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="flex items-start gap-3 funnel-light-card p-4 funnel-light-shadow-card"
                style={{ border: "1px solid hsl(var(--funnel-light-border))", borderRadius: theme.borderRadius }}
              >
                <div className="shrink-0 mt-0.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: `${theme.accentColor.replace(")", " / 0.15)")}` }}>
                  <span className="text-xs font-bold" style={{ color: theme.accentColor }}>{i + 1}</span>
                </div>
                <p className="text-sm funnel-light-fg leading-relaxed" style={{ opacity: 0.85 }}>{point}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ VALUE PROPS — Warm tinted background ═══ */}
      <section className={`${theme.spacing.py} funnel-warm-bg`}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto px-6"
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold funnel-warm-fg mb-3 text-center">
            What You'll Get
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm funnel-warm-fg-muted text-center mb-10">
            Actionable intelligence — not generic advice.
          </motion.p>
          <div className={theme.spacing.gap}>
            {valueProps.map((vp, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="funnel-warm-card p-5 transition-colors"
                style={{ border: "1px solid hsl(var(--funnel-warm-border))", boxShadow: "0 2px 12px hsl(30 20% 10% / 0.05)", borderRadius: theme.borderRadius }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={16} className="shrink-0" style={{ color: theme.accentColor }} />
                  <h3 className="font-display text-base font-semibold funnel-warm-fg">{vp.title}</h3>
                </div>
                <p className="text-sm funnel-warm-fg-muted leading-relaxed pl-6">{vp.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ BODY CONTENT — Light alt surface ═══ */}
      {funnel.body_content && (
        <section className="py-12 md:py-16 funnel-light-bg-alt">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerContainer}
            className="max-w-2xl mx-auto px-6"
          >
            {funnel.body_content.split("\n\n").map((p, i) => (
              <motion.p
                key={i}
                variants={fadeUp}
                className="text-sm md:text-base funnel-light-fg leading-relaxed mb-4"
                style={{ opacity: 0.85 }}
              >
                {p}
              </motion.p>
            ))}
          </motion.div>
        </section>
      )}

      {/* ═══ TRUST BLOCK — Light neutral ═══ */}
      {funnel.trust_block && (
        <section className="py-12 md:py-16 funnel-light-bg">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={fadeUp}
            className="max-w-2xl mx-auto px-6"
          >
            <div className="relative funnel-light-card rounded-2xl p-6 md:p-8 text-center overflow-hidden funnel-light-shadow-card" style={{ border: "1px solid hsl(var(--funnel-light-border))" }}>
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(to right, transparent, ${theme.accentColor.replace(")", " / 0.4)")}, transparent)` }} />
              <Shield size={24} className="mx-auto mb-3" style={{ color: theme.accentColor }} />
              <p className="text-sm md:text-base funnel-light-fg leading-relaxed max-w-lg mx-auto" style={{ opacity: 0.85 }}>
                {funnel.trust_block}
              </p>
            </div>
          </motion.div>
        </section>
      )}

      {/* ═══ SOCIAL PROOF — Warm tinted for soft contrast ═══ */}
      <section className="py-12 md:py-16 funnel-warm-bg">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto px-6"
        >
          <motion.h2 variants={fadeUp} className="font-display text-xl md:text-2xl font-bold funnel-warm-fg mb-6 text-center">
            What Clients Are Saying
          </motion.h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { text: "The market analysis was eye-opening. Felt confident making my first offer.", stars: 5 },
              { text: "Professional, responsive, and actually understood our needs. Highly recommend.", stars: 5 },
            ].map((review, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className="funnel-warm-card p-5"
                style={{ border: "1px solid hsl(var(--funnel-warm-border))", boxShadow: "0 2px 12px hsl(30 20% 10% / 0.05)", borderRadius: theme.borderRadius }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: review.stars }).map((_, j) => (
                    <Star key={j} size={14} style={{ color: theme.accentColor, fill: theme.accentColor }} />
                  ))}
                </div>
                <p className="text-sm funnel-warm-fg leading-relaxed italic" style={{ opacity: 0.85 }}>"{review.text}"</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ BOTTOM CTA — Dark dramatic contrast ═══ */}
      <section className="py-16 md:py-24" style={{ background: `linear-gradient(180deg, ${theme.bgColor}, ${theme.bgColor})` }}>
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={staggerContainer}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold funnel-fg mb-3">
            Ready to Take the Next Step?
          </motion.h2>
          <motion.p variants={fadeUp} className="text-sm funnel-fg-muted mb-8 max-w-md mx-auto">
            No pressure. No obligation. Just a conversation about your goals.
          </motion.p>
          <motion.div variants={fadeUp}>
            <LeadCaptureFlow
              funnelId={funnel.id}
              funnelType={funnel.type}
              funnelCategory={category}
              ctaText={funnel.cta || "Get Started"}
              variant="bottom"
              accentColor={theme.accentColor}
              borderRadius={theme.borderRadius}
              ctaStyle={funnel.cta_style || "pill"}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ BRANDED FOOTER ═══ */}
      <footer className="py-8" style={{ backgroundColor: theme.bgColor, borderTop: `1px solid ${theme.accentColor.replace(")", " / 0.15)")}` }}>
        <div className="max-w-2xl mx-auto px-6 text-center space-y-3">
          {branding?.company_logo_url && (
            <img src={branding.company_logo_url} alt={branding.company_name || ""} className="h-8 w-auto mx-auto opacity-60 object-contain" />
          )}
          {branding?.company_name && (
            <p className="text-xs font-semibold funnel-fg" style={{ opacity: 0.6 }}>{branding.company_name}</p>
          )}
          <div className="flex items-center justify-center gap-4">
            {branding?.phone && (
              <a href={`tel:${branding.phone}`} className="text-xs funnel-fg-muted hover:opacity-80 transition-opacity">{branding.phone}</a>
            )}
            {branding?.website && (
              <a href={branding.website.startsWith("http") ? branding.website : `https://${branding.website}`} target="_blank" rel="noopener noreferrer" className="text-xs funnel-accent hover:underline">{branding.website.replace(/^https?:\/\//, "")}</a>
            )}
          </div>
          <p className="text-xs funnel-fg-muted" style={{ opacity: 0.35 }}>
            © {new Date().getFullYear()} {branding?.company_name || "All rights reserved"}. Powered by AgentOrion.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default FunnelPublic;
