import { useState } from "react";
import type { UnsplashMeta } from "./FunnelHeroImageUpload";
import {
  Layout,
  Bold,
  Briefcase,
  Heart,
  Smartphone,
  BookOpen,
  Image,
  FileText,
  Pipette,
  Check,
  Type,
  RectangleHorizontal,
  Circle,
  Square,
  Minus,
} from "lucide-react";
import FunnelLivePreview from "./FunnelLivePreview";
import FunnelSectionReorder from "./FunnelSectionReorder";
import FunnelHeroImageUpload from "./FunnelHeroImageUpload";

// ── Layout Styles ──
export interface LayoutStyle {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
}

export const layoutStyles: LayoutStyle[] = [
  { id: "minimalist", name: "Minimalist", desc: "Clean, modern, high white-space", icon: Layout },
  { id: "bold", name: "Bold / High-Contrast", desc: "Strong typography, large CTAs", icon: Bold },
  { id: "professional", name: "Professional", desc: "Structured, conservative, CRE-friendly", icon: Briefcase },
  { id: "lifestyle", name: "Lifestyle / Soft", desc: "Rounded edges, warm tones", icon: Heart },
  { id: "social-optimized", name: "Social-Optimized", desc: "Vertical, mobile-first, short-form", icon: Smartphone },
  { id: "story-driven", name: "Story-Driven", desc: "Step-by-step narrative flow", icon: BookOpen },
  { id: "image-heavy", name: "Image-Heavy", desc: "Hero visuals, property-focused", icon: Image },
  { id: "text-forward", name: "Text-Forward", desc: "Copy-driven, SEO-friendly", icon: FileText },
];

// ── Color Themes ──
export interface ColorTheme {
  id: string;
  name: string;
  swatches: string[];
  desc: string;
}

export const colorThemes: ColorTheme[] = [
  {
    id: "modern-neutral",
    name: "Modern Neutral",
    swatches: ["hsl(220 10% 20%)", "hsl(220 8% 45%)", "hsl(0 0% 98%)", "hsl(220 5% 78%)"],
    desc: "Charcoal, slate, white, silver",
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    swatches: ["hsl(0 0% 8%)", "hsl(36 100% 56%)", "hsl(36 40% 80%)", "hsl(0 0% 95%)"],
    desc: "Black, gold, champagne",
  },
  {
    id: "tech-blue",
    name: "Tech Blue",
    swatches: ["hsl(222 47% 20%)", "hsl(220 80% 50%)", "hsl(210 20% 88%)", "hsl(0 0% 98%)"],
    desc: "Navy, cobalt, ice gray",
  },
  {
    id: "warm-earth",
    name: "Warm Earth",
    swatches: ["hsl(15 60% 45%)", "hsl(35 55% 70%)", "hsl(38 40% 90%)", "hsl(20 30% 25%)"],
    desc: "Terracotta, sand, cream",
  },
  {
    id: "high-contrast",
    name: "High-Contrast",
    swatches: ["hsl(0 0% 5%)", "hsl(0 0% 98%)", "hsl(152 82% 48%)", "hsl(0 0% 50%)"],
    desc: "Black & white with accent pop",
  },
  {
    id: "vibrant",
    name: "Vibrant",
    swatches: ["hsl(260 70% 55%)", "hsl(340 80% 55%)", "hsl(40 95% 55%)", "hsl(0 0% 98%)"],
    desc: "Bold primaries, attention-grabbing",
  },
];

// ── Typography Options ──
export interface TypographyOption {
  id: string;
  name: string;
  desc: string;
  preview: string; // CSS font-family for the preview label
}

export const typographyOptions: TypographyOption[] = [
  { id: "modern-sans", name: "Modern Sans", desc: "Clean, contemporary feel", preview: "'Inter', sans-serif" },
  { id: "geometric", name: "Geometric", desc: "Sharp, tech-forward aesthetic", preview: "'Space Grotesk', sans-serif" },
  { id: "classic-serif", name: "Classic Serif", desc: "Timeless, editorial authority", preview: "Georgia, serif" },
  { id: "elegant-serif", name: "Elegant Serif", desc: "Luxury, high-end appeal", preview: "'Playfair Display', Georgia, serif" },
];

// ── Density Options ──
export const densityOptions = [
  { id: "compact", label: "Compact", desc: "Dense, information-rich" },
  { id: "standard", label: "Standard", desc: "Balanced spacing" },
  { id: "spacious", label: "Spacious", desc: "Airy, premium feel" },
] as const;

// ── Corner Style ──
export const cornerStyles = [
  { id: "sharp", label: "Sharp", desc: "Clean, modern edges", radius: "0" },
  { id: "rounded", label: "Rounded", desc: "Friendly, approachable", radius: "12px" },
  { id: "pill", label: "Pill", desc: "Soft, playful curves", radius: "999px" },
] as const;

// ── CTA Button Styles ──
export const ctaButtonStyles = [
  { id: "filled", label: "Filled", desc: "Solid background, high contrast" },
  { id: "outline", label: "Outline", desc: "Bordered, subtle elegance" },
  { id: "pill", label: "Pill", desc: "Rounded, friendly & modern" },
  { id: "square", label: "Square", desc: "Sharp, bold & direct" },
] as const;

interface FunnelDesignStepProps {
  selectedLayout: string | null;
  onSelectLayout: (id: string) => void;
  selectedTheme: string | null;
  onSelectTheme: (id: string) => void;
  customColors: { primary: string; secondary: string; accent: string } | null;
  onCustomColorsChange: (colors: { primary: string; secondary: string; accent: string } | null) => void;
  // Phase 2
  selectedTypography: string;
  onSelectTypography: (id: string) => void;
  selectedDensity: string;
  onSelectDensity: (id: string) => void;
  selectedCornerStyle: string;
  onSelectCornerStyle: (id: string) => void;
  selectedCtaStyle: string;
  onSelectCtaStyle: (id: string) => void;
  // Phase 3
  targetArea?: string;
  sectionOrder: string[];
  onSectionOrderChange: (order: string[]) => void;
  heroImageUrl: string | null;
  onHeroImageChange: (url: string | null) => void;
  onUnsplashMetaChange?: (meta: UnsplashMeta | null) => void;
  funnelType?: string;
  brandColor?: string;
  avgSalePrice?: number | null;
  targetNeighborhoods?: string;
}

const FunnelDesignStep = ({
  selectedLayout,
  onSelectLayout,
  selectedTheme,
  onSelectTheme,
  customColors,
  onCustomColorsChange,
  selectedTypography,
  onSelectTypography,
  selectedDensity,
  onSelectDensity,
  selectedCornerStyle,
  onSelectCornerStyle,
  selectedCtaStyle,
  onSelectCtaStyle,
  targetArea,
  sectionOrder,
  onSectionOrderChange,
  heroImageUrl,
  onHeroImageChange,
  onUnsplashMetaChange,
  funnelType,
  brandColor,
  avgSalePrice,
  targetNeighborhoods,
}: FunnelDesignStepProps) => {
  const [showCustom, setShowCustom] = useState(!!customColors);
  const [localColors, setLocalColors] = useState(
    customColors || { primary: "#10b981", secondary: "#1e293b", accent: "#f59e0b" }
  );

  const handleToggleCustom = () => {
    if (showCustom) {
      setShowCustom(false);
      onCustomColorsChange(null);
    } else {
      setShowCustom(true);
      onCustomColorsChange(localColors);
    }
  };

  const handleColorChange = (key: "primary" | "secondary" | "accent", value: string) => {
    const updated = { ...localColors, [key]: value };
    setLocalColors(updated);
    onCustomColorsChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Live Preview */}
      <FunnelLivePreview
        layout={selectedLayout}
        theme={selectedTheme}
        customColors={customColors}
        typography={selectedTypography}
        density={selectedDensity}
        cornerStyle={selectedCornerStyle}
        ctaStyle={selectedCtaStyle}
        targetArea={targetArea}
      />

      {/* Hero Image Upload */}
      <FunnelHeroImageUpload
        heroImageUrl={heroImageUrl}
        onImageChange={onHeroImageChange}
        onUnsplashMetaChange={onUnsplashMetaChange}
        funnelType={funnelType}
        brandColor={brandColor}
        avgSalePrice={avgSalePrice}
        targetNeighborhoods={targetNeighborhoods}
      />

      {/* Section Reorder */}
      <FunnelSectionReorder
        sectionOrder={sectionOrder}
        onReorder={onSectionOrderChange}
      />

      {/* Layout Style */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Layout Style</label>
        <p className="text-[10px] text-muted-foreground mb-3">Choose the visual structure for your funnel.</p>
        <div className="grid grid-cols-2 gap-2">
          {layoutStyles.map((ls) => {
            const Icon = ls.icon;
            const active = selectedLayout === ls.id;
            return (
              <button
                key={ls.id}
                onClick={() => onSelectLayout(ls.id)}
                className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left touch-target active:scale-[0.97] transition-all ${
                  active ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
                <Icon size={14} className={active ? "text-primary" : "text-muted-foreground"} />
                <p className="text-xs font-medium text-foreground leading-tight">{ls.name}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{ls.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Theme */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Color Theme</label>
        <p className="text-[10px] text-muted-foreground mb-3">Select a curated palette or use your brand colors.</p>
        <div className="grid grid-cols-2 gap-2">
          {colorThemes.map((ct) => {
            const active = selectedTheme === ct.id;
            return (
              <button
                key={ct.id}
                onClick={() => {
                  onSelectTheme(ct.id);
                  setShowCustom(false);
                  onCustomColorsChange(null);
                }}
                className={`relative flex flex-col items-start gap-2 p-3 rounded-xl border text-left touch-target active:scale-[0.97] transition-all ${
                  active && !showCustom ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && !showCustom && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
                <div className="flex gap-1">
                  {ct.swatches.map((s, i) => (
                    <div key={i} className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: s }} />
                  ))}
                </div>
                <p className="text-xs font-medium text-foreground leading-tight">{ct.name}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{ct.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Custom Brand Colors */}
        <button
          onClick={handleToggleCustom}
          className={`mt-3 w-full flex items-center gap-2 p-3 rounded-xl border touch-target active:scale-[0.97] transition-all text-left ${
            showCustom ? "bg-primary/10 border-primary" : "bg-card border-border"
          }`}
        >
          <Pipette size={14} className={showCustom ? "text-primary" : "text-muted-foreground"} />
          <div>
            <p className="text-xs font-medium text-foreground">Custom Brand Colors</p>
            <p className="text-[9px] text-muted-foreground">Use your own HEX colors</p>
          </div>
        </button>

        {showCustom && (
          <div className="mt-3 space-y-3 p-3 rounded-xl bg-secondary border border-border">
            {(["primary", "secondary", "accent"] as const).map((key) => (
              <div key={key} className="flex items-center gap-3">
                <label className="text-xs text-foreground font-medium capitalize w-20">{key}</label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="color"
                    value={localColors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={localColors[key]}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                    placeholder="#10b981"
                    className="flex-1 px-3 py-2 rounded-lg bg-background text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Typography */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Typography</label>
        <p className="text-[10px] text-muted-foreground mb-3">Set the typographic personality.</p>
        <div className="grid grid-cols-2 gap-2">
          {typographyOptions.map((t) => {
            const active = selectedTypography === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTypography(t.id)}
                className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left touch-target active:scale-[0.97] transition-all ${
                  active ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
                <span className="text-sm font-semibold text-foreground" style={{ fontFamily: t.preview }}>Aa</span>
                <p className="text-xs font-medium text-foreground leading-tight">{t.name}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{t.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Density */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Spacing & Density</label>
        <p className="text-[10px] text-muted-foreground mb-3">Control whitespace and content density.</p>
        <div className="grid grid-cols-3 gap-2">
          {densityOptions.map((d) => {
            const active = selectedDensity === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDensity(d.id)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center touch-target active:scale-[0.97] transition-all ${
                  active ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={8} className="text-primary-foreground" />
                  </div>
                )}
                {/* Visual density indicator */}
                <div className="flex flex-col items-center gap-[2px]">
                  {Array.from({ length: d.id === "compact" ? 4 : d.id === "standard" ? 3 : 2 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
                      style={{
                        width: "24px",
                        height: d.id === "compact" ? "3px" : d.id === "standard" ? "4px" : "5px",
                      }}
                    />
                  ))}
                </div>
                <p className="text-[11px] font-medium text-foreground leading-tight">{d.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{d.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Component Styles */}
      <div>
        <label className="text-sm font-medium text-foreground mb-1 block">Component Styles</label>
        <p className="text-[10px] text-muted-foreground mb-3">Fine-tune corners and CTA buttons.</p>

        {/* Corner Style */}
        <p className="text-xs text-muted-foreground mb-2">Corners</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {cornerStyles.map((cs) => {
            const active = selectedCornerStyle === cs.id;
            return (
              <button
                key={cs.id}
                onClick={() => onSelectCornerStyle(cs.id)}
                className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center touch-target active:scale-[0.97] transition-all ${
                  active ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={8} className="text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`w-8 h-6 border-2 ${active ? "border-primary" : "border-muted-foreground/40"}`}
                  style={{ borderRadius: cs.radius }}
                />
                <p className="text-[11px] font-medium text-foreground">{cs.label}</p>
              </button>
            );
          })}
        </div>

        {/* CTA Button Style */}
        <p className="text-xs text-muted-foreground mb-2">CTA Button</p>
        <div className="grid grid-cols-2 gap-2">
          {ctaButtonStyles.map((bs) => {
            const active = selectedCtaStyle === bs.id;
            const previewClasses = {
              filled: "bg-primary text-primary-foreground rounded-lg",
              outline: "border-2 border-primary text-primary rounded-lg bg-transparent",
              pill: "bg-primary text-primary-foreground rounded-full",
              square: "bg-primary text-primary-foreground rounded-none",
            };
            return (
              <button
                key={bs.id}
                onClick={() => onSelectCtaStyle(bs.id)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border text-center touch-target active:scale-[0.97] transition-all ${
                  active ? "bg-primary/10 border-primary" : "bg-card border-border"
                }`}
              >
                {active && (
                  <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                    <Check size={8} className="text-primary-foreground" />
                  </div>
                )}
                {/* Mini CTA preview */}
                <div className={`px-4 py-1.5 text-[10px] font-semibold ${previewClasses[bs.id]}`}>
                  Get Started
                </div>
                <p className="text-[11px] font-medium text-foreground">{bs.label}</p>
                <p className="text-[9px] text-muted-foreground leading-tight">{bs.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FunnelDesignStep;
