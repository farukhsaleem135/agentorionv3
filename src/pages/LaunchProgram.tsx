import MobileShell from "@/components/MobileShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Rocket, CheckCircle, Circle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const weeks = [
  { week: 1, title: "Foundation", tasks: ["Complete your profile", "Set your brand color", "Create your first buyer funnel", "Generate your professional bio", "Set up your market area"] },
  { week: 2, title: "Momentum", tasks: ["Launch a seller funnel", "Generate your first blog post", "Share your first social media content", "Review your first leads", "Set up automated follow-up"] },
  { week: 3, title: "Pipeline", tasks: ["Create an FSBO funnel", "Generate a market report", "Respond to all warm leads", "Share content on 3 platforms", "Review funnel analytics"] },
  { week: 4, title: "Closing", tasks: ["Optimize your top funnel", "Follow up with all hot leads", "Generate weekly content batch", "Review your pipeline health", "Plan your next month strategy"] },
];

const LaunchProgram = () => {
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);

  useEffect(() => {
    if (user?.created_at) {
      const days = Math.floor((Date.now() - new Date(user.created_at).getTime()) / 86400000) + 1;
      setCurrentDay(Math.min(days, 30));
    }
  }, [user]);

  const currentWeek = Math.min(Math.ceil(currentDay / 7), 4);
  const progress = Math.round((currentDay / 30) * 100);

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orion-blue/10 flex items-center justify-center">
            <Rocket size={20} className="text-orion-blue" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">30 Day Launch Program</h1>
            <p className="text-xs text-text-tertiary">Day {currentDay} of 30 — {progress}% complete</p>
          </div>
        </div>
        <Progress value={progress} className="h-2 mt-3" />
      </div>

      <div className="px-5 space-y-4 pb-8">
        {weeks.map((w) => (
          <Card key={w.week} className={w.week === currentWeek ? "border-orion-blue/40" : ""}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${w.week <= currentWeek ? "bg-orion-blue/10 text-orion-blue" : "bg-bg-elevated text-text-muted"}`}>
                  Week {w.week}
                </span>
                {w.title}
                {w.week < currentWeek && <CheckCircle size={16} className="text-success-green ml-auto" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {w.tasks.map((task, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Circle size={14} className="text-text-muted flex-shrink-0" />
                    {task}
                  </li>
                ))}
              </ul>
              {w.week === currentWeek && (
                <Button className="w-full mt-4 bg-orion-blue hover:bg-orion-blue/90 text-white">
                  Continue Week {w.week} <ArrowRight size={16} className="ml-2" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </MobileShell>
  );
};

export default LaunchProgram;
