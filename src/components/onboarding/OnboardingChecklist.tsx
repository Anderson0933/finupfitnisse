import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Play, User, Dumbbell, Apple, TrendingUp, X, Gift } from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: string;
  completed: boolean;
}

interface OnboardingChecklistProps {
  user: SupabaseUser | null;
  isVisible: boolean;
  onClose: () => void;
  onSwitchTab: (tab: string) => void;
  completedStepsDB: string[];
  onStepComplete: (stepId: string) => void;
}

const OnboardingChecklist = ({ user, isVisible, onClose, onSwitchTab, completedStepsDB, onStepComplete }: OnboardingChecklistProps) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'complete-profile',
      title: 'Complete seu Perfil',
      description: 'Adicione informações básicas para personalizar sua experiência',
      icon: <User className="h-5 w-5" />,
      action: 'Completar Perfil',
      completed: false
    },
    {
      id: 'first-workout',
      title: 'Gere seu Primeiro Treino',
      description: 'Crie um plano de treino personalizado com nossa IA',
      icon: <Dumbbell className="h-5 w-5" />,
      action: 'Criar Treino',
      completed: false
    },
    {
      id: 'nutrition-plan',
      title: 'Explore a Nutrição',
      description: 'Descubra dicas alimentares personalizadas',
      icon: <Apple className="h-5 w-5" />,
      action: 'Ver Nutrição',
      completed: false
    },
    {
      id: 'record-progress',
      title: 'Registre seu Progresso',
      description: 'Adicione suas medidas iniciais para acompanhar evolução',
      icon: <TrendingUp className="h-5 w-5" />,
      action: 'Registrar Dados',
      completed: false
    }
  ]);

  useEffect(() => {
    if (user && isVisible) {
      checkCompletedSteps();
      const interval = setInterval(() => {
        checkCompletedSteps();
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user, isVisible, completedStepsDB]); // Adicionado completedStepsDB para reavaliar

  const checkCompletedSteps = async () => {
    if (!user) return;

    try {
      console.log('🔍 Verificando passos do onboarding...');

      // Verificar se tem perfil completo (user_profiles)
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      // Verificar se tem plano de treino
      const { data: workoutPlan } = await supabase
        .from('user_workout_plans')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      // Verificar se tem dados de progresso
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      // Verificar se tem conversas de nutrição
      const { data: nutritionConversations } = await supabase
        .from('ai_conversations')
        .select('id')
        .eq('user_id', user.id)
        .eq('conversation_type', 'nutrition')
        .limit(1)
        .maybeSingle();

      const currentSteps = steps; // Use a snapshot of current steps state
      const newStepStates: { id: string; completed: boolean }[] = [];

      for (const step of currentSteps) {
        let isNowComplete = false;
        switch (step.id) {
          case 'complete-profile':
            isNowComplete = !!(
              profileData?.full_name || 
              profileData?.age || 
              profileData?.weight || 
              user.user_metadata?.full_name
            );
            break;
          case 'first-workout':
            isNowComplete = !!workoutPlan;
            break;
          case 'nutrition-plan':
            isNowComplete = !!nutritionConversations;
            break;
          case 'record-progress':
            isNowComplete = !!progressData;
            break;
        }

        if (isNowComplete && !completedStepsDB.includes(step.id)) {
          console.log(`✅ Passo '${step.id}' concluído e será salvo.`);
          onStepComplete(step.id);
        }
        
        newStepStates.push({ id: step.id, completed: completedStepsDB.includes(step.id) || isNowComplete });
      }

      setSteps(prevSteps => 
        prevSteps.map(step => {
          const newState = newStepStates.find(s => s.id === step.id);
          return newState ? { ...step, completed: newState.completed } : step;
        })
      );
    } catch (error) {
      console.error('Erro ao verificar passos do onboarding:', error);
    }
  };

  const handleStepAction = (step: OnboardingStep) => {
    console.log(`🎯 Executando ação para: ${step.id}`);
    
    switch (step.id) {
      case 'complete-profile':
        onSwitchTab('progress'); // Onde tem formulário de perfil
        break;
      case 'first-workout':
        onSwitchTab('workout');
        break;
      case 'nutrition-plan':
        onSwitchTab('nutrition');
        break;
      case 'record-progress':
        onSwitchTab('progress');
        break;
      default:
        break;
    }

    // Recheck steps after a short delay to catch immediate updates
    setTimeout(() => {
      checkCompletedSteps();
    }, 1000);
  };

  const completedSteps = completedStepsDB.length;
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
  const isCompleted = completedSteps >= totalSteps;

  if (!isVisible) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-blue-600" />
            <CardTitle className="text-xl font-bold text-blue-800">
              Primeiros Passos
            </CardTitle>
          </div>
          {isCompleted && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              {completedSteps} de {totalSteps} concluídos
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          {isCompleted && (
            <div className="text-center p-3 bg-green-100 rounded-lg border border-green-200">
              <p className="text-green-800 font-semibold">🎉 Parabéns! Você completou todos os primeiros passos!</p>
              <p className="text-green-700 text-sm">Agora você está pronto para aproveitar ao máximo o FitAI Pro!</p>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                step.completed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  step.completed ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                }`}>
                  {step.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    step.icon
                  )}
                </div>
                <div>
                  <h4 className={`font-semibold ${
                    step.completed ? 'text-green-800' : 'text-gray-800'
                  }`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm ${
                    step.completed ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {!step.completed && (
                <Button
                  size="sm"
                  onClick={() => handleStepAction(step)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Play className="h-3 w-3" />
                  {step.action}
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
