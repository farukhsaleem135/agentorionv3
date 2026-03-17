ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS content_metadata JSONB;
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS conversion_rate DECIMAL(5,4);