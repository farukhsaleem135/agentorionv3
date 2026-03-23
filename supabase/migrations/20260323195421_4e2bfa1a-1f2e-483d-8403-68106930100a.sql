
-- Update capture_lead function to also write to contacts table
CREATE OR REPLACE FUNCTION public.capture_lead(p_funnel_id uuid, p_lead_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_limits jsonb;
  v_lead_id uuid;
  v_profile_id uuid;
  v_funnel_type text;
  v_rel_type contact_relationship_type;
  v_existing_contact_id uuid;
  v_lead_email text;
  v_lead_phone text;
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

  -- PART F: Write to contacts table (additive)
  -- Get the agent's profile id
  SELECT id INTO v_profile_id
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF v_profile_id IS NOT NULL THEN
    -- Determine relationship_type based on funnel type
    SELECT type INTO v_funnel_type
    FROM public.funnels
    WHERE id = p_funnel_id;

    v_rel_type := CASE
      WHEN v_funnel_type IN ('buyer', 'first-time-buyer', 'luxury', 'relocation', 'downsizer') THEN 'buyer_lead'::contact_relationship_type
      WHEN v_funnel_type IN ('seller', 'home-valuation', 'net-proceeds', 'cash-offer') THEN 'seller_prospect'::contact_relationship_type
      WHEN v_funnel_type IN ('fsbo', 'expired', 'pre-foreclosure', 'investor') THEN 'professional'::contact_relationship_type
      ELSE 'funnel_lead'::contact_relationship_type
    END;

    v_lead_email := p_lead_data->>'email';
    v_lead_phone := p_lead_data->>'phone';

    -- Check for existing contact by email or phone (dedup)
    v_existing_contact_id := NULL;
    IF v_lead_email IS NOT NULL AND v_lead_email != '' THEN
      SELECT id INTO v_existing_contact_id
      FROM public.contacts
      WHERE agent_id = v_profile_id AND email = v_lead_email
      LIMIT 1;
    END IF;

    IF v_existing_contact_id IS NULL AND v_lead_phone IS NOT NULL AND v_lead_phone != '' THEN
      SELECT id INTO v_existing_contact_id
      FROM public.contacts
      WHERE agent_id = v_profile_id AND phone = v_lead_phone
      LIMIT 1;
    END IF;

    IF v_existing_contact_id IS NOT NULL THEN
      -- Update last_contacted_at only
      UPDATE public.contacts
      SET last_contacted_at = now(), updated_at = now()
      WHERE id = v_existing_contact_id;
    ELSE
      -- Insert new contact
      INSERT INTO public.contacts (agent_id, full_name, email, phone, relationship_type, source)
      VALUES (
        v_profile_id,
        COALESCE(p_lead_data->>'name', 'Unknown'),
        NULLIF(v_lead_email, ''),
        NULLIF(v_lead_phone, ''),
        v_rel_type,
        'funnel_capture'::contact_source
      );
    END IF;
  END IF;

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
$function$;
