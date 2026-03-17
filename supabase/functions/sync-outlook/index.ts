import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      .eq("user_id", userId).eq("provider", "outlook").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "Outlook is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string };
    const body = await req.json().catch(() => ({}));
    const action = body.action || "list";

    if (action === "list") {
      const msResponse = await fetch(
        "https://graph.microsoft.com/v1.0/me/events?$top=50&$orderby=start/dateTime&$filter=start/dateTime ge '" + new Date().toISOString() + "'",
        { headers: { Authorization: `Bearer ${creds.api_key}` } }
      );

      if (!msResponse.ok) {
        const errBody = await msResponse.text();
        return new Response(
          JSON.stringify({ error: `Microsoft Graph API error [${msResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const msData = await msResponse.json();
      const events = (msData.value || []).map((e: any) => ({
        id: e.id,
        subject: e.subject,
        start: e.start?.dateTime,
        end: e.end?.dateTime,
        location: e.location?.displayName,
      }));

      await supabase.from("integration_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId).eq("provider", "outlook");

      return new Response(
        JSON.stringify({ success: true, events, total: events.length }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "create" && body.event) {
      const msResponse = await fetch("https://graph.microsoft.com/v1.0/me/events", {
        method: "POST",
        headers: { Authorization: `Bearer ${creds.api_key}`, "Content-Type": "application/json" },
        body: JSON.stringify(body.event),
      });

      if (!msResponse.ok) {
        const errBody = await msResponse.text();
        return new Response(
          JSON.stringify({ error: `Microsoft Graph API error [${msResponse.status}]: ${errBody}` }),
          { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const created = await msResponse.json();
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
    console.error("sync-outlook error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
