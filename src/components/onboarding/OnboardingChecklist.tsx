
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
  points: number;
}

interface OnboardingChecklistProps {
  user: SupabaseUser | null;
  isVisible: boolean;
  onClose: () => void;
  onSwitchTab: (tab: string) => void;
}

const OnboardingChecklist = ({ user, isVisible, onClose, onSwitchTab }: OnboardingChecklistProps) => {
  const [steps, setSteps] = useState<OnboardingStep[]>([
    {
      id: 'complete-profile',
      title: 'Complete seu Perfil',
      description: 'Adicione informações básicas para personalizar sua experiência',
      icon: <User className="h-5 w-5" />,
      action: 'Completar Perfil',
      completed: false,
      points: 10
    },
    {
      id: 'first-workout',
      title: 'Gere seu Primeiro Treino',
      description: 'Crie um plano de treino personalizado com nossa IA',
      icon: <Dumbbell className="h-5 w-5" />,
      action: 'Criar Treino',
      completed: false,
      points: 20
    },
    {
      id: 'nutrition-plan',
      title: 'Explore a Nutrição',
      description: 'Descubra dicas alimentares personalizadas',
      icon: <Apple className="h-5 w-5" />,
      action: 'Ver Nutrição',
      completed: false,
      points: 15
    },
    {
      id: 'record-progress',
      title: 'Registre seu Progresso',
      description: 'Adicione suas medidas iniciais para acompanhar evolução',
      icon: <TrendingUp className="h-5 w-5" />,
      action: 'Registrar Dados',
      completed: false,
      points: 15
    }
  ]);

  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (user) {
      checkCompletedSteps();
    }
  }, [user]);

  const checkCompletedSteps = async () => {
    if (!user) return;

    try {
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

      setSteps(prevSteps => 
        prevSteps.map(step => {
          let completed = step.completed;
          
          switch (step.id) {
            case 'complete-profile':
              completed = !!(user.user_metadata?.full_name);
              break;
            case 'first-workout':
              completed = !!workoutPlan;
              break;
            case 'record-progress':
              completed = !!progressData;
              break;
            default:
              break;
          }
          
          return { ...step, completed };
        })
      );
    } catch (error) {
      console.error('Erro ao verificar passos do onboarding:', error);
    }
  };

  useEffect(() => {
    const completedPoints = steps
      .filter(step => step.completed)
      .reduce((total, step) => total + step.points, 0);
    setTotalPoints(completedPoints);
  }, [steps]);

  const handleStepAction = (step: OnboardingStep) => {
    switch (step.id) {
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
  };

  const completedSteps = steps.filter(step => step.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;
  const isCompleted = completedSteps === totalSteps;

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
            <Badge 
              variant={isCompleted ? "default" : "secondary"}
              className={isCompleted ? "bg-green-500 text-white" : "bg-blue-100 text-blue-700"}
            >
              {totalPoints} pontos
            </Badge>
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
              
              {step.completed && (
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  +{step.points} pts
                </Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingChecklist;
