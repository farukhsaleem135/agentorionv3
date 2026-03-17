
-- Create launch program progress table
CREATE TABLE public.launch_program_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 30),
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  agent_type TEXT NOT NULL DEFAULT 'new' CHECK (agent_type IN ('new', 'experienced')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day_number)
);

-- Enable RLS
ALTER TABLE public.launch_program_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own launch progress"
ON public.launch_program_progress
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own launch progress"
ON public.launch_program_progress
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own launch progress"
ON public.launch_program_progress
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own launch progress"
ON public.launch_program_progress
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_launch_program_progress_updated_at
BEFORE UPDATE ON public.launch_program_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
