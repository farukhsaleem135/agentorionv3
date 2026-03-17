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

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { data: connection } = await supabase
      .from("integration_connections").select("credentials, status")
      .eq("user_id", userId).eq("provider", "mls").single();

    if (!connection || connection.status !== "connected") {
      return new Response(
        JSON.stringify({ error: "MLS/IDX is not connected." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const creds = connection.credentials as { api_key: string; api_secret?: string; mls_id?: string };

    // RESO Web API / SimplyRETS compatible endpoint
    const mlsUrl = "https://api.simplyrets.com/properties?limit=50";
    const mlsResponse = await fetch(mlsUrl, {
      headers: {
        Authorization: `Basic ${btoa(creds.api_key + ":" + (creds.api_secret || ""))}`,
        "Content-Type": "application/json",
      },
    });

    if (!mlsResponse.ok) {
      const errBody = await mlsResponse.text();
      return new Response(
        JSON.stringify({ error: `MLS API error [${mlsResponse.status}]: ${errBody}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const properties = await mlsResponse.json();
    let synced = 0;

    for (const prop of (Array.isArray(properties) ? properties : []).slice(0, 50)) {
      const address = prop.address
        ? `${prop.address.streetNumberText || ""} ${prop.address.streetName || ""}, ${prop.address.city || ""}`.trim()
        : null;
      if (!address) continue;

      const price = prop.listPrice ? `$${Number(prop.listPrice).toLocaleString()}` : null;
      const beds = prop.property?.bedrooms || null;
      const baths = prop.property?.bathsFull || null;
      const sqft = prop.property?.area ? String(prop.property.area) : null;

      // Check if listing already exists by address
      const { data: existing } = await supabase
        .from("listings").select("id").eq("user_id", userId).eq("address", address).maybeSingle();

      if (existing) {
        await supabase.from("listings").update({ price, beds, baths, sqft, status: "active" }).eq("id", existing.id);
      } else {
        await supabase.from("listings").insert({
          user_id: userId, address, price, beds, baths, sqft, status: "active", views: 0, days_on_market: 0,
        });
      }
      synced++;
    }

    await supabase.from("integration_connections")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("user_id", userId).eq("provider", "mls");

    return new Response(
      JSON.stringify({ success: true, synced, total: Array.isArray(properties) ? properties.length : 0 }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("sync-mls error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
