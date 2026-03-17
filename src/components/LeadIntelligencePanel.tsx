import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Zap, Phone, Mail, MessageSquare, Clock, AlertTriangle,
  CheckCircle2, TrendingUp, Shield, Loader2, Sparkles, ChevronDown,
  ChevronUp, Copy, Check, Home
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LeadData {
  name?: string | null;
  temperature?: string | null;
  budget?: string | null;
  timeline?: string | null;
  intent?: string | null;
  financing_status?: string | null;
  urgency_score?: number | null;
  phone?: string | null;
  email?: string | null;
  status?: string | null;
  created_at?: string;
  source?: string;
}

interface ScoreResult {
  ai_score: number;
  conversion_probability: string;
  recommended_channel: "sms" | "email" | "call";
  best_time: string;
  next_action: string;
  risk_factors: string[];
  strengths: string[];
  urgency: "act_now" | "follow_up_today" | "nurture" | "monitor";
}

interface MessageResult {
  sms: string;
  email_subject: string;
  email_body: string;
  social_caption: string;
  call_opener: string;
  message_tone: string;
}

interface CoachResult {
  headline: string;
  advice: string[];
  warning: string;
  script_suggestion: string;
}

interface SellerPredictionResult {
  seller_prediction_score: number;
  prediction_reasons: string[];
  equity_estimate: string;
  ownership_timeline: string;
  likely_motivation: string;
  recommended_approach: string;
  prep_pack_items: string[];
  urgency: "imminent" | "likely_soon" | "possible" | "unlikely";
}

const urgencyConfig = {
  act_now: { label: "Act Now", color: "bg-hot/15 text-hot", icon: AlertTriangle },
  follow_up_today: { label: "Follow Up Today", color: "bg-warning/15 text-warning", icon: Clock },
  nurture: { label: "Nurture", color: "bg-info/15 text-info", icon: TrendingUp },
  monitor: { label: "Monitor", color: "bg-muted text-muted-foreground", icon: Shield },
};

const channelIcons = {
  sms: MessageSquare,
  email: Mail,
  call: Phone,
};

interface Props {
  lead: LeadData;
  onSellerScoreUpdate?: (score: number, reasons: string[]) => void;
}

const LeadIntelligencePanel = ({ lead, onSellerScoreUpdate }: Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [scoreData, setScoreData] = useState<ScoreResult | null>(null);
  const [messages, setMessages] = useState<MessageResult | null>(null);
  const [coaching, setCoaching] = useState<CoachResult | null>(null);
  const [sellerPrediction, setSellerPrediction] = useState<SellerPredictionResult | null>(null);
  const [expanded, setExpanded] = useState<"score" | "messages" | "coaching" | "predict_seller" | null>("score");
  const [copied, setCopied] = useState<string | null>(null);

  const daysSinceCapture = lead.created_at
    ? Math.floor((Date.now() - new Date(lead.created_at).getTime()) / 86400000)
    : 0;

  const invoke = async (action: string) => {
    setLoading(action);
    try {
      const { data, error } = await supabase.functions.invoke("lead-intelligence", {
        body: {
          action,
          lead: {
            name: lead.name,
            temperature: lead.temperature,
            budget: lead.budget,
            timeline: lead.timeline,
            intent: lead.intent,
            financing_status: lead.financing_status,
            urgency_score: lead.urgency_score,
            has_phone: !!lead.phone && lead.phone !== "Skipped",
            has_email: !!lead.email,
            status: lead.status,
            days_since_capture: daysSinceCapture,
            source: lead.source || "Direct",
            agent_name: "Your Agent",
            channel: "all",
            days_without_contact: daysSinceCapture,
          },
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast({ title: data.error, variant: "destructive" });
        return;
      }

      if (action === "score") setScoreData(data);
      else if (action === "message") setMessages(data);
      else if (action === "coach") setCoaching(data);
      else if (action === "predict_seller") {
        setSellerPrediction(data);
        onSellerScoreUpdate?.(data.seller_prediction_score, data.prediction_reasons);
      }
    } catch (e: any) {
      toast({ title: "AI analysis failed", description: e.message, variant: "destructive" });
    }
    setLoading(null);
  };

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  const sections = [
    {
      key: "score" as const,
      label: "AI Lead Intelligence",
      icon: Brain,
      color: "text-primary",
      hasData: !!scoreData,
    },
    {
      key: "messages" as const,
      label: "AI Message Generator",
      icon: Sparkles,
      color: "text-info",
      hasData: !!messages,
    },
    {
      key: "coaching" as const,
      label: "Sales Coach",
      icon: TrendingUp,
      color: "text-success",
      hasData: !!coaching,
    },
    {
      key: "predict_seller" as const,
      label: "Seller Prediction",
      icon: Home,
      color: "text-warning",
      hasData: !!sellerPrediction,
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((section) => (
        <div key={section.key} className="bg-gradient-card rounded-xl border border-border shadow-card overflow-hidden">
          <button
            onClick={() => {
              if (expanded === section.key) {
                setExpanded(null);
              } else {
                setExpanded(section.key);
                if (!section.hasData && !loading) invoke(section.key);
              }
            }}
            className="w-full flex items-center justify-between p-4 active:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                section.key === "score" ? "bg-primary/15" :
                section.key === "messages" ? "bg-info/15" :
                section.key === "predict_seller" ? "bg-warning/15" : "bg-success/15"
              }`}>
                {loading === section.key ? (
                  <Loader2 size={14} className="animate-spin text-muted-foreground" />
                ) : (
                  <section.icon size={14} className={section.color} />
                )}
              </div>
              <span className="text-sm font-semibold text-foreground">{section.label}</span>
            </div>
            {expanded === section.key ? (
              <ChevronUp size={14} className="text-muted-foreground" />
            ) : (
              <ChevronDown size={14} className="text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {expanded === section.key && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-4 border-t border-border pt-3">
                  {/* SCORE SECTION */}
                  {section.key === "score" && scoreData && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">AI Score</span>
                          <p className={`font-display text-3xl font-bold ${
                            scoreData.ai_score >= 70 ? "text-success" :
                            scoreData.ai_score >= 40 ? "text-warning" : "text-muted-foreground"
                          }`}>{scoreData.ai_score}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Conversion</span>
                          <p className="text-sm font-semibold text-foreground">{scoreData.conversion_probability}</p>
                        </div>
                      </div>

                      {/* Urgency badge */}
                      {urgencyConfig[scoreData.urgency] && (
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${urgencyConfig[scoreData.urgency].color}`}>
                          {(() => { const Icon = urgencyConfig[scoreData.urgency].icon; return <Icon size={12} />; })()}
                          {urgencyConfig[scoreData.urgency].label}
                        </div>
                      )}

                      {/* Channel + Timing */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            {(() => { const Icon = channelIcons[scoreData.recommended_channel]; return <Icon size={12} className="text-muted-foreground" />; })()}
                            <span className="text-[10px] text-muted-foreground">Best Channel</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground capitalize">{scoreData.recommended_channel}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock size={12} className="text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">Best Time</span>
                          </div>
                          <p className="text-xs font-semibold text-foreground">{scoreData.best_time}</p>
                        </div>
                      </div>

                      {/* Next Action */}
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap size={12} className="text-primary" />
                          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Next Action</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{scoreData.next_action}</p>
                      </div>

                      {/* Strengths & Risks */}
                      {scoreData.strengths.length > 0 && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Strengths</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scoreData.strengths.map((s, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px]">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {scoreData.risk_factors.length > 0 && (
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Factors</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {scoreData.risk_factors.map((r, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">{r}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* MESSAGES SECTION */}
                  {section.key === "messages" && messages && (
                    <div className="space-y-3">
                      {([
                        { key: "sms", label: "SMS", icon: MessageSquare, text: messages.sms, color: "bg-info/15 text-info" },
                        { key: "email", label: "Email", icon: Mail, text: `Subject: ${messages.email_subject}\n\n${messages.email_body}`, color: "bg-primary/15 text-primary" },
                        { key: "social", label: "Social DM", icon: Sparkles, text: messages.social_caption, color: "bg-warning/15 text-warning" },
                        { key: "call", label: "Call Opener", icon: Phone, text: messages.call_opener, color: "bg-success/15 text-success" },
                      ] as const).map((ch) => (
                        <div key={ch.key} className="bg-secondary/30 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center ${ch.color}`}>
                                <ch.icon size={12} />
                              </div>
                              <span className="text-xs font-semibold text-foreground">{ch.label}</span>
                            </div>
                            <button
                              onClick={() => handleCopy(ch.text, ch.key)}
                              className="p-1.5 rounded-md bg-secondary active:scale-95 transition-transform"
                            >
                              {copied === ch.key ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-foreground" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-foreground/80 leading-relaxed whitespace-pre-line">{ch.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* COACHING SECTION */}
                  {section.key === "coaching" && coaching && (
                    <div className="space-y-3">
                      <div className="bg-success/5 border border-success/20 rounded-lg p-3">
                        <p className="text-sm font-semibold text-foreground">{coaching.headline}</p>
                      </div>

                      <div className="space-y-2">
                        {coaching.advice.map((tip, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                            <p className="text-[11px] text-foreground/80 leading-relaxed">{tip}</p>
                          </div>
                        ))}
                      </div>

                      {coaching.warning && (
                        <div className="flex items-start gap-2 bg-destructive/5 border border-destructive/20 rounded-lg p-2.5">
                          <AlertTriangle size={12} className="text-destructive mt-0.5 shrink-0" />
                          <p className="text-[11px] text-destructive/80 leading-relaxed">{coaching.warning}</p>
                        </div>
                      )}

                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Suggested Opener</span>
                          <button
                            onClick={() => handleCopy(coaching.script_suggestion, "script")}
                            className="p-1 rounded-md bg-secondary active:scale-95 transition-transform"
                          >
                            {copied === "script" ? <Check size={10} className="text-success" /> : <Copy size={10} className="text-foreground" />}
                          </button>
                        </div>
                        <p className="text-xs text-foreground italic leading-relaxed">"{coaching.script_suggestion}"</p>
                      </div>
                    </div>
                  )}

                  {/* SELLER PREDICTION SECTION */}
                  {section.key === "predict_seller" && sellerPrediction && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Seller Score</span>
                          <p className={`font-display text-3xl font-bold ${
                            sellerPrediction.seller_prediction_score >= 70 ? "text-hot" :
                            sellerPrediction.seller_prediction_score >= 40 ? "text-warning" : "text-muted-foreground"
                          }`}>{sellerPrediction.seller_prediction_score}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Urgency</span>
                          <p className={`text-sm font-semibold capitalize ${
                            sellerPrediction.urgency === "imminent" ? "text-hot" :
                            sellerPrediction.urgency === "likely_soon" ? "text-warning" :
                            sellerPrediction.urgency === "possible" ? "text-info" : "text-muted-foreground"
                          }`}>{sellerPrediction.urgency.replace("_", " ")}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <span className="text-[10px] text-muted-foreground">Motivation</span>
                          <p className="text-xs font-semibold text-foreground">{sellerPrediction.likely_motivation}</p>
                        </div>
                        <div className="bg-secondary/50 rounded-lg p-2.5">
                          <span className="text-[10px] text-muted-foreground">Equity Est.</span>
                          <p className="text-xs font-semibold text-foreground">{sellerPrediction.equity_estimate}</p>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Why This Score</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sellerPrediction.prediction_reasons.map((r, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-full bg-warning/10 text-warning text-[10px]">{r}</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Zap size={12} className="text-warning" />
                          <span className="text-[10px] text-warning font-semibold uppercase tracking-wider">Recommended Approach</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{sellerPrediction.recommended_approach}</p>
                      </div>

                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Seller Prep Pack</span>
                        <div className="space-y-1.5 mt-1.5">
                          {sellerPrediction.prep_pack_items.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <CheckCircle2 size={12} className="text-warning mt-0.5 shrink-0" />
                              <p className="text-[11px] text-foreground/80 leading-relaxed">{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Loading state */}
                  {loading === section.key && !section.hasData && (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Analyzing lead...</span>
                    </div>
                  )}

                  {/* Retry button if no data and not loading */}
                  {!loading && !section.hasData && (
                    <button
                      onClick={() => invoke(section.key)}
                      className="w-full py-3 rounded-lg bg-secondary text-sm font-medium text-foreground active:scale-[0.98] transition-transform"
                    >
                      Run AI Analysis
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default LeadIntelligencePanel;
