
-- Corrigir a função add_to_workout_queue para resolver ambiguidade de coluna
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
    WHERE user_id = p_user_id AND workout_plan_queue.status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'Usuário já possui um item na fila de geração';
  END IF;

  -- Inserir novo item na fila
  RETURN QUERY
  INSERT INTO public.workout_plan_queue (user_id, request_data, status)
  VALUES (p_user_id, p_request_data, 'pending')
  RETURNING 
    workout_plan_queue.id,
    workout_plan_queue.status,
    workout_plan_queue.position_in_queue;
END;
$$;
