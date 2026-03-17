import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Copy, Check, MessageSquare, Mail, Phone, Clock, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface NurtureTemplate {
  id: string;
  label: string;
  channel: "sms" | "email" | "call";
  icon: typeof MessageSquare;
  timing: string;
  body: string;
}

const TEMPLATES: NurtureTemplate[] = [
  {
    id: "hot-sms-1",
    label: "Hot Lead — Instant SMS",
    channel: "sms",
    icon: MessageSquare,
    timing: "Send within 5 min",
    body: `Hi {name}, thanks for your interest! I'd love to help you find the right fit. When's a good time to chat this week?`,
  },
  {
    id: "warm-email-1",
    label: "Warm Lead — Value Email",
    channel: "email",
    icon: Mail,
    timing: "Send within 24 hours",
    body: `Subject: Your personalized market update is ready\n\nHi {name},\n\nThanks for connecting with me. Based on what you shared, here are a few things worth knowing about the current market in your area:\n\n• Median prices have shifted {x}% this quarter\n• Inventory is {low/moderate/high} — meaning {insight}\n• The best time to {buy/sell} given your timeline is {recommendation}\n\nI'd love to walk you through your options in more detail. Would a quick 10-minute call work for you this week?\n\nBest,\n{agent_name}`,
  },
  {
    id: "cold-sms-nurture",
    label: "Cold Lead — Re-engagement",
    channel: "sms",
    icon: MessageSquare,
    timing: "Send after 7 days",
    body: `Hi {name}, just checking in! The market's been moving — want me to send you a quick update on homes in your price range?`,
  },
  {
    id: "hot-call-script",
    label: "Hot Lead — Call Script",
    channel: "call",
    icon: Phone,
    timing: "Call within 30 min",
    body: `Opening: "Hi {name}, this is {agent_name}. You recently looked into {funnel_topic} — I wanted to reach out personally."\n\nQualify: "Can you tell me a bit more about your timeline and what's most important to you?"\n\nValue: "Based on what I'm seeing in the market right now, I think there's a real opportunity for you. Here's why..."\n\nClose: "Would you be open to a quick walkthrough of some options I've put together? I have availability {day/time}."`,
  },
  {
    id: "follow-up-email-2",
    label: "Follow-up — No Response",
    channel: "email",
    icon: Mail,
    timing: "Send after 3 days",
    body: `Subject: Quick follow-up\n\nHi {name},\n\nI wanted to make sure my last message didn't get buried. I've been keeping an eye on properties that match what you're looking for, and a few new ones just came on the market.\n\nWould it be helpful if I sent over a curated list? No pressure at all — just want to make sure you have the best options.\n\nBest,\n{agent_name}`,
  },
  {
    id: "post-showing-sms",
    label: "Post-Showing Follow-up",
    channel: "sms",
    icon: MessageSquare,
    timing: "Send within 2 hours",
    body: `Hi {name}, great meeting you today! What did you think of the property? Happy to answer any questions or schedule another showing.`,
  },
];

const channelColors = {
  sms: "bg-info/15 text-info",
  email: "bg-primary/15 text-primary",
  call: "bg-success/15 text-success",
};

interface NurtureTemplatesProps {
  leadName?: string;
  onClose: () => void;
  open: boolean;
}

const NurtureTemplates = ({ leadName, onClose, open }: NurtureTemplatesProps) => {
  const [selected, setSelected] = useState<NurtureTemplate | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [customScript, setCustomScript] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const personalize = (body: string) => {
    return body
      .replace(/\{name\}/g, leadName || "there")
      .replace(/\{agent_name\}/g, "your agent");
  };

  const handleCopy = async (template: NurtureTemplate) => {
    const text = personalize(template.body);
    await navigator.clipboard.writeText(text);
    setCopied(template.id);
    toast({ title: "Copied to clipboard!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const handleAIGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const resp = await supabase.functions.invoke("generate-content", {
        body: {
          type: "follow-up-script",
          context: `Generate a personalized follow-up message for a real estate lead named ${leadName || "the prospect"}. Make it warm, professional, and action-oriented. Keep it under 100 words.`,
        },
      });
      if (resp.data?.body) {
        setCustomScript(resp.data.body);
      } else {
        toast({ title: "Generation failed", variant: "destructive" });
      }
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleCopyCustom = async () => {
    if (!customScript) return;
    await navigator.clipboard.writeText(customScript);
    toast({ title: "Copied to clipboard!" });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/90 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 flex flex-col bg-background"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border shrink-0">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Follow-up Templates</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {leadName ? `For ${leadName}` : "Choose a template to personalize"}
                </p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform">
                <X size={18} className="text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {/* AI Generate button */}
              <button
                onClick={handleAIGenerate}
                disabled={generating}
                className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                  {generating ? <Loader2 size={16} className="animate-spin text-primary" /> : <Sparkles size={16} className="text-primary" />}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-foreground">AI Custom Script</p>
                  <p className="text-[11px] text-muted-foreground">Generate a personalized message with AI</p>
                </div>
              </button>

              {/* Custom AI script result */}
              {customScript && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-card rounded-xl p-4 border border-primary/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-primary">AI Generated</span>
                    <button onClick={handleCopyCustom} className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform">
                      <Copy size={12} className="text-foreground" />
                    </button>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{customScript}</p>
                </motion.div>
              )}

              {/* Template list */}
              {TEMPLATES.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-card rounded-xl border border-border overflow-hidden"
                >
                  <button
                    onClick={() => setSelected(selected?.id === t.id ? null : t)}
                    className="w-full flex items-center gap-3 p-4 active:bg-secondary/50 transition-colors"
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${channelColors[t.channel]}`}>
                      <t.icon size={16} />
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{t.label}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className="text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">{t.timing}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(t); }}
                      className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform shrink-0"
                    >
                      {copied === t.id ? <Check size={14} className="text-success" /> : <Copy size={14} className="text-foreground" />}
                    </button>
                  </button>

                  <AnimatePresence>
                    {selected?.id === t.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-border pt-3">
                          <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-line">
                            {personalize(t.body)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NurtureTemplates;
