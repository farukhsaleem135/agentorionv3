import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { data: connection } = await supabase
      .from("integration_connections").select("credentials, status")
      .eq("user_id", userId).eq("provider", "google_cal").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "Google Calendar is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string; calendar_id?: string };
    const calendarId = encodeURIComponent(creds.calendar_id || "primary");
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      // List upcoming events
      const now = new Date().toISOString();
      const gcalResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now}&maxResults=50&orderBy=startTime&singleEvents=true`,
        { headers: { Authorization: `Bearer ${creds.api_key}` } }
      );

      if (!gcalResponse.ok) {
        const errBody = await gcalResponse.text();
        return new Response(
          JSON.stringify({ error: `Google Calendar API error [${gcalResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const gcalData = await gcalResponse.json();
      const events = (gcalData.items || []).map((e: any) => ({
        id: e.id,
        summary: e.summary,
        start: e.start?.dateTime || e.start?.date,
        end: e.end?.dateTime || e.end?.date,
        location: e.location,
      }));

      await supabase.from("integration_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId).eq("provider", "google_cal");

      return new Response(
        JSON.stringify({ success: true, events, total: events.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create" && body.event) {
      // Create a new calendar event (for tour scheduling)
      const gcalResponse = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${creds.api_key}`, "Content-Type": "application/json" },
          body: JSON.stringify(body.event),
        }
      );

      if (!gcalResponse.ok) {
        const errBody = await gcalResponse.text();
        return new Response(
          JSON.stringify({ error: `Google Calendar API error [${gcalResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const created = await gcalResponse.json();
      return new Response(
        JSON.stringify({ success: true, event_id: created.id }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'list' or 'create'." }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-google-calendar error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
