import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, AlertTriangle, HelpCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface RevenueEntry {
  estimated_revenue: number | null;
  actual_revenue: number | null;
  revenue_status: string | null;
}

const ROIConfidencePanel = () => {
  const { user } = useAuth();
  const [data, setData] = useState<{ verified: number; estimated: number; modeled: number; total: number }>({
    verified: 0, estimated: 0, modeled: 0, total: 0,
  });

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: leads } = await supabase
        .from("funnel_leads")
        .select("estimated_revenue, actual_revenue, revenue_status");

      if (!leads) return;
      let verified = 0, estimated = 0, modeled = 0;
      (leads as unknown as RevenueEntry[]).forEach((l) => {
        const rev = l.actual_revenue || l.estimated_revenue || 0;
        if (l.revenue_status === "verified") verified += rev;
        else if (l.revenue_status === "estimated") estimated += rev;
        else modeled += rev;
      });
      setData({ verified, estimated, modeled, total: verified + estimated + modeled });
    };
    fetch();
  }, [user]);

  if (data.total === 0) return null;

  const confidencePct = data.total > 0 ? Math.round((data.verified / data.total) * 100) : 0;
  const confidenceLabel = confidencePct >= 70 ? "High" : confidencePct >= 30 ? "Medium" : "Low";
  const confidenceColor = confidencePct >= 70 ? "text-success" : confidencePct >= 30 ? "text-warning" : "text-muted-foreground";
  const ConfidenceIcon = confidencePct >= 70 ? Shield : confidencePct >= 30 ? AlertTriangle : HelpCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-display text-xs font-semibold text-foreground flex items-center gap-1.5">
          <DollarSign size={13} className="text-primary" />
          ROI Confidence
        </h4>
        <div className={`flex items-center gap-1 ${confidenceColor}`}>
          <ConfidenceIcon size={12} />
          <span className="text-[10px] font-semibold">{confidenceLabel} Confidence</span>
        </div>
      </div>

      <p className="font-display text-xl font-bold text-foreground mb-3">
        ${data.total.toLocaleString()}
      </p>

      <div className="w-full h-2 rounded-full bg-secondary overflow-hidden flex mb-2">
        {data.verified > 0 && (
          <div className="h-full bg-success" style={{ width: `${(data.verified / data.total) * 100}%` }} />
        )}
        {data.estimated > 0 && (
          <div className="h-full bg-warning" style={{ width: `${(data.estimated / data.total) * 100}%` }} />
        )}
        {data.modeled > 0 && (
          <div className="h-full bg-muted-foreground/30" style={{ width: `${(data.modeled / data.total) * 100}%` }} />
        )}
      </div>

      <div className="flex items-center gap-4 text-[10px]">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-muted-foreground">Verified ${data.verified.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-warning" />
          <span className="text-muted-foreground">Estimated ${data.estimated.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
          <span className="text-muted-foreground">Modeled ${data.modeled.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ROIConfidencePanel;
