import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Phone, MessageSquare, Mail, Tag, Plus, X, Send,
  Zap, Clock, DollarSign, Calendar, User, Brain, TrendingUp,
  CheckCircle2, Loader2, Trash2, Home
} from "lucide-react";
import MobileShell from "@/components/MobileShell";
import CloseLeadModal from "@/components/CloseLeadModal";
import NurtureTemplates from "@/components/NurtureTemplates";
import AutonomousEngagement from "@/components/AutonomousEngagement";
import LeadIntelligencePanel from "@/components/LeadIntelligencePanel";
import TourScheduler from "@/components/TourScheduler";
import VoiceAgent from "@/components/VoiceAgent";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LeadNote {
  id: string;
  content: string;
  note_type: string;
  created_at: string;
}

interface LeadTag {
  id: string;
  tag: string;
}

interface LeadData {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  budget: string | null;
  timeline: string | null;
  temperature: string | null;
  urgency_score: number | null;
  ai_score: number | null;
  ai_score_reasons: any;
  ai_next_step: string | null;
  status: string | null;
  intent: string | null;
  financing_status: string | null;
  created_at: string;
  closed_at: string | null;
  close_date: string | null;
  actual_revenue: number | null;
  estimated_revenue: number | null;
  revenue_status: string | null;
  deal_side: string | null;
  behavior_timeline: any;
  funnel_id: string;
  funnels: { name: string; type: string } | null;
}

const statusColors: Record<string, string> = {
  hot: "bg-hot/15 text-hot",
  warm: "bg-warm/15 text-warm",
  cold: "bg-cold/15 text-cold",
};

const scoreColor = (score: number) => {
  if (score >= 70) return "text-success";
  if (score >= 40) return "text-warm";
  return "text-cold";
};

const PRESET_TAGS = ["First-time buyer", "Investor", "Relocating", "Pre-approved", "Urgent", "Referral", "Open house", "Follow-up needed"];

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [lead, setLead] = useState<LeadData | null>(null);
  const [notes, setNotes] = useState<LeadNote[]>([]);
  const [tags, setTags] = useState<LeadTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [showTagPicker, setShowTagPicker] = useState(false);
  const [customTag, setCustomTag] = useState("");
  const [closingLead, setClosingLead] = useState(false);
  const [showNurture, setShowNurture] = useState(false);
  const [showTourScheduler, setShowTourScheduler] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!id) return;
    const [leadRes, notesRes, tagsRes] = await Promise.all([
      supabase.from("funnel_leads").select("*, funnels(name, type)").eq("id", id).single(),
      supabase.from("lead_notes").select("*").eq("lead_id", id).order("created_at", { ascending: false }),
      supabase.from("lead_tags").select("*").eq("lead_id", id),
    ]);
    if (leadRes.data) setLead(leadRes.data as any);
    if (notesRes.data) setNotes(notesRes.data as any);
    if (tagsRes.data) setTags(tagsRes.data as any);
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addNote = async () => {
    if (!newNote.trim() || !id || !user) return;
    const { error } = await supabase.from("lead_notes").insert({
      lead_id: id,
      user_id: user.id,
      content: newNote.trim(),
      note_type: "manual",
    });
    if (!error) {
      setNewNote("");
      fetchAll();
    } else {
      toast({ title: "Failed to add note", variant: "destructive" });
    }
  };

  const deleteNote = async (noteId: string) => {
    await supabase.from("lead_notes").delete().eq("id", noteId);
    fetchAll();
  };

  const addTag = async (tagName: string) => {
    if (!id || !user) return;
    const { error } = await supabase.from("lead_tags").insert({
      lead_id: id,
      user_id: user.id,
      tag: tagName.trim(),
    });
    if (!error) {
      setCustomTag("");
      setShowTagPicker(false);
      fetchAll();
    }
  };

  const removeTag = async (tagId: string) => {
    await supabase.from("lead_tags").delete().eq("id", tagId);
    fetchAll();
  };

  // Compute AI score locally based on lead data
  const computeScore = (l: LeadData): { score: number; reasons: string[] } => {
    let score = 10;
    const reasons: string[] = [];
    if (l.temperature === "hot") { score += 30; reasons.push("Hot temperature"); }
    else if (l.temperature === "warm") { score += 15; reasons.push("Warm temperature"); }
    if (l.budget) { score += 15; reasons.push("Budget provided"); }
    if (l.timeline) { score += 10; reasons.push("Timeline provided"); }
    if (l.phone && l.phone !== "Skipped") { score += 10; reasons.push("Phone available"); }
    if (l.email) { score += 5; reasons.push("Email available"); }
    if (l.intent) { score += 10; reasons.push(`Intent: ${l.intent}`); }
    if (l.financing_status === "pre-approved") { score += 15; reasons.push("Pre-approved financing"); }
    if ((l.urgency_score || 0) > 60) { score += 5; reasons.push("High urgency"); }
    return { score: Math.min(score, 100), reasons };
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-muted-foreground" size={24} />
        </div>
      </MobileShell>
    );
  }

  if (!lead) {
    return (
      <MobileShell>
        <div className="p-5 text-center">
          <p className="text-muted-foreground">Lead not found</p>
          <button onClick={() => navigate("/leads")} className="mt-4 text-primary text-sm">Back to Leads</button>
        </div>
      </MobileShell>
    );
  }

  const { score, reasons } = computeScore(lead);
  const temp = lead.temperature || "cold";
  const createdDate = new Date(lead.created_at);
  const existingTagNames = tags.map(t => t.tag);
  const availableTags = PRESET_TAGS.filter(t => !existingTagNames.includes(t));

  // Build timeline events from behavior_timeline + notes
  const timelineEvents: { time: string; label: string; type: string }[] = [];

  // Add creation event
  timelineEvents.push({
    time: createdDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    label: `Lead captured via ${lead.funnels?.name || "Direct"}`,
    type: "capture",
  });

  // Add behavior timeline entries
  if (Array.isArray(lead.behavior_timeline)) {
    (lead.behavior_timeline as any[]).forEach((entry: any) => {
      if (entry.timestamp && entry.action) {
        timelineEvents.push({
          time: new Date(entry.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          label: entry.action,
          type: "behavior",
        });
      }
    });
  }

  // Add notes to timeline
  notes.forEach(n => {
    timelineEvents.push({
      time: new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      label: n.content.length > 60 ? n.content.slice(0, 60) + "…" : n.content,
      type: "note",
    });
  });

  if (lead.closed_at) {
    timelineEvents.push({
      time: new Date(lead.closed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      label: `Deal closed — ${lead.deal_side === "sell" ? "Seller" : "Buyer"} side`,
      type: "close",
    });
  }

  return (
    <MobileShell>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => navigate("/leads")} className="p-2 rounded-xl bg-secondary active:scale-95 transition-transform">
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-lg font-bold text-foreground truncate">{lead.name || lead.email || "Unknown"}</h1>
            <p className="text-xs text-muted-foreground">{lead.funnels?.name || "Direct"} · {lead.funnels?.type || "buyer"}</p>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${statusColors[temp] || statusColors.cold}`}>
            {temp.charAt(0).toUpperCase() + temp.slice(1)}
          </span>
          {(lead as any).seller_prediction_score != null && (lead as any).seller_prediction_score >= 40 && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
              (lead as any).seller_prediction_score >= 70 ? "bg-hot/15 text-hot" : "bg-warning/15 text-warning"
            }`}>
              <Home size={10} /> Seller
            </span>
          )}
        </div>

        {/* AI Score Card */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-primary" />
              <span className="text-xs font-semibold text-foreground">AI Lead Score</span>
            </div>
            <span className={`font-display text-2xl font-bold ${scoreColor(score)}`}>{score}</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {reasons.map((r, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{r}</span>
            ))}
          </div>
          {lead.ai_next_step && (
            <div className="flex items-start gap-2 bg-secondary/50 rounded-lg p-2.5">
              <TrendingUp size={12} className="text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-foreground">{lead.ai_next_step}</p>
            </div>
          )}
        </div>

        {/* Voice Agent */}
        <div className="mb-4">
          <VoiceAgent
            leadId={lead.id}
            leadName={lead.name || "Unknown"}
            temperature={lead.temperature}
          />
        </div>

        {/* Autonomous Engagement */}
        <div className="mb-4">
          <AutonomousEngagement
            leadId={lead.id}
            leadName={lead.name || "Unknown"}
            temperature={lead.temperature}
          />
        </div>

        {/* AI Intelligence Panel */}
        <div className="mb-4">
          <LeadIntelligencePanel lead={{
            name: lead.name,
            temperature: lead.temperature,
            budget: lead.budget,
            timeline: lead.timeline,
            intent: lead.intent,
            financing_status: lead.financing_status,
            urgency_score: lead.urgency_score,
            phone: lead.phone,
            email: lead.email,
            status: lead.status,
            created_at: lead.created_at,
            source: lead.funnels?.name || "Direct",
          }} onSellerScoreUpdate={async (score, reasons) => {
            await supabase.from("funnel_leads").update({
              seller_prediction_score: score,
              prediction_reasons: reasons,
            }).eq("id", lead.id);
            fetchAll();
          }} />
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          {lead.phone && lead.phone !== "Skipped" && (
            <>
              <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium touch-target active:scale-95 transition-transform">
                <Phone size={14} /> Call
              </a>
              <a href={`sms:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium touch-target active:scale-95 transition-transform">
                <MessageSquare size={14} /> Text
              </a>
            </>
          )}
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium touch-target active:scale-95 transition-transform">
              <Mail size={14} /> Email
            </a>
          )}
          <button
            onClick={() => setShowTourScheduler(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-medium touch-target active:scale-95 transition-transform"
          >
            <Calendar size={14} /> Tour
          </button>
          {lead.status !== "closed" && (
            <button onClick={() => setClosingLead(true)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-success/10 text-success text-xs font-medium touch-target active:scale-95 transition-transform">
              <CheckCircle2 size={14} /> Close
            </button>
          )}
          <button onClick={() => setShowNurture(true)} className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-info/10 text-info text-xs font-medium touch-target active:scale-95 transition-transform">
            <Send size={14} /> Nurture
          </button>
        </div>

        {/* Contact Details */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <User size={14} className="text-muted-foreground" /> Contact Details
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {lead.email && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</span>
                <p className="text-sm text-foreground truncate">{lead.email}</p>
              </div>
            )}
            {lead.phone && lead.phone !== "Skipped" && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</span>
                <p className="text-sm text-foreground">{lead.phone}</p>
              </div>
            )}
            {lead.budget && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</span>
                <p className="text-sm text-foreground">{lead.budget}</p>
              </div>
            )}
            {lead.timeline && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Timeline</span>
                <p className="text-sm text-foreground">{lead.timeline}</p>
              </div>
            )}
            {lead.intent && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Intent</span>
                <p className="text-sm text-foreground capitalize">{lead.intent}</p>
              </div>
            )}
            {lead.financing_status && (
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Financing</span>
                <p className="text-sm text-foreground capitalize">{lead.financing_status}</p>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Tag size={14} className="text-muted-foreground" /> Tags
            </h3>
            <button onClick={() => setShowTagPicker(!showTagPicker)} className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform">
              <Plus size={14} className="text-foreground" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t.id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                {t.tag}
                <button onClick={() => removeTag(t.id)} className="hover:text-destructive">
                  <X size={10} />
                </button>
              </span>
            ))}
            {tags.length === 0 && !showTagPicker && (
              <span className="text-xs text-muted-foreground">No tags yet</span>
            )}
          </div>
          <AnimatePresence>
            {showTagPicker && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
                  {availableTags.map((t) => (
                    <button key={t} onClick={() => addTag(t)} className="px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[11px] font-medium active:scale-95 transition-transform">
                      + {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <input
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Custom tag..."
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    onKeyDown={(e) => e.key === "Enter" && customTag.trim() && addTag(customTag)}
                  />
                  <button onClick={() => customTag.trim() && addTag(customTag)} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">Add</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notes */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-3">Notes</h3>
          <div className="flex gap-2 mb-3">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note..."
              className="flex-1 px-3 py-2.5 rounded-xl bg-secondary text-foreground text-xs border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              onKeyDown={(e) => e.key === "Enter" && addNote()}
            />
            <button onClick={addNote} className="p-2.5 rounded-xl bg-primary text-primary-foreground active:scale-95 transition-transform">
              <Send size={14} />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notes.map((n) => (
              <div key={n.id} className="flex items-start justify-between gap-2 bg-secondary/50 rounded-lg p-2.5">
                <div>
                  <p className="text-xs text-foreground">{n.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
                <button onClick={() => deleteNote(n.id)} className="p-1 text-muted-foreground hover:text-destructive shrink-0">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {notes.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">No notes yet</p>}
          </div>
        </div>

        {/* Contact Timeline */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-4">
          <h3 className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
            <Clock size={14} className="text-muted-foreground" /> Activity Timeline
          </h3>
          <div className="space-y-0">
            {timelineEvents.map((evt, i) => (
              <div key={i} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    evt.type === "capture" ? "bg-primary" :
                    evt.type === "close" ? "bg-success" :
                    evt.type === "note" ? "bg-info" : "bg-muted-foreground"
                  }`} />
                  {i < timelineEvents.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className="pb-3 min-w-0">
                  <p className="text-xs text-foreground">{evt.label}</p>
                  <p className="text-[10px] text-muted-foreground">{evt.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {closingLead && (
        <CloseLeadModal
          lead={{ id: lead.id, name: lead.name || "Unknown" }}
          avgSalePrice={350000}
          commissionRate={3}
          open={closingLead}
          onClose={() => setClosingLead(false)}
          onSaved={fetchAll}
        />
      )}

      <NurtureTemplates
        leadName={lead.name || undefined}
        open={showNurture}
        onClose={() => setShowNurture(false)}
      />

      <TourScheduler
        leadId={lead.id}
        leadName={lead.name || "Unknown"}
        open={showTourScheduler}
        onClose={() => setShowTourScheduler(false)}
      />
    </MobileShell>
  );
};

export default LeadDetail;
