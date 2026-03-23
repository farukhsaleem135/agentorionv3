import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Brain, MessageSquare, Mail, Phone, Clock, Sparkles, ArrowRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AIPrefs {
  preferredChannel: string;
  preferredTimeSlot: string;
  tonePreference: string;
  scriptLength: string;
}

const PersonalizationEngine = () => {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<AIPrefs>({
    preferredChannel: "auto",
    preferredTimeSlot: "auto",
    tonePreference: "auto",
    scriptLength: "auto",
  });
  const [loaded, setLoaded] = useState(false);

  // Load from DB
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("agent_settings")
        .select("preferred_channel, preferred_time_slot, tone_preference, script_length")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        setPrefs({
          preferredChannel: (data as any).preferred_channel ?? "auto",
          preferredTimeSlot: (data as any).preferred_time_slot ?? "auto",
          tonePreference: (data as any).tone_preference ?? "auto",
          scriptLength: (data as any).script_length ?? "auto",
        });
      }
      setLoaded(true);
    })();
  }, [user]);

  // Save to DB
  const save = useCallback(async (updated: AIPrefs) => {
    if (!user) return;
    const { error } = await supabase
      .from("agent_settings")
      .upsert({
        user_id: user.id,
        preferred_channel: updated.preferredChannel,
        preferred_time_slot: updated.preferredTimeSlot,
        tone_preference: updated.tonePreference,
        script_length: updated.scriptLength,
      } as any, { onConflict: "user_id" });
    if (error) toast.error("Failed to save preference");
  }, [user]);

  const update = (patch: Partial<AIPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    save(next);
  };

  const channelOptions: { id: string; icon: typeof MessageSquare; label: string }[] = [
    { id: "auto", icon: Brain, label: "AI Decides" },
    { id: "sms", icon: MessageSquare, label: "SMS First" },
    { id: "email", icon: Mail, label: "Email First" },
    { id: "call", icon: Phone, label: "Call First" },
  ];

  const timeOptions: { id: string; label: string; range: string }[] = [
    { id: "auto", label: "AI Optimized", range: "Based on lead behavior" },
    { id: "morning", label: "Morning", range: "8am – 12pm" },
    { id: "afternoon", label: "Afternoon", range: "12pm – 5pm" },
    { id: "evening", label: "Evening", range: "5pm – 9pm" },
  ];

  const toneOptions: { id: string; label: string }[] = [
    { id: "auto", label: "AI Match" },
    { id: "casual", label: "Casual" },
    { id: "friendly", label: "Friendly" },
    { id: "professional", label: "Formal" },
  ];

  const lengthOptions: { id: string; label: string }[] = [
    { id: "auto", label: "AI Pick" },
    { id: "short", label: "Short" },
    { id: "medium", label: "Medium" },
    { id: "long", label: "Detailed" },
  ];

  if (!loaded) return null;

  return (
    <div className="space-y-4">
      {/* Autopilot link */}
      <Link
        to="/autopilot"
        className="flex items-center justify-between bg-primary/5 rounded-xl p-4 border border-primary/10 hover:bg-primary/10 transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          <span className="text-xs text-foreground font-medium">
            Autopilot outreach settings are managed on the Autopilot page.
          </span>
        </div>
        <ArrowRight size={14} className="text-primary group-hover:translate-x-0.5 transition-transform" />
      </Link>

      {/* Channel Preference */}
      <div className="bg-card rounded-xl p-4 border border-border shadow-card">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-3">Preferred Outreach Channel</p>
        <div className="grid grid-cols-4 gap-1.5">
          {channelOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => update({ preferredChannel: opt.id })}
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
              onClick={() => update({ preferredTimeSlot: opt.id })}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                prefs.preferredTimeSlot === opt.id
                  ? "bg-primary/10 border border-primary/30"
                  : "bg-secondary border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock size={12} className={prefs.preferredTimeSlot === opt.id ? "text-primary" : "text-muted-foreground"} />
                <span className={`text-xs font-medium ${prefs.preferredTimeSlot === opt.id ? "text-foreground" : "text-muted-foreground"}`}>{opt.label}</span>
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
                onClick={() => update({ tonePreference: opt.id })}
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
                onClick={() => update({ scriptLength: opt.id })}
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
    </div>
  );
};

export default PersonalizationEngine;
