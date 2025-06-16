
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AffiliateData {
  id: string;
  user_id: string;
  affiliate_code: string;
  status: string;
  commission_rate: number;
  total_earnings: number;
  total_referrals: number;
  pix_key?: string;
  created_at: string;
}

interface ReferralData {
  id: string;
  referral_code: string;
  status: string;
  conversion_date?: string;
  created_at: string;
}

interface CommissionData {
  id: string;
  amount: number;
  commission_rate: number;
  status: string;
  payment_date?: string;
  created_at: string;
}

export const useAffiliateSystem = () => {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<ReferralData[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAffiliateData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Buscar dados do afiliado
      const { data: affiliateData, error: affiliateError } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (affiliateError && affiliateError.code !== 'PGRST116') {
        console.error('Erro ao buscar afiliado:', affiliateError);
        return;
      }

      if (affiliateData) {
        setAffiliate(affiliateData);

        // Buscar referências
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('created_at', { ascending: false });

        if (referralsError) {
          console.error('Erro ao buscar referências:', referralsError);
        } else {
          setReferrals(referralsData || []);
        }

        // Buscar comissões
        const { data: commissionsData, error: commissionsError } = await supabase
          .from('commissions')
          .select('*')
          .eq('affiliate_id', affiliateData.id)
          .order('created_at', { ascending: false });

        if (commissionsError) {
          console.error('Erro ao buscar comissões:', commissionsError);
        } else {
          setCommissions(commissionsData || []);
        }
      }
    } catch (error) {
      console.error('Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAffiliate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para se tornar afiliado",
          variant: "destructive"
        });
        return;
      }

      // O affiliate_code será gerado automaticamente pelo trigger
      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          commission_rate: 15.00
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar afiliado:', error);
        toast({
          title: "Erro",
          description: "Erro ao criar conta de afiliado",
          variant: "destructive"
        });
        return;
      }

      setAffiliate(data);
      toast({
        title: "Sucesso!",
        description: "Conta de afiliado criada com sucesso!"
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao criar conta",
        variant: "destructive"
      });
    }
  };

  const updatePixKey = async (pixKey: string) => {
    if (!affiliate) return;

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ pix_key: pixKey })
        .eq('id', affiliate.id);

      if (error) {
        console.error('Erro ao atualizar PIX:', error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar chave PIX",
          variant: "destructive"
        });
        return;
      }

      setAffiliate({ ...affiliate, pix_key: pixKey });
      toast({
        title: "Sucesso!",
        description: "Chave PIX atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  return {
    affiliate,
    referrals,
    commissions,
    loading,
    createAffiliate,
    updatePixKey,
    refreshData: fetchAffiliateData
  };
};
