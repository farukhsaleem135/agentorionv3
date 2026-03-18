import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Megaphone, Facebook, Search, Linkedin, Video, Copy, Check, ExternalLink, Zap, DollarSign, Users, TrendingUp, Eye, Loader2, Lightbulb } from "lucide-react";
import MobileShell from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PromoteFunnelModal from "@/components/PromoteFunnelModal";

const PUBLISHED_APP_ORIGIN = "https://agentorionv3.lovable.app";

interface DbFunnel {
  id: string;
  name: string;
  type: string;
  status: string;
  slug: string;
  views: number;
  leads_count: number;
}

const platformGuides = [
  {
    name: "Facebook & Instagram",
    icon: Facebook,
    steps: [
      "Click Launch Facebook Ads Manager above",
      "Select Housing as your special ad category",
      "Paste your AgentOrion funnel link as the destination URL and set your budget",
    ],
  },
  {
    name: "Google",
    icon: Search,
    steps: [
      "Click Launch Google Ads above",
      "Create a Search campaign targeting real estate keywords in your market",
      "Paste your AgentOrion funnel link as the final URL",
    ],
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    steps: [
      "Click Launch LinkedIn Campaign Manager above",
      "Create a Lead Gen campaign targeting professionals in your area",
      "Paste your AgentOrion funnel link as the destination URL",
    ],
  },
];

const adTips = [
  {
    title: "Start Small",
    body: "Begin with a $5–$10 per day budget to test which platform performs best in your market before scaling.",
    icon: DollarSign,
  },
  {
    title: "Match Your Audience to Your Funnel",
    body: "A buyer funnel performs best targeting renters aged 25–45. A seller funnel performs best targeting homeowners aged 35–65.",
    icon: Users,
  },
  {
    title: "Use Your Funnel Hero Image as Your Ad Creative",
    body: "Your funnel hero image is already optimized for visual impact — download it and use it as your ad image for consistent branding.",
    icon: Eye,
  },
  {
    title: "Track Your Results",
    body: "AgentOrion adds UTM tracking to every promoted link automatically. Check your Insights page to see which platform drives the most leads.",
    icon: TrendingUp,
  },
];

const PostingAds = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [funnels, setFunnels] = useState<DbFunnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteFunnel, setPromoteFunnel] = useState<DbFunnel | null>(null);

  const fetchFunnels = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("funnels")
      .select("id, name, type, status, slug, views, leads_count")
      .eq("user_id", user.id)
      .eq("status", "live")
      .order("created_at", { ascending: false });
    if (data) setFunnels(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchFunnels(); }, [fetchFunnels]);

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <Megaphone size={18} className="text-primary" />
          <div>
            <p className="text-xs text-muted-foreground">Advertising</p>
            <h1 className="font-display text-xl font-bold text-foreground">Promote Your Funnels</h1>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Launch targeted ad campaigns that drive leads directly into your AgentOrion pipeline.
        </p>
      </div>

      <div className="px-5 space-y-6 pb-28">
        {/* Section 1 — Active Funnels */}
        <section>
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 px-1">Your Active Funnels</h2>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          ) : funnels.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-6 text-center">
              <Zap size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No active funnels yet. Create a funnel first to start promoting.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {funnels.map((funnel, i) => (
                <motion.div
                  key={funnel.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{funnel.name}</h4>
                      <p className="text-[11px] text-muted-foreground capitalize">{funnel.type.replace(/-/g, " ")}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      <span className="flex items-center gap-1"><Eye size={12} />{funnel.views}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{funnel.leads_count}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-1.5 border-primary text-primary hover:bg-primary/5"
                    onClick={() => setPromoteFunnel(funnel)}
                  >
                    <Megaphone size={14} />
                    Promote
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2 — Platform Guides */}
        <section>
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 px-1">Platform Guides</h2>
          <div className="space-y-3">
            {platformGuides.map((guide) => {
              const Icon = guide.icon;
              return (
                <div key={guide.name} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{guide.name}</h4>
                  </div>
                  <ol className="space-y-2">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2.5">
                        <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {j + 1}
                        </span>
                        <span className="text-xs text-muted-foreground leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3 — Ad Performance Tips */}
        <section>
          <h2 className="font-display text-sm font-semibold text-foreground mb-3 px-1">Ad Performance Tips</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {adTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div key={tip.title} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon size={16} className="text-primary" />
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{tip.title}</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{tip.body}</p>
                </div>
              );
            })}
          </div>
        </section>
      </div>

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

export default PostingAds;
