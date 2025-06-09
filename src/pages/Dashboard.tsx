import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Dumbbell, MessageCircle, TrendingUp, Apple, Sparkles, CreditCard, Lock, FileText } from 'lucide-react';
import WorkoutPlanGenerator, { WorkoutPlan } from '@/components/WorkoutPlanGenerator';
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

  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [activeTab, setActiveTab] = useState<string>('workout');

  // Função para mudar para a aba do assistente
  const switchToAssistant = () => {
    console.log('🎯 Mudando para a aba do assistente via callback');
    setActiveTab('assistant');
  };

  useEffect(() => {
    // Definir a aba inicial baseada no plano de treino
    const initialTab = workoutPlan ? 'workout' : 'workout';
    setActiveTab(initialTab);
  }, [workoutPlan]);

  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      console.log('🔄 Inicializando Dashboard...');

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Erro ao buscar sessão:', sessionError);
        toast({ title: "Erro de Sessão", description: "Não foi possível verificar sua sessão.", variant: "destructive" });
        navigate('/auth');
        setLoading(false);
        return;
      }

      const currentUser = session?.user ?? null;
      setUser(currentUser);
      
      if (!currentUser) {
        console.log('🚫 Usuário não logado, redirecionando...');
        navigate('/auth');
        setLoading(false);
        return;
      }

      console.log(`👤 Usuário logado: ${currentUser.email}`);

      try {
        console.log('🔍 Verificando assinatura e período de teste...');
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('status', 'active')
          .gte('expires_at', new Date().toISOString())
          .maybeSingle();

        if (subscription) {
          console.log('✅ Assinatura ativa encontrada.');
          setHasActiveSubscription(true);
          setIsInTrialPeriod(false);
        } else {
          console.log('⏳ Sem assinatura ativa, verificando período de teste...');
          const userCreatedAt = new Date(currentUser.created_at);
          const oneDayLater = new Date(userCreatedAt.getTime() + 24 * 60 * 60 * 1000);
          const now = new Date();

          if (now <= oneDayLater) {
            console.log('🎉 Usuário em período de teste.');
            setIsInTrialPeriod(true);
            setHasActiveSubscription(false);
          } else {
            console.log('❌ Período de teste expirado.');
            setIsInTrialPeriod(false);
            setHasActiveSubscription(false);
          }
        }

        console.log('🏋️ Buscando plano de treino salvo...');
        const { data: savedPlanData, error: planError } = await supabase
          .from('user_workout_plans')
          .select('plan_data')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (planError) {
          console.error('❌ Erro ao buscar plano de treino:', planError);
          toast({ title: "Erro ao Carregar Plano", description: "Não foi possível buscar seu plano salvo.", variant: "destructive" });
        } else if (savedPlanData && savedPlanData.plan_data) {
          console.log('✅ Plano de treino salvo encontrado!');
          if (typeof savedPlanData.plan_data === 'object' && savedPlanData.plan_data !== null && 'title' in savedPlanData.plan_data) {
             setWorkoutPlan(savedPlanData.plan_data as unknown as WorkoutPlan);
          } else {
             console.warn('⚠️ Formato inválido para plan_data encontrado no DB.');
             setWorkoutPlan(null);
          }
        } else {
          console.log('📄 Nenhum plano de treino salvo encontrado.');
          setWorkoutPlan(null);
        }

      } catch (error: any) {
        console.error('💥 Erro durante inicialização do Dashboard:', error);
        toast({ title: "Erro Inesperado", description: "Ocorreu um erro ao carregar seus dados.", variant: "destructive" });
      }

      setLoading(false);
      console.log('✅ Dashboard inicializado.');
    };

    initializeDashboard();

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newAuthUser = session?.user ?? null;
        setUser(newAuthUser);
        if (!newAuthUser) {
          console.log('🚪 Usuário deslogado via listener, redirecionando...');
          setWorkoutPlan(null);
          setHasActiveSubscription(false);
          setIsInTrialPeriod(false);
          navigate('/auth');
        } else if (_event === 'SIGNED_IN' && !user) {
           console.log('👤 Usuário logado via listener, reinicializando...');
           initializeDashboard();
        }
      }
    );

    return () => {
      authSubscription?.unsubscribe();
      console.log('🧹 Listener de autenticação removido.');
    };
  }, [navigate]); 

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    toast({ title: "Logout realizado", description: "Você foi desconectado." });
  };

  const hasAccess = hasActiveSubscription || isInTrialPeriod;

  const LockedFeature = ({ children, title }: { children: React.ReactNode, title: string }) => {
    if (hasAccess) {
      return <>{children}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-4">
          <Lock className="h-8 w-8 text-gray-500" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title} Bloqueado</h3>
        <p className="text-gray-600 mb-4">Sua assinatura expirou ou o período de teste acabou. Renove para continuar.</p>
        <Button 
          onClick={() => {
            const mainTabs = document.querySelector('.main-dashboard-tabs');
            if (mainTabs) {
              const paymentTrigger = mainTabs.querySelector('[data-value="payment"]') as HTMLElement;
              paymentTrigger?.click();
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <CreditCard className="h-4 w-4 mr-2" />
          Ver Planos / Renovar
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-blue-800 text-xl font-semibold">Carregando seu dashboard...</div>
        </div>
      </div>
    );
  }

  const defaultMainTab = workoutPlan ? 'workout' : 'workout';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <header className="border-b border-blue-200 bg-white/90 backdrop-blur-xl shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="p-1.5 md:p-2 bg-blue-600 rounded-lg shadow-md">
                <Dumbbell className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-3xl font-bold text-blue-800 flex items-center gap-2">
                  FitAI Pro <Sparkles className="h-4 w-4 md:h-6 md:w-6 text-blue-500" />
                </h1>
                <p className="text-blue-600 text-xs md:text-sm hidden sm:block">Seu assistente pessoal de fitness</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-blue-800 font-medium text-sm md:text-base">Olá, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</p>
                {isInTrialPeriod && !hasActiveSubscription && (
                  <span className="text-blue-700 text-xs md:text-sm font-medium bg-blue-100 px-2 py-1 rounded-full">🎉 Gratuito</span>
                )}
                {hasActiveSubscription && (
                  <span className="text-green-700 text-xs md:text-sm font-medium bg-green-100 px-2 py-1 rounded-full">✅ Plano Ativo</span>
                )}
                {!hasAccess && (
                  <span className="text-red-700 text-xs md:text-sm font-medium bg-red-100 px-2 py-1 rounded-full">⚠️ Bloqueado</span>
                )}
              </div>
              <Button variant="outline" onClick={handleSignOut} className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs md:text-sm px-2 md:px-4" size="sm">
                <LogOut className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-blue-800 mb-2">
                    {hasAccess ? "Bem-vindo ao seu centro de fitness!" : "Acesso Bloqueado"}
                  </h2>
                  <p className="text-blue-600 text-sm md:text-base">
                    {hasAccess ? "Explore nossos assistentes de IA para transformar seus objetivos em resultados" : "Sua assinatura expirou ou o período de teste acabou. Renove para continuar."}
                  </p>
                  <div className="mt-2 md:hidden">
                    {isInTrialPeriod && !hasActiveSubscription && (<span className="text-blue-700 text-xs font-medium bg-blue-100 px-2 py-1 rounded-full">🎉 Gratuito</span>)}
                    {hasActiveSubscription && (<span className="text-green-700 text-xs font-medium bg-green-100 px-2 py-1 rounded-full">✅ Plano Ativo</span>)}
                    {!hasAccess && (<span className="text-red-700 text-xs font-medium bg-red-100 px-2 py-1 rounded-full">⚠️ Bloqueado</span>)}
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <Dumbbell className="h-8 w-8 md:h-12 md:w-12 text-white" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full main-dashboard-tabs">
          <TabsList className="grid w-full grid-cols-5 mb-6 md:mb-8 bg-white border border-blue-200 shadow-sm h-auto">
            <TabsTrigger value="workout" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!hasAccess}>
              <Dumbbell className="h-4 w-4" /> <span className="text-xs md:text-sm">Treinos</span> {!hasAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!hasAccess}>
              <MessageCircle className="h-4 w-4" /> <span className="text-xs md:text-sm">Assistente</span> {!hasAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!hasAccess}>
              <TrendingUp className="h-4 w-4" /> <span className="text-xs md:text-sm">Evolução</span> {!hasAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!hasAccess}>
              <Apple className="h-4 w-4" /> <span className="text-xs md:text-sm">Nutrição</span> {!hasAccess && <Lock className="h-3 w-3" />}
            </TabsTrigger>
            <TabsTrigger value="payment" data-value="payment" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3">
              <CreditCard className="h-4 w-4" /> <span className="text-xs md:text-sm">Pagamento</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <LockedFeature title="Treinos">
              <WorkoutPlanGenerator 
                user={user} 
                workoutPlan={workoutPlan} 
                setWorkoutPlan={setWorkoutPlan} 
                initialActiveTab={workoutPlan ? 'plan' : 'form'}
                onSwitchToAssistant={switchToAssistant}
              />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="assistant">
            <LockedFeature title="Assistente">
              <AIAssistant user={user} />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="progress">
            <LockedFeature title="Evolução">
              <ProgressTracker user={user} />
            </LockedFeature>
          </TabsContent>

          <TabsContent value="nutrition">
            <LockedFeature title="Nutrição">
              <NutritionAssistant user={user} />
            </LockedFeature>
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
