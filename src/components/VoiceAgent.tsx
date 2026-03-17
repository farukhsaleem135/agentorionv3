import { useState, useCallback, useEffect, useRef } from "react";
import { useConversation } from "@elevenlabs/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, MicOff, Phone, PhoneOff, Loader2, Volume2, VolumeX,
  ChevronDown, ChevronUp, FileText, Brain, Sparkles, Lock
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSubscription, VOICE_MINUTE_LIMITS } from "@/contexts/SubscriptionContext";

interface VoiceAgentProps {
  leadId: string;
  leadName: string;
  temperature: string | null;
  agentId?: string;
}

interface CallSummary {
  summary: string;
  key_topics: string[];
  action_items: string[];
  sentiment: string;
  buying_signals?: string[];
  objections_raised?: string[];
  confidence_score: number;
  recommended_next_step: string;
  temperature_change: string;
  new_temperature?: string;
  auto_follow_up_triggered?: boolean;
}

const VoiceAgent = ({ leadId, leadName, temperature, agentId }: VoiceAgentProps) => {
  const { toast } = useToast();
  const { tier, usage, trackEvent, setShowUpgrade, setUpgradeReason, setUpgradeTarget } = useSubscription();
  const [expanded, setExpanded] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [callSummary, setCallSummary] = useState<CallSummary | null>(null);
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [callStartTime, setCallStartTime] = useState<number | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);

  const voiceLimit = VOICE_MINUTE_LIMITS[tier];
  const voiceLocked = voiceLimit === 0;
  const voiceExhausted = voiceLimit > 0 && usage.voiceMinutesUsed >= voiceLimit;

  const conversation = useConversation({
    onConnect: () => {
      setCallStartTime(Date.now());
      toast({ title: "Voice Agent Connected", description: `Speaking with ${leadName}` });
    },
    onDisconnect: () => {
      // Track voice minutes used
      if (callStartTime) {
        const durationMinutes = Math.round(((Date.now() - callStartTime) / 60000) * 10) / 10;
        trackEvent("voice_call", { lead_id: leadId, duration_minutes: durationMinutes });
      }
      if (transcript.length > 0) {
        handleGenerateSummary();
      }
    },
    onMessage: (message: any) => {
      if (message.type === "user_transcript" && message.user_transcription_event?.user_transcript) {
        setTranscript(prev => [...prev, { role: "user", text: message.user_transcription_event.user_transcript }]);
      }
      if (message.type === "agent_response" && message.agent_response_event?.agent_response) {
        setTranscript(prev => [...prev, { role: "agent", text: message.agent_response_event.agent_response }]);
      }
    },
    onError: (error: any) => {
      console.error("Voice agent error:", error);
      toast({ title: "Voice Error", description: "Connection issue. Please try again.", variant: "destructive" });
    },
  });

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript]);

  const startConversation = useCallback(async () => {
    if (voiceLocked) {
      setUpgradeTarget("growth");
      setUpgradeReason("Voice Agent requires a Growth plan or higher. Upgrade to unlock AI voice calls.");
      setShowUpgrade(true);
      return;
    }
    if (voiceExhausted) {
      setUpgradeTarget("pro");
      setUpgradeReason(`You've used all ${voiceLimit} voice minutes this month. Upgrade to Pro for unlimited voice.`);
      setShowUpgrade(true);
      return;
    }
    if (!agentId) {
      toast({
        title: "Voice Agent Not Configured",
        description: "An ElevenLabs Agent ID is required. Configure it in Settings.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const { data, error } = await supabase.functions.invoke("elevenlabs-conversation-token", {
        body: { agentId },
      });

      if (error || !data?.signed_url) {
        throw new Error(data?.error || "Failed to get voice agent token");
      }

      await conversation.startSession({
        signedUrl: data.signed_url,
      });

      setTranscript([]);
      setCallSummary(null);
    } catch (error: any) {
      console.error("Failed to start voice agent:", error);
      if (error.name === "NotAllowedError") {
        toast({
          title: "Microphone Access Required",
          description: "Please enable microphone access to use voice features.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: error.message || "Could not connect to voice agent.",
          variant: "destructive",
        });
      }
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, agentId, toast, leadName]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const handleGenerateSummary = async () => {
    if (transcript.length === 0) return;
    setGeneratingSummary(true);

    const duration = callStartTime ? Math.round((Date.now() - callStartTime) / 1000) : null;
    const fullTranscript = transcript.map(t => `${t.role === "user" ? "Agent" : "AI Assistant"}: ${t.text}`).join("\n");

    try {
      const { data, error } = await supabase.functions.invoke("generate-call-summary", {
        body: {
          lead_id: leadId,
          transcript: fullTranscript,
          duration_seconds: duration,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setCallSummary(data);

      if (data.auto_follow_up_triggered) {
        toast({ title: "Auto Follow-up Triggered", description: `Confidence ${data.confidence_score}% exceeds threshold — scheduling autonomous outreach.` });
      }
    } catch (e: any) {
      toast({ title: "Summary failed", description: e.message, variant: "destructive" });
    } finally {
      setGeneratingSummary(false);
    }
  };

  const sentimentColor = (s: string) => {
    if (s === "very_positive" || s === "positive") return "text-success";
    if (s === "neutral") return "text-muted-foreground";
    return "text-destructive";
  };

  const isConnected = conversation.status === "connected";

  return (
    <div className="bg-gradient-card rounded-xl border border-border shadow-card overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 active:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isConnected ? "bg-success/15" : "bg-primary/15"}`}>
            <Mic size={16} className={isConnected ? "text-success" : "text-primary"} />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-semibold text-foreground">Voice Agent</h3>
            <p className="text-[10px] text-muted-foreground">
              {isConnected ? "Live call in progress" : "AI voice with shared memory"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isConnected && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/15 text-success text-[10px] font-semibold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-success" /> LIVE
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </div>
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
              {/* Call Controls */}
              {(voiceLocked || voiceExhausted) && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20">
                  <Lock size={14} className="text-destructive shrink-0" />
                  <p className="text-[10px] text-destructive font-medium">
                    {voiceLocked
                      ? "Voice Agent requires Growth plan or higher."
                      : `Voice limit reached (${usage.voiceMinutesUsed}/${voiceLimit} min). Upgrade to Pro for unlimited.`}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-center gap-4">
                {!isConnected ? (
                  <button
                    onClick={startConversation}
                    disabled={isConnecting}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm active:scale-95 transition-transform disabled:opacity-50 ${
                      voiceLocked || voiceExhausted
                        ? "bg-muted text-muted-foreground"
                        : "bg-success text-success-foreground"
                    }`}
                  >
                    {isConnecting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : voiceLocked || voiceExhausted ? (
                      <Lock size={16} />
                    ) : (
                      <Phone size={16} />
                    )}
                    {isConnecting ? "Connecting..." : voiceLocked || voiceExhausted ? "Upgrade to Unlock" : "Start Voice Call"}
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary text-xs text-muted-foreground">
                      {conversation.isSpeaking ? (
                        <><Volume2 size={14} className="text-primary animate-pulse" /> AI speaking</>
                      ) : (
                        <><Mic size={14} className="text-success" /> Listening</>
                      )}
                    </div>
                    <button
                      onClick={stopConversation}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium active:scale-95 transition-transform"
                    >
                      <PhoneOff size={14} /> End
                    </button>
                  </div>
                )}
              </div>

              {/* Live Transcript */}
              {transcript.length > 0 && (
                <div className="bg-secondary/50 rounded-xl border border-border">
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b border-border">
                    <FileText size={12} className="text-primary" />
                    <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">Live Transcript</span>
                  </div>
                  <div
                    ref={transcriptRef}
                    className="max-h-40 overflow-y-auto p-3 space-y-2"
                  >
                    {transcript.map((t, i) => (
                      <div key={i} className={`flex gap-2 ${t.role === "user" ? "" : "flex-row-reverse"}`}>
                        <div className={`px-2.5 py-1.5 rounded-lg text-xs max-w-[80%] ${
                          t.role === "user"
                            ? "bg-primary/10 text-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}>
                          {t.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generate Summary Button */}
              {transcript.length > 0 && !isConnected && !callSummary && (
                <button
                  onClick={handleGenerateSummary}
                  disabled={generatingSummary}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold active:scale-95 transition-transform disabled:opacity-50"
                >
                  {generatingSummary ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Brain size={14} />
                  )}
                  {generatingSummary ? "Generating Summary..." : "Generate Call Summary"}
                </button>
              )}

              {/* Call Summary */}
              {callSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/50 rounded-xl border border-border p-3 space-y-3"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary" />
                    <span className="text-[10px] font-semibold text-foreground uppercase tracking-wider">AI Call Summary</span>
                  </div>

                  <p className="text-xs text-foreground leading-relaxed">{callSummary.summary}</p>

                  {/* Confidence + Sentiment */}
                  <div className="flex gap-2">
                    <div className="flex-1 bg-background/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Confidence</p>
                      <p className={`font-display text-lg font-bold ${
                        callSummary.confidence_score >= 70 ? "text-success" :
                        callSummary.confidence_score >= 40 ? "text-warm" : "text-cold"
                      }`}>{callSummary.confidence_score}%</p>
                    </div>
                    <div className="flex-1 bg-background/50 rounded-lg p-2 text-center">
                      <p className="text-[10px] text-muted-foreground">Sentiment</p>
                      <p className={`text-sm font-semibold capitalize ${sentimentColor(callSummary.sentiment)}`}>
                        {callSummary.sentiment.replace("_", " ")}
                      </p>
                    </div>
                    {callSummary.temperature_change !== "same" && callSummary.new_temperature && (
                      <div className="flex-1 bg-background/50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-muted-foreground">Temp Change</p>
                        <p className={`text-sm font-semibold capitalize ${
                          callSummary.new_temperature === "hot" ? "text-hot" :
                          callSummary.new_temperature === "warm" ? "text-warm" : "text-cold"
                        }`}>
                          → {callSummary.new_temperature}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Items */}
                  {callSummary.action_items.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">Action Items</span>
                      <ul className="mt-1 space-y-1">
                        {callSummary.action_items.map((a, i) => (
                          <li key={i} className="text-xs text-foreground pl-3 relative before:content-['→'] before:absolute before:left-0 before:text-primary">{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Buying Signals */}
                  {callSummary.buying_signals && callSummary.buying_signals.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Buying Signals</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {callSummary.buying_signals.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px]">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Objections */}
                  {callSummary.objections_raised && callSummary.objections_raised.length > 0 && (
                    <div>
                      <span className="text-[10px] font-semibold text-destructive uppercase tracking-wider">Objections</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {callSummary.objections_raised.map((o, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full bg-destructive/10 text-destructive text-[10px]">{o}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next Step */}
                  <div className="bg-primary/5 rounded-lg p-2.5 border border-primary/10">
                    <span className="text-[10px] font-semibold text-primary">Recommended Next Step</span>
                    <p className="text-xs text-foreground mt-0.5">{callSummary.recommended_next_step}</p>
                  </div>

                  {/* Auto-follow-up indicator */}
                  {callSummary.auto_follow_up_triggered && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
                      <Sparkles size={12} className="text-success" />
                      <span className="text-[10px] font-semibold text-success">
                        Auto follow-up triggered — confidence exceeds threshold
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Shared Memory Notice */}
              {!isConnected && transcript.length === 0 && (
                <div className="bg-secondary/30 rounded-xl p-3 border border-border">
                  <div className="flex items-start gap-2">
                    <Brain size={14} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-foreground mb-1">Shared Memory Enabled</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        Voice calls share context with text conversations. The AI remembers past interactions across all channels for personalized engagement.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAgent;
