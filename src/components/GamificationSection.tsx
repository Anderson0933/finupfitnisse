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

interface GamificationData {
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  total_workouts_completed: number;
  achievements_unlocked: string[];
  last_activity_date: string | null;
}

const GamificationSection = ({ user }: GamificationSectionProps) => {
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    total_xp: 0,
    current_level: 1,
    current_streak: 0,
    best_streak: 0,
    total_workouts_completed: 0,
    achievements_unlocked: [],
    last_activity_date: null
  });
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const levels: UserLevel[] = [
    { level: 1, title: 'Iniciante', xpRequired: 0, color: 'bg-gray-100 text-gray-800', icon: <User className="h-4 w-4" /> },
    { level: 2, title: 'Guerreiro', xpRequired: 500, color: 'bg-green-100 text-green-800', icon: <Target className="h-4 w-4" /> },
    { level: 3, title: 'Atleta', xpRequired: 1500, color: 'bg-blue-100 text-blue-800', icon: <Dumbbell className="h-4 w-4" /> },
    { level: 4, title: 'Veterano', xpRequired: 3000, color: 'bg-purple-100 text-purple-800', icon: <Star className="h-4 w-4" /> },
    { level: 5, title: 'Mestre', xpRequired: 6000, color: 'bg-orange-100 text-orange-800', icon: <Award className="h-4 w-4" /> },
    { level: 6, title: 'Lenda', xpRequired: 10000, color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> },
  ];

  const getCurrentLevel = (xp: number): UserLevel => {
    return [...levels].reverse().find(level => xp >= level.xpRequired) || levels[0];
  };

  const getNextLevel = (xp: number): UserLevel | null => {
    return levels.find(level => xp < level.xpRequired) || null;
  };

  const achievements: Achievement[] = [
    {
      id: 'first-workout',
      title: 'Primeiro Passo',
      description: 'Complete seu primeiro treino',
      icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
      xpReward: 100,
      unlocked: gamificationData.achievements_unlocked.includes('first-workout'),
      category: 'workout'
    },
    {
      id: 'streak-3',
      title: 'Consistência',
      description: 'Mantenha uma sequência de 3 dias',
      icon: <Flame className="h-6 w-6 text-orange-600" />,
      xpReward: 200,
      unlocked: gamificationData.achievements_unlocked.includes('streak-3'),
      category: 'consistency'
    },
    {
      id: 'workout-10',
      title: 'Dedicação',
      description: 'Complete 10 treinos',
      icon: <Trophy className="h-6 w-6 text-yellow-600" />,
      xpReward: 300,
      unlocked: gamificationData.achievements_unlocked.includes('workout-10'),
      category: 'workout'
    },
    {
      id: 'streak-7',
      title: 'Força de Vontade',
      description: 'Sequência de 7 dias consecutivos',
      icon: <Star className="h-6 w-6 text-purple-600" />,
      xpReward: 500,
      unlocked: gamificationData.achievements_unlocked.includes('streak-7'),
      category: 'consistency'
    },
    {
      id: 'workout-25',
      title: 'Guerreiro',
      description: 'Complete 25 treinos',
      icon: <Medal className="h-6 w-6 text-green-600" />,
      xpReward: 750,
      unlocked: gamificationData.achievements_unlocked.includes('workout-25'),
      category: 'workout'
    },
    {
      id: 'streak-30',
      title: 'Imparável',
      description: 'Mantenha 30 dias de atividade',
      icon: <Crown className="h-6 w-6 text-gold-600" />,
      xpReward: 1000,
      unlocked: gamificationData.achievements_unlocked.includes('streak-30'),
      category: 'consistency'
    }
  ];

  const loadGamificationData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dados de gamificação persistentes
      const { data: gamificationRecord, error: gamificationError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (gamificationError && gamificationError.code !== 'PGRST116') {
        console.error('Erro ao buscar dados de gamificação:', gamificationError);
        return;
      }

      // Se não existir registro, criar um novo
      if (!gamificationRecord) {
        const { data: newRecord, error: insertError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            best_streak: 0,
            total_workouts_completed: 0,
            achievements_unlocked: [],
            fitness_category: 'iniciante'
          })
          .select()
          .single();

        if (insertError) {
          console.error('Erro ao criar registro de gamificação:', insertError);
          return;
        }

        setGamificationData({
          total_xp: 0,
          current_level: 1,
          current_streak: 0,
          best_streak: 0,
          total_workouts_completed: 0,
          achievements_unlocked: [],
          last_activity_date: null
        });
      } else {
        setGamificationData({
          total_xp: gamificationRecord.total_xp,
          current_level: gamificationRecord.current_level,
          current_streak: gamificationRecord.current_streak,
          best_streak: gamificationRecord.best_streak,
          total_workouts_completed: gamificationRecord.total_workouts_completed,
          achievements_unlocked: gamificationRecord.achievements_unlocked || [],
          last_activity_date: gamificationRecord.last_activity_date
        });
      }

      // Buscar progresso atual para atualizar XP
      await updateProgressData();

    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgressData = async () => {
    if (!user || isUpdating) return;

    try {
      setIsUpdating(true);

      // Buscar exercícios completados
      const { data: progressData } = await supabase
        .from('plan_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true);

      console.log('🎯 Progresso encontrado:', progressData?.length || 0, 'exercícios completados');

      const completedItems = progressData?.length || 0;
      const newXP = completedItems * 50; // 50 XP por exercício completado
      
      // Calcular treinos completos de forma mais precisa
      // Contar exercícios únicos por data como treinos diferentes
      const completedDates = [...new Set(progressData?.map(item => 
        new Date(item.created_at).toISOString().split('T')[0]
      ) || [])];
      
      const newWorkouts = completedDates.length; // Um treino por data única
      
      console.log('🏋️ Treinos calculados:', newWorkouts, 'com base em', completedDates.length, 'datas únicas');
      
      // Calcular streak baseado na atividade recente
      const today = new Date().toISOString().split('T')[0];
      let currentStreak = 0;
      
      // Ordenar datas e calcular streak consecutivo
      const sortedDates = completedDates.sort().reverse();
      let checkDate = new Date();
      
      for (let i = 0; i < 30; i++) { // Verificar até 30 dias atrás
        const dateToCheck = new Date(checkDate.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        if (sortedDates.includes(dateToCheck)) {
          currentStreak++;
        } else if (i > 0) { // Se não é o primeiro dia e não tem atividade, parar o streak
          break;
        }
      }
      
      const bestStreak = Math.max(gamificationData.best_streak, currentStreak);

      console.log('🔥 Streak atual:', currentStreak, 'Melhor streak:', bestStreak);

      // Verificar conquistas
      const newAchievements = [...gamificationData.achievements_unlocked];
      let totalXPBonus = 0;
      let newAchievementUnlocked = false;

      // Verificar conquistas de treino
      if (newWorkouts >= 1 && !newAchievements.includes('first-workout')) {
        newAchievements.push('first-workout');
        totalXPBonus += 100;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Primeiro Passo');
      }
      
      if (newWorkouts >= 10 && !newAchievements.includes('workout-10')) {
        newAchievements.push('workout-10');
        totalXPBonus += 300;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Dedicação');
      }
      
      if (newWorkouts >= 25 && !newAchievements.includes('workout-25')) {
        newAchievements.push('workout-25');
        totalXPBonus += 750;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Guerreiro');
      }

      // Verificar conquistas de streak
      if (currentStreak >= 3 && !newAchievements.includes('streak-3')) {
        newAchievements.push('streak-3');
        totalXPBonus += 200;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Consistência');
      }
      
      if (currentStreak >= 7 && !newAchievements.includes('streak-7')) {
        newAchievements.push('streak-7');
        totalXPBonus += 500;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Força de Vontade');
      }
      
      if (currentStreak >= 30 && !newAchievements.includes('streak-30')) {
        newAchievements.push('streak-30');
        totalXPBonus += 1000;
        newAchievementUnlocked = true;
        console.log('🏆 Conquista desbloqueada: Imparável');
      }

      const finalXP = newXP + totalXPBonus;
      const newLevel = getCurrentLevel(finalXP).level;

      console.log('📊 XP Final:', finalXP, 'Nível:', newLevel, 'Bônus de conquistas:', totalXPBonus);

      // Atualizar dados no banco apenas se houve mudanças
      const hasChanges = 
        finalXP !== gamificationData.total_xp ||
        newWorkouts !== gamificationData.total_workouts_completed ||
        currentStreak !== gamificationData.current_streak ||
        bestStreak !== gamificationData.best_streak ||
        newLevel !== gamificationData.current_level ||
        newAchievements.length !== gamificationData.achievements_unlocked.length;

      if (hasChanges) {
        console.log('💾 Atualizando dados de gamificação no banco...');
        
        // Cancelar timeout anterior se existir
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        // Debounce de 1 segundo para evitar múltiplas atualizações
        updateTimeoutRef.current = setTimeout(async () => {
          const { error: updateError } = await supabase
            .from('user_gamification')
            .update({
              total_xp: finalXP,
              current_level: newLevel,
              current_streak: currentStreak,
              best_streak: bestStreak,
              total_workouts_completed: newWorkouts,
              achievements_unlocked: newAchievements,
              last_activity_date: today,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateError) {
            console.error('❌ Erro ao atualizar gamificação:', updateError);
          } else {
            console.log('✅ Dados de gamificação atualizados com sucesso!');
            
            // Atualizar estado local
            setGamificationData({
              total_xp: finalXP,
              current_level: newLevel,
              current_streak: currentStreak,
              best_streak: bestStreak,
              total_workouts_completed: newWorkouts,
              achievements_unlocked: newAchievements,
              last_activity_date: today
            });

            // Mostrar notificação apenas para novas conquistas
            if (newAchievementUnlocked && !loading) {
              const newAchievementsDiff = newAchievements.filter(a => !gamificationData.achievements_unlocked.includes(a));
              if (newAchievementsDiff.length > 0) {
                const latestAchievement = achievements.find(a => a.id === newAchievementsDiff[0]);
                if (latestAchievement) {
                  toast({
                    title: "🏆 Nova Conquista!",
                    description: `Você desbloqueou: ${latestAchievement.title}`,
                    duration: 4000,
                  });
                }
              }
            }
          }
          setIsUpdating(false);
        }, 1000);
      } else {
        console.log('📝 Nenhuma mudança detectada nos dados de gamificação');
        setIsUpdating(false);
      }

    } catch (error) {
      console.error('💥 Erro ao atualizar progresso:', error);
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    loadGamificationData();

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [user]);

  const currentLevel = getCurrentLevel(gamificationData.total_xp);
  const nextLevel = getNextLevel(gamificationData.total_xp);
  const progressToNext = nextLevel ? 
    ((gamificationData.total_xp - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100 : 100;

  const unlockedAchievements = achievements.filter(a => a.unlocked);
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
                <p className="text-blue-800 font-bold text-lg">{gamificationData.total_xp} XP</p>
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
                <p className="text-orange-800 font-bold text-lg">{gamificationData.current_streak} dias</p>
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
                <p className="text-green-800 font-bold text-lg">{gamificationData.total_workouts_completed}</p>
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
            <Badge className={`${currentLevel.color} text-sm font-semibold px-3 py-1 flex items-center gap-1`}>
              {currentLevel.icon}
              Nível {currentLevel.level} - {currentLevel.title}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {nextLevel ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso para o próximo nível</span>
                <span className="font-semibold">{gamificationData.total_xp} / {nextLevel.xpRequired} XP</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-sm text-gray-600 text-center">
                Faltam {nextLevel.xpRequired - gamificationData.total_xp} XP para se tornar <strong>{nextLevel.title}</strong>
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
            Conquistas ({unlockedAchievements.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlockedAchievements.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Desbloqueadas
                </h4>
                <div className="grid gap-3">
                  {unlockedAchievements.map((achievement) => (
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
