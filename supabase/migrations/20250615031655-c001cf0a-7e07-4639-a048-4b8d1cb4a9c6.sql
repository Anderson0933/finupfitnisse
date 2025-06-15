
-- Criar tabela de desafios
CREATE TABLE public.challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'daily', -- 'daily', 'weekly', 'monthly'
  category TEXT NOT NULL DEFAULT 'workout', -- 'workout', 'nutrition', 'general'
  target_value INTEGER NOT NULL DEFAULT 1,
  target_unit TEXT NOT NULL DEFAULT 'times', -- 'times', 'minutes', 'reps', 'kg'
  xp_reward INTEGER NOT NULL DEFAULT 10,
  difficulty TEXT NOT NULL DEFAULT 'easy', -- 'easy', 'medium', 'hard'
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '7 days',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de progresso dos usuários nos desafios
CREATE TABLE public.user_challenge_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

-- Criar tabela de conquistas/achievements
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  category TEXT NOT NULL DEFAULT 'general',
  condition_type TEXT NOT NULL DEFAULT 'challenges_completed', -- 'challenges_completed', 'total_xp', 'streak_days'
  condition_value INTEGER NOT NULL DEFAULT 1,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  rarity TEXT NOT NULL DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de conquistas desbloqueadas pelos usuários
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Adicionar RLS para as tabelas
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Políticas para challenges (todos podem ver desafios ativos)
CREATE POLICY "Anyone can view active challenges" 
  ON public.challenges 
  FOR SELECT 
  USING (is_active = true);

-- Políticas para user_challenge_progress (usuários só veem seu próprio progresso)
CREATE POLICY "Users can view their own challenge progress" 
  ON public.user_challenge_progress 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own challenge progress" 
  ON public.user_challenge_progress 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challenge progress" 
  ON public.user_challenge_progress 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Políticas para achievements (todos podem ver conquistas)
CREATE POLICY "Anyone can view achievements" 
  ON public.achievements 
  FOR SELECT 
  USING (true);

-- Políticas para user_achievements (usuários só veem suas próprias conquistas)
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Inserir alguns desafios iniciais
INSERT INTO public.challenges (title, description, type, category, target_value, target_unit, xp_reward, difficulty) VALUES
('Treino Diário', 'Complete 1 treino hoje', 'daily', 'workout', 1, 'times', 15, 'easy'),
('Hidratação Master', 'Beba 8 copos de água hoje', 'daily', 'nutrition', 8, 'glasses', 10, 'easy'),
('Guerreiro da Semana', 'Complete 4 treinos esta semana', 'weekly', 'workout', 4, 'times', 50, 'medium'),
('Consistência Total', 'Faça login por 7 dias consecutivos', 'weekly', 'general', 7, 'days', 30, 'medium'),
('Desafio dos 30 dias', 'Complete 20 treinos neste mês', 'monthly', 'workout', 20, 'times', 200, 'hard');

-- Inserir algumas conquistas iniciais
INSERT INTO public.achievements (title, description, icon, category, condition_type, condition_value, xp_reward, rarity) VALUES
('Primeiro Passo', 'Complete seu primeiro desafio', '🎯', 'general', 'challenges_completed', 1, 25, 'common'),
('Veterano', 'Complete 10 desafios', '🏅', 'general', 'challenges_completed', 10, 100, 'rare'),
('Lenda', 'Complete 50 desafios', '👑', 'general', 'challenges_completed', 50, 500, 'legendary'),
('Acumulador XP', 'Acumule 1000 pontos de experiência', '⭐', 'general', 'total_xp', 1000, 200, 'epic'),
('Constante', 'Mantenha uma sequência de 7 dias', '🔥', 'general', 'streak_days', 7, 150, 'rare');

-- Criar função para atualizar XP e verificar conquistas
CREATE OR REPLACE FUNCTION update_user_xp_and_achievements()
RETURNS TRIGGER AS $$
DECLARE
  challenge_xp INTEGER;
  user_total_xp INTEGER;
  user_completed_challenges INTEGER;
  achievement_record RECORD;
BEGIN
  -- Se o desafio foi completado
  IF NEW.is_completed = true AND OLD.is_completed = false THEN
    -- Buscar XP do desafio
    SELECT xp_reward INTO challenge_xp FROM challenges WHERE id = NEW.challenge_id;
    
    -- Atualizar XP do usuário na tabela user_gamification
    UPDATE user_gamification 
    SET total_xp = total_xp + challenge_xp,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Buscar totais atuais do usuário
    SELECT total_xp INTO user_total_xp FROM user_gamification WHERE user_id = NEW.user_id;
    SELECT COUNT(*) INTO user_completed_challenges FROM user_challenge_progress WHERE user_id = NEW.user_id AND is_completed = true;
    
    -- Verificar conquistas por desafios completados
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'challenges_completed' 
      AND condition_value <= user_completed_challenges
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (NEW.user_id, achievement_record.id);
      -- Adicionar XP da conquista
      UPDATE user_gamification 
      SET total_xp = total_xp + achievement_record.xp_reward
      WHERE user_id = NEW.user_id;
    END LOOP;
    
    -- Verificar conquistas por XP total
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'total_xp' 
      AND condition_value <= user_total_xp
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) VALUES (NEW.user_id, achievement_record.id);
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar XP e conquistas
CREATE TRIGGER trigger_update_user_xp_and_achievements
  AFTER UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_xp_and_achievements();
