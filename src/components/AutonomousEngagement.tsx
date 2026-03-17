import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, MessageSquare, Phone, Mail, Send, Loader2, Brain,
  RefreshCw, Shield, Clock, ChevronDown, ChevronUp, Copy, Check
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AutonomousEngagementProps {
  leadId: string;
  leadName: string;
  temperature: string | null;
}

type ActionType = "draft_initial_outreach" | "draft_follow_up" | "draft_reactivation" | "generate_call_script" | "analyze_and_recommend" | "verify_lead";
type Channel = "sms" | "email" | "call";

interface OutreachResult {
  body?: string;
  subject?: string;
  tone?: string;
  follow_up_delay_hours?: number;
  best_time_to_send?: string;
  hook_type?: string;
  opening?: string;
  qualifying_questions?: string[];
  objection_handlers?: Array<{ objection: string; response: string }>;
  closing_cta?: string;
  best_time_to_call?: string;
  conversion_probability?: number;
  recommended_action?: string;
  optimal_channel?: string;
  timing?: string;
  red_flags?: string[];
  opportunities?: string[];
  engagement_score?: number;
  quality_score?: number;
  is_verified?: boolean;
  verification_notes?: string;
  fraud_flags?: string[];
  contact_quality?: string;
  intent_confidence?: string;
}

const AutonomousEngagement = ({ leadId, leadName, temperature }: AutonomousEngagementProps) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<OutreachResult | null>(null);
  const [resultAction, setResultAction] = useState<ActionType | null>(null);
  const [copied, setCopied] = useState(false);
  const [channel, setChannel] = useState<Channel>("sms");

  const executeAction = async (action: ActionType) => {
    setLoading(action);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("autonomous-outreach", {
        body: { action, lead_id: leadId, channel },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.result);
      setResultAction(action);
    } catch (e: any) {
      toast({ title: "AI Error", description: e.message || "Failed to generate", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveToQueue = async () => {
    if (!result?.body) return;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if the required delivery channel is connected
      const requiredProvider = channel === "sms" ? "twilio" : channel === "email" ? "resend" : null;
      if (requiredProvider) {
        const { data: conn } = await supabase
          .from("integration_connections")
          .select("status")
          .eq("user_id", user.id)
          .eq("provider", requiredProvider)
          .eq("status", "connected")
          .maybeSingle();

        if (!conn) {
          const providerName = requiredProvider === "twilio" ? "Twilio (SMS)" : "Resend (Email)";
          toast({
            title: "Delivery Channel Not Connected",
            description: `Connect ${providerName} in Integrations before queuing ${channel.toUpperCase()} messages.`,
            variant: "destructive",
          });
          return;
        }
      }

      await supabase.from("outreach_queue").insert({
        lead_id: leadId,
        user_id: user.id,
        channel,
        body: result.body,
        subject: result.subject || null,
        trigger_reason: resultAction === "draft_initial_outreach" ? "new_lead" : resultAction === "draft_reactivation" ? "reactivation" : "follow_up",
        status: "pending",
      });
      toast({ title: "Added to outreach queue" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const logConversation = async (content: string) => {
    await supabase.from("lead_conversations").insert({
      lead_id: leadId,
      channel,
      direction: "outbound",
      role: "assistant",
      content,
      metadata: { action: resultAction, ai_generated: true },
    });
  };

  const actions: Array<{ action: ActionType; icon: typeof Zap; label: string; desc: string }> = [
    { action: "draft_initial_outreach", icon: Send, label: "First Outreach", desc: "AI intro message" },
    { action: "draft_follow_up", icon: RefreshCw, label: "Follow Up", desc: "Smart follow-up" },
    { action: "draft_reactivation", icon: Zap, label: "Reactivate", desc: "Wake cold leads" },
    { action: "generate_call_script", icon: Phone, label: "Call Script", desc: "Booking-focused" },
    { action: "analyze_and_recommend", icon: Brain, label: "AI Analysis", desc: "Strategy" },
    { action: "verify_lead", icon: Shield, label: "Verify Lead", desc: "Quality check" },
  ];

  const channels: Array<{ value: Channel; icon: typeof MessageSquare; label: string }> = [
    { value: "sms", icon: MessageSquare, label: "SMS" },
    { value: "email", icon: Mail, label: "Email" },
    { value: "call", icon: Phone, label: "Call" },
  ];

  return (
    <div className="bg-gradient-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 active:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
            <Zap size={16} className="text-primary" />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold text-foreground">Autonomous Engagement</h3>
            <p className="text-[10px] text-muted-foreground">AI-powered outreach & analysis</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              {/* Channel Selector */}
              <div className="flex gap-1.5 p-1 bg-secondary rounded-lg">
                {channels.map((ch) => (
                  <button
                    key={ch.value}
                    onClick={() => setChannel(ch.value)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all ${
                      channel === ch.value
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground"
                    }`}
                  >
                    <ch.icon size={12} />
                    {ch.label}
                  </button>
                ))}
              </div>

              {/* Action Grid */}
              <div className="grid grid-cols-3 gap-2">
                {actions.map((a) => (
                  <button
                    key={a.action}
                    onClick={() => executeAction(a.action)}
                    disabled={loading !== null}
                    className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-secondary/60 border border-border active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {loading === a.action ? (
                      <Loader2 size={16} className="text-primary animate-spin" />
                    ) : (
                      <a.icon size={16} className="text-primary" />
                    )}
                    <span className="text-[10px] font-semibold text-foreground leading-tight text-center">{a.label}</span>
                    <span className="text-[9px] text-muted-foreground">{a.desc}</span>
                  </button>
                ))}
              </div>

              {/* Result Display */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="space-y-3"
                  >
                    {/* Message Results */}
                    {result.body && (
                      <div className="bg-secondary/50 rounded-xl p-3 border border-border">
                        {result.subject && (
                          <p className="text-[10px] text-muted-foreground mb-1">Subject: <span className="text-foreground font-medium">{result.subject}</span></p>
                        )}
                        <p className="text-xs text-foreground leading-relaxed">{result.body}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => copyToClipboard(result.body!)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground active:scale-95 transition-transform"
                          >
                            {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                            {copied ? "Copied" : "Copy"}
                          </button>
                          <button
                            onClick={async () => { await logConversation(result.body!); await saveToQueue(); }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium active:scale-95 transition-transform"
                          >
                            <Send size={12} /> Queue
                          </button>
                        </div>
                        {(result.best_time_to_send || result.follow_up_delay_hours) && (
                          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-border">
                            {result.best_time_to_send && (
                              <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Clock size={10} /> Best: {result.best_time_to_send}
                              </span>
                            )}
                            {result.follow_up_delay_hours && (
                              <span className="text-[10px] text-muted-foreground">
                                Follow-up in {result.follow_up_delay_hours}h
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Call Script Results */}
                    {result.opening && (
                      <div className="bg-secondary/50 rounded-xl p-3 border border-border space-y-2.5">
                        <div>
                          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Opening</span>
                          <p className="text-xs text-foreground mt-0.5">{result.opening}</p>
                        </div>
                        {result.qualifying_questions && (
                          <div>
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Qualifying Questions</span>
                            <ul className="mt-1 space-y-1">
                              {result.qualifying_questions.map((q, i) => (
                                <li key={i} className="text-xs text-foreground pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-primary">{q}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.objection_handlers && (
                          <div>
                            <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Objection Handlers</span>
                            <div className="mt-1 space-y-1.5">
                              {result.objection_handlers.map((o, i) => (
                                <div key={i} className="bg-background/50 rounded-lg p-2">
                                  <p className="text-[10px] text-muted-foreground italic">"{o.objection}"</p>
                                  <p className="text-xs text-foreground mt-0.5">→ {o.response}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.closing_cta && (
                          <div>
                            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Close</span>
                            <p className="text-xs text-foreground mt-0.5">{result.closing_cta}</p>
                          </div>
                        )}
                        <button
                          onClick={() => copyToClipboard(`Opening: ${result.opening}\n\nQuestions:\n${(result.qualifying_questions || []).join("\n")}\n\nClose: ${result.closing_cta}`)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-xs font-medium text-foreground active:scale-95 transition-transform"
                        >
                          {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                          Copy Script
                        </button>
                      </div>
                    )}

                    {/* Analysis Results */}
                    {result.conversion_probability !== undefined && (
                      <div className="bg-secondary/50 rounded-xl p-3 border border-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Conversion Probability</span>
                          <span className={`font-display text-lg font-bold ${
                            (result.conversion_probability || 0) >= 60 ? "text-success" :
                            (result.conversion_probability || 0) >= 30 ? "text-warm" : "text-cold"
                          }`}>{result.conversion_probability}%</span>
                        </div>
                        <div className="bg-background/50 rounded-lg p-2.5">
                          <span className="text-[10px] font-semibold text-primary">Recommended Action</span>
                          <p className="text-xs text-foreground mt-0.5">{result.recommended_action}</p>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-background/50 rounded-lg p-2">
                            <span className="text-[10px] text-muted-foreground">Channel</span>
                            <p className="text-xs text-foreground font-medium capitalize">{result.optimal_channel}</p>
                          </div>
                          <div className="flex-1 bg-background/50 rounded-lg p-2">
                            <span className="text-[10px] text-muted-foreground">Timing</span>
                            <p className="text-xs text-foreground font-medium">{result.timing}</p>
                          </div>
                        </div>
                        {result.opportunities && result.opportunities.length > 0 && (
                          <div>
                            <span className="text-[10px] font-semibold text-success">Opportunities</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.opportunities.map((o, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px]">{o}</span>
                              ))}
                            </div>
                          </div>
                        )}
                        {result.red_flags && result.red_flags.length > 0 && (
                          <div>
                            <span className="text-[10px] font-semibold text-destructive">Red Flags</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {result.red_flags.map((f, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">{f}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Verification Results */}
                    {result.quality_score !== undefined && (
                      <div className="bg-secondary/50 rounded-xl p-3 border border-border space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Shield size={14} className={result.is_verified ? "text-success" : "text-destructive"} />
                            <span className="text-xs font-semibold text-foreground">
                              {result.is_verified ? "Verified Lead" : "Unverified"}
                            </span>
                          </div>
                          <span className={`font-display text-lg font-bold ${
                            (result.quality_score || 0) >= 60 ? "text-success" :
                            (result.quality_score || 0) >= 30 ? "text-warm" : "text-cold"
                          }`}>{result.quality_score}/100</span>
                        </div>
                        <p className="text-xs text-foreground">{result.verification_notes}</p>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-background/50 rounded-lg p-2">
                            <span className="text-[10px] text-muted-foreground">Contact</span>
                            <p className="text-xs text-foreground font-medium capitalize">{result.contact_quality}</p>
                          </div>
                          <div className="flex-1 bg-background/50 rounded-lg p-2">
                            <span className="text-[10px] text-muted-foreground">Intent</span>
                            <p className="text-xs text-foreground font-medium capitalize">{result.intent_confidence}</p>
                          </div>
                        </div>
                        {result.fraud_flags && result.fraud_flags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {result.fraud_flags.map((f, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">⚠ {f}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AutonomousEngagement;
