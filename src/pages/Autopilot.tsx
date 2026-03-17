import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Zap, Clock, MessageSquare, Mail, Phone, CheckCircle2, XCircle,
  AlertTriangle, RefreshCw, Loader2, ChevronRight, Send, Shield,
  Brain, Calendar, ToggleLeft, ToggleRight, Mic, Sliders
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueueStats {
  pending: number;
  scheduled: number;
  sent: number;
  failed: number;
}

interface RecentOutreach {
  id: string;
  channel: string;
  status: string;
  body: string;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
  delivery_error: string | null;
  trigger_reason: string | null;
  lead_name?: string;
}

const Autopilot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [queueStats, setQueueStats] = useState<QueueStats>({ pending: 0, scheduled: 0, sent: 0, failed: 0 });
  const [recentItems, setRecentItems] = useState<RecentOutreach[]>([]);
  const [settings, setSettings] = useState<{
    auto_send_enabled: boolean;
    max_daily_messages: number;
    quiet_hours_start: number;
    quiet_hours_end: number;
    timezone: string;
    confidence_threshold: number;
    voice_enabled: boolean;
  } | null>(null);
  const [twilioConnected, setTwilioConnected] = useState(true); // Platform-managed
  const [resendConnected, setResendConnected] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    if (!user) return;
    setLoading(true);

    const [statsRes, recentRes, settingsRes] = await Promise.all([
      // Queue stats
      Promise.all([
        supabase.from("outreach_queue").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "pending"),
        supabase.from("outreach_queue").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "scheduled"),
        supabase.from("outreach_queue").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "sent"),
        supabase.from("outreach_queue").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "failed"),
      ]),
      // Recent outreach
      supabase
        .from("outreach_queue")
        .select("id, channel, status, body, created_at, scheduled_at, sent_at, delivery_error, trigger_reason, lead_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
      // Agent settings
      supabase
        .from("agent_settings")
        .select("auto_send_enabled, max_daily_messages, quiet_hours_start, quiet_hours_end, timezone, confidence_threshold, voice_enabled")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    setQueueStats({
      pending: statsRes[0].count || 0,
      scheduled: statsRes[1].count || 0,
      sent: statsRes[2].count || 0,
      failed: statsRes[3].count || 0,
    });

    // Enrich recent items with lead names
    const items = recentRes.data || [];
    if (items.length > 0) {
      const leadIds = [...new Set(items.map((i: any) => i.lead_id))];
      const { data: leads } = await supabase
        .from("funnel_leads")
        .select("id, name")
        .in("id", leadIds);
      const leadMap = new Map((leads || []).map((l: any) => [l.id, l.name]));
      setRecentItems(items.map((i: any) => ({ ...i, lead_name: leadMap.get(i.lead_id) || "Unknown" })));
    } else {
      setRecentItems([]);
    }

    setSettings(settingsRes.data || null);

    // Twilio is platform-managed (always available), Resend pending domain setup
    setTwilioConnected(true);
    // resendConnected stays false until RESEND_API_KEY is configured

    setLoading(false);
  };

  const toggleAutoSend = async () => {
    if (!user) return;
    setToggling(true);
    const newValue = !settings?.auto_send_enabled;

    if (settings) {
      await supabase
        .from("agent_settings")
        .update({ auto_send_enabled: newValue })
        .eq("user_id", user.id);
    } else {
      await supabase
        .from("agent_settings")
        .insert({ user_id: user.id, auto_send_enabled: newValue });
    }

    setSettings((prev) => prev ? { ...prev, auto_send_enabled: newValue } : {
      auto_send_enabled: newValue,
      max_daily_messages: 3,
      quiet_hours_start: 21,
      quiet_hours_end: 8,
      timezone: "America/New_York",
      confidence_threshold: 70,
      voice_enabled: false,
    });
    toast({ title: newValue ? "Autopilot enabled" : "Autopilot paused" });
    setToggling(false);
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle2 size={12} className="text-success" />;
      case "failed": return <XCircle size={12} className="text-destructive" />;
      case "scheduled": return <Clock size={12} className="text-primary" />;
      case "pending": return <Loader2 size={12} className="text-muted-foreground" />;
      default: return <AlertTriangle size={12} className="text-warm" />;
    }
  };

  const channelIcon = (channel: string) => {
    switch (channel) {
      case "sms": return <MessageSquare size={12} />;
      case "email": return <Mail size={12} />;
      case "call": return <Phone size={12} />;
      default: return <Send size={12} />;
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "Just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const autonomousModules = [
    {
      name: "Voice Agent",
      desc: "AI voice calls with shared memory & call summaries",
      schedule: "On-demand",
      icon: Mic,
      active: !!settings?.voice_enabled,
    },
    {
      name: "Lead Scheduler",
      desc: "Scans leads by temperature and drafts AI messages",
      schedule: "Every 30 minutes",
      icon: Brain,
      active: !!settings?.auto_send_enabled,
    },
    {
      name: "Outreach Processor",
      desc: "Delivers queued SMS (Twilio) and email (Resend)",
      schedule: "Every 5 minutes",
      icon: Send,
      active: !!settings?.auto_send_enabled && (twilioConnected || resendConnected),
    },
    {
      name: "Confidence Gate",
      desc: `Auto-sends only when AI confidence ≥ ${settings?.confidence_threshold || 70}%`,
      schedule: "Always",
      icon: Shield,
      active: !!settings?.auto_send_enabled,
    },
    {
      name: "Lead Intelligence",
      desc: "AI scoring, verification, and next-step recommendations",
      schedule: "On-demand",
      icon: Brain,
      active: true,
    },
    {
      name: "Tour Scheduling",
      desc: "Automated tour booking and calendar sync",
      schedule: "Real-time",
      icon: Calendar,
      active: true,
    },
  ];

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center h-64">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">Autonomous Features</h1>
            <p className="text-xs text-muted-foreground mt-0.5">AI-powered automation status & controls</p>
          </div>
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-xl bg-secondary active:scale-95 transition-transform"
          >
            <RefreshCw size={16} className="text-foreground" />
          </button>
        </div>

        {/* Master Toggle */}
        <div className="bg-gradient-card rounded-xl p-4 border border-border shadow-card mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${settings?.auto_send_enabled ? "bg-primary/15" : "bg-secondary"}`}>
                <Zap size={20} className={settings?.auto_send_enabled ? "text-primary" : "text-muted-foreground"} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-foreground">Autopilot Mode</h2>
                <p className="text-[10px] text-muted-foreground">
                  {settings?.auto_send_enabled ? "AI is actively engaging leads" : "Paused — messages draft only"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleAutoSend}
              disabled={toggling}
              className="active:scale-95 transition-transform"
            >
              {settings?.auto_send_enabled ? (
                <ToggleRight size={32} className="text-primary" />
              ) : (
                <ToggleLeft size={32} className="text-muted-foreground" />
              )}
            </button>
          </div>
          {settings && (
            <div className="space-y-3 mt-3 pt-3 border-t border-border">
              <div className="flex gap-3">
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Daily Limit</p>
                  <p className="text-sm font-semibold text-foreground">{settings.max_daily_messages}</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Quiet Hours</p>
                  <p className="text-sm font-semibold text-foreground">{settings.quiet_hours_start}:00–{settings.quiet_hours_end}:00</p>
                </div>
                <div className="flex-1 text-center">
                  <p className="text-[10px] text-muted-foreground">Timezone</p>
                  <p className="text-sm font-semibold text-foreground truncate">{settings.timezone?.split("/")[1] || settings.timezone}</p>
                </div>
              </div>
              {/* Confidence Threshold */}
              <div className="bg-secondary/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sliders size={12} className="text-primary" />
                    <span className="text-[10px] font-semibold text-foreground">Confidence Threshold</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{settings.confidence_threshold}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">
                  Auto-send only when AI confidence exceeds this level
                </p>
                <input
                  type="range"
                  min={30}
                  max={95}
                  step={5}
                  value={settings.confidence_threshold}
                  onChange={async (e) => {
                    const val = Number(e.target.value);
                    setSettings(prev => prev ? { ...prev, confidence_threshold: val } : prev);
                    if (user) {
                      await supabase.from("agent_settings").update({ confidence_threshold: val }).eq("user_id", user.id);
                    }
                  }}
                  className="w-full h-1.5 bg-border rounded-full appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] text-muted-foreground">Aggressive (30%)</span>
                  <span className="text-[9px] text-muted-foreground">Conservative (95%)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Providers Status */}
        <div className="mb-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 px-1">Delivery Channels</h3>
          <div className="grid grid-cols-2 gap-2.5">
            <div className={`rounded-xl p-3 border ${twilioConnected ? "bg-success/5 border-success/20" : "bg-secondary border-border"}`}>
              <div className="flex items-center gap-2 mb-1">
                <MessageSquare size={14} className={twilioConnected ? "text-success" : "text-muted-foreground"} />
                <span className="text-xs font-semibold text-foreground">Twilio SMS</span>
              </div>
              <span className={`text-[10px] font-medium ${twilioConnected ? "text-success" : "text-muted-foreground"}`}>
                {twilioConnected ? "● Connected" : "○ Not connected"}
              </span>
            </div>
            <div className={`rounded-xl p-3 border ${resendConnected ? "bg-success/5 border-success/20" : "bg-secondary border-border"}`}>
              <div className="flex items-center gap-2 mb-1">
                <Mail size={14} className={resendConnected ? "text-success" : "text-muted-foreground"} />
                <span className="text-xs font-semibold text-foreground">Resend Email</span>
              </div>
              <span className={`text-[10px] font-medium ${resendConnected ? "text-success" : "text-muted-foreground"}`}>
                {resendConnected ? "● Connected" : "○ Not connected"}
              </span>
            </div>
          </div>
        </div>

        {/* Queue Stats */}
        <div className="mb-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 px-1">Outreach Queue</h3>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Pending", value: queueStats.pending, color: "text-muted-foreground" },
              { label: "Scheduled", value: queueStats.scheduled, color: "text-primary" },
              { label: "Sent", value: queueStats.sent, color: "text-success" },
              { label: "Failed", value: queueStats.failed, color: "text-destructive" },
            ].map((stat) => (
              <div key={stat.label} className="bg-gradient-card rounded-xl p-3 border border-border text-center">
                <p className={`font-display text-lg font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous Modules */}
        <div className="mb-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 px-1">Autonomous Modules</h3>
          <div className="space-y-2">
            {autonomousModules.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-gradient-card rounded-xl p-3.5 border border-border shadow-card"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${mod.active ? "bg-primary/15" : "bg-secondary"}`}>
                    <mod.icon size={16} className={mod.active ? "text-primary" : "text-muted-foreground"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-foreground">{mod.name}</h4>
                      <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        mod.active ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
                      }`}>
                        {mod.active ? "ACTIVE" : "IDLE"}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{mod.desc}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock size={10} />
                      {mod.schedule}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-5">
          <h3 className="font-display text-sm font-semibold text-foreground mb-2 px-1">Recent Activity</h3>
          {recentItems.length === 0 ? (
            <div className="bg-gradient-card rounded-xl p-6 border border-border text-center">
              <Zap size={24} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No outreach activity yet</p>
              <p className="text-[10px] text-muted-foreground mt-1">Enable autopilot and connect Twilio/Resend to start</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="bg-gradient-card rounded-xl p-3 border border-border shadow-card"
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex items-center gap-1.5">
                      {channelIcon(item.channel)}
                      {statusIcon(item.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{item.lead_name}</span>
                        <span className="text-[10px] text-muted-foreground">{formatTime(item.created_at)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{item.body}</p>
                      {item.delivery_error && (
                        <p className="text-[10px] text-destructive mt-1 flex items-center gap-1">
                          <AlertTriangle size={10} /> {item.delivery_error}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium capitalize ${
                          item.status === "sent" ? "bg-success/10 text-success" :
                          item.status === "failed" ? "bg-destructive/10 text-destructive" :
                          item.status === "scheduled" ? "bg-primary/10 text-primary" :
                          "bg-secondary text-muted-foreground"
                        }`}>
                          {item.status}
                        </span>
                        {item.trigger_reason && (
                          <span className="text-[9px] text-muted-foreground capitalize">
                            {item.trigger_reason.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MobileShell>
  );
};

export default Autopilot;
