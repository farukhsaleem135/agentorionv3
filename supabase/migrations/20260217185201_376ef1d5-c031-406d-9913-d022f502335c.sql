-- Enable realtime for funnel_leads so we can push new lead notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.funnel_leads;