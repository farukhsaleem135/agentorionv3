
-- Create agent_settings table for persisting budget and other settings
CREATE TABLE public.agent_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  daily_ad_budget INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON public.agent_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.agent_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.agent_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_agent_settings_updated_at
  BEFORE UPDATE ON public.agent_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
