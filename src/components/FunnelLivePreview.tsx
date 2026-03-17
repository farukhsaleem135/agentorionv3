import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { colorThemes, typographyOptions, cornerStyles, layoutStyles } from "./FunnelDesignStep";
import PremiumHeroBackground from "./PremiumHeroBackground";
import { supabase } from "@/integrations/supabase/client";

// FEEDBACK ROW — tracks agent satisfaction per content block
// These events feed the preference learning system described in the Strategy Guide.
// After 10+ feedback events per agent, analyze patterns to auto-apply preferences.
interface FeedbackRowProps {
  blockType: string;
  funnelId: string;
  onRegenerate: (blockType: string) => void;
  onEdit: (blockType: string) => void;
}

export function FeedbackRow({ blockType, funnelId, onRegenerate, onEdit }: FeedbackRowProps) {
  const [accepted, setAccepted] = useState(false);

  const track = async (action: 'accepted' | 'regenerated' | 'edited') => {
    await supabase.from('usage_events').insert({
      user_id: (await supabase.auth.getUser()).data.user?.id ?? '',
      event_type: `content_feedback_${action}`,
      event_data: { block_type: blockType, funnel_id: funnelId, action },
    });
  };

  return (
    <div className="flex justify-end gap-2 mt-2">
      <button
        onClick={() => { setAccepted(true); track('accepted'); }}
        className="px-2.5 py-1 rounded-full text-xs border transition-all"
        style={{
          background: accepted ? 'hsl(var(--accent))' : 'transparent',
          borderColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary))',
          fontWeight: 600,
        }}
      >
        {accepted ? '✓ Accepted' : 'Use This ✓'}
      </button>
      <button
        onClick={() => { onRegenerate(blockType); track('regenerated'); }}
        className="px-2.5 py-1 rounded-full text-xs border transition-all"
        style={{
          borderColor: 'hsl(var(--primary))',
          color: 'hsl(var(--primary))',
          background: 'transparent',
        }}
      >
        Regenerate ↺
      </button>
      <button
        onClick={() => { onEdit(blockType); track('edited'); }}
        className="px-2.5 py-1 rounded-full text-xs border transition-all"
        style={{
          borderColor: 'hsl(var(--border))',
          color: 'hsl(var(--muted-foreground))',
          background: 'transparent',
        }}
      >
        Edit ✎
      </button>
    </div>
  );
}

interface FunnelLivePreviewProps {
  layout: string | null;
  theme: string | null;
  customColors: { primary: string; secondary: string; accent: string } | null;
  typography: string;
  density: string;
  cornerStyle: string;
  ctaStyle: string;
  targetArea?: string;
  funnelId?: string;
  onRegenerate?: (blockType: string) => void;
  onEdit?: (blockType: string) => void;
  showFeedback?: boolean;
}

const FunnelLivePreview = ({
  layout,
  theme,
  customColors,
  typography,
  density,
  cornerStyle,
  ctaStyle,
  targetArea,
  funnelId,
  onRegenerate,
  onEdit,
  showFeedback = false,
}: FunnelLivePreviewProps) => {
  const handleRegenerate = onRegenerate || (() => {});
  const handleEdit = onEdit || (() => {});
  const colors = useMemo(() => {
    if (customColors) {
      return {
        bg: customColors.secondary,
        text: "#ffffff",
        textMuted: "rgba(255,255,255,0.6)",
        primary: customColors.primary,
        accent: customColors.accent,
        cardBg: "rgba(255,255,255,0.06)",
        heroBg: customColors.secondary,
      };
    }
    const ct = colorThemes.find((c) => c.id === theme);
    if (!ct) return defaultColors;

    // Extract base hues from swatches for a realistic preview
    const map: Record<string, typeof defaultColors> = {
      "modern-neutral": {
        bg: "hsl(220 10% 12%)",
        text: "hsl(0 0% 98%)",
        textMuted: "hsl(220 8% 55%)",
        primary: "hsl(220 10% 20%)",
        accent: "hsl(220 5% 78%)",
        cardBg: "hsl(220 10% 16%)",
        heroBg: "hsl(220 10% 8%)",
      },
      "luxury-gold": {
        bg: "hsl(0 0% 4%)",
        text: "hsl(0 0% 95%)",
        textMuted: "hsl(36 20% 60%)",
        primary: "hsl(36 100% 56%)",
        accent: "hsl(36 40% 80%)",
        cardBg: "hsl(0 0% 8%)",
        heroBg: "hsl(0 0% 2%)",
      },
      "tech-blue": {
        bg: "hsl(222 47% 14%)",
        text: "hsl(0 0% 98%)",
        textMuted: "hsl(210 20% 70%)",
        primary: "hsl(220 80% 50%)",
        accent: "hsl(210 20% 88%)",
        cardBg: "hsl(222 47% 18%)",
        heroBg: "hsl(222 47% 10%)",
      },
      "warm-earth": {
        bg: "hsl(20 20% 10%)",
        text: "hsl(38 40% 95%)",
        textMuted: "hsl(35 30% 60%)",
        primary: "hsl(15 60% 45%)",
        accent: "hsl(35 55% 70%)",
        cardBg: "hsl(20 15% 15%)",
        heroBg: "hsl(20 20% 7%)",
      },
      "high-contrast": {
        bg: "hsl(0 0% 2%)",
        text: "hsl(0 0% 98%)",
        textMuted: "hsl(0 0% 60%)",
        primary: "hsl(152 82% 48%)",
        accent: "hsl(0 0% 98%)",
        cardBg: "hsl(0 0% 8%)",
        heroBg: "hsl(0 0% 0%)",
      },
      "vibrant": {
        bg: "hsl(260 30% 10%)",
        text: "hsl(0 0% 98%)",
        textMuted: "hsl(260 20% 65%)",
        primary: "hsl(340 80% 55%)",
        accent: "hsl(40 95% 55%)",
        cardBg: "hsl(260 25% 15%)",
        heroBg: "hsl(260 35% 6%)",
      },
    };
    return map[theme || "modern-neutral"] || defaultColors;
  }, [theme, customColors]);

  const font = useMemo(() => {
    const t = typographyOptions.find((o) => o.id === typography);
    return t?.preview || "'Inter', sans-serif";
  }, [typography]);

  const radius = useMemo(() => {
    const cs = cornerStyles.find((c) => c.id === cornerStyle);
    return cs?.radius || "12px";
  }, [cornerStyle]);

  const spacing = useMemo(() => {
    switch (density) {
      case "compact": return { hero: "12px", section: "8px", gap: "6px" };
      case "spacious": return { hero: "24px", section: "16px", gap: "12px" };
      default: return { hero: "16px", section: "12px", gap: "8px" };
    }
  }, [density]);

  const ctaBtnStyle = useMemo(() => {
    const base: React.CSSProperties = {
      fontSize: "7px",
      fontWeight: 700,
      padding: "4px 12px",
      letterSpacing: "0.02em",
      display: "inline-block",
      textAlign: "center" as const,
    };
    switch (ctaStyle) {
      case "filled":
        return { ...base, backgroundColor: colors.primary, color: colors.bg, borderRadius: radius };
      case "outline":
        return { ...base, border: `1.5px solid ${colors.primary}`, color: colors.primary, borderRadius: radius, background: "transparent" };
      case "pill":
        return { ...base, backgroundColor: colors.primary, color: colors.bg, borderRadius: "999px" };
      case "square":
        return { ...base, backgroundColor: colors.primary, color: colors.bg, borderRadius: "0px" };
      default:
        return { ...base, backgroundColor: colors.primary, color: colors.bg, borderRadius: radius };
    }
  }, [ctaStyle, colors, radius]);

  const isImageHeavy = layout === "image-heavy";
  const isMinimalist = layout === "minimalist";
  const isStoryDriven = layout === "story-driven";
  const isSocialOptimized = layout === "social-optimized";
  const area = targetArea || "Your Area";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
      style={{
        borderRadius: "12px",
        border: "1px solid hsl(var(--border))",
        maxHeight: showFeedback ? "none" : "320px",
      }}
    >
      {/* Label */}
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider"
        style={{ backgroundColor: "rgba(0,0,0,0.6)", color: "rgba(255,255,255,0.8)" }}>
        Live Preview
      </div>

      {showFeedback && (
        <p className="text-xs text-center mb-4 pt-10 px-4" style={{ color: 'hsl(var(--muted-foreground))' }}>
          ✦ Use the buttons below each section to refine your funnel.
          AgentOrion learns from your feedback to improve future generations.
        </p>
      )}

      {/* Mini funnel mockup */}
      <div
        style={{
          backgroundColor: colors.bg,
          fontFamily: font,
          overflow: "hidden",
          minHeight: "280px",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            padding: `${spacing.hero} 14px`,
            textAlign: isSocialOptimized ? "left" : "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Premium animated hero background (mini variant) */}
          <PremiumHeroBackground
            primaryColor={colors.primary}
            baseColor={colors.heroBg}
            variant="mini"
          />
          <div style={{ position: "relative", zIndex: 1 }}>
            {isImageHeavy && (
              <div
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: radius,
                  background: `linear-gradient(135deg, ${colors.primary}33, ${colors.cardBg})`,
                  marginBottom: spacing.gap,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span style={{ fontSize: "7px", color: colors.textMuted, letterSpacing: "0.05em" }}>
                  FEATURED PROPERTY
                </span>
              </div>
            )}

            <p
              style={{
                fontSize: isMinimalist ? "11px" : "10px",
                fontWeight: 800,
                color: colors.text,
                marginBottom: "3px",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {isMinimalist
                ? `Discover ${area}`
                : `Find Your Dream Home in ${area}`}
            </p>
            <p
              style={{
                fontSize: "6px",
                color: colors.textMuted,
                marginBottom: spacing.gap,
                lineHeight: 1.4,
              }}
            >
              {isMinimalist
                ? "Curated listings, expert guidance."
                : "Browse exclusive listings and connect with a local expert today."}
            </p>
            <div style={ctaBtnStyle}>
              {isSocialOptimized ? "Swipe to See →" : "Get Started"}
            </div>
          </div>
          {showFeedback && funnelId && (
            <FeedbackRow blockType="headline" funnelId={funnelId} onRegenerate={handleRegenerate} onEdit={handleEdit} />
          )}
        </div>

        {/* Trust / Stats Section */}
        <div
          style={{
            backgroundColor: colors.cardBg,
            padding: `${spacing.section} 14px`,
            display: isMinimalist ? "none" : "block",
          }}
        >
          {isStoryDriven ? (
            <div>
              <p style={{ fontSize: "7px", fontWeight: 700, color: colors.text, marginBottom: "4px" }}>
                Step 1: Tell Us What You Need
              </p>
              <p style={{ fontSize: "5.5px", color: colors.textMuted, lineHeight: 1.4 }}>
                Answer a few quick questions about your ideal home.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: spacing.gap }}>
              {[
                { label: "Active Listings", value: "42" },
                { label: "Avg. Days", value: "18" },
                { label: "Sold This Month", value: "7" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: `${density === "compact" ? "4px" : "6px"} 0`,
                    borderRadius: radius,
                    backgroundColor: `${colors.primary}11`,
                  }}
                >
                  <p style={{ fontSize: "9px", fontWeight: 800, color: colors.primary }}>{stat.value}</p>
                  <p style={{ fontSize: "4.5px", color: colors.textMuted }}>{stat.label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        {showFeedback && funnelId && (
          <div style={{ padding: '0 14px 8px' }}>
            <FeedbackRow blockType="trust_block" funnelId={funnelId} onRegenerate={handleRegenerate} onEdit={handleEdit} />
          </div>
        )}

        {/* Social proof / form section */}
        <div style={{ padding: `${spacing.section} 14px` }}>
          {isSocialOptimized ? (
            <div style={{ display: "flex", gap: "6px" }}>
              {[1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: "48px",
                    borderRadius: radius,
                    background: `linear-gradient(180deg, ${colors.primary}22, ${colors.cardBg})`,
                    display: "flex",
                    alignItems: "flex-end",
                    padding: "6px",
                  }}
                >
                  <span style={{ fontSize: "5px", color: colors.textMuted }}>Listing {i}</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <p style={{ fontSize: "7px", fontWeight: 700, color: colors.text, marginBottom: "6px" }}>
                {isStoryDriven ? "Step 2: Get Matched" : "Get Your Free Report"}
              </p>
              {/* Mini form */}
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: spacing.gap }}>
                {["Full Name", "Email"].map((field) => (
                  <div
                    key={field}
                    style={{
                      height: "16px",
                      borderRadius: radius,
                      backgroundColor: `${colors.text}08`,
                      border: `1px solid ${colors.text}15`,
                      display: "flex",
                      alignItems: "center",
                      paddingLeft: "6px",
                    }}
                  >
                    <span style={{ fontSize: "4.5px", color: colors.textMuted }}>{field}</span>
                  </div>
                ))}
              </div>
              <div style={{ ...ctaBtnStyle, width: "100%", textAlign: "center" }}>
                Submit
              </div>
            </>
          )}
        </div>
        {showFeedback && funnelId && (
          <div style={{ padding: '0 14px 8px' }}>
            <FeedbackRow blockType="cta" funnelId={funnelId} onRegenerate={handleRegenerate} onEdit={handleEdit} />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const defaultColors = {
  bg: "hsl(220 10% 12%)",
  text: "hsl(0 0% 98%)",
  textMuted: "hsl(220 8% 55%)",
  primary: "hsl(152 82% 48%)",
  accent: "hsl(220 5% 78%)",
  cardBg: "hsl(220 10% 16%)",
  heroBg: "hsl(220 10% 8%)",
};

export default FunnelLivePreview;
