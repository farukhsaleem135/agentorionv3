import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { formatPhoneDisplay, toE164, isValidUSPhone, stripPhone } from "@/lib/phoneFormat";

interface LeadCaptureChatProps {
  funnelId: string;
  funnelType: string;
  funnelCategory?: "seller" | "buyer" | "open-house";
  ctaText?: string;
}

const leadSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(20).optional(),
  budget: z.string().trim().max(100).optional(),
  timeline: z.string().trim().max(100).optional(),
  financing_status: z.string().trim().max(100).optional(),
});

interface ChatMessage {
  role: "assistant" | "user";
  text: string;
  options?: string[];
  field?: string;
  isContactForm?: boolean;
}

interface QualifyingStep {
  text: string;
  field: string;
  options: string[];
}

function getQualifyingSteps(funnelType: string, funnelCategory?: "seller" | "buyer" | "open-house"): QualifyingStep[] {
  const normalizedType = funnelType.toLowerCase().replace(/[_-]/g, " ");

  if (funnelCategory === "seller" || normalizedType.includes("seller") || normalizedType.includes("valuation") || normalizedType.includes("home value")) {
    return [
      {
        text: "When are you thinking of selling?",
        field: "timeline",
        options: ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring my options"],
      },
      {
        text: "What's the current condition of your property?",
        field: "budget",
        options: ["Move-in ready", "Needs minor updates", "Needs major renovation", "New construction", "Not sure"],
      },
      {
        text: "Have you already spoken with an agent?",
        field: "financing_status",
        options: ["No, this is my first step", "Yes, but looking for a better fit", "Yes, and I'm under contract"],
      },
    ];
  }

  // Default: Buyer-oriented questions
  return [
    {
      text: "What's your approximate budget range?",
      field: "budget",
      options: ["Under $200K", "$200K–$400K", "$400K–$600K", "$600K–$1M", "$1M+", "Not sure yet"],
    },
    {
      text: "When are you looking to buy?",
      field: "timeline",
      options: ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring"],
    },
    {
      text: "What's your financing status?",
      field: "financing_status",
      options: ["Pre-approved", "Working on pre-approval", "Cash buyer", "Haven't started yet"],
    },
  ];
}

const LeadCaptureChat = ({ funnelId, funnelType, funnelCategory, ctaText }: LeadCaptureChatProps) => {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"contact" | "qualifying" | "done">("contact");
  const [qualifyingStep, setQualifyingStep] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [started, setStarted] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactError, setContactError] = useState("");

  const qualifyingSteps = getQualifyingSteps(funnelType, funnelCategory);

  const startChat = () => {
    setOpen(true);
    if (!started) {
      setMessages([
        {
          role: "assistant",
          text: "Hi there! 👋 I'd love to help you out. Let's start with your contact info.",
          isContactForm: true,
        },
      ]);
      setStarted(true);
    }
  };

  const handleContactSubmit = () => {
    setContactError("");
    const trimName = contactName.trim();
    const trimEmail = contactEmail.trim();

    if (!trimName) {
      setContactError("Please enter your name.");
      return;
    }
    const emailResult = z.string().email().safeParse(trimEmail);
    if (!emailResult.success) {
      setContactError("Please enter a valid email address.");
      return;
    }

    const newAnswers = {
      ...answers,
      name: trimName,
      email: trimEmail,
      phone: contactPhone.trim() ? (toE164(contactPhone) || contactPhone.trim()) : "Skipped",
    };
    setAnswers(newAnswers);

    // Add user message summarizing contact info
    setMessages((prev) => [
      ...prev,
      { role: "user", text: `${trimName} • ${trimEmail}${contactPhone.trim() ? ` • ${contactPhone.trim()}` : ""}` },
    ]);

    // Move to qualifying phase
    setPhase("qualifying");
    const firstStep = qualifyingSteps[0];
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Great to meet you, ${trimName}! ${firstStep.text}`,
          options: firstStep.options,
          field: firstStep.field,
        },
      ]);
    }, 400);
  };

  const handleOptionClick = (option: string) => {
    if (submitted || phase !== "qualifying") return;

    const currentStep = qualifyingSteps[qualifyingStep];
    const newAnswers = { ...answers, [currentStep.field]: option };
    setAnswers(newAnswers);

    setMessages((prev) => [...prev, { role: "user", text: option }]);

    const nextIdx = qualifyingStep + 1;

    if (nextIdx >= qualifyingSteps.length) {
      // Submit
      submitLead(newAnswers);
    } else {
      setQualifyingStep(nextIdx);
      const nextStep = qualifyingSteps[nextIdx];
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            text: nextStep.text,
            options: nextStep.options,
            field: nextStep.field,
          },
        ]);
      }, 400);
    }
  };

  const submitLead = async (finalAnswers: Record<string, string>) => {
    setSubmitting(true);
    const parsed = leadSchema.safeParse(finalAnswers);

    const leadData = {
      funnel_id: funnelId,
      name: finalAnswers.name || null,
      email: parsed.success ? parsed.data.email : finalAnswers.email || null,
      phone: finalAnswers.phone === "Skipped" ? null : finalAnswers.phone || null,
      budget: finalAnswers.budget || null,
      timeline: finalAnswers.timeline || null,
      financing_status: finalAnswers.financing_status || null,
      intent: funnelType,
      temperature: getTemperature(finalAnswers.timeline),
      urgency_score: getUrgencyScore(finalAnswers.timeline),
    };

    const { data: captureResult, error } = await supabase
      .rpc('capture_lead', {
        p_funnel_id: funnelId,
        p_lead_data: leadData,
      }) as { data: any; error: any };
    setSubmitting(false);

    if (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong. Please try again later." },
      ]);
    } else {
      if (captureResult && !captureResult.success && captureResult.error === 'lead_limit_reached') {
        console.warn('Lead limit reached for funnel', funnelId);
      }
      // Always show success to the prospect
      setSubmitted(true);
      setPhase("done");
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: `Thanks, ${finalAnswers.name}! 🎉 We've got your info and someone will be in touch soon. Keep an eye on your inbox!`,
        },
      ]);
    }
  };

  const lastMessage = messages[messages.length - 1];

  return (
    <>
      <button
        onClick={startChat}
        className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-base shadow-glow active:scale-95 transition-transform"
      >
        {ctaText || "Get Started"}
        <MessageCircle size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-background/90 backdrop-blur-sm flex items-end sm:items-center justify-center"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-card max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center">
                    <MessageCircle size={14} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Let's connect!</p>
                    <p className="text-[10px] text-muted-foreground">Usually responds instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-lg bg-secondary active:scale-95 transition-transform"
                >
                  <X size={16} className="text-foreground" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-secondary text-foreground rounded-bl-md"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}

                {/* Contact Form (shown inline after intro message) */}
                {phase === "contact" && lastMessage?.isContactForm && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary rounded-2xl p-4 space-y-3"
                  >
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Your name *"
                      className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
                    />
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="Email address *"
                      className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
                    />
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => {
                        const digits = stripPhone(e.target.value);
                        if (digits.length <= 11) setContactPhone(formatPhoneDisplay(digits));
                      }}
                      placeholder="Phone number (optional)"
                      className="w-full bg-card rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none border border-transparent focus:border-primary/30 transition-colors"
                    />
                    {contactError && (
                      <p className="text-xs text-destructive">{contactError}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground leading-relaxed px-1">
                      By continuing, you agree to receive follow-up communications. You can opt out anytime.
                      <span className="text-primary ml-1 cursor-pointer">Privacy Policy</span>
                    </p>
                    <button
                      onClick={handleContactSubmit}
                      className="w-full py-2.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm active:scale-95 transition-transform shadow-glow"
                    >
                      Continue
                    </button>
                  </motion.div>
                )}

                {/* Qualifying Options */}
                {phase === "qualifying" && !submitted && lastMessage?.role === "assistant" && lastMessage.options && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-2 pl-2"
                  >
                    {lastMessage.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handleOptionClick(opt)}
                        className="px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-foreground hover:bg-secondary active:scale-95 transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </motion.div>
                )}

                {submitting && (
                  <div className="flex justify-start">
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <Loader2 size={16} className="animate-spin text-muted-foreground" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

function getTemperature(timeline?: string): string {
  switch (timeline) {
    case "ASAP": return "hot";
    case "1–3 months": return "warm";
    case "3–6 months": return "warm";
    default: return "cold";
  }
}

function getUrgencyScore(timeline?: string): number {
  switch (timeline) {
    case "ASAP": return 90;
    case "1–3 months": return 75;
    case "3–6 months": return 50;
    case "6–12 months": return 30;
    case "Just exploring":
    case "Just exploring my options": return 15;
    default: return 10;
  }
}

export default LeadCaptureChat;
