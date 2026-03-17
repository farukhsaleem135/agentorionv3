
CREATE TABLE public.generated_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  market_area TEXT NOT NULL DEFAULT '',
  content_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.generated_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generated content"
  ON public.generated_content FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generated content"
  ON public.generated_content FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own generated content"
  ON public.generated_content FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_generated_content_user_platform ON public.generated_content (user_id, platform, content_type, created_at DESC);
