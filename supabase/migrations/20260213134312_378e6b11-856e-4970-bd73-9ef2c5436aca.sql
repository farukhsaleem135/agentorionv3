
-- Allow public to view display_name for portfolio pages
CREATE POLICY "Anyone can view profile display_name"
ON public.profiles FOR SELECT
USING (true);
