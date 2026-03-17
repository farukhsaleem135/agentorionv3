
-- Enable pg_cron and pg_net for scheduled function invocation
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Add delivery tracking columns to outreach_queue
ALTER TABLE public.outreach_queue 
ADD COLUMN IF NOT EXISTS delivery_provider TEXT,
ADD COLUMN IF NOT EXISTS delivery_id TEXT,
ADD COLUMN IF NOT EXISTS delivery_error TEXT,
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ;

-- Add outreach preferences to agent_settings
ALTER TABLE public.agent_settings
ADD COLUMN IF NOT EXISTS quiet_hours_start INTEGER DEFAULT 21,
ADD COLUMN IF NOT EXISTS quiet_hours_end INTEGER DEFAULT 8,
ADD COLUMN IF NOT EXISTS max_daily_messages INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS auto_send_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'America/New_York';
