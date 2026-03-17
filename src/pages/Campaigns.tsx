import MobileShell from "@/components/MobileShell";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AdCopyGenerator from "@/components/AdCopyGenerator";
import {
  Megaphone, Plus, Loader2, Facebook, Search as GoogleIcon, Music,
  Play, Pause, Trash2, DollarSign, Eye, MousePointerClick, Users,
  Sparkles, X, ChevronRight, Pencil
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status: string;
  headline: string | null;
  description: string | null;
  cta: string | null;
  daily_budget: number;
  total_spend: number;
  impressions: number;
  clicks: number;
  leads_generated: number;
  ab_variant: string;
  created_at: string;
}

interface BrandingInfo {
  company_name: string | null;
  phone: string | null;
  website: string | null;
}

interface CampaignFormData {
  name: string;
  platform: "meta" | "google" | "tiktok";
  headline: string;
  description: string;
  cta: string;
  budget: string;
}

const Campaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [branding, setBranding] = useState<BrandingInfo | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adCopyOpen, setAdCopyOpen] = useState(false);

  // Form state
  const [form, setForm] = useState<CampaignFormData>({
    name: "", platform: "meta", headline: "", description: "", cta: "", budget: "10",
  });

  useEffect(() => {
    if (!user) return;
    fetchCampaigns();
    supabase.from("profiles").select("company_name, phone, website").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (data) setBranding(data as BrandingInfo); });
  }, [user]);

  // Handle prefill from AdCopyGenerator navigation state
  useEffect(() => {
    const state = location.state as { prefill?: { name: string; platform: string; headline: string; description: string; cta: string } } | null;
    if (state?.prefill) {
      setForm({
        name: state.prefill.name,
        platform: (state.prefill.platform as "meta" | "google" | "tiktok") || "meta",
        headline: state.prefill.headline,
        description: state.prefill.description,
        cta: state.prefill.cta,
        budget: "10",
      });
      setEditingId(null);
      setSheetOpen(true);
      // Clear navigation state so refresh doesn't re-trigger
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle seller preset from Seller Suite
  useEffect(() => {
    const preset = searchParams.get("preset");
    if (preset === "seller" && !sheetOpen) {
      setForm({ name: "Seller Lead Campaign", platform: "meta", headline: "", description: "", cta: "", budget: "15" });
      setEditingId(null);
      setSheetOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams]);

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from("ad_campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    setCampaigns((data as Campaign[]) || []);
    setLoading(false);
  };

  const saveCampaign = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        // Update existing
        const { error } = await supabase.from("ad_campaigns").update({
          name: form.name.trim(),
          platform: form.platform,
          headline: form.headline || null,
          description: form.description || null,
          cta: form.cta || null,
          daily_budget: parseFloat(form.budget) || 10,
        }).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Campaign updated" });
      } else {
        // Insert new
        const { error } = await supabase.from("ad_campaigns").insert({
          user_id: user.id,
          name: form.name.trim(),
          platform: form.platform,
          headline: form.headline || null,
          description: form.description || null,
          cta: form.cta || null,
          daily_budget: parseFloat(form.budget) || 10,
          status: "draft",
        });
        if (error) throw error;
        toast({ title: "Campaign created" });
      }
      closeSheet();
      fetchCampaigns();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const openEditSheet = (campaign: Campaign) => {
    setForm({
      name: campaign.name,
      platform: campaign.platform as "meta" | "google" | "tiktok",
      headline: campaign.headline || "",
      description: campaign.description || "",
      cta: campaign.cta || "",
      budget: String(campaign.daily_budget || 10),
    });
    setEditingId(campaign.id);
    setSheetOpen(true);
  };

  const openNewSheet = () => {
    setForm({ name: "", platform: "meta", headline: "", description: "", cta: "", budget: "10" });
    setEditingId(null);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingId(null);
    setForm({ name: "", platform: "meta", headline: "", description: "", cta: "", budget: "10" });
  };

  const publishCampaign = async (id: string, plat: string) => {
    try {
      const publishAction = plat === "meta" ? "publish_meta" : plat === "tiktok" ? "publish_tiktok" : "publish_google";
      const { data, error } = await supabase.functions.invoke("publish-ad", {
        body: { campaign_id: id, action: publishAction },
      });
      if (error) throw error;
      if (data?.status === "pending_api_key") {
        toast({ title: "API Keys Needed", description: data.message });
      } else if (data?.success) {
        toast({ title: "Campaign published!" });
      }
      fetchCampaigns();
    } catch (e: any) {
      toast({ title: "Publish failed", description: e.message, variant: "destructive" });
    }
  };

  const toggleCampaign = async (id: string, currentStatus: string) => {
    const action = currentStatus === "active" ? "pause" : "resume";
    await supabase.functions.invoke("publish-ad", { body: { campaign_id: id, action } });
    fetchCampaigns();
  };

  const deleteCampaign = async (id: string) => {
    await supabase.from("ad_campaigns").delete().eq("id", id);
    fetchCampaigns();
    toast({ title: "Campaign deleted" });
  };

  const statusColor: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    active: "bg-success/15 text-success",
    paused: "bg-warm/15 text-warm",
    pending_api_key: "bg-primary/15 text-primary",
  };

  const platformIcon = (p: string) =>
    p === "meta" ? <Facebook size={14} /> : p === "tiktok" ? <Music size={14} /> : <GoogleIcon size={14} />;

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center py-24">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Campaigns</h1>
            <p className="text-xs text-text-tertiary mt-0.5">Meta, Google & TikTok ad management</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setAdCopyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] bg-bg-elevated text-text-primary text-xs font-semibold active:scale-95 border border-border-default hover:border-border-brand"
              style={{ transition: "all var(--transition-base)" }}
            >
              <Sparkles size={14} className="text-orion-blue" /> AI Copy
            </button>
            <button
              onClick={openNewSheet}
              className="flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-md)] bg-orion-blue text-white text-xs font-display font-bold active:scale-95 hover:bg-orion-blue-hover"
              style={{ boxShadow: "var(--shadow-brand)", transition: "all var(--transition-base)" }}
            >
              <Plus size={14} /> New Campaign
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[
            { label: "Active", value: campaigns.filter(c => c.status === "active").length, icon: Play },
            { label: "Spend", value: `$${campaigns.reduce((s, c) => s + (c.total_spend || 0), 0).toFixed(0)}`, icon: DollarSign },
            { label: "Clicks", value: campaigns.reduce((s, c) => s + (c.clicks || 0), 0), icon: MousePointerClick },
            { label: "Leads", value: campaigns.reduce((s, c) => s + (c.leads_generated || 0), 0), icon: Users },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gradient-card rounded-xl p-3 border border-border text-center"
            >
              <stat.icon size={14} className="text-primary mx-auto mb-1" />
              <p className="font-display text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-[9px] text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Campaign list */}
        <div className="space-y-3">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0" onClick={() => openEditSheet(campaign)}>
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
                    {platformIcon(campaign.platform)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-foreground truncate">{campaign.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[campaign.status] || statusColor.draft}`}>
                      {campaign.status.replace("_", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => openEditSheet(campaign)}
                    className="p-1.5 rounded-lg bg-secondary text-foreground active:scale-95 transition-transform"
                  >
                    <Pencil size={12} />
                  </button>
                  {campaign.status === "draft" && (
                    <button
                      onClick={() => publishCampaign(campaign.id, campaign.platform)}
                      className="p-1.5 rounded-lg bg-primary/10 text-primary active:scale-95 transition-transform"
                    >
                      <Play size={12} />
                    </button>
                  )}
                  {(campaign.status === "active" || campaign.status === "paused") && (
                    <button
                      onClick={() => toggleCampaign(campaign.id, campaign.status)}
                      className="p-1.5 rounded-lg bg-secondary text-foreground active:scale-95 transition-transform"
                    >
                      {campaign.status === "active" ? <Pause size={12} /> : <Play size={12} />}
                    </button>
                  )}
                  <button
                    onClick={() => deleteCampaign(campaign.id)}
                    className="p-1.5 rounded-lg bg-destructive/10 text-destructive active:scale-95 transition-transform"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {campaign.headline && (
                <p className="text-xs text-foreground/80 mb-1 line-clamp-1">"{campaign.headline}"</p>
              )}

              <div className="flex items-center gap-4 mt-2 pt-2 border-t border-border">
                <div className="flex items-center gap-1">
                  <Eye size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{campaign.impressions.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MousePointerClick size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{campaign.clicks}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">{campaign.leads_generated}</span>
                </div>
                <div className="flex items-center gap-1 ml-auto">
                  <DollarSign size={10} className="text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">${campaign.daily_budget}/day</span>
                </div>
              </div>
            </motion.div>
          ))}

          {campaigns.length === 0 && (
            <div className="bg-gradient-card rounded-xl p-8 border border-border text-center">
              <Megaphone size={28} className="text-muted-foreground mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-foreground mb-1">No campaigns yet</h3>
              <p className="text-xs text-muted-foreground mb-4">Generate ad copy with AI, then create your first campaign.</p>
              <button
                onClick={() => setAdCopyOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold active:scale-95 transition-transform shadow-glow"
              >
                <Sparkles size={14} /> Generate Ad Copy
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Builder Sheet (create + edit) */}
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
            onClick={closeSheet}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-2xl p-5 pb-10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-10 h-1 bg-muted rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold text-foreground">
                  {editingId ? "Edit Campaign" : "New Campaign"}
                </h3>
                <button onClick={closeSheet} className="p-2 rounded-lg bg-secondary">
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Campaign name"
                  className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                />

                {/* Platform */}
                <div className="flex gap-2">
                  {(["meta", "google", "tiktok"] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setForm(f => ({ ...f, platform: p }))}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 rounded-xl text-xs font-medium transition-all ${
                        form.platform === p
                          ? "bg-primary/10 border border-primary/30 text-primary"
                          : "bg-secondary border border-border text-muted-foreground"
                      }`}
                    >
                      {p === "meta" ? <Facebook size={14} /> : p === "tiktok" ? <Music size={14} /> : <GoogleIcon size={14} />}
                      {p === "meta" ? "Meta" : p === "tiktok" ? "TikTok" : "Google"}
                    </button>
                  ))}
                </div>

                {/* Copy fields */}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Headline</label>
                  <input
                    type="text"
                    value={form.headline}
                    onChange={(e) => setForm(f => ({ ...f, headline: e.target.value }))}
                    placeholder="Headline"
                    className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    rows={3}
                    className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Call to Action</label>
                  <input
                    type="text"
                    value={form.cta}
                    onChange={(e) => setForm(f => ({ ...f, cta: e.target.value }))}
                    placeholder="Call to Action"
                    className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Daily Budget ($)</label>
                  <input
                    type="number"
                    value={form.budget}
                    onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                    className="w-full bg-secondary text-foreground text-sm rounded-xl px-4 py-3 border border-border focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <button
                  onClick={saveCampaign}
                  disabled={saving || !form.name.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm active:scale-[0.98] transition-transform disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <ChevronRight size={14} />}
                  {editingId ? "Save Changes" : "Create Campaign"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Ad Copy Generator (full intake-driven) */}
      <AdCopyGenerator
        open={adCopyOpen}
        onClose={() => setAdCopyOpen(false)}
        branding={branding}
      />
    </MobileShell>
  );
};

export default Campaigns;
