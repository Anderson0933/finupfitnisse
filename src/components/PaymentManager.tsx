
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CreditCard, Check, RefreshCw, Sparkles, User as UserIcon } from 'lucide-react';

interface PaymentManagerProps {
  user: User | null;
  hasActiveSubscription: boolean;
}

const PaymentManager = ({ user, hasActiveSubscription }: PaymentManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [cpf, setCpf] = useState('');
  const { toast } = useToast();

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  };

  const createSubscription = async () => {
    if (!user || !cpf) {
      toast({
        title: "CPF obrigatório",
        description: "Por favor, informe seu CPF para gerar o PIX.",
        variant: "destructive",
      });
      return;
    }

    // Validar CPF (mínimo 11 dígitos)
    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      toast({
        title: "CPF inválido",
        description: "Por favor, informe um CPF válido com 11 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Enviando dados para criar assinatura:', {
        userEmail: user.email,
        amount: 69.90,
        userId: user.id,
        cpf: cpf
      });

      const response = await supabase.functions.invoke('create-subscription', {
        body: { 
          userEmail: user.email,
          amount: 69.90,
          userId: user.id,
          cpf: cpf
        }
      });

      console.log('Resposta da função:', response);

      if (response.error) {
        console.error('Erro da função:', response.error);
        throw new Error(response.error.message || 'Erro ao processar pagamento');
      }

      if (!response.data) {
        throw new Error('Nenhum dado retornado da função');
      }

      console.log('Dados do PIX recebidos:', response.data);

      // Verificar se temos os dados necessários
      if (!response.data.pixCode) {
        throw new Error('Código PIX não foi gerado. Tente novamente.');
      }

      setPixData(response.data);
      
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX para realizar o pagamento.",
      });
    } catch (error: any) {
      console.error('Erro ao gerar PIX:', error);
      toast({
        title: "Erro ao gerar PIX",
        description: error.message || 'Erro desconhecido ao gerar PIX',
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
        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-green-800 text-xl md:text-2xl">Assinatura Ativa</CardTitle>
            <CardDescription className="text-green-600">
              Sua assinatura FitAI Pro está ativa e funcionando perfeitamente!
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <Sparkles className="h-5 w-5" />
              <span className="font-medium">Acesso completo a todas as funcionalidades</span>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-700 text-sm">
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
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-blue-800 text-xl md:text-2xl">Ativar Assinatura</CardTitle>
            <CardDescription className="text-blue-600">
              Continue aproveitando todos os recursos do FitAI Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">R$ 69,90</div>
              <div className="text-blue-600">por mês</div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                <span>Planos de treino personalizados com IA</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                <span>Assistente virtual 24/7</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                <span>Acompanhamento de evolução</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700 text-sm md:text-base">
                <Check className="h-4 w-4 md:h-5 md:w-5 text-green-500 flex-shrink-0" />
                <span>Dicas de nutrição personalizada</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <UserIcon className="h-4 w-4 text-blue-600" />
                <Label className="text-blue-800 font-medium">CPF (obrigatório para PIX)</Label>
              </div>
              <Input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(formatCPF(e.target.value))}
                maxLength={14}
                className="border-blue-200 focus:border-blue-400"
              />
              {cpf && cpf.replace(/\D/g, '').length !== 11 && (
                <p className="text-red-500 text-sm mt-1">CPF deve ter 11 dígitos</p>
              )}
            </div>

            <Button 
              onClick={createSubscription} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-base md:text-lg"
              disabled={loading || !cpf || cpf.replace(/\D/g, '').length !== 11}
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
        <Card className="bg-white border-orange-200 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-orange-800 text-xl md:text-2xl">Pagamento via PIX</CardTitle>
            <CardDescription className="text-orange-600">
              Escaneie o QR Code ou copie o código PIX abaixo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {pixData.qrCodeImage && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
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
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                disabled={!pixData.pixCode}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {pixData.pixCode ? 'Copiar Código PIX' : 'Código PIX não disponível'}
              </Button>

              <Button 
                onClick={verifyPayment}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3"
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

            <div className="text-center text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-4">
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
