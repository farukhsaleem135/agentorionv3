CREATE OR REPLACE FUNCTION public.check_user_limits(p_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_tier subscription_tier;
  v_max_funnels integer;
  v_max_leads integer;
  v_funnel_count integer;
  v_lead_count integer;
BEGIN
  SELECT tier INTO v_tier
  FROM public.subscriptions
  WHERE user_id = p_user_id AND status = 'active';
  
  IF v_tier IS NULL THEN v_tier := 'free'; END IF;

  v_max_funnels := CASE WHEN v_tier = 'free' THEN 1 ELSE -1 END;
  v_max_leads   := CASE WHEN v_tier = 'free' THEN 5 ELSE -1 END;

  -- Exclude the auto-created sample funnel from the count so it does not
  -- consume the user's only free-tier slot.
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
$function$;