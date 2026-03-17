
-- funnel_leads
ALTER TABLE public.funnel_leads DROP CONSTRAINT funnel_leads_funnel_id_fkey;
ALTER TABLE public.funnel_leads ADD CONSTRAINT funnel_leads_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;

-- funnel_hero_images
ALTER TABLE public.funnel_hero_images DROP CONSTRAINT funnel_hero_images_funnel_id_fkey;
ALTER TABLE public.funnel_hero_images ADD CONSTRAINT funnel_hero_images_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;

-- hero_events
ALTER TABLE public.hero_events DROP CONSTRAINT hero_events_funnel_id_fkey;
ALTER TABLE public.hero_events ADD CONSTRAINT hero_events_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;

-- ad_campaigns
ALTER TABLE public.ad_campaigns DROP CONSTRAINT ad_campaigns_funnel_id_fkey;
ALTER TABLE public.ad_campaigns ADD CONSTRAINT ad_campaigns_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;

-- seller_valuations
ALTER TABLE public.seller_valuations DROP CONSTRAINT seller_valuations_funnel_id_fkey;
ALTER TABLE public.seller_valuations ADD CONSTRAINT seller_valuations_funnel_id_fkey FOREIGN KEY (funnel_id) REFERENCES public.funnels(id) ON DELETE CASCADE;
