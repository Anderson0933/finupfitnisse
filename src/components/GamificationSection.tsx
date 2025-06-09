
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  Zap, 
  Award, 
  Crown, 
  TrendingUp,
  Calendar,
  Dumbbell,
  Heart,
  Apple,
  CheckCircle2,
  Gift,
  Medal,
  Sparkles,
  ChevronRight,
  Lock,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface GamificationSectionProps {
  user: SupabaseUser | null;
}

interface UserLevel {
  level: number;
  title: string;
  xpRequired: number;
  color: string;
  icon: React.ReactNode;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
  unlocked: boolean;
  category: 'workout' | 'nutrition' | 'consistency' | 'progress';
}

const GamificationSection = ({ user }: GamificationSectionProps) => {
  const [userXP, setUserXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Ref para evitar múltiplas chamadas
  const updateInProgress = useRef(false);
  const hasShownInitialToasts = useRef(false);

  const levels: UserLevel[] = [
    { level: 1, title: 'Iniciante', xpRequired: 0, color: 'bg-gray-100 text-gray-800', icon: <User className="h-4 w-4" /> },
    { level: 2, title: 'Guerreiro', xpRequired: 100, color: 'bg-green-100 text-green-800', icon: <Target className="h-4 w-4" /> },
    { level: 3, title: 'Atleta', xpRequired: 300, color: 'bg-blue-100 text-blue-800', icon: <Dumbbell className="h-4 w-4" /> },
    { level: 4, title: 'Veterano', xpRequired: 600, color: 'bg-purple-100 text-purple-800', icon: <Star className="h-4 w-4" /> },
    { level: 5, title: 'Mestre', xpRequired: 1000, color: 'bg-orange-100 text-orange-800', icon: <Award className="h-4 w-4" /> },
    { level: 6, title: 'Lenda', xpRequired: 1500, color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> },
  ];

  const getCurrentLevelData = (xp: number): UserLevel => {
    return [...levels].reverse().find(level => xp >= level.xpRequired) || levels[0];
  };

  const getNextLevel = (xp: number): UserLevel | null => {
    return levels.find(level => xp < level.xpRequired) || null;
  };

  const defaultAchievements: Achievement[] = [
    {
      id: 'first-workout',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro treino',
      icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
      xpReward: 50,
      unlocked: false,
      category: 'workout'
    },
    {
      id: 'streak-3',
      title: 'Consistência',
      description: 'Mantenha uma sequência de 3 dias',
      icon: <Flame className="h-6 w-6 text-orange-600" />,
      xpReward: 75,
      unlocked: false,
      category: 'consistency'
    },
    {
      id: 'workout-10',
      title: 'Dedicação',
      description: 'Complete 10 treinos',
      icon: <Trophy className="h-6 w-6 text-yellow-600" />,
      xpReward: 100,
      unlocked: false,
      category: 'workout'
    },
    {
      id: 'streak-7',
      title: 'Força de Vontade',
      description: 'Sequência de 7 dias consecutivos',
      icon: <Star className="h-6 w-6 text-purple-600" />,
      xpReward: 150,
      unlocked: false,
      category: 'consistency'
    },
    {
      id: 'workout-25',
      title: 'Guerreiro',
      description: 'Complete 25 treinos',
      icon: <Medal className="h-6 w-6 text-green-600" />,
      xpReward: 200,
      unlocked: false,
      category: 'workout'
    },
    {
      id: 'streak-30',
      title: 'Imparável',
      description: 'Mantenha 30 dias de atividade',
      icon: <Crown className="h-6 w-6 text-gold-600" />,
      xpReward: 300,
      unlocked: false,
      category: 'consistency'
    }
  ];

  const updateGamificationData = async (newWorkouts: number, newStreak: number, currentXP: number, showToasts: boolean = false) => {
    if (!user || updateInProgress.current) return;

    updateInProgress.current = true;

    try {
      console.log('🎮 Atualizando gamificação:', { newWorkouts, newStreak, currentXP });

      // Verificar conquistas desbloqueadas
      const newUnlockedAchievements = [...unlockedAchievements];
      let xpToAdd = 0;

      defaultAchievements.forEach(achievement => {
        if (!newUnlockedAchievements.includes(achievement.id)) {
          const shouldUnlock = 
            (achievement.id === 'first-workout' && newWorkouts >= 1) ||
            (achievement.id === 'streak-3' && newStreak >= 3) ||
            (achievement.id === 'workout-10' && newWorkouts >= 10) ||
            (achievement.id === 'streak-7' && newStreak >= 7) ||
            (achievement.id === 'workout-25' && newWorkouts >= 25) ||
            (achievement.id === 'streak-30' && newStreak >= 30);

          if (shouldUnlock) {
            newUnlockedAchievements.push(achievement.id);
            xpToAdd += achievement.xpReward;
            
            if (showToasts && hasShownInitialToasts.current) {
              toast({
                title: "🏆 Nova Conquista Desbloqueada!",
                description: `${achievement.title} (+${achievement.xpReward} XP)`,
              });
            }
          }
        }
      });

      const finalXP = currentXP + xpToAdd;
      const newLevel = getCurrentLevelData(finalXP).level;
      const oldLevel = getCurrentLevelData(currentXP).level;

      // Mostrar toast de level up apenas se houve mudança
      if (showToasts && newLevel > oldLevel && hasShownInitialToasts.current) {
        const levelData = getCurrentLevelData(finalXP);
        toast({
          title: "🎉 Level Up!",
          description: `Você alcançou o nível ${newLevel} - ${levelData.title}!`,
        });
      }

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('user_gamification')
        .upsert({
          user_id: user.id,
          total_xp: finalXP,
          current_level: newLevel,
          current_streak: newStreak,
          total_workouts_completed: newWorkouts,
          achievements_unlocked: newUnlockedAchievements,
          last_activity_date: new Date().toISOString().split('T')[0],
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('❌ Erro ao atualizar gamificação:', error);
      } else {
        console.log('✅ Gamificação atualizada com sucesso');
        setUserXP(finalXP);
        setCurrentLevel(newLevel);
        setUnlockedAchievements(newUnlockedAchievements);
        setTotalWorkouts(newWorkouts);
        setCurrentStreak(newStreak);
      }
    } catch (error) {
      console.error('💥 Erro ao processar gamificação:', error);
    } finally {
      updateInProgress.current = false;
    }
  };

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        console.log('🔄 Carregando dados de gamificação...');

        // Buscar dados de gamificação salvos
        const { data: gamificationData, error: gamificationError } = await supabase
          .from('user_gamification')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (gamificationError) {
          console.error('❌ Erro ao buscar gamificação:', gamificationError);
        }

        // Buscar progresso atual dos exercícios uma única vez
        const { data: progressData, error: progressError } = await supabase
          .from('plan_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', true);

        if (progressError) {
          console.error('❌ Erro ao buscar progresso:', progressError);
        }

        const completedItems = progressData?.length || 0;
        const calculatedWorkouts = Math.floor(completedItems / 3); // Simular treinos completos
        
        // Calcular streak baseado na última atividade
        let calculatedStreak = 0;
        if (gamificationData?.last_activity_date) {
          const lastActivity = new Date(gamificationData.last_activity_date);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastActivity.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            calculatedStreak = gamificationData.current_streak || 0;
          }
        }

        if (gamificationData) {
          // Usar dados salvos
          console.log('✅ Dados de gamificação encontrados:', gamificationData);
          setUserXP(gamificationData.total_xp || 0);
          setCurrentStreak(gamificationData.current_streak || 0);
          setTotalWorkouts(gamificationData.total_workouts_completed || 0);
          setCurrentLevel(gamificationData.current_level || 1);
          setUnlockedAchievements(gamificationData.achievements_unlocked || []);

          // Verificar se há progresso novo apenas se há diferença significativa
          const hasNewProgress = calculatedWorkouts > (gamificationData.total_workouts_completed || 0);
          
          if (hasNewProgress) {
            console.log('🆕 Novo progresso detectado, atualizando...');
            // Dar tempo para mostrar os dados atuais primeiro
            setTimeout(() => {
              updateGamificationData(
                calculatedWorkouts,
                Math.max(gamificationData.current_streak || 0, calculatedStreak),
                gamificationData.total_xp || 0,
                true
              );
            }, 1000);
          }
        } else {
          // Primeira vez - criar dados iniciais
          console.log('🆕 Criando dados iniciais de gamificação...');
          setCurrentStreak(calculatedStreak);
          setTotalWorkouts(calculatedWorkouts);
          setUnlockedAchievements([]);
          
          if (calculatedWorkouts > 0 || calculatedStreak > 0) {
            await updateGamificationData(calculatedWorkouts, calculatedStreak, 0, false);
          }
        }

        // Atualizar achievements com status atual
        const savedAchievements = gamificationData?.achievements_unlocked || [];
        const updatedAchievements = defaultAchievements.map(achievement => ({
          ...achievement,
          unlocked: savedAchievements.includes(achievement.id)
        }));
        setAchievements(updatedAchievements);

        // Marcar que os toasts iniciais foram mostrados
        hasShownInitialToasts.current = true;

      } catch (error) {
        console.error('💥 Erro ao carregar dados de gamificação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, [user?.id]); // Dependência mais específica

  const currentLevelData = getCurrentLevelData(userXP);
  const nextLevel = getNextLevel(userXP);
  const progressToNext = nextLevel ? ((userXP - currentLevelData.xpRequired) / (nextLevel.xpRequired - currentLevelData.xpRequired)) * 100 : 100;

  const unlockedAchievementsList = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-24 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 border-yellow-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-yellow-800 text-xl md:text-2xl flex items-center gap-3">
            <div className="p-2 bg-yellow-600 rounded-lg shadow-md">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            Sistema de Gamificação
          </CardTitle>
          <CardDescription className="text-yellow-700 text-sm md:text-base">
            Conquiste XP, desbloqueie conquistas e suba de nível com seus treinos!
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-blue-800 font-bold text-lg">{userXP} XP</p>
                <p className="text-blue-600 text-sm">Experiência Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Flame className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-orange-800 font-bold text-lg">{currentStreak} dias</p>
                <p className="text-orange-600 text-sm">Sequência Atual</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-600 rounded-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-green-800 font-bold text-lg">{totalWorkouts}</p>
                <p className="text-green-600 text-sm">Treinos Completos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Badge className={`${currentLevelData.color} text-sm font-semibold px-3 py-1 flex items-center gap-1`}>
              {currentLevelData.icon}
              Nível {currentLevelData.level} - {currentLevelData.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextLevel ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso para o próximo nível</span>
                <span className="font-semibold">{userXP} / {nextLevel.xpRequired} XP</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-sm text-gray-600 text-center">
                Faltam {nextLevel.xpRequired - userXP} XP para se tornar <strong>{nextLevel.title}</strong>
              </p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Crown className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-lg font-bold text-yellow-800">Nível Máximo Alcançado!</p>
              <p className="text-gray-600">Você é uma verdadeira lenda do fitness!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Award className="h-6 w-6 text-purple-600" />
            Conquistas ({unlockedAchievementsList.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlockedAchievementsList.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Desbloqueadas
                </h4>
                <div className="grid gap-3">
                  {unlockedAchievementsList.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex-shrink-0">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-green-800">{achievement.title}</h5>
                        <p className="text-green-600 text-sm">{achievement.description}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked Achievements */}
            {lockedAchievements.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Próximas Conquistas
                </h4>
                <div className="grid gap-3">
                  {lockedAchievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-75">
                      <div className="flex-shrink-0 grayscale">
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-700">{achievement.title}</h5>
                        <p className="text-gray-600 text-sm">{achievement.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        +{achievement.xpReward} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Motivational CTA */}
      <Card className="bg-gradient-to-r from-purple-50 via-pink-50 to-red-50 border-purple-200 shadow-md">
        <CardContent className="p-6 text-center">
          <Sparkles className="h-12 w-12 text-purple-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-purple-800 mb-2">Continue Evoluindo!</h3>
          <p className="text-purple-600 mb-4">
            Cada treino completo, cada meta atingida te leva mais perto da sua melhor versão!
          </p>
          <div className="flex justify-center gap-2">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Target className="h-4 w-4 mr-2" />
              Ver Próximas Metas
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSection;
