
-- Adicionar coluna para rastrear quando um promoter foi desativado
ALTER TABLE public.promoters 
ADD COLUMN deactivated_at timestamp with time zone;

-- Criar função para atualizar deactivated_at quando status muda para inactive
CREATE OR REPLACE FUNCTION public.handle_promoter_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Se o status mudou de active para inactive, registrar a data
  IF OLD.status = 'active' AND NEW.status = 'inactive' THEN
    NEW.deactivated_at = now();
  END IF;
  
  -- Se o status mudou de inactive para active, limpar a data
  IF OLD.status = 'inactive' AND NEW.status = 'active' THEN
    NEW.deactivated_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger para chamar a função quando o status do promoter mudar
DROP TRIGGER IF EXISTS on_promoter_status_change ON public.promoters;
CREATE TRIGGER on_promoter_status_change
  BEFORE UPDATE ON public.promoters
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_promoter_status_change();

-- Atualizar a função de limpeza para considerar ex-promoters
CREATE OR REPLACE FUNCTION public.cleanup_expired_accounts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record RECORD;
  deletion_count INTEGER := 0;
BEGIN
  -- Buscar usuários para exclusão baseado em diferentes critérios
  FOR user_record IN
    SELECT DISTINCT u.id, u.email, u.created_at,
           p.deactivated_at,
           p.status as promoter_status,
           s.id as active_subscription_id
    FROM auth.users u
    LEFT JOIN public.promoters p ON p.user_id = u.id
    LEFT JOIN public.subscriptions s ON s.user_id = u.id 
      AND s.status = 'active' 
      AND s.expires_at > now()
    WHERE 
      -- Usuários sem assinatura ativa
      s.id IS NULL
      AND (
        -- Caso 1: Usuários normais criados há mais de 48h
        (p.id IS NULL AND u.created_at < now() - interval '48 hours')
        OR
        -- Caso 2: Ex-promoters desativados há mais de 48h
        (p.status = 'inactive' AND p.deactivated_at IS NOT NULL AND p.deactivated_at < now() - interval '48 hours')
      )
  LOOP
    BEGIN
      -- Log da exclusão
      RAISE NOTICE 'Excluindo usuário: % (criado em: %, promoter desativado em: %)', 
        user_record.email, user_record.created_at, user_record.deactivated_at;
      
      -- Excluir dados relacionados em ordem
      DELETE FROM public.ai_conversations WHERE user_id = user_record.id;
      DELETE FROM public.user_progress WHERE user_id = user_record.id;
      DELETE FROM public.user_workout_plans WHERE user_id = user_record.id;
      DELETE FROM public.workout_plans WHERE user_id = user_record.id;
      DELETE FROM public.user_profiles WHERE user_id = user_record.id;
      DELETE FROM public.plan_progress WHERE user_id = user_record.id;
      DELETE FROM public.subscriptions WHERE user_id = user_record.id;
      DELETE FROM public.promoters WHERE user_id = user_record.id;
      DELETE FROM public.profiles WHERE id = user_record.id;
      DELETE FROM public.user_onboarding_status WHERE user_id = user_record.id;
      DELETE FROM public.user_gamification WHERE user_id = user_record.id;
      DELETE FROM public.user_challenge_progress WHERE user_id = user_record.id;
      DELETE FROM public.user_achievements WHERE user_id = user_record.id;
      DELETE FROM public.notifications WHERE user_id = user_record.id;
      
      -- Excluir usuário do auth
      DELETE FROM auth.users WHERE id = user_record.id;
      
      deletion_count := deletion_count + 1;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao excluir usuário %: %', user_record.email, SQLERRM;
    END;
  END LOOP;
  
  RAISE NOTICE 'Limpeza concluída: % contas excluídas', deletion_count;
END;
$$;
