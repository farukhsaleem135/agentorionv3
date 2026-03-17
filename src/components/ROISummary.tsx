import { motion } from "framer-motion";
import { DollarSign, Users, CalendarCheck, TrendingUp } from "lucide-react";

interface ROISummaryProps {
  totalSpend: string;
  leadsGenerated: number;
  appointmentsBooked: number;
  pipelineValue: string;
}

const ROISummary = ({ totalSpend, leadsGenerated, appointmentsBooked, pipelineValue }: ROISummaryProps) => {
  const items = [
    { icon: DollarSign, label: "Total Spend", value: totalSpend, color: "text-pulse-gold" },
    { icon: Users, label: "Leads Generated", value: String(leadsGenerated), color: "text-orion-blue" },
    { icon: CalendarCheck, label: "Appointments", value: String(appointmentsBooked), color: "text-signal-green" },
    { icon: TrendingUp, label: "Pipeline Value", value: pipelineValue, color: "text-orion-blue" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="border border-border-subtle overflow-hidden"
      style={{ background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="px-5 pt-5 pb-3">
        <h3 className="font-display text-sm font-semibold text-text-primary">Your Growth Summary</h3>
        <p className="text-[11px] text-text-tertiary mt-0.5">This month's performance at a glance</p>
      </div>
      <div className="grid grid-cols-2 gap-px bg-border-subtle">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06 }}
            className="bg-bg-surface p-4 flex flex-col gap-1.5"
          >
            <div className="flex items-center gap-1.5">
              <item.icon size={12} className={item.color} />
              <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">{item.label}</span>
            </div>
            <span className="font-mono text-xl font-bold text-text-primary">{item.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ROISummary;
