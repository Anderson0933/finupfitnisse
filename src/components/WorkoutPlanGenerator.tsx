
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Target, Clock, User as UserIcon, Zap, RefreshCw, Copy, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  const [activeTab, setActiveTab] = useState('form');
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    console.log(`Campo ${field} atualizado para:`, value);
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
        description: `Por favor, preencha: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setWorkoutPlan(''); // Limpa o plano anterior
    
    try {
      console.log('🚀 INICIANDO GERAÇÃO DO PLANO');
      console.log('📝 Dados do formulário:', formData);

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

      console.log('📤 Enviando para a API:', JSON.stringify(requestData, null, 2));

      const { data, error } = await supabase.functions.invoke('generate-workout-plan', {
        body: requestData
      });

      console.log('📥 Resposta completa da API:', { data, error });

      if (error) {
        console.error('❌ Erro da função:', error);
        throw new Error(error.message || 'Erro ao gerar plano de treino');
      }

      if (!data) {
        console.error('❌ Nenhum dado retornado');
        throw new Error('Nenhuma resposta foi retornada da API');
      }

      console.log('✅ Dados recebidos:', JSON.stringify(data, null, 2));

      // Processar e formatar o plano
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

      console.log('📋 Plano formatado final:', planText);

      if (!planText || planText.trim() === '' || planText.trim() === '{}') {
        console.error('❌ Plano de treino vazio após formatação');
        throw new Error('Plano de treino vazio foi gerado');
      }

      console.log('✅ DEFININDO PLANO NO STATE');
      setWorkoutPlan(planText);
      
      // Forçar mudança para a aba do plano
      setActiveTab('plan');
      
      console.log('✅ Plano definido e aba alterada para "plan"');
      
      toast({
        title: "Plano gerado com sucesso!",
        description: "Seu plano de treino personalizado está pronto.",
      });

    } catch (error: any) {
      console.error('💥 Erro ao gerar plano:', error);
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

  console.log('🔍 Estado atual:', { workoutPlan: workoutPlan.length, activeTab });

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  <Label className="text-blue-700 font-medium">Idade *</Label>
                  <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                      <SelectValue placeholder="Selecione sua idade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="18">18 anos</SelectItem>
                      <SelectItem value="20">20 anos</SelectItem>
                      <SelectItem value="25">25 anos</SelectItem>
                      <SelectItem value="30">30 anos</SelectItem>
                      <SelectItem value="35">35 anos</SelectItem>
                      <SelectItem value="40">40 anos</SelectItem>
                      <SelectItem value="45">45 anos</SelectItem>
                      <SelectItem value="50">50 anos</SelectItem>
                      <SelectItem value="55">55 anos</SelectItem>
                      <SelectItem value="60">60 anos</SelectItem>
                    </SelectContent>
                  </Select>
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
                  <Label className="text-blue-700 font-medium">Altura *</Label>
                  <Select value={formData.height} onValueChange={(value) => handleInputChange('height', value)}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                      <SelectValue placeholder="Selecione sua altura" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="150">1,50m</SelectItem>
                      <SelectItem value="155">1,55m</SelectItem>
                      <SelectItem value="160">1,60m</SelectItem>
                      <SelectItem value="165">1,65m</SelectItem>
                      <SelectItem value="170">1,70m</SelectItem>
                      <SelectItem value="175">1,75m</SelectItem>
                      <SelectItem value="180">1,80m</SelectItem>
                      <SelectItem value="185">1,85m</SelectItem>
                      <SelectItem value="190">1,90m</SelectItem>
                      <SelectItem value="195">1,95m</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-blue-700 font-medium">Peso *</Label>
                  <Select value={formData.weight} onValueChange={(value) => handleInputChange('weight', value)}>
                    <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                      <SelectValue placeholder="Selecione seu peso" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50kg</SelectItem>
                      <SelectItem value="55">55kg</SelectItem>
                      <SelectItem value="60">60kg</SelectItem>
                      <SelectItem value="65">65kg</SelectItem>
                      <SelectItem value="70">70kg</SelectItem>
                      <SelectItem value="75">75kg</SelectItem>
                      <SelectItem value="80">80kg</SelectItem>
                      <SelectItem value="85">85kg</SelectItem>
                      <SelectItem value="90">90kg</SelectItem>
                      <SelectItem value="95">95kg</SelectItem>
                      <SelectItem value="100">100kg</SelectItem>
                      <SelectItem value="110">110kg</SelectItem>
                      <SelectItem value="120">120kg</SelectItem>
                    </SelectContent>
                  </Select>
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
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivo Principal *
                </Label>
                <Select value={formData.goals} onValueChange={(value) => handleInputChange('goals', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                    <SelectValue placeholder="Selecione seu objetivo principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perder_peso">🔥 Perder peso</SelectItem>
                    <SelectItem value="ganhar_massa">💪 Ganhar massa muscular</SelectItem>
                    <SelectItem value="tonificar">⚡ Tonificar o corpo</SelectItem>
                    <SelectItem value="condicionamento">🏃 Melhorar condicionamento</SelectItem>
                    <SelectItem value="forca">🏋️ Aumentar força</SelectItem>
                    <SelectItem value="flexibilidade">🤸 Melhorar flexibilidade</SelectItem>
                    <SelectItem value="geral">🎯 Fitness geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Tempo Disponível por Treino
                </Label>
                <Select value={formData.availableTime} onValueChange={(value) => handleInputChange('availableTime', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                    <SelectValue placeholder="Selecione o tempo disponível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">⏰ 30 minutos</SelectItem>
                    <SelectItem value="45">⏰ 45 minutos</SelectItem>
                    <SelectItem value="60">⏰ 60 minutos</SelectItem>
                    <SelectItem value="90">⏰ 90 minutos</SelectItem>
                    <SelectItem value="120">⏰ 2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Equipamentos Disponíveis</Label>
                <Select value={formData.equipment} onValueChange={(value) => handleInputChange('equipment', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                    <SelectValue placeholder="Selecione os equipamentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia_completa">🏢 Academia completa</SelectItem>
                    <SelectItem value="casa_halteres">🏠 Casa com halteres</SelectItem>
                    <SelectItem value="casa_basico">🏠 Casa equipamentos básicos</SelectItem>
                    <SelectItem value="peso_corporal">🤸 Apenas peso corporal</SelectItem>
                    <SelectItem value="parque">🌳 Parque/ar livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Limitações Físicas</Label>
                <Select value={formData.limitations} onValueChange={(value) => handleInputChange('limitations', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2">
                    <SelectValue placeholder="Selecione se possui limitações" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">✅ Nenhuma limitação</SelectItem>
                    <SelectItem value="joelho">🦵 Problemas no joelho</SelectItem>
                    <SelectItem value="costas">🔙 Problemas nas costas</SelectItem>
                    <SelectItem value="ombro">💪 Problemas no ombro</SelectItem>
                    <SelectItem value="tornozelo">🦶 Problemas no tornozelo</SelectItem>
                    <SelectItem value="cardiaco">❤️ Problemas cardíacos</SelectItem>
                    <SelectItem value="outros">⚠️ Outras limitações</SelectItem>
                  </SelectContent>
                </Select>
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
                      onClick={() => setActiveTab('form')}
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
                    onClick={() => setActiveTab('form')}
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
