
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CreditCard, Check, Dumbbell } from 'lucide-react';

interface SubscriptionManagerProps {
  user: User | null;
}

const SubscriptionManager = ({ user }: SubscriptionManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const { toast } = useToast();

  const createSubscription = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await supabase.functions.invoke('create-subscription', {
        body: { 
          userEmail: user.email,
          amount: 69.90
        }
      });

      if (response.error) throw response.error;

      setPixData(response.data);
      
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para realizar o pagamento.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao gerar PIX",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async () => {
    if (!pixData || !user) return;

    setVerifying(true);
    try {
      const response = await supabase.functions.invoke('verify-payment', {
        body: { 
          paymentId: pixData.paymentId,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      if (response.data.paid) {
        toast({
          title: "Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso. Redirecionando...",
        });
        
        // Recarregar a página para atualizar o status da assinatura
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast({
          title: "Pagamento não identificado",
          description: "O pagamento ainda não foi processado. Tente novamente em alguns instantes.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro ao verificar pagamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      toast({
        title: "Código PIX copiado!",
        description: "Cole no seu banco para realizar o pagamento.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Dumbbell className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FitAI Pro</h1>
          <p className="text-blue-200">Ative sua assinatura para continuar</p>
        </div>

        {!pixData ? (
          <Card className="glass border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Plano Premium</CardTitle>
              <CardDescription className="text-blue-200">
                Acesso completo a todas as funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-2">R$ 69,90</div>
                <div className="text-blue-200">por mês</div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Planos de treino personalizados com IA</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Assistente virtual 24/7</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Acompanhamento de evolução</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Dicas de nutrição personalizada</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                  <Check className="h-5 w-5 text-green-400" />
                  <span>Suporte especializado</span>
                </div>
              </div>

              <Button 
                onClick={createSubscription} 
                className="w-full glow-button"
                disabled={loading}
              >
                {loading ? 'Gerando PIX...' : 'Assinar com PIX'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass border-white/20">
            <CardHeader className="text-center">
              <CardTitle className="text-white">Pagamento via PIX</CardTitle>
              <CardDescription className="text-blue-200">
                Escaneie o QR Code ou copie o código PIX
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pixData.qrCodeImage && (
                <div className="flex justify-center">
                  <div className="bg-white p-4 rounded-lg">
                    <img 
                      src={pixData.qrCodeImage} 
                      alt="QR Code PIX" 
                      className="w-48 h-48"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={copyPixCode}
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Copiar Código PIX
                </Button>

                <Button 
                  onClick={verifyPayment}
                  className="w-full glow-button"
                  disabled={verifying}
                >
                  {verifying ? 'Verificando...' : 'Verificar Pagamento'}
                </Button>
              </div>

              <div className="text-center text-sm text-blue-200">
                <p>Valor: R$ 69,90</p>
                <p className="mt-2">
                  Após o pagamento, clique em "Verificar Pagamento" para ativar sua assinatura
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
