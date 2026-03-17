
-- Add predictive seller intelligence fields to funnel_leads
ALTER TABLE public.funnel_leads
  ADD COLUMN IF NOT EXISTS seller_prediction_score integer DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS prediction_reasons jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS equity_estimate numeric DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS ownership_timeline text DEFAULT NULL;
