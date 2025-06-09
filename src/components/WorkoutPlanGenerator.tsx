
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Save, Dumbbell, MessageCircle, RefreshCw, Trash2, CheckCircle2, ArrowRight, Clock, Target, TrendingUp, Apple, Zap, User, Calendar, Activity, Heart, Dumbbell as DumbbellIcon, Timer, Trophy, Star, Info, Flame } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '@/integrations/supabase/client';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  rest: string;
  instructions: string;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  exercises: Exercise[];
  nutrition_tips: string[];
}

interface WorkoutPlanGeneratorProps {
  user: SupabaseUser | null;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: React.Dispatch<React.SetStateAction<WorkoutPlan | null>>;
  initialActiveTab?: string;
  onSwitchToAssistant?: () => void;
}

const WorkoutPlanGenerator = ({ user, workoutPlan, setWorkoutPlan, initialActiveTab = 'form', onSwitchToAssistant }: WorkoutPlanGeneratorProps) => {
  const [title, setTitle] = useState(workoutPlan?.title || '');
  const [description, setDescription] = useState(workoutPlan?.description || '');
  const [difficultyLevel, setDifficultyLevel] = useState(workoutPlan?.difficulty_level || 'iniciante');
  const [durationWeeks, setDurationWeeks] = useState(workoutPlan?.duration_weeks || 4);
  const [exercises, setExercises] = useState<Exercise[]>(workoutPlan?.exercises || []);
  const [nutritionTips, setNutritionTips] = useState<string[]>(workoutPlan?.nutrition_tips || []);
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const { toast } = useToast();
  const [progressMap, setProgressMap] = useState(new Map<string, boolean>());

  const handleAddExercise = () => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name: '',
      sets: 3,
      reps: 10,
      rest: '60 segundos',
      instructions: '',
    };
    setExercises([...exercises, newExercise]);
  };

  const handleExerciseChange = (id: string, field: string, value: any) => {
    const updatedExercises = exercises.map(exercise =>
      exercise.id === id ? { ...exercise, [field]: value } : exercise
    );
    setExercises(updatedExercises);
  };

  const handleDeleteExercise = (id: string) => {
    const updatedExercises = exercises.filter(exercise => exercise.id !== id);
    setExercises(updatedExercises);
  };

  const handleAddNutritionTip = () => {
    setNutritionTips([...nutritionTips, '']);
  };

  const handleNutritionTipChange = (index: number, value: string) => {
    const updatedTips = [...nutritionTips];
    updatedTips[index] = value;
    setNutritionTips(updatedTips);
  };

  const handleDeleteNutritionTip = (index: number) => {
    const updatedTips = nutritionTips.filter((_, i) => i !== index);
    setNutritionTips(updatedTips);
  };

  const handleGeneratePlan = () => {
    if (!title || !description) {
      toast({
        title: "Preencha os campos!",
        description: "Título e descrição são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const newPlan: WorkoutPlan = {
      id: uuidv4(),
      title,
      description,
      difficulty_level: difficultyLevel,
      duration_weeks: durationWeeks,
      exercises,
      nutrition_tips: nutritionTips,
    };
    setWorkoutPlan(newPlan);
    setActiveTab('plan');
  };

  const handleCopyPlan = () => {
    if (workoutPlan) {
      const planString = JSON.stringify(workoutPlan, null, 2);
      navigator.clipboard.writeText(planString);
      toast({
        title: "Plano Copiado!",
        description: "O plano de treino foi copiado para a área de transferência.",
      });
    }
  };

  const handleSavePlan = async () => {
    if (!user || !workoutPlan) {
      toast({
        title: "Erro ao salvar!",
        description: "Usuário não autenticado ou plano não gerado.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: user.id,
          plan_data: workoutPlan as any
        });

      if (error) {
        console.error("Erro ao salvar o plano:", error);
        toast({
          title: "Erro ao salvar!",
          description: "Houve um problema ao salvar o plano. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Plano Salvo!",
          description: "Seu plano de treino foi salvo com sucesso!",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar o plano:", error);
      toast({
        title: "Erro ao salvar!",
        description: "Houve um problema ao salvar o plano. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async () => {
    setWorkoutPlan(null);
    setActiveTab('form');
    setProgressMap(new Map());
    toast({
      title: "Plano Excluído!",
      description: "O plano de treino foi excluído.",
    });
  };

  const handleGenerateNew = () => {
    setWorkoutPlan(null);
    setActiveTab('form');
    setProgressMap(new Map());
  };

  const handleProgressChange = (itemIdentifier: string, currentStatus: boolean) => {
    const newProgressMap = new Map(progressMap);
    newProgressMap.set(itemIdentifier, !currentStatus);
    setProgressMap(newProgressMap);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-blue-800 mb-2">
                Crie seu plano de treino personalizado!
              </h2>
              <p className="text-blue-600 text-sm md:text-base">
                Preencha os campos abaixo para gerar um plano de treino sob medida para você.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Dumbbell className="h-8 w-8 md:h-12 md:w-12 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white border border-blue-200 shadow-sm h-auto">
          <TabsTrigger value="form" className="flex items-center justify-center data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3">
            <Dumbbell className="h-4 w-4 mr-2" />
            <span className="text-xs md:text-sm">Formulário</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center justify-center data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!workoutPlan}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span className="text-xs md:text-sm">Plano de Treino</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-4">
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Informações do Plano</CardTitle>
                <CardDescription>Preencha os detalhes do seu plano de treino.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título</Label>
                      <Input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="difficulty">Nível de Dificuldade</Label>
                      <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Selecione a dificuldade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="iniciante">Iniciante</SelectItem>
                          <SelectItem value="intermediario">Intermediário</SelectItem>
                          <SelectItem value="avancado">Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duração (semanas)</Label>
                    <Input
                      type="number"
                      id="duration"
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(Number(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Exercícios</CardTitle>
                <CardDescription>Adicione os exercícios ao seu plano.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exercises.map((exercise) => (
                  <div key={exercise.id} className="space-y-2 border p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`exercise-name-${exercise.id}`}>Nome</Label>
                        <Input
                          type="text"
                          id={`exercise-name-${exercise.id}`}
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(exercise.id, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exercise-sets-${exercise.id}`}>Séries</Label>
                        <Input
                          type="number"
                          id={`exercise-sets-${exercise.id}`}
                          value={exercise.sets}
                          onChange={(e) => handleExerciseChange(exercise.id, 'sets', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exercise-reps-${exercise.id}`}>Repetições</Label>
                        <Input
                          type="number"
                          id={`exercise-reps-${exercise.id}`}
                          value={exercise.reps}
                          onChange={(e) => handleExerciseChange(exercise.id, 'reps', Number(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label htmlFor={`exercise-rest-${exercise.id}`}>Descanso</Label>
                        <Input
                          type="text"
                          id={`exercise-rest-${exercise.id}`}
                          value={exercise.rest}
                          onChange={(e) => handleExerciseChange(exercise.id, 'rest', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`exercise-instructions-${exercise.id}`}>Instruções</Label>
                      <Textarea
                        id={`exercise-instructions-${exercise.id}`}
                        value={exercise.instructions}
                        onChange={(e) => handleExerciseChange(exercise.id, 'instructions', e.target.value)}
                      />
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteExercise(exercise.id)}>
                      Remover Exercício
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={handleAddExercise}>
                  Adicionar Exercício
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Dicas Nutricionais</CardTitle>
                <CardDescription>Adicione dicas de nutrição ao seu plano.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {nutritionTips.map((tip, index) => (
                  <div key={index} className="space-y-2 border p-4 rounded-md">
                    <Label htmlFor={`nutrition-tip-${index}`}>Dica {index + 1}</Label>
                    <Textarea
                      id={`nutrition-tip-${index}`}
                      value={tip}
                      onChange={(e) => handleNutritionTipChange(index, e.target.value)}
                    />
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteNutritionTip(index)}>
                      Remover Dica
                    </Button>
                  </div>
                ))}
                <Button variant="secondary" onClick={handleAddNutritionTip}>
                  Adicionar Dica
                </Button>
              </CardContent>
            </Card>

            <Button className="w-full bg-blue-600 text-white hover:bg-blue-700" onClick={handleGeneratePlan}>
              Gerar Plano de Treino
            </Button>
          </div>
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
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="py-8 text-center">
                <h2 className="text-xl font-semibold mb-4">Nenhum plano de treino gerado ainda!</h2>
                <p className="text-gray-600">Preencha o formulário e clique em "Gerar Plano de Treino" para ver seu plano personalizado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
