
-- Funnels table
CREATE TABLE public.funnels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'paused')),
  slug TEXT NOT NULL UNIQUE,
  target_area TEXT,
  zip_codes TEXT,
  focus TEXT CHECK (focus IN ('Buyers', 'Sellers', 'Both')),
  price_min TEXT,
  price_max TEXT,
  tone TEXT CHECK (tone IN ('Educational', 'Premium', 'Aggressive', 'Friendly')),
  cta TEXT,
  headline TEXT,
  subheadline TEXT,
  body_content TEXT,
  trust_block TEXT,
  nurture_sequence JSONB,
  video_script TEXT,
  social_copy JSONB,
  views INTEGER NOT NULL DEFAULT 0,
  leads_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Funnel leads table
CREATE TABLE public.funnel_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID REFERENCES public.funnels(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  intent TEXT,
  budget TEXT,
  timeline TEXT,
  financing_status TEXT,
  urgency_score INTEGER DEFAULT 0,
  temperature TEXT DEFAULT 'cold' CHECK (temperature IN ('hot', 'warm', 'cold')),
  ai_next_step TEXT,
  behavior_timeline JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS for single-user prototype
ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.funnel_leads ENABLE ROW LEVEL SECURITY;

-- Allow all access for prototype (no auth)
CREATE POLICY "Allow all access to funnels" ON public.funnels FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to funnel_leads" ON public.funnel_leads FOR ALL USING (true) WITH CHECK (true);

-- Update trigger for funnels
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_funnels_updated_at
  BEFORE UPDATE ON public.funnels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
