
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Dumbbell, MessageCircle, TrendingUp, Apple } from 'lucide-react';
import WorkoutPlanGenerator from '@/components/WorkoutPlanGenerator';
import AIAssistant from '@/components/AIAssistant';
import ProgressTracker from '@/components/ProgressTracker';
import NutritionAssistant from '@/components/NutritionAssistant';
import SubscriptionManager from '@/components/SubscriptionManager';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isInTrialPeriod, setIsInTrialPeriod] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (!session?.user) {
        navigate('/auth');
        return;
      }

      // Verificar assinatura ativa
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'active')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (subscription) {
        setHasActiveSubscription(true);
        setIsInTrialPeriod(false);
      } else {
        // Verificar se ainda está no período de teste (1 dia após criação da conta)
        const userCreatedAt = new Date(session.user.created_at);
        const oneDayLater = new Date(userCreatedAt.getTime() + 24 * 60 * 60 * 1000);
        const now = new Date();

        if (now <= oneDayLater) {
          setIsInTrialPeriod(true);
          setHasActiveSubscription(false);
        } else {
          setIsInTrialPeriod(false);
          setHasActiveSubscription(false);
        }
      }

      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate('/auth');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center">
        <div className="text-white text-xl">Carregando...</div>
      </div>
    );
  }

  // Se não tem assinatura ativa e não está no período de teste, mostrar tela de pagamento
  if (!hasActiveSubscription && !isInTrialPeriod) {
    return <SubscriptionManager user={user} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900">
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Dumbbell className="h-8 w-8 text-white" />
            <h1 className="text-2xl font-bold text-white">FitAI Pro</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-white">Olá, {user?.user_metadata?.full_name || user?.email}</span>
            {isInTrialPeriod && (
              <span className="text-yellow-300 text-sm">
                Período de teste - 24h gratuitas
              </span>
            )}
            <Button variant="outline" onClick={handleSignOut} className="border-white/20 text-white hover:bg-white/10">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="workout" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Treinos
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Assistente
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Evolução
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center gap-2">
              <Apple className="h-4 w-4" />
              Nutrição
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <WorkoutPlanGenerator user={user} />
          </TabsContent>

          <TabsContent value="assistant">
            <AIAssistant user={user} />
          </TabsContent>

          <TabsContent value="progress">
            <ProgressTracker user={user} />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionAssistant user={user} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
