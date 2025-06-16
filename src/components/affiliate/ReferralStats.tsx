
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  status: string;
  created_at: string;
}

interface ReferralStatsProps {
  referrals: ReferralData[];
  commissions: CommissionData[];
}

export const ReferralStats = ({ referrals, commissions }: ReferralStatsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'converted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'converted':
        return 'Convertido';
      case 'pending':
        return 'Pendente';
      case 'expired':
        return 'Expirado';
      default:
        return status;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Referências Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma referência ainda
            </p>
          ) : (
            <div className="space-y-3">
              {referrals.slice(0, 10).map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">#{referral.referral_code}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(referral.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(referral.status)}>
                    {getStatusText(referral.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comissões Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma comissão ainda
            </p>
          ) : (
            <div className="space-y-3">
              {commissions.slice(0, 10).map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">R$ {commission.amount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(commission.created_at), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </p>
                  </div>
                  <Badge className={getStatusColor(commission.status)}>
                    {commission.status === 'approved' ? 'Aprovada' : 
                     commission.status === 'paid' ? 'Paga' : 
                     commission.status === 'pending' ? 'Pendente' : 'Cancelada'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
