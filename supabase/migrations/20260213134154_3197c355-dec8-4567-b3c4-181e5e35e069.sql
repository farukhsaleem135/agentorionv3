
-- Allow anyone to view published content (for the public portfolio page)
CREATE POLICY "Anyone can view published content"
ON public.content FOR SELECT
USING (status = 'published');
