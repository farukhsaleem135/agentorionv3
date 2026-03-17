
-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  license_state TEXT,
  city TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add user_id to funnels table
ALTER TABLE public.funnels ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id to funnel_leads (owner of the funnel)
-- funnel_leads don't need user_id since they're public submissions, but funnels need scoping

-- Create listings table
CREATE TABLE public.listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  price TEXT,
  beds INTEGER,
  baths INTEGER,
  sqft TEXT,
  image TEXT,
  days_on_market INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own listings"
  ON public.listings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Fix RLS on funnels: replace permissive policies with user-scoped ones
DROP POLICY "Allow all access to funnels" ON public.funnels;

CREATE POLICY "Users can view own funnels"
  ON public.funnels FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own funnels"
  ON public.funnels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funnels"
  ON public.funnels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own funnels"
  ON public.funnels FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Public can view funnels for the public landing pages
CREATE POLICY "Public can view funnels by slug"
  ON public.funnels FOR SELECT
  TO anon
  USING (true);

-- Fix RLS on funnel_leads: public can insert (lead capture), owners can read
DROP POLICY "Allow all access to funnel_leads" ON public.funnel_leads;

CREATE POLICY "Anyone can submit leads"
  ON public.funnel_leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can view leads for their funnels"
  ON public.funnel_leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.funnels
      WHERE funnels.id = funnel_leads.funnel_id
        AND funnels.user_id = auth.uid()
    )
  );
