
-- Add hero_image_url and section_order columns to funnels
ALTER TABLE public.funnels
ADD COLUMN IF NOT EXISTS hero_image_url text,
ADD COLUMN IF NOT EXISTS section_order text[] DEFAULT ARRAY['hero', 'stats', 'form', 'trust'];

-- Create storage bucket for funnel hero images
INSERT INTO storage.buckets (id, name, public)
VALUES ('funnel-assets', 'funnel-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to funnel-assets
CREATE POLICY "Users can upload funnel assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'funnel-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own funnel assets
CREATE POLICY "Users can update their funnel assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'funnel-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to delete their own funnel assets
CREATE POLICY "Users can delete their funnel assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'funnel-assets' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public read access to funnel assets
CREATE POLICY "Public read access for funnel assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'funnel-assets');
