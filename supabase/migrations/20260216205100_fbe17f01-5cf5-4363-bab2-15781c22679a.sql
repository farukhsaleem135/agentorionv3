
-- Shared AI memory: conversation context across voice + text channels
CREATE TABLE public.lead_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  channel TEXT NOT NULL DEFAULT 'text', -- 'text', 'voice', 'email', 'sms'
  direction TEXT NOT NULL DEFAULT 'outbound', -- 'inbound', 'outbound'
  role TEXT NOT NULL DEFAULT 'assistant', -- 'assistant', 'user', 'system'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  sentiment_score NUMERIC(3,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Autonomous outreach queue
CREATE TABLE public.outreach_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms', -- 'sms', 'email', 'voice', 'dm'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'sent', 'failed', 'cancelled'
  subject TEXT,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  ai_generated BOOLEAN NOT NULL DEFAULT true,
  trigger_reason TEXT, -- 'new_lead', 'follow_up', 'reactivation', 'behavior_trigger', 'nurture_sequence'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Outreach sequences (multi-step automated campaigns)
CREATE TABLE public.outreach_sequences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'sms',
  steps JSONB NOT NULL DEFAULT '[]', -- array of {delay_hours, template, channel}
  is_active BOOLEAN NOT NULL DEFAULT true,
  trigger_type TEXT NOT NULL DEFAULT 'new_lead', -- 'new_lead', 'status_change', 'behavior', 'manual'
  trigger_conditions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tour requests (for real-time tour connections later)
CREATE TABLE public.tour_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  requested_date DATE NOT NULL,
  requested_time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled', 'completed'
  ai_confirmed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead verification tracking
CREATE TABLE public.lead_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id UUID NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL DEFAULT 'auto', -- 'auto', 'manual', 'voice'
  is_verified BOOLEAN NOT NULL DEFAULT false,
  quality_score NUMERIC(3,2),
  fraud_flags JSONB DEFAULT '[]',
  verification_data JSONB DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX idx_lead_conversations_lead_id ON public.lead_conversations(lead_id);
CREATE INDEX idx_lead_conversations_channel ON public.lead_conversations(channel);
CREATE INDEX idx_outreach_queue_lead_id ON public.outreach_queue(lead_id);
CREATE INDEX idx_outreach_queue_user_id ON public.outreach_queue(user_id);
CREATE INDEX idx_outreach_queue_status ON public.outreach_queue(status);
CREATE INDEX idx_outreach_sequences_user_id ON public.outreach_sequences(user_id);
CREATE INDEX idx_tour_requests_lead_id ON public.tour_requests(lead_id);
CREATE INDEX idx_tour_requests_user_id ON public.tour_requests(user_id);
CREATE INDEX idx_lead_verifications_lead_id ON public.lead_verifications(lead_id);

-- RLS
ALTER TABLE public.lead_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tour_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_verifications ENABLE ROW LEVEL SECURITY;

-- lead_conversations: accessible by the agent who owns the funnel
CREATE POLICY "Agents can view conversations for their leads"
  ON public.lead_conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.funnel_leads fl
    JOIN public.funnels f ON fl.funnel_id = f.id
    WHERE fl.id = lead_conversations.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Agents can insert conversations for their leads"
  ON public.lead_conversations FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.funnel_leads fl
    JOIN public.funnels f ON fl.funnel_id = f.id
    WHERE fl.id = lead_conversations.lead_id AND f.user_id = auth.uid()
  ));

-- outreach_queue: scoped to user_id
CREATE POLICY "Users can manage their outreach queue"
  ON public.outreach_queue FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- outreach_sequences: scoped to user_id
CREATE POLICY "Users can manage their sequences"
  ON public.outreach_sequences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- tour_requests: scoped to user_id
CREATE POLICY "Users can manage their tour requests"
  ON public.tour_requests FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- lead_verifications: accessible by the agent who owns the funnel
CREATE POLICY "Agents can view verifications for their leads"
  ON public.lead_verifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.funnel_leads fl
    JOIN public.funnels f ON fl.funnel_id = f.id
    WHERE fl.id = lead_verifications.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Agents can insert verifications for their leads"
  ON public.lead_verifications FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.funnel_leads fl
    JOIN public.funnels f ON fl.funnel_id = f.id
    WHERE fl.id = lead_verifications.lead_id AND f.user_id = auth.uid()
  ));

-- Update triggers
CREATE TRIGGER update_outreach_queue_updated_at
  BEFORE UPDATE ON public.outreach_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_outreach_sequences_updated_at
  BEFORE UPDATE ON public.outreach_sequences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tour_requests_updated_at
  BEFORE UPDATE ON public.tour_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
