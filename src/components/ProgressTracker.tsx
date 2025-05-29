
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Calendar, User as UserIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProgressEntry {
  id: string;
  date: string;
  weight: number;
  body_fat_percentage?: number;
  muscle_mass?: number;
  notes?: string;
}

interface ProgressTrackerProps {
  user: User | null;
}

const ProgressTracker = ({ user }: ProgressTrackerProps) => {
  const [progressData, setProgressData] = useState<ProgressEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    muscle_mass: '',
    notes: ''
  });

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setProgressData(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: user.id,
          date: formData.date,
          weight: parseFloat(formData.weight) || null,
          body_fat_percentage: parseFloat(formData.body_fat_percentage) || null,
          muscle_mass: parseFloat(formData.muscle_mass) || null,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      toast({
        title: "Progresso registrado!",
        description: "Seus dados foram salvos com sucesso.",
      });

      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        notes: ''
      });

      setShowForm(false);
      fetchProgressData();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const chartData = progressData.map(entry => ({
    date: new Date(entry.date).toLocaleDateString('pt-BR'),
    peso: entry.weight,
    gordura: entry.body_fat_percentage,
    musculo: entry.muscle_mass
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800">Acompanhamento de Evolução</h2>
          <p className="text-blue-600 mt-1">Registre e acompanhe seu progresso</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Registrar Progresso
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Registrar Progresso
            </CardTitle>
            <CardDescription className="text-blue-600">
              Acompanhe sua evolução registrando suas medidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-blue-800">Data</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                    required
                  />
                </div>
                <div>
                  <Label className="text-blue-800">Peso (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({...formData, weight: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                    placeholder="Ex: 70.5"
                  />
                </div>
                <div>
                  <Label className="text-blue-800">% Gordura Corporal</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                    placeholder="Ex: 15.5"
                  />
                </div>
                <div>
                  <Label className="text-blue-800">Massa Muscular (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.muscle_mass}
                    onChange={(e) => setFormData({...formData, muscle_mass: e.target.value})}
                    className="border-blue-200 focus:border-blue-400"
                    placeholder="Ex: 45.2"
                  />
                </div>
              </div>
              <div>
                <Label className="text-blue-800">Observações</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border-blue-200 focus:border-blue-400"
                  placeholder="Como você se sente? Alguma observação sobre o treino?"
                />
              </div>
              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  className="border-blue-200 text-blue-700 hover:bg-blue-50"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Chart */}
      {progressData.length > 0 && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Gráfico de Evolução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="date" stroke="#1e40af" />
                  <YAxis stroke="#1e40af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #3b82f6',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="peso" stroke="#3B82F6" strokeWidth={2} name="Peso (kg)" />
                  <Line type="monotone" dataKey="gordura" stroke="#EF4444" strokeWidth={2} name="% Gordura" />
                  <Line type="monotone" dataKey="musculo" stroke="#10B981" strokeWidth={2} name="Massa Muscular (kg)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent entries */}
      <div className="grid gap-4">
        {progressData.slice(-5).reverse().map((entry) => (
          <Card key={entry.id} className="bg-white border-blue-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-800">
                  <Calendar className="h-4 w-4" />
                  {new Date(entry.date).toLocaleDateString('pt-BR')}
                </div>
                <div className="text-blue-600 text-sm font-medium">
                  Peso: {entry.weight}kg
                </div>
              </div>
              {entry.notes && (
                <p className="text-blue-600 text-sm">{entry.notes}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {progressData.length === 0 && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Nenhum registro encontrado</h3>
            <p className="text-blue-600 mb-4">Comece a registrar seu progresso para acompanhar sua evolução</p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Primeiro Registro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;
