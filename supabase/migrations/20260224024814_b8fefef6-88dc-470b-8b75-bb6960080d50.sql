
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Public can view live funnels" ON public.funnels;

-- Recreate it for anon only (public funnel pages)
CREATE POLICY "Anon can view live funnels"
ON public.funnels
FOR SELECT
TO anon
USING (status = 'live');
