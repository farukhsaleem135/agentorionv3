
-- CHANGE 1: Shared limit-checking function
CREATE OR REPLACE FUNCTION public.check_user_limits(p_user_id uuid)
RETURNS jsonb AS $$
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

  SELECT COUNT(*) INTO v_funnel_count
  FROM public.funnels
  WHERE user_id = p_user_id
  AND status != 'archived';

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
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.check_user_limits(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_limits(uuid) TO service_role;

-- CHANGE 3: Secure lead insertion function
CREATE OR REPLACE FUNCTION public.capture_lead(
  p_funnel_id uuid,
  p_lead_data jsonb
) RETURNS jsonb AS $$
DECLARE
  v_user_id uuid;
  v_limits jsonb;
  v_lead_id uuid;
BEGIN
  SELECT user_id INTO v_user_id
  FROM public.funnels
  WHERE id = p_funnel_id;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Funnel not found'
    );
  END IF;

  v_limits := check_user_limits(v_user_id);

  IF NOT (v_limits->>'can_capture_lead')::boolean THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'lead_limit_reached',
      'message', 'This agent has reached their monthly lead limit.',
      'tier', v_limits->>'tier'
    );
  END IF;

  INSERT INTO public.funnel_leads (
    funnel_id,
    name,
    email,
    phone,
    budget,
    timeline,
    financing_status,
    intent,
    temperature,
    urgency_score,
    tags
  ) VALUES (
    p_funnel_id,
    p_lead_data->>'name',
    p_lead_data->>'email',
    p_lead_data->>'phone',
    p_lead_data->>'budget',
    p_lead_data->>'timeline',
    p_lead_data->>'financing_status',
    p_lead_data->>'intent',
    COALESCE(p_lead_data->>'temperature', 'cold'),
    COALESCE((p_lead_data->>'urgency_score')::integer, 0),
    CASE WHEN p_lead_data ? 'tags' THEN ARRAY(SELECT jsonb_array_elements_text(p_lead_data->'tags')) ELSE '{}'::text[] END
  )
  RETURNING id INTO v_lead_id;

  RETURN jsonb_build_object(
    'success', true,
    'lead_id', v_lead_id,
    'leads_this_month', (v_limits->>'current_leads_this_month')::integer + 1,
    'leads_remaining', 
      CASE 
        WHEN (v_limits->>'max_leads_per_month')::integer = -1 THEN -1
        ELSE (v_limits->>'max_leads_per_month')::integer 
             - (v_limits->>'current_leads_this_month')::integer - 1
      END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

GRANT EXECUTE ON FUNCTION public.capture_lead(uuid, jsonb) TO anon;
GRANT EXECUTE ON FUNCTION public.capture_lead(uuid, jsonb) TO authenticated;

-- Update RLS: Remove permissive insert policy, block direct inserts
DROP POLICY IF EXISTS "Anyone can submit leads" ON public.funnel_leads;

CREATE POLICY "Leads inserted via capture_lead only"
ON public.funnel_leads
FOR INSERT
WITH CHECK (false);
