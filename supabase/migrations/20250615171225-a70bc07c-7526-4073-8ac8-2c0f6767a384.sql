
-- Create a new table to store user onboarding status
CREATE TABLE public.user_onboarding_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  has_seen_tour BOOLEAN NOT NULL DEFAULT FALSE,
  completed_checklist_steps TEXT[] NOT NULL DEFAULT '{}',
  hide_checklist BOOLEAN NOT NULL DEFAULT FALSE,
  dismissed_contextual_tips TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comment on table and columns for clarity
COMMENT ON TABLE public.user_onboarding_status IS 'Stores the onboarding state for each user, persisting it across devices.';
COMMENT ON COLUMN public.user_onboarding_status.has_seen_tour IS 'True if the user has completed the initial product tour.';
COMMENT ON COLUMN public.user_onboarding_status.completed_checklist_steps IS 'Array of step IDs from the onboarding checklist that the user has completed.';
COMMENT ON COLUMN public.user_onboarding_status.hide_checklist IS 'True if the user has chosen to permanently hide the onboarding checklist.';
COMMENT ON COLUMN public.user_onboarding_status.dismissed_contextual_tips IS 'Array of tip IDs that the user has dismissed.';

-- Enable RLS
ALTER TABLE public.user_onboarding_status ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_onboarding_status
CREATE POLICY "Users can manage their own onboarding status"
ON public.user_onboarding_status FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to automatically update the 'updated_at' column on changes
CREATE TRIGGER handle_onboarding_status_updated_at
BEFORE UPDATE ON public.user_onboarding_status
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

