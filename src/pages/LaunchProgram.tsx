import MobileShell from "@/components/MobileShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import CertifiedBadgeModal from "@/components/CertifiedBadgeModal";
import {
  Rocket, CheckCircle, Circle, ChevronDown, ChevronRight, Clock, ExternalLink, Lock, Award,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useLaunchProgress, AgentType } from "@/hooks/useLaunchProgress";
import { launchTasks, weekStructure, getProgressMessage } from "@/data/launchProgramTasks";

const LaunchProgram = () => {
  const navigate = useNavigate();
  const { progress, agentType, setAgentType, toggleDay, completedCount, loading } = useLaunchProgress();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const percentage = Math.round((completedCount / 30) * 100);

  // Determine current week (first incomplete week)
  const currentWeek = useMemo(() => {
    for (const w of weekStructure) {
      const allComplete = w.days.every((d) => progress.get(d));
      if (!allComplete) return w.week;
    }
    return 4;
  }, [progress]);

  // Auto-expand current week
  const isExpanded = (week: number) => {
    if (expandedWeeks.has(week)) return true;
    if (expandedWeeks.size === 0 && week === currentWeek) return true;
    return false;
  };

  const toggleWeek = (week: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      // If it was auto-expanded (no explicit toggle yet), add all others as collapsed
      if (prev.size === 0) {
        if (week === currentWeek) {
          // Clicking current week collapses it
          next.add(-week); // sentinel
          return next;
        } else {
          next.add(week);
          return next;
        }
      }
      if (next.has(week)) next.delete(week);
      else next.add(week);
      // Remove negative sentinel
      next.delete(-week);
      return next;
    });
  };

  const isWeekLocked = (week: number) => {
    if (week === 1) return false;
    const prevWeek = weekStructure.find((w) => w.week === week - 1);
    if (!prevWeek) return false;
    return !prevWeek.days.every((d) => progress.get(d));
  };

  const isWeekComplete = (week: number) => {
    const w = weekStructure.find((ws) => ws.week === week);
    if (!w) return false;
    return w.days.every((d) => progress.get(d));
  };

  const handleTaskAction = (task: typeof launchTasks[0]) => {
    if (task.day === 30 && completedCount >= 29) {
      setShowBadgeModal(true);
      return;
    }
    if (task.actionLink.startsWith("http")) {
      window.open(task.actionLink, "_blank");
    } else {
      navigate(task.actionLink);
    }
  };

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-orion-blue border-t-transparent rounded-full animate-spin" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-orion-blue/10 flex items-center justify-center">
            <Rocket size={20} className="text-orion-blue" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">Your 30 Day Launch Program</h1>
          </div>
        </div>
        <p className="text-xs text-text-tertiary mt-2 leading-relaxed">
          New agent or experienced pro — follow this guided program to build a consistent lead generation system. Each task takes 15–30 minutes and builds directly on the previous one.
        </p>

        {/* Agent Type Toggle */}
        <div className="flex gap-2 mt-4 p-1 rounded-xl bg-bg-elevated border border-border-subtle">
          {(["new", "experienced"] as AgentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setAgentType(type)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                agentType === type
                  ? "bg-orion-blue text-white shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {type === "new" ? "I'm a New Agent" : "I'm an Experienced Agent"}
            </button>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="mt-5 p-4 rounded-xl bg-bg-surface border border-border-subtle">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-text-primary">
              Day {Math.min(completedCount + 1, 30)} of 30
            </span>
            <span className="text-xs font-bold text-orion-blue">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2.5 mb-2" />
          <p className="text-xs text-text-tertiary italic">{getProgressMessage(completedCount + 1)}</p>
        </div>
      </div>

      {/* Week Sections */}
      <div className="px-5 space-y-3 pb-8">
        {weekStructure.map((week) => {
          const locked = isWeekLocked(week.week);
          const complete = isWeekComplete(week.week);
          const expanded = !locked && isExpanded(week.week);
          const completedInWeek = week.days.filter((d) => progress.get(d)).length;

          return (
            <div key={week.week}>
              <button
                onClick={() => !locked && toggleWeek(week.week)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  locked
                    ? "bg-bg-elevated border-border-subtle opacity-60 cursor-not-allowed"
                    : complete
                      ? "bg-success-green/5 border-success-green/30"
                      : "bg-bg-surface border-border-subtle hover:border-border-strong"
                }`}
              >
                {complete ? (
                  <CheckCircle size={20} className="text-success-green flex-shrink-0" />
                ) : locked ? (
                  <Lock size={18} className="text-text-muted flex-shrink-0" />
                ) : expanded ? (
                  <ChevronDown size={20} className="text-orion-blue flex-shrink-0" />
                ) : (
                  <ChevronRight size={20} className="text-text-muted flex-shrink-0" />
                )}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orion-blue/10 text-orion-blue">
                      Week {week.week}
                    </span>
                    <span className="text-sm font-semibold text-text-primary">{week.title}</span>
                  </div>
                  {locked && (
                    <p className="text-[10px] text-text-muted mt-1">
                      Complete Week {week.week - 1} to unlock
                    </p>
                  )}
                </div>
                <span className="text-xs text-text-tertiary">
                  {completedInWeek}/{week.days.length}
                </span>
              </button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-2 pt-2">
                      {week.days.map((day) => {
                        const task = launchTasks.find((t) => t.day === day);
                        if (!task) return null;
                        const done = progress.get(day) || false;
                        const title = agentType === "experienced" ? task.experiencedTitle : task.title;
                        const desc = agentType === "experienced" ? task.experiencedDescription : task.description;
                        const instr = agentType === "experienced" ? (task.experiencedInstructions || task.instructions) : task.instructions;

                        return (
                          <Card
                            key={day}
                            className={`transition-all ${done ? "opacity-70 border-success-green/20" : ""}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <button
                                  onClick={() => toggleDay(day, !done)}
                                  className="mt-0.5 flex-shrink-0"
                                >
                                  {done ? (
                                    <CheckCircle size={22} className="text-success-green" />
                                  ) : (
                                    <Circle size={22} className="text-text-muted hover:text-orion-blue transition-colors" />
                                  )}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orion-blue/10 text-orion-blue">
                                      Day {day}
                                    </span>
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-elevated text-text-muted flex items-center gap-1">
                                      <Clock size={10} /> {task.timeEstimate}
                                    </span>
                                    {day === 30 && (
                                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1">
                                        <Award size={10} /> Badge
                                      </span>
                                    )}
                                  </div>

                                  <p className={`text-sm font-semibold mb-1 ${done ? "line-through text-text-muted" : "text-text-primary"}`}>
                                    {title}
                                  </p>
                                  <p className="text-xs text-text-tertiary leading-relaxed mb-2">
                                    {desc}
                                  </p>

                                  {instr && (
                                    <div className="text-[11px] text-text-secondary bg-bg-elevated rounded-lg p-2.5 mb-2 leading-relaxed border border-border-subtle">
                                      💡 {instr}
                                    </div>
                                  )}

                                  {!done && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-8 text-xs gap-1.5 mt-1"
                                      onClick={() => handleTaskAction(task)}
                                    >
                                      {task.actionLabel}
                                      <ExternalLink size={12} />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Completion CTA */}
        {completedCount === 30 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-orion-blue/30 bg-orion-blue/5">
              <CardContent className="p-6 text-center">
                <Award size={40} className="text-orion-blue mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold text-text-primary mb-2">
                  🎉 You've Completed the 30 Day Launch Program!
                </h3>
                <p className="text-xs text-text-tertiary mb-4">
                  You're officially an AgentOrion Certified AI Agent.
                </p>
                <Button
                  className="bg-orion-blue hover:bg-orion-blue/90 text-white"
                  onClick={() => setShowBadgeModal(true)}
                >
                  View Your Badge
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>

      <CertifiedBadgeModal open={showBadgeModal} onClose={() => setShowBadgeModal(false)} />
    </MobileShell>
  );
};

export default LaunchProgram;
