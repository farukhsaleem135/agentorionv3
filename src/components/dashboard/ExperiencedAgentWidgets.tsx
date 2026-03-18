import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, FileText, Zap, ArrowRight, Megaphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface ExperiencedAgentWidgetsProps {
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  daysSinceContent: number;
  topFunnelName: string | null;
  topFunnelLeads: number;
}

const ExperiencedAgentWidgets = ({
  hotLeads, warmLeads, coldLeads,
  daysSinceContent, topFunnelName, topFunnelLeads,
}: ExperiencedAgentWidgetsProps) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      {/* Pipeline Health */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm font-semibold text-text-primary mb-3">Pipeline Health</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Hot", count: hotLeads, color: "text-alert-red" },
                { label: "Warm", count: warmLeads, color: "text-amber-500" },
                { label: "Cold", count: coldLeads, color: "text-sky-400" },
              ].map((seg) => (
                <div key={seg.label} className="text-center">
                  <p className={`text-2xl font-bold ${seg.color}`}>{seg.count}</p>
                  <p className="text-[10px] text-text-tertiary flex items-center justify-center gap-1">
                    {seg.label}
                    {seg.count > 0 ? <TrendingUp size={10} className="text-success-green" /> : <TrendingDown size={10} className="text-text-muted" />}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Content Consistency */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className={daysSinceContent > 7 ? "border-amber-500/30" : ""}>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${daysSinceContent > 7 ? "bg-amber-500/10" : "bg-success-green/10"}`}>
                <FileText size={18} className={daysSinceContent > 7 ? "text-amber-500" : "text-success-green"} />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Content Consistency</p>
                <p className="text-xs text-text-tertiary">
                  {daysSinceContent === 0 ? "Generated today" : `${daysSinceContent} days since last content`}
                </p>
              </div>
            </div>
            {daysSinceContent > 7 && (
              <Button size="sm" className="bg-orion-blue hover:bg-orion-blue/90 text-white text-xs" onClick={() => navigate("/content")}>
                Generate Today
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Funnel */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orion-blue/10 flex items-center justify-center">
                <Zap size={18} className="text-orion-blue" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text-primary">Top Funnel This Month</p>
                <p className="text-xs text-text-tertiary">
                  {topFunnelName ? `${topFunnelName} — ${topFunnelLeads} leads` : "No funnels yet"}
                </p>
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate("/funnels")}>
              <ArrowRight size={14} />
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ExperiencedAgentWidgets;
