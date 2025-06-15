
-- Criar tabela para categorias do fórum
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para posts do fórum
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para respostas do fórum
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para likes de posts
CREATE TABLE public.forum_post_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Criar tabela para likes de respostas
CREATE TABLE public.forum_reply_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reply_id UUID REFERENCES public.forum_replies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(reply_id, user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_reply_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (leitura pública)
CREATE POLICY "Categories are viewable by everyone" 
  ON public.forum_categories 
  FOR SELECT 
  USING (true);

-- Políticas para posts
CREATE POLICY "Posts are viewable by everyone" 
  ON public.forum_posts 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create posts" 
  ON public.forum_posts 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
  ON public.forum_posts 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
  ON public.forum_posts 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para respostas
CREATE POLICY "Replies are viewable by everyone" 
  ON public.forum_replies 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create replies" 
  ON public.forum_replies 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies" 
  ON public.forum_replies 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies" 
  ON public.forum_replies 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para likes de posts
CREATE POLICY "Post likes are viewable by everyone" 
  ON public.forum_post_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can like posts" 
  ON public.forum_post_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
  ON public.forum_post_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas para likes de respostas
CREATE POLICY "Reply likes are viewable by everyone" 
  ON public.forum_reply_likes 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can like replies" 
  ON public.forum_reply_likes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own likes" 
  ON public.forum_reply_likes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Inserir categorias padrão
INSERT INTO public.forum_categories (name, description, icon, color) VALUES
('Treinos', 'Discussões sobre exercícios, rotinas e técnicas de treino', 'Dumbbell', '#3B82F6'),
('Nutrição', 'Dicas de alimentação, dietas e suplementos', 'Apple', '#10B981'),
('Motivação', 'Histórias inspiradoras e apoio mútuo', 'Heart', '#EF4444'),
('Equipamentos', 'Recomendações de equipamentos e acessórios', 'Settings', '#8B5CF6'),
('Dúvidas Gerais', 'Perguntas diversas sobre fitness e saúde', 'HelpCircle', '#F59E0B');

-- Função para atualizar contadores de likes e respostas
CREATE OR REPLACE FUNCTION update_forum_counters()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar contador de likes de posts
  IF TG_TABLE_NAME = 'forum_post_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_posts 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_posts 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;

  -- Atualizar contador de likes de respostas
  IF TG_TABLE_NAME = 'forum_reply_likes' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_replies 
      SET likes_count = likes_count + 1 
      WHERE id = NEW.reply_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_replies 
      SET likes_count = likes_count - 1 
      WHERE id = OLD.reply_id;
    END IF;
  END IF;

  -- Atualizar contador de respostas de posts
  IF TG_TABLE_NAME = 'forum_replies' THEN
    IF TG_OP = 'INSERT' THEN
      UPDATE public.forum_posts 
      SET replies_count = replies_count + 1 
      WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
      UPDATE public.forum_posts 
      SET replies_count = replies_count - 1 
      WHERE id = OLD.post_id;
    END IF;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar contadores
CREATE TRIGGER forum_post_likes_counter
  AFTER INSERT OR DELETE ON public.forum_post_likes
  FOR EACH ROW EXECUTE FUNCTION update_forum_counters();

CREATE TRIGGER forum_reply_likes_counter
  AFTER INSERT OR DELETE ON public.forum_reply_likes
  FOR EACH ROW EXECUTE FUNCTION update_forum_counters();

CREATE TRIGGER forum_replies_counter
  AFTER INSERT OR DELETE ON public.forum_replies
  FOR EACH ROW EXECUTE FUNCTION update_forum_counters();
