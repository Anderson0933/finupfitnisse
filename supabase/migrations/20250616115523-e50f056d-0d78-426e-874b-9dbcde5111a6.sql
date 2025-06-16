
-- Criar tabela de afiliados
CREATE TABLE public.affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  affiliate_code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  commission_rate DECIMAL(5,2) NOT NULL DEFAULT 30.00, -- Porcentagem de comissão
  total_earnings DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_referrals INTEGER NOT NULL DEFAULT 0,
  pix_key TEXT,
  bank_details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de referências/indicações
CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'expired')),
  conversion_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de comissões
CREATE TABLE public.commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  referral_id UUID REFERENCES public.referrals(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de saques de afiliados
CREATE TABLE public.affiliate_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID REFERENCES public.affiliates(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  pix_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payment_proof TEXT,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  notes TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_withdrawals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para affiliates
CREATE POLICY "Usuários podem ver seu próprio registro de afiliado"
ON public.affiliates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seu próprio registro de afiliado"
ON public.affiliates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seu próprio registro de afiliado"
ON public.affiliates FOR UPDATE
USING (auth.uid() = user_id);

-- Políticas RLS para referrals
CREATE POLICY "Afiliados podem ver suas próprias referências"
ON public.referrals FOR SELECT
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Sistema pode criar referências"
ON public.referrals FOR INSERT
WITH CHECK (true);

-- Políticas RLS para commissions
CREATE POLICY "Afiliados podem ver suas próprias comissões"
ON public.commissions FOR SELECT
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Políticas RLS para affiliate_withdrawals
CREATE POLICY "Afiliados podem ver seus próprios saques"
ON public.affiliate_withdrawals FOR SELECT
USING (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Afiliados podem criar saques"
ON public.affiliate_withdrawals FOR INSERT
WITH CHECK (
  affiliate_id IN (
    SELECT id FROM public.affiliates WHERE user_id = auth.uid()
  )
);

-- Função para gerar código de afiliado único
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Gerar código aleatório de 8 caracteres
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Verificar se já existe
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = code) INTO exists_check;
    
    -- Se não existe, retornar o código
    IF NOT exists_check THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Trigger para gerar código de afiliado automaticamente
CREATE OR REPLACE FUNCTION handle_new_affiliate()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.affiliate_code IS NULL OR NEW.affiliate_code = '' THEN
    NEW.affiliate_code := generate_affiliate_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_affiliate_code
  BEFORE INSERT ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_affiliate();

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_referrals_updated_at
  BEFORE UPDATE ON public.referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para processar conversão de referência
CREATE OR REPLACE FUNCTION process_referral_conversion(
  p_referred_user_id UUID,
  p_subscription_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_referral_record RECORD;
  v_commission_amount DECIMAL(10,2);
BEGIN
  -- Buscar referência pendente
  SELECT r.*, a.commission_rate 
  INTO v_referral_record
  FROM public.referrals r
  JOIN public.affiliates a ON r.affiliate_id = a.id
  WHERE r.referred_user_id = p_referred_user_id 
  AND r.status = 'pending'
  LIMIT 1;

  IF FOUND THEN
    -- Marcar referência como convertida
    UPDATE public.referrals 
    SET status = 'converted', 
        conversion_date = now(),
        updated_at = now()
    WHERE id = v_referral_record.id;

    -- Calcular comissão (30% do valor da assinatura)
    v_commission_amount := 69.90 * (v_referral_record.commission_rate / 100);

    -- Criar comissão
    INSERT INTO public.commissions (
      affiliate_id,
      referral_id,
      subscription_id,
      amount,
      commission_rate,
      status
    ) VALUES (
      v_referral_record.affiliate_id,
      v_referral_record.id,
      p_subscription_id,
      v_commission_amount,
      v_referral_record.commission_rate,
      'approved'
    );

    -- Atualizar totais do afiliado
    UPDATE public.affiliates 
    SET total_earnings = total_earnings + v_commission_amount,
        total_referrals = total_referrals + 1,
        updated_at = now()
    WHERE id = v_referral_record.affiliate_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Adicionar campo para rastrear origem da referência na tabela subscriptions
ALTER TABLE public.subscriptions 
ADD COLUMN referral_code TEXT,
ADD COLUMN referred_by_affiliate_id UUID REFERENCES public.affiliates(id);

-- Comentários para documentação
COMMENT ON TABLE public.affiliates IS 'Tabela de afiliados do sistema';
COMMENT ON TABLE public.referrals IS 'Tabela de referências/indicações dos afiliados';
COMMENT ON TABLE public.commissions IS 'Tabela de comissões geradas pelas referências';
COMMENT ON TABLE public.affiliate_withdrawals IS 'Tabela de solicitações de saque dos afiliados';
COMMENT ON FUNCTION process_referral_conversion IS 'Função para processar conversão de referência em assinatura paga';
