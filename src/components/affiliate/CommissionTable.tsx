
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CommissionData {
  id: string;
  amount: number;
  commission_rate: number;
  status: string;
  payment_date?: string;
  created_at: string;
}

interface CommissionTableProps {
  commissions: CommissionData[];
}

export const CommissionTable = ({ commissions }: CommissionTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Aprovada';
      case 'paid':
        return 'Paga';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Comissões</CardTitle>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Nenhuma comissão registrada ainda
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Taxa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Pagamento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    {format(new Date(commission.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {commission.amount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    {commission.commission_rate}%
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(commission.status)}>
                      {getStatusText(commission.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {commission.payment_date ? 
                      format(new Date(commission.payment_date), 'dd/MM/yyyy', { locale: ptBR }) :
                      '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
