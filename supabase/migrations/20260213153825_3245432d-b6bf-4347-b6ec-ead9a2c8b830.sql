
-- Subscription tier enum
CREATE TYPE public.subscription_tier AS ENUM ('free', 'growth', 'pro');

-- Subscriptions table (Stripe-ready but works without it)
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  tier subscription_tier NOT NULL DEFAULT 'free',
  stripe_customer_id text,
  stripe_subscription_id text,
  billing_period text DEFAULT 'monthly',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON public.subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- Usage events for tracking behavioral triggers
CREATE TABLE public.usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events"
ON public.usage_events FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
ON public.usage_events FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Revenue tracking columns on funnel_leads
ALTER TABLE public.funnel_leads
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS close_date date,
  ADD COLUMN IF NOT EXISTS deal_side text,
  ADD COLUMN IF NOT EXISTS estimated_revenue numeric,
  ADD COLUMN IF NOT EXISTS actual_revenue numeric,
  ADD COLUMN IF NOT EXISTS revenue_status text DEFAULT 'modeled',
  ADD COLUMN IF NOT EXISTS closed_at timestamp with time zone;

-- Onboarding data on profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS market_area text,
  ADD COLUMN IF NOT EXISTS primary_focus text,
  ADD COLUMN IF NOT EXISTS avg_sale_price numeric,
  ADD COLUMN IF NOT EXISTS commission_rate numeric DEFAULT 3.0,
  ADD COLUMN IF NOT EXISTS target_closings integer DEFAULT 3,
  ADD COLUMN IF NOT EXISTS growth_goal text,
  ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Auto-create free subscription on signup
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status)
  VALUES (NEW.id, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_subscription();

-- Feature flags function (backend-enforced)
CREATE OR REPLACE FUNCTION public.get_feature_flags(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_tier subscription_tier;
  v_flags jsonb;
BEGIN
  SELECT tier INTO v_tier FROM public.subscriptions WHERE user_id = p_user_id AND status = 'active';
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  v_flags := jsonb_build_object(
    'tier', v_tier::text,
    'unlimited_funnels', v_tier IN ('growth', 'pro'),
    'ad_integration', v_tier IN ('growth', 'pro'),
    'retargeting', v_tier IN ('growth', 'pro'),
    'budget_slider', v_tier IN ('growth', 'pro'),
    'pro_mode', v_tier = 'pro',
    'attribution_dashboard', v_tier = 'pro',
    'split_testing', v_tier = 'pro',
    'cohort_analytics', v_tier = 'pro',
    'advanced_roi', v_tier = 'pro',
    'data_export', v_tier = 'pro',
    'revenue_verification', v_tier = 'pro',
    'max_funnels', CASE WHEN v_tier = 'free' THEN 1 ELSE -1 END,
    'max_leads_per_month', CASE WHEN v_tier = 'free' THEN 10 ELSE -1 END
  );

  RETURN v_flags;
END;
$$;

-- Update triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Allow funnel_leads updates now (for close date entry)
CREATE POLICY "Users can update leads for their funnels"
ON public.funnel_leads FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM funnels
  WHERE funnels.id = funnel_leads.funnel_id AND funnels.user_id = auth.uid()
));
