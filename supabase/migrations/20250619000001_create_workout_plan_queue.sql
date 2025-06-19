
-- Criar tabela para fila de geração de planos
CREATE TABLE public.workout_plan_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  request_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  position_in_queue INTEGER,
  estimated_completion_time TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Índices para performance
CREATE INDEX idx_workout_plan_queue_user_id ON public.workout_plan_queue(user_id);
CREATE INDEX idx_workout_plan_queue_status ON public.workout_plan_queue(status);
CREATE INDEX idx_workout_plan_queue_position ON public.workout_plan_queue(position_in_queue);

-- RLS policies
ALTER TABLE public.workout_plan_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own queue items" 
  ON public.workout_plan_queue 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own queue items" 
  ON public.workout_plan_queue 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.workout_plan_queue 
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para calcular posição na fila
CREATE OR REPLACE FUNCTION public.update_queue_position()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar posições na fila para itens pendentes
  WITH queue_positions AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_position
    FROM public.workout_plan_queue 
    WHERE status = 'pending'
  )
  UPDATE public.workout_plan_queue 
  SET position_in_queue = queue_positions.new_position,
      estimated_completion_time = now() + (queue_positions.new_position * INTERVAL '2 minutes')
  FROM queue_positions 
  WHERE public.workout_plan_queue.id = queue_positions.id;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar posições quando há mudanças na fila
CREATE TRIGGER update_queue_positions 
  AFTER INSERT OR UPDATE OR DELETE ON public.workout_plan_queue 
  FOR EACH STATEMENT EXECUTE PROCEDURE public.update_queue_position();
