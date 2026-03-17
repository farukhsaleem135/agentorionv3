import MobileShell from "@/components/MobileShell";
import { motion, AnimatePresence } from "framer-motion";
import { Video, FileText, Mic, ImageIcon, Plus, Eye, Heart, X, Trash2, Loader2, Sparkles, Copy, Check, ExternalLink, Megaphone, PenTool, Youtube, BookOpen } from "lucide-react";
import AdCopyGenerator from "@/components/AdCopyGenerator";
import ContentIntakeModal, { type IntakeParams } from "@/components/ContentIntakeModal";
import ConversionCopywriter from "@/components/ConversionCopywriter";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  status: string;
  views: number;
  likes: number;
  duration: string | null;
  created_at: string;
}

const templates = [
  { id: "listing-hook", icon: Video, label: "Listing Hook", desc: "15s property teaser" },
  { id: "buyer-tips", icon: Mic, label: "Buyer Tips", desc: "Education clip" },
  { id: "market-update", icon: FileText, label: "Market Update", desc: "Stats & insights" },
  { id: "just-sold", icon: ImageIcon, label: "Just Sold", desc: "Social proof post" },
  { id: "youtube-script", icon: Youtube, label: "YouTube Script", desc: "Long-form video script" },
  { id: "blog-post", icon: BookOpen, label: "Blog Post", desc: "SEO-optimized article" },
];

interface BrandingInfo {
  company_name: string | null;
  phone: string | null;
  website: string | null;
}

const Content = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [viewItem, setViewItem] = useState<ContentItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAdCopy, setShowAdCopy] = useState(false);
  const [showCopywriter, setShowCopywriter] = useState(false);
  
  const [branding, setBranding] = useState<BrandingInfo | null>(null);
  const [intakeTemplate, setIntakeTemplate] = useState<typeof templates[0] | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchContent = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("content")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setItems(data as unknown as ContentItem[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchContent();
    if (user) {
      supabase.from("profiles").select("company_name, phone, website").eq("user_id", user.id).maybeSingle()
        .then(({ data }) => { if (data) setBranding(data as BrandingInfo); });
    }
  }, [fetchContent, user]);

  const openIntake = (template: typeof templates[0]) => {
    setIntakeTemplate(template);
    setShowCreate(false);
  };

  const handleGenerateWithIntake = async (params: IntakeParams) => {
    if (!user || !intakeTemplate) return;
    const templateId = intakeTemplate.id;
    setGenerating(templateId);
    setIntakeTemplate(null);

    try {
      const brandCtx = branding?.company_name
        ? `Agent business: "${branding.company_name}"${branding.phone ? `, phone: ${branding.phone}` : ""}${branding.website ? `, website: ${branding.website}` : ""}. Incorporate the brand name naturally.`
        : "";

      const audienceCtx = [
        params.audience ? `Target audience: ${params.audience}.` : "",
        params.area ? `Market area: ${params.area}.` : "",
        params.tone ? `Tone: ${params.tone}.` : "",
        params.propertyType ? `Property type: ${params.propertyType}.` : "",
        params.priceRange ? `Price range: ${params.priceRange}.` : "",
        brandCtx,
      ].filter(Boolean).join(" ");

      const resp = await supabase.functions.invoke("generate-content", {
        body: { type: templateId, context: audienceCtx || undefined },
      });

      if (resp.error) throw new Error(resp.error.message);
      const result = resp.data;
      if (result?.error) throw new Error(result.error);

      const contentType = templateId.includes("hook") || templateId.includes("tips") || templateId === "youtube-script"
        ? "video"
        : templateId === "blog-post" ? "article" : "script";

      const { error: dbError } = await supabase.from("content").insert({
        user_id: user.id,
        type: contentType,
        title: result.title,
        body: result.body,
        duration: result.duration || null,
        status: "draft",
      } as any);

      if (dbError) throw new Error(dbError.message);

      toast({ title: "Content created!", description: `"${result.title}" is ready to review.` });
      await fetchContent();
    } catch (e: any) {
      toast({ title: "Generation failed", description: e.message, variant: "destructive" });
    } finally {
      setGenerating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this content?")) return;
    const { error } = await supabase.from("content").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content deleted" });
      setViewItem(null);
      await fetchContent();
    }
  };

  const handlePublishToggle = async (item: ContentItem) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    const { error } = await supabase.from("content").update({ status: newStatus }).eq("id", item.id);
    if (error) {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    } else {
      toast({ title: newStatus === "published" ? "Content published" : "Moved to draft" });
      await fetchContent();
      if (viewItem?.id === item.id) setViewItem({ ...item, status: newStatus });
    }
  };

  const handleCopyContent = async (item: ContentItem) => {
    const text = `${item.title}\n\n${item.body || ""}`;
    await navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const portfolioUrl = user ? `${window.location.origin}/portfolio/${user.id}` : "";

  const handleCopyPortfolioLink = async () => {
    await navigator.clipboard.writeText(portfolioUrl);
    toast({ title: "Portfolio link copied!" });
  };

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h1 className="font-display text-xl font-bold text-text-primary">Content</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyPortfolioLink}
              className="p-2.5 rounded-[var(--radius-md)] bg-bg-elevated border border-border-subtle touch-target active:scale-95"
              style={{ transition: "all var(--transition-base)" }}
              title="Copy portfolio link"
            >
              <ExternalLink size={18} className="text-text-secondary" />
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-orion-blue text-white text-sm font-display font-bold touch-target active:scale-95 hover:bg-orion-blue-hover hover:-translate-y-px"
              style={{ boxShadow: "var(--shadow-brand)", transition: "all var(--transition-base)" }}
            >
              <Plus size={16} /> Generate
            </button>
          </div>
        </div>

        {/* Templates */}
        <div className="mb-6">
          <h3 className="font-display text-sm font-semibold text-foreground mb-3 px-1">AI Templates</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {templates.map((t) => (
              <button
                key={t.id}
                disabled={generating !== null}
                onClick={() => openIntake(t)}
                className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border touch-target active:scale-[0.97] transition-transform disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  {generating === t.id ? (
                    <Loader2 size={16} className="animate-spin text-primary" />
                  ) : (
                    <t.icon size={16} className="text-primary" />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-foreground">{t.label}</p>
                  <p className="text-[11px] text-muted-foreground">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {/* Ad Copy Generator button */}
          <button
            onClick={() => setShowAdCopy(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 active:scale-[0.97] transition-transform"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Megaphone size={16} className="text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">AI Ad Copy Generator</p>
              <p className="text-[11px] text-muted-foreground">Facebook, Google & Instagram ads</p>
            </div>
            <Sparkles size={14} className="text-primary" />
          </button>
          {/* Conversion Copywriter button */}
          <button
            onClick={() => setShowCopywriter(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-info/10 border border-info/20 active:scale-[0.97] transition-transform mt-3"
          >
            <div className="w-9 h-9 rounded-lg bg-info/15 flex items-center justify-center">
              <PenTool size={16} className="text-info" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">Conversion Copywriter</p>
              <p className="text-[11px] text-muted-foreground">SMS, Email, Call & Social scripts with A/B variants</p>
            </div>
            <Sparkles size={14} className="text-info" />
          </button>
        </div>

        {/* Generating indicator */}
        {generating && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-4"
          >
            <Sparkles size={16} className="text-primary animate-pulse" />
            <p className="text-sm text-foreground">AI is writing your content...</p>
          </motion.div>
        )}

        {/* Content List */}
        <h3 className="font-display text-sm font-semibold text-foreground mb-3 px-1">
          Your Content ({items.length})
        </h3>
      </div>

      <div className="px-5 space-y-3 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-1">No content yet</p>
            <p className="text-xs text-text-tertiary mb-4">AI writes social posts, video scripts, ad copy, and email templates tailored to your brand.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-orion-blue text-white text-sm font-display font-bold active:scale-95 hover:bg-orion-blue-hover"
              style={{ boxShadow: "var(--shadow-brand)", transition: "all var(--transition-base)" }}
            >
              Generate Your First Content
            </button>
          </div>
        ) : (
          items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setViewItem(item)}
              className="bg-gradient-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4 cursor-pointer active:scale-[0.98] transition-transform"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                {item.type === "video" ? <Video size={18} className="text-primary" /> : <FileText size={18} className="text-info" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  {item.duration && <span className="text-[11px] text-muted-foreground">{item.duration}</span>}
                  <span className={`text-[11px] font-medium ${item.status === "published" ? "text-success" : "text-muted-foreground"}`}>
                    {item.status === "published" ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform shrink-0"
              >
                <Trash2 size={14} className="text-destructive" />
              </button>
            </motion.div>
          ))
        )}
      </div>

      {/* View Content Modal */}
      <AnimatePresence>
        {viewItem && (
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
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground capitalize">{viewItem.type}</p>
                  <h2 className="font-display text-lg font-bold text-foreground truncate">{viewItem.title}</h2>
                </div>
                <button
                  onClick={() => setViewItem(null)}
                  className="p-2.5 rounded-xl bg-secondary touch-target active:scale-95 transition-transform shrink-0 ml-3"
                >
                  <X size={18} className="text-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-auto px-5 pb-8">
                {viewItem.body && (
                  <div className="bg-card border border-border rounded-xl p-5 mb-4">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{viewItem.body}</p>
                  </div>
                )}

                <div className="flex gap-3 mb-3">
                  <button
                    onClick={() => handleCopyContent(viewItem)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                  >
                    {copiedId === viewItem.id ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                  <button
                    onClick={() => handlePublishToggle(viewItem)}
                    className={`flex-1 py-3 rounded-xl text-sm font-semibold active:scale-[0.97] transition-transform ${
                      viewItem.status === "published"
                        ? "bg-secondary text-foreground"
                        : "bg-gradient-cta text-primary-foreground shadow-glow"
                    }`}
                  >
                    {viewItem.status === "published" ? "Unpublish" : "Publish"}
                  </button>
                </div>

                {/* Copy & Open in video platforms */}
                <div className="flex gap-3 mb-3">
                  <a
                    href="https://www.heygen.com/create/avatar-video"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyContent(viewItem)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent border border-border text-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                  >
                    <ExternalLink size={14} /> HeyGen
                  </a>
                  <a
                    href="https://www.veed.io/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => handleCopyContent(viewItem)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-accent border border-border text-foreground text-sm font-semibold active:scale-[0.97] transition-transform"
                  >
                    <ExternalLink size={14} /> Veed.io
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(viewItem.id)}
                  className="w-full py-3 rounded-xl border border-destructive/20 text-destructive text-sm font-medium active:scale-[0.97] transition-transform"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Content Sheet */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-background/80 backdrop-blur-sm"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-base font-bold text-foreground">Create Content</h3>
                <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                  <X size={16} className="text-foreground" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mb-4">Choose a template — AI will generate your content instantly.</p>
              <div className="grid grid-cols-2 gap-3">
                {templates.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => openIntake(t)}
                    className="flex items-center gap-3 p-4 rounded-xl bg-secondary border border-border touch-target active:scale-[0.97] transition-transform"
                  >
                    <div className="w-9 h-9 rounded-lg bg-card flex items-center justify-center">
                      <t.icon size={16} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-foreground">{t.label}</p>
                      <p className="text-[10px] text-muted-foreground">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AdCopyGenerator open={showAdCopy} onClose={() => setShowAdCopy(false)} branding={branding} />
      <ConversionCopywriter open={showCopywriter} onClose={() => setShowCopywriter(false)} />
      <ContentIntakeModal
        open={!!intakeTemplate}
        onClose={() => setIntakeTemplate(null)}
        templateLabel={intakeTemplate?.label || ""}
        onGenerate={handleGenerateWithIntake}
        generating={generating !== null}
      />
    </MobileShell>
  );
};

export default Content;
