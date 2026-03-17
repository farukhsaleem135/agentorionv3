import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import {
  BookOpen, Palette, Type, Volume2, Target, CheckCircle2,
  XCircle, Sparkles, ArrowRight, Eye
} from "lucide-react";
import { useState } from "react";

const brandColors = [
  { name: "Emerald (Primary CTA)", hsl: "152 82% 48%", hex: "#1DCB6E", usage: "CTAs, action buttons, active states" },
  { name: "Gold (Brand Accent)", hsl: "36 100% 56%", hex: "#E6A817", usage: "Brand identity, avatars, badges" },
  { name: "Deep Navy", hsl: "222 35% 7%", hex: "#0C1018", usage: "Backgrounds, base layer" },
  { name: "Slate", hsl: "224 30% 9%", hex: "#111724", usage: "Cards, elevated surfaces" },
  { name: "Steel", hsl: "215 15% 50%", hex: "#6B7A8D", usage: "Muted text, secondary info" },
  { name: "Ivory", hsl: "210 25% 96%", hex: "#F0F3F7", usage: "Primary text, headings" },
  { name: "Success Green", hsl: "152 76% 42%", hex: "#1AB365", usage: "Success, positive indicators" },
  { name: "Crimson", hsl: "0 76% 50%", hex: "#E02020", usage: "Errors, hot leads, destructive" },
  { name: "Azure", hsl: "205 90% 52%", hex: "#1A8FE3", usage: "Info, links, secondary accent" },
];

const typographySystem = [
  { name: "Display", family: "Space Grotesk", weights: "500–700", usage: "Headlines, scores, numbers" },
  { name: "Body", family: "Inter", weights: "400–600", usage: "Body text, labels, descriptions" },
];

const voicePillars = [
  { do: "Sound confident and data-driven", dont: "Sound uncertain or vague" },
  { do: "Be direct — lead with the insight", dont: "Bury the value in jargon" },
  { do: "Use active, growth-focused language", dont: "Use passive or fear-based language" },
  { do: "Personalize with lead/market context", dont: "Use generic filler or clichés" },
  { do: "Keep mobile-friendly (short sentences)", dont: "Write walls of text" },
];

const messagingPillars = [
  { pillar: "Lead Generation", tagline: "Your pipeline, always full.", desc: "Position the agent as proactive, not reactive." },
  { pillar: "Lead Conversion", tagline: "Every lead, optimized.", desc: "AI-driven follow-ups that never drop the ball." },
  { pillar: "Agent Empowerment", tagline: "Your unfair advantage.", desc: "Tools that multiply an agent's effectiveness." },
  { pillar: "Automation", tagline: "Always on. Always working.", desc: "Systems that run while you sleep." },
  { pillar: "Market Intelligence", tagline: "Know before they know.", desc: "Real-time data that drives smarter decisions." },
];

const BrandBible = () => {
  const [activeSection, setActiveSection] = useState<string>("identity");

  const sections = [
    { id: "identity", label: "Identity", icon: BookOpen },
    { id: "visual", label: "Visual", icon: Palette },
    { id: "type", label: "Typography", icon: Type },
    { id: "voice", label: "Voice", icon: Volume2 },
    { id: "messaging", label: "Messaging", icon: Target },
  ];

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="mb-5">
          <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-1">Brand Bible</p>
          <h1 className="wordmark wordmark-nav">
            <span className="wordmark-agent">AGENT</span>
            <span className="wordmark-orion">ORION</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">The definitive guide to our brand identity, visual language, and communication standards.</p>
        </div>

        {/* Section tabs */}
        <div className="flex gap-1 overflow-x-auto pb-2 -mx-1 px-1 mb-5">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeSection === s.id
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "bg-secondary border border-border text-muted-foreground"
              }`}
            >
              <s.icon size={12} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Identity */}
        {activeSection === "identity" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Mission</p>
              <p className="text-sm text-foreground leading-relaxed">
                To give every real estate agent the AI-powered tools to generate, convert, and close leads at a pace that was previously only possible for large teams.
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Vision</p>
              <p className="text-sm text-foreground leading-relaxed">
                A world where every agent operates like a top 1% producer — with predictive intelligence, automated systems, and conversion-optimized marketing running 24/7.
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Brand Promise</p>
              <p className="text-sm text-foreground leading-relaxed font-medium">
                "Your leads. Your market. Your unfair advantage."
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Positioning</p>
              <p className="text-sm text-foreground leading-relaxed">
                AgentOrion is the AI-native lead engine for modern real estate agents. Unlike passive CRMs or portal-dependent lead sellers, AgentOrion proactively generates, scores, and converts leads through automated funnels, predictive intelligence, and behavior-driven messaging.
              </p>
            </div>
            <div className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Differentiators</p>
              <div className="space-y-2">
                {[
                  "AI-first: Intelligence is native, not bolted on",
                  "Mobile-native: Built for agents in the field",
                  "Predictive: Acts before the agent asks",
                  "Full-funnel: Generation → Nurture → Close",
                  "Always-on: Automation that never sleeps",
                ].map((d, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Sparkles size={12} className="text-primary mt-0.5 shrink-0" />
                    <span className="text-xs text-foreground/80">{d}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Visual */}
        {activeSection === "visual" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Color Palette</p>
              <div className="space-y-2">
                {brandColors.map(c => (
                  <div key={c.name} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg border border-border shrink-0"
                      style={{ backgroundColor: `hsl(${c.hsl})` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{c.hex} · {c.hsl}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground text-right shrink-0 max-w-[100px]">{c.usage}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Gradients</p>
              <div className="space-y-2">
                <div className="h-12 rounded-lg bg-gradient-cta" />
                <p className="text-[10px] text-muted-foreground">Emerald → Teal (Primary CTA, action buttons)</p>
                <div className="h-12 rounded-lg bg-gradient-gold" />
                <p className="text-[10px] text-muted-foreground">Gold → Amber (Brand accent, avatars, badges)</p>
                <div className="h-12 rounded-lg" style={{ background: "linear-gradient(135deg, hsl(36 100% 56%), hsl(16 90% 50%))" }} />
                <p className="text-[10px] text-muted-foreground">Gold → Coral (Premium accent, upgrade triggers)</p>
                <div className="h-12 rounded-lg bg-gradient-card border border-border" />
                <p className="text-[10px] text-muted-foreground">Card gradient (elevated surfaces, data cards)</p>
              </div>
            </div>

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Motion Language</p>
              <div className="space-y-2 text-xs text-foreground/80">
                <p>• <strong>Enters:</strong> slide-up + fade (0.3s ease-out)</p>
                <p>• <strong>Modals:</strong> spring (stiffness: 400, damping: 30)</p>
                <p>• <strong>Presses:</strong> scale(0.95–0.98) on active</p>
                <p>• <strong>Indicators:</strong> pulse animation (2s infinite)</p>
                <p>• <strong>Shimmer:</strong> background sweep for loading states</p>
              </div>
            </div>

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Spacing System</p>
              <div className="space-y-1 text-xs text-foreground/80">
                <p>• <strong>Page padding:</strong> 20px (px-5)</p>
                <p>• <strong>Card padding:</strong> 16px (p-4)</p>
                <p>• <strong>Section gap:</strong> 16px (space-y-4)</p>
                <p>• <strong>Touch targets:</strong> 44px minimum</p>
                <p>• <strong>Border radius:</strong> 12px (cards), 8px (inputs), full (tags)</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Typography */}
        {activeSection === "type" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {typographySystem.map(t => (
              <div key={t.name} className="bg-gradient-card rounded-xl p-5 border border-border shadow-card">
                <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">{t.name}</p>
                <p className={`text-2xl font-bold text-foreground mb-2 ${t.name === "Display" ? "font-display" : "font-sans"}`}>
                  {t.family}
                </p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Weights: {t.weights}</span>
                  <span>·</span>
                  <span>{t.usage}</span>
                </div>
                <div className="mt-3 space-y-1">
                  <p className={`text-xl font-bold ${t.name === "Display" ? "font-display" : "font-sans"}`}>The quick brown fox</p>
                  <p className={`text-base font-medium ${t.name === "Display" ? "font-display" : "font-sans"}`}>jumps over the lazy dog</p>
                  <p className={`text-sm ${t.name === "Display" ? "font-display" : "font-sans"}`}>0123456789 — $485,000</p>
                </div>
              </div>
            ))}

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Scale</p>
              <div className="space-y-2">
                {[
                  { size: "text-2xl", label: "2xl — Page titles, scores", sample: "Growth Score: 87" },
                  { size: "text-lg", label: "lg — Section headers", sample: "AI Lead Intelligence" },
                  { size: "text-sm", label: "sm — Body, labels", sample: "Conversion rate: 4.2%" },
                  { size: "text-xs", label: "xs — Meta, captions", sample: "Last updated 2 min ago" },
                  { size: "text-[10px]", label: "10px — Tags, badges", sample: "HOT · PRE-APPROVED" },
                ].map(s => (
                  <div key={s.size} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                    <span className={`${s.size} font-medium text-foreground`}>{s.sample}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Voice */}
        {activeSection === "voice" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Tone Attributes</p>
              <div className="flex flex-wrap gap-2">
                {["Confident", "Growth-driven", "Professional", "AI-native", "Trustworthy", "Action-oriented"].map(t => (
                  <span key={t} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">{t}</span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">Do / Don't</p>
              <div className="space-y-3">
                {voicePillars.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 gap-2">
                    <div className="flex items-start gap-1.5 bg-success/5 rounded-lg p-2.5">
                      <CheckCircle2 size={12} className="text-success mt-0.5 shrink-0" />
                      <span className="text-[11px] text-foreground">{v.do}</span>
                    </div>
                    <div className="flex items-start gap-1.5 bg-destructive/5 rounded-lg p-2.5">
                      <XCircle size={12} className="text-destructive mt-0.5 shrink-0" />
                      <span className="text-[11px] text-foreground">{v.dont}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-3">AI Assistant Personality</p>
              <div className="space-y-2 text-xs text-foreground/80">
                <p>The AI assistant speaks as a <strong>strategic partner</strong>, not a chatbot. It:</p>
                <p>• Leads with data — "Your lead opened 3 emails this week"</p>
                <p>• Suggests actions — "Send this SMS now — they're online"</p>
                <p>• Explains why — "Hot leads contacted within 5 min convert 9x more"</p>
                <p>• Never hedges — "Call now" not "You might consider calling"</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Messaging */}
        {activeSection === "messaging" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {messagingPillars.map((p, i) => (
              <motion.div
                key={p.pillar}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-card rounded-xl p-4 border border-border shadow-card"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target size={14} className="text-primary" />
                  <p className="text-sm font-semibold text-foreground">{p.pillar}</p>
                </div>
                <p className="font-display text-base font-bold text-primary mb-1">"{p.tagline}"</p>
                <p className="text-xs text-muted-foreground">{p.desc}</p>
              </motion.div>
            ))}

            <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-[10px] text-primary font-semibold uppercase tracking-widest mb-2">Microcopy Rules</p>
              <div className="space-y-1.5 text-xs text-foreground/80">
                <p>• Button text: verb-first, 2-3 words max ("Get Started", "See Leads")</p>
                <p>• Empty states: helpful + next action ("No leads yet → Create your first funnel")</p>
                <p>• Toasts: past tense + brief ("Lead imported!", "Profile updated")</p>
                <p>• Errors: what happened + what to do ("Connection failed — check API key")</p>
                <p>• AI outputs: always end with a clear next step</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </MobileShell>
  );
};

export default BrandBible;
