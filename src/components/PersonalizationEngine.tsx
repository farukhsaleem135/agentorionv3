import { useState, useMemo } from "react";
import {
  Brain, MessageSquare, Mail, Phone, Clock, Sparkles,
  ToggleRight, ToggleLeft
} from "lucide-react";

interface PersonalizationPrefs {
  preferredChannel: "sms" | "email" | "call" | "auto";
  bestTimeSlot: "morning" | "afternoon" | "evening" | "auto";
  scriptLength: "short" | "medium" | "long" | "auto";
  tonePreference: "casual" | "professional" | "friendly" | "auto";
  autoFollowUp: boolean;
  smartTiming: boolean;
  behaviorTracking: boolean;
}

const PersonalizationEngine = () => {
  const [prefs, setPrefs] = useState<PersonalizationPrefs>({
    preferredChannel: "auto",
    bestTimeSlot: "auto",
    scriptLength: "auto",
    tonePreference: "auto",
    autoFollowUp: true,
    smartTiming: true,
    behaviorTracking: true,
  });

  const channelOptions: { id: PersonalizationPrefs["preferredChannel"]; icon: typeof MessageSquare; label: string }[] = [
    { id: "auto", icon: Brain, label: "AI Decides" },
    { id: "sms", icon: MessageSquare, label: "SMS First" },
    { id: "email", icon: Mail, label: "Email First" },
    { id: "call", icon: Phone, label: "Call First" },
  ];

  const timeOptions: { id: PersonalizationPrefs["bestTimeSlot"]; label: string; range: string }[] = [
    { id: "auto", label: "AI Optimized", range: "Based on lead behavior" },
    { id: "morning", label: "Morning", range: "8am – 12pm" },
    { id: "afternoon", label: "Afternoon", range: "12pm – 5pm" },
    { id: "evening", label: "Evening", range: "5pm – 9pm" },
  ];

  const toneOptions: { id: PersonalizationPrefs["tonePreference"]; label: string }[] = [
    { id: "auto", label: "AI Match" },
    { id: "casual", label: "Casual" },
    { id: "friendly", label: "Friendly" },
    { id: "professional", label: "Formal" },
  ];

  const lengthOptions: { id: PersonalizationPrefs["scriptLength"]; label: string }[] = [
    { id: "auto", label: "AI Pick" },
    { id: "short", label: "Short" },
    { id: "medium", label: "Medium" },
    { id: "long", label: "Detailed" },
  ];

  const toggles: { key: keyof PersonalizationPrefs; label: string; desc: string }[] = [
    { key: "autoFollowUp", label: "Auto Follow-Up", desc: "AI sends follow-ups when leads go quiet" },
    { key: "smartTiming", label: "Smart Send Timing", desc: "Deliver messages when leads are most active" },
    { key: "behaviorTracking", label: "Behavior Learning", desc: "AI adapts to each lead's interaction patterns" },
  ];

  const insightText = useMemo(() => {
    const channelMap = { auto: "the best channel per lead", sms: "SMS", email: "email", call: "phone calls" };
    const timeMap = { auto: "AI-optimized windows", morning: "morning (8am–12pm)", afternoon: "afternoon (12pm–5pm)", evening: "evening (5pm–9pm)" };
    const toneMap = { auto: "an AI-matched tone", casual: "a casual tone", friendly: "a friendly tone", professional: "a formal tone" };
    const lengthMap = { auto: "AI-selected length", short: "short scripts", medium: "medium-length scripts", long: "detailed scripts" };

    const parts = [
      `AI will reach leads via ${channelMap[prefs.preferredChannel]} during ${timeMap[prefs.bestTimeSlot]}, using ${toneMap[prefs.tonePreference]} with ${lengthMap[prefs.scriptLength]}.`,
    ];

    const features: string[] = [];
    if (prefs.autoFollowUp) features.push("auto follow-ups");
    if (prefs.smartTiming) features.push("smart send timing");
    if (prefs.behaviorTracking) features.push("behavior learning");

    if (features.length > 0) {
      parts.push(`Active enhancements: ${features.join(", ")}.`);
    } else {
      parts.push("All AI enhancements are currently disabled.");
    }

    return parts.join(" ");
  }, [prefs]);

  return (
    <div className="space-y-4">
      {/* AI Status */}
      <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Brain size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Personalization Engine</p>
              <p className="text-[10px] text-muted-foreground">Learning from your leads' behavior</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] text-success font-semibold">Active</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-secondary rounded-lg p-2 text-center">
            <p className="font-display text-sm font-bold text-foreground">47</p>
            <p className="text-[9px] text-muted-foreground">Patterns learned</p>
          </div>
          <div className="bg-secondary rounded-lg p-2 text-center">
            <p className="font-display text-sm font-bold text-success">+18%</p>
            <p className="text-[9px] text-muted-foreground">Response rate lift</p>
          </div>
          <div className="bg-secondary rounded-lg p-2 text-center">
            <p className="font-display text-sm font-bold text-foreground">2.4x</p>
            <p className="text-[9px] text-muted-foreground">Conversion boost</p>
          </div>
        </div>
      </div>

      {/* Channel Preference */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Preferred Outreach Channel</p>
        <div className="grid grid-cols-4 gap-1.5">
          {channelOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setPrefs(p => ({ ...p, preferredChannel: opt.id }))}
              className={`flex flex-col items-center gap-1 py-2.5 rounded-xl text-[10px] font-medium transition-all ${
                prefs.preferredChannel === opt.id
                  ? "bg-primary/10 border border-primary/30 text-primary"
                  : "bg-secondary border border-transparent text-muted-foreground"
              }`}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Preference */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Best Contact Window</p>
        <div className="space-y-1.5">
          {timeOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setPrefs(p => ({ ...p, bestTimeSlot: opt.id }))}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                prefs.bestTimeSlot === opt.id
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={12} className={prefs.bestTimeSlot === opt.id ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-xs font-medium ${prefs.bestTimeSlot === opt.id ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground">{opt.range}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone & Length */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Tone</p>
          <div className="space-y-1">
            {toneOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPrefs(p => ({ ...p, tonePreference: opt.id }))}
                className={`w-full py-2 rounded-lg text-[11px] font-medium transition-all ${
                  prefs.tonePreference === opt.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border shadow-card">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Script Length</p>
          <div className="space-y-1">
            {lengthOptions.map(opt => (
              <button
                key={opt.id}
                onClick={() => setPrefs(p => ({ ...p, scriptLength: opt.id }))}
                className={`w-full py-2 rounded-lg text-[11px] font-medium transition-all ${
                  prefs.scriptLength === opt.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Toggles */}
      <div className="bg-card rounded-xl border border-border shadow-card divide-y divide-border">
        {toggles.map(t => (
          <button
            key={t.key}
            onClick={() => setPrefs(p => ({ ...p, [t.key]: !p[t.key] }))}
            className="w-full flex items-center justify-between p-4 active:bg-secondary/30 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-foreground text-left">{t.label}</p>
              <p className="text-[11px] text-muted-foreground text-left">{t.desc}</p>
            </div>
            {(prefs[t.key] as boolean) ? (
              <ToggleRight size={24} className="text-primary shrink-0" />
            ) : (
              <ToggleLeft size={24} className="text-muted-foreground shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* AI Insight */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={12} className="text-primary" />
          <span className="text-[10px] text-primary font-semibold uppercase tracking-wider">Engine Insight</span>
        </div>
        <p className="text-xs text-foreground/80 leading-relaxed">
          {insightText}
        </p>
      </div>
    </div>
  );
};

export default PersonalizationEngine;
