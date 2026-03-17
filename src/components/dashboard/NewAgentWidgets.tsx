import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, Zap, Share2, Users, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface NewAgentWidgetsProps {
  currentDay: number;
  leadsCaptured: number;
  completedDays?: number;
}

const DISMISS_KEY = "launch_widget_dismissed";

const NewAgentWidgets = ({ currentDay, leadsCaptured, completedDays = 0 }: NewAgentWidgetsProps) => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === "true");
  const progress = Math.round((completedDays / 30) * 100);
  const allComplete = completedDays >= 30;

  const quickCards = [
    { label: "Start Launch Program", icon: Rocket, path: "/launch-program", desc: "Day-by-day guide" },
    { label: "Create Your First Funnel", icon: Zap, path: "/funnels", desc: "AI-generated in minutes" },
    { label: "Generate Social Content", icon: Share2, path: "/social-media", desc: "Build your brand" },
  ];

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, "true");
  };

  return (
    <div className="space-y-4">
      {/* 30 Day Launch Progress — persistent but dismissible */}
      {!dismissed && !allComplete && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-orion-blue/30 bg-orion-blue/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-orion-blue/20 flex items-center justify-center">
                  <Rocket size={18} className="text-orion-blue" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary">30 Day Launch Program</p>
                  <p className="text-xs text-text-tertiary">Day {currentDay} of 30 — {progress}% complete ({completedDays} tasks done)</p>
                </div>
                <button onClick={handleDismiss} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                  <X size={14} />
                </button>
              </div>
              <Progress value={progress} className="h-2 mb-3" />
              <Button
                className="w-full bg-orion-blue hover:bg-orion-blue/90 text-white"
                onClick={() => navigate("/launch-program")}
              >
                Continue Your Launch Program <ArrowRight size={16} className="ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Leads captured stat */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-success-green/10 flex items-center justify-center">
              <Users size={18} className="text-success-green" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{leadsCaptured}</p>
              <p className="text-xs text-text-tertiary">leads captured since joining</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick action cards */}
      <div className="space-y-2">
        <h3 className="font-display text-sm font-semibold text-text-primary px-1">Get Started</h3>
        {quickCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.label}
              onClick={() => navigate(card.path)}
              className="w-full flex items-center gap-3 p-3.5 rounded-[var(--radius-lg)] border border-border-subtle bg-bg-surface hover:border-border-strong active:scale-[0.98] text-left"
              style={{ transition: "all var(--transition-base)" }}
            >
              <div className="w-9 h-9 rounded-lg bg-orion-blue/10 flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-orion-blue" />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-text-primary block">{card.label}</span>
                <span className="text-[10px] text-text-tertiary">{card.desc}</span>
              </div>
              <ArrowRight size={14} className="text-text-muted" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NewAgentWidgets;
