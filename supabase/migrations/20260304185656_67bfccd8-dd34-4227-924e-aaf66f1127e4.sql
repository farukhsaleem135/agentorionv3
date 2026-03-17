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
    'max_leads_per_month', CASE WHEN v_tier = 'free' THEN 5 ELSE -1 END
  );

  RETURN v_flags;
END;
$$;