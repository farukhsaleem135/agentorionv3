
-- Ad Campaigns table for Meta/Google ads management
CREATE TABLE public.ad_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'meta',
  status TEXT NOT NULL DEFAULT 'draft',
  headline TEXT,
  description TEXT,
  cta TEXT,
  daily_budget NUMERIC DEFAULT 0,
  total_spend NUMERIC DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  leads_generated INTEGER DEFAULT 0,
  target_audience JSONB,
  funnel_id UUID REFERENCES public.funnels(id),
  external_campaign_id TEXT,
  ab_variant TEXT DEFAULT 'A',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaigns" ON public.ad_campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own campaigns" ON public.ad_campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own campaigns" ON public.ad_campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own campaigns" ON public.ad_campaigns FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_ad_campaigns_updated_at
  BEFORE UPDATE ON public.ad_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seller valuations table for Seller Suite 2.0
CREATE TABLE public.seller_valuations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  address TEXT NOT NULL,
  estimated_value NUMERIC,
  confidence_score INTEGER DEFAULT 70,
  valuation_data JSONB,
  lead_id UUID REFERENCES public.funnel_leads(id),
  funnel_id UUID REFERENCES public.funnels(id),
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.seller_valuations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own valuations" ON public.seller_valuations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own valuations" ON public.seller_valuations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own valuations" ON public.seller_valuations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own valuations" ON public.seller_valuations FOR DELETE USING (auth.uid() = user_id);

-- NLP command log for command system
CREATE TABLE public.nlp_commands (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  command_text TEXT NOT NULL,
  parsed_intent TEXT,
  parsed_params JSONB,
  result JSONB,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.nlp_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own commands" ON public.nlp_commands FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own commands" ON public.nlp_commands FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Integration connections table for CRM/Calendar sync
CREATE TABLE public.integration_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'disconnected',
  credentials JSONB,
  sync_config JSONB,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own integrations" ON public.integration_connections FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own integrations" ON public.integration_connections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own integrations" ON public.integration_connections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own integrations" ON public.integration_connections FOR DELETE USING (auth.uid() = user_id);
