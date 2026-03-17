CREATE POLICY "Authenticated can view live funnels"
ON public.funnels
FOR SELECT
TO authenticated
USING (status = 'live');