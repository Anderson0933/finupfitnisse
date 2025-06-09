
-- Primeiro, vamos verificar quais políticas já existem e criar apenas as que faltam

-- Para ai_conversations (verificar se não existe antes de criar)
DO $$ 
BEGIN
    -- Habilitar RLS se não estiver habilitado
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'ai_conversations') THEN
        ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
    END IF;
    
    -- Criar políticas apenas se não existirem
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can view their own conversations') THEN
        CREATE POLICY "Users can view their own conversations" 
          ON public.ai_conversations 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can create their own conversations') THEN
        CREATE POLICY "Users can create their own conversations" 
          ON public.ai_conversations 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can update their own conversations') THEN
        CREATE POLICY "Users can update their own conversations" 
          ON public.ai_conversations 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'Users can delete their own conversations') THEN
        CREATE POLICY "Users can delete their own conversations" 
          ON public.ai_conversations 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para user_workout_plans
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'user_workout_plans') THEN
        ALTER TABLE public.user_workout_plans ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workout_plans' AND policyname = 'Users can view their own workout plans') THEN
        CREATE POLICY "Users can view their own workout plans" 
          ON public.user_workout_plans 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workout_plans' AND policyname = 'Users can create their own workout plans') THEN
        CREATE POLICY "Users can create their own workout plans" 
          ON public.user_workout_plans 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workout_plans' AND policyname = 'Users can update their own workout plans') THEN
        CREATE POLICY "Users can update their own workout plans" 
          ON public.user_workout_plans 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workout_plans' AND policyname = 'Users can delete their own workout plans') THEN
        CREATE POLICY "Users can delete their own workout plans" 
          ON public.user_workout_plans 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para user_progress
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'user_progress') THEN
        ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can view their own progress') THEN
        CREATE POLICY "Users can view their own progress" 
          ON public.user_progress 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can create their own progress') THEN
        CREATE POLICY "Users can create their own progress" 
          ON public.user_progress 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can update their own progress') THEN
        CREATE POLICY "Users can update their own progress" 
          ON public.user_progress 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_progress' AND policyname = 'Users can delete their own progress') THEN
        CREATE POLICY "Users can delete their own progress" 
          ON public.user_progress 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para user_profiles
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'user_profiles') THEN
        ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can view their own profiles') THEN
        CREATE POLICY "Users can view their own profiles" 
          ON public.user_profiles 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can create their own profiles') THEN
        CREATE POLICY "Users can create their own profiles" 
          ON public.user_profiles 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Users can update their own profiles') THEN
        CREATE POLICY "Users can update their own profiles" 
          ON public.user_profiles 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para user_gamification
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'user_gamification') THEN
        ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_gamification' AND policyname = 'Users can view their own gamification') THEN
        CREATE POLICY "Users can view their own gamification" 
          ON public.user_gamification 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_gamification' AND policyname = 'Users can create their own gamification') THEN
        CREATE POLICY "Users can create their own gamification" 
          ON public.user_gamification 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_gamification' AND policyname = 'Users can update their own gamification') THEN
        CREATE POLICY "Users can update their own gamification" 
          ON public.user_gamification 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para plan_progress
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'plan_progress') THEN
        ALTER TABLE public.plan_progress ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_progress' AND policyname = 'Users can view their own plan progress') THEN
        CREATE POLICY "Users can view their own plan progress" 
          ON public.plan_progress 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_progress' AND policyname = 'Users can create their own plan progress') THEN
        CREATE POLICY "Users can create their own plan progress" 
          ON public.plan_progress 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_progress' AND policyname = 'Users can update their own plan progress') THEN
        CREATE POLICY "Users can update their own plan progress" 
          ON public.plan_progress 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'plan_progress' AND policyname = 'Users can delete their own plan progress') THEN
        CREATE POLICY "Users can delete their own plan progress" 
          ON public.plan_progress 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;

-- Para workout_plans
DO $$ 
BEGIN
    IF NOT (SELECT pg_class.relrowsecurity FROM pg_class WHERE relname = 'workout_plans') THEN
        ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_plans' AND policyname = 'Users can view their own workout plans table') THEN
        CREATE POLICY "Users can view their own workout plans table" 
          ON public.workout_plans 
          FOR SELECT 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_plans' AND policyname = 'Users can create their own workout plans table') THEN
        CREATE POLICY "Users can create their own workout plans table" 
          ON public.workout_plans 
          FOR INSERT 
          WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_plans' AND policyname = 'Users can update their own workout plans table') THEN
        CREATE POLICY "Users can update their own workout plans table" 
          ON public.workout_plans 
          FOR UPDATE 
          USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_plans' AND policyname = 'Users can delete their own workout plans table') THEN
        CREATE POLICY "Users can delete their own workout plans table" 
          ON public.workout_plans 
          FOR DELETE 
          USING (auth.uid() = user_id);
    END IF;
END $$;
