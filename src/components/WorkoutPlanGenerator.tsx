
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Save, Dumbbell, MessageCircle, RefreshCw, Trash2, CheckCircle2, ArrowRight, Clock, Target, TrendingUp, Apple, Zap, User, Calendar, Activity, Heart, Dumbbell as DumbbellIcon, Timer, Trophy, Star, Info, Flame, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
  // Form state for questionnaire
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    goal: '',
    timeAvailable: '',
    equipmentAccess: '',
    healthConditions: '',
    preferences: '',
    workoutFrequency: '',
    experience: ''
  });
  
  const [activeTab, setActiveTab] = useState<string>(initialActiveTab);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const [progressMap, setProgressMap] = useState(new Map<string, boolean>());

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateWorkoutPlan = async () => {
    console.log('🚀 Iniciando geração do plano de treino...');
    console.log('📊 Dados do formulário:', formData);

    if (!formData.age || !formData.weight || !formData.height || !formData.fitnessLevel || !formData.goal) {
      console.log('❌ Campos obrigatórios não preenchidos');
      toast({
        title: "Preencha os campos obrigatórios!",
        description: "Por favor, preencha pelo menos: idade, peso, altura, nível fitness e objetivo.",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      console.log('❌ Usuário não logado');
      toast({
        title: "Erro de autenticação!",
        description: "Você precisa estar logado para gerar um plano.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    console.log('⏳ Enviando dados para a API...');

    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: { 
          userProfile: formData,
          userId: user.id 
        }
      });

      console.log('📡 Resposta da API recebida');
      console.log('✅ Data:', data);
      console.log('❌ Error:', error);

      if (error) {
        console.error('❌ Erro ao gerar plano:', error);
        toast({
          title: "Erro ao gerar plano!",
          description: `Houve um problema ao gerar seu plano: ${error.message || 'Erro desconhecido'}`,
          variant: "destructive",
        });
        return;
      }

      if (data && data.workoutPlan) {
        console.log('✅ Plano gerado com sucesso:', data.workoutPlan);
        setWorkoutPlan(data.workoutPlan);
        
        // Salvar no banco de dados
        try {
          console.log('💾 Salvando plano no banco de dados...');
          const { error: saveError } = await supabase
            .from('user_workout_plans')
            .insert({
              user_id: user.id,
              plan_data: data.workoutPlan as any
            });

          if (saveError) {
            console.error('❌ Erro ao salvar plano:', saveError);
            toast({
              title: "Plano gerado, mas não salvo!",
              description: "O plano foi gerado mas houve erro ao salvar. Você pode copiá-lo para não perder.",
              variant: "destructive",
            });
          } else {
            console.log('✅ Plano salvo com sucesso no banco');
          }
        } catch (saveError) {
          console.error('❌ Erro ao salvar plano:', saveError);
        }

        setActiveTab('plan');
        toast({
          title: "Plano Gerado!",
          description: "Seu plano de treino personalizado foi criado com sucesso!",
        });
      } else if (data) {
        console.log('🎯 Plano encontrado diretamente na resposta:', data);
        setWorkoutPlan(data);
        
        // Salvar no banco de dados
        try {
          console.log('💾 Salvando plano direto no banco de dados...');
          const { error: saveError } = await supabase
            .from('user_workout_plans')
            .insert({
              user_id: user.id,
              plan_data: data as any
            });

          if (saveError) {
            console.error('❌ Erro ao salvar plano direto:', saveError);
          } else {
            console.log('✅ Plano direto salvo com sucesso no banco');
          }
        } catch (saveError) {
          console.error('❌ Erro ao salvar plano direto:', saveError);
        }

        setActiveTab('plan');
        toast({
          title: "Plano Gerado!",
          description: "Seu plano de treino personalizado foi criado com sucesso!",
        });
      } else {
        console.log('❌ Nenhum plano encontrado na resposta');
        toast({
          title: "Erro ao gerar plano!",
          description: "A API não retornou um plano válido. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('💥 Erro geral ao gerar plano:', error);
      toast({
        title: "Erro ao gerar plano!",
        description: `Houve um problema ao gerar seu plano: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      console.log('🏁 Processo de geração finalizado');
    }
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
                Responda algumas perguntas para gerar um plano de treino personalizado com IA.
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
            <User className="h-4 w-4 mr-2" />
            <span className="text-xs md:text-sm">Questionário</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center justify-center data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 p-2 md:p-3" disabled={!workoutPlan}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            <span className="text-xs md:text-sm">Plano de Treino</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <div className="space-y-4">
            {/* Aviso quando já existe um plano ativo */}
            {workoutPlan && (
              <Card className="bg-yellow-50 border-yellow-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800 mb-1">
                        Você já tem um plano ativo
                      </h3>
                      <p className="text-sm text-yellow-700 mb-3">
                        Para gerar um novo plano de treino, você precisa primeiro excluir o plano atual. Isso garantirá que você foque em um plano por vez.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setActiveTab('plan')}
                          className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Ver Plano Atual
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              className="bg-red-600 hover:bg-red-700"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Excluir Plano Atual
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir seu plano de treino atual? Esta ação não pode ser desfeita e você perderá todo o progresso registrado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={handleDeletePlan} className="bg-red-600 hover:bg-red-700">
                                Sim, Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Conte-nos sobre você para personalizar seu treino.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="age">Idade *</Label>
                    <Input
                      type="number"
                      id="age"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="Ex: 25"
                      disabled={!!workoutPlan}
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Peso (kg) *</Label>
                    <Input
                      type="number"
                      id="weight"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="Ex: 70"
                      disabled={!!workoutPlan}
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Altura (cm) *</Label>
                    <Input
                      type="number"
                      id="height"
                      value={formData.height}
                      onChange={(e) => handleInputChange('height', e.target.value)}
                      placeholder="Ex: 175"
                      disabled={!!workoutPlan}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Perfil de Fitness</CardTitle>
                <CardDescription>Ajude-nos a entender seu nível atual e objetivos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fitnessLevel">Nível de Condicionamento *</Label>
                    <Select value={formData.fitnessLevel} onValueChange={(value) => handleInputChange('fitnessLevel', value)} disabled={!!workoutPlan}>
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
                    <Label htmlFor="goal">Objetivo Principal *</Label>
                    <Select value={formData.goal} onValueChange={(value) => handleInputChange('goal', value)} disabled={!!workoutPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Qual seu objetivo?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="perder_peso">Perder Peso</SelectItem>
                        <SelectItem value="ganhar_massa">Ganhar Massa Muscular</SelectItem>
                        <SelectItem value="tonificar">Tonificar</SelectItem>
                        <SelectItem value="resistencia">Melhorar Resistência</SelectItem>
                        <SelectItem value="forca">Aumentar Força</SelectItem>
                        <SelectItem value="saude_geral">Saúde Geral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timeAvailable">Tempo Disponível por Treino</Label>
                    <Select value={formData.timeAvailable} onValueChange={(value) => handleInputChange('timeAvailable', value)} disabled={!!workoutPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quanto tempo você tem?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20-30min">20-30 minutos</SelectItem>
                        <SelectItem value="30-45min">30-45 minutos</SelectItem>
                        <SelectItem value="45-60min">45-60 minutos</SelectItem>
                        <SelectItem value="60+min">Mais de 60 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workoutFrequency">Frequência Semanal</Label>
                    <Select value={formData.workoutFrequency} onValueChange={(value) => handleInputChange('workoutFrequency', value)} disabled={!!workoutPlan}>
                      <SelectTrigger>
                        <SelectValue placeholder="Quantas vezes por semana?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2x">2x por semana</SelectItem>
                        <SelectItem value="3x">3x por semana</SelectItem>
                        <SelectItem value="4x">4x por semana</SelectItem>
                        <SelectItem value="5x">5x por semana</SelectItem>
                        <SelectItem value="6x">6x por semana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="equipmentAccess">Equipamentos Disponíveis</Label>
                  <Select value={formData.equipmentAccess} onValueChange={(value) => handleInputChange('equipmentAccess', value)} disabled={!!workoutPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Que equipamentos você tem acesso?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casa_sem_equipamento">Casa - Sem Equipamentos</SelectItem>
                      <SelectItem value="casa_basico">Casa - Equipamentos Básicos</SelectItem>
                      <SelectItem value="academia_completa">Academia Completa</SelectItem>
                      <SelectItem value="ao_ar_livre">Exercícios ao Ar Livre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="healthConditions">Condições de Saúde ou Limitações</Label>
                  <Textarea
                    id="healthConditions"
                    value={formData.healthConditions}
                    onChange={(e) => handleInputChange('healthConditions', e.target.value)}
                    placeholder="Descreva qualquer condição médica, lesão ou limitação que devemos considerar..."
                    disabled={!!workoutPlan}
                  />
                </div>

                <div>
                  <Label htmlFor="preferences">Preferências e Observações</Label>
                  <Textarea
                    id="preferences"
                    value={formData.preferences}
                    onChange={(e) => handleInputChange('preferences', e.target.value)}
                    placeholder="Alguma preferência específica de exercícios, horários ou outras observações..."
                    disabled={!!workoutPlan}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700" 
              onClick={generateWorkoutPlan}
              disabled={isGenerating || !!workoutPlan}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Plano Personalizado...
                </>
              ) : workoutPlan ? (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Exclua o plano atual para gerar um novo
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Gerar Plano de Treino com IA
                </>
              )}
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
                <p className="text-gray-600">Preencha o questionário e clique em "Gerar Plano de Treino com IA" para ver seu plano personalizado.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
