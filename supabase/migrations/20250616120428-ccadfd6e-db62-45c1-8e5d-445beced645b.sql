
-- Ajustar a comissão padrão de 30% para 15%
ALTER TABLE public.affiliates 
ALTER COLUMN commission_rate SET DEFAULT 15.00;

-- Atualizar a função de processamento para usar o valor correto nos comentários
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

    -- Calcular comissão (15% do valor da assinatura por padrão)
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
