import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Target, Clock, User as UserIcon, Zap, RefreshCw, Copy, FileText, Trash2, AlertTriangle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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

// Define WorkoutPlan interface
export interface WorkoutPlan {
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
    instructions: string;
  }>;
  nutrition_tips: string[];
}

interface WorkoutPlanGeneratorProps {
  user: User | null;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  initialActiveTab?: 'form' | 'plan';
}

const WorkoutPlanGenerator = ({ 
  user, 
  workoutPlan, 
  setWorkoutPlan,
  initialActiveTab = 'form'
}: WorkoutPlanGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    fitnessLevel: '',
    goals: '',
    availableTime: '',
    equipment: '',
    limitations: ''
  });
  const [activeTab, setActiveTab] = useState<'form' | 'plan'>(() => 
    workoutPlan ? 'plan' : initialActiveTab
  );
  const { toast } = useToast();

  useEffect(() => {
    if (workoutPlan && activeTab !== 'plan') {
      setActiveTab('plan');
    }
  }, [workoutPlan, activeTab]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveWorkoutPlan = async (plan: WorkoutPlan) => {
    if (!user) return;

    console.log('💾 Tentando salvar o plano no DB...');
    try {
      const { error: deleteError } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.warn('⚠️ Erro ao deletar plano antigo (pode não existir):', deleteError.message);
      }

      const { error: insertError } = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: user.id,
          plan_data: plan as any // Cast to any to satisfy the Json type requirement
        });

      if (insertError) {
        console.error('❌ Erro ao salvar novo plano:', insertError);
        throw new Error('Falha ao salvar o plano de treino no banco de dados.');
      }

      console.log('✅ Plano salvo com sucesso no DB!');
      return true;
    } catch (error: any) {
      console.error('💥 Erro na função saveWorkoutPlan:', error);
      toast({
        title: "Erro ao Salvar Plano",
        description: error.message || "Não foi possível salvar seu plano. Tente gerar novamente.",
        variant: "destructive",
      });
      return false;
    }
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      toast({ title: "Erro de autenticação", description: "Logue novamente.", variant: "destructive" });
      return;
    }

    const requiredFields = ['age', 'gender', 'weight', 'height', 'fitnessLevel', 'goals'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    if (missingFields.length > 0) {
      toast({ title: "Campos obrigatórios", description: `Preencha: ${missingFields.join(', ')}`, variant: "destructive" });
      return;
    }
    if (isNaN(parseInt(formData.age)) || isNaN(parseInt(formData.height)) || isNaN(parseInt(formData.weight))) {
       toast({ title: "Valores inválidos", description: "Idade, Altura (cm) e Peso (kg) devem ser números.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setWorkoutPlan(null);
    
    try {
      console.log('🚀 INICIANDO GERAÇÃO DO PLANO');
      const sessionDuration = formData.availableTime ? parseInt(formData.availableTime) || 60 : 60;
      const requestData = {
        userProfile: {
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseInt(formData.weight),
          height: parseInt(formData.height),
          fitness_level: formData.fitnessLevel,
          fitness_goals: [formData.goals],
          available_days: 3,
          session_duration: sessionDuration,
          equipment: formData.equipment || 'peso_corporal',
          limitations: formData.limitations || 'nenhuma'
        },
        userId: user.id 
      };

      console.log('📤 Enviando para a API generate-workout-plan...');
      const { data, error: functionError } = await supabase.functions.invoke('generate-workout-plan', {
        body: requestData
      });

      if (functionError) throw new Error(functionError.message || 'Erro na função generate-workout-plan');
      if (!data || typeof data !== 'object' || (!data.title && !data.exercises)) throw new Error('Plano de treino inválido retornado pela API');

      console.log('✅ Dados do plano recebidos da API');
      const plan: WorkoutPlan = {
        title: data.title || 'Plano de Treino Personalizado',
        description: data.description || 'Plano gerado com base no seu perfil',
        difficulty_level: data.difficulty_level || 'iniciante',
        duration_weeks: data.duration_weeks || 8,
        exercises: data.exercises || [],
        nutrition_tips: data.nutrition_tips || []
      };

      const saved = await saveWorkoutPlan(plan);
      if (!saved) {
        setLoading(false);
        return;
      }

      console.log('✅ Plano processado e salvo. Atualizando estado...');
      setWorkoutPlan(plan);
      
      setActiveTab('plan');
      console.log('✅ Aba interna alterada para "plan"');
      
      toast({
        title: "Plano gerado e salvo!",
        description: "Seu plano de treino personalizado está pronto e salvo.",
      });

    } catch (error: any) {
      console.error('💥 Erro ao gerar/salvar plano:', error);
      setWorkoutPlan(null);
      toast({
        title: "Erro ao Gerar Plano",
        description: error.message || 'Erro desconhecido.',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteWorkoutPlan = async () => {
    if (!user || !workoutPlan) return;

    setDeleting(true);
    console.log('🗑️ Tentando deletar o plano do DB...');
    try {
      const { error } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao deletar plano:', error);
        throw new Error('Falha ao excluir o plano de treino.');
      }

      console.log('✅ Plano deletado com sucesso do DB!');
      setWorkoutPlan(null);
      setActiveTab('form');
      toast({
        title: "Plano Excluído",
        description: "Seu plano de treino foi removido.",
      });

    } catch (error: any) {
      console.error('💥 Erro na função deleteWorkoutPlan:', error);
      toast({
        title: "Erro ao Excluir Plano",
        description: error.message || "Não foi possível excluir seu plano.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const copyPlan = () => {
    if (workoutPlan) {
      let planText = `🏋️ ${workoutPlan.title}\n\n`;
      planText += `📝 DESCRIÇÃO:\n${workoutPlan.description}\n\n`;
      planText += `📊 NÍVEL: ${workoutPlan.difficulty_level.toUpperCase()}\n`;
      planText += `⏱️ DURAÇÃO: ${workoutPlan.duration_weeks} semanas\n\n`;
      planText += `💪 EXERCÍCIOS:\n\n`;
      workoutPlan.exercises.forEach((exercise, index) => {
        planText += `${index + 1}. ${exercise.name}\n`;
        planText += `   📊 Séries: ${exercise.sets}\n`;
        planText += `   🔢 Repetições: ${exercise.reps}\n`;
        planText += `   ⏰ Descanso: ${exercise.rest}\n`;
        planText += `   📋 ${exercise.instructions}\n\n`;
      });
      if (workoutPlan.nutrition_tips.length > 0) {
        planText += `🥗 DICAS NUTRICIONAIS:\n\n`;
        workoutPlan.nutrition_tips.forEach((tip, index) => {
          planText += `${index + 1}. ${tip}\n`;
        });
      }
      navigator.clipboard.writeText(planText);
      toast({ title: "Copiado!", description: "Plano de treino copiado." });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card className="bg-white border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-blue-800 text-2xl">Gerador de Plano de Treino</CardTitle>
          <CardDescription className="text-blue-600">
            Crie ou visualize seu plano de treino personalizado com IA
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'form' | 'plan')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-blue-200 shadow-sm h-12">
          <TabsTrigger 
            value="form" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 py-3"
          >
            <UserIcon className="h-4 w-4" />
            {workoutPlan ? 'Gerar Novo Plano' : 'Criar Plano'}
          </TabsTrigger>
          <TabsTrigger 
            value="plan" 
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 py-3"
            disabled={!workoutPlan}
          >
            <FileText className="h-4 w-4" />
            Seu Plano Atual
            {workoutPlan && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                Salvo
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form">
          <Card className="bg-white border-blue-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Informações para Gerar seu Plano
              </CardTitle>
              {workoutPlan && (
                 <CardDescription className="text-orange-600 flex items-center gap-1 text-sm pt-2">
                   <AlertTriangle className="h-4 w-4" />
                   Gerar um novo plano substituirá o plano atual salvo.
                 </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-blue-700 font-medium">Idade *</Label>
                  <Input 
                    id="age"
                    type="number" 
                    placeholder="Sua idade em anos" 
                    value={formData.age} 
                    onChange={(e) => handleInputChange('age', e.target.value)} 
                    className="border-blue-200 focus:border-blue-400 mt-2"
                  />
                </div>
                <div>
                  <Label className="text-blue-700 font-medium">Sexo *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    className="flex flex-wrap gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino" className="text-sm">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="feminino" />
                      <Label htmlFor="feminino" className="text-sm">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="outro" id="outro" />
                      <Label htmlFor="outro" className="text-sm">Outro</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="height" className="text-blue-700 font-medium">Altura (cm) *</Label>
                  <Input 
                    id="height"
                    type="number" 
                    placeholder="Sua altura em cm" 
                    value={formData.height} 
                    onChange={(e) => handleInputChange('height', e.target.value)} 
                    className="border-blue-200 focus:border-blue-400 mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-blue-700 font-medium">Peso (kg) *</Label>
                  <Input 
                    id="weight"
                    type="number" 
                    placeholder="Seu peso em kg" 
                    value={formData.weight} 
                    onChange={(e) => handleInputChange('weight', e.target.value)} 
                    className="border-blue-200 focus:border-blue-400 mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" /> Nível de Condicionamento Atual *
                </Label>
                <RadioGroup value={formData.fitnessLevel} onValueChange={(value) => handleInputChange('fitnessLevel', value)} className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="sedentario" id="sedentario" /><Label htmlFor="sedentario" className="flex items-center gap-2 cursor-pointer">🟡 Sedentário</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="iniciante" id="iniciante" /><Label htmlFor="iniciante" className="flex items-center gap-2 cursor-pointer">🟠 Iniciante</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="intermediario" id="intermediario" /><Label htmlFor="intermediario" className="flex items-center gap-2 cursor-pointer">🟢 Intermediário</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="avancado" id="avancado" /><Label htmlFor="avancado" className="flex items-center gap-2 cursor-pointer">🏆 Avançado</Label></div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" /> Objetivo Principal *
                </Label>
                <RadioGroup value={formData.goals} onValueChange={(value) => handleInputChange('goals', value)} className="mt-3 space-y-3">
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="perda_peso" id="perda_peso" /><Label htmlFor="perda_peso" className="flex items-center gap-2 cursor-pointer">📉 Perda de Peso / Gordura</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="hipertrofia" id="hipertrofia" /><Label htmlFor="hipertrofia" className="flex items-center gap-2 cursor-pointer">💪 Ganho de Massa Muscular</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="condicionamento" id="condicionamento" /><Label htmlFor="condicionamento" className="flex items-center gap-2 cursor-pointer">❤️ Melhora Cardiovascular</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="forca" id="forca" /><Label htmlFor="forca" className="flex items-center gap-2 cursor-pointer">⚡ Aumento de Força</Label></div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50"><RadioGroupItem value="saude_geral" id="saude_geral" /><Label htmlFor="saude_geral" className="flex items-center gap-2 cursor-pointer">🧘 Saúde Geral / Manutenção</Label></div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Tempo Disponível por Treino
                </Label>
                <Select value={formData.availableTime} onValueChange={(value) => handleSelectChange('availableTime', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione o tempo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">⏰ 30 min</SelectItem>
                    <SelectItem value="45">⏰ 45 min</SelectItem>
                    <SelectItem value="60">⏰ 60 min</SelectItem>
                    <SelectItem value="90">⏰ 90 min</SelectItem>
                    <SelectItem value="120">⏰ 2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Equipamentos Disponíveis</Label>
                <Select value={formData.equipment} onValueChange={(value) => handleSelectChange('equipment', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione os equipamentos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia_completa">🏢 Academia completa</SelectItem>
                    <SelectItem value="casa_halteres">🏠 Casa com halteres</SelectItem>
                    <SelectItem value="casa_basico">🏠 Casa básicos</SelectItem>
                    <SelectItem value="peso_corporal">🤸 Peso corporal</SelectItem>
                    <SelectItem value="parque">🌳 Parque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Limitações Físicas</Label>
                <Select value={formData.limitations} onValueChange={(value) => handleSelectChange('limitations', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione limitações" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">✅ Nenhuma</SelectItem>
                    <SelectItem value="joelho">🦵 Joelho</SelectItem>
                    <SelectItem value="costas">🔙 Costas</SelectItem>
                    <SelectItem value="ombro">💪 Ombro</SelectItem>
                    <SelectItem value="tornozelo">🦶 Tornozelo</SelectItem>
                    <SelectItem value="cardiaco">❤️ Cardíaco</SelectItem>
                    <SelectItem value="outros">⚠️ Outras</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={generateWorkoutPlan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <><RefreshCw className="h-5 w-5 mr-2 animate-spin" /> Gerando...</>
                ) : (
                  <><Dumbbell className="h-5 w-5 mr-2" /> {workoutPlan ? 'Gerar e Substituir Plano' : 'Gerar Plano de Treino'}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card className="bg-white border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Seu Plano de Treino Atual
                </div>
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="destructive"
                      size="sm"
                      disabled={deleting}
                    >
                      {deleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      <span className="ml-2 hidden sm:inline">Excluir Plano</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir seu plano de treino atual? Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={deleteWorkoutPlan}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Confirmar Exclusão
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workoutPlan ? (
                <div className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-3">{workoutPlan.title}</h3>
                    <p className="text-green-700 mb-4">{workoutPlan.description}</p>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <span className="text-sm text-green-600 font-medium">Nível</span>
                        <p className="text-green-800 font-bold capitalize">{workoutPlan.difficulty_level}</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-green-200">
                        <span className="text-sm text-green-600 font-medium">Duração</span>
                        <p className="text-green-800 font-bold">{workoutPlan.duration_weeks} semanas</p>
                      </div>
                    </div>
                    {workoutPlan.exercises && workoutPlan.exercises.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-bold text-green-800 mb-3">💪 Exercícios</h4>
                        <div className="space-y-4">
                          {workoutPlan.exercises.map((exercise, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border border-green-200">
                              <h5 className="font-bold text-green-800 mb-2">{index + 1}. {exercise.name}</h5>
                              <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                                <span className="text-green-600">📊 Séries: <strong>{exercise.sets}</strong></span>
                                <span className="text-green-600">🔢 Reps: <strong>{exercise.reps}</strong></span>
                                <span className="text-green-600">⏰ Descanso: <strong>{exercise.rest}</strong></span>
                              </div>
                              <p className="text-green-700 text-sm">{exercise.instructions}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {workoutPlan.nutrition_tips && workoutPlan.nutrition_tips.length > 0 && (
                      <div>
                        <h4 className="text-lg font-bold text-green-800 mb-3">🥗 Dicas Nutricionais</h4>
                        <ul className="space-y-2">
                          {workoutPlan.nutrition_tips.map((tip, index) => (
                            <li key={index} className="text-green-700 flex items-start gap-2">
                              <span className="text-green-600 font-bold">{index + 1}.</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={copyPlan}
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar Plano
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('form')}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" /> Gerar Novo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4"><FileText className="h-8 w-8 text-gray-400" /></div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum plano salvo</h3>
                  <p className="text-gray-500 mb-6">Vá para "Criar Plano" para gerar seu treino.</p>
                  <Button onClick={() => setActiveTab('form')} className="bg-blue-600 hover:bg-blue-700 text-white"><Dumbbell className="h-4 w-4 mr-2" /> Criar Meu Plano</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
