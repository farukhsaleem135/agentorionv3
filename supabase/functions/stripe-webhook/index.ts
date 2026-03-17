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

  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  if (!stripeSecretKey || !webhookSecret) {
    return new Response(JSON.stringify({ error: "Stripe not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const Stripe = (await import("https://esm.sh/stripe@14.14.0")).default;
  const stripe = new Stripe(stripeSecretKey, { apiVersion: "2023-10-16" });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig!, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const tierMap: Record<string, { max_seats: number; extra_seat_price: number }> = {
    growth: { max_seats: 1, extra_seat_price: 0 },
    pro: { max_seats: 1, extra_seat_price: 0 },
    team: { max_seats: 5, extra_seat_price: 25 },
    brokerage: { max_seats: 20, extra_seat_price: 15 },
  };

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.supabase_user_id;
    const plan = session.metadata?.plan;

    if (userId && plan && tierMap[plan]) {
      const config = tierMap[plan];
      await supabase
        .from("subscriptions")
        .update({
          tier: plan,
          status: "active",
          stripe_subscription_id: session.subscription,
          stripe_customer_id: session.customer,
          max_seats: config.max_seats,
          extra_seat_price: config.extra_seat_price,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 86400000).toISOString(),
        })
        .eq("user_id", userId);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const userId = subscription.metadata?.supabase_user_id;

    if (userId) {
      await supabase
        .from("subscriptions")
        .update({
          tier: "free",
          status: "canceled",
          max_seats: 1,
          extra_seat_price: 0,
          stripe_subscription_id: null,
        })
        .eq("user_id", userId);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
