import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, UserPlus, Thermometer, Send, RefreshCw, Shield, ArrowRight
} from "lucide-react";

const STORAGE_KEY = "autopilot-explainer-collapsed";

const steps = [
  {
    icon: UserPlus,
    label: "Lead Captured",
    desc: "A lead submits your funnel or is added to your pipeline",
  },
  {
    icon: Thermometer,
    label: "Temperature Detected",
    desc: "Hot · Warm · Cold — determines timing",
  },
  {
    icon: Send,
    label: "First Message Sent",
    desc: "AI drafts and sends if confidence exceeds your threshold",
    badges: ["Hot → 5 min", "Warm → 1 hr", "Cold → 3 hr"],
  },
  {
    icon: RefreshCw,
    label: "No Response?",
    desc: "Follow-ups sent automatically",
    badges: ["Hot → every 2 hr", "Warm → every 6 hr", "Cold → every 24 hr"],
  },
  {
    icon: Shield,
    label: "Guardrails Active",
    desc: "Quiet hours respected · Daily limit enforced · Max 3 attempts",
  },
];

const HowAutopilotWorks = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed));
    } catch {}
  }, [collapsed]);

  return (
    <div className="mb-5 rounded-xl border border-primary/20 overflow-hidden" style={{ background: "hsl(var(--card))" }}>
      {/* Collapse trigger */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-primary/5 transition-colors"
        aria-expanded={!collapsed}
        aria-label={collapsed ? "Expand How Autopilot Works" : "Collapse How Autopilot Works"}
      >
        <span className="text-xs font-semibold text-foreground tracking-wide">How it works</span>
        <ChevronDown
          size={16}
          className={`text-muted-foreground transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Desktop: horizontal flow */}
              <div className="hidden md:flex items-start gap-1">
                {steps.map((step, i) => (
                  <div key={step.label} className="flex items-start">
                    <StepCard step={step} />
                    {i < steps.length - 1 && (
                      <div className="flex items-center pt-8 px-1">
                        <ArrowRight size={14} className="text-primary/50 shrink-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile: vertical flow */}
              <div className="flex flex-col gap-2 md:hidden">
                {steps.map((step) => (
                  <StepCard key={step.label} step={step} />
                ))}
              </div>

              {/* Helper text */}
              <p className="text-[10px] text-muted-foreground mt-3 text-center md:text-left">
                Autopilot only runs for leads — not your sphere of influence contacts. Your SOI queue is managed separately.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface StepProps {
  step: {
    icon: React.ElementType;
    label: string;
    desc: string;
    badges?: string[];
  };
}

const StepCard = ({ step }: StepProps) => {
  const Icon = step.icon;
  return (
    <div className="flex-1 min-w-0 bg-secondary/50 rounded-lg p-3 border border-border">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
          <Icon size={14} className="text-primary" />
        </div>
        <h4 className="text-[11px] font-bold text-foreground leading-tight">{step.label}</h4>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">{step.desc}</p>
      {step.badges && (
        <div className="flex flex-wrap gap-1 mt-2">
          {step.badges.map((b) => (
            <span
              key={b}
              className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary"
            >
              {b}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default HowAutopilotWorks;
