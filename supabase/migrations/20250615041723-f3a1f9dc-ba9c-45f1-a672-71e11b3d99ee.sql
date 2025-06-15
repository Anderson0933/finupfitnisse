
-- Primeiro, vamos verificar e corrigir a função de desbloqueio de conquistas
CREATE OR REPLACE FUNCTION update_user_xp_and_achievements()
RETURNS TRIGGER AS $$
DECLARE
  challenge_xp INTEGER;
  user_total_xp INTEGER;
  user_completed_challenges INTEGER;
  user_current_streak INTEGER;
  achievement_record RECORD;
  new_level INTEGER;
BEGIN
  -- Se o desafio foi completado
  IF NEW.is_completed = true AND (OLD IS NULL OR OLD.is_completed = false) THEN
    -- Buscar XP do desafio
    SELECT xp_reward INTO challenge_xp FROM challenges WHERE id = NEW.challenge_id;
    
    -- Atualizar XP do usuário na tabela user_gamification
    UPDATE user_gamification 
    SET total_xp = total_xp + challenge_xp,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Buscar totais atuais do usuário após a atualização
    SELECT total_xp, current_streak INTO user_total_xp, user_current_streak 
    FROM user_gamification 
    WHERE user_id = NEW.user_id;
    
    -- Calcular novo nível
    new_level := FLOOR(user_total_xp / 100) + 1;
    
    -- Atualizar nível se necessário
    UPDATE user_gamification 
    SET current_level = new_level
    WHERE user_id = NEW.user_id AND current_level != new_level;
    
    -- Contar desafios completados
    SELECT COUNT(*) INTO user_completed_challenges 
    FROM user_challenge_progress 
    WHERE user_id = NEW.user_id AND is_completed = true;
    
    -- Verificar e desbloquear conquistas por desafios completados
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'challenges_completed' 
      AND condition_value <= user_completed_challenges
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (NEW.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
      
      -- Adicionar XP da conquista
      UPDATE user_gamification 
      SET total_xp = total_xp + achievement_record.xp_reward,
          updated_at = now()
      WHERE user_id = NEW.user_id;
    END LOOP;
    
    -- Verificar conquistas por XP total (usar o XP atualizado)
    SELECT total_xp INTO user_total_xp FROM user_gamification WHERE user_id = NEW.user_id;
    
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'total_xp' 
      AND condition_value <= user_total_xp
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (NEW.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
    
    -- Verificar conquistas por sequência
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'streak_days' 
      AND condition_value <= user_current_streak
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = NEW.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (NEW.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger para garantir que está ativo
DROP TRIGGER IF EXISTS trigger_update_user_xp_and_achievements ON user_challenge_progress;
CREATE TRIGGER trigger_update_user_xp_and_achievements
  AFTER INSERT OR UPDATE ON user_challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_user_xp_and_achievements();

-- Script para verificar e desbloquear conquistas retroativamente para usuários existentes
DO $$
DECLARE
  user_record RECORD;
  user_total_xp INTEGER;
  user_completed_challenges INTEGER;
  user_current_streak INTEGER;
  achievement_record RECORD;
BEGIN
  -- Para cada usuário que tem gamificação
  FOR user_record IN 
    SELECT user_id, total_xp, current_streak 
    FROM user_gamification 
  LOOP
    user_total_xp := user_record.total_xp;
    user_current_streak := user_record.current_streak;
    
    -- Contar desafios completados
    SELECT COUNT(*) INTO user_completed_challenges 
    FROM user_challenge_progress 
    WHERE user_id = user_record.user_id AND is_completed = true;
    
    -- Verificar conquistas por desafios completados
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'challenges_completed' 
      AND condition_value <= user_completed_challenges
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_record.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_record.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
    
    -- Verificar conquistas por XP total
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'total_xp' 
      AND condition_value <= user_total_xp
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_record.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_record.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
    
    -- Verificar conquistas por sequência
    FOR achievement_record IN 
      SELECT * FROM achievements 
      WHERE condition_type = 'streak_days' 
      AND condition_value <= user_current_streak
      AND id NOT IN (SELECT achievement_id FROM user_achievements WHERE user_id = user_record.user_id)
    LOOP
      INSERT INTO user_achievements (user_id, achievement_id) 
      VALUES (user_record.user_id, achievement_record.id)
      ON CONFLICT (user_id, achievement_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;
