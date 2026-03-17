
-- Update handle_new_subscription to set correct max_seats for team/brokerage
CREATE OR REPLACE FUNCTION public.handle_new_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, tier, status, max_seats, extra_seat_price)
  VALUES (
    NEW.id, 
    'free', 
    'active',
    1,
    0
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Update auto_link_team_invites to also set the member's subscription to pro-equivalent
-- when they join a team/brokerage
CREATE OR REPLACE FUNCTION public.auto_link_team_invites()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
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
