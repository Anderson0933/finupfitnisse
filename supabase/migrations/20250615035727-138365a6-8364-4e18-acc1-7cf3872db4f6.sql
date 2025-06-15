
-- Add last_challenge_request column to user_gamification table
ALTER TABLE public.user_gamification 
ADD COLUMN last_challenge_request TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add created_for_user column to challenges table to track which user a challenge was created for
ALTER TABLE public.challenges 
ADD COLUMN created_for_user UUID DEFAULT NULL;
