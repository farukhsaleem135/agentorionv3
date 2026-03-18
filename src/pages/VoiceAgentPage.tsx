import { motion } from "framer-motion";
import { Mic, Phone, FileText, Thermometer, Bell, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import MobileShell from "@/components/MobileShell";

const features = [
  { icon: Phone, label: "Automated lead qualification calls" },
  { icon: Mic, label: "Natural AI voice powered by ElevenLabs" },
  { icon: FileText, label: "Full call transcription and summary" },
  { icon: Thermometer, label: "Automatic lead temperature update after each call" },
];

const VoiceAgentPage = () => {
  const { toast } = useToast();

  return (
    <MobileShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 px-1">
          <Mic size={16} className="text-primary" />
          <h3 className="font-display text-sm font-semibold text-foreground">Voice Agent</h3>
          <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-muted text-muted-foreground border-border">
            Coming Soon
          </Badge>
        </div>

        <div className="bg-card rounded-[var(--radius-lg)] border border-border p-8 text-center" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Clock size={22} className="text-muted-foreground" />
          </div>

          <h4 className="font-display text-lg font-semibold text-foreground mb-2">
            Voice Agent — Coming Q4 2026
          </h4>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
            AgentOrion's AI Voice Agent will automatically call and qualify your leads — so you only spend time on prospects who are ready to talk.
          </p>

          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
            Imagine having an AI assistant that makes the first contact call for you. The Voice Agent introduces itself on your behalf, asks qualifying questions, and reports back with a full call summary and updated lead temperature — all while you focus on closing.
          </p>

          <div className="max-w-sm mx-auto text-left mb-8 space-y-3">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/50 border border-border"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <f.icon size={14} className="text-primary" />
                </div>
                <span className="text-sm text-foreground font-medium">{f.label}</span>
              </motion.div>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              toast({
                title: "You're on the list!",
                description: "We will notify you when Voice Agent launches in Q4 2026.",
              })
            }
            className="gap-1.5"
          >
            <Bell size={14} />
            Notify Me
          </Button>
        </div>
      </motion.div>
    </MobileShell>
  );
};

export default VoiceAgentPage;
