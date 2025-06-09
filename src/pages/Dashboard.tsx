
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarIcon, Code, MessageSquare, Settings, Dumbbell } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

import WorkoutPlanGenerator from '@/components/WorkoutPlanGenerator';
import GamificationSection from '@/components/GamificationSection';

import { supabase } from '@/integrations/supabase/client';
import { WorkoutPlan } from '@/components/WorkoutPlanGenerator';

const Dashboard = () => {
  const { toast } = useToast();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("gamification");
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);

  // Adicionar estado para armazenar o nível de condicionamento
  const [userFitnessLevel, setUserFitnessLevel] = useState<string>('sedentario');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data: { user: authUser } } = await supabase.auth.getUser();
        
        if (!authUser) {
          console.log("No authenticated user found");
          setLoading(false);
          return;
        }

        // Buscar dados do usuário na tabela profiles
        const { data: userData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Erro ao carregar dados do usuário",
            description: "Tente novamente mais tarde.",
            variant: "destructive",
          })
        }

        if (userData) {
          setUser({ ...authUser, ...userData });
        } else {
          console.log("User not found in database, creating...");
          // Create user in database
          const { data, error } = await supabase
            .from('profiles')
            .insert([
              { id: authUser.id, full_name: authUser.user_metadata?.full_name || authUser.email },
            ])
            .select()
          if (error) {
            console.error("Error creating user:", error);
            toast({
              title: "Erro ao criar usuário",
              description: "Tente novamente mais tarde.",
              variant: "destructive",
            })
          }
          if (data) {
            setUser({ ...authUser, ...data[0] });
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro inesperado. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [toast]);

  useEffect(() => {
    const loadWorkoutPlan = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_workout_plans')
          .select('plan_data')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error("Error fetching workout plan:", error);
        }

        if (data?.plan_data) {
          setWorkoutPlan(data.plan_data as unknown as WorkoutPlan);
        } else {
          setWorkoutPlan(null);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        toast({
          title: "Erro inesperado",
          description: "Ocorreu um erro ao carregar o plano de treino. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setLoading(false);
      }
    };

    loadWorkoutPlan();
  }, [user, toast]);

  // Adicionar função para carregar o nível de condicionamento do usuário
  useEffect(() => {
    const loadUserFitnessLevel = async () => {
      if (!user) return;

      try {
        // Primeiro tentar pegar do perfil do usuário
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('fitness_level')
          .eq('user_id', user.id)
          .single();

        if (profileData?.fitness_level) {
          setUserFitnessLevel(profileData.fitness_level);
        } else {
          // Se não tiver no perfil, tentar pegar do localStorage (formulário)
          const savedFormData = localStorage.getItem('workout_form_data');
          if (savedFormData) {
            try {
              const formData = JSON.parse(savedFormData);
              if (formData.fitnessLevel) {
                setUserFitnessLevel(formData.fitnessLevel);
              }
            } catch (error) {
              console.warn('Erro ao ler dados do formulário:', error);
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar nível de condicionamento:', error);
      }
    };

    loadUserFitnessLevel();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-md">
          <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
            <div><Skeleton className="h-8 w-32 rounded-md" /></div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-24 rounded-md" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48 rounded-md" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-24 rounded-md" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48 rounded-md" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-24 rounded-md" /></CardTitle>
                <CardDescription><Skeleton className="h-4 w-48 rounded-md" /></CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold">
            <Dumbbell className="h-6 w-6" />
            <span>FitnessAI</span>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.full_name || "Avatar"} />
                    <AvatarFallback>{user?.full_name?.charAt(0).toUpperCase() || "F"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gamification" className="data-[state=active]:bg-gray-100">Gamificação</TabsTrigger>
            <TabsTrigger value="workout" className="data-[state=active]:bg-gray-100">Treino</TabsTrigger>
          </TabsList>

          <TabsContent value="gamification">
            <GamificationSection 
              user={user} 
              fitnessLevel={userFitnessLevel}
            />
          </TabsContent>

          <TabsContent value="workout">
            <WorkoutPlanGenerator 
              user={user} 
              workoutPlan={workoutPlan}
              setWorkoutPlan={setWorkoutPlan}
              onSwitchToAssistant={() => setActiveTab('assistant')}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
