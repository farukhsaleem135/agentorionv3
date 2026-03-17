import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface OutreachItem {
  id: string;
  lead_id: string;
  user_id: string;
  channel: string;
  subject: string | null;
  body: string;
  scheduled_at: string | null;
  status: string;
  attempts: number;
  max_attempts: number;
  metadata: Record<string, unknown> | null;
}

interface AgentSettings {
  quiet_hours_start: number;
  quiet_hours_end: number;
  max_daily_messages: number;
  auto_send_enabled: boolean;
  timezone: string;
}

// ─── Delivery Providers ─────────────────────────────────────────────

async function sendSMS(
  phone: string,
  body: string,
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Use platform-managed Twilio credentials
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromPhone) {
    return { success: false, error: "Twilio platform credentials not configured" };
  }

  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: phone, From: fromPhone, Body: body }),
      }
    );
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message || `Twilio error ${res.status}` };
    return { success: true, id: data.sid };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "SMS send failed" };
  }
}

async function sendEmail(
  to: string,
  subject: string,
  body: string,
): Promise<{ success: boolean; id?: string; error?: string }> {
  // Use platform-managed Resend credentials
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Agent OS <noreply@resend.dev>";

  if (!apiKey) {
    return { success: false, error: "Resend platform credentials not configured" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromEmail,
        to: [to],
        subject: subject || "Following up with you",
        html: `<p>${body.replace(/\n/g, "<br/>")}</p>`,
      }),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.message || `Resend error ${res.status}` };
    return { success: true, id: data.id };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Email send failed" };
  }
}

// ─── Guardrails ─────────────────────────────────────────────────────

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
  return offsets[timezone] ?? -5;
}

function isQuietHours(settings: AgentSettings): boolean {
  const now = new Date();
  const offset = getTimezoneOffsetHours(settings.timezone || "America/New_York");
  const localHour = (now.getUTCHours() + offset + 24) % 24;
  const { quiet_hours_start, quiet_hours_end } = settings;
  if (quiet_hours_start > quiet_hours_end) {
    return localHour >= quiet_hours_start || localHour < quiet_hours_end;
  }
  return localHour >= quiet_hours_start && localHour < quiet_hours_end;
}

async function getDailyMessageCount(
  supabase: ReturnType<typeof createClient>,
  leadId: string,
  userId: string
): Promise<number> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("outreach_queue")
    .select("*", { count: "exact", head: true })
    .eq("lead_id", leadId)
    .eq("user_id", userId)
    .eq("status", "sent")
    .gte("sent_at", todayStart.toISOString());

  return count || 0;
}

// ─── Main Handler ───────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const results: Array<{ id: string; status: string; detail?: string }> = [];

  try {
    // Fetch pending/scheduled items ready to send
    const now = new Date().toISOString();
    const { data: queue, error: qErr } = await supabase
      .from("outreach_queue")
      .select("*")
      .in("status", ["pending", "scheduled"])
      .or(`scheduled_at.is.null,scheduled_at.lte.${now}`)
      .lt("attempts", 3)
      .order("created_at", { ascending: true })
      .limit(20);

    if (qErr) throw qErr;
    if (!queue || queue.length === 0) {
      return new Response(JSON.stringify({ processed: 0, message: "Queue empty" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    for (const item of queue as OutreachItem[]) {
      // Get agent settings for guardrails
      const { data: settingsRow } = await supabase
        .from("agent_settings")
        .select("quiet_hours_start, quiet_hours_end, max_daily_messages, auto_send_enabled, timezone")
        .eq("user_id", item.user_id)
        .single();

      const settings: AgentSettings = settingsRow || {
        quiet_hours_start: 21,
        quiet_hours_end: 8,
        max_daily_messages: 3,
        auto_send_enabled: false,
        timezone: "America/New_York",
      };

      // Guardrail: auto-send must be enabled
      if (!settings.auto_send_enabled) {
        results.push({ id: item.id, status: "skipped", detail: "Auto-send disabled for this user" });
        continue;
      }

      // Guardrail: quiet hours
      if (isQuietHours(settings)) {
        results.push({ id: item.id, status: "deferred", detail: "Quiet hours — will retry later" });
        continue;
      }

      // Guardrail: daily limit
      const dailyCount = await getDailyMessageCount(supabase, item.lead_id, item.user_id);
      if (dailyCount >= settings.max_daily_messages) {
        results.push({ id: item.id, status: "deferred", detail: `Daily limit reached (${settings.max_daily_messages})` });
        continue;
      }

      // Get lead contact info
      const { data: lead } = await supabase
        .from("funnel_leads")
        .select("email, phone, name")
        .eq("id", item.lead_id)
        .single();

      if (!lead) {
        await supabase.from("outreach_queue").update({ status: "failed", delivery_error: "Lead not found", attempts: item.attempts + 1, last_attempt_at: now }).eq("id", item.id);
        results.push({ id: item.id, status: "failed", detail: "Lead not found" });
        continue;
      }

      let deliveryResult: { success: boolean; id?: string; error?: string };

      if (item.channel === "sms") {
        if (!lead.phone) {
          await supabase.from("outreach_queue").update({ status: "failed", delivery_error: "No phone number", attempts: item.attempts + 1, last_attempt_at: now }).eq("id", item.id);
          results.push({ id: item.id, status: "failed", detail: "No phone number" });
          continue;
        }
        // Normalize to E.164 for Twilio
        const digits = lead.phone.replace(/\D/g, "");
        let e164Phone: string;
        if (digits.length === 10) {
          e164Phone = `+1${digits}`;
        } else if (digits.length === 11 && digits.startsWith("1")) {
          e164Phone = `+${digits}`;
        } else if (lead.phone.startsWith("+")) {
          e164Phone = lead.phone;
        } else {
          e164Phone = `+1${digits}`; // Best-effort for US
        }
        deliveryResult = await sendSMS(e164Phone, item.body);
      } else {
        // email or fallback
        if (!lead.email) {
          await supabase.from("outreach_queue").update({ status: "failed", delivery_error: "No email address", attempts: item.attempts + 1, last_attempt_at: now }).eq("id", item.id);
          results.push({ id: item.id, status: "failed", detail: "No email address" });
          continue;
        }
        deliveryResult = await sendEmail(lead.email, item.subject || "Following up", item.body);
      }

      if (deliveryResult.success) {
        // Mark sent
        await supabase.from("outreach_queue").update({
          status: "sent",
          sent_at: now,
          delivery_provider: item.channel === "sms" ? "twilio" : "resend",
          delivery_id: deliveryResult.id,
          attempts: item.attempts + 1,
          last_attempt_at: now,
        }).eq("id", item.id);

        // Log to conversation history (shared memory)
        await supabase.from("lead_conversations").insert({
          lead_id: item.lead_id,
          role: "agent",
          content: item.body,
          channel: item.channel,
          direction: "outbound",
          metadata: { auto_sent: true, delivery_id: deliveryResult.id },
        });

        results.push({ id: item.id, status: "sent" });
      } else {
        // Handle delivery failure
        const newAttempts = item.attempts + 1;
        const newStatus = newAttempts >= item.max_attempts ? "failed" : "pending";
        await supabase.from("outreach_queue").update({
          status: newStatus,
          delivery_error: deliveryResult.error,
          attempts: newAttempts,
          last_attempt_at: now,
        }).eq("id", item.id);

        results.push({ id: item.id, status: newStatus, detail: deliveryResult.error });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("process-outreach-queue error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
