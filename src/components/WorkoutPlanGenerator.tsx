
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Target, Clock, Dumbbell, Brain, Apple } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';

export interface WorkoutPlan {
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  total_workouts?: number;
  workouts?: any[];
  exercises?: any[];
  nutrition_tips?: string[];
  progression_schedule?: any;
}

interface WorkoutPlanGeneratorProps {
  user: User | null;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  initialActiveTab?: string;
  onSwitchToAssistant?: () => void;
}

const WorkoutPlanGenerator = ({ 
  user, 
  workoutPlan, 
  setWorkoutPlan, 
  initialActiveTab = 'form',
  onSwitchToAssistant 
}: WorkoutPlanGeneratorProps) => {
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [loading, setLoading] = useState(false);
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());
  
  // Form states
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [preferredExercises, setPreferredExercises] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');

  const { toast } = useToast();

  // Carregar progresso do banco de dados
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !workoutPlan) return;

      try {
        const { data, error } = await supabase
          .from('plan_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('plan_id', workoutPlan.title);

        if (error) {
          console.error('Error loading progress:', error);
          return;
        }

        const newProgressMap = new Map<string, boolean>();
        data?.forEach(progress => {
          newProgressMap.set(progress.item_identifier, progress.is_completed);
        });
        
        setProgressMap(newProgressMap);
        console.log('Progress loaded:', newProgressMap);
      } catch (error) {
        console.error('Error in loadProgress:', error);
      }
    };

    loadProgress();
  }, [user, workoutPlan]);

  useEffect(() => {
    if (workoutPlan) {
      setActiveTab('plan');
    }
  }, [workoutPlan]);

  const handleProgressChange = (itemId: string, completed: boolean) => {
    setProgressMap(prev => new Map(prev.set(itemId, completed)));
  };

  const handleGeneratePlan = async () => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para gerar um plano.", variant: "destructive" });
      return;
    }

    if (!fitnessLevel || !fitnessGoals || !availableTime || !workoutDays) {
      toast({ title: "Campos obrigatórios", description: "Por favor, preencha todos os campos obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: {
          user_id: user.id,
          fitness_level: fitnessLevel,
          fitness_goals: fitnessGoals,
          available_time: availableTime,
          preferred_exercises: preferredExercises,
          health_conditions: healthConditions,
          workout_days: parseInt(workoutDays)
        }
      });

      if (error) {
        console.error('Error generating workout plan:', error);
        toast({ 
          title: "Erro ao gerar plano", 
          description: "Houve um problema ao gerar seu plano. Tente novamente.", 
          variant: "destructive" 
        });
        return;
      }

      if (data && data.plan) {
        console.log('Generated workout plan:', data.plan);
        setWorkoutPlan(data.plan);
        setActiveTab('plan');
        
        // Resetar progresso para o novo plano
        setProgressMap(new Map());
        
        toast({ 
          title: "Plano gerado com sucesso!", 
          description: "Seu plano de treino personalizado está pronto." 
        });
      }
    } catch (error) {
      console.error('Error in handleGeneratePlan:', error);
      toast({ 
        title: "Erro inesperado", 
        description: "Ocorreu um erro inesperado. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPlan = async () => {
    if (!workoutPlan) return;
    
    try {
      const planText = `**${workoutPlan.title}**\n\n${workoutPlan.description}\n\nNível: ${workoutPlan.difficulty_level}\nDuração: ${workoutPlan.duration_weeks} semanas`;
      await navigator.clipboard.writeText(planText);
      toast({ title: "Plano copiado!", description: "O plano foi copiado para sua área de transferência." });
    } catch (error) {
      toast({ title: "Erro", description: "Não foi possível copiar o plano.", variant: "destructive" });
    }
  };

  const handleDeletePlan = () => {
    setWorkoutPlan(null);
    setProgressMap(new Map());
    setActiveTab('form');
    toast({ title: "Plano excluído", description: "Seu plano de treino foi removido." });
  };

  const handleGenerateNew = () => {
    setWorkoutPlan(null);
    setProgressMap(new Map());
    setActiveTab('form');
  };

  if (!user) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Acesso Restrito</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-600">
            Você precisa estar logado para acessar o gerador de planos de treino.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="form" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Gerar Plano
          </TabsTrigger>
          <TabsTrigger value="plan" disabled={!workoutPlan} className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Meu Plano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Brain className="h-6 w-6" />
                IA Personal Trainer
              </CardTitle>
              <p className="text-blue-600">
                Crie um plano de treino personalizado com nossa inteligência artificial avançada.
              </p>
            </CardHeader>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fitness-level">Nível de Condicionamento *</Label>
                  <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione seu nível" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentario">Sedentário</SelectItem>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="workout-days">Dias de Treino por Semana *</Label>
                  <Select value={workoutDays} onValueChange={setWorkoutDays}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quantos dias você pode treinar?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 dias</SelectItem>
                      <SelectItem value="3">3 dias</SelectItem>
                      <SelectItem value="4">4 dias</SelectItem>
                      <SelectItem value="5">5 dias</SelectItem>
                      <SelectItem value="6">6 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="available-time">Tempo Disponível por Treino *</Label>
                  <Select value={availableTime} onValueChange={setAvailableTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quanto tempo você tem?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="45min">45 minutos</SelectItem>
                      <SelectItem value="60min">1 hora</SelectItem>
                      <SelectItem value="90min">1 hora e 30 minutos</SelectItem>
                      <SelectItem value="120min">2 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Objetivos e Preferências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fitness-goals">Objetivos de Fitness *</Label>
                  <Textarea
                    id="fitness-goals"
                    placeholder="Ex: Perder peso, ganhar massa muscular, melhorar resistência..."
                    value={fitnessGoals}
                    onChange={(e) => setFitnessGoals(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>

                <div>
                  <Label htmlFor="preferred-exercises">Exercícios Preferidos (opcional)</Label>
                  <Textarea
                    id="preferred-exercises"
                    placeholder="Ex: Musculação, funcional, cardio, pilates..."
                    value={preferredExercises}
                    onChange={(e) => setPreferredExercises(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>

                <div>
                  <Label htmlFor="health-conditions">Condições de Saúde (opcional)</Label>
                  <Textarea
                    id="health-conditions"
                    placeholder="Ex: Lesões, limitações, problemas articulares..."
                    value={healthConditions}
                    onChange={(e) => setHealthConditions(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleGeneratePlan}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Gerando seu plano personalizado...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Gerar Plano de Treino
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          {workoutPlan ? (
            <WorkoutPlanDisplay
              plan={workoutPlan}
              onCopyPlan={handleCopyPlan}
              onDeletePlan={handleDeletePlan}
              onGenerateNew={handleGenerateNew}
              progressMap={progressMap}
              onProgressChange={handleProgressChange}
              onSwitchToAssistant={onSwitchToAssistant}
              user={user}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">Nenhum plano de treino encontrado.</p>
                <Button onClick={() => setActiveTab('form')}>
                  Gerar Novo Plano
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
