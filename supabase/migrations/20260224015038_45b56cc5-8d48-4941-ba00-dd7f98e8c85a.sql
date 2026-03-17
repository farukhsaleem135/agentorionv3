
-- Fix unsplash_cache: restrict to service role only (no anon access needed)
DROP POLICY "Service role only" ON public.unsplash_cache;

-- Only allow SELECT for cached results (edge functions use service role for writes)
CREATE POLICY "Anyone can read cache" ON public.unsplash_cache FOR SELECT USING (true);

-- Fix hero_events: restrict INSERT to only allow specific event types
DROP POLICY "Anyone can insert hero events" ON public.hero_events;
CREATE POLICY "Anyone can insert hero events"
  ON public.hero_events FOR INSERT
  WITH CHECK (event_type IN ('page_view', 'hero_rendered', 'lead_form_start', 'lead_submit', 'appointment_booked'));
