import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Plus, Edit, Trash2, ChevronDown, ChevronUp, Target, Clock, MapPin, Activity } from 'lucide-react';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  duration_weeks: number;
  exercises: Exercise[];
  nutrition_tips?: string[];
  created_at: string;
}

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  instructions: string;
}

interface WorkoutPlanGeneratorProps {
  user: User | null;
}

const WorkoutPlanGenerator = ({ user }: WorkoutPlanGeneratorProps) => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    // Dados básicos
    age: '',
    gender: '',
    height: '',
    weight: '',
    
    // Experiência e condicionamento
    fitness_level: '',
    exercise_experience: '',
    current_activity_level: '',
    
    // Objetivos específicos
    primary_goal: '',
    secondary_goals: [] as string[],
    target_body_parts: [] as string[],
    
    // Disponibilidade e preferências
    available_days: 3,
    session_duration: 60,
    preferred_time: '',
    gym_access: '',
    
    // Limitações e preferências
    health_conditions: [] as string[],
    injuries: '',
    exercise_dislikes: [] as string[],
    equipment_available: [] as string[],
    
    // Motivação e estilo
    motivation_level: '',
    preferred_intensity: '',
    music_preference: '',
    workout_buddy: ''
  });

  useEffect(() => {
    if (user) {
      fetchWorkoutPlans();
    }
  }, [user]);

  const fetchWorkoutPlans = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_plans')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar planos",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data) {
      const formattedPlans = data.map(plan => ({
        ...plan,
        exercises: Array.isArray(plan.exercises) ? plan.exercises as unknown as Exercise[] : [],
        nutrition_tips: Array.isArray(plan.nutrition_tips) ? plan.nutrition_tips as unknown as string[] : []
      }));
      setWorkoutPlans(formattedPlans);
    }
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const deletePlan = async (planId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Erro ao deletar plano",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plano deletado",
      description: "O plano de treino foi removido com sucesso.",
    });

    fetchWorkoutPlans();
  };

  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      secondary_goals: checked 
        ? [...prev.secondary_goals, goal]
        : prev.secondary_goals.filter(g => g !== goal)
    }));
  };

  const handleBodyPartChange = (part: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      target_body_parts: checked 
        ? [...prev.target_body_parts, part]
        : prev.target_body_parts.filter(p => p !== part)
    }));
  };

  const generateWorkoutPlan = async () => {
    if (!user) return;

    setGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-workout-plan', {
        body: { userProfile: formData }
      });

      if (response.error) throw response.error;

      const newPlan = response.data;
      
      // Salvar o plano no banco
      const { error } = await supabase
        .from('workout_plans')
        .insert([{
          user_id: user.id,
          title: newPlan.title,
          description: newPlan.description,
          difficulty_level: newPlan.difficulty_level,
          duration_weeks: newPlan.duration_weeks,
          exercises: newPlan.exercises as unknown as any,
          nutrition_tips: newPlan.nutrition_tips as unknown as any
        }]);

      if (error) throw error;

      toast({
        title: "🎉 Plano gerado com sucesso!",
        description: "Seu plano de treino personalizado foi criado com base em suas respostas.",
      });

      setShowForm(false);
      setCurrentStep(1);
      fetchWorkoutPlans();
    } catch (error: any) {
      toast({
        title: "Erro ao gerar plano",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Target className="h-6 w-6" />
              Criar Plano de Treino Personalizado
            </CardTitle>
            <CardDescription className="text-blue-200">
              Responda algumas perguntas para criarmos o plano perfeito para você
            </CardDescription>
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    step <= currentStep ? 'bg-purple-500' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-blue-200">Etapa {currentStep} de 4</p>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* Etapa 1: Informações Básicas */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  📋 Informações Básicas
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Idade *</Label>
                    <Input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: 25"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Sexo *</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Altura (cm) *</Label>
                    <Input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({...formData, height: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: 175"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Peso (kg) *</Label>
                    <Input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({...formData, weight: e.target.value})}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Ex: 70"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Nível de Condicionamento Atual *</Label>
                  <RadioGroup value={formData.fitness_level} onValueChange={(value) => setFormData({...formData, fitness_level: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sedentario" id="sedentario" />
                      <Label htmlFor="sedentario" className="text-white">🛋️ Sedentário - Não pratico exercícios</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="iniciante" id="iniciante" />
                      <Label htmlFor="iniciante" className="text-white">🌱 Iniciante - Menos de 6 meses de treino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intermediario" id="intermediario" />
                      <Label htmlFor="intermediario" className="text-white">💪 Intermediário - 6 meses a 2 anos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="avancado" id="avancado" />
                      <Label htmlFor="avancado" className="text-white">🏆 Avançado - Mais de 2 anos</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  🎯 Objetivos e Foco
                </h3>

                <div>
                  <Label className="text-white">Objetivo Principal *</Label>
                  <Select value={formData.primary_goal} onValueChange={(value) => setFormData({...formData, primary_goal: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Escolha seu objetivo principal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="perder_peso">🔥 Perder peso e gordura</SelectItem>
                      <SelectItem value="ganhar_massa">💪 Ganhar massa muscular</SelectItem>
                      <SelectItem value="tonificar">✨ Tonificar e definir</SelectItem>
                      <SelectItem value="condicionamento">❤️ Melhorar condicionamento cardiovascular</SelectItem>
                      <SelectItem value="forca">🏋️ Aumentar força</SelectItem>
                      <SelectItem value="flexibilidade">🤸 Melhorar flexibilidade</SelectItem>
                      <SelectItem value="saude_geral">🌟 Saúde geral e bem-estar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Objetivos Secundários (selecione todos que se aplicam)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      'Reduzir estresse',
                      'Melhorar postura',
                      'Aumentar energia',
                      'Melhorar sono',
                      'Fortalecer core',
                      'Melhorar equilíbrio'
                    ].map((goal) => (
                      <div key={goal} className="flex items-center space-x-2">
                        <Checkbox 
                          id={goal}
                          checked={formData.secondary_goals.includes(goal)}
                          onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                        />
                        <Label htmlFor={goal} className="text-white text-sm">{goal}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-white mb-3 block">Áreas do Corpo para Focar</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {[
                      'Braços',
                      'Peito',
                      'Costas',
                      'Ombros',
                      'Abdômen',
                      'Glúteos',
                      'Pernas',
                      'Panturrilha',
                      'Corpo todo'
                    ].map((part) => (
                      <div key={part} className="flex items-center space-x-2">
                        <Checkbox 
                          id={part}
                          checked={formData.target_body_parts.includes(part)}
                          onCheckedChange={(checked) => handleBodyPartChange(part, checked as boolean)}
                        />
                        <Label htmlFor={part} className="text-white text-sm">{part}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  ⏰ Disponibilidade e Local
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Quantos dias por semana você pode treinar? *</Label>
                    <Select value={formData.available_days.toString()} onValueChange={(value) => setFormData({...formData, available_days: parseInt(value)})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 dias</SelectItem>
                        <SelectItem value="3">3 dias</SelectItem>
                        <SelectItem value="4">4 dias</SelectItem>
                        <SelectItem value="5">5 dias</SelectItem>
                        <SelectItem value="6">6 dias</SelectItem>
                        <SelectItem value="7">7 dias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white">Duração de cada treino (minutos) *</Label>
                    <Select value={formData.session_duration.toString()} onValueChange={(value) => setFormData({...formData, session_duration: parseInt(value)})}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                        <SelectItem value="120">120 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Onde você pretende treinar? *</Label>
                  <RadioGroup value={formData.gym_access} onValueChange={(value) => setFormData({...formData, gym_access: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="academia_completa" id="academia_completa" />
                      <Label htmlFor="academia_completa" className="text-white">🏋️ Academia completa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="academia_basica" id="academia_basica" />
                      <Label htmlFor="academia_basica" className="text-white">🏪 Academia básica</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casa_equipamentos" id="casa_equipamentos" />
                      <Label htmlFor="casa_equipamentos" className="text-white">🏠 Em casa com equipamentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="casa_sem_equipamentos" id="casa_sem_equipamentos" />
                      <Label htmlFor="casa_sem_equipamentos" className="text-white">🤸 Em casa sem equipamentos</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="ar_livre" id="ar_livre" />
                      <Label htmlFor="ar_livre" className="text-white">🌳 Ao ar livre</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-white">Melhor horário para treinar</Label>
                  <Select value={formData.preferred_time} onValueChange={(value) => setFormData({...formData, preferred_time: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Selecione o horário" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manha">🌅 Manhã (5h-9h)</SelectItem>
                      <SelectItem value="meio_dia">☀️ Meio-dia (9h-14h)</SelectItem>
                      <SelectItem value="tarde">🌤️ Tarde (14h-18h)</SelectItem>
                      <SelectItem value="noite">🌙 Noite (18h-22h)</SelectItem>
                      <SelectItem value="flexivel">⏰ Horário flexível</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                  ⚡ Preferências e Limitações
                </h3>

                <div>
                  <Label className="text-white">Possui alguma lesão ou limitação física?</Label>
                  <Textarea
                    value={formData.injuries}
                    onChange={(e) => setFormData({...formData, injuries: e.target.value})}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Descreva qualquer lesão, dor ou limitação que devemos considerar..."
                  />
                </div>

                <div>
                  <Label className="text-white">Intensidade preferida *</Label>
                  <RadioGroup value={formData.preferred_intensity} onValueChange={(value) => setFormData({...formData, preferred_intensity: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="leve" id="leve" />
                      <Label htmlFor="leve" className="text-white">😌 Leve - Treinos suaves</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="moderada" id="moderada" />
                      <Label htmlFor="moderada" className="text-white">💪 Moderada - Equilíbrio</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="intensa" id="intensa" />
                      <Label htmlFor="intensa" className="text-white">🔥 Intensa - Desafio máximo</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-white">Nível de motivação atual</Label>
                  <Select value={formData.motivation_level} onValueChange={(value) => setFormData({...formData, motivation_level: value})}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Como você se sente?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="muito_motivado">🚀 Muito motivado</SelectItem>
                      <SelectItem value="motivado">😊 Motivado</SelectItem>
                      <SelectItem value="neutro">😐 Neutro</SelectItem>
                      <SelectItem value="preciso_motivacao">😅 Preciso de motivação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Prefere treinar</Label>
                  <RadioGroup value={formData.workout_buddy} onValueChange={(value) => setFormData({...formData, workout_buddy: value})}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sozinho" id="sozinho" />
                      <Label htmlFor="sozinho" className="text-white">🧘 Sozinho</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="companhia" id="companhia" />
                      <Label htmlFor="companhia" className="text-white">👥 Com companhia</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tanto_faz" id="tanto_faz" />
                      <Label htmlFor="tanto_faz" className="text-white">🤷 Tanto faz</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              {currentStep > 1 && (
                <Button 
                  variant="outline" 
                  onClick={prevStep}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Voltar
                </Button>
              )}
              
              {currentStep < 4 ? (
                <Button 
                  onClick={nextStep}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  disabled={
                    (currentStep === 1 && (!formData.age || !formData.gender || !formData.height || !formData.weight || !formData.fitness_level)) ||
                    (currentStep === 2 && !formData.primary_goal) ||
                    (currentStep === 3 && (!formData.gym_access))
                  }
                >
                  Próxima Etapa
                </Button>
              ) : (
                <Button 
                  onClick={generateWorkoutPlan} 
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                  disabled={generating || !formData.preferred_intensity}
                >
                  {generating ? '🔄 Criando seu plano...' : '🎉 Gerar Meu Plano Personalizado'}
                </Button>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowForm(false);
                  setCurrentStep(1);
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Seus Planos de Treino</h2>
          <p className="text-blue-200 mt-1">Planos personalizados criados especialmente para você</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {workoutPlans.length === 0 ? (
        <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-white/20 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-3">Nenhum plano encontrado</h3>
            <p className="text-blue-200 mb-6 max-w-md mx-auto">
              Crie seu primeiro plano de treino personalizado respondendo algumas perguntas simples
            </p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Target className="h-4 w-4 mr-2" />
              Começar Agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workoutPlans.map((plan) => (
            <Card key={plan.id} className="bg-black/20 border-white/20 backdrop-blur-sm hover:bg-black/30 transition-all duration-200">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white text-xl">{plan.title}</CardTitle>
                    <CardDescription className="text-blue-200 mt-2 text-base">
                      {plan.description}
                    </CardDescription>
                    <div className="flex gap-6 text-sm text-blue-200 mt-4">
                      <span className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Nível: {plan.difficulty_level}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {plan.duration_weeks} semanas
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell className="h-4 w-4" />
                        {plan.exercises?.length || 0} exercícios
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => togglePlanExpansion(plan.id)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      {expandedPlan === plan.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => deletePlan(plan.id)}
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {expandedPlan === plan.id && (
                <CardContent className="pt-0">
                  <div className="space-y-6">
                    {/* Exercícios */}
                    {plan.exercises && plan.exercises.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">Exercícios:</h4>
                        <div className="space-y-4">
                          {plan.exercises.map((exercise, index) => (
                            <div key={index} className="bg-white/5 p-4 rounded-lg border border-white/10">
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="text-white font-medium">{exercise.name}</h5>
                                <div className="text-sm text-blue-200">
                                  {exercise.sets} séries × {exercise.reps} reps
                                </div>
                              </div>
                              <p className="text-blue-200 text-sm mb-2">{exercise.instructions}</p>
                              <p className="text-xs text-blue-300">Descanso: {exercise.rest}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dicas de Nutrição */}
                    {plan.nutrition_tips && plan.nutrition_tips.length > 0 && (
                      <div>
                        <h4 className="text-white font-semibold mb-3">Dicas de Nutrição:</h4>
                        <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                          <ul className="space-y-2">
                            {plan.nutrition_tips.map((tip, index) => (
                              <li key={index} className="text-blue-200 text-sm flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutPlanGenerator;
