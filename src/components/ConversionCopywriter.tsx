import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check, Sparkles, Loader2, MessageSquare, Mail, Phone, Instagram, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import IntakeFields, { type IntakeValues, buildIntakeContext } from "@/components/IntakeFields";

interface ConversionCopywriterProps {
  open: boolean;
  onClose: () => void;
}

type Channel = "sms" | "email" | "call" | "social";

const channels: { id: Channel; label: string; icon: typeof MessageSquare; desc: string }[] = [
  { id: "sms", label: "SMS", icon: MessageSquare, desc: "Short & direct" },
  { id: "email", label: "Email", icon: Mail, desc: "Nurture sequence" },
  { id: "call", label: "Call Script", icon: Phone, desc: "Objection handling" },
  { id: "social", label: "Social", icon: Instagram, desc: "Captions & hooks" },
];

interface GeneratedCopy {
  primary: string;
  variant: string;
  tips: string[];
}

const channelPrompts: Record<Channel, string> = {
  sms: "Write 2 high-response SMS scripts for a real estate agent following up with a new lead. Version A: short & urgent. Version B: friendly & personal. Each under 160 chars. Add 2 timing tips.",
  email: "Write 2 email variants for a real estate nurture sequence (Subject + Body). Version A: value-driven with market stats. Version B: personal story approach. Add 2 subject line tips.",
  call: "Write 2 cold call opening scripts for a real estate agent. Version A: direct & confident. Version B: rapport-building. Include 1 objection handler each. Add 2 delivery tips.",
  social: "Write 2 Instagram/Facebook post captions for a real estate agent. Version A: listing hook (15s script). Version B: market insight. Include hashtag suggestions. Add 2 engagement tips.",
};

const ConversionCopywriter = ({ open, onClose }: ConversionCopywriterProps) => {
  const [channel, setChannel] = useState<Channel>("sms");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedCopy | null>(null);
  const [copied, setCopied] = useState<"primary" | "variant" | null>(null);
  const [brandCtx, setBrandCtx] = useState("");
  const [intake, setIntake] = useState<IntakeValues>({ audience: "", area: "", tone: "", propertyType: "", priceRange: "" });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("company_name, phone, website").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => {
        if (data?.company_name) {
          setBrandCtx(`\nThe agent's business is "${data.company_name}"${data.phone ? `, phone: ${data.phone}` : ""}${data.website ? `, website: ${data.website}` : ""}. Incorporate the brand name naturally.`);
        }
      });
  }, [user]);

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);

    try {
      const intakeCtx = buildIntakeContext(intake);
      const audienceSection = intakeCtx ? `\n\nAUDIENCE & MARKET CONTEXT (use these to deeply customize the copy):\n${intakeCtx}` : "";
      const resp = await supabase.functions.invoke("generate-content", {
        body: { type: "conversion-copy", context: channelPrompts[channel] + brandCtx + audienceSection },
      });

      if (resp.data?.body) {
        const body = resp.data.body as string;
        const sections = body.split(/version b|variant b|---/i);
        const tipsMatch = body.match(/tip[s]?:?\s*\n([\s\S]*?)$/i);
        const tips = tipsMatch
          ? tipsMatch[1].split("\n").filter(l => l.trim()).map(l => l.replace(/^[-•*\d.]\s*/, "")).slice(0, 3)
          : ["Test different send times", "Personalize with the lead's name"];

        setResult({
          primary: sections[0]?.replace(/version a|variant a/i, "").trim() || body.slice(0, body.length / 2),
          variant: sections[1]?.trim() || "Regenerate for a different variant",
          tips,
        });
      } else {
        // Fallback content
        const fallbacks: Record<Channel, GeneratedCopy> = {
          sms: {
            primary: "Hi {name}, just saw a home hit the market in {area} that matches your criteria. Want me to send details? Reply YES",
            variant: "Hey {name}! 👋 Quick question — are you still looking in {area}? I have some off-market options that might interest you.",
            tips: ["Send between 10am–12pm for highest response rates", "Keep under 160 characters for deliverability"],
          },
          email: {
            primary: "Subject: {area} Market Just Shifted — Here's What It Means For You\n\nHi {name},\n\nThe {area} market moved this week — median price shifted and 3 new listings dropped below asking. I compiled the key numbers and 2 properties that match what you're looking for.\n\nWant me to set up viewings this weekend?",
            variant: "Subject: I Found Something You'll Love in {area}\n\nHi {name},\n\nI was touring properties yesterday and walked into one that immediately reminded me of what you described. Here's why...",
            tips: ["Personalized subject lines get 26% more opens", "Send Tuesday–Thursday for best engagement"],
          },
          call: {
            primary: "Hi {name}, this is {agent} — I'm reaching out because you expressed interest in {area}. I've got some insights on the market there that I think you'll find valuable. Do you have 2 minutes?",
            variant: "Hey {name}! I'm {agent}, a local agent in {area}. I noticed you were browsing properties there — I actually just helped a client find an amazing deal nearby. Would love to share what I'm seeing. Good time?",
            tips: ["Call within 5 minutes of lead capture for 9x higher contact rate", "Mirror the lead's energy and pace"],
          },
          social: {
            primary: "🏡 Just hit the market in {area}!\n\n3 bed | 2 bath | Completely renovated kitchen\nPrice? You won't believe it. 👀\n\nDM me 'DETAILS' for the full walkthrough video.\n\n#RealEstate #{area} #JustListed #DreamHome",
            variant: "📊 {area} Market Update:\n\n✅ Median price: up 3.2% MoM\n✅ Days on market: down to 18\n✅ New listings this week: 12\n\nWhat does this mean for buyers? Thread 🧵👇\n\n#RealEstateMarket #{area}Housing #MarketUpdate",
            tips: ["Post between 6–9pm for highest engagement", "Use a hook in the first line — no filler"],
          },
        };
        setResult(fallbacks[channel]);
      }
    } catch {
      toast({ title: "Generation failed", variant: "destructive" });
    }
    setGenerating(false);
  };

  const handleCopy = async (type: "primary" | "variant") => {
    if (!result) return;
    await navigator.clipboard.writeText(type === "primary" ? result.primary : result.variant);
    setCopied(type);
    toast({ title: "Copied!" });
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[75] bg-background/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute inset-0 bg-card flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-border">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">Conversion Copywriter</h2>
                <p className="text-xs text-muted-foreground">AI-generated scripts with A/B variants</p>
              </div>
              <button onClick={onClose} className="p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform">
                <X size={18} className="text-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-auto px-5 py-4 space-y-5">
              {/* Channel selector */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
                {channels.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setChannel(c.id); setResult(null); }}
                    className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[11px] font-medium transition-all shrink-0 ${
                      channel === c.id
                        ? "bg-primary/10 border border-primary/30 text-primary"
                        : "bg-secondary border border-border text-muted-foreground"
                    }`}
                  >
                    <c.icon size={16} />
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Intake fields */}
              <IntakeFields values={intake} onChange={setIntake} />

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={generating || !intake.audience.trim()}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground font-semibold text-sm shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Writing scripts...</>
                ) : (
                  <><Sparkles size={16} /> Generate {channels.find(c => c.id === channel)?.label} Copy</>
                )}
              </button>

              {/* Results */}
              {result && (
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Version A */}
                  <div className="bg-gradient-card rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary text-[10px] font-bold">VERSION A</span>
                      <button onClick={() => handleCopy("primary")} className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform">
                        {copied === "primary" ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.primary}</p>
                  </div>

                  {/* Version B */}
                  <div className="bg-gradient-card rounded-xl p-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-full bg-info/15 text-info text-[10px] font-bold">VERSION B</span>
                      <button onClick={() => handleCopy("variant")} className="p-1.5 rounded-lg bg-secondary active:scale-95 transition-transform">
                        {copied === "variant" ? <Check size={12} className="text-success" /> : <Copy size={12} className="text-muted-foreground" />}
                      </button>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line">{result.variant}</p>
                  </div>

                  {/* Tips */}
                  <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Conversion Tips</p>
                    {result.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 py-1">
                        <Sparkles size={10} className="text-primary mt-1 shrink-0" />
                        <span className="text-xs text-foreground/80">{tip}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-secondary text-foreground text-sm font-medium active:scale-[0.97] transition-transform"
                  >
                    <RefreshCw size={14} /> Regenerate Both Variants
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConversionCopywriter;
