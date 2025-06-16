
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useReferralTracking = () => {
  useEffect(() => {
    const trackReferral = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      
      if (referralCode) {
        // Salvar código de referência no localStorage
        localStorage.setItem('referralCode', referralCode);
        
        // Limpar URL sem recarregar a página
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        
        try {
          // Buscar afiliado pelo código
          const { data: affiliate, error } = await supabase
            .from('affiliates')
            .select('id, affiliate_code')
            .eq('affiliate_code', referralCode)
            .eq('status', 'active')
            .single();

          if (error || !affiliate) {
            console.log('Código de referência inválido ou afiliado inativo');
            return;
          }

          // Verificar se o usuário está logado
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // Se já está logado, criar referência imediatamente
            await createReferral(affiliate.id, user.id, referralCode);
          }
          // Se não está logado, a referência será criada após o login/cadastro
          
        } catch (error) {
          console.error('Erro ao processar referência:', error);
        }
      }
    };

    trackReferral();
  }, []);

  const createReferral = async (affiliateId: string, userId: string, referralCode: string) => {
    try {
      // Verificar se já existe uma referência para este usuário
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('id')
        .eq('referred_user_id', userId)
        .single();

      if (existingReferral) {
        console.log('Usuário já possui uma referência');
        return;
      }

      // Criar nova referência
      const { error } = await supabase
        .from('referrals')
        .insert([{
          affiliate_id: affiliateId,
          referred_user_id: userId,
          referral_code: referralCode,
          status: 'pending'
        }]);

      if (error) {
        console.error('Erro ao criar referência:', error);
      } else {
        console.log('Referência criada com sucesso');
        // Limpar código do localStorage após criar a referência
        localStorage.removeItem('referralCode');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const processStoredReferral = async (userId: string) => {
    const storedReferralCode = localStorage.getItem('referralCode');
    
    if (storedReferralCode) {
      try {
        // Buscar afiliado pelo código armazenado
        const { data: affiliate, error } = await supabase
          .from('affiliates')
          .select('id')
          .eq('affiliate_code', storedReferralCode)
          .eq('status', 'active')
          .single();

        if (!error && affiliate) {
          await createReferral(affiliate.id, userId, storedReferralCode);
        }
      } catch (error) {
        console.error('Erro ao processar referência armazenada:', error);
      }
    }
  };

  return { processStoredReferral };
};
