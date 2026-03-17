
-- Market areas table for hyper-local intelligence
CREATE TABLE public.market_areas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_codes TEXT[] DEFAULT '{}',
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Market metrics
  avg_sale_price NUMERIC,
  median_dom INTEGER,
  inventory_count INTEGER DEFAULT 0,
  price_trend TEXT DEFAULT 'stable',
  demand_score INTEGER DEFAULT 50,
  competition_score INTEGER DEFAULT 50,
  opportunity_score INTEGER DEFAULT 50,
  market_temp TEXT DEFAULT 'neutral',
  
  -- AI-generated content
  ai_summary TEXT,
  ai_highlights JSONB DEFAULT '[]',
  seo_title TEXT,
  seo_description TEXT,
  seo_content TEXT,
  structured_data JSONB DEFAULT '{}',
  
  -- Engagement
  views INTEGER DEFAULT 0,
  leads_captured INTEGER DEFAULT 0,
  
  status TEXT NOT NULL DEFAULT 'draft',
  last_analyzed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT unique_user_slug UNIQUE (user_id, slug)
);

-- Enable RLS
ALTER TABLE public.market_areas ENABLE ROW LEVEL SECURITY;

-- Agent can manage own market areas
CREATE POLICY "Users can view own market areas"
  ON public.market_areas FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own market areas"
  ON public.market_areas FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own market areas"
  ON public.market_areas FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own market areas"
  ON public.market_areas FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view published market areas (for SEO pages)
CREATE POLICY "Public can view published market areas"
  ON public.market_areas FOR SELECT
  USING (status = 'published');

-- Index for public slug lookups
CREATE INDEX idx_market_areas_slug ON public.market_areas (slug, status);
CREATE INDEX idx_market_areas_user ON public.market_areas (user_id);

-- Trigger for updated_at
CREATE TRIGGER update_market_areas_updated_at
  BEFORE UPDATE ON public.market_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
