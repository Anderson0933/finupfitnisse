
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
import { Loader2, Sparkles, Target, Clock, Dumbbell, Brain, Apple, MapPin, User as UserIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';
import ConfirmationDialog from './ConfirmationDialog';
import QueueStatus from './QueueStatus';

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
  const [showQueueStatus, setShowQueueStatus] = useState(false);
  
  // Estados dos modais de confirmação
  const [showGenerateConfirmation, setShowGenerateConfirmation] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showNewPlanConfirmation, setShowNewPlanConfirmation] = useState(false);
  
  // Form states - NOVOS CAMPOS ESSENCIAIS
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('');
  const [fitnessGoals, setFitnessGoals] = useState('');
  const [availableTime, setAvailableTime] = useState('');
  const [preferredExercises, setPreferredExercises] = useState('');
  const [healthConditions, setHealthConditions] = useState('');
  const [workoutDays, setWorkoutDays] = useState('');
  const [workoutLocation, setWorkoutLocation] = useState('');

  const { toast } = useToast();

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
      setShowQueueStatus(false);
    }
  }, [workoutPlan]);

  const handleProgressChange = (itemId: string, completed: boolean) => {
    setProgressMap(prev => new Map(prev.set(itemId, completed)));
  };

  // FUNÇÃO CRÍTICA: Deletar plano anterior antes de criar novo
  const deleteExistingPlan = async () => {
    if (!user) return;

    try {
      // Deletar plano anterior do usuário
      const { error: deleteError } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting existing plan:', deleteError);
      }

      // Deletar progresso anterior
      const { error: progressError } = await supabase
        .from('plan_progress')
        .delete()
        .eq('user_id', user.id);

      if (progressError) {
        console.error('Error deleting existing progress:', progressError);
      }

      // Deletar itens da fila anterior usando a função do banco
      try {
        const { error: queueError } = await supabase.rpc('delete_user_queue_items', {
          p_user_id: user.id
        });

        if (queueError) {
          console.error('Error deleting existing queue items:', queueError);
        }
      } catch (queueDeleteError) {
        console.error('Queue delete error:', queueDeleteError);
        // Continuar mesmo se houver erro
      }

      console.log('✅ Plano anterior deletado com sucesso');
    } catch (error) {
      console.error('Error in deleteExistingPlan:', error);
    }
  };

  // NOVA FUNÇÃO: Verificar se deve mostrar confirmação
  const handleGeneratePlanRequest = () => {
    if (!user) {
      toast({ title: "Erro", description: "Você precisa estar logado para gerar um plano.", variant: "destructive" });
      return;
    }

    // VALIDAÇÃO CRÍTICA: Verificar todos os campos obrigatórios incluindo novos campos
    if (!age || !height || !weight || !fitnessLevel || !fitnessGoals || !availableTime || !workoutDays || !workoutLocation) {
      toast({ 
        title: "Campos obrigatórios", 
        description: "Por favor, preencha todos os campos obrigatórios, incluindo idade, altura, peso e local de treino.", 
        variant: "destructive" 
      });
      return;
    }

    // Se já existe um plano, mostrar modal de confirmação
    if (workoutPlan) {
      setShowGenerateConfirmation(true);
    } else {
      // Se não existe plano, gerar diretamente
      handleGeneratePlan();
    }
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    
    try {
      // CRÍTICO: Deletar plano anterior ANTES de criar novo
      await deleteExistingPlan();

      const requestData = {
        user_id: user!.id,
        age: parseInt(age),
        height: parseFloat(height),
        weight: parseFloat(weight),
        fitness_level: fitnessLevel,
        fitness_goals: fitnessGoals,
        available_time: availableTime,
        preferred_exercises: preferredExercises,
        health_conditions: healthConditions,
        workout_days: parseInt(workoutDays),
        workout_location: workoutLocation
      };

      console.log('📤 Adicionando à fila usando função do banco:', requestData);

      // Usar a função do banco para adicionar à fila
      const { data: queueData, error: queueError } = await supabase.rpc('add_to_workout_queue', {
        p_user_id: user!.id,
        p_request_data: requestData
      });

      if (queueError) {
        console.error('Error adding to queue:', queueError);
        toast({ 
          title: "Erro na geração", 
          description: `Não foi possível adicionar à fila: ${queueError.message}`, 
          variant: "destructive" 
        });
        return;
      }

      console.log('✅ Adicionado à fila:', queueData);
      
      // Mostrar status da fila
      setShowQueueStatus(true);
      setActiveTab('queue');
      
      toast({ 
        title: "Plano adicionado à fila!", 
        description: "Seu plano está sendo gerado. Acompanhe o progresso abaixo." 
      });

    } catch (error) {
      console.error('Error in handleGeneratePlan:', error);
      toast({ 
        title: "Erro inesperado", 
        description: "Ocorreu um erro inesperado. Tente novamente.", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
      setShowGenerateConfirmation(false);
    }
  };

  const handlePlanReady = (plan: WorkoutPlan) => {
    setWorkoutPlan(plan);
    setShowQueueStatus(false);
    setActiveTab('plan');
    
    // Resetar progresso para o novo plano
    setProgressMap(new Map());
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

  const handleDeletePlanRequest = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeletePlan = async () => {
    if (!user) return;

    try {
      // Deletar do banco de dados
      await deleteExistingPlan();
      
      // Limpar estado local
      setWorkoutPlan(null);
      setProgressMap(new Map());
      setShowQueueStatus(false);
      setActiveTab('form');
      
      toast({ title: "Plano excluído", description: "Seu plano de treino foi removido." });
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({ title: "Erro", description: "Não foi possível excluir o plano.", variant: "destructive" });
    } finally {
      setShowDeleteConfirmation(false);
    }
  };

  const handleGenerateNewRequest = () => {
    setShowNewPlanConfirmation(true);
  };

  const handleGenerateNew = async () => {
    if (!user) return;

    try {
      // Deletar plano atual antes de gerar novo
      await deleteExistingPlan();
      
      setWorkoutPlan(null);
      setProgressMap(new Map());
      setShowQueueStatus(false);
      setActiveTab('form');
      
      toast({ title: "Plano removido", description: "Agora você pode gerar um novo plano de treino." });
    } catch (error) {
      console.error('Error in handleGenerateNew:', error);
    } finally {
      setShowNewPlanConfirmation(false);
    }
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
      {/* Modais de Confirmação */}
      <ConfirmationDialog
        open={showGenerateConfirmation}
        onOpenChange={setShowGenerateConfirmation}
        title="Substituir Plano Existente"
        description="Você já possui um plano de treino. Gerar um novo plano irá substituir o atual permanentemente. Deseja continuar?"
        confirmText="Sim, Substituir"
        cancelText="Cancelar"
        onConfirm={handleGeneratePlan}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        title="Excluir Plano de Treino"
        description="Tem certeza que deseja excluir seu plano de treino? Esta ação não pode ser desfeita."
        confirmText="Sim, Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeletePlan}
        variant="destructive"
      />

      <ConfirmationDialog
        open={showNewPlanConfirmation}
        onOpenChange={setShowNewPlanConfirmation}
        title="Gerar Novo Plano"
        description="Isso irá remover seu plano atual para que você possa criar um novo. Deseja continuar?"
        confirmText="Sim, Continuar"
        cancelText="Cancelar"
        onConfirm={handleGenerateNew}
        variant="destructive"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="form" 
            className="flex items-center gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Gerar Plano
          </TabsTrigger>
          <TabsTrigger value="queue" disabled={!showQueueStatus} className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Fila
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
            {/* SEÇÃO DE DADOS PESSOAIS - NOVA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="age">Idade (anos) *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    min="14"
                    max="99"
                  />
                </div>

                <div>
                  <Label htmlFor="height">Altura (cm) *</Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Ex: 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    min="120"
                    max="250"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Ex: 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    min="30"
                    max="300"
                    step="0.1"
                  />
                </div>

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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Informações de Treino
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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

                <div>
                  <Label htmlFor="workout-location">Local de Treino *</Label>
                  <Select value={workoutLocation} onValueChange={setWorkoutLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Onde você vai treinar?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa">Casa (sem equipamentos)</SelectItem>
                      <SelectItem value="casa_equipamentos">Casa (com equipamentos básicos)</SelectItem>
                      <SelectItem value="academia">Academia completa</SelectItem>
                      <SelectItem value="parque">Parque/Ar livre</SelectItem>
                      <SelectItem value="condominio">Academia do condomínio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
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

                <div className="grid md:grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Button 
                onClick={handleGeneratePlanRequest}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Adicionando à fila...
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

        <TabsContent value="queue">
          {showQueueStatus && (
            <QueueStatus user={user} onPlanReady={handlePlanReady} />
          )}
        </TabsContent>

        <TabsContent value="plan">
          {workoutPlan ? (
            <WorkoutPlanDisplay
              plan={workoutPlan}
              onCopyPlan={handleCopyPlan}
              onDeletePlan={handleDeletePlanRequest}
              onGenerateNew={handleGenerateNewRequest}
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
