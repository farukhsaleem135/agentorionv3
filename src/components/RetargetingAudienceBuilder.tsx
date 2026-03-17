import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Target, Plus, Users, Trash2, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AudienceSegment {
  id: string;
  name: string;
  rules: SegmentRule[];
  estimatedSize: number;
}

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

const RULE_FIELDS = [
  { value: "temperature", label: "Lead Temperature" },
  { value: "funnel_type", label: "Funnel Type" },
  { value: "intent", label: "Intent" },
  { value: "timeline", label: "Timeline" },
  { value: "financing_status", label: "Financing Status" },
  { value: "urgency_score", label: "Urgency Score" },
];

const OPERATORS: Record<string, { value: string; label: string }[]> = {
  temperature: [
    { value: "is", label: "Is" },
    { value: "is_not", label: "Is not" },
  ],
  funnel_type: [
    { value: "is", label: "Is" },
    { value: "is_not", label: "Is not" },
  ],
  intent: [
    { value: "is", label: "Is" },
    { value: "contains", label: "Contains" },
  ],
  timeline: [
    { value: "is", label: "Is" },
    { value: "is_not", label: "Is not" },
  ],
  financing_status: [
    { value: "is", label: "Is" },
    { value: "is_not", label: "Is not" },
  ],
  urgency_score: [
    { value: "gte", label: "≥" },
    { value: "lte", label: "≤" },
    { value: "eq", label: "=" },
  ],
};

const VALUE_OPTIONS: Record<string, string[]> = {
  temperature: ["hot", "warm", "cold"],
  funnel_type: ["buyer", "seller"],
  intent: ["buy", "sell", "invest", "rent"],
  timeline: ["immediate", "1-3 months", "3-6 months", "6+ months"],
  financing_status: ["pre-approved", "exploring", "cash", "unknown"],
};

const RetargetingAudienceBuilder = () => {
  const { user } = useAuth();
  const [segments, setSegments] = useState<AudienceSegment[]>([]);
  const [creating, setCreating] = useState(false);
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState<SegmentRule[]>([{ field: "temperature", operator: "is", value: "hot" }]);
  const [totalLeads, setTotalLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchLeadCount = async () => {
      const { count } = await supabase.from("funnel_leads").select("id", { count: "exact", head: true });
      setTotalLeads(count || 0);
      setLoading(false);
    };
    fetchLeadCount();
  }, [user]);

  const addRule = () => {
    setRules((prev) => [...prev, { field: "temperature", operator: "is", value: "hot" }]);
  };

  const removeRule = (idx: number) => {
    setRules((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateRule = (idx: number, key: keyof SegmentRule, val: string) => {
    setRules((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;
        const updated = { ...r, [key]: val };
        if (key === "field") {
          updated.operator = OPERATORS[val]?.[0]?.value || "is";
          updated.value = VALUE_OPTIONS[val]?.[0] || "";
        }
        return updated;
      })
    );
  };

  const estimateSize = () => {
    // Rough estimate based on rules count and total leads
    const factor = Math.max(0.1, 1 - rules.length * 0.25);
    return Math.max(0, Math.round(totalLeads * factor));
  };

  const saveSegment = () => {
    if (!segmentName.trim() || rules.length === 0) return;
    const segment: AudienceSegment = {
      id: `seg-${Date.now()}`,
      name: segmentName.trim(),
      rules: [...rules],
      estimatedSize: estimateSize(),
    };
    setSegments((prev) => [...prev, segment]);
    setSegmentName("");
    setRules([{ field: "temperature", operator: "is", value: "hot" }]);
    setCreating(false);
    toast.success("Audience segment created");
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    toast.info("Segment removed");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Retargeting Audiences</h3>
        </div>
        {!creating && (
          <button
            onClick={() => setCreating(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-cta text-primary-foreground text-xs font-semibold active:scale-95 transition-transform"
          >
            <Plus size={12} />
            New Segment
          </button>
        )}
      </div>

      {/* Existing segments */}
      {segments.map((seg) => (
        <motion.div
          key={seg.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-foreground">{seg.name}</span>
            <button
              onClick={() => deleteSegment(seg.id)}
              className="p-1 rounded-lg hover:bg-destructive/10 transition-colors"
            >
              <Trash2 size={12} className="text-destructive" />
            </button>
          </div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1.5">
              <Users size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">~{seg.estimatedSize} leads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Filter size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{seg.rules.length} rule{seg.rules.length !== 1 ? "s" : ""}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {seg.rules.map((r, i) => (
              <span key={i} className="text-[10px] bg-secondary text-muted-foreground rounded-md px-2 py-1">
                {r.field} {r.operator} {r.value}
              </span>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Create segment form */}
      {creating && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl p-4 border border-border shadow-card space-y-3"
        >
          <input
            type="text"
            value={segmentName}
            onChange={(e) => setSegmentName(e.target.value)}
            placeholder="Segment name (e.g. Hot Buyers)"
            className="w-full bg-secondary text-foreground text-sm rounded-lg px-3 py-2.5 border border-border focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />

          {rules.map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <select
                value={rule.field}
                onChange={(e) => updateRule(idx, "field", e.target.value)}
                className="flex-1 bg-secondary text-foreground text-xs rounded-lg px-2 py-2 border border-border"
              >
                {RULE_FIELDS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
              <select
                value={rule.operator}
                onChange={(e) => updateRule(idx, "operator", e.target.value)}
                className="w-16 bg-secondary text-foreground text-xs rounded-lg px-2 py-2 border border-border"
              >
                {(OPERATORS[rule.field] || []).map((op) => (
                  <option key={op.value} value={op.value}>{op.label}</option>
                ))}
              </select>
              {VALUE_OPTIONS[rule.field] ? (
                <select
                  value={rule.value}
                  onChange={(e) => updateRule(idx, "value", e.target.value)}
                  className="flex-1 bg-secondary text-foreground text-xs rounded-lg px-2 py-2 border border-border"
                >
                  {VALUE_OPTIONS[rule.field].map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={rule.value}
                  onChange={(e) => updateRule(idx, "value", e.target.value)}
                  className="flex-1 bg-secondary text-foreground text-xs rounded-lg px-2 py-2 border border-border"
                />
              )}
              {rules.length > 1 && (
                <button onClick={() => removeRule(idx)} className="p-1 shrink-0">
                  <Trash2 size={12} className="text-destructive" />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={addRule}
            className="text-xs text-primary font-medium flex items-center gap-1"
          >
            <Plus size={12} /> Add rule
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Est. audience: ~{estimateSize()} leads</span>
            <div className="flex gap-2">
              <button
                onClick={() => setCreating(false)}
                className="px-3 py-2 rounded-lg bg-secondary text-foreground text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={saveSegment}
                disabled={!segmentName.trim()}
                className="px-3 py-2 rounded-lg bg-gradient-cta text-primary-foreground text-xs font-semibold disabled:opacity-40 active:scale-95 transition-transform"
              >
                Create Segment
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {segments.length === 0 && !creating && (
        <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card text-center">
          <Target size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Create custom audience segments to retarget leads based on funnel behavior, temperature, and intent.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default RetargetingAudienceBuilder;
