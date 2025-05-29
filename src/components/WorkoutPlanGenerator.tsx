
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Target, Clock, User as UserIcon, Zap, RefreshCw, Copy } from 'lucide-react';

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
    setWorkoutPlan(''); // Limpar plano anterior
    
    try {
      console.log('Enviando dados para gerar plano:', { userProfile: formData, userId: user.id });

      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: { 
          userProfile: formData,
          userId: user.id 
        }
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro da função:', error);
        throw new Error(error.message || 'Erro ao gerar plano de treino');
      }

      // Correção: verificar se data existe e extrair o plano
      if (!data) {
        throw new Error('Nenhuma resposta foi retornada');
      }

      // Se data é um objeto com plano estruturado, formatá-lo
      let planText = '';
      if (data.title && data.exercises) {
        planText = `${data.title}\n\n${data.description}\n\n`;
        planText += `DURAÇÃO: ${data.duration_weeks} semanas\n`;
        planText += `NÍVEL: ${data.difficulty_level}\n\n`;
        planText += `EXERCÍCIOS:\n\n`;
        
        data.exercises.forEach((exercise: any, index: number) => {
          planText += `${index + 1}. ${exercise.name}\n`;
          planText += `   - Séries: ${exercise.sets}\n`;
          planText += `   - Repetições: ${exercise.reps}\n`;
          planText += `   - Descanso: ${exercise.rest}\n`;
          planText += `   - Instruções: ${exercise.instructions}\n\n`;
        });

        if (data.nutrition_tips && data.nutrition_tips.length > 0) {
          planText += `DICAS NUTRICIONAIS:\n\n`;
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
      setWorkoutPlan(planText);
      
      toast({
        title: "Plano gerado com sucesso!",
        description: "Seu plano de treino personalizado está pronto.",
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
    <div className="max-w-4xl mx-auto space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulário */}
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações pessoais */}
            <div className="grid grid-cols-2 gap-4">
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

            <div className="grid grid-cols-2 gap-4">
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
                placeholder="Ex: 60 minutos, 3x por semana"
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

        {/* Resultado */}
        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Seu Plano de Treino
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <RefreshCw className="h-8 w-8 text-white animate-spin" />
                </div>
                <h3 className="text-lg font-medium text-blue-700 mb-2">Gerando seu plano...</h3>
                <p className="text-blue-500">
                  Nossa IA está criando um plano personalizado para você.
                </p>
              </div>
            ) : workoutPlan ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <div className="whitespace-pre-wrap text-sm text-green-800 font-medium">
                    {workoutPlan}
                  </div>
                </div>
                <Button 
                  onClick={copyPlan}
                  variant="outline"
                  className="w-full border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Plano
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Dumbbell className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum plano encontrado</h3>
                <p className="text-gray-500 mb-6">
                  Preencha o formulário ao lado e clique em "Gerar Plano de Treino" para criar seu plano personalizado.
                </p>
                <Button 
                  onClick={() => document.querySelector('input')?.focus()}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Começar Agora
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutPlanGenerator;
