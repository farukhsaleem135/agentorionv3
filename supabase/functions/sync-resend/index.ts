import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    // Get Resend credentials from integration_connections
    const { data: connection } = await supabase
      .from("integration_connections")
      .select("credentials")
      .eq("user_id", user.id)
      .eq("provider", "resend")
      .eq("status", "connected")
      .single();

    if (!connection?.credentials) {
      return new Response(JSON.stringify({ error: "Resend not connected" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const creds = connection.credentials as Record<string, string>;
    const { api_key } = creds;

    if (!api_key) {
      return new Response(JSON.stringify({ error: "Missing Resend API key" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate credentials by fetching domains
    const resendRes = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${api_key}` },
    });

    if (!resendRes.ok) {
      const errBody = await resendRes.text();
      return new Response(JSON.stringify({ error: "Invalid Resend API key", details: errBody }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const domains = await resendRes.json();

    // Update last_synced_at
    await supabase
      .from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "resend");

    return new Response(JSON.stringify({
      status: "ok",
      domains: domains.data?.length ?? 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
