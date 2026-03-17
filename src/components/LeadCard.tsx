import { motion } from "framer-motion";
import { Phone, MessageSquare, Trash2, Mail as MailIcon, CheckCircle2, Brain, ChevronRight, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface Lead {
  id: string;
  name: string;
  status: "hot" | "warm" | "cold";
  source: string;
  lastActivity: string;
  budget?: string;
  timeline?: string;
  email?: string;
  phone?: string;
  aiScore?: number;
  tags?: string[];
  sellerPredictionScore?: number | null;
}

const statusConfig = {
  hot: { label: "Hot", className: "bg-hot/15 text-hot" },
  warm: { label: "Warm", className: "bg-warm/15 text-warm" },
  cold: { label: "Cold", className: "bg-cold/15 text-cold" },
};

const scoreColor = (s: number) => s >= 70 ? "text-success" : s >= 40 ? "text-warm" : "text-cold";

interface LeadCardProps {
  lead: Lead;
  onDelete?: (id: string) => void;
  onCloseDeal?: (lead: Lead) => void;
}

const LeadCard = ({ lead, onDelete, onCloseDeal }: LeadCardProps) => {
  const config = statusConfig[lead.status];
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-card rounded-xl p-4 border border-border shadow-card cursor-pointer active:scale-[0.99] transition-transform"
      onClick={() => navigate(`/leads/${lead.id}`)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-display font-semibold text-foreground truncate">{lead.name}</h4>
            {lead.aiScore !== undefined && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${scoreColor(lead.aiScore)}`}>
                <Brain size={10} /> {lead.aiScore}
              </span>
            )}
            {lead.sellerPredictionScore != null && lead.sellerPredictionScore >= 40 && (
              <span className={`flex items-center gap-0.5 text-[11px] font-bold ${
                lead.sellerPredictionScore >= 70 ? "text-hot" : "text-warning"
              }`}>
                <Home size={10} /> Likely Seller
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{lead.source} · {lead.lastActivity}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${config.className}`}>
            {config.label}
          </span>
          <ChevronRight size={14} className="text-muted-foreground" />
        </div>
      </div>

      {/* Tags row */}
      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.slice(0, 3).map((t) => (
            <span key={t} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{t}</span>
          ))}
          {lead.tags.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground text-[10px]">+{lead.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Contact info */}
      {(lead.email || lead.phone) && (
        <div className="flex flex-col gap-1 mb-3">
          {lead.email && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
              <MailIcon size={12} className="shrink-0" />
              <span className="truncate">{lead.email}</span>
            </span>
          )}
          {lead.phone && lead.phone !== "Skipped" && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Phone size={12} className="shrink-0" />
              {lead.phone}
            </span>
          )}
        </div>
      )}

      {(lead.budget || lead.timeline) && (
        <div className="flex gap-4 mb-3">
          {lead.budget && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Budget</span>
              <p className="text-sm font-medium text-foreground">{lead.budget}</p>
            </div>
          )}
          {lead.timeline && (
            <div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Timeline</span>
              <p className="text-sm font-medium text-foreground">{lead.timeline}</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border" onClick={(e) => e.stopPropagation()}>
        {lead.phone && lead.phone !== "Skipped" ? (
          <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium touch-target active:scale-95 transition-transform">
            <Phone size={14} /> Call
          </a>
        ) : (
          <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium opacity-50 cursor-not-allowed">
            <Phone size={14} /> Call
          </button>
        )}
        {lead.phone && lead.phone !== "Skipped" ? (
          <a href={`sms:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium touch-target active:scale-95 transition-transform">
            <MessageSquare size={14} /> Text
          </a>
        ) : (
          <button disabled className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-secondary text-muted-foreground text-xs font-medium opacity-50 cursor-not-allowed">
            <MessageSquare size={14} /> Text
          </button>
        )}
        {onCloseDeal && (
          <button
            onClick={() => onCloseDeal(lead)}
            className="p-2 rounded-lg bg-success/10 text-success touch-target active:scale-95 transition-transform"
            title="Close Deal"
          >
            <CheckCircle2 size={16} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(lead.id)}
            className="p-2 rounded-lg bg-secondary text-destructive touch-target active:scale-95 transition-transform"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LeadCard;
