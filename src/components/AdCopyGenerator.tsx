import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Sparkles, Loader2, Megaphone, Instagram, Facebook, ChevronRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import IntakeFields, { type IntakeValues, buildIntakeContext } from "@/components/IntakeFields";

interface AdCopyGeneratorProps {
  open: boolean;
  onClose: () => void;
  context?: {
    listingAddress?: string;
    funnelName?: string;
    targetArea?: string;
    priceRange?: string;
  };
  branding?: {
    company_name?: string | null;
    phone?: string | null;
    website?: string | null;
  } | null;
}

type Platform = "meta" | "google" | "instagram";

const platforms: { id: Platform; label: string; icon: typeof Megaphone; desc: string }[] = [
  { id: "meta", label: "Facebook Ad", icon: Facebook, desc: "Feed & Stories" },
  { id: "google", label: "Google Ad", icon: Megaphone, desc: "Search & Display" },
  { id: "instagram", label: "Instagram", icon: Instagram, desc: "Reels & Stories" },
];

interface GeneratedAd {
  headline: string;
  description: string;
  cta: string;
}

const AdCopyGenerator = ({ open, onClose, context, branding }: AdCopyGeneratorProps) => {
  const [platform, setPlatform] = useState<Platform>("meta");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedAd | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedToContent, setSavedToContent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [intake, setIntake] = useState<IntakeValues>({ audience: "", area: "", tone: "", propertyType: "", priceRange: "" });
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setResult(null);
    setSavedToContent(false);

    try {
      const prompt = buildPrompt(platform, context, branding, intake);
      const resp = await supabase.functions.invoke("generate-content", {
        body: { type: "ad-copy", context: prompt },
      });

      if (resp.data?.title) {
        setResult({
          headline: resp.data.title,
          description: resp.data.body || "Discover your dream home today.",
          cta: resp.data.duration || "Learn More →",
        });
      } else if (resp.data?.body) {
        const body = resp.data.body as string;
        const lines = body.split("\n").filter((l: string) => l.trim());
        setResult({
          headline: lines[0]?.replace(/^(headline|title):?\s*/i, "") || "Your next home is waiting",
          description: lines.slice(1, -1).join(" ").replace(/^(description|body):?\s*/i, "") || body,
          cta: lines[lines.length - 1]?.replace(/^(cta|call.to.action):?\s*/i, "") || "Learn More",
        });
      } else {
        setResult({
          headline: context?.listingAddress
            ? `Just Listed: ${context.listingAddress}`
            : "Find Your Dream Home Today",
          description: context?.targetArea
            ? `Discover exclusive listings in ${context.targetArea}. Get personalized recommendations from a local expert who knows the market.`
            : "Get ahead of the market with insider access to new listings, price drops, and neighborhood insights. Your next chapter starts here.",
          cta: "See Available Homes →",
        });
      }
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    if (!result) return;
    const text = `Headline: ${result.headline}\n\nDescription: ${result.description}\n\nCTA: ${result.cta}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Ad copy copied to clipboard!" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateCampaign = () => {
    if (!result) return;
    const platformForCampaign = platform === "instagram" ? "meta" : platform;
    const campaignName = intake.audience
      ? `${intake.audience} – ${platforms.find(p => p.id === platform)?.label || "Ad"}`
      : context?.listingAddress
        ? `${context.listingAddress} – ${platforms.find(p => p.id === platform)?.label || "Ad"}`
        : `${platforms.find(p => p.id === platform)?.label || "Ad"} Campaign`;

    // Navigate to campaigns with pre-filled state
    onClose();
    navigate("/campaigns", {
      state: {
        prefill: {
          name: campaignName,
          platform: platformForCampaign,
          headline: result.headline,
          description: result.description,
          cta: result.cta,
        },
      },
    });
  };

  const handleSaveToContent = async () => {
    if (!user || !result) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("content").insert({
        user_id: user.id,
        type: "script",
        title: result.headline,
        body: `${result.description}\n\nCTA: ${result.cta}`,
        status: "draft",
      } as any);
      if (error) throw error;
      setSavedToContent(true);
      toast({ title: "Saved to Content Library!" });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const handleClose = () => {
    setResult(null);
    setSavedToContent(false);
    setCopied(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">AI Ad Copy</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Generate platform-optimized ad copy</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                <X size={16} className="text-foreground" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              {!result ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  {/* Platform selector */}
                  <div className="flex gap-2 mb-5">
                    {platforms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPlatform(p.id)}
                        className={`flex-1 flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-all ${
                          platform === p.id
                            ? "bg-primary/10 border border-primary/30 text-primary"
                            : "bg-secondary border border-border text-muted-foreground"
                        }`}
                      >
                        <p.icon size={18} />
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Context info */}
                  {context && (context.listingAddress || context.funnelName || context.targetArea) && (
                    <div className="bg-secondary/50 rounded-xl p-3 mb-4">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Context</p>
                      <div className="flex flex-wrap gap-1.5">
                        {context.listingAddress && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px]">{context.listingAddress}</span>
                        )}
                        {context.funnelName && (
                          <span className="px-2 py-0.5 rounded-full bg-info/10 text-info text-[10px]">{context.funnelName}</span>
                        )}
                        {context.targetArea && (
                          <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px]">{context.targetArea}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Intake fields */}
                  <div className="mb-4">
                    <IntakeFields values={intake} onChange={setIntake} />
                  </div>

                  {/* Generate button */}
                  <button
                    onClick={handleGenerate}
                    disabled={generating || !intake.audience.trim()}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
                  >
                    {generating ? (
                      <><Loader2 size={16} className="animate-spin" /> Generating...</>
                    ) : (
                      <><Sparkles size={16} /> Generate {platforms.find(p => p.id === platform)?.label} Copy</>
                    )}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  {/* Success badge */}
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 p-3 rounded-xl bg-success/10 border border-success/20"
                  >
                    <div className="w-7 h-7 rounded-full bg-success/20 flex items-center justify-center">
                      <Check size={14} className="text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Ad Copy Ready!</p>
                      <p className="text-[11px] text-muted-foreground">
                        {platforms.find(p => p.id === platform)?.label} • {intake.audience || "General"}
                      </p>
                    </div>
                  </motion.div>

                  {/* Ad preview card */}
                  <div className="bg-gradient-card rounded-xl border border-border overflow-hidden">
                    <div className="p-4 border-b border-border">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Headline</span>
                      <p className="font-display text-base font-bold text-foreground mt-1">{result.headline}</p>
                    </div>
                    <div className="p-4 border-b border-border">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</span>
                      <p className="text-sm text-foreground/80 leading-relaxed mt-1">{result.description}</p>
                    </div>
                    <div className="p-4">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Call to Action</span>
                      <div className="mt-2">
                        <span className="inline-block px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold">{result.cta}</span>
                      </div>
                    </div>
                  </div>

                  {/* What's Next section */}
                  <div className="pt-1">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">What's Next?</p>

                    {/* Primary action: Create Campaign (navigates with pre-fill) */}
                    <button
                      onClick={handleCreateCampaign}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform mb-2"
                    >
                      <Megaphone size={16} />
                      <div className="text-left flex-1">
                        <span className="block">Create Campaign</span>
                        <span className="block text-[11px] font-normal opacity-80">Review name, budget & launch</span>
                      </div>
                      <ChevronRight size={16} />
                    </button>

                    {/* Secondary actions row */}
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.97] transition-transform"
                      >
                        {copied ? <><Check size={14} className="text-success" /> Copied!</> : <><Copy size={14} /> Copy All</>}
                      </button>

                      {!savedToContent ? (
                        <button
                          onClick={handleSaveToContent}
                          disabled={saving}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.97] transition-transform disabled:opacity-50"
                        >
                          <Save size={14} /> Save to Library
                        </button>
                      ) : (
                        <button
                          onClick={() => { onClose(); navigate("/content"); }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success/10 border border-success/20 text-foreground text-sm font-medium active:scale-[0.97] transition-transform"
                        >
                          <Check size={14} className="text-success" /> Saved
                        </button>
                      )}
                    </div>

                    {/* Regenerate */}
                    <button
                      onClick={() => { setResult(null); setSavedToContent(false); }}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-muted-foreground text-sm font-medium active:scale-[0.97] transition-transform"
                    >
                      <Sparkles size={14} /> Start Over with New Options
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

function buildPrompt(platform: Platform, context?: AdCopyGeneratorProps["context"], branding?: AdCopyGeneratorProps["branding"], intake?: IntakeValues): string {
  const platformKey = platform === "meta" ? "facebook" : platform;
  const intakeCtx = intake ? buildIntakeContext(intake) : "";
  const brandCtx = branding?.company_name
    ? `Agent business: "${branding.company_name}"${branding.phone ? `, phone: ${branding.phone}` : ""}${branding.website ? `, website: ${branding.website}` : ""}.`
    : "";
  const listingCtx = context?.listingAddress ? `Property: ${context.listingAddress}` : "";
  const areaCtx = context?.targetArea ? `Target area: ${context.targetArea}` : "";
  const priceCtx = context?.priceRange ? `Price range: ${context.priceRange}` : "";

  const agentContext = [brandCtx, listingCtx, areaCtx, priceCtx, intakeCtx].filter(Boolean).join("\n");

  const platformDirectives: Record<string, string> = {
    facebook: `FACEBOOK DIRECTIVES:
- Primary text: first line must hook immediately — shown before "See More" at ~125 chars
- Do NOT start first line with "Are you", "Hey", "Do you want", or "I"
- Social proof performs strongly — reference numbers when available
- Users are in browse mode — interrupt the scroll with relevance, not clickbait
- End with a clear, specific CTA`,
    instagram: `INSTAGRAM DIRECTIVES:
- Visual-first — copy supports the image, doesn't replace it
- 2–3 lines max before hashtags
- First line creates immediate curiosity or recognition
- 5–8 hashtags maximum, highly specific to market and audience
- NEVER use generic hashtags: #realestate #realtor #homesforsale #property`,
    google: `GOOGLE ADS DIRECTIVES:
- User is actively searching — they have intent, meet them with specificity
- Headline 1 (max 30 chars): match or echo the search intent
- Headline 2 (max 30 chars): unique value proposition
- Headline 3 (max 30 chars): call to action
- Description (max 90 chars): expand on value, add proof point
- NO punctuation at end of headlines — Google policy violation
- Every character must earn its place — zero filler`,
    tiktok: `TIKTOK DIRECTIVES:
- Hook must work in first 2 seconds or user scrolls
- Conversational and native-feeling — not polished corporate
- Pattern interrupt opening: surprising statement, unexpected question, or counterintuitive claim
- Do NOT start with agent name or company name
- Script should sound like something a real person says, not reads`,
  };

  const clicheBlacklist = `BANNED: "Find your dream home", "Dream home", "Don't miss out", "Act now", "Limited time", "Local expertise", "Top producer", "Born and raised", "Best service", "Passionate about real estate". Choose specific and differentiated language instead.`;

  return `You are a performance marketing specialist writing real estate ad copy that stops scrolling, earns clicks, and converts strangers into leads.

AGENT CONTEXT:
${agentContext}

PLATFORM: ${platformKey.toUpperCase()}
${platformDirectives[platformKey] ?? ''}

${clicheBlacklist}

RULES:
1. Every line must be specific to this agent and market — never generic
2. Platform-native tone and format required
3. Honest claims only — no inflated or misleading urgency
4. Could not be mistaken for another agent's ad

Format: Put headline on line 1, description on line 2, CTA on line 3. No labels.`;
}

export default AdCopyGenerator;
