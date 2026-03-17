import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin, TrendingUp, TrendingDown, Minus, Home, BarChart3,
  Users, Clock, DollarSign, ArrowUpRight, Mail, Phone as PhoneIcon, Loader2,
  Sun, Moon, Globe, Building2, User
} from "lucide-react";
import ShareButton from "@/components/ShareButton";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface MarketArea {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  state: string | null;
  avg_sale_price: number | null;
  median_dom: number | null;
  inventory_count: number | null;
  price_trend: string | null;
  demand_score: number | null;
  competition_score: number | null;
  opportunity_score: number | null;
  market_temp: string | null;
  ai_summary: string | null;
  ai_highlights: any[];
  seo_title: string | null;
  seo_description: string | null;
  seo_content: string | null;
  structured_data: any;
  user_id: string;
  views: number;
  leads_captured: number;
}

interface AgentProfile {
  display_name: string | null;
  company_name: string | null;
  company_logo_url: string | null;
  phone: string | null;
  website: string | null;
  brand_color: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  license_state: string | null;
}

type ReportTheme = "dark" | "light";

const trendIcon = (trend: string | null, theme: ReportTheme) => {
  const successCls = theme === "light" ? "text-[hsl(152,60%,38%)]" : "text-success";
  const destructCls = theme === "light" ? "text-[hsl(0,65%,51%)]" : "text-destructive";
  const mutedCls = theme === "light" ? "text-[hsl(215,16%,47%)]" : "text-muted-foreground";
  if (trend === "rising" || trend === "up") return <TrendingUp size={16} className={successCls} />;
  if (trend === "declining" || trend === "down") return <TrendingDown size={16} className={destructCls} />;
  return <Minus size={16} className={mutedCls} />;
};

const formatPrice = (n: number | null) => {
  if (!n) return "—";
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${Math.round(n / 1000)}K`;
  return `$${n}`;
};

/* ── Theme-aware style maps ── */
const themeStyles = {
  dark: {
    page: "bg-background text-foreground",
    heroGradient: "from-primary/20 via-background to-background",
    badge: "text-primary",
    heading: "text-foreground",
    muted: "text-muted-foreground",
    card: "bg-gradient-card border-border",
    inputBg: "",
    ctaSection: "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20",
    ctaBtn: "bg-primary text-primary-foreground",
    successBg: "bg-success/15",
    successIcon: "text-success",
    toggleBtn: "bg-muted/50 text-muted-foreground hover:text-foreground",
    toggleActive: "bg-primary/15 text-primary",
    prose: "prose-invert",
    headerBg: "bg-background/80 border-border",
    headerBorder: "border-border",
    footerBg: "bg-card border-border",
    footerBorder: "border-border",
    logoBg: "bg-muted/30",
    link: "text-primary hover:text-primary/80",
  },
  light: {
    page: "bg-[hsl(210,20%,98%)] text-[hsl(220,40%,13%)]",
    heroGradient: "from-[hsl(174,62%,34%)]/10 via-[hsl(210,20%,98%)] to-[hsl(210,20%,98%)]",
    badge: "text-[hsl(174,62%,34%)]",
    heading: "text-[hsl(220,40%,13%)]",
    muted: "text-[hsl(215,16%,47%)]",
    card: "bg-white border-[hsl(220,13%,91%)] shadow-[0_4px_24px_hsl(220_20%_10%/0.06)]",
    inputBg: "bg-[hsl(210,20%,98%)] border-[hsl(220,13%,86%)] text-[hsl(220,40%,13%)] placeholder:text-[hsl(215,16%,47%)]",
    ctaSection: "bg-[hsl(174,62%,34%)]/5 border-[hsl(174,62%,34%)]/20",
    ctaBtn: "bg-[hsl(174,62%,34%)] text-white",
    successBg: "bg-[hsl(152,60%,38%)]/15",
    successIcon: "text-[hsl(152,60%,38%)]",
    toggleBtn: "bg-[hsl(220,14%,96%)] text-[hsl(215,16%,47%)] hover:text-[hsl(220,40%,13%)]",
    toggleActive: "bg-[hsl(174,62%,34%)]/15 text-[hsl(174,62%,34%)]",
    prose: "",
    headerBg: "bg-white/80 border-[hsl(220,13%,91%)]",
    headerBorder: "border-[hsl(220,13%,91%)]",
    footerBg: "bg-white border-[hsl(220,13%,91%)]",
    footerBorder: "border-[hsl(220,13%,91%)]",
    logoBg: "bg-[hsl(220,14%,96%)]",
    link: "text-[hsl(174,62%,34%)] hover:text-[hsl(174,62%,28%)]",
  },
};

const MarketPublic = () => {
  const { slug } = useParams();
  const { toast } = useToast();
  const [area, setArea] = useState<MarketArea | null>(null);
  const [agent, setAgent] = useState<AgentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadName, setLeadName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [theme, setTheme] = useState<ReportTheme>("dark");

  const t = themeStyles[theme];

  useEffect(() => {
    const fetchArea = async () => {
      if (!slug) return;
      const { data } = await supabase
        .from("market_areas")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();
      setArea(data as any);
      setLoading(false);

      if (data) {
        await supabase.from("market_areas").update({ views: (data.views || 0) + 1 }).eq("id", data.id);

        // Fetch agent profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, company_name, company_logo_url, phone, website, brand_color, avatar_url, bio, city, license_state")
          .eq("user_id", data.user_id)
          .maybeSingle();
        if (profile) setAgent(profile);
      }
    };
    fetchArea();
  }, [slug]);

  useEffect(() => {
    if (!area) return;
    document.title = area.seo_title || `${area.name} Market Report`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", area.seo_description || "");

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: area.seo_title,
      description: area.seo_description,
      about: {
        "@type": "Place",
        name: area.name,
        address: {
          "@type": "PostalAddress",
          addressLocality: area.city,
          addressRegion: area.state,
        },
      },
      ...(agent?.display_name && {
        author: {
          "@type": "RealEstateAgent",
          name: agent.display_name,
          ...(agent.company_name && { worksFor: { "@type": "Organization", name: agent.company_name } }),
          ...(agent.phone && { telephone: agent.phone }),
          ...(agent.website && { url: agent.website }),
        },
      }),
    });
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [area, agent]);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!area || !leadEmail.trim()) return;
    setSubmitting(true);

    try {
      const { data: funnels } = await supabase
        .from("funnels")
        .select("id")
        .eq("user_id", area.user_id)
        .limit(1);

      const funnelId = funnels?.[0]?.id;
      if (!funnelId) throw new Error("No funnel available");

      const { data: captureResult } = await supabase.rpc('capture_lead', {
        p_funnel_id: funnelId,
        p_lead_data: {
          name: leadName || null,
          email: leadEmail,
          phone: leadPhone || null,
          intent: `Market report: ${area.name}`,
          temperature: "warm",
          tags: ["market-intel", area.slug],
        },
      }) as { data: any; error: any };

      if (captureResult && !captureResult.success && captureResult.error === 'lead_limit_reached') {
        console.warn('Lead limit reached for market area funnel');
      }

      await supabase.from("market_areas").update({
        leads_captured: (area.leads_captured || 0) + 1,
      }).eq("id", area.id);

      setSubmitted(true);
      toast({ title: "Report Requested!", description: "You'll receive the full market report shortly." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.page}`}>
        <Loader2 size={32} className={`animate-spin ${t.badge}`} />
      </div>
    );
  }

  if (!area) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${t.page}`}>
        <div className="text-center">
          <MapPin size={48} className={`mx-auto mb-4 opacity-30 ${t.muted}`} />
          <h1 className={`text-xl font-display font-bold mb-2 ${t.heading}`}>Market Not Found</h1>
          <p className={`text-sm ${t.muted}`}>This neighborhood report is unavailable.</p>
        </div>
      </div>
    );
  }

  const highlights = Array.isArray(area.ai_highlights) ? area.ai_highlights : [];

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col ${t.page}`}>
      {/* ── Agent Header ── */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md border-b ${t.headerBg}`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo placeholder */}
            {agent?.company_logo_url ? (
              <img
                src={agent.company_logo_url}
                alt={agent.company_name || "Company logo"}
                className="h-9 w-auto max-w-[120px] object-contain flex-shrink-0"
              />
            ) : (
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${t.logoBg}`}>
                <Building2 size={18} className={t.muted} />
              </div>
            )}
            <div className="min-w-0">
              {agent?.display_name && (
                <p className={`text-sm font-semibold truncate ${t.heading}`}>{agent.display_name}</p>
              )}
              {agent?.company_name && (
                <p className={`text-[10px] truncate ${t.muted}`}>{agent.company_name}</p>
              )}
              {!agent?.display_name && !agent?.company_name && (
                <p className={`text-sm font-semibold ${t.heading}`}>Market Report</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {agent?.phone && (
              <a
                href={`tel:${agent.phone}`}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${t.link} ${t.logoBg}`}
              >
                <PhoneIcon size={12} />
                <span className="hidden sm:inline">{agent.phone}</span>
              </a>
            )}
            {/* Theme Toggle */}
            <div className={`flex items-center rounded-lg p-0.5 ${t.toggleBtn}`}>
              <button
                onClick={() => setTheme("dark")}
                className={`p-1.5 rounded-md transition-colors ${theme === "dark" ? t.toggleActive : ""}`}
                title="Dark theme"
              >
                <Moon size={14} />
              </button>
              <button
                onClick={() => setTheme("light")}
                className={`p-1.5 rounded-md transition-colors ${theme === "light" ? t.toggleActive : ""}`}
                title="Light theme"
              >
                <Sun size={14} />
              </button>
            </div>
            <ShareButton
              url={`${window.location.origin}/market/${encodeURIComponent(slug || "")}`}
              socialShareUrl={`https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/market-og?slug=${encodeURIComponent(slug || "")}`}
              title={`${area.name} Market Report`}
              description={area.seo_description || area.ai_summary || undefined}
            />
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${t.heroGradient}`} />
        <div className="relative max-w-2xl mx-auto px-4 pt-10 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className={`flex items-center gap-2 text-xs font-semibold mb-2 ${t.badge}`}>
              <MapPin size={14} />
              <span>{[area.city, area.state].filter(Boolean).join(", ")}</span>
            </div>
            <h1 className={`font-display text-3xl font-bold mb-2 ${t.heading}`}>{area.name}</h1>
            <p className={`text-sm leading-relaxed ${t.muted}`}>{area.ai_summary}</p>
          </motion.div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 space-y-6 flex-1 w-full">
        {/* Key Metrics */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          {[
            { icon: DollarSign, label: "Avg Sale Price", value: formatPrice(area.avg_sale_price), trend: area.price_trend },
            { icon: Clock, label: "Days on Market", value: area.median_dom || "—" },
            { icon: Home, label: "Active Listings", value: area.inventory_count || "—" },
            { icon: Users, label: "Buyer Demand", value: area.demand_score || 0, suffix: "/100" },
          ].map(({ icon: Icon, label, value, trend, suffix }) => (
            <div key={label} className={`rounded-xl border p-4 ${t.card}`}>
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={t.badge} />
                <span className={`text-[10px] uppercase tracking-wider ${t.muted}`}>{label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <p className={`font-display text-xl font-bold ${t.heading}`}>
                  {value}{suffix && <span className={`text-sm ${t.muted}`}>{suffix}</span>}
                </p>
                {trend && trendIcon(trend, theme)}
              </div>
            </div>
          ))}
        </motion.section>

        {/* Highlights */}
        {highlights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl border p-4 ${t.card}`}
          >
            <h2 className={`text-xs font-semibold mb-3 flex items-center gap-1.5 ${t.heading}`}>
              <BarChart3 size={14} className={t.badge} />
              Market Highlights
            </h2>
            <div className="space-y-2">
              {highlights.map((h: any, i: number) => (
                <div key={i} className={`flex items-center justify-between py-2 border-b last:border-0 ${theme === "light" ? "border-[hsl(220,13%,91%)]" : "border-border"}`}>
                  <span className={`text-xs ${t.muted}`}>{h.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${t.heading}`}>{h.value}</span>
                    {h.trend === "up" && <ArrowUpRight size={12} className={theme === "light" ? "text-[hsl(152,60%,38%)]" : "text-success"} />}
                    {h.trend === "down" && <TrendingDown size={12} className={theme === "light" ? "text-[hsl(0,65%,51%)]" : "text-destructive"} />}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SEO Content */}
        {area.seo_content && (
          <motion.article
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`prose prose-sm max-w-none ${t.prose}`}
          >
            <div className={`rounded-xl border p-5 space-y-4 ${t.card}`}>
              {area.seo_content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) return <h2 key={i} className={`text-base font-display font-bold mt-4 mb-2 ${t.heading}`}>{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className={`text-sm font-semibold mt-3 mb-1 ${t.heading}`}>{line.slice(4)}</h3>;
                if (line.startsWith("# ")) return <h2 key={i} className={`text-lg font-display font-bold mt-4 mb-2 ${t.heading}`}>{line.slice(2)}</h2>;
                if (line.startsWith("- ")) return <li key={i} className={`text-xs ml-4 ${t.muted}`}>{line.slice(2)}</li>;
                if (line.trim() === "") return null;
                return <p key={i} className={`text-xs leading-relaxed ${t.muted}`}>{line}</p>;
              })}
            </div>
          </motion.article>
        )}

        {/* Lead Capture Form */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-xl border p-5 ${t.ctaSection}`}
        >
          {submitted ? (
            <div className="text-center py-6">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${t.successBg}`}>
                <Mail size={28} className={t.successIcon} />
              </div>
              <h3 className={`font-display text-lg font-bold mb-1 ${t.heading}`}>Report Requested!</h3>
              <p className={`text-xs ${t.muted}`}>A local expert will send you the full {area.name} market report.</p>
            </div>
          ) : (
            <>
              <h3 className={`font-display text-base font-bold mb-1 ${t.heading}`}>Get the Full {area.name} Report</h3>
              <p className={`text-[10px] mb-4 ${t.muted}`}>Receive a detailed market analysis with pricing trends, school ratings, and investment outlook.</p>
              <form onSubmit={handleLeadSubmit} className="space-y-2.5">
                <Input placeholder="Your name" value={leadName} onChange={(e) => setLeadName(e.target.value)} className={`text-sm ${t.inputBg}`} />
                <Input placeholder="Email *" type="email" required value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} className={`text-sm ${t.inputBg}`} />
                <Input placeholder="Phone (optional)" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className={`text-sm ${t.inputBg}`} />
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2 ${t.ctaBtn}`}
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                  {submitting ? "Sending..." : "Get Free Market Report"}
                </button>
              </form>
            </>
          )}
        </motion.section>
      </main>

      {/* ── Agent Footer ── */}
      <footer className={`border-t ${t.footerBg}`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Agent identity */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {agent?.company_logo_url ? (
                <img
                  src={agent.company_logo_url}
                  alt={agent.company_name || "Company logo"}
                  className="h-12 w-auto max-w-[140px] object-contain"
                />
              ) : (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${t.logoBg}`}>
                  <Building2 size={22} className={t.muted} />
                </div>
              )}
              <div>
                {agent?.display_name && (
                  <p className={`text-sm font-bold ${t.heading}`}>{agent.display_name}</p>
                )}
                {agent?.company_name && (
                  <p className={`text-xs ${t.muted}`}>{agent.company_name}</p>
                )}
                {agent?.city && agent?.license_state && (
                  <p className={`text-[10px] ${t.muted}`}>{agent.city}, {agent.license_state}</p>
                )}
              </div>
            </div>

            {/* Contact links */}
            <div className="flex-1 sm:text-right space-y-2">
              <div className="flex flex-wrap sm:justify-end gap-3">
                {agent?.phone && (
                  <a
                    href={`tel:${agent.phone}`}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${t.link}`}
                  >
                    <PhoneIcon size={12} />
                    {agent.phone}
                  </a>
                )}
                {agent?.website && (
                  <a
                    href={agent.website.startsWith("http") ? agent.website : `https://${agent.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 text-xs font-medium transition-colors ${t.link}`}
                  >
                    <Globe size={12} />
                    {agent.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </a>
                )}
              </div>

              {/* Secondary CTA */}
              {agent?.phone && (
                <div className="mt-3">
                  <a
                    href={`tel:${agent.phone}`}
                    className={`inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all active:scale-95 ${t.ctaBtn}`}
                  >
                    <PhoneIcon size={13} />
                    Want to discuss this market? Call me directly
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className={`mt-6 pt-4 border-t ${t.footerBorder}`}>
            <p className={`text-[9px] leading-relaxed ${t.muted}`}>
              This market report is generated using available data and AI analysis. Statistics shown are estimates and may not reflect real-time MLS data.
              {agent?.display_name && ` Report prepared by ${agent.display_name}`}
              {agent?.company_name && ` of ${agent.company_name}`}
              . For the most current information, contact the agent directly.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MarketPublic;
