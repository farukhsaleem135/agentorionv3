import MobileShell from "@/components/MobileShell";
import LeadCard, { Lead } from "@/components/LeadCard";
import CloseLeadModal from "@/components/CloseLeadModal";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, Loader2, Plus, X, User, Mail, Phone, DollarSign, Clock, Zap } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { formatPhoneDisplay, stripPhone, toE164 } from "@/lib/phoneFormat";
import { useNavigate } from "react-router-dom";

type Filter = "all" | "hot" | "warm" | "cold";

const computeAIScore = (d: any): number => {
  let s = 10;
  if (d.temperature === "hot") s += 30;
  else if (d.temperature === "warm") s += 15;
  if (d.budget) s += 15;
  if (d.timeline) s += 10;
  if (d.phone && d.phone !== "Skipped") s += 10;
  if (d.email) s += 5;
  if (d.intent) s += 10;
  if (d.financing_status === "pre-approved") s += 15;
  if ((d.urgency_score || 0) > 60) s += 5;
  return Math.min(s, 100);
};

const Leads = () => {
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const [closingLead, setClosingLead] = useState<Lead | null>(null);

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newBudget, setNewBudget] = useState("");
  const [newTimeline, setNewTimeline] = useState("");
  const [newTemp, setNewTemp] = useState<"hot" | "warm" | "cold">("warm");

  const fetchLeads = useCallback(async () => {
    const { data, error } = await supabase
      .from("funnel_leads")
      .select("id, name, email, phone, budget, timeline, temperature, urgency_score, intent, financing_status, created_at, funnel_id, seller_prediction_score, funnels(name, type)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      const leadIds = data.map((d: any) => d.id);
      const { data: tagsData } = await supabase
        .from("lead_tags").select("lead_id, tag")
        .in("lead_id", leadIds.length > 0 ? leadIds : ["__none__"]);

      const tagMap: Record<string, string[]> = {};
      (tagsData || []).forEach((t: any) => {
        if (!tagMap[t.lead_id]) tagMap[t.lead_id] = [];
        tagMap[t.lead_id].push(t.tag);
      });

      const mapped: Lead[] = data.map((d: any) => {
        const temp = (d.temperature === "hot" || d.temperature === "warm" || d.temperature === "cold") ? d.temperature : "cold";
        const createdAt = new Date(d.created_at);
        const now = new Date();
        const diffMin = Math.floor((now.getTime() - createdAt.getTime()) / 60000);
        let lastActivity: string;
        if (diffMin < 1) lastActivity = "Just now";
        else if (diffMin < 60) lastActivity = `${diffMin} min ago`;
        else if (diffMin < 1440) lastActivity = `${Math.floor(diffMin / 60)} hours ago`;
        else lastActivity = `${Math.floor(diffMin / 1440)} days ago`;

        return {
          id: d.id, name: d.name || d.email || "Unknown", status: temp as "hot" | "warm" | "cold",
          source: d.funnels?.name || d.funnels?.type || "Direct", lastActivity,
          budget: d.budget || undefined, timeline: d.timeline || undefined,
          email: d.email || undefined, phone: d.phone || undefined,
          aiScore: computeAIScore(d), tags: tagMap[d.id] || [],
          sellerPredictionScore: d.seller_prediction_score ?? null,
        };
      });
      setLeads(mapped);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this lead?")) return;
    const { error } = await supabase.from("funnel_leads").delete().eq("id", id);
    if (error) {
      toast({ title: "Failed to delete", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lead deleted" });
      await fetchLeads();
    }
  };

  const resetForm = () => {
    setNewName(""); setNewEmail(""); setNewPhone(""); setNewBudget(""); setNewTimeline(""); setNewTemp("warm");
  };

  const handleAddLead = async () => {
    if (!newName.trim() && !newEmail.trim()) {
      toast({ title: "Name or email required", variant: "destructive" });
      return;
    }
    let funnelId: string | null = null;
    const { data: funnels } = await supabase.from("funnels").select("id").limit(1);
    if (funnels && funnels.length > 0) {
      funnelId = funnels[0].id;
    } else {
      const { data: newFunnel, error: fErr } = await supabase.from("funnels").insert({
        name: "Direct Leads", slug: `direct-${Date.now()}`, type: "buyer", status: "live", user_id: user?.id,
      }).select("id").single();
      if (fErr || !newFunnel) {
        toast({ title: "Failed to create lead", description: fErr?.message || "Could not create funnel", variant: "destructive" });
        return;
      }
      funnelId = newFunnel.id;
    }
    const urgency = newTemp === "hot" ? 90 : newTemp === "warm" ? 60 : 20;
    const e164Phone = newPhone.trim() ? toE164(newPhone) : null;
    const { data: captureResult, error } = await supabase.rpc('capture_lead', {
      p_funnel_id: funnelId,
      p_lead_data: {
        name: newName.trim() || null, email: newEmail.trim() || null,
        phone: e164Phone, budget: newBudget.trim() || null, timeline: newTimeline.trim() || null,
        temperature: newTemp, urgency_score: urgency,
      },
    }) as { data: any; error: any };
    if (error) {
      toast({ title: "Failed to add lead", description: error.message, variant: "destructive" });
    } else if (captureResult && !captureResult.success) {
      if (captureResult.error === 'lead_limit_reached') {
        toast({ title: "Lead limit reached", description: "Upgrade your plan to capture more leads this month.", variant: "destructive" });
      } else {
        toast({ title: "Failed to add lead", description: captureResult.message || "Unknown error", variant: "destructive" });
      }
    } else {
      toast({ title: "Lead added!" });
      resetForm(); setShowForm(false); await fetchLeads();
    }
  };

  const searchFiltered = leads.filter((l) => {
    const matchesFilter = filter === "all" || l.status === filter;
    const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.source.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: leads.length },
    { key: "hot", label: "Hot", count: leads.filter((l) => l.status === "hot").length },
    { key: "warm", label: "Warm", count: leads.filter((l) => l.status === "warm").length },
    { key: "cold", label: "Cold", count: leads.filter((l) => l.status === "cold").length },
  ];

  const tempOptions: { value: "hot" | "warm" | "cold"; label: string }[] = [
    { value: "hot", label: "Hot" }, { value: "warm", label: "Warm" }, { value: "cold", label: "Cold" },
  ];

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-bold text-text-primary">Leads</h1>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => {}}>
              Import
            </Button>
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus size={16} /> Add Lead
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
        </div>

        <div className="flex gap-2 mb-5">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold touch-target ${
                filter === f.key ? "bg-orion-blue text-white" : "bg-bg-elevated text-text-secondary border border-border-subtle"
              }`}
              style={{ transition: "all var(--transition-base)" }}>
              {f.label} ({f.count})
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 size={20} className="animate-spin text-text-muted" /></div>
        ) : searchFiltered.length === 0 ? (
          <div className="text-center py-12">
            <Zap size={32} className="text-text-muted mx-auto mb-3" />
            <p className="text-sm text-text-secondary mb-1">No leads found</p>
            <p className="text-xs text-text-tertiary mb-4">Create your first funnel to start capturing leads</p>
            <Button variant="ghost" size="sm" onClick={() => navigate("/funnels")}>
              Go to Funnels →
            </Button>
          </div>
        ) : (
          searchFiltered.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onDelete={handleDelete} onCloseDeal={(l) => setClosingLead(l)} />
          ))
        )}
      </div>

      {/* Add Lead Sheet */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70]" style={{ background: "rgba(7,11,20,0.8)", backdropFilter: "blur(4px)" }}
            onClick={() => { setShowForm(false); resetForm(); }}>
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 bg-bg-elevated border-t border-border-subtle rounded-t-2xl p-5 pb-10"
              onClick={(e) => e.stopPropagation()}>
              <div className="w-10 h-1 bg-border-default rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display text-base font-bold text-text-primary">Add Lead</h3>
                <button onClick={() => { setShowForm(false); resetForm(); }} className="p-2 rounded-lg bg-bg-surface active:scale-95" style={{ transition: "all var(--transition-base)" }}>
                  <X size={16} className="text-text-primary" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="text" placeholder="Name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
                </div>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="email" placeholder="Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
                </div>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input type="tel" placeholder="Phone (optional)" value={newPhone} onChange={(e) => {
                    const digits = stripPhone(e.target.value);
                    if (digits.length <= 11) setNewPhone(formatPhoneDisplay(digits));
                  }} className="w-full pl-9 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder="Budget" value={newBudget} onChange={(e) => setNewBudget(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
                  </div>
                  <div className="relative">
                    <Clock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input type="text" placeholder="Timeline" value={newTimeline} onChange={(e) => setNewTimeline(e.target.value)} className="w-full pl-9 pr-4 py-3 rounded-[var(--radius-md)] bg-bg-subtle text-text-primary text-sm placeholder:text-text-muted border border-border-subtle focus:outline-none focus:ring-2 focus:ring-orion-blue/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-text-tertiary mb-2 block">Temperature</label>
                  <div className="flex gap-2">
                    {tempOptions.map((opt) => (
                      <button key={opt.value} onClick={() => setNewTemp(opt.value)}
                        className={`flex-1 py-2 rounded-[var(--radius-md)] text-xs font-semibold ${
                          newTemp === opt.value ? "bg-orion-blue text-white" : "bg-bg-elevated text-text-secondary border border-border-subtle"
                        }`}
                        style={{ transition: "all var(--transition-base)" }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddLead}>
                  Add Lead
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {closingLead && (
        <CloseLeadModal
          lead={{ id: closingLead.id, name: closingLead.name }}
          avgSalePrice={350000} commissionRate={3}
          open={!!closingLead} onClose={() => setClosingLead(null)} onSaved={() => fetchLeads()}
        />
      )}
    </MobileShell>
  );
};

export default Leads;
