
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Copy, DollarSign, Users, TrendingUp, Gift } from 'lucide-react';
import { useAffiliateSystem } from '@/hooks/useAffiliateSystem';
import { useToast } from '@/hooks/use-toast';
import { ReferralStats } from './ReferralStats';
import { CommissionTable } from './CommissionTable';
import { WithdrawalManager } from './WithdrawalManager';

const AffiliateDashboard = () => {
  const { affiliate, referrals, commissions, loading, createAffiliate, updatePixKey } = useAffiliateSystem();
  const [pixKey, setPixKey] = useState(affiliate?.pix_key || '');
  const { toast } = useToast();

  const copyReferralLink = () => {
    if (affiliate) {
      const referralLink = `${window.location.origin}/?ref=${affiliate.affiliate_code}`;
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link copiado!",
        description: "Link de referência copiado para a área de transferência"
      });
    }
  };

  const handleUpdatePixKey = () => {
    if (pixKey.trim()) {
      updatePixKey(pixKey.trim());
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <Gift className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Torne-se um Afiliado</CardTitle>
            <CardDescription>
              Ganhe 15% de comissão para cada pessoa que você indicar!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Como funciona:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Você recebe um link único de referência</li>
                  <li>• Compartilhe com seus contatos</li>
                  <li>• Ganhe R$ 10,49 por cada assinatura</li>
                  <li>• Saques via PIX a partir de R$ 50</li>
                </ul>
              </div>
              <Button onClick={createAffiliate} className="w-full">
                Criar Conta de Afiliado
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingEarnings = commissions
    .filter(c => c.status === 'approved')
    .reduce((total, c) => total + Number(c.amount), 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard do Afiliado</h1>
          <p className="text-gray-600">Código: {affiliate.affiliate_code}</p>
        </div>
        <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
          {affiliate.status === 'active' ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Ganho</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {affiliate.total_earnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {pendingEarnings.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Referências</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliate.total_referrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comissão</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliate.commission_rate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Link de referência */}
      <Card>
        <CardHeader>
          <CardTitle>Seu Link de Referência</CardTitle>
          <CardDescription>
            Compartilhe este link para ganhar comissões
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              value={`${window.location.origin}/?ref=${affiliate.affiliate_code}`}
              readOnly
              className="flex-1"
            />
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuração PIX */}
      <Card>
        <CardHeader>
          <CardTitle>Chave PIX para Recebimentos</CardTitle>
          <CardDescription>
            Configure sua chave PIX para receber os pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <div className="flex-1">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="Digite sua chave PIX"
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleUpdatePixKey}>
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs com detalhes */}
      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
          <TabsTrigger value="commissions">Comissões</TabsTrigger>
          <TabsTrigger value="withdrawals">Saques</TabsTrigger>
          <TabsTrigger value="help">Ajuda</TabsTrigger>
        </TabsList>

        <TabsContent value="stats">
          <ReferralStats referrals={referrals} commissions={commissions} />
        </TabsContent>

        <TabsContent value="commissions">
          <CommissionTable commissions={commissions} />
        </TabsContent>

        <TabsContent value="withdrawals">
          <WithdrawalManager affiliate={affiliate} />
        </TabsContent>

        <TabsContent value="help">
          <Card>
            <CardHeader>
              <CardTitle>Como Funciona o Sistema de Afiliados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">1. Compartilhe seu link</h3>
                <p className="text-sm text-gray-600">
                  Use o link de referência único para convidar pessoas para o FitAI Pro.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">2. Ganhe comissões</h3>
                <p className="text-sm text-gray-600">
                  Receba 15% (R$ 10,49) para cada pessoa que assinar através do seu link.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">3. Solicite saques</h3>
                <p className="text-sm text-gray-600">
                  Quando atingir R$ 50, você pode solicitar o saque via PIX.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">4. Receba o pagamento</h3>
                <p className="text-sm text-gray-600">
                  Os saques são processados em até 3 dias úteis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AffiliateDashboard;
