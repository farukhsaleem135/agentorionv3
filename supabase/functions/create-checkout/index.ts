import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    // Auth check
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

    const { plan } = await req.json();

    if (!["growth", "pro", "team", "brokerage"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!stripeSecretKey) {
      // Stripe not configured yet — simulate upgrade for development
      const tierMap: Record<string, { max_seats: number; extra_seat_price: number }> = {
        growth: { max_seats: 1, extra_seat_price: 0 },
        pro: { max_seats: 1, extra_seat_price: 0 },
        team: { max_seats: 5, extra_seat_price: 25 },
        brokerage: { max_seats: 20, extra_seat_price: 15 },
      };

      const config = tierMap[plan];

      await supabase
        .from("subscriptions")
        .update({
          tier: plan,
          status: "active",
          max_seats: config.max_seats,
          extra_seat_price: config.extra_seat_price,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        })
        .eq("user_id", user.id);

      // For team/brokerage, redirect to team setup wizard
      const redirectPath = ["team", "brokerage"].includes(plan) ? "/team-setup" : "/";

      return new Response(
        JSON.stringify({ 
          mode: "dev", 
          message: "Stripe not configured — subscription upgraded directly",
          redirect: redirectPath,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // --- Real Stripe checkout ---
    const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
    const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

    const appOrigin = Deno.env.get("APP_ORIGIN") || "https://agentorionv3.lovable.app";

    // Price lookup — you'd create these in Stripe dashboard
    const priceMap: Record<string, string> = {
      growth: Deno.env.get("STRIPE_PRICE_GROWTH") || "",
      pro: Deno.env.get("STRIPE_PRICE_PRO") || "",
      team: Deno.env.get("STRIPE_PRICE_TEAM") || "",
      brokerage: Deno.env.get("STRIPE_PRICE_BROKERAGE") || "",
    };

    const priceId = priceMap[plan];
    if (!priceId) {
      return new Response(
        JSON.stringify({ error: `Stripe price not configured for plan: ${plan}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get or create Stripe customer
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let customerId = sub?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;

      await supabase
        .from("subscriptions")
        .update({ stripe_customer_id: customerId })
        .eq("user_id", user.id);
    }

    const successPath = ["team", "brokerage"].includes(plan)
      ? "/team-setup?session_id={CHECKOUT_SESSION_ID}"
      : "/?upgraded=true&session_id={CHECKOUT_SESSION_ID}";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appOrigin}${successPath}`,
      cancel_url: `${appOrigin}/landing#pricing`,
      subscription_data: {
        metadata: { supabase_user_id: user.id, plan },
        trial_period_days: 30,
      },
      metadata: { supabase_user_id: user.id, plan },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
