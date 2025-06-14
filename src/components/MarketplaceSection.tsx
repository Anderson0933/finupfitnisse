
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Star, TrendingUp, Award, Copy, CheckCircle, DollarSign, Target, Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AffiliateStats {
  totalReferrals: number;
  activeSubscriptions: number;
  totalEarnings: number;
  pendingCommission: number;
  conversionRate: number;
}

const MarketplaceSection = () => {
  const { toast } = useToast();
  const [affiliateCode, setAffiliateCode] = useState('FITPRO_USER123');
  const [copied, setCopied] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);

  // Dados simulados do afiliado
  const affiliateStats: AffiliateStats = {
    totalReferrals: 12,
    activeSubscriptions: 8,
    totalEarnings: 480.00,
    pendingCommission: 120.00,
    conversionRate: 66.7
  };

  const handleCopyAffiliateLink = () => {
    // Usar a URL atual da aplicação
    const currentDomain = window.location.origin;
    const affiliateLink = `${currentDomain}/?ref=${affiliateCode}`;
    
    navigator.clipboard.writeText(affiliateLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Link copiado!",
      description: "Seu link de afiliado foi copiado para a área de transferência.",
    });
  };

  const handleRequestPayout = async () => {
    if (affiliateStats.pendingCommission < 50) {
      toast({
        title: "Valor insuficiente",
        description: "O valor mínimo para saque é R$ 50,00.",
        variant: "destructive"
      });
      return;
    }

    setIsRequestingPayout(true);

    try {
      // Aqui você pode implementar a lógica real de saque
      // Por exemplo, salvar a solicitação no banco de dados
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Simular uma requisição de saque (você pode implementar a lógica real aqui)
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Saque solicitado com sucesso!",
        description: `Solicitação de saque de R$ ${affiliateStats.pendingCommission.toFixed(2)} será processada em até 3 dias úteis.`,
      });

      // Aqui você resetaria o valor pendente após a solicitação
      // affiliateStats.pendingCommission = 0; (isso seria feito via API real)

    } catch (error) {
      console.error('Erro ao solicitar saque:', error);
      toast({
        title: "Erro ao processar saque",
        description: "Ocorreu um erro ao processar sua solicitação. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRequestingPayout(false);
    }
  };

  const currentDomain = window.location.origin;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
          <Users className="h-8 w-8" />
          Programa de Afiliados FitPro
        </h2>
        <p className="text-blue-600 max-w-2xl mx-auto">
          Ganhe 30% de comissão para cada novo cliente que contratar nossos planos através do seu link!
        </p>
      </div>

      {/* Banner de Destaque */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Gift className="h-6 w-6" />
            🎉 Promoção Especial: 40% de Comissão!
          </CardTitle>
          <CardDescription>
            Por tempo limitado, ganhe 40% de comissão em todos os novos clientes até o final do mês!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Estatísticas do Afiliado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total de Indicações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">{affiliateStats.totalReferrals}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Assinaturas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-green-800">{affiliateStats.activeSubscriptions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Ganho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-800">R$ {affiliateStats.totalEarnings.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Taxa de Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-orange-800">{affiliateStats.conversionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Seu Link de Afiliado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Seu Link de Afiliado
            </CardTitle>
            <CardDescription>
              Compartilhe este link para ganhar comissões
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Código do Afiliado
              </label>
              <div className="flex gap-2">
                <Input 
                  value={affiliateCode} 
                  onChange={(e) => setAffiliateCode(e.target.value)}
                  className="font-mono"
                />
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Link Completo
              </label>
              <div className="flex gap-2">
                <Input 
                  value={`${currentDomain}/?ref=${affiliateCode}`}
                  readOnly
                  className="font-mono text-sm bg-gray-50"
                />
                <Button 
                  onClick={handleCopyAffiliateLink}
                  variant={copied ? "default" : "outline"}
                  size="sm"
                  className="min-w-[80px]"
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">💡 Dica de Compartilhamento</h4>
              <p className="text-blue-700 text-sm">
                "Transforme sua paixão pelo fitness em renda! Conheça o FitPro - IA personalizada para seus treinos. Use meu link e ganhe desconto!"
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comissões Pendentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Seus Ganhos
            </CardTitle>
            <CardDescription>
              Acompanhe suas comissões e solicite saques
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-green-700 font-medium">Disponível para Saque</span>
                <span className="text-2xl font-bold text-green-800">
                  R$ {affiliateStats.pendingCommission.toFixed(2)}
                </span>
              </div>
              <Button 
                onClick={handleRequestPayout}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={affiliateStats.pendingCommission < 50 || isRequestingPayout}
              >
                {isRequestingPayout ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : affiliateStats.pendingCommission < 50 ? 
                  "Mínimo R$ 50,00 para saque" : 
                  "Solicitar Saque"
                }
              </Button>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Histórico Recente</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">João Silva - Plano Mensal</p>
                    <p className="text-xs text-gray-500">Hoje, 14:30</p>
                  </div>
                  <span className="text-green-600 font-bold">+R$ 20,70</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-medium">Maria Costa - Plano Anual</p>
                    <p className="text-xs text-gray-500">Ontem, 09:15</p>
                  </div>
                  <span className="text-green-600 font-bold">+R$ 99,30</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium">Pedro Santos - Plano Mensal</p>
                    <p className="text-xs text-gray-500">2 dias atrás</p>
                  </div>
                  <span className="text-green-600 font-bold">+R$ 20,70</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Como Funciona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Como Funciona o Programa de Afiliados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">1. Compartilhe</h4>
              <p className="text-sm text-gray-600">
                Use seu link único para indicar o FitPro para amigos e seguidores
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">2. Eles Assinam</h4>
              <p className="text-sm text-gray-600">
                Quando alguém se cadastra pelo seu link e assina um plano
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">3. Você Ganha</h4>
              <p className="text-sm text-gray-600">
                Receba 30% do valor da assinatura mensalmente enquanto for cliente
              </p>
            </div>
          </div>

          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
            <h4 className="font-bold text-lg mb-3 text-center">💰 Tabela de Comissões</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-semibold text-blue-800">Plano Mensal - R$ 69,00</h5>
                <p className="text-2xl font-bold text-green-600">R$ 20,70 / mês</p>
                <p className="text-sm text-gray-600">por cada cliente ativo</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-semibold text-blue-800">Plano Anual - R$ 331,00</h5>
                <p className="text-2xl font-bold text-green-600">R$ 99,30 / ano</p>
                <p className="text-sm text-gray-600">pagamento único</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Materiais de Marketing */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Materiais de Marketing</CardTitle>
          <CardDescription>
            Baixe materiais prontos para suas redes sociais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-blue-100 rounded mx-auto mb-2 flex items-center justify-center">
                  📱
                </div>
                <div className="font-medium">Stories Instagram</div>
                <div className="text-xs text-gray-500">Templates prontos</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-green-100 rounded mx-auto mb-2 flex items-center justify-center">
                  🎥
                </div>
                <div className="font-medium">Vídeos de Apresentação</div>
                <div className="text-xs text-gray-500">MP4 para WhatsApp</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded mx-auto mb-2 flex items-center justify-center">
                  📝
                </div>
                <div className="font-medium">Textos Prontos</div>
                <div className="text-xs text-gray-500">Copy para posts</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketplaceSection;
