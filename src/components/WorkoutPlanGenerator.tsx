
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
// Import the existing Supabase client
import { supabase } from '@/integrations/supabase/client'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox'; // Import Checkbox
import { useToast } from '@/hooks/use-toast';
import { Dumbbell, Target, Clock, User as UserIcon, Zap, RefreshCw, Copy, FileText, Trash2, AlertTriangle, CheckCircle2, MessageCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';
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

// --- Supabase Plan Progress Logic (Integrated within component file) ---

// Define the structure for plan progress data
interface PlanProgressItem {
  id?: number; // Optional: Supabase assigns this
  user_id: string;
  plan_id: string; // Identifier for the specific plan instance (using title for now)
  item_identifier: string; // Unique identifier for the item within the plan (e.g., exercise name + index)
  is_completed: boolean;
  created_at?: string; // Optional: Supabase handles this
  updated_at?: string; // Optional: Supabase handles this
}

// Assumes a table named 'plan_progress' exists in Supabase with columns:
// id (bigint, primary key), user_id (uuid, foreign key to auth.users), plan_id (text), item_identifier (text), is_completed (boolean), created_at (timestampz), updated_at (timestampz)
// RLS should be enabled for this table.

/**
 * Fetches the progress for a specific plan for the current user.
 * Uses the globally imported 'supabase' client.
 * @param userId - The ID of the current user.
 * @param planId - The identifier of the plan.
 * @returns A map of item identifiers to their completion status.
 */
const getPlanProgress = async (userId: string, planId: string): Promise<Map<string, boolean>> => {
  console.log(`[Supabase] Fetching progress for user ${userId}, plan ${planId}`);
  const { data, error } = await supabase
    .from('plan_progress')
    .select('item_identifier, is_completed')
    .eq('user_id', userId)
    .eq('plan_id', planId);

  if (error) {
    console.error('[Supabase] Error fetching plan progress:', error);
    throw error;
  }

  const progressMap = new Map<string, boolean>();
  data?.forEach(item => {
    progressMap.set(item.item_identifier, item.is_completed);
  });
  console.log(`[Supabase] Fetched ${progressMap.size} progress items.`);
  return progressMap;
};

/**
 * Updates or inserts the completion status for a specific item in a plan.
 * Uses the globally imported 'supabase' client.
 * @param progressItem - The progress item data.
 */
const updateItemProgress = async (progressItem: Omit<PlanProgressItem, 'id' | 'created_at' | 'updated_at'>) => {
  console.log(`[Supabase] Upserting progress for item: ${progressItem.item_identifier}, status: ${progressItem.is_completed}`);
  const { data, error } = await supabase
    .from('plan_progress')
    .upsert(progressItem, {
      onConflict: 'user_id, plan_id, item_identifier' // Specify conflict columns for upsert
    })
    .select(); // Select the upserted/updated row

  if (error) {
    console.error('[Supabase] Error updating item progress:', error);
    throw error;
  }
  console.log(`[Supabase] Progress upserted successfully for item: ${progressItem.item_identifier}`);
  return data;
};

/**
 * Deletes all progress entries for a specific plan for the current user.
 * Uses the globally imported 'supabase' client.
 * @param userId - The ID of the current user.
 * @param planId - The identifier of the plan.
 */
const deletePlanProgress = async (userId: string, planId: string) => {
  console.log(`[Supabase] Deleting progress for user ${userId}, plan ${planId}`);
  const { error } = await supabase
    .from('plan_progress')
    .delete()
    .eq('user_id', userId)
    .eq('plan_id', planId);

  if (error) {
    console.error('[Supabase] Error deleting plan progress:', error);
    throw error;
  }
  console.log(`[Supabase] Progress deleted successfully for plan: ${planId}`);
};
// --- End Supabase Plan Progress Logic ---

// Define WorkoutPlan interface
export interface WorkoutPlan {
  id?: string; // Add an ID field, potentially generated or fetched
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
  nutrition_tips?: string[];
  weekly_schedule?: any;
  progression_protocol?: any;
  nutrition_guidelines?: any;
  recovery_protocols?: any;
  progress_tracking?: any;
  safety_guidelines?: any;
}

interface WorkoutPlanGeneratorProps {
  user: User | null;
  workoutPlan: WorkoutPlan | null;
  setWorkoutPlan: (plan: WorkoutPlan | null) => void;
  initialActiveTab?: 'form' | 'plan';
}

// FORM PERSISTENCE KEY
const FORM_STORAGE_KEY = 'workout_form_data';

const WorkoutPlanGenerator = ({ 
  user, 
  workoutPlan, 
  setWorkoutPlan,
  initialActiveTab = 'form'
}: WorkoutPlanGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Load form data from localStorage or use defaults
  const loadFormData = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (error) {
          console.warn('Failed to parse saved form data:', error);
        }
      }
    }
    return {
      age: '',
      gender: '',
      weight: '',
      height: '',
      fitnessLevel: '',
      goals: [],
      availableTime: '',
      availableDays: '',
      equipment: '',
      limitations: ''
    };
  };

  const [formData, setFormData] = useState(loadFormData);
  const [activeTab, setActiveTab] = useState<'form' | 'plan'>(() => 
    workoutPlan ? 'plan' : initialActiveTab
  );
  const [otherLimitationsText, setOtherLimitationsText] = useState(""); 
  const [otherGoalsText, setOtherGoalsText] = useState(""); 
  // State to store completion status for each item
  const [progressMap, setProgressMap] = useState<Map<string, boolean>>(new Map());
  const { toast } = useToast();

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData]);

  // Clear form data when plan is successfully generated
  const clearFormData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FORM_STORAGE_KEY);
    }
    setFormData({
      age: '',
      gender: '',
      weight: '',
      height: '',
      fitnessLevel: '',
      goals: [],
      availableTime: '',
      availableDays: '',
      equipment: '',
      limitations: ''
    });
    setOtherLimitationsText('');
    setOtherGoalsText('');
  };

  // Effect to load progress when plan and user are available
  useEffect(() => {
    const loadProgress = async () => {
      // Use workoutPlan.title as the planId for now. Consider a more stable ID if possible.
      const currentPlanId = workoutPlan?.title;
      if (user && currentPlanId) { 
        try {
          console.log(`🔄 Loading progress for plan: ${currentPlanId}`);
          // Use the function defined above
          const fetchedProgress = await getPlanProgress(user.id, currentPlanId);
          setProgressMap(fetchedProgress);
          console.log(`✅ Progress loaded: ${fetchedProgress.size} items`);
        } catch (error) {
          console.error('❌ Error loading plan progress:', error);
          toast({
            title: "Erro ao Carregar Progresso",
            description: "Não foi possível carregar o estado dos itens concluídos.",
            variant: "destructive",
          });
        }
      } else {
        // Clear progress if no user or plan
        setProgressMap(new Map());
      }
    };

    loadProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, workoutPlan?.title]); // Rerun only when user or plan *title* changes

  useEffect(() => {
    if (workoutPlan && activeTab !== 'plan') {
      setActiveTab('plan');
    }
  }, [workoutPlan, activeTab]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // NEW: Handler for Goals Checkboxes
  const handleGoalChange = (goal: string, checked: boolean) => {
    setFormData(prev => {
      const currentGoals = prev.goals || []; // Ensure goals is an array
      if (checked) {
        // Add goal if checked and not already present
        return { ...prev, goals: [...currentGoals, goal] };
      } else {
        // Remove goal if unchecked
        const updatedGoals = currentGoals.filter(g => g !== goal);
        // If unchecking "outros", also clear the text
        if (goal === "outros") {
          setOtherGoalsText("");
        }
        return { ...prev, goals: updatedGoals };
      }
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpa o texto de "outras" se a seleção mudar
    if (field === 'limitations' && value !== 'outros') {
      setOtherLimitationsText('');
    }
  };

  // Function to handle checkbox change
  const handleProgressChange = async (itemIdentifier: string, currentStatus: boolean) => {
    const currentPlanId = workoutPlan?.title;
    if (!user || !currentPlanId) return;

    const newStatus = !currentStatus;
    const userId = user.id;
    const planId = currentPlanId; // Using title as planId

    // Optimistic UI update
    setProgressMap(prevMap => new Map(prevMap).set(itemIdentifier, newStatus));

    try {
      // Use the function defined above
      await updateItemProgress({
        user_id: userId,
        plan_id: planId,
        item_identifier: itemIdentifier,
        is_completed: newStatus,
      });
      console.log(`✅ Progress updated for item: ${itemIdentifier} to ${newStatus}`);
    } catch (error) {
      console.error('❌ Error updating item progress:', error);
      // Revert UI on error
      setProgressMap(prevMap => new Map(prevMap).set(itemIdentifier, currentStatus));
      toast({
        title: "Erro ao Salvar Progresso",
        description: "Não foi possível salvar a alteração. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const saveWorkoutPlan = async (plan: WorkoutPlan) => {
    if (!user) return;

    console.log('💾 Tentando salvar o plano no DB...');
    try {
      // Delete existing plan first (current logic)
      const { error: deleteError } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.warn('⚠️ Erro ao deletar plano antigo (pode não existir):', deleteError.message);
      }

      // Also delete existing progress for the *old* plan before saving the new one
      // This assumes generating a new plan replaces the old one entirely.
      const oldPlanId = workoutPlan?.title; // Get the ID (title) of the plan being replaced
      if (oldPlanId) {
         console.log(`🗑️ Deleting old progress for plan being replaced: ${oldPlanId}`);
         // Use the function defined above
         await deletePlanProgress(user.id, oldPlanId);
      }

      // Insert the new plan
      const { data: insertData, error: insertError } = await supabase
        .from('user_workout_plans')
        .insert({
          user_id: user.id,
          plan_data: plan as any // Cast to any to satisfy the Json type requirement
        })
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao salvar novo plano:', insertError);
        throw new Error('Falha ao salvar o plano de treino no banco de dados.');
      }
      
      const savedPlan = plan; // Continue using title as ID for now

      console.log('✅ Plano salvo com sucesso no DB!');
      return savedPlan; // Return the saved plan
    } catch (error: any) {
      console.error('💥 Erro na função saveWorkoutPlan:', error);
      toast({
        title: "Erro ao Salvar Plano",
        description: error.message || "Não foi possível salvar seu plano. Tente gerar novamente.",
        variant: "destructive",
      });
      return null; // Indicate failure
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
    const oldPlanId = workoutPlan?.title; // Store old plan ID before clearing
    setWorkoutPlan(null); // Clear current plan before generating
    setProgressMap(new Map()); // Clear progress map as well
    
    try {
      console.log('🚀 INICIANDO GERAÇÃO DO PLANO');
      const sessionDuration = formData.availableTime ? parseInt(formData.availableTime) || 60 : 60;
      const availableDays = formData.availableDays ? parseInt(formData.availableDays) || 3 : 3; // Use selected days, default 3

      // Prepare goals, including "outros" text if selected
      let finalGoals = formData.goals || [];
      if (finalGoals.includes("outros")) {
        finalGoals = finalGoals.filter(g => g !== "outros"); // Remove the placeholder
        if (otherGoalsText.trim()) {
          finalGoals.push(`outros: ${otherGoalsText.trim()}`); // Add formatted other text
        }
      }
      // Ensure at least one goal is sent, even if empty initially
      if (finalGoals.length === 0) {
         finalGoals.push("saude_geral"); // Default goal if none selected
         toast({ title: "Objetivo Padrão", description: "Nenhum objetivo selecionado, usando 'Saúde Geral'.", variant: "default" });
      }

      const requestData = {
        userProfile: {
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseInt(formData.weight),
          height: parseInt(formData.height),
          fitness_level: formData.fitnessLevel,
          fitness_goals: finalGoals, // Use the processed goals array
          available_days: availableDays, // Use the parsed available days
          session_duration: sessionDuration,
          equipment: formData.equipment || 'peso_corporal',
          limitations: formData.limitations === 'outros'
                        ? `outros: ${otherLimitationsText || 'não especificado'}`
                        : formData.limitations || 'nenhuma'
        },
        userId: user.id
      };

      console.log('📤 Enviando para a API generate-workout-plan...');
      // Use the existing Supabase client to invoke the function
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
        nutrition_tips: data.nutrition_tips || [],
        weekly_schedule: data.weekly_schedule,
        progression_protocol: data.progression_protocol,
        nutrition_guidelines: data.nutrition_guidelines,
        recovery_protocols: data.recovery_protocols,
        progress_tracking: data.progress_tracking,
        safety_guidelines: data.safety_guidelines
      };

      // Save the new plan (this will also delete old progress via saveWorkoutPlan)
      const savedPlan = await saveWorkoutPlan(plan);
      if (!savedPlan) {
        setLoading(false);
        return; // Stop if saving failed
      }

      console.log('✅ Plano processado e salvo. Atualizando estado...');
      setWorkoutPlan(savedPlan); // Use the potentially updated plan object
      
      setActiveTab('plan');
      console.log('✅ Aba interna alterada para "plan"');
      
      // Clear form data after successful generation
      clearFormData();
      
      toast({
        title: "Plano gerado e salvo!",
        description: "Seu plano de treino personalizado está pronto e salvo.",
      });

    } catch (error: any) {
      console.error('💥 Erro ao gerar/salvar plano:', error);
      setWorkoutPlan(null);
      setProgressMap(new Map()); // Clear progress on error too
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
    const currentPlanId = workoutPlan?.title;
    if (!user || !currentPlanId) return; // Check title for planId

    setDeleting(true);
    console.log('🗑️ Tentando deletar o plano e seu progresso do DB...');
    const planId = currentPlanId; // Use title as planId

    try {
      // 1. Delete progress first
      console.log(`🗑️ Deletando progresso para o plano: ${planId}`);
      // Use the function defined above
      await deletePlanProgress(user.id, planId);
      console.log('✅ Progresso deletado com sucesso!');

      // 2. Delete the plan itself
      console.log(`🗑️ Deletando plano: ${planId}`);
      // Use the existing Supabase client
      const { error: deletePlanError } = await supabase
        .from('user_workout_plans')
        .delete()
        .eq('user_id', user.id);
        // Assuming only one plan per user is stored in this table

      if (deletePlanError) {
        console.error('❌ Erro ao deletar plano:', deletePlanError);
        toast({
          title: "Erro Parcial ao Excluir",
          description: "Não foi possível excluir os dados do plano, mas o progresso foi removido.",
          variant: "destructive",
        });
      } else {
         console.log('✅ Plano deletado com sucesso do DB!');
      }

      // 3. Update UI state
      setWorkoutPlan(null);
      setProgressMap(new Map()); // Clear progress map
      setActiveTab('form');
      toast({
        title: "Plano Excluído",
        description: "Seu plano de treino e progresso foram removidos.",
      });

    } catch (error: any) {
      console.error('💥 Erro na função deleteWorkoutPlan:', error);
      toast({
        title: "Erro ao Excluir Plano",
        description: error.message || "Não foi possível excluir seu plano ou progresso.",
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
      
      // Se tiver cronograma semanal, usar essa estrutura
      if (workoutPlan.weekly_schedule) {
        planText += `📅 CRONOGRAMA SEMANAL:\n\n`;
        Object.entries(workoutPlan.weekly_schedule).forEach(([day, dayData]: [string, any]) => {
          planText += `${day.toUpperCase()}:\n`;
          planText += `📍 Foco: ${dayData.focus || 'N/A'}\n`;
          
          if (dayData.main_workout && dayData.main_workout.length > 0) {
            dayData.main_workout.forEach((exercise: any, index: number) => {
              const itemIdentifier = `${day}_${exercise.exercise}_${index}`;
              const isCompleted = progressMap.get(itemIdentifier) || false;
              planText += `${isCompleted ? '[✅]' : '[ ]'} ${exercise.exercise}\n`;
              planText += `   📊 ${exercise.sets} séries x ${exercise.reps} (${exercise.rest})\n`;
            });
          }
          
          if (dayData.activities && dayData.activities.length > 0) {
            planText += `🎯 Atividades: ${dayData.activities.join(', ')}\n`;
          }
          planText += `\n`;
        });
      } else {
        // Fallback para exercícios antigos
        planText += `💪 EXERCÍCIOS:\n\n`;
        workoutPlan.exercises.forEach((exercise, index) => {
          const itemIdentifier = `${exercise.name}_${index}`;
          const isCompleted = progressMap.get(itemIdentifier) || false;
          planText += `${isCompleted ? '[✅]' : '[ ]'} ${index + 1}. ${exercise.name}\n`;
          planText += `   📊 Séries: ${exercise.sets}\n`;
          planText += `   🔢 Repetições: ${exercise.reps}\n`;
          planText += `   ⏰ Descanso: ${exercise.rest}\n`;
          planText += `   📋 ${exercise.instructions}\n\n`;
        });
      }
      
      if (workoutPlan.nutrition_tips && workoutPlan.nutrition_tips.length > 0) {
        planText += `🥗 DICAS NUTRICIONAIS:\n\n`;
        workoutPlan.nutrition_tips.forEach((tip, index) => {
          planText += `${index + 1}. ${tip}\n`;
        });
      }
      
      navigator.clipboard.writeText(planText);
      toast({ title: "Copiado!", description: "Plano de treino (com progresso) copiado." });
    }
  };

  // --- RENDER SECTION --- 
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Card */}
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
        {/* Tabs List */}
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

        {/* Form Tab Content */}
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
                   Gerar um novo plano substituirá o plano atual salvo e seu progresso.
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

              {/* MODIFIED: Goals with Checkboxes */}
              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Target className="h-4 w-4" /> Objetivos Principais (selecione um ou mais) *
                </Label>
                <div className="mt-3 space-y-3">
                  {[ // Define goal options here
                    { value: "perda_peso", label: "📉 Perda de Peso / Gordura" },
                    { value: "hipertrofia", label: "💪 Ganho de Massa Muscular" },
                    { value: "condicionamento", label: "❤️ Melhora Cardiovascular" },
                    { value: "forca", label: "⚡ Aumento de Força" },
                    { value: "saude_geral", label: "🧘 Saúde Geral / Manutenção" },
                    { value: "outros", label: "⚠️ Outros (descreva abaixo)" }
                  ].map((goal) => (
                    <div key={goal.value} className="flex items-center space-x-2 p-3 border border-blue-200 rounded-lg hover:bg-blue-50">
                      <Checkbox
                        id={goal.value}
                        checked={(formData.goals || []).includes(goal.value)} // Check if goal is in the array
                        onCheckedChange={(checked) => handleGoalChange(goal.value, !!checked)} // Pass boolean
                      />
                      <Label htmlFor={goal.value} className="flex items-center gap-2 cursor-pointer">
                        {goal.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {/* Input condicional para "Outros" objetivos */}
                {(formData.goals || []).includes("outros") && (
                  <div className="mt-4">
                    <Label htmlFor="otherGoals" className="text-blue-700 font-medium">Descreva seus outros objetivos:</Label>
                    <Input
                      id="otherGoals"
                      type="text"
                      placeholder="Ex: Preparação para maratona, reabilitação..."
                      value={otherGoalsText}
                      onChange={(e) => setOtherGoalsText(e.target.value)}
                      className="border-blue-200 focus:border-blue-400 mt-2"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Tempo Disponível por Treino
                </Label>
                <Select value={formData.availableTime} onValueChange={(value) => handleSelectChange('availableTime', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione o tempo (opcional, padrão 60min)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">⏰ 30 min</SelectItem>
                    <SelectItem value="45">⏰ 45 min</SelectItem>
                    <SelectItem value="60">⏰ 60 min</SelectItem>
                    <SelectItem value="90">⏰ 90 min</SelectItem>
                    <SelectItem value="120">⏰ 2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* NEW: Available Days per Week */}
              <div>
                <Label className="text-blue-700 font-medium flex items-center gap-2">
                  🗓️ Dias Disponíveis por Semana *
                </Label>
                <Select value={formData.availableDays} onValueChange={(value) => handleSelectChange("availableDays", value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione quantos dias na semana" /></SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map(day => (
                      <SelectItem key={day} value={String(day)}>{day} dia{day > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Equipamentos Disponíveis</Label>
                <Select value={formData.equipment} onValueChange={(value) => handleSelectChange('equipment', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione os equipamentos (opcional, padrão peso corporal)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academia_completa">🏢 Academia completa</SelectItem>
                    <SelectItem value="casa_halteres">🏠 Casa com halteres</SelectItem>
                    <SelectItem value="casa_basico">🏠 Casa básicos (elásticos, etc)</SelectItem>
                    <SelectItem value="peso_corporal">🤸 Peso corporal</SelectItem>
                    <SelectItem value="parque">🌳 Parque (barras, etc)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-blue-700 font-medium">Limitações Físicas</Label>
                <Select value={formData.limitations} onValueChange={(value) => handleSelectChange('limitations', value)}>
                  <SelectTrigger className="border-blue-200 focus:border-blue-400 mt-2"><SelectValue placeholder="Selecione limitações (opcional, padrão nenhuma)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">✅ Nenhuma</SelectItem>
                    <SelectItem value="joelho">🦵 Joelho</SelectItem>
                    <SelectItem value="costas">🔙 Costas</SelectItem>
                    <SelectItem value="ombro">💪 Ombro</SelectItem>
                    <SelectItem value="tornozelo">🦶 Tornozelo</SelectItem>
                    <SelectItem value="cardiaco">❤️ Cardíaco</SelectItem>
                    <SelectItem value="outros">⚠️ Outras (descreva se possível)</SelectItem>
                  </SelectContent>
                </Select>
                {/* Input condicional para "Outras" limitações */}
                {formData.limitations === 'outros' && (
                  <div className="mt-4">
                    <Label htmlFor="otherLimitations" className="text-blue-700 font-medium">Descreva suas outras limitações:</Label>
                    <Input 
                      id="otherLimitations"
                      type="text" 
                      placeholder="Ex: Tendinite no pulso, asma leve..." 
                      value={otherLimitationsText} 
                      onChange={(e) => setOtherLimitationsText(e.target.value)} 
                      className="border-blue-200 focus:border-blue-400 mt-2"
                    />
                  </div>
                )}
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

        {/* Plan Tab Content - SIMPLIFIED */}
        <TabsContent value="plan">
          {workoutPlan ? (
            <WorkoutPlanDisplay
              plan={workoutPlan}
              onCopyPlan={copyPlan}
              onDeletePlan={deleteWorkoutPlan}
              onGenerateNew={() => setActiveTab('form')}
              progressMap={progressMap}
              onProgressChange={handleProgressChange}
            />
          ) : (
            // Empty State
            <Card className="bg-white border-gray-200 shadow-lg">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum plano salvo</h3>
                <p className="text-gray-500 mb-6">Vá para "Criar Plano" para gerar seu treino.</p>
                <Button onClick={() => setActiveTab('form')} className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Dumbbell className="h-4 w-4 mr-2" /> Criar Meu Plano
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanGenerator;
