import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Copy, CheckCircle, RefreshCcw, Loader2 } from 'lucide-react';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';
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

export interface WorkoutPlan {
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

interface WorkoutPlanGeneratorProps {
  user: User | null;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  initialActiveTab?: string;
  onSwitchToAssistant?: () => void;
  hasAccess?: boolean;
}

const WorkoutPlanGenerator = ({ 
  user, 
  workoutPlan, 
  setWorkoutPlan, 
  initialActiveTab = 'form',
  onSwitchToAssistant,
  hasAccess = false
}: WorkoutPlanGeneratorProps) => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('iniciante');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [preferredExercises, setPreferredExercises] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  const [workoutLocation, setWorkoutLocation] = useState('casa');
  const [activeTab, setActiveTab] = useState(initialActiveTab);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const { toast } = useToast();
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());

  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setGenerationError(null);

    const numericAge = parseInt(age, 10);
    const numericHeight = parseInt(height, 10);
    const numericWeight = parseInt(weight, 10);
    const numericWorkoutDays = parseInt(workoutDays, 10);

    if (
      isNaN(numericAge) ||
      isNaN(numericHeight) ||
      isNaN(numericWeight) ||
      isNaN(numericWorkoutDays)
    ) {
      setGenerationError('Por favor, insira valores numéricos válidos para idade, altura, peso e dias de treino.');
      setIsGenerating(false);
      return;
    }

    if (!user) {
      setGenerationError('Usuário não autenticado. Por favor, faça login novamente.');
      setIsGenerating(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-workout-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          age: numericAge,
          height: numericHeight,
          weight: numericWeight,
          fitness_level: fitnessLevel,
          fitness_goals: fitnessGoals,
          available_time: availableTime,
          preferred_exercises: preferredExercises,
          health_conditions: healthConditions,
          workout_days: numericWorkoutDays,
          workout_location: workoutLocation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao gerar plano:', errorData);
        setGenerationError(errorData.error || 'Erro ao gerar o plano de treino.');
        return;
      }

      const data = await response.json();
      setWorkoutPlan(data.plan);
      setActiveTab('plan');
      setProgressMap(new Map());
      toast({
        title: "Plano Gerado!",
        description: "Seu plano de treino foi gerado com sucesso.",
      });
    } catch (error: any) {
      console.error('Erro durante a geração do plano:', error);
      setGenerationError(error.message || 'Ocorreu um erro ao gerar o plano de treino.');
      toast({
        title: "Erro ao Gerar Plano",
        description: "Ocorreu um erro ao gerar o plano. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPlan = () => {
    if (workoutPlan) {
      const planText = JSON.stringify(workoutPlan, null, 2);
      navigator.clipboard.writeText(planText)
        .then(() => {
          toast({
            title: "Plano Copiado!",
            description: "O plano de treino foi copiado para a área de transferência.",
          });
        })
        .catch(err => {
          console.error("Erro ao copiar plano: ", err);
          toast({
            title: "Erro ao Copiar Plano",
            description: "Não foi possível copiar o plano. Tente novamente.",
            variant: "destructive",
          });
        });
    }
  };

  const handleDeletePlan = async () => {
    if (!user || !workoutPlan) {
      toast({
        title: "Erro ao Excluir Plano",
        description: "Não foi possível excluir o plano. Tente novamente.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id)
        .eq('plan_data->>title', workoutPlan.title);

      if (error) {
        console.error("Erro ao excluir plano: ", error);
        toast({
          title: "Erro ao Excluir Plano",
          description: "Não foi possível excluir o plano. Tente novamente.",
          variant: "destructive",
        });
      } else {
        setWorkoutPlan(null);
        setActiveTab('form');
        toast({
          title: "Plano Excluído!",
          description: "O plano de treino foi excluído com sucesso.",
        });
      }
    } catch (err) {
      console.error("Erro ao excluir plano: ", err);
      toast({
        title: "Erro ao Excluir Plano",
        description: "Não foi possível excluir o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateNew = () => {
    setActiveTab('form');
    setWorkoutPlan(null);
  };

  const handleProgressChange = useCallback((itemId: string, completed: boolean) => {
    setProgressMap(prevMap => {
      const newMap = new Map(prevMap);
      newMap.set(itemId, completed);
      return newMap;
    });
  }, []);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2 h-auto">
          <TabsTrigger value="form" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-xl font-medium transition-colors duration-200">
            Gerar Plano
          </TabsTrigger>
          <TabsTrigger value="plan" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 rounded-xl font-medium transition-colors duration-200" disabled={!workoutPlan}>
            Ver Plano
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Insira seus dados para personalizar o plano de treino.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input type="number" id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="workoutDays">Dias por semana</Label>
                  <Input type="number" id="workoutDays" value={workoutDays} onChange={(e) => setWorkoutDays(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fitnessLevel">Nível de Fitness</Label>
                  <Select value={fitnessLevel} onValueChange={setFitnessLevel}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediário">Intermediário</SelectItem>
                      <SelectItem value="avançado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workoutLocation">Local de Treino</Label>
                  <Select value={workoutLocation} onValueChange={setWorkoutLocation}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa (sem equipamentos)</SelectItem>
                      <SelectItem value="casa_equipamentos">Casa (com equipamentos)</SelectItem>
                      <SelectItem value="academia">Academia</SelectItem>
                      <SelectItem value="parque">Parque</SelectItem>
                      <SelectItem value="condominio">Condomínio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="fitnessGoals">Objetivos de Fitness</Label>
                <Textarea
                  id="fitnessGoals"
                  placeholder="Ex: Ganhar massa muscular, perder peso, melhorar resistência..."
                  value={fitnessGoals}
                  onChange={(e) => setFitnessGoals(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="availableTime">Tempo disponível por treino (minutos)</Label>
                <Input
                  type="text"
                  id="availableTime"
                  placeholder="Ex: 60 minutos"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="preferredExercises">Exercícios Preferidos (opcional)</Label>
                <Textarea
                  id="preferredExercises"
                  placeholder="Ex: Musculação, calistenia, cardio..."
                  value={preferredExercises}
                  onChange={(e) => setPreferredExercises(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="healthConditions">Condições de Saúde (opcional)</Label>
                <Textarea
                  id="healthConditions"
                  placeholder="Ex: Problemas nas articulações, pressão alta..."
                  value={healthConditions}
                  onChange={(e) => setHealthConditions(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          <Button onClick={handleGeneratePlan} disabled={isGenerating} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando plano...
              </>
            ) : (
              <>
                <Dumbbell className="mr-2 h-4 w-4" />
                Gerar Plano de Treino
              </>
            )}
          </Button>
          {generationError && (
            <div className="text-red-500 text-sm">{generationError}</div>
          )}
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
              hasAccess={hasAccess}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <RefreshCcw className="h-10 w-10 text-blue-500 animate-spin" />
                <CardTitle className="text-xl font-semibold">Nenhum plano gerado ainda</CardTitle>
                <CardDescription>Gere um plano de treino para começar.</CardDescription>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
