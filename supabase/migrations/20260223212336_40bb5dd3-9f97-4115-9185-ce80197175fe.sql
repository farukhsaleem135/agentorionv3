
-- Add confidence threshold for autonomous follow-up gating
ALTER TABLE public.agent_settings
ADD COLUMN IF NOT EXISTS confidence_threshold integer NOT NULL DEFAULT 70,
ADD COLUMN IF NOT EXISTS voice_enabled boolean NOT NULL DEFAULT false;

-- Add call_summary_id to lead_conversations for linking summaries
COMMENT ON COLUMN public.agent_settings.confidence_threshold IS 'Minimum AI confidence score (0-100) required before autonomous outreach is sent without human review';
COMMENT ON COLUMN public.agent_settings.voice_enabled IS 'Whether voice agent features are enabled for this user';
