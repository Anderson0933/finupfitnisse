
-- Verificar e adicionar colunas que podem estar faltando
ALTER TABLE public.user_gamification 
ADD COLUMN IF NOT EXISTS last_challenge_request TIMESTAMP WITH TIME ZONE DEFAULT NULL;

ALTER TABLE public.challenges 
ADD COLUMN IF NOT EXISTS created_for_user UUID DEFAULT NULL;
