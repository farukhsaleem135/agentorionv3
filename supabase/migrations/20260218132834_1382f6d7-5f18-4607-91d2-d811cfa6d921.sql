
-- Create team_members table
CREATE TABLE public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id uuid NOT NULL,
  member_user_id uuid,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'agent' CHECK (role IN ('leader', 'agent', 'admin')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'removed')),
  invited_at timestamp with time zone NOT NULL DEFAULT now(),
  joined_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (team_owner_id, email)
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Team owners can do everything with their team
CREATE POLICY "Team owners can manage their team"
  ON public.team_members FOR ALL
  USING (auth.uid() = team_owner_id)
  WITH CHECK (auth.uid() = team_owner_id);

-- Team members can view their own team membership
CREATE POLICY "Members can view their team"
  ON public.team_members FOR SELECT
  USING (auth.uid() = member_user_id);

-- Add assigned_to column to funnel_leads for lead assignment
ALTER TABLE public.funnel_leads ADD COLUMN assigned_to uuid;

-- Updated_at trigger for team_members
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-link: when a user signs up, check if they have pending invites and activate them
CREATE OR REPLACE FUNCTION public.auto_link_team_invites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.team_members
  SET member_user_id = NEW.id,
      status = 'active',
      joined_at = now()
  WHERE email = NEW.email
    AND status = 'pending'
    AND member_user_id IS NULL;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_link_team
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_link_team_invites();
