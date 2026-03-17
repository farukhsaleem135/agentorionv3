
-- Phase 2: Add typography, density, and component style columns
ALTER TABLE public.funnels ADD COLUMN typography text DEFAULT 'modern-sans';
ALTER TABLE public.funnels ADD COLUMN density text DEFAULT 'standard';
ALTER TABLE public.funnels ADD COLUMN corner_style text DEFAULT 'rounded';
ALTER TABLE public.funnels ADD COLUMN cta_style text DEFAULT 'pill';
