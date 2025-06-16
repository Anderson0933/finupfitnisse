
import { useState, useEffect } from 'react';
import { toast } from "@/components/ui/use-toast"
import { supabase } from '@/integrations/supabase/client';

interface PaymentManagerProps {
  user?: any;
  hasActiveSubscription?: boolean;
  onPaymentSuccess?: () => void;
}

const PaymentManager = ({ user: propUser, hasActiveSubscription, onPaymentSuccess }: PaymentManagerProps) => {
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [user, setUser] = useState<any>(propUser || null);

  useEffect(() => {
    // Get current user if not provided via props
    if (!propUser) {
      const getCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      };
      getCurrentUser();
    } else {
      setUser(propUser);
    }
  }, [propUser]);

  useEffect(() => {
    // Extract paymentId from URL
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('paymentId');
    if (payment) {
      setPaymentId(payment);
    }
  }, []);

  useEffect(() => {
    if (paymentId && user) {
      handlePaymentVerification();
    }
  }, [paymentId, user]);

  const handlePaymentVerification = async () => {
    if (!paymentId || !user) return;

    setVerifying(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: {
          paymentId: paymentId,
          userId: user.id
        }
      });

      if (error) {
        console.error('Erro na verificação:', error);
        toast({
          title: "Erro na Verificação",
          description: "Erro ao verificar o pagamento. Tente novamente.",
          variant: "destructive"
        });
        return;
      }
      
      if (data.paid) {
        // Processar conversão de afiliado se o pagamento foi confirmado
        try {
          await supabase.functions.invoke('process-affiliate-conversion', {
            body: {
              userId: user.id,
              subscriptionId: paymentId // Usar o paymentId como referência
            }
          });
        } catch (affiliateError) {
          console.log('Erro ao processar afiliado (não crítico):', affiliateError);
        }

        setPaymentStatus('confirmed');
        toast({
          title: "Pagamento Confirmado! 🎉",
          description: "Sua assinatura foi ativada com sucesso!"
        });
        onPaymentSuccess?.();
      } else {
        toast({
          title: "Pagamento Pendente",
          description: "O pagamento ainda não foi processado. Tente novamente em alguns minutos."
        });
      }
    } catch (error) {
      console.error('Erro na verificação:', error);
      toast({
        title: "Erro na Verificação",
        description: "Erro ao verificar o pagamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div>
      {verifying && <p>Verificando pagamento...</p>}
      {paymentStatus === 'confirmed' && <p>Pagamento confirmado!</p>}
      {paymentStatus !== 'confirmed' && paymentStatus !== null && <p>Pagamento pendente ou falhou.</p>}
    </div>
  );
};

export default PaymentManager;
