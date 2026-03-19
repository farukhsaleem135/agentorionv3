
CREATE TABLE public.agent_idx_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mls_provider text NOT NULL,
  login_id text NOT NULL,
  api_key_encrypted text NOT NULL,
  idx_connected boolean NOT NULL DEFAULT false,
  connected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.agent_idx_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credentials"
  ON public.agent_idx_credentials FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credentials"
  ON public.agent_idx_credentials FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credentials"
  ON public.agent_idx_credentials FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own credentials"
  ON public.agent_idx_credentials FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
