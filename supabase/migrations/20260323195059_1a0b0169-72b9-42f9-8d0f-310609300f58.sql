
-- Create enums for contacts
CREATE TYPE public.contact_relationship_type AS ENUM (
  'sphere', 'past_client', 'personal', 'professional', 
  'met_once', 'funnel_lead', 'buyer_lead', 'seller_prospect'
);

CREATE TYPE public.contact_source AS ENUM (
  'google_import', 'csv_import', 'manual', 'funnel_capture', 'pipeline_entry'
);

-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  relationship_type public.contact_relationship_type NOT NULL DEFAULT 'sphere',
  source public.contact_source NOT NULL DEFAULT 'manual',
  last_contacted_at TIMESTAMPTZ,
  contact_score INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- RLS policies: agents can only see/manage their own contacts
CREATE POLICY "Users can view own contacts"
  ON public.contacts FOR SELECT
  TO authenticated
  USING (agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own contacts"
  ON public.contacts FOR INSERT
  TO authenticated
  WITH CHECK (agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own contacts"
  ON public.contacts FOR UPDATE
  TO authenticated
  USING (agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete own contacts"
  ON public.contacts FOR DELETE
  TO authenticated
  USING (agent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- Service role insert policy for edge functions (capture_lead)
CREATE POLICY "Service role can insert contacts"
  ON public.contacts FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update contacts"
  ON public.contacts FOR UPDATE
  TO service_role
  USING (true);

-- Updated_at trigger
CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
