import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Google label to relationship_type mapping
function mapGoogleLabel(label: string): string {
  const lower = label.toLowerCase();
  if (lower.includes("client")) return "past_client";
  if (lower.includes("family") || lower.includes("friend")) return "personal";
  if (lower.includes("work") || lower.includes("business") || lower.includes("colleague")) return "professional";
  return "sphere";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Get the user from the auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get agent's Google OAuth token from integration_connections
    const { data: conn } = await supabase
      .from("integration_connections")
      .select("credentials")
      .eq("user_id", user.id)
      .eq("provider", "google_contacts")
      .eq("status", "connected")
      .maybeSingle();

    if (!conn?.credentials) {
      return new Response(
        JSON.stringify({
          error: "google_not_connected",
          message: "Google Contacts is not connected. Please set up Google OAuth first.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = conn.credentials as any;
    const accessToken = creds.access_token;
    if (!accessToken) {
      return new Response(
        JSON.stringify({ error: "missing_access_token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch contacts from Google People API
    const peopleUrl =
      "https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers,memberships&pageSize=1000";

    const googleRes = await fetch(peopleUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleRes.ok) {
      const errBody = await googleRes.text();
      console.error("Google People API error:", errBody);
      return new Response(
        JSON.stringify({ error: "google_api_error", details: errBody }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const googleData = await googleRes.json();
    const connections = googleData.connections || [];

    // Get agent's profile id
    const { data: profile } = await supabase
      .from("profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!profile) {
      return new Response(
        JSON.stringify({ error: "profile_not_found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get existing contacts for dedup
    const { data: existingContacts } = await supabase
      .from("contacts")
      .select("email, phone")
      .eq("agent_id", profile.id);

    const existingEmails = new Set((existingContacts || []).map((c: any) => c.email?.toLowerCase()).filter(Boolean));
    const existingPhones = new Set((existingContacts || []).map((c: any) => c.phone).filter(Boolean));

    const toInsert: any[] = [];

    for (const person of connections) {
      const names = person.names || [];
      const emails = person.emailAddresses || [];
      const phones = person.phoneNumbers || [];
      const memberships = person.memberships || [];

      const displayName = names[0]?.displayName;
      const email = emails[0]?.value;
      const phone = phones[0]?.value;

      // Must have name + (email or phone)
      if (!displayName || (!email && !phone)) continue;

      // Dedup check
      if (email && existingEmails.has(email.toLowerCase())) continue;
      if (phone && existingPhones.has(phone)) continue;

      // Map labels
      let relType = "sphere";
      for (const m of memberships) {
        const label = m.contactGroupMembership?.contactGroupResourceName || "";
        if (label && !label.includes("myContacts")) {
          // Try to get the group name from the label
          const groupName = m.contactGroupMembership?.formattedName || "";
          if (groupName) {
            relType = mapGoogleLabel(groupName);
            break;
          }
        }
      }

      toInsert.push({
        agent_id: profile.id,
        full_name: displayName,
        email: email || null,
        phone: phone || null,
        relationship_type: relType,
        source: "google_import",
      });

      // Track for dedup within batch
      if (email) existingEmails.add(email.toLowerCase());
      if (phone) existingPhones.add(phone);
    }

    // Batch insert
    if (toInsert.length > 0) {
      const { error: insertError } = await supabase.from("contacts").insert(toInsert);
      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "insert_failed", details: insertError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update last_synced_at
    await supabase
      .from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google_contacts");

    return new Response(
      JSON.stringify({ success: true, imported_count: toInsert.length, total_scanned: connections.length }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "internal_error", message: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
