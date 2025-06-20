
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

-- Garantir que a função tenha as permissões corretas
GRANT EXECUTE ON FUNCTION public.delete_user_queue_items(UUID) TO authenticated;
