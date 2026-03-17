-- Drop the old anon-only policy
DROP POLICY IF EXISTS "Public can view funnels by slug" ON public.funnels;

-- Create a new policy that allows both anon and authenticated users to read live funnels
CREATE POLICY "Public can view live funnels"
ON public.funnels
FOR SELECT
TO anon, authenticated
USING (status = 'live');
