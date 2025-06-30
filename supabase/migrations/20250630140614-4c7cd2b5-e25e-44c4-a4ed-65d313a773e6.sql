
-- Função para ativar promoter automaticamente quando o usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_promoter_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  promoter_code_from_meta text;
BEGIN
  -- Extrair o promoter_code dos metadados do usuário
  promoter_code_from_meta := NEW.raw_user_meta_data->>'promoter_code';
  
  -- Se há um promoter_code nos metadados, ativar o promoter
  IF promoter_code_from_meta IS NOT NULL THEN
    UPDATE public.promoters 
    SET 
      user_id = NEW.id,
      status = 'active',
      updated_at = now()
    WHERE 
      promoter_code = promoter_code_from_meta 
      AND status = 'pending';
      
    -- Log para debug
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type
    ) VALUES (
      NEW.id,
      'Conta de Promoter Ativada',
      'Sua conta de promoter foi ativada automaticamente!',
      'success'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Criar trigger que executa após inserir um usuário
DROP TRIGGER IF EXISTS on_auth_user_promoter_signup ON auth.users;
CREATE TRIGGER on_auth_user_promoter_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_promoter_signup();

-- Corrigir o registro atual do Anderson (conectar ao user_id correto)
UPDATE public.promoters 
SET 
  user_id = '76a3ae4c-bdeb-45d4-9caf-ec561240a2fe',
  status = 'active',
  updated_at = now()
WHERE 
  email = 'andersongameryt325@gmail.com' 
  AND status = 'pending';
