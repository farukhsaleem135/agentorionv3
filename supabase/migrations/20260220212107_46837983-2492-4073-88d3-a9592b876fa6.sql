
-- Add AI-generated problem section and value props to funnels
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS problem_section jsonb DEFAULT NULL;
ALTER TABLE public.funnels ADD COLUMN IF NOT EXISTS value_props jsonb DEFAULT NULL;
