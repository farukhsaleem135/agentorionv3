
-- Table: stores hero image variants per funnel (A/B/C/Custom)
CREATE TABLE public.funnel_hero_images (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  variant text NOT NULL DEFAULT 'A', -- A, B, C, custom
  source text NOT NULL DEFAULT 'unsplash', -- unsplash or upload
  image_url text NOT NULL,
  unsplash_photo_id text,
  photographer_name text,
  photographer_profile_url text,
  unsplash_photo_page_url text,
  download_location_url text,
  download_triggered boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  views integer NOT NULL DEFAULT 0,
  conversions integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(funnel_id, variant)
);

ALTER TABLE public.funnel_hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view hero images for their funnels"
  ON public.funnel_hero_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM funnels WHERE funnels.id = funnel_hero_images.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Public can view active hero images"
  ON public.funnel_hero_images FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can insert hero images for their funnels"
  ON public.funnel_hero_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM funnels WHERE funnels.id = funnel_hero_images.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Users can update hero images for their funnels"
  ON public.funnel_hero_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM funnels WHERE funnels.id = funnel_hero_images.funnel_id AND funnels.user_id = auth.uid()));

CREATE POLICY "Users can delete hero images for their funnels"
  ON public.funnel_hero_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM funnels WHERE funnels.id = funnel_hero_images.funnel_id AND funnels.user_id = auth.uid()));

-- Table: hero impression/conversion events for tracking
CREATE TABLE public.hero_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id uuid NOT NULL REFERENCES public.funnels(id) ON DELETE CASCADE,
  hero_image_id uuid REFERENCES public.funnel_hero_images(id) ON DELETE SET NULL,
  variant text NOT NULL,
  session_id text NOT NULL,
  event_type text NOT NULL, -- page_view, hero_rendered, lead_form_start, lead_submit
  traffic_source text DEFAULT 'organic',
  campaign_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_events ENABLE ROW LEVEL SECURITY;

-- Public insert for tracking (anonymous visitors)
CREATE POLICY "Anyone can insert hero events"
  ON public.hero_events FOR INSERT
  WITH CHECK (true);

-- Owners can view
CREATE POLICY "Users can view hero events for their funnels"
  ON public.hero_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM funnels WHERE funnels.id = hero_events.funnel_id AND funnels.user_id = auth.uid()));

-- Unsplash image cache to reduce API calls
CREATE TABLE public.unsplash_cache (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword_set text NOT NULL,
  results jsonb NOT NULL DEFAULT '[]',
  fetched_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '24 hours')
);

ALTER TABLE public.unsplash_cache ENABLE ROW LEVEL SECURITY;

-- Only backend functions access this, but allow read for edge functions
CREATE POLICY "Service role only" ON public.unsplash_cache FOR ALL USING (true) WITH CHECK (true);

-- Add trigger for updated_at on funnel_hero_images
CREATE TRIGGER update_funnel_hero_images_updated_at
  BEFORE UPDATE ON public.funnel_hero_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
