
-- Função para adicionar à fila de geração
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

-- Função para deletar itens da fila de um usuário
CREATE OR REPLACE FUNCTION public.delete_user_queue_items(
  p_user_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.workout_plan_queue 
  WHERE user_id = p_user_id;
END;
$$;

-- Garantir que as funções tenham as permissões corretas
GRANT EXECUTE ON FUNCTION public.add_to_workout_queue(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_user_queue_items(UUID) TO authenticated;
