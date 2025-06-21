import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueueItem {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  position_in_queue: number;
  estimated_completion_time: string;
  error_message?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

interface QueueStatusProps {
  user: User | null;
  onPlanReady?: (plan: any) => void;
}

const QueueStatus = ({ user, onPlanReady }: QueueStatusProps) => {
  const [queueItem, setQueueItem] = useState<QueueItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;

    let mounted = true;

    const loadQueueStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('workout_plan_queue')
          .select('*')
          .eq('user_id', user.id)
          .in('status', ['pending', 'processing', 'completed', 'failed'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('Error loading queue status:', error);
          return;
        }

        if (mounted) {
          setQueueItem(data);
          
          // Se completado, tentar buscar o plano
          if (data?.status === 'completed') {
            setTimeout(async () => {
              const { data: planData } = await supabase
                .from('user_workout_plans')
                .select('plan_data')
                .eq('user_id', user.id)
                .single();
              
              if (planData && onPlanReady && mounted) {
                onPlanReady(planData.plan_data);
                toast({ 
                  title: "Plano pronto!", 
                  description: "Seu plano de treino foi gerado com sucesso!" 
                });
              }
            }, 1000);
          }
        }
      } catch (error) {
        console.error('Error in loadQueueStatus:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadQueueStatus();

    // Configurar realtime para atualizações
    const channel = supabase
      .channel('queue-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'workout_plan_queue',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Queue update:', payload);
          if (payload.new && typeof payload.new === 'object' && 'status' in payload.new && mounted) {
            setQueueItem(payload.new as QueueItem);
            
            // Se completado, buscar o plano
            if (payload.new.status === 'completed') {
              setTimeout(async () => {
                const { data: planData } = await supabase
                  .from('user_workout_plans')
                  .select('plan_data')
                  .eq('user_id', user.id)
                  .single();
                
                if (planData && onPlanReady && mounted) {
                  onPlanReady(planData.plan_data);
                  toast({ 
                    title: "Plano pronto!", 
                    description: "Seu plano de treino foi gerado com sucesso!" 
                  });
                }
              }, 1000);
            }
            
            if (payload.new.status === 'failed') {
              toast({ 
                title: "Erro na geração", 
                description: "Houve um problema ao gerar seu plano. Tente novamente.", 
                variant: "destructive" 
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user, onPlanReady, toast]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!queueItem) return null;

  const getStatusIcon = () => {
    switch (queueItem.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (queueItem.status) {
      case 'pending':
        return `Posição ${queueItem.position_in_queue || 1} na fila`;
      case 'processing':
        return 'Gerando seu plano...';
      case 'completed':
        return 'Plano concluído!';
      case 'failed':
        return 'Erro na geração';
    }
  };

  const getStatusColor = () => {
    switch (queueItem.status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  const getProgress = () => {
    switch (queueItem.status) {
      case 'pending':
        return 25;
      case 'processing':
        return 75;
      case 'completed':
        return 100;
      case 'failed':
        return 0;
    }
  };

  const getEstimatedTime = () => {
    if (!queueItem.estimated_completion_time) return null;
    
    const estimatedTime = new Date(queueItem.estimated_completion_time);
    const now = new Date();
    const diffMinutes = Math.max(0, Math.ceil((estimatedTime.getTime() - now.getTime()) / (1000 * 60)));
    
    if (diffMinutes === 0) return 'Em breve';
    if (diffMinutes === 1) return '1 minuto';
    return `${diffMinutes} minutos`;
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {getStatusIcon()}
          Status da Geração
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={getStatusColor()}>
            {getStatusText()}
          </Badge>
          {queueItem.status === 'pending' && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              {getEstimatedTime()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span>{getProgress()}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>

        {queueItem.status === 'processing' && (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
            <Users className="h-4 w-4" />
            Seu plano está sendo gerado com instruções detalhadas. Isso pode levar até 2 minutos.
          </div>
        )}

        {queueItem.status === 'failed' && queueItem.error_message && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            <strong>Erro:</strong> {queueItem.error_message}
          </div>
        )}

        {queueItem.status === 'completed' && (
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            ✅ Seu plano de treino personalizado está pronto!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QueueStatus;
