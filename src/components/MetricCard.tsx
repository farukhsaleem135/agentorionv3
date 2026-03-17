import { motion } from "framer-motion";
import { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: string;
  positive?: boolean;
  icon: ReactNode;
}

const MetricCard = ({ label, value, change, positive, icon }: MetricCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-subtle border border-border-subtle p-4 group hover:border-border-strong hover:-translate-y-0.5"
      style={{ borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', transition: 'all var(--transition-base)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-text-tertiary text-[11px] font-medium uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-orion-blue/10 flex items-center justify-center text-orion-blue">
          {icon}
        </div>
      </div>
      <div className="font-mono text-[32px] font-bold text-text-primary tracking-tight">{value}</div>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          {positive !== undefined && (
            positive
              ? <ArrowUpRight size={12} className="text-signal-green" />
              : <ArrowDownRight size={12} className="text-alert-red" />
          )}
          <span className={`text-[11px] font-medium ${positive ? "text-signal-green" : positive === false ? "text-alert-red" : "text-text-tertiary"}`}>
            {change}
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default MetricCard;
