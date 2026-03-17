
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_funnel_id uuid;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));

  -- Create a sample funnel
  v_funnel_id := gen_random_uuid();
  INSERT INTO public.funnels (id, user_id, name, slug, type, status, headline, subheadline, cta, target_area, views, leads_count)
  VALUES (v_funnel_id, NEW.id, 'Sample Buyer Funnel', 'sample-' || substr(replace(NEW.id::text, '-', ''), 1, 8), 'buyer', 'active',
    'Find Your Dream Home', 'Browse exclusive listings in your area', 'Get Started', 'Downtown', 42, 2);

  -- Create 2 sample leads
  INSERT INTO public.funnel_leads (funnel_id, name, email, phone, temperature, status, intent, budget, timeline, ai_score, ai_next_step)
  VALUES
    (v_funnel_id, 'Sarah Johnson', 'sarah.j@example.com', '(555) 123-4567', 'hot', 'open', 'Buying', '$450K-$600K', '1-3 months', 85, 'Schedule showing for 742 Evergreen Terrace'),
    (v_funnel_id, 'Mike Chen', 'mike.chen@example.com', '(555) 987-6543', 'warm', 'open', 'Buying', '$300K-$400K', '3-6 months', 62, 'Send neighborhood comparison report');

  -- Create 1 sample listing
  INSERT INTO public.listings (user_id, address, price, beds, baths, sqft, status, views, days_on_market)
  VALUES (NEW.id, '742 Evergreen Terrace, Springfield', '$525,000', 4, 3, '2,400', 'active', 18, 5);

  RETURN NEW;
END;
$function$;
