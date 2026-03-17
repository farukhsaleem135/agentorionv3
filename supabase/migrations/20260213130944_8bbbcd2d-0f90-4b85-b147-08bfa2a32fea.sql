
-- ═══ Content table for AI-generated scripts/social posts ═══
CREATE TABLE public.content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL DEFAULT 'script',
  title TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own content" ON public.content FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own content" ON public.content FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own content" ON public.content FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own content" ON public.content FOR DELETE USING (auth.uid() = user_id);

-- ═══ RPC to increment funnel views (anon-safe via SECURITY DEFINER) ═══
CREATE OR REPLACE FUNCTION public.increment_funnel_views(p_funnel_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.funnels SET views = views + 1 WHERE id = p_funnel_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══ Trigger to auto-increment leads_count when a lead is captured ═══
CREATE OR REPLACE FUNCTION public.increment_funnel_leads_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.funnels SET leads_count = leads_count + 1 WHERE id = NEW.funnel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_funnel_lead_insert
AFTER INSERT ON public.funnel_leads
FOR EACH ROW
EXECUTE FUNCTION public.increment_funnel_leads_count();

-- ═══ Updated_at trigger for content ═══
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_content_updated_at
BEFORE UPDATE ON public.content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
