import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Plus, Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

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
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    height: '',
    weight: '',
    fitness_level: '',
    fitness_goals: [] as string[],
    health_conditions: [] as string[],
    available_days: 3,
    session_duration: 60,
    preferred_exercises: [] as string[]
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

  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      fitness_goals: checked 
        ? [...prev.fitness_goals, goal]
        : prev.fitness_goals.filter(g => g !== goal)
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
        title: "Plano gerado com sucesso!",
        description: "Seu plano de treino personalizado foi criado.",
      });

      setShowForm(false);
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

  const deletePlan = async (planId: string) => {
    const { error } = await supabase
      .from('workout_plans')
      .delete()
      .eq('id', planId);

    if (error) {
      toast({
        title: "Erro ao excluir plano",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Plano excluído",
      description: "O plano de treino foi removido.",
    });

    fetchWorkoutPlans();
  };

  const togglePlanExpansion = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  if (showForm) {
    return (
      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Criar Novo Plano de Treino
          </CardTitle>
          <CardDescription className="text-blue-200">
            Responda as perguntas para gerar um plano personalizado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Idade</Label>
              <Input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Sexo</Label>
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
              <Label className="text-white">Altura (cm)</Label>
              <Input
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
            <div>
              <Label className="text-white">Peso (kg)</Label>
              <Input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
                className="bg-white/10 border-white/20 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-white">Nível de Condicionamento</Label>
            <Select value={formData.fitness_level} onValueChange={(value) => setFormData({...formData, fitness_level: value})}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Selecione seu nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentario">Sedentário</SelectItem>
                <SelectItem value="pouco_ativo">Pouco Ativo</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="muito_ativo">Muito Ativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-3 block">Objetivos (selecione todos que se aplicam)</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                'Perder peso',
                'Ganhar massa muscular',
                'Melhorar condicionamento',
                'Aumentar força',
                'Melhorar flexibilidade',
                'Reduzir estresse'
              ].map((goal) => (
                <div key={goal} className="flex items-center space-x-2">
                  <Checkbox 
                    id={goal}
                    checked={formData.fitness_goals.includes(goal)}
                    onCheckedChange={(checked) => handleGoalChange(goal, checked as boolean)}
                  />
                  <Label htmlFor={goal} className="text-white text-sm">{goal}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <Button 
              onClick={generateWorkoutPlan} 
              className="flex-1 glow-button"
              disabled={generating}
            >
              {generating ? 'Gerando plano...' : 'Gerar Plano Personalizado'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowForm(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Seus Planos de Treino</h2>
        <Button onClick={() => setShowForm(true)} className="glow-button">
          <Plus className="h-4 w-4 mr-2" />
          Novo Plano
        </Button>
      </div>

      {workoutPlans.length === 0 ? (
        <Card className="glass border-white/20">
          <CardContent className="p-8 text-center">
            <Dumbbell className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Nenhum plano encontrado</h3>
            <p className="text-blue-200 mb-4">Crie seu primeiro plano de treino personalizado</p>
            <Button onClick={() => setShowForm(true)} className="glow-button">
              Começar Agora
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {workoutPlans.map((plan) => (
            <Card key={plan.id} className="glass border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-white">{plan.title}</CardTitle>
                    <CardDescription className="text-blue-200 mt-1">
                      {plan.description}
                    </CardDescription>
                    <div className="flex gap-4 text-sm text-blue-200 mt-2">
                      <span>Nível: {plan.difficulty_level}</span>
                      <span>Duração: {plan.duration_weeks} semanas</span>
                      <span>Exercícios: {plan.exercises?.length || 0}</span>
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
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
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
