
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Dumbbell, MessageCircle, TrendingUp, Apple, Sparkles, CreditCard } from 'lucide-react';
import WorkoutPlanGenerator from '@/components/WorkoutPlanGenerator';
import AIAssistant from '@/components/AIAssistant';
import ProgressTracker from '@/components/ProgressTracker';
import NutritionAssistant from '@/components/NutritionAssistant';
import PaymentManager from '@/components/PaymentManager';
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <div className="text-white text-xl font-semibold">Carregando seu dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header responsivo */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
                <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-white flex items-center gap-2">
                  FitAI Pro
                  <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-yellow-400" />
                </h1>
                <p className="text-blue-200 text-xs md:text-sm hidden sm:block">Seu assistente pessoal de fitness</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-white font-medium text-sm md:text-base">Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                {isInTrialPeriod && (
                  <span className="text-yellow-300 text-xs md:text-sm font-medium bg-yellow-500/20 px-2 py-1 rounded-full">
                    🎉 Período gratuito ativo
                  </span>
                )}
                {hasActiveSubscription && (
                  <span className="text-green-300 text-xs md:text-sm font-medium bg-green-500/20 px-2 py-1 rounded-full">
                    ✅ Plano ativo
                  </span>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut} 
                className="border-white/20 text-white hover:bg-white/10 transition-all duration-200 text-xs md:text-sm px-2 md:px-4"
                size="sm"
              >
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        {/* Welcome Section responsiva */}
        <div className="mb-6 md:mb-8">
          <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-white mb-2">
                    Bem-vindo ao seu centro de fitness!
                  </h2>
                  <p className="text-blue-200 text-sm md:text-base">
                    Explore nossos assistentes de IA para transformar seus objetivos em resultados
                  </p>
                  {/* Status mobile */}
                  <div className="mt-2 md:hidden">
                    {isInTrialPeriod && (
                      <span className="text-yellow-300 text-xs font-medium bg-yellow-500/20 px-2 py-1 rounded-full">
                        🎉 Período gratuito ativo
                      </span>
                    )}
                    {hasActiveSubscription && (
                      <span className="text-green-300 text-xs font-medium bg-green-500/20 px-2 py-1 rounded-full">
                        ✅ Plano ativo
                      </span>
                    )}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <Dumbbell className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6 md:mb-8 bg-black/30 backdrop-blur-sm border border-white/20 h-auto">
            <TabsTrigger 
              value="workout" 
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white text-white/70 p-2 md:p-3"
            >
              <Dumbbell className="h-4 w-4" />
              <span className="text-xs md:text-sm">Treinos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="assistant" 
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-white/70 p-2 md:p-3"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-xs md:text-sm">Assistente</span>
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-white/70 p-2 md:p-3"
            >
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs md:text-sm">Evolução</span>
            </TabsTrigger>
            <TabsTrigger 
              value="nutrition" 
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-white/70 p-2 md:p-3"
            >
              <Apple className="h-4 w-4" />
              <span className="text-xs md:text-sm">Nutrição</span>
            </TabsTrigger>
            <TabsTrigger 
              value="payment" 
              className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-white text-white/70 p-2 md:p-3"
            >
              <CreditCard className="h-4 w-4" />
              <span className="text-xs md:text-sm">Pagamento</span>
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

          <TabsContent value="payment">
            <PaymentManager user={user} hasActiveSubscription={hasActiveSubscription} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
