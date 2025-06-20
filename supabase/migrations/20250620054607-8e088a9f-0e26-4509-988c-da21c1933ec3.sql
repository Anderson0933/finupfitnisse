
-- Primeiro, vamos remover os triggers problemáticos
DROP TRIGGER IF EXISTS update_queue_positions ON public.workout_plan_queue;
DROP FUNCTION IF EXISTS public.update_queue_position();

-- Recriar a função de atualização de posição de forma mais simples
CREATE OR REPLACE FUNCTION public.update_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Apenas atualizar a posição se for um novo item pendente
  IF TG_OP = 'INSERT' AND NEW.status = 'pending' THEN
    -- Calcular posição baseada na contagem de itens pendentes
    NEW.position_in_queue := (
      SELECT COUNT(*) + 1 
      FROM public.workout_plan_queue 
      WHERE status = 'pending' AND created_at < NEW.created_at
    );
    NEW.estimated_completion_time := NEW.created_at + (NEW.position_in_queue * INTERVAL '2 minutes');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recriar o trigger apenas para INSERT
CREATE TRIGGER update_queue_positions 
  BEFORE INSERT ON public.workout_plan_queue 
  FOR EACH ROW EXECUTE PROCEDURE public.update_queue_position();

-- Função para adicionar à fila (mais simples e segura)
CREATE OR REPLACE FUNCTION public.add_to_workout_queue(
  p_user_id UUID,
  p_request_data JSONB
)
RETURNS TABLE(id UUID, status TEXT, position_in_queue INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar se o usuário já tem um item na fila
  IF EXISTS (
    SELECT 1 FROM public.workout_plan_queue 
    WHERE user_id = p_user_id AND status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'Usuário já possui um item na fila de geração';
  END IF;

  -- Inserir novo item na fila
  RETURN QUERY
  INSERT INTO public.workout_plan_queue (user_id, request_data, status)
  VALUES (p_user_id, p_request_data, 'pending')
  RETURNING 
    public.workout_plan_queue.id,
    public.workout_plan_queue.status,
    public.workout_plan_queue.position_in_queue;
END;
$$;

-- Garantir que a função tenha as permissões corretas
GRANT EXECUTE ON FUNCTION public.add_to_workout_queue(UUID, JSONB) TO authenticated;
