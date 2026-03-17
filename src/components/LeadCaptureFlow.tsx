import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle2, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Progress } from "@/components/ui/progress";
import { getContrastTextColor } from "@/utils/colorUtils";

interface LeadCaptureFlowProps {
  funnelId: string;
  funnelType: string;
  funnelCategory?: "seller" | "buyer" | "open-house";
  ctaText?: string;
  variant?: "hero" | "bottom";
  accentColor?: string;
  borderRadius?: string;
  ctaStyle?: string;
}

interface FlowStep {
  id: string;
  question: string;
  type: "choice" | "contact";
  field?: string;
  options?: string[];
}

function getFlowSteps(funnelType: string, funnelCategory?: "seller" | "buyer" | "open-house"): FlowStep[] {
  const t = funnelType.toLowerCase().replace(/[_-]/g, " ");
  const isSeller = funnelCategory === "seller" || t.includes("seller") || t.includes("valuation") || t.includes("home value");
  const isOpenHouse = funnelCategory === "open-house" || t.includes("open house");
  const isFsbo = t.includes("fsbo");
  const isExpired = t.includes("expired");
  const isPreForeclosure = t.includes("pre foreclosure") || t.includes("pre-foreclosure");
  const isHighIntent = isFsbo || isExpired || isPreForeclosure;

  // High-intent niche flows
  if (isFsbo) {
    return [
      { id: "goal", question: "What's your biggest challenge selling on your own?", type: "choice", field: "intent", options: ["Pricing it right", "Getting enough showings", "Handling paperwork", "Negotiating offers"] },
      { id: "timeline", question: "How long has your home been on the market?", type: "choice", field: "timeline", options: ["Just listed", "1–3 months", "3–6 months", "6+ months"] },
      { id: "condition", question: "What's your home's condition?", type: "choice", field: "budget", options: ["Move-in ready", "Needs minor updates", "Needs major work", "Not sure"] },
      { id: "agent", question: "Would you consider working with an agent if they could net you more?", type: "choice", field: "financing_status", options: ["Yes, show me the numbers", "Maybe, convince me", "No, I want to sell myself"] },
      { id: "contact", question: "Where should we send your free FSBO analysis?", type: "contact" },
    ];
  }

  if (isExpired) {
    return [
      { id: "goal", question: "Why do you think your home didn't sell?", type: "choice", field: "intent", options: ["Priced too high", "Bad marketing/photos", "Wrong agent", "Market timing", "Not sure"] },
      { id: "timeline", question: "Are you still interested in selling?", type: "choice", field: "timeline", options: ["Yes, ASAP", "Yes, within 3 months", "Considering re-listing", "Taking a break"] },
      { id: "change", question: "What would need to change for you to re-list?", type: "choice", field: "budget", options: ["Better pricing strategy", "Better marketing", "A different agent", "Market improvement"] },
      { id: "contact", question: "Where should we send your free re-listing strategy?", type: "contact" },
    ];
  }

  if (isPreForeclosure) {
    return [
      { id: "goal", question: "What best describes your situation?", type: "choice", field: "intent", options: ["Behind on payments", "Received a notice", "Exploring options before it's too late", "Helping a family member"] },
      { id: "timeline", question: "How urgent is your situation?", type: "choice", field: "timeline", options: ["Immediate — need help now", "Within 30 days", "Within 90 days", "Just exploring options"] },
      { id: "equity", question: "Do you have equity in your home?", type: "choice", field: "budget", options: ["Yes, significant equity", "Some equity", "Little to no equity", "Not sure"] },
      { id: "help", question: "What kind of help are you looking for?", type: "choice", field: "financing_status", options: ["Sell before foreclosure", "Loan modification guidance", "Short sale options", "All options"] },
      { id: "contact", question: "Where should we send your confidential options report?", type: "contact" },
    ];
  }

  const goalStep: FlowStep = {
    id: "goal",
    question: isSeller
      ? "What's your primary goal?"
      : isOpenHouse
        ? "What brings you to this showing?"
        : "What's your primary goal?",
    type: "choice",
    field: "intent",
    options: isSeller
      ? ["Maximize my sale price", "Sell quickly", "Understand my options", "Explore timing"]
      : isOpenHouse
        ? ["Actively looking to buy", "Exploring the neighborhood", "Curious about pricing", "Comparing properties"]
        : ["Find my first home", "Upgrade to a bigger home", "Investment property", "Just exploring"],
  };

  const qualifySteps: FlowStep[] = isSeller
    ? [
        {
          id: "timeline",
          question: "When are you thinking of selling?",
          type: "choice",
          field: "timeline",
          options: ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring"],
        },
        {
          id: "condition",
          question: "What's the current condition of your property?",
          type: "choice",
          field: "budget",
          options: ["Move-in ready", "Needs minor updates", "Needs major renovation", "Not sure"],
        },
        {
          id: "agent",
          question: "Have you already spoken with an agent?",
          type: "choice",
          field: "financing_status",
          options: ["No, this is my first step", "Yes, but exploring options", "Yes, I'm under contract"],
        },
      ]
    : isOpenHouse
      ? [
          {
            id: "timeline",
            question: "How soon are you looking to make a move?",
            type: "choice",
            field: "timeline",
            options: ["ASAP", "1–3 months", "3–6 months", "Just browsing"],
          },
          {
            id: "financing",
            question: "What's your financing situation?",
            type: "choice",
            field: "financing_status",
            options: ["Pre-approved", "Working on it", "Cash buyer", "Haven't started"],
          },
        ]
      : [
          {
            id: "budget",
            question: "What's your approximate budget range?",
            type: "choice",
            field: "budget",
            options: ["Under $200K", "$200K–$400K", "$400K–$600K", "$600K–$1M", "$1M+"],
          },
          {
            id: "timeline",
            question: "When are you looking to buy?",
            type: "choice",
            field: "timeline",
            options: ["ASAP", "1–3 months", "3–6 months", "6–12 months", "Just exploring"],
          },
          {
            id: "financing",
            question: "What's your financing status?",
            type: "choice",
            field: "financing_status",
            options: ["Pre-approved", "Working on pre-approval", "Cash buyer", "Haven't started"],
          },
        ];

  const contactStep: FlowStep = {
    id: "contact",
    question: "Where should we send your personalized results?",
    type: "contact",
  };

  return [goalStep, ...qualifySteps, contactStep];
}

const LeadCaptureFlow = ({ funnelId, funnelType, funnelCategory, ctaText, variant = "hero", accentColor = "hsl(160 84% 39%)", borderRadius = "12px", ctaStyle = "pill" }: LeadCaptureFlowProps) => {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Contact form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactError, setContactError] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  const steps = getFlowSteps(funnelType, funnelCategory);
  const progress = submitted ? 100 : Math.round((currentStep / steps.length) * 100);

  useEffect(() => {
    if (active && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [currentStep, active]);

  const handleChoice = (option: string) => {
    const step = steps[currentStep];
    if (!step.field) return;
    const newAnswers = { ...answers, [step.field]: option };
    setAnswers(newAnswers);
    setTimeout(() => setCurrentStep((s) => s + 1), 200);
  };

  const handleContactSubmit = async () => {
    setContactError("");
    const trimName = name.trim();
    const trimEmail = email.trim();

    if (!trimName) { setContactError("Please enter your name."); return; }
    const emailResult = z.string().email().safeParse(trimEmail);
    if (!emailResult.success) { setContactError("Please enter a valid email."); return; }

    setSubmitting(true);

    const leadData = {
      funnel_id: funnelId,
      name: trimName,
      email: trimEmail,
      phone: phone.trim() || null,
      budget: answers.budget || null,
      timeline: answers.timeline || null,
      financing_status: answers.financing_status || null,
      intent: answers.intent || funnelType,
      temperature: getTemperature(answers.timeline),
      urgency_score: getUrgencyScore(answers.timeline),
    };

    const { data: captureResult, error } = await supabase
      .rpc('capture_lead', {
        p_funnel_id: funnelId,
        p_lead_data: leadData,
      }) as { data: any; error: any };
    setSubmitting(false);

    if (error) {
      setContactError("Something went wrong. Please try again.");
    } else if (captureResult && !captureResult.success) {
      if (captureResult.error === 'lead_limit_reached') {
        // Silently log — show success to prospect (limit is agent's constraint)
        console.warn('Lead limit reached for funnel', funnelId);
      }
      // Always show success to the prospect
      setSubmitted(true);
    } else {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div ref={containerRef}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto funnel-card rounded-2xl p-8 text-center funnel-shadow-cta"
          style={{ border: "1px solid hsl(160 84% 39% / 0.2)" }}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accentColor.replace(")", " / 0.1)")}` }}>
            <CheckCircle2 size={28} style={{ color: accentColor }} />
          </div>
          <h3 className="font-display text-xl font-bold funnel-fg mb-2">You're All Set!</h3>
          <p className="text-sm funnel-fg-muted">
            Check your inbox — your personalized results are on the way.
          </p>
        </motion.div>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setActive(true)}
          className="group inline-flex items-center gap-2.5 px-8 py-4 font-semibold text-base active:scale-[0.97] transition-all hover:brightness-110"
          style={{
            backgroundColor: ctaStyle === "outline" ? "transparent" : accentColor,
            color: ctaStyle === "outline"
              ? accentColor
              : getContrastTextColor(accentColor) === 'white' ? '#ffffff' : 'hsl(220 26% 9%)',
            border: ctaStyle === "outline" ? `2px solid ${accentColor}` : "none",
            borderRadius: ctaStyle === "pill" ? "999px" : ctaStyle === "square" ? "6px" : borderRadius,
            boxShadow: ctaStyle === "outline" ? "none" : `0 0 24px ${accentColor.replace(")", " / 0.25)")}`,
          }}
        >
          {ctaText || "Get Started"}
          <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        {variant === "hero" && (
          <p className="text-xs funnel-fg-muted" style={{ opacity: 0.6 }}>Takes less than 60 seconds • No spam, ever</p>
        )}
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div ref={containerRef} className="max-w-md mx-auto w-full">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs funnel-fg-muted">
            Step {currentStep + 1} of {steps.length}
          </span>
          <span className="text-xs funnel-accent font-medium">{progress}%</span>
        </div>
      <div className="h-1.5 rounded-full w-full" style={{ backgroundColor: "hsl(var(--funnel-border))" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: accentColor }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25 }}
          className="funnel-card rounded-2xl p-6 funnel-shadow-card"
          style={{ border: "1px solid hsl(var(--funnel-border))" }}
        >
          <h3 className="font-display text-lg font-semibold funnel-fg mb-5">
            {step.question}
          </h3>

          {step.type === "choice" && step.options && (
            <div className="space-y-2.5">
              {step.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleChoice(opt)}
                  className="group w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium funnel-fg active:scale-[0.98] transition-all touch-target"
                  style={{
                    backgroundColor: "hsl(var(--funnel-bg-alt))",
                    border: "1px solid hsl(var(--funnel-border))",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${accentColor.replace(")", " / 0.3)")}`;
                    e.currentTarget.style.backgroundColor = `${accentColor.replace(")", " / 0.05)")}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--funnel-border))";
                    e.currentTarget.style.backgroundColor = "hsl(var(--funnel-bg-alt))";
                  }}
                >
                  <span>{opt}</span>
                  <ChevronRight size={16} className="funnel-fg-muted group-hover:funnel-accent transition-colors" />
                </button>
              ))}
            </div>
          )}

          {step.type === "contact" && (
            <div className="space-y-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name *"
                className="w-full rounded-xl px-4 py-3 text-sm funnel-fg outline-none transition-colors"
                style={{
                  backgroundColor: "hsl(var(--funnel-bg-alt))",
                  border: "1px solid hsl(var(--funnel-border))",
                  color: "hsl(var(--funnel-fg))",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = `${accentColor.replace(")", " / 0.3)")}`}
                onBlur={(e) => e.currentTarget.style.borderColor = "hsl(var(--funnel-border))"}
                autoFocus
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address *"
                className="w-full rounded-xl px-4 py-3 text-sm funnel-fg outline-none transition-colors"
                style={{
                  backgroundColor: "hsl(var(--funnel-bg-alt))",
                  border: "1px solid hsl(var(--funnel-border))",
                  color: "hsl(var(--funnel-fg))",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = `${accentColor.replace(")", " / 0.3)")}`}
                onBlur={(e) => e.currentTarget.style.borderColor = "hsl(var(--funnel-border))"}
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (optional)"
                className="w-full rounded-xl px-4 py-3 text-sm funnel-fg outline-none transition-colors"
                style={{
                  backgroundColor: "hsl(var(--funnel-bg-alt))",
                  border: "1px solid hsl(var(--funnel-border))",
                  color: "hsl(var(--funnel-fg))",
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = `${accentColor.replace(")", " / 0.3)")}`}
                onBlur={(e) => e.currentTarget.style.borderColor = "hsl(var(--funnel-border))"}
              />
              {contactError && (
                <p className="text-xs text-destructive">{contactError}</p>
              )}

              {/* Compliance opt-in */}
              <div className="rounded-lg p-3" style={{ backgroundColor: "hsl(var(--funnel-bg-alt))" }}>
                <p className="text-[11px] funnel-fg-muted leading-relaxed">
                  By submitting, you agree to receive personalized property information and follow-up communications via email and SMS.
                  You can opt out at any time. We respect your privacy and never sell your data.
                  <a href="#" className="funnel-accent ml-1 underline underline-offset-2">Privacy Policy</a>
                </p>
              </div>

              <button
                onClick={handleContactSubmit}
                disabled={submitting}
                className="w-full py-3.5 font-semibold text-sm active:scale-[0.97] transition-all disabled:opacity-60 flex items-center justify-center gap-2 touch-target hover:brightness-110"
                style={{
                  backgroundColor: accentColor,
                  color: getContrastTextColor(accentColor) === 'white' ? '#ffffff' : 'hsl(220 26% 9%)',
                  borderRadius: ctaStyle === "pill" ? "999px" : ctaStyle === "square" ? "6px" : borderRadius,
                  boxShadow: `0 0 24px ${accentColor.replace(")", " / 0.25)")}`,
                }}
              >
                {submitting ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    Get My Results
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <div className="flex items-center justify-center gap-3 pt-1">
                <span className="text-[10px] funnel-fg-muted" style={{ opacity: 0.5 }}>🔒 256-bit encrypted</span>
                <span className="text-[10px] funnel-fg-muted" style={{ opacity: 0.5 }}>•</span>
                <span className="text-[10px] funnel-fg-muted" style={{ opacity: 0.5 }}>No spam, ever</span>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Back button */}
      {currentStep > 0 && (
        <button
          onClick={() => setCurrentStep((s) => s - 1)}
          className="mt-3 text-xs funnel-fg-muted hover:funnel-fg transition-colors mx-auto block"
        >
          ← Go back
        </button>
      )}
    </div>
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
    case "Just browsing": return 15;
    default: return 10;
  }
}

export default LeadCaptureFlow;
