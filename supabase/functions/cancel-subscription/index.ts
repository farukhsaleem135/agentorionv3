import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get user's subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, tier, cancel_at_period_end")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!sub || sub.tier === "free") {
      return new Response(
        JSON.stringify({ error: "No active paid subscription to cancel" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!stripeSecretKey) {
      // Dev mode — simulate cancel at period end
      await supabase
        .from("subscriptions")
        .update({ cancel_at_period_end: true })
        .eq("user_id", user.id);

      return new Response(
        JSON.stringify({
          mode: "dev",
          message: "Subscription will cancel at end of billing period",
          cancel_at_period_end: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!sub.stripe_subscription_id) {
      return new Response(
        JSON.stringify({ error: "No Stripe subscription found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Real Stripe cancellation at period end
    const Stripe = (await import("npm:stripe@14.14.0")).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    // Update local record
    await supabase
      .from("subscriptions")
      .update({
        cancel_at_period_end: true,
        current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
      })
      .eq("user_id", user.id);

    return new Response(
      JSON.stringify({
        message: "Subscription will cancel at end of billing period",
        cancel_at_period_end: true,
        current_period_end: new Date(updated.current_period_end * 1000).toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("cancel-subscription error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
