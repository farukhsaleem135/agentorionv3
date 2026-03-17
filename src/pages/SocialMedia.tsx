import MobileShell from "@/components/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Share2, Copy, Check, Loader2, Sparkles, Calendar, Lightbulb, ArrowRight, Rocket, ClipboardCheck,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { platforms, weeklyCalendar, performanceTips, type PlatformDef } from "@/data/socialMediaContent";
import { motion, AnimatePresence } from "framer-motion";

const SocialMedia = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformDef>(platforms[0]);
  const [contentType, setContentType] = useState(platforms[0].contentTypes[0]);
  const [marketArea, setMarketArea] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<{ title: string; body: string; duration?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isNewAgent, setIsNewAgent] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Load profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("market_area, display_name, created_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setMarketArea(data.market_area || "");
        setDisplayName(data.display_name || "");
        // Consider new agent if account < 30 days old
        const created = new Date(data.created_at);
        const daysSinceCreation = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
        setIsNewAgent(daysSinceCreation < 30);
      }
      setProfileLoaded(true);
    })();
  }, [user]);

  const selectPlatform = (p: PlatformDef) => {
    setSelectedPlatform(p);
    setContentType(p.contentTypes[0]);
    setGeneratedContent(null);
  };

  const handleGenerate = useCallback(async (overridePlatform?: string, overrideType?: string) => {
    const platform = overridePlatform || selectedPlatform.name;
    const type = overrideType || contentType;

    if (!marketArea.trim()) {
      toast.error("Please set your market area in Settings first", {
        action: { label: "Go to Settings", onClick: () => navigate("/settings") },
      });
      return;
    }

    setGenerating(true);
    setGeneratedContent(null);

    try {
      const context = `Platform: ${platform}
Content type: ${type}
Agent name: ${displayName || "Agent"}
Market area: ${marketArea}
Date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
Instructions: Generate a ${type} for ${platform}. The content must be specific to the ${marketArea} real estate market. Use local neighborhood names, price ranges, and market conditions relevant to ${marketArea}. Write for a real estate agent named ${displayName || "the agent"}.`;

      const isBlog = platform === "Blog Posts";
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { type: isBlog ? "blog-post" : "social-post", context },
      });

      if (error) throw error;
      setGeneratedContent(data);
    } catch (e: any) {
      console.error("Generation error:", e);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [selectedPlatform, contentType, marketArea, displayName, navigate]);

  const handleCopy = () => {
    if (!generatedContent) return;
    const text = `${generatedContent.title}\n\n${generatedContent.body}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = generatedContent ? generatedContent.body.split(/\s+/).filter(Boolean).length : 0;
  const charCount = generatedContent ? generatedContent.body.length : 0;

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Share2 size={20} className="text-primary" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Social Media Mastery Guide</h1>
            <p className="text-xs text-muted-foreground">
              Whether you're building your brand from scratch or looking for a smarter way to stay consistent — AgentOrion AI generates complete content for every platform.
            </p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-5 pb-8">
        {/* Agent type context */}
        <div className="rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isNewAgent
              ? "🚀 Start here — your first 30 days of social media content, all AI-generated."
              : "⚡ Your weekly content system — AI-generated posts, articles, and videos ready to publish in minutes."}
          </p>
        </div>

        {/* New Agent Quick Start Banner */}
        {isNewAgent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-3 flex items-start gap-3"
          >
            <Rocket size={18} className="text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground mb-1">New to AgentOrion?</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Your Day 10 Launch Program task is to create your first Facebook post. Click Generate below to create it now.
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="text-primary text-[11px] shrink-0"
              onClick={() => navigate("/launch-program")}
            >
              Launch Program →
            </Button>
          </motion.div>
        )}

        {/* Two-column layout on larger screens, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
          {/* Platform Selector */}
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-foreground">Platforms</h2>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {platforms.map((p) => {
                const Icon = p.icon;
                const isSelected = selectedPlatform.id === p.id;
                return (
                  <Card
                    key={p.id}
                    className={`cursor-pointer transition-all ${isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "hover:border-primary/30"}`}
                    onClick={() => selectPlatform(p)}
                  >
                    <CardContent className="flex items-center gap-3 p-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: `${p.color}15` }}
                      >
                        <Icon size={18} style={{ color: p.color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate hidden lg:block">{p.strategy.slice(0, 60)}…</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Content Generator */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {(() => { const Icon = selectedPlatform.icon; return <Icon size={18} style={{ color: selectedPlatform.color }} />; })()}
              <h2 className="text-sm font-semibold text-foreground">{selectedPlatform.name}</h2>
            </div>

            <p className="text-xs text-muted-foreground">{selectedPlatform.strategy}</p>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Content Type</label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedPlatform.contentTypes.map((ct) => (
                      <SelectItem key={ct} value={ct} className="text-xs">{ct}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-muted-foreground mb-1 block">Target Market</label>
                <Input
                  value={marketArea}
                  onChange={(e) => setMarketArea(e.target.value)}
                  placeholder="e.g. Downtown Austin, TX"
                  className="h-9 text-xs"
                />
              </div>

              <Button
                onClick={() => handleGenerate()}
                disabled={generating}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {generating ? (
                  <><Loader2 size={14} className="animate-spin mr-2" /> Generating…</>
                ) : (
                  <><Sparkles size={14} className="mr-2" /> Generate {contentType}</>
                )}
              </Button>
            </div>

            {/* Generated content output */}
            <AnimatePresence>
              {generatedContent && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-3"
                >
                  <Card className="border-primary/20">
                    <CardContent className="p-4 space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">{generatedContent.title}</h3>
                      <div className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                        {generatedContent.body}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex gap-3 text-[10px] text-muted-foreground">
                          <span>{charCount.toLocaleString()} chars</span>
                          <span>{wordCount} words</span>
                          {generatedContent.duration && <span>{generatedContent.duration}</span>}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px] gap-1.5"
                          onClick={handleCopy}
                        >
                          {copied ? <Check size={12} /> : <Copy size={12} />}
                          {copied ? "Copied" : "Copy"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips */}
            <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb size={14} className="text-primary" />
                <span className="text-xs font-semibold text-foreground">{selectedPlatform.name} Tips</span>
              </div>
              {selectedPlatform.tips.map((tip, i) => (
                <p key={i} className="text-[11px] text-muted-foreground leading-relaxed flex gap-2">
                  <span className="text-primary font-bold shrink-0">{i + 1}.</span>
                  {tip}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Weekly Content Calendar */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Weekly Content Calendar</h2>
          </div>
          <p className="text-xs text-muted-foreground">Follow this schedule to stay consistent. Click Generate to create that day's content.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
            {weeklyCalendar.map((day) => {
              const platform = platforms.find((p) => p.id === day.platformId);
              if (!platform) return null;
              const Icon = platform.icon;
              return (
                <Card key={day.day} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-foreground">{day.day}</span>
                      <Icon size={14} style={{ color: platform.color }} />
                    </div>
                    <p className="text-[10px] font-medium text-foreground leading-snug">{day.contentType}</p>
                    <p className="text-[9px] text-muted-foreground leading-snug">{day.description}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-full h-6 text-[10px] text-primary hover:bg-primary/10"
                      onClick={() => {
                        selectPlatform(platform);
                        setContentType(day.contentType);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    >
                      Generate <ArrowRight size={10} className="ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Performance Tips */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-foreground">What Works in Real Estate Social Media</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {performanceTips.map((tip) => (
              <Card key={tip.title}>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-foreground mb-1">{tip.title}</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MobileShell>
  );
};

export default SocialMedia;
