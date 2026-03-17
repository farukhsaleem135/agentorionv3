import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, DollarSign, Calendar, Check, AlertTriangle, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CloseLeadModalProps {
  lead: {
    id: string;
    name: string;
    estimatedRevenue?: number;
  };
  avgSalePrice: number;
  commissionRate: number;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const CloseLeadModal = ({ lead, avgSalePrice, commissionRate, open, onClose, onSaved }: CloseLeadModalProps) => {
  const { toast } = useToast();
  const [closeDate, setCloseDate] = useState(new Date().toISOString().split("T")[0]);
  const [dealSide, setDealSide] = useState<"buy" | "sell">("buy");
  const estimated = Math.round(avgSalePrice * (commissionRate / 100));
  const [actualRevenue, setActualRevenue] = useState("");
  const [useEstimate, setUseEstimate] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const revenue = useEstimate ? estimated : parseFloat(actualRevenue) || 0;
    const status = useEstimate ? "estimated" : "verified";

    const { error } = await supabase
      .from("funnel_leads")
      .update({
        status: "closed",
        close_date: closeDate,
        deal_side: dealSide,
        estimated_revenue: estimated,
        actual_revenue: useEstimate ? null : revenue,
        revenue_status: status,
        closed_at: new Date().toISOString(),
      } as any)
      .eq("id", lead.id);

    setSaving(false);
    if (error) {
      toast({ title: "Failed to close lead", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Lead closed!", description: `Revenue: $${revenue.toLocaleString()} (${status})` });
      onSaved();
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
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
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display text-base font-bold text-foreground">Close Deal: {lead.name}</h3>
              <button onClick={onClose} className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform">
                <X size={16} className="text-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Close Date */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Close Date *</label>
                <div className="relative">
                  <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              {/* Deal Side */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">Deal Side *</label>
                <div className="flex gap-2">
                  {(["buy", "sell"] as const).map((side) => (
                    <button
                      key={side}
                      onClick={() => setDealSide(side)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        dealSide === side
                          ? "bg-primary text-primary-foreground shadow-glow"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {side === "buy" ? "Buyer Side" : "Seller Side"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-secondary/50 rounded-xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-foreground">Estimated Revenue</span>
                </div>
                <p className="font-display text-2xl font-bold text-foreground mb-1">
                  ${estimated.toLocaleString()}
                </p>
                <p className="text-[10px] text-muted-foreground mb-3">
                  Based on ${avgSalePrice.toLocaleString()} avg sale × {commissionRate}% commission
                </p>

                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setUseEstimate(true)}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      useEstimate ? "bg-primary/20 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    <Check size={10} className="inline mr-1" />
                    Confirm estimate
                  </button>
                  <button
                    onClick={() => setUseEstimate(false)}
                    className={`flex-1 py-2 rounded-lg text-[11px] font-medium transition-all ${
                      !useEstimate ? "bg-primary/20 text-primary border border-primary/30" : "bg-card text-muted-foreground border border-border"
                    }`}
                  >
                    Edit actual
                  </button>
                </div>

                {!useEstimate && (
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="number"
                      placeholder="Actual revenue"
                      value={actualRevenue}
                      onChange={(e) => setActualRevenue(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 rounded-xl bg-card text-foreground text-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                )}
              </div>

              {/* Confidence indicator */}
              <div className="flex items-center gap-2 px-1">
                {useEstimate ? (
                  <>
                    <AlertTriangle size={12} className="text-warning" />
                    <span className="text-[10px] text-muted-foreground">
                      Revenue labeled as <span className="font-semibold text-warning">Estimated</span> — confirm actual for higher confidence
                    </span>
                  </>
                ) : (
                  <>
                    <Shield size={12} className="text-success" />
                    <span className="text-[10px] text-muted-foreground">
                      Revenue labeled as <span className="font-semibold text-success">Verified</span> — unlocks tax reports & benchmarking
                    </span>
                  </>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {saving ? "Saving..." : "Close Deal"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CloseLeadModal;
