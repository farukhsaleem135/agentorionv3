
-- Add design columns to funnels table
ALTER TABLE public.funnels ADD COLUMN layout_style text DEFAULT 'bold';
ALTER TABLE public.funnels ADD COLUMN color_theme text DEFAULT 'modern-neutral';
ALTER TABLE public.funnels ADD COLUMN custom_colors jsonb DEFAULT null;
