
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CreditCard, Check, RefreshCw, Sparkles } from 'lucide-react';

interface PaymentManagerProps {
  user: User | null;
  hasActiveSubscription: boolean;
}

const PaymentManager = ({ user, hasActiveSubscription }: PaymentManagerProps) => {
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
          amount: 69.90,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      setPixData(response.data);
      
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para realizar o pagamento.",
      });
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
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
          description: `Status: ${response.data.status}. O pagamento ainda não foi processado. Tente novamente em alguns instantes.`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Erro ao verificar pagamento:', error);
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

  if (hasActiveSubscription) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-400/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl md:text-2xl">Assinatura Ativa</CardTitle>
            <CardDescription className="text-green-200">
              Sua assinatura FitAI Pro está ativa e funcionando perfeitamente!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-300">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Acesso completo a todas as funcionalidades</span>
            </div>
            <div className="bg-green-500/20 rounded-lg p-4">
              <p className="text-green-200 text-sm">
                Aproveite todos os recursos do FitAI Pro: treinos personalizados, assistente de IA, 
                acompanhamento de progresso e dicas de nutrição.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {!pixData ? (
        <Card className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-white text-xl md:text-2xl">Renovar Assinatura</CardTitle>
            <CardDescription className="text-blue-200">
              Continue aproveitando todos os recursos do FitAI Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">R$ 69,90</div>
              <div className="text-blue-200">por mês</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-white text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0" />
                <span>Planos de treino personalizados com IA</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0" />
                <span>Assistente virtual 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0" />
                <span>Acompanhamento de evolução</span>
              </div>
              <div className="flex items-center gap-3 text-white text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0" />
                <span>Dicas de nutrição personalizada</span>
              </div>
            </div>

            <Button 
              onClick={createSubscription} 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 text-base md:text-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando PIX...
                </>
              ) : (
                <>
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar PIX para Pagamento
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-yellow-400/30 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-white text-xl md:text-2xl">Pagamento via PIX</CardTitle>
            <CardDescription className="text-yellow-200">
              Escaneie o QR Code ou copie o código PIX abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pixData.qrCodeImage && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <img 
                    src={pixData.qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 md:w-64 md:h-64"
                  />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Button 
                onClick={copyPixCode}
                variant="outline"
                className="w-full border-yellow-400/30 text-white hover:bg-yellow-500/20 bg-yellow-500/10"
                disabled={!pixData.pixCode}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {pixData.pixCode ? 'Copiar Código PIX' : 'Código PIX não disponível'}
              </Button>

              <Button 
                onClick={verifyPayment}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verificando pagamento...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Validar Pagamento
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-yellow-200 bg-yellow-500/10 rounded-lg p-4">
              <p className="font-medium">Valor: R$ 69,90</p>
              <p className="mt-2">
                Após realizar o pagamento via PIX, clique em "Validar Pagamento" para ativar sua assinatura
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentManager;
