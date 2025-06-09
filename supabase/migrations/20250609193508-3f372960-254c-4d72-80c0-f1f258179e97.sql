
-- Criar tabela para dados persistentes de gamificação
CREATE TABLE public.user_gamification (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  achievements_unlocked TEXT[] NOT NULL DEFAULT '{}',
  total_workouts_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  fitness_category TEXT NOT NULL DEFAULT 'iniciante' CHECK (fitness_category IN ('iniciante', 'intermediario', 'avancado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view their own gamification data" 
  ON public.user_gamification 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para usuários criarem seus próprios dados
CREATE POLICY "Users can create their own gamification data" 
  ON public.user_gamification 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para usuários atualizarem seus próprios dados
CREATE POLICY "Users can update their own gamification data" 
  ON public.user_gamification 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para usuários excluírem seus próprios dados
CREATE POLICY "Users can delete their own gamification data" 
  ON public.user_gamification 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_gamification_updated_at
  BEFORE UPDATE ON public.user_gamification
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
