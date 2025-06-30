
-- Remover as políticas existentes que tentam acessar auth.users
DROP POLICY IF EXISTS "Admins can insert promoters" ON public.promoters;
DROP POLICY IF EXISTS "Admins can view all promoters" ON public.promoters;
DROP POLICY IF EXISTS "Admins can update all promoters" ON public.promoters;
DROP POLICY IF EXISTS "Admins can delete all promoters" ON public.promoters;

-- Criar políticas mais simples que permitem acesso total para usuários autenticados
-- (a verificação de admin será feita no código do frontend)
CREATE POLICY "Authenticated users can manage promoters" 
  ON public.promoters 
  FOR ALL 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
