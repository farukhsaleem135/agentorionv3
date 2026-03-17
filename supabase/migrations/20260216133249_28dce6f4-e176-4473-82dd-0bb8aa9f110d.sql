
-- Lead notes table
CREATE TABLE public.lead_notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  note_type text NOT NULL DEFAULT 'manual',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view notes for their leads"
  ON public.lead_notes FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funnel_leads fl
    JOIN funnels f ON f.id = fl.funnel_id
    WHERE fl.id = lead_notes.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert notes for their leads"
  ON public.lead_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM funnel_leads fl
    JOIN funnels f ON f.id = fl.funnel_id
    WHERE fl.id = lead_notes.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own notes"
  ON public.lead_notes FOR DELETE
  USING (auth.uid() = user_id);

-- Lead tags table
CREATE TABLE public.lead_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.funnel_leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tag text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(lead_id, tag)
);

ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tags for their leads"
  ON public.lead_tags FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM funnel_leads fl
    JOIN funnels f ON f.id = fl.funnel_id
    WHERE fl.id = lead_tags.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert tags for their leads"
  ON public.lead_tags FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM funnel_leads fl
    JOIN funnels f ON f.id = fl.funnel_id
    WHERE fl.id = lead_tags.lead_id AND f.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own tags"
  ON public.lead_tags FOR DELETE
  USING (auth.uid() = user_id);

-- Add AI score columns to funnel_leads
ALTER TABLE public.funnel_leads
  ADD COLUMN IF NOT EXISTS ai_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_score_reasons jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Index for faster lookups
CREATE INDEX idx_lead_notes_lead_id ON public.lead_notes(lead_id);
CREATE INDEX idx_lead_tags_lead_id ON public.lead_tags(lead_id);
