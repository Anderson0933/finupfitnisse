
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Calendar, User as UserIcon, Trash2, RefreshCw, AlertTriangle, Camera, Target, Activity, Heart, Trophy, Medal, Award, Zap, CheckCircle, ArrowUp, ArrowDown, Minus, Settings, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, BarChart, Bar } from 'recharts';
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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  waist_circumference?: number;
  chest_circumference?: number;
  arm_circumference?: number;
  thigh_circumference?: number;
  energy_level?: number;
  sleep_quality?: number;
  stress_level?: number;
  workout_intensity?: number;
  notes?: string;
}

interface Goal {
  metric: string;
  target: number;
  current: number;
  deadline: string;
}

interface ProgressTrackerProps {
  user: User | null;
}

const ProgressTracker = ({ user }: ProgressTrackerProps) => {
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [loading, setLoading] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(['peso']);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [viewMode, setViewMode] = useState<'chart' | 'insights' | 'compare'>('chart');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    waist_circumference: '',
    chest_circumference: '',
    arm_circumference: '',
    thigh_circumference: '',
    energy_level: '',
    sleep_quality: '',
    stress_level: '',
    workout_intensity: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchProgressData();
      loadGoals();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;
    console.log('📊 Buscando dados de progresso...');
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar progresso:', error);
      toast({ title: "Erro ao carregar dados", description: error.message, variant: "destructive" });
      return;
    }
    console.log(`✅ ${data?.length || 0} registros de progresso encontrados.`);
    setProgressData(data || []);
  };

  const loadGoals = () => {
    const savedGoals = localStorage.getItem(`progress_goals_${user?.id}`);
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  };

  const saveGoals = (newGoals: Goal[]) => {
    localStorage.setItem(`progress_goals_${user?.id}`, JSON.stringify(newGoals));
    setGoals(newGoals);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.date || !formData.weight) {
      toast({ title: "Campos obrigatórios", description: "Data e Peso são obrigatórios.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      console.log('💾 Salvando novo registro de progresso...');
      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: user.id,
          date: formData.date,
          weight: parseFloat(formData.weight) || 0,
          body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) || null : null,
          muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) || null : null,
          waist_circumference: formData.waist_circumference ? parseFloat(formData.waist_circumference) || null : null,
          chest_circumference: formData.chest_circumference ? parseFloat(formData.chest_circumference) || null : null,
          arm_circumference: formData.arm_circumference ? parseFloat(formData.arm_circumference) || null : null,
          thigh_circumference: formData.thigh_circumference ? parseFloat(formData.thigh_circumference) || null : null,
          energy_level: formData.energy_level ? parseInt(formData.energy_level) || null : null,
          sleep_quality: formData.sleep_quality ? parseInt(formData.sleep_quality) || null : null,
          stress_level: formData.stress_level ? parseInt(formData.stress_level) || null : null,
          workout_intensity: formData.workout_intensity ? parseInt(formData.workout_intensity) || null : null,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      console.log('✅ Progresso salvo com sucesso.');
      toast({ title: "Progresso registrado!", description: "Seus dados foram salvos com sucesso." });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        waist_circumference: '',
        chest_circumference: '',
        arm_circumference: '',
        thigh_circumference: '',
        energy_level: '',
        sleep_quality: '',
        stress_level: '',
        workout_intensity: '',
        notes: ''
      });
      setShowForm(false);
      fetchProgressData();
    } catch (error: any) {
      console.error('❌ Erro ao salvar progresso:', error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const clearProgressData = async () => {
    if (!user) return;

    setClearing(true);
    console.log('🗑️ Tentando limpar todos os dados de progresso...');
    try {
      const { error } = await supabase
        .from('user_progress')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao limpar progresso:', error);
        throw new Error('Falha ao limpar os dados de progresso.');
      }

      console.log('✅ Dados de progresso limpos com sucesso do DB!');
      setProgressData([]);
      toast({
        title: "Evolução Limpa",
        description: "Todos os seus registros de progresso foram removidos.",
      });

    } catch (error: any) {
      console.error('💥 Erro na função clearProgressData:', error);
      toast({
        title: "Erro ao Limpar",
        description: error.message || "Não foi possível limpar seus dados.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const chartData = progressData.map(entry => ({
    date: new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR'),
    peso: entry.weight ?? null,
    gordura: entry.body_fat_percentage ?? null,
    musculo: entry.muscle_mass ?? null,
    cintura: entry.waist_circumference ?? null,
    peito: entry.chest_circumference ?? null,
    braço: entry.arm_circumference ?? null,
    coxa: entry.thigh_circumference ?? null,
    energia: entry.energy_level ?? null,
    sono: entry.sleep_quality ?? null,
    estresse: entry.stress_level ?? null,
    intensidade: entry.workout_intensity ?? null
  }));

  const metricOptions = [
    { value: 'peso', label: 'Peso (kg)', color: '#3B82F6', unit: 'kg' },
    { value: 'gordura', label: '% Gordura', color: '#EF4444', unit: '%' },
    { value: 'musculo', label: 'Massa Muscular (kg)', color: '#10B981', unit: 'kg' },
    { value: 'cintura', label: 'Cintura (cm)', color: '#F59E0B', unit: 'cm' },
    { value: 'peito', label: 'Peito (cm)', color: '#8B5CF6', unit: 'cm' },
    { value: 'braço', label: 'Braço (cm)', color: '#06B6D4', unit: 'cm' },
    { value: 'coxa', label: 'Coxa (cm)', color: '#EC4899', unit: 'cm' },
    { value: 'energia', label: 'Nível de Energia', color: '#F97316', unit: '/10' },
    { value: 'sono', label: 'Qualidade do Sono', color: '#6366F1', unit: '/10' },
    { value: 'estresse', label: 'Nível de Estresse', color: '#DC2626', unit: '/10' },
    { value: 'intensidade', label: 'Intensidade do Treino', color: '#059669', unit: '/10' }
  ];

  const toggleMetric = (metric: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  const calculateTrend = (metric: string) => {
    const data = chartData.filter(d => d[metric as keyof typeof d] !== null);
    if (data.length < 2) return { trend: 'stable', change: 0 };
    
    const recent = data.slice(-3);
    const previous = data.slice(-6, -3);
    
    if (recent.length === 0 || previous.length === 0) return { trend: 'stable', change: 0 };
    
    const recentAvg = recent.reduce((sum, d) => sum + (d[metric as keyof typeof d] as number || 0), 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + (d[metric as keyof typeof d] as number || 0), 0) / previous.length;
    
    const change = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    if (Math.abs(change) < 2) return { trend: 'stable', change: 0 };
    return { trend: change > 0 ? 'up' : 'down', change: Math.abs(change) };
  };

  const getAchievements = () => {
    const achievements = [];
    
    if (progressData.length >= 7) achievements.push({ icon: Trophy, name: "Consistência", description: "7+ registros" });
    if (progressData.length >= 30) achievements.push({ icon: Medal, name: "Dedicação", description: "30+ registros" });
    if (progressData.length >= 90) achievements.push({ icon: Award, name: "Mestre", description: "90+ registros" });
    
    // Verificar metas atingidas
    goals.forEach(goal => {
      if (goal.current >= goal.target) {
        achievements.push({ icon: CheckCircle, name: "Meta Atingida", description: goal.metric });
      }
    });
    
    return achievements;
  };

  const getInsights = () => {
    const insights = [];
    
    selectedMetrics.forEach(metric => {
      const trend = calculateTrend(metric);
      const metricConfig = metricOptions.find(m => m.value === metric);
      
      if (trend.trend !== 'stable') {
        insights.push({
          metric: metricConfig?.label || metric,
          trend: trend.trend,
          change: trend.change,
          suggestion: getTrendSuggestion(metric, trend.trend)
        });
      }
    });
    
    return insights;
  };

  const getTrendSuggestion = (metric: string, trend: string) => {
    const suggestions: { [key: string]: { up: string; down: string } } = {
      peso: {
        up: "Considere ajustar sua dieta se o ganho de peso não for intencional.",
        down: "Ótimo progresso na perda de peso! Mantenha a consistência."
      },
      gordura: {
        up: "Considere aumentar exercícios cardiovasculares e revisar a dieta.",
        down: "Excelente redução de gordura corporal! Continue assim."
      },
      musculo: {
        up: "Ótimo ganho de massa muscular! Seu treino está funcionando.",
        down: "Considere aumentar a ingestão de proteínas e intensidade do treino."
      },
      energia: {
        up: "Níveis de energia melhorando! Ótimo sinal de saúde geral.",
        down: "Considere melhorar a qualidade do sono e revisar a nutrição."
      }
    };
    
    return suggestions[metric]?.[trend] || "Continue monitorando esta métrica.";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-800 flex items-center gap-3">
            <BarChart3 className="h-8 w-8" />
            Acompanhamento de Evolução
          </h2>
          <p className="text-blue-600 mt-2 text-lg">Registre, analise e conquiste seus objetivos com precisão</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Progresso
          </Button>
          <Button 
            onClick={() => setShowGoals(true)} 
            variant="outline"
            size="sm"
            className="border-green-300 text-green-700 hover:bg-green-50"
          >
            <Target className="h-4 w-4 mr-2" />
            Metas
          </Button>
          {progressData.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800"
                  disabled={clearing}
                >
                  {clearing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Limpar Dados
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Confirmar Limpeza
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja limpar **todos** os seus registros de evolução? Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={clearing}>Cancelar</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={clearProgressData}
                    disabled={clearing}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {clearing ? 'Limpando...' : 'Confirmar Limpeza'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Achievements Section */}
      {progressData.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="h-6 w-6 text-yellow-600" />
              <h3 className="text-xl font-bold text-yellow-800">Suas Conquistas</h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {getAchievements().map((achievement, index) => (
                <Badge key={index} className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200 p-2 text-sm flex items-center gap-2">
                  <achievement.icon className="h-4 w-4" />
                  <span className="font-medium">{achievement.name}</span>
                  <span className="text-xs opacity-75">{achievement.description}</span>
                </Badge>
              ))}
              {getAchievements().length === 0 && (
                <p className="text-yellow-700">Continue registrando para desbloquear conquistas!</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goals Management Modal */}
      {showGoals && (
        <Card className="bg-white border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Gerenciar Metas
            </CardTitle>
            <CardDescription>
              Defina e acompanhe suas metas de evolução
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={index} className="p-4 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-green-800">{goal.metric}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => saveGoals(goals.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso: {goal.current}</span>
                      <span>Meta: {goal.target}</span>
                    </div>
                    <Progress value={(goal.current / goal.target) * 100} className="h-2" />
                    <div className="text-xs text-gray-600">
                      Prazo: {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={() => setShowGoals(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                Concluído
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Form */}
      {showForm && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Registrar Novo Progresso Detalhado
            </CardTitle>
            <CardDescription>
              Preencha as medidas e avaliações que desejar. Apenas data e peso são obrigatórios.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-blue-800 font-medium">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="border-blue-200 focus:border-blue-400 mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-blue-800 font-medium">Peso (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="border-blue-200 focus:border-blue-400 mt-1"
                    placeholder="Ex: 70.5"
                    required
                  />
                </div>
              </div>

              {/* Body Composition */}
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Composição Corporal
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="body_fat" className="text-blue-800">% Gordura Corporal</Label>
                    <Input
                      id="body_fat"
                      type="number"
                      step="0.1"
                      value={formData.body_fat_percentage}
                      onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 15.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="muscle_mass" className="text-blue-800">Massa Muscular (kg)</Label>
                    <Input
                      id="muscle_mass"
                      type="number"
                      step="0.1"
                      value={formData.muscle_mass}
                      onChange={(e) => setFormData({...formData, muscle_mass: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 45.8"
                    />
                  </div>
                </div>
              </div>

              {/* Circumferences */}
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Circunferências (cm)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="waist" className="text-blue-800">Cintura</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={formData.waist_circumference}
                      onChange={(e) => setFormData({...formData, waist_circumference: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 85.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chest" className="text-blue-800">Peito</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={formData.chest_circumference}
                      onChange={(e) => setFormData({...formData, chest_circumference: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 95.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="arm" className="text-blue-800">Braço</Label>
                    <Input
                      id="arm"
                      type="number"
                      step="0.1"
                      value={formData.arm_circumference}
                      onChange={(e) => setFormData({...formData, arm_circumference: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 32.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="thigh" className="text-blue-800">Coxa</Label>
                    <Input
                      id="thigh"
                      type="number"
                      step="0.1"
                      value={formData.thigh_circumference}
                      onChange={(e) => setFormData({...formData, thigh_circumference: e.target.value})}
                      className="border-blue-200 focus:border-blue-400 mt-1"
                      placeholder="Ex: 55.2"
                    />
                  </div>
                </div>
              </div>

              {/* Wellbeing Metrics */}
              <div>
                <h4 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Bem-estar e Performance (1-10)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="energy" className="text-blue-800">Nível de Energia</Label>
                    <Select value={formData.energy_level} onValueChange={(value) => setFormData({...formData, energy_level: value})}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-1">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={String(num)}>{num} - {num <= 3 ? 'Baixo' : num <= 6 ? 'Médio' : 'Alto'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sleep" className="text-blue-800">Qualidade do Sono</Label>
                    <Select value={formData.sleep_quality} onValueChange={(value) => setFormData({...formData, sleep_quality: value})}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-1">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={String(num)}>{num} - {num <= 3 ? 'Ruim' : num <= 6 ? 'Regular' : 'Ótimo'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stress" className="text-blue-800">Nível de Estresse</Label>
                    <Select value={formData.stress_level} onValueChange={(value) => setFormData({...formData, stress_level: value})}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-1">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={String(num)}>{num} - {num <= 3 ? 'Baixo' : num <= 6 ? 'Médio' : 'Alto'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="intensity" className="text-blue-800">Intensidade do Treino</Label>
                    <Select value={formData.workout_intensity} onValueChange={(value) => setFormData({...formData, workout_intensity: value})}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-1">
                        <SelectValue placeholder="1-10" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1,2,3,4,5,6,7,8,9,10].map(num => (
                          <SelectItem key={num} value={String(num)}>{num} - {num <= 3 ? 'Leve' : num <= 6 ? 'Moderado' : 'Intenso'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-blue-800 font-medium">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border-blue-200 focus:border-blue-400 mt-1"
                  placeholder="Como se sentiu? Alguma conquista? Dificuldades? (Opcional)"
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Salvando...</> : 'Salvar Progresso'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Analysis Section */}
      {progressData.length > 0 && (
        <div className="space-y-6">
          {/* View Mode Selector */}
          <div className="flex gap-2 justify-center">
            <Button
              variant={viewMode === 'chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('chart')}
              size="sm"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Gráficos
            </Button>
            <Button
              variant={viewMode === 'insights' ? 'default' : 'outline'}
              onClick={() => setViewMode('insights')}
              size="sm"
            >
              <Zap className="h-4 w-4 mr-2" />
              Insights
            </Button>
            <Button
              variant={viewMode === 'compare' ? 'default' : 'outline'}
              onClick={() => setViewMode('compare')}
              size="sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Comparar
            </Button>
          </div>

          {/* Chart View */}
          {viewMode === 'chart' && (
            <Card className="bg-white border-blue-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Gráfico de Evolução Interativo
                </CardTitle>
                <CardDescription>
                  Selecione as métricas que deseja visualizar no gráfico
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Metric Selection */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {metricOptions.map(metric => (
                      <Button
                        key={metric.value}
                        variant={selectedMetrics.includes(metric.value) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleMetric(metric.value)}
                        className={`text-xs ${selectedMetrics.includes(metric.value) ? 'text-white' : ''}`}
                        style={{
                          backgroundColor: selectedMetrics.includes(metric.value) ? metric.color : undefined,
                          borderColor: metric.color
                        }}
                      >
                        {metric.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartData.length > 1 ? (
                      <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                          {selectedMetrics.map(metric => {
                            const metricConfig = metricOptions.find(m => m.value === metric);
                            return (
                              <linearGradient key={metric} id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={metricConfig?.color} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={metricConfig?.color} stopOpacity={0.1}/>
                              </linearGradient>
                            );
                          })}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#1e40af" 
                          fontSize={12} 
                          tick={{ fill: '#1e40af' }}
                        />
                        <YAxis 
                          stroke="#1e40af" 
                          fontSize={12} 
                          domain={['auto', 'auto']}
                          tick={{ fill: '#1e40af' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #93c5fd',
                            borderRadius: '12px',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                            backdropFilter: 'blur(8px)'
                          }}
                          itemStyle={{ color: '#1e40af', fontWeight: '500' }}
                          labelStyle={{ color: '#1d4ed8', fontWeight: 'bold', marginBottom: '8px' }}
                        />
                        {selectedMetrics.map(metric => {
                          const metricConfig = metricOptions.find(m => m.value === metric);
                          if (!metricConfig || !chartData.some(d => d[metric as keyof typeof d] !== null)) return null;
                          
                          return (
                            <Area
                              key={metric}
                              type="monotone"
                              dataKey={metric}
                              stroke={metricConfig.color}
                              strokeWidth={3}
                              fill={`url(#gradient-${metric})`}
                              name={`${metricConfig.label} ${metricConfig.unit}`}
                              connectNulls
                              dot={{ fill: metricConfig.color, strokeWidth: 2, r: 4 }}
                              activeDot={{ r: 6, stroke: metricConfig.color, strokeWidth: 2, fill: '#fff' }}
                            />
                          );
                        })}
                      </AreaChart>
                    ) : (
                      <div className="flex items-center justify-center h-full text-blue-600 text-center">
                        <div>
                          <Activity className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                          <p className="text-lg font-medium">Registre pelo menos dois pontos para visualizar o gráfico</p>
                          <p className="text-sm text-blue-500 mt-2">Seus dados aparecerão aqui conforme você registra seu progresso</p>
                        </div>
                      </div>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights View */}
          {viewMode === 'insights' && (
            <Card className="bg-white border-purple-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Análises e Insights Inteligentes
                </CardTitle>
                <CardDescription>
                  Tendências automáticas e sugestões personalizadas baseadas nos seus dados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {getInsights().map((insight, index) => (
                    <div key={index} className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2">
                          {insight.trend === 'up' ? (
                            <ArrowUp className="h-5 w-5 text-green-600" />
                          ) : (
                            <ArrowDown className="h-5 w-5 text-red-600" />
                          )}
                          <span className="font-medium text-purple-800">{insight.metric}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {insight.change.toFixed(1)}% {insight.trend === 'up' ? 'aumento' : 'redução'}
                        </Badge>
                      </div>
                      <p className="text-sm text-purple-700">{insight.suggestion}</p>
                    </div>
                  ))}
                  {getInsights().length === 0 && (
                    <div className="text-center py-8 text-purple-600">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-purple-400" />
                      <p className="text-lg font-medium">Registre mais dados para receber insights personalizados</p>
                      <p className="text-sm mt-2">Nosso algoritmo analisará suas tendências automaticamente</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Compare View */}
          {viewMode === 'compare' && (
            <Card className="bg-white border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Comparação de Períodos
                </CardTitle>
                <CardDescription>
                  Compare sua evolução entre diferentes períodos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-orange-600">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-orange-400" />
                  <p className="text-lg font-medium">Funcionalidade em desenvolvimento</p>
                  <p className="text-sm mt-2">Em breve você poderá comparar seus resultados entre semanas e meses</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enhanced Recent entries list */}
      {progressData.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Últimos Registros
          </h3>
          <div className="grid gap-4">
            {progressData.slice(-5).reverse().map((entry) => (
              <Card key={entry.id} className="bg-gradient-to-r from-blue-50 to-white border-blue-100 shadow-sm hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3 text-blue-800 font-medium">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-blue-600">
                          {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium">PESO</div>
                      <div className="text-lg font-bold text-blue-800">{entry.weight} kg</div>
                    </div>
                    {entry.body_fat_percentage && (
                      <div className="bg-white p-3 rounded-lg border border-red-100">
                        <div className="text-xs text-red-600 font-medium">% GORDURA</div>
                        <div className="text-lg font-bold text-red-800">{entry.body_fat_percentage}%</div>
                      </div>
                    )}
                    {entry.muscle_mass && (
                      <div className="bg-white p-3 rounded-lg border border-green-100">
                        <div className="text-xs text-green-600 font-medium">MÚSCULO</div>
                        <div className="text-lg font-bold text-green-800">{entry.muscle_mass} kg</div>
                      </div>
                    )}
                    {entry.waist_circumference && (
                      <div className="bg-white p-3 rounded-lg border border-orange-100">
                        <div className="text-xs text-orange-600 font-medium">CINTURA</div>
                        <div className="text-lg font-bold text-orange-800">{entry.waist_circumference} cm</div>
                      </div>
                    )}
                    {entry.energy_level && (
                      <div className="bg-white p-3 rounded-lg border border-purple-100">
                        <div className="text-xs text-purple-600 font-medium">ENERGIA</div>
                        <div className="text-lg font-bold text-purple-800">{entry.energy_level}/10</div>
                      </div>
                    )}
                    {entry.sleep_quality && (
                      <div className="bg-white p-3 rounded-lg border border-indigo-100">
                        <div className="text-xs text-indigo-600 font-medium">SONO</div>
                        <div className="text-lg font-bold text-indigo-800">{entry.sleep_quality}/10</div>
                      </div>
                    )}
                  </div>

                  {entry.notes && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                      <div className="text-xs text-blue-600 font-medium mb-1">OBSERVAÇÕES</div>
                      <p className="text-blue-800 text-sm leading-relaxed">{entry.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Empty state */}
      {progressData.length === 0 && !showForm && (
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-800 mb-3">Nenhum registro encontrado</h3>
            <p className="text-blue-600 mb-6 text-lg">Comece a registrar seu progresso detalhado para acompanhar sua evolução com precisão.</p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Fazer Primeiro Registro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;
