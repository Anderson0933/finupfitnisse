
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Info, CreditCard } from 'lucide-react';

interface AffiliateData {
  id: string;
  total_earnings: number;
  pix_key?: string;
}

interface WithdrawalData {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

interface WithdrawalManagerProps {
  affiliate: AffiliateData;
}

export const WithdrawalManager = ({ affiliate }: WithdrawalManagerProps) => {
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchWithdrawals = async () => {
    try {
      const { data, error } = await supabase
        .from('affiliate_withdrawals')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar saques:', error);
        return;
      }

      setWithdrawals(data || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const requestWithdrawal = async () => {
    if (!affiliate.pix_key) {
      toast({
        title: "Erro",
        description: "Configure sua chave PIX antes de solicitar um saque",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(withdrawalAmount);
    if (amount < 50) {
      toast({
        title: "Erro",
        description: "O valor mínimo para saque é R$ 50,00",
        variant: "destructive"
      });
      return;
    }

    if (amount > affiliate.total_earnings) {
      toast({
        title: "Erro",
        description: "Valor solicitado maior que o saldo disponível",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('affiliate_withdrawals')
        .insert([{
          affiliate_id: affiliate.id,
          amount: amount,
          pix_key: affiliate.pix_key
        }]);

      if (error) {
        console.error('Erro ao solicitar saque:', error);
        toast({
          title: "Erro",
          description: "Erro ao solicitar saque",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Sucesso!",
        description: "Solicitação de saque enviada com sucesso!"
      });

      setWithdrawalAmount('');
      fetchWithdrawals();
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'processing':
        return 'Processando';
      case 'pending':
        return 'Pendente';
      case 'failed':
        return 'Falhou';
      default:
        return status;
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [affiliate.id]);

  return (
    <div className="space-y-6">
      {/* Informações sobre pagamento */}
      <Alert>
        <CreditCard className="h-4 w-4" />
        <AlertDescription>
          <strong>Sistema de Pagamento:</strong> Os saques são processados via PIX em até 3 dias úteis. 
          Nossa equipe analisa cada solicitação manualmente para garantir a segurança das transações.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Solicitar Saque via PIX
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Saldo disponível: <span className="font-semibold text-green-600">R$ {affiliate.total_earnings.toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Valor mínimo para saque: R$ 50,00
              </p>
            </div>
            
            <div>
              <Label htmlFor="withdrawalAmount">Valor do Saque (R$)</Label>
              <Input
                id="withdrawalAmount"
                type="number"
                min="50"
                max={affiliate.total_earnings}
                step="0.01"
                value={withdrawalAmount}
                onChange={(e) => setWithdrawalAmount(e.target.value)}
                placeholder="Digite o valor"
              />
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                O pagamento será feito via PIX para a chave cadastrada. Processamento em até 3 dias úteis.
              </AlertDescription>
            </Alert>

            <Button 
              onClick={requestWithdrawal} 
              disabled={loading || !affiliate.pix_key || parseFloat(withdrawalAmount) < 50}
              className="w-full"
            >
              {loading ? 'Processando...' : 'Solicitar Saque via PIX'}
            </Button>

            {!affiliate.pix_key && (
              <p className="text-sm text-red-600">
                Configure sua chave PIX na aba principal para poder solicitar saques.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Saques</CardTitle>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhum saque solicitado ainda
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data Solicitação</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data Processamento</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((withdrawal) => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>
                      {format(new Date(withdrawal.requested_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {withdrawal.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(withdrawal.status)}>
                        {getStatusText(withdrawal.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {withdrawal.processed_at ? 
                        format(new Date(withdrawal.processed_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }) :
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3 w-3" />
                        PIX
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
