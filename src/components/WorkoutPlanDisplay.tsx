
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, Target, Trophy, Play, Copy, Trash2, MessageCircle, Dumbbell } from 'lucide-react';
import WorkoutSession from './workout/WorkoutSession';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface Workout {
  week: number;
  day: number;
  title: string;
  focus: string;
  estimated_duration: number;
  warm_up: {
    duration: number;
    exercises: Array<{
      name: string;
      duration: number;
      instructions: string;
    }>;
  };
  main_exercises: Array<{
    name: string;
    muscle_groups: string[];
    sets: number;
    reps: string;
    rest_seconds: number;
    weight_guidance: string;
    instructions: string;
    form_cues: string[];
    progression_notes: string;
  }>;
  cool_down: {
    duration: number;
    exercises: Array<{
      name: string;
      duration: number;
      instructions: string;
    }>;
  };
}

interface WorkoutPlan {
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  total_workouts?: number;
  workouts?: Workout[];
  exercises?: any[];
  nutrition_tips?: string[];
  progression_schedule?: any;
}

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  onCopyPlan: () => void;
  onDeletePlan: () => void;
  onGenerateNew: () => void;
  progressMap: Map<string, boolean>;
  onProgressChange: (itemId: string, completed: boolean) => void;
  onSwitchToAssistant?: () => void;
  user?: User | null;
}

const WorkoutPlanDisplay = ({
  plan,
  onCopyPlan,
  onDeletePlan,
  onGenerateNew,
  progressMap,
  onProgressChange,
  onSwitchToAssistant,
  user
}: WorkoutPlanDisplayProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const { toast } = useToast();

  const hasStructuredWorkouts = plan.workouts && plan.workouts.length > 0;

  const handleStartWorkout = (workout: Workout) => {
    setSelectedWorkout(workout);
    setActiveTab('session');
  };

  const saveProgressToDatabase = async (workoutId: string, completed: boolean) => {
    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error } = await supabase
        .from('plan_progress')
        .upsert({
          user_id: user.id,
          plan_id: plan.title, // Usando o título como ID do plano
          item_identifier: workoutId,
          is_completed: completed,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,plan_id,item_identifier'
        });

      if (error) {
        console.error('Error saving progress:', error);
        toast({
          title: "Erro ao Salvar Progresso",
          description: "Não foi possível salvar seu progresso. Tente novamente.",
          variant: "destructive",
        });
      } else {
        console.log('Progress saved successfully for:', workoutId);
      }
    } catch (error) {
      console.error('Error in saveProgressToDatabase:', error);
    }
  };

  const handleWorkoutComplete = async () => {
    if (selectedWorkout) {
      const workoutId = `workout_${selectedWorkout.week}_${selectedWorkout.day}`;
      
      // Salvar no estado local
      onProgressChange(workoutId, true);
      
      // Salvar no banco de dados
      await saveProgressToDatabase(workoutId, true);
      
      toast({
        title: "🎉 Treino Concluído!",
        description: "Parabéns! Você completou mais um treino. Continue assim!",
      });
    }
    
    setSelectedWorkout(null);
    setActiveTab('workouts');
  };

  const handleExerciseComplete = async (exerciseName: string) => {
    if (selectedWorkout) {
      const itemId = `workout_${selectedWorkout.week}_${selectedWorkout.day}_${exerciseName}`;
      
      // Salvar no estado local
      onProgressChange(itemId, true);
      
      // Salvar no banco de dados
      await saveProgressToDatabase(itemId, true);
    }
  };

  const getCompletedWorkouts = () => {
    if (!hasStructuredWorkouts) return 0;
    
    return plan.workouts!.filter(workout => {
      const workoutId = `workout_${workout.week}_${workout.day}`;
      return progressMap.get(workoutId) || false;
    }).length;
  };

  const getProgressPercentage = () => {
    if (!hasStructuredWorkouts) return 0;
    return Math.round((getCompletedWorkouts() / plan.workouts!.length) * 100);
  };

  if (selectedWorkout) {
    return (
      <div className="space-y-4">
        <Button 
          onClick={() => setSelectedWorkout(null)}
          variant="outline"
          className="mb-4"
        >
          ← Voltar ao Plano
        </Button>
        <WorkoutSession
          workout={selectedWorkout}
          onComplete={handleWorkoutComplete}
          onExerciseComplete={handleExerciseComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Plano */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl text-blue-800 mb-2">{plan.title}</CardTitle>
              <p className="text-blue-600 text-sm md:text-base">{plan.description}</p>
              <div className="flex flex-wrap items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {plan.duration_weeks} semanas
                </Badge>
                {hasStructuredWorkouts && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Dumbbell className="h-3 w-3" />
                    {plan.total_workouts} treinos
                  </Badge>
                )}
              </div>
            </div>
            
            {hasStructuredWorkouts && (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{getProgressPercentage()}%</div>
                <div className="text-sm text-blue-500">Completo</div>
                <div className="text-xs text-gray-500 mt-1">
                  {getCompletedWorkouts()}/{plan.workouts!.length} treinos
                </div>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Ações */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCopyPlan} variant="outline" className="flex items-center gap-2">
          <Copy className="h-4 w-4" />
          Copiar Plano
        </Button>
        <Button onClick={onDeletePlan} variant="destructive" className="flex items-center gap-2">
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
        <Button onClick={onGenerateNew} variant="outline" className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          Gerar Novo
        </Button>
        {onSwitchToAssistant && (
          <Button onClick={onSwitchToAssistant} variant="outline" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Tirar Dúvidas
          </Button>
        )}
      </div>

      {/* Conteúdo Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="workouts">Treinos</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrição</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Estrutura do Plano</CardTitle>
            </CardHeader>
            <CardContent>
              {plan.progression_schedule ? (
                <div className="grid gap-4">
                  {Object.entries(plan.progression_schedule).map(([period, description]) => (
                    <div key={period} className="p-4 border rounded-lg">
                      <h4 className="font-semibold text-blue-700 capitalize">
                        {period.replace('_', ' ').replace(/(\d+)/g, '$1')}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{String(description)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Plano de {plan.duration_weeks} semanas focado em {plan.difficulty_level} com progressão estruturada.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-4">
          {hasStructuredWorkouts ? (
            <div className="grid gap-4">
              {plan.workouts!.map((workout, index) => {
                const isCompleted = progressMap.get(`workout_${workout.week}_${workout.day}`) || false;
                
                return (
                  <Card key={index} className={`transition-all duration-200 ${
                    isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-300'
                  }`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            {isCompleted ? '✅' : '📋'} {workout.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                            <span>Semana {workout.week} - Dia {workout.day}</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              ~{workout.estimated_duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {workout.focus}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleStartWorkout(workout)}
                          className="flex items-center gap-2"
                          disabled={isCompleted}
                        >
                          <Play className="h-4 w-4" />
                          {isCompleted ? 'Concluído' : 'Iniciar'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-600">
                        <strong>Exercícios principais:</strong> {workout.main_exercises.map(ex => ex.name).join(', ')}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            // Fallback para planos antigos
            <Card>
              <CardHeader>
                <CardTitle>Exercícios do Plano</CardTitle>
              </CardHeader>
              <CardContent>
                {plan.exercises && plan.exercises.length > 0 ? (
                  <div className="space-y-4">
                    {plan.exercises.map((exercise, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                        <div className="flex gap-4 mt-2 text-sm">
                          <span>Séries: {exercise.sets}</span>
                          <span>Reps: {exercise.reps}</span>
                          <span>Descanso: {exercise.rest}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Nenhum exercício disponível neste formato.</p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dicas Nutricionais</CardTitle>
            </CardHeader>
            <CardContent>
              {plan.nutrition_tips && plan.nutrition_tips.length > 0 ? (
                <div className="space-y-3">
                  {plan.nutrition_tips.map((tip, index) => (
                    <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">{tip}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Nenhuma dica nutricional disponível.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acompanhamento de Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              {hasStructuredWorkouts ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold text-blue-800">Progresso Geral</h4>
                      <p className="text-sm text-blue-600">
                        {getCompletedWorkouts()} de {plan.workouts!.length} treinos concluídos
                      </p>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      {getProgressPercentage()}%
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    {Array.from({ length: plan.duration_weeks }, (_, week) => {
                      const weekWorkouts = plan.workouts!.filter(w => w.week === week + 1);
                      const completedInWeek = weekWorkouts.filter(w => 
                        progressMap.get(`workout_${w.week}_${w.day}`)
                      ).length;
                      
                      return (
                        <div key={week} className="flex items-center justify-between p-3 border rounded">
                          <span className="font-medium">Semana {week + 1}</span>
                          <span className="text-sm text-gray-600">
                            {completedInWeek}/{weekWorkouts.length} treinos
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Sistema de progresso disponível apenas para planos estruturados.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanDisplay;
