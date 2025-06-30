import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, CreditCard, Check, RefreshCw, Sparkles, User as UserIcon, Copy, AlertCircle, CheckCircle, History, Calendar, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PaymentManagerProps {
  user: User | null;
  hasActiveSubscription: boolean;
}

interface PaymentHistory {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  expires_at: string | null;
}

const PaymentManager = ({ user, hasActiveSubscription }: PaymentManagerProps) => {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [cpf, setCpf] = useState('');
  const [lastVerificationStatus, setLastVerificationStatus] = useState<string | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [autoChecking, setAutoChecking] = useState(false);
  const { toast } = useToast();

  // Polling automático para verificar status do pagamento
  useEffect(() => {
    if (!pixData || !user || hasActiveSubscription) return;

    const checkPaymentStatus = async () => {
      try {
        setAutoChecking(true);
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('payment_id', pixData.paymentId)
          .eq('user_id', user.id)
          .single();

        if (subscription?.status === 'active') {
          toast({
            title: "🎉 Pagamento confirmado automaticamente!",
            description: "Sua assinatura foi ativada. A página será recarregada em 2 segundos.",
          });
          
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      } catch (error) {
        console.log('Erro no polling (ignorado):', error);
      } finally {
        setAutoChecking(false);
      }
    };

    // Verificar a cada 15 segundos
    const interval = setInterval(checkPaymentStatus, 15000);
    
    // Verificar imediatamente
    checkPaymentStatus();

    return () => clearInterval(interval);
  }, [pixData, user, hasActiveSubscription, toast]);

  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
      return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cleaned;
  };

  const loadPaymentHistory = async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, amount, status, created_at, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar histórico:', error);
        toast({
          title: "Erro ao carregar histórico",
          description: "Não foi possível carregar o histórico de pagamentos.",
          variant: "destructive",
        });
        return;
      }

      setPaymentHistory(data || []);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      toast({
        title: "Erro ao carregar histórico",
        description: "Erro inesperado ao carregar histórico.",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadPaymentHistory();
    }
  }, [user]);

  const createSubscription = async () => {
    if (!user || !cpf) {
      toast({
        title: "CPF obrigatório",
        description: "Por favor, informe seu CPF para gerar o PIX.",
        variant: "destructive",
      });
      return;
    }

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
    setPixData(null);
    setLastVerificationStatus(null);
    
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

      if (!response.data.pixCode) {
        throw new Error('Código PIX não foi gerado. Tente novamente.');
      }

      setPixData(response.data);
      
      toast({
        title: "PIX gerado com sucesso!",
        description: "Escaneie o QR Code ou copie o código PIX. O pagamento será confirmado automaticamente.",
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
      console.log('Verificando pagamento:', { paymentId: pixData.paymentId, userId: user.id });

      const response = await supabase.functions.invoke('verify-payment', {
        body: { 
          paymentId: pixData.paymentId,
          userId: user.id
        }
      });

      console.log('Resposta da verificação:', response);

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao verificar pagamento');
      }

      setLastVerificationStatus(response.data.status);

      if (response.data.paid) {
        toast({
          title: "🎉 Pagamento confirmado!",
          description: "Sua assinatura foi ativada com sucesso. A página será recarregada em 3 segundos.",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        toast({
          title: "Pagamento pendente",
          description: `Status: ${response.data.status}. ${response.data.message || 'O pagamento ainda não foi processado.'}`,
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  if (hasActiveSubscription) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
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

        {/* Histórico de Pagamentos */}
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-blue-800">Histórico de Pagamentos</CardTitle>
            </div>
            <CardDescription className="text-blue-600">
              Seus pagamentos confirmados e ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-2" />
                <span>Carregando histórico...</span>
              </div>
            ) : paymentHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum pagamento confirmado encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data do Pagamento</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Válido até</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-blue-500" />
                          {formatDate(payment.created_at)}
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          {formatCurrency(payment.amount)}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Pago
                          </span>
                        </TableCell>
                        <TableCell className="text-blue-600">
                          {payment.expires_at ? formatDate(payment.expires_at) : 'Indefinido'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <Button
                onClick={loadPaymentHistory}
                variant="outline"
                className="w-full md:w-auto"
                disabled={loadingHistory}
              >
                {loadingHistory ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Atualizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar Histórico
                  </>
                )}
              </Button>
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
            {autoChecking && (
              <div className="flex items-center justify-center gap-2 text-blue-600 text-sm">
                <Clock className="h-4 w-4 animate-spin" />
                <span>Verificando pagamento automaticamente...</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Área do QR Code */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                {pixData.qrCodeImage ? (
                  <img 
                    src={pixData.qrCodeImage} 
                    alt="QR Code PIX" 
                    className="w-48 h-48 md:w-64 md:h-64"
                  />
                ) : (
                  <div className="w-48 h-48 md:w-64 md:h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mb-2" />
                    <p className="text-sm text-center px-4">
                      QR Code não disponível
                    </p>
                    <p className="text-xs text-center px-4 mt-1">
                      Use o código PIX abaixo
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={copyPixCode}
                variant="outline"
                className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
                disabled={!pixData.pixCode}
              >
                <Copy className="h-4 w-4 mr-2" />
                {pixData.pixCode ? 'Copiar Código PIX' : 'Código PIX não disponível'}
              </Button>

              {lastVerificationStatus && (
                <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-700 text-sm">Último status: {lastVerificationStatus}</span>
                </div>
              )}

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
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Validar Pagamento Manualmente
                  </>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-orange-700 bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="font-medium">Valor: R$ 69,90</p>
              <p className="mt-2">
                Seu pagamento será confirmado automaticamente em alguns instantes após a realização do PIX.
              </p>
              <p className="mt-1 text-xs">
                Caso não seja confirmado automaticamente, use o botão "Validar Pagamento Manualmente"
              </p>
              {pixData.paymentId && (
                <p className="mt-1 text-xs text-gray-600">
                  ID do Pagamento: {pixData.paymentId}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentManager;
