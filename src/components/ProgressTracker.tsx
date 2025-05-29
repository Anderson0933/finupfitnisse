import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, Calendar, User as UserIcon, Trash2, RefreshCw, AlertTriangle } from 'lucide-react'; // Added Trash2, RefreshCw, AlertTriangle
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
} from "@/components/ui/alert-dialog" // Added AlertDialog imports

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
  const [loading, setLoading] = useState(false); // For saving new entry
  const [clearing, setClearing] = useState(false); // For clearing all data
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Basic validation
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
          // Ensure weight is parsed, handle potential NaN
          weight: parseFloat(formData.weight) || 0, 
          // Use null if parsing fails or field is empty for optional fields
          body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) || null : null,
          muscle_mass: formData.muscle_mass ? parseFloat(formData.muscle_mass) || null : null,
          notes: formData.notes || null
        }]);

      if (error) throw error;

      console.log('✅ Progresso salvo com sucesso.');
      toast({ title: "Progresso registrado!", description: "Seus dados foram salvos." });

      // Reset form and hide
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        muscle_mass: '',
        notes: ''
      });
      setShowForm(false);
      fetchProgressData(); // Refresh data
    } catch (error: any) {
      console.error('❌ Erro ao salvar progresso:', error);
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // --- CLEAR PROGRESS DATA --- 
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
      setProgressData([]); // Clear the data in state immediately
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
  // --- END CLEAR PROGRESS DATA ---

  // Format data for the chart, handle potential nulls gracefully
  const chartData = progressData.map(entry => ({
    date: new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR'), // Ensure date is treated as local
    peso: entry.weight ?? null,
    gordura: entry.body_fat_percentage ?? null,
    musculo: entry.muscle_mass ?? null
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header with Add and Clear buttons */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-blue-800">Acompanhamento de Evolução</h2>
          <p className="text-blue-600 mt-1">Registre e visualize seu progresso ao longo do tempo</p>
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
          {/* --- CLEAR BUTTON --- */} 
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
                  Limpar Evolução
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                    Confirmar Limpeza
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja limpar **todos** os seus registros de evolução? Esta ação não pode ser desfeita e seu gráfico será zerado.
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
          {/* --- END CLEAR BUTTON --- */} 
        </div>
      </div>

      {/* Form (conditionally rendered) */}
      {showForm && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Registrar Novo Progresso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-blue-800">Data *</Label>
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
                  <Label htmlFor="weight" className="text-blue-800">Peso (kg) *</Label>
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
                <div>
                  <Label htmlFor="body_fat" className="text-blue-800">% Gordura Corporal</Label>
                  <Input
                    id="body_fat"
                    type="number"
                    step="0.1"
                    value={formData.body_fat_percentage}
                    onChange={(e) => setFormData({...formData, body_fat_percentage: e.target.value})}
                    className="border-blue-200 focus:border-blue-400 mt-1"
                    placeholder="Opcional"
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
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="notes" className="text-blue-800">Observações</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="border-blue-200 focus:border-blue-400 mt-1"
                  placeholder="Como se sentiu? Alguma dificuldade? (Opcional)"
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

      {/* Chart (conditionally rendered) */}
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
                {/* Added check for chartData length > 1 for LineChart */}
                {chartData.length > 1 ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="date" stroke="#1e40af" fontSize={12} />
                    <YAxis stroke="#1e40af" fontSize={12} domain={['auto', 'auto']} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                        border: '1px solid #93c5fd',
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                      }}
                      itemStyle={{ color: '#1e40af' }}
                      labelStyle={{ color: '#1d4ed8', fontWeight: 'bold' }}
                    />
                    {/* Conditionally render lines only if data exists */} 
                    {chartData.some(d => d.peso !== null) && 
                      <Line type="monotone" dataKey="peso" stroke="#3B82F6" strokeWidth={2} name="Peso (kg)" dot={false} connectNulls />}
                    {chartData.some(d => d.gordura !== null) && 
                      <Line type="monotone" dataKey="gordura" stroke="#EF4444" strokeWidth={2} name="% Gordura" dot={false} connectNulls />}
                    {chartData.some(d => d.musculo !== null) && 
                      <Line type="monotone" dataKey="musculo" stroke="#10B981" strokeWidth={2} name="Massa Muscular (kg)" dot={false} connectNulls />}
                  </LineChart>
                ) : (
                  <div className="flex items-center justify-center h-full text-blue-600">
                    Registre pelo menos dois pontos para visualizar o gráfico.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent entries list (conditionally rendered) */}
      {progressData.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-blue-800 mb-3">Últimos Registros</h3>
          <div className="grid gap-4">
            {progressData.slice(-5).reverse().map((entry) => (
              <Card key={entry.id} className="bg-white border-blue-100 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 text-blue-800 font-medium">
                      <Calendar className="h-4 w-4 text-blue-500" />
                      {new Date(entry.date + 'T00:00:00').toLocaleDateString('pt-BR')}
                    </div>
                    <div className="flex gap-4 text-sm text-blue-700 flex-wrap">
                      <span>Peso: <strong>{entry.weight ?? '-'} kg</strong></span>
                      {entry.body_fat_percentage && <span>% Gordura: <strong>{entry.body_fat_percentage}%</strong></span>}
                      {entry.muscle_mass && <span>M. Muscular: <strong>{entry.muscle_mass} kg</strong></span>}
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="text-blue-600 text-sm bg-blue-50 p-2 rounded border border-blue-100 mt-2">{entry.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty state (when no data exists at all) */}
      {progressData.length === 0 && !showForm && (
        <Card className="bg-white border-blue-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <TrendingUp className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-blue-800 mb-2">Nenhum registro encontrado</h3>
            <p className="text-blue-600 mb-4">Comece a registrar seu progresso para acompanhar sua evolução.</p>
            <Button 
              onClick={() => setShowForm(true)} 
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Fazer Primeiro Registro
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTracker;

