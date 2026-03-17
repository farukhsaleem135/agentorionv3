
-- Add agent_type column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS agent_type text DEFAULT NULL;

-- Add comment for clarity
COMMENT ON COLUMN public.profiles.agent_type IS 'Agent career stage: new or experienced. Set during post-signup onboarding.';
