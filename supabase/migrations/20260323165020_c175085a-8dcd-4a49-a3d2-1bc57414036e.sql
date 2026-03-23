ALTER TABLE public.agent_settings
  ADD COLUMN IF NOT EXISTS preferred_channel text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS preferred_time_slot text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS tone_preference text NOT NULL DEFAULT 'auto',
  ADD COLUMN IF NOT EXISTS script_length text NOT NULL DEFAULT 'auto';