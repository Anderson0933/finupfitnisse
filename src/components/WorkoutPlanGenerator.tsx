
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Target, Clock, User as UserIcon, Zap, RefreshCw, Copy, FileText } from 'lucide-react';

interface WorkoutPlanGeneratorProps {
  user: User | null;
}

const WorkoutPlanGenerator = ({ user }: WorkoutPlanGeneratorProps) => {
  const [loading, setLoading] = useState(false);
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
  const [workoutPlan, setWorkoutPlan] = useState('');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateWorkoutPlan = async () => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para gerar um plano de treino.",
        variant: "destructive",
      });
      return;
    }

    const requiredFields = ['age', 'gender', 'weight', 'height', 'fitnessLevel', 'goals'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setWorkoutPlan('');
    
    try {
      console.log('Enviando dados para gerar plano:', formData);

      const sessionDuration = formData.availableTime ? parseInt(formData.availableTime.replace(/\D/g, '')) || 60 : 60;

      const requestData = {
        userProfile: {
          age: formData.age,
          gender: formData.gender,
          weight: formData.weight,
          height: formData.height,
          fitness_level: formData.fitnessLevel,
          fitness_goals: [formData.goals],
          available_days: 3,
          session_duration: sessionDuration,
          equipment: formData.equipment || 'Equipamentos básicos',
          limitations: formData.limitations || 'Nenhuma limitação informada'
        },
        userId: user.id 
      };

      console.log('Dados da requisição:', requestData);

      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: requestData
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro da função:', error);
        throw new Error(error.message || 'Erro ao gerar plano de treino');
      }

      if (!data) {
        throw new Error('Nenhuma resposta foi retornada');
      }

      console.log('Dados recebidos:', data);

      let planText = '';
      
      if (data && typeof data === 'object') {
        if (data.title) {
          planText += `🏋️ ${data.title}\n\n`;
        }
        
        if (data.description) {
          planText += `📝 DESCRIÇÃO:\n${data.description}\n\n`;
        }
        
        if (data.duration_weeks) {
          planText += `⏱️ DURAÇÃO: ${data.duration_weeks} semanas\n`;
        }
        
        if (data.difficulty_level) {
          planText += `📊 NÍVEL: ${data.difficulty_level.toUpperCase()}\n\n`;
        }
        
        if (data.exercises && Array.isArray(data.exercises) && data.exercises.length > 0) {
          planText += `💪 EXERCÍCIOS:\n\n`;
          
          data.exercises.forEach((exercise: any, index: number) => {
            planText += `${index + 1}. ${exercise.name || 'Exercício'}\n`;
            if (exercise.sets) planText += `   📊 Séries: ${exercise.sets}\n`;
            if (exercise.reps) planText += `   🔢 Repetições: ${exercise.reps}\n`;
            if (exercise.rest) planText += `   ⏰ Descanso: ${exercise.rest}\n`;
            if (exercise.instructions) planText += `   📋 Instruções: ${exercise.instructions}\n`;
            planText += '\n';
          });
        }

        if (data.nutrition_tips && Array.isArray(data.nutrition_tips) && data.nutrition_tips.length > 0) {
          planText += `🥗 DICAS NUTRICIONAIS:\n\n`;
          data.nutrition_tips.forEach((tip: string, index: number) => {
            planText += `${index + 1}. ${tip}\n`;
          });
        }
      } else if (typeof data === 'string') {
        planText = data;
      } else {
        planText = JSON.stringify(data, null, 2);
      }

      console.log('Plano formatado:', planText);

      if (!planText || planText.trim() === '' || planText.trim() === '{}') {
        throw new Error('Plano de treino vazio foi retornado');
      }

      setWorkoutPlan(planText);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: "Seu plano de treino personalizado está pronto. Veja na aba 'Seu Plano'.",
      });
    } catch (error: any) {
      console.error('Erro ao gerar plano:', error);
      toast({
        title: "Erro ao gerar plano",
        description: error.message || 'Erro desconhecido ao gerar plano de treino',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPlan = () => {
    if (workoutPlan) {
      navigator.clipboard.writeText(workoutPlan);
      toast({
        title: "Copiado!",
        description: "Plano de treino copiado para a área de transferência.",
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-white border-blue-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-blue-800 text-2xl">Gerador de Plano de Treino</CardTitle>
          <CardDescription className="text-blue-600">
            Crie um plano de treino personalizado com IA baseado no seu perfil
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="form" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-white border border-blue-200 shadow-sm h-12">
          <TabsTrigger 
            value="form" 
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white text-blue-700 py-3"
          >
            <UserIcon className="h-4 w-4" />
            Criar Plano
          </TabsTrigger>
          <TabsTrigger 
            value="plan" 
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-blue-700 py-3"
          >
            <FileText className="h-4 w-4" />
            Seu Plano
            {workoutPlan && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full ml-1">
                Pronto
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
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informações pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age" className="text-blue-700 font-medium">Idade *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Ex: 25"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label className="text-blue-700 font-medium">Sexo *</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange('gender', value)}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" />
                      <Label htmlFor="masculino" className="text-sm">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="feminino" id="feminino" />
                      <Label htmlFor="feminino" className="text-sm">Feminino</Label>
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
                    placeholder="Ex: 175"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-blue-700 font-medium">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="Ex: 70"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="border-blue-200 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Nível de Condicionamento Atual *
                </Label>
                <RadioGroup
                  value={formData.fitnessLevel}
                  onValueChange={(value) => handleInputChange('fitnessLevel', value)}
                  className="mt-3 space-y-3"
                >
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <RadioGroupItem value="sedentario" id="sedentario" />
                    <Label htmlFor="sedentario" className="flex items-center gap-2 cursor-pointer">
                      🟡 Sedentário - Não pratico exercícios
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <RadioGroupItem value="iniciante" id="iniciante" />
                    <Label htmlFor="iniciante" className="flex items-center gap-2 cursor-pointer">
                      🟠 Iniciante - Menos de 6 meses de treino
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <RadioGroupItem value="intermediario" id="intermediario" />
                    <Label htmlFor="intermediario" className="flex items-center gap-2 cursor-pointer">
                      🟢 Intermediário - 6 meses a 2 anos
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                    <RadioGroupItem value="avancado" id="avancado" />
                    <Label htmlFor="avancado" className="flex items-center gap-2 cursor-pointer">
                      🏆 Avançado - Mais de 2 anos
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label htmlFor="goals" className="text-blue-700 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivos *
                </Label>
                <Textarea
                  id="goals"
                  placeholder="Ex: Perder peso, ganhar massa muscular, melhorar condicionamento..."
                  value={formData.goals}
                  onChange={(e) => handleInputChange('goals', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="availableTime" className="text-blue-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo Disponível por Treino
                </Label>
                <Input
                  id="availableTime"
                  placeholder="Ex: 60 minutos"
                  value={formData.availableTime}
                  onChange={(e) => handleInputChange('availableTime', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 mt-2"
                />
              </div>

              <div>
                <Label htmlFor="equipment" className="text-blue-700 font-medium">Equipamentos Disponíveis</Label>
                <Textarea
                  id="equipment"
                  placeholder="Ex: Academia completa, halteres em casa, apenas peso corporal..."
                  value={formData.equipment}
                  onChange={(e) => handleInputChange('equipment', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 mt-2"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="limitations" className="text-blue-700 font-medium">Limitações ou Lesões</Label>
                <Textarea
                  id="limitations"
                  placeholder="Ex: Dor no joelho, problemas nas costas..."
                  value={formData.limitations}
                  onChange={(e) => handleInputChange('limitations', e.target.value)}
                  className="border-blue-200 focus:border-blue-400 mt-2"
                  rows={2}
                />
              </div>

              <Button 
                onClick={generateWorkoutPlan}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Gerando Plano...
                  </>
                ) : (
                  <>
                    <Dumbbell className="h-5 w-5 mr-2" />
                    Gerar Plano de Treino
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card className="bg-white border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Target className="h-5 w-5" />
                Seu Plano de Treino Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workoutPlan ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 max-h-96 overflow-y-auto">
                    <div className="whitespace-pre-wrap text-sm text-green-800 font-medium leading-relaxed">
                      {workoutPlan}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={copyPlan}
                      variant="outline"
                      className="flex-1 border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Plano
                    </Button>
                    <Button 
                      onClick={() => {
                        const formTab = document.querySelector('[value="form"]') as HTMLElement;
                        formTab?.click();
                      }}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Gerar Novo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum plano gerado ainda</h3>
                  <p className="text-gray-500 mb-6">
                    Preencha o formulário na aba "Criar Plano" e clique em "Gerar Plano de Treino" para criar seu plano personalizado.
                  </p>
                  <Button 
                    onClick={() => {
                      const formTab = document.querySelector('[value="form"]') as HTMLElement;
                      formTab?.click();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Dumbbell className="h-4 w-4 mr-2" />
                    Criar Meu Plano
                  </Button>
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
