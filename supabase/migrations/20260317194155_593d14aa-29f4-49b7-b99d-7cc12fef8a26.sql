
-- Add team and brokerage to subscription_tier enum
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'team';
ALTER TYPE public.subscription_tier ADD VALUE IF NOT EXISTS 'brokerage';

-- Add seat tracking columns to subscriptions table
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS max_seats integer DEFAULT 1,
  ADD COLUMN IF NOT EXISTS extra_seat_price numeric DEFAULT 0;

-- Add team_subscription_id to team_members to link to the parent subscription
ALTER TABLE public.team_members 
  ADD COLUMN IF NOT EXISTS team_subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- Update get_feature_flags to treat team/brokerage members as Pro
CREATE OR REPLACE FUNCTION public.get_feature_flags(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier subscription_tier;
  v_effective_tier subscription_tier;
  v_flags jsonb;
BEGIN
  -- Check user's own subscription
  SELECT tier INTO v_tier FROM public.subscriptions WHERE user_id = p_user_id AND status = 'active';
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  -- If user is a team/brokerage member (not owner), give them Pro access
  v_effective_tier := v_tier;
  IF v_tier = 'free' OR v_tier = 'growth' THEN
    -- Check if user is an active member of a team/brokerage subscription
    IF EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.subscriptions s ON s.user_id = tm.team_owner_id AND s.status = 'active' AND s.tier IN ('team', 'brokerage')
      WHERE tm.member_user_id = p_user_id AND tm.status = 'active'
    ) THEN
      v_effective_tier := 'pro';
    END IF;
  END IF;

  -- team and brokerage owners also get Pro features
  IF v_tier IN ('team', 'brokerage') THEN
    v_effective_tier := 'pro';
  END IF;

  v_flags := jsonb_build_object(
    'tier', v_tier::text,
    'effective_tier', v_effective_tier::text,
    'unlimited_funnels', v_effective_tier IN ('growth', 'pro'),
    'ad_integration', v_effective_tier IN ('growth', 'pro'),
    'retargeting', v_effective_tier IN ('growth', 'pro'),
    'budget_slider', v_effective_tier IN ('growth', 'pro'),
    'pro_mode', v_effective_tier = 'pro',
    'attribution_dashboard', v_effective_tier = 'pro',
    'split_testing', v_effective_tier = 'pro',
    'cohort_analytics', v_effective_tier = 'pro',
    'advanced_roi', v_effective_tier = 'pro',
    'data_export', v_effective_tier = 'pro',
    'revenue_verification', v_effective_tier = 'pro',
    'max_funnels', CASE WHEN v_effective_tier = 'free' THEN 1 ELSE -1 END,
    'max_leads_per_month', CASE WHEN v_effective_tier = 'free' THEN 5 ELSE -1 END
  );

  RETURN v_flags;
END;
$$;

-- Update check_user_limits similarly
CREATE OR REPLACE FUNCTION public.check_user_limits(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier subscription_tier;
  v_effective_tier text;
  v_max_funnels integer;
  v_max_leads integer;
  v_funnel_count integer;
  v_lead_count integer;
BEGIN
  SELECT tier INTO v_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  -- Determine effective tier
  v_effective_tier := v_tier::text;
  IF v_tier IN ('team', 'brokerage') THEN
    v_effective_tier := 'pro';
  ELSIF v_tier IN ('free', 'growth') THEN
    IF EXISTS (
      SELECT 1 FROM public.team_members tm
      JOIN public.subscriptions s ON s.user_id = tm.team_owner_id AND s.status = 'active' AND s.tier IN ('team', 'brokerage')
      WHERE tm.member_user_id = p_user_id AND tm.status = 'active'
    ) THEN
      v_effective_tier := 'pro';
    END IF;
  END IF;

  v_max_funnels := CASE WHEN v_effective_tier = 'free' THEN 1 ELSE -1 END;
  v_max_leads   := CASE WHEN v_effective_tier = 'free' THEN 5 ELSE -1 END;

  SELECT COUNT(*) INTO v_funnel_count
  FROM public.funnels
  WHERE user_id = p_user_id
    AND status != 'archived'
    AND name != 'Sample Buyer Funnel';

  SELECT COUNT(*) INTO v_lead_count
  FROM public.funnel_leads fl
  JOIN public.funnels f ON f.id = fl.funnel_id
  WHERE f.user_id = p_user_id
  AND fl.created_at >= date_trunc('month', now());

  RETURN jsonb_build_object(
    'tier', v_tier::text,
    'effective_tier', v_effective_tier,
    'max_funnels', v_max_funnels,
    'max_leads_per_month', v_max_leads,
    'current_funnels', v_funnel_count,
    'current_leads_this_month', v_lead_count,
    'can_create_funnel',
      CASE WHEN v_max_funnels = -1 THEN true
           ELSE v_funnel_count < v_max_funnels END,
    'can_capture_lead',
      CASE WHEN v_max_leads = -1 THEN true
           ELSE v_lead_count < v_max_leads END
  );
END;
$$;

-- Function to get team/brokerage seat info
CREATE OR REPLACE FUNCTION public.get_team_seat_info(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_max_seats integer;
  v_extra_seat_price numeric;
  v_current_seats integer;
  v_sub_id uuid;
BEGIN
  SELECT id, tier::text, max_seats, extra_seat_price 
  INTO v_sub_id, v_tier, v_max_seats, v_extra_seat_price
  FROM public.subscriptions 
  WHERE user_id = p_user_id AND status = 'active';

  IF v_tier IS NULL OR v_tier NOT IN ('team', 'brokerage') THEN
    RETURN jsonb_build_object('is_team_plan', false);
  END IF;

  SELECT COUNT(*) + 1 INTO v_current_seats -- +1 for owner
  FROM public.team_members
  WHERE team_owner_id = p_user_id AND status IN ('active', 'pending');

  RETURN jsonb_build_object(
    'is_team_plan', true,
    'tier', v_tier,
    'subscription_id', v_sub_id,
    'max_seats', v_max_seats,
    'extra_seat_price', v_extra_seat_price,
    'current_seats', v_current_seats,
    'seats_remaining', GREATEST(v_max_seats - v_current_seats, 0)
  );
END;
$$;

-- Brokerage admin: get overview of all member stats
CREATE OR REPLACE FUNCTION public.get_brokerage_overview(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_members jsonb;
BEGIN
  SELECT tier::text INTO v_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';

  IF v_tier != 'brokerage' THEN
    RETURN jsonb_build_object('error', 'Not a brokerage plan');
  END IF;

  SELECT jsonb_agg(row_to_json(t)) INTO v_members
  FROM (
    SELECT
      tm.email,
      tm.status,
      tm.joined_at,
      p.display_name,
      (SELECT COUNT(*) FROM public.launch_program_progress lpp WHERE lpp.user_id = tm.member_user_id AND lpp.completed = true) as completed_days,
      (SELECT COUNT(*) FROM public.funnel_leads fl JOIN public.funnels f ON f.id = fl.funnel_id WHERE f.user_id = tm.member_user_id) as lead_count,
      (SELECT COUNT(*) FROM public.funnels f WHERE f.user_id = tm.member_user_id AND f.status != 'archived') as funnel_count
    FROM public.team_members tm
    LEFT JOIN public.profiles p ON p.user_id = tm.member_user_id
    WHERE tm.team_owner_id = p_user_id AND tm.status != 'removed'
    ORDER BY tm.created_at ASC
  ) t;

  RETURN jsonb_build_object(
    'members', COALESCE(v_members, '[]'::jsonb)
  );
END;
$$;
