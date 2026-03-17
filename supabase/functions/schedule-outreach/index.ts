import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ─── Smart Delay Logic ──────────────────────────────────────────────
// Returns the delay in minutes before the first outreach should fire,
// based on lead temperature. This creates a natural, human-like cadence.

function getSmartDelayMinutes(
  temperature: string | null,
  isFirstOutreach: boolean,
  agentSettings: { quiet_hours_start: number; quiet_hours_end: number; timezone: string }
): number {
  if (!isFirstOutreach) {
    // Follow-ups use longer delays based on temperature
    switch (temperature) {
      case "hot": return 120;       // 2 hours between follow-ups
      case "warm": return 360;      // 6 hours
      case "cold": return 1440;     // 24 hours
      default: return 720;          // 12 hours fallback
    }
  }

  // First outreach: mimic a responsive but human agent
  switch (temperature) {
    case "hot": return 5;           // 5 minutes — fast but not instant
    case "warm": return 60;         // 1 hour — feels natural
    case "cold": return 180;        // 3 hours — low priority
    default: return 30;             // 30 minutes fallback
  }
}

// Convert a UTC date to approximate local hour given a timezone UTC offset.
// We use a simple mapping for common US timezones to avoid Intl overhead in Deno.
function getTimezoneOffsetHours(timezone: string): number {
  const offsets: Record<string, number> = {
    "America/New_York": -5,
    "America/Chicago": -6,
    "America/Denver": -7,
    "America/Los_Angeles": -8,
    "America/Phoenix": -7,
    "America/Anchorage": -9,
    "Pacific/Honolulu": -10,
  };
  return offsets[timezone] ?? -5; // Default to ET
}

// Check if a target send time falls within quiet hours (in agent's local timezone).
// If so, push to the next available window (quiet_hours_end local time).
function adjustForQuietHours(
  scheduledAt: Date,
  quietStart: number,
  quietEnd: number,
  timezone: string
): Date {
  const offset = getTimezoneOffsetHours(timezone);
  // Get the local hour by applying the UTC offset
  let localHour = (scheduledAt.getUTCHours() + offset + 24) % 24;

  const inQuiet = quietStart > quietEnd
    ? (localHour >= quietStart || localHour < quietEnd)   // e.g. 21–8 wraps midnight
    : (localHour >= quietStart && localHour < quietEnd);

  if (inQuiet) {
    // Calculate how many hours until quietEnd in local time
    const adjusted = new Date(scheduledAt);
    // Convert quietEnd (local) back to UTC
    const quietEndUTC = (quietEnd - offset + 24) % 24;
    
    if (localHour >= quietStart) {
      // Past start → push to end on next day
      adjusted.setUTCDate(adjusted.getUTCDate() + 1);
    }
    adjusted.setUTCHours(quietEndUTC, 0, 0, 0);
    return adjusted;
  }

  return scheduledAt;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const queued: string[] = [];

  try {
    // Get all users with auto-send enabled
    const { data: agents } = await supabase
      .from("agent_settings")
      .select("user_id, max_daily_messages, quiet_hours_start, quiet_hours_end, timezone")
      .eq("auto_send_enabled", true);

    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({ queued: 0, message: "No agents with auto-send enabled" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const agent of agents) {
      // Find leads needing follow-up:
      // Hot/warm leads with no outreach in the last 24h
      // Cold leads with no outreach in the last 72h
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const threeDaysAgo = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();

      // Get user's funnels to scope their leads
      const { data: funnels } = await supabase
        .from("funnels")
        .select("id")
        .eq("user_id", agent.user_id);

      if (!funnels || funnels.length === 0) continue;
      const funnelIds = funnels.map((f: { id: string }) => f.id);

      // Get leads that may need follow-up
      const { data: leads } = await supabase
        .from("funnel_leads")
        .select("id, name, email, phone, temperature, budget, timeline, intent, financing_status, urgency_score, funnel_id, created_at")
        .in("funnel_id", funnelIds)
        .not("status", "eq", "closed")
        .order("urgency_score", { ascending: false, nullsFirst: false })
        .limit(50);

      if (!leads || leads.length === 0) continue;

      for (const lead of leads) {
        // Check if there's already a pending/scheduled message
        const { count: pendingCount } = await supabase
          .from("outreach_queue")
          .select("*", { count: "exact", head: true })
          .eq("lead_id", lead.id)
          .eq("user_id", agent.user_id)
          .in("status", ["pending", "scheduled"]);

        if ((pendingCount || 0) > 0) continue;

        // Check last outreach timestamp
        const { data: lastOutreach } = await supabase
          .from("outreach_queue")
          .select("sent_at, created_at")
          .eq("lead_id", lead.id)
          .eq("user_id", agent.user_id)
          .eq("status", "sent")
          .order("sent_at", { ascending: false })
          .limit(1);

        const lastSentAt = lastOutreach?.[0]?.sent_at || lastOutreach?.[0]?.created_at;
        const isHotOrWarm = lead.temperature === "hot" || lead.temperature === "warm";
        const threshold = isHotOrWarm ? oneDayAgo : threeDaysAgo;

        // Skip if recently contacted
        if (lastSentAt && lastSentAt > threshold) continue;

        // Determine action type
        const hasConversation = !!lastSentAt;
        const isFirstOutreach = !hasConversation;
        const isCold = lead.temperature === "cold";
        let action: string;
        if (isFirstOutreach) {
          action = "draft_initial_outreach";
        } else if (isCold) {
          action = "draft_reactivation";
        } else {
          action = "draft_follow_up";
        }

        // Determine channel
        const channel = lead.phone ? "sms" : lead.email ? "email" : null;
        if (!channel) continue;

        // Call autonomous-outreach to draft the message
        try {
          const outreachRes = await fetch(`${supabaseUrl}/functions/v1/autonomous-outreach`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${supabaseKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, lead_id: lead.id, channel }),
          });

          if (!outreachRes.ok) {
            console.error(`Failed to draft for lead ${lead.id}: ${outreachRes.status}`);
            continue;
          }

          const { result } = await outreachRes.json();
          if (!result?.body) continue;

          // ─── Smart Delay Calculation ───────────────────────────
          const delayMinutes = getSmartDelayMinutes(
            lead.temperature,
            isFirstOutreach,
            {
              quiet_hours_start: agent.quiet_hours_start,
              quiet_hours_end: agent.quiet_hours_end,
              timezone: agent.timezone || "America/New_York",
            }
          );

          let scheduledDate = new Date(Date.now() + delayMinutes * 60 * 1000);

          // Adjust if the scheduled time lands in quiet hours
          scheduledDate = adjustForQuietHours(
            scheduledDate,
            agent.quiet_hours_start,
            agent.quiet_hours_end,
            agent.timezone || "America/New_York"
          );

          const scheduledAt = scheduledDate.toISOString();

          console.log(`Lead ${lead.name} (${lead.temperature}) → ${delayMinutes}min delay → scheduled at ${scheduledAt} [${action}]`);

          // Insert into outreach queue
          await supabase.from("outreach_queue").insert({
            lead_id: lead.id,
            user_id: agent.user_id,
            channel,
            subject: result.subject || null,
            body: result.body,
            ai_generated: true,
            status: "scheduled",
            scheduled_at: scheduledAt,
            trigger_reason: action,
            metadata: {
              tone: result.tone,
              hook_type: result.hook_type,
              best_time_to_send: result.best_time_to_send,
              smart_delay_minutes: delayMinutes,
              temperature_at_schedule: lead.temperature,
            },
          });

          queued.push(lead.id);
        } catch (e) {
          console.error(`Error drafting for lead ${lead.id}:`, e);
        }
      }
    }

    return new Response(JSON.stringify({ queued: queued.length, lead_ids: queued }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("schedule-outreach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
