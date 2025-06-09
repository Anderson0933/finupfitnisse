import React, { useState, useEffect } from 'react';
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

interface GamificationSectionProps {
  user: SupabaseUser | null;
  fitnessLevel?: string; // Novo prop para o nível de condicionamento
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

const GamificationSection = ({ user, fitnessLevel = 'sedentario' }: GamificationSectionProps) => {
  const [userXP, setUserXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  const levels: UserLevel[] = [
    { level: 1, title: 'Iniciante', xpRequired: 0, color: 'bg-gray-100 text-gray-800', icon: <User className="h-4 w-4" /> },
    { level: 2, title: 'Guerreiro', xpRequired: 100, color: 'bg-green-100 text-green-800', icon: <Target className="h-4 w-4" /> },
    { level: 3, title: 'Atleta', xpRequired: 300, color: 'bg-blue-100 text-blue-800', icon: <Dumbbell className="h-4 w-4" /> },
    { level: 4, title: 'Veterano', xpRequired: 600, color: 'bg-purple-100 text-purple-800', icon: <Star className="h-4 w-4" /> },
    { level: 5, title: 'Mestre', xpRequired: 1000, color: 'bg-orange-100 text-orange-800', icon: <Award className="h-4 w-4" /> },
    { level: 6, title: 'Lenda', xpRequired: 1500, color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> },
  ];

  const getCurrentLevel = (xp: number): UserLevel => {
    return levels.reverse().find(level => xp >= level.xpRequired) || levels[0];
  };

  const getNextLevel = (xp: number): UserLevel | null => {
    return levels.find(level => xp < level.xpRequired) || null;
  };

  // Conquistas específicas por nível de condicionamento
  const getAchievementsByFitnessLevel = (level: string): Achievement[] => {
    const baseAchievements = {
      sedentario: [
        {
          id: 'first-step',
          title: 'Primeiro Passo',
          description: 'Complete seu primeiro exercício',
          icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
          xpReward: 25,
          unlocked: totalWorkouts >= 1,
          category: 'workout' as const
        },
        {
          id: 'week-1',
          title: 'Uma Semana Ativa',
          description: 'Mantenha 3 dias de atividade',
          icon: <Flame className="h-6 w-6 text-orange-600" />,
          xpReward: 50,
          unlocked: currentStreak >= 3,
          category: 'consistency' as const
        },
        {
          id: 'basic-routine',
          title: 'Rotina Básica',
          description: 'Complete 5 exercícios',
          icon: <Star className="h-6 w-6 text-purple-600" />,
          xpReward: 75,
          unlocked: totalWorkouts >= 5,
          category: 'workout' as const
        },
        {
          id: 'motivation',
          title: 'Motivação',
          description: 'Mantenha 7 dias consecutivos',
          icon: <Heart className="h-6 w-6 text-red-600" />,
          xpReward: 100,
          unlocked: currentStreak >= 7,
          category: 'consistency' as const
        }
      ],
      iniciante: [
        {
          id: 'getting-started',
          title: 'Começando Bem',
          description: 'Complete 3 treinos',
          icon: <Target className="h-6 w-6 text-green-600" />,
          xpReward: 50,
          unlocked: totalWorkouts >= 3,
          category: 'workout' as const
        },
        {
          id: 'consistency-week',
          title: 'Semana Consistente',
          description: 'Mantenha 5 dias de atividade',
          icon: <Flame className="h-6 w-6 text-orange-600" />,
          xpReward: 75,
          unlocked: currentStreak >= 5,
          category: 'consistency' as const
        },
        {
          id: 'first-milestone',
          title: 'Primeiro Marco',
          description: 'Complete 10 treinos',
          icon: <Trophy className="h-6 w-6 text-yellow-600" />,
          xpReward: 100,
          unlocked: totalWorkouts >= 10,
          category: 'workout' as const
        },
        {
          id: 'steady-progress',
          title: 'Progresso Constante',
          description: 'Mantenha 14 dias consecutivos',
          icon: <TrendingUp className="h-6 w-6 text-blue-600" />,
          xpReward: 150,
          unlocked: currentStreak >= 14,
          category: 'consistency' as const
        }
      ],
      intermediario: [
        {
          id: 'intermediate-start',
          title: 'Nível Intermediário',
          description: 'Complete 5 treinos',
          icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
          xpReward: 75,
          unlocked: totalWorkouts >= 5,
          category: 'workout' as const
        },
        {
          id: 'solid-base',
          title: 'Base Sólida',
          description: 'Mantenha 7 dias consecutivos',
          icon: <Flame className="h-6 w-6 text-orange-600" />,
          xpReward: 100,
          unlocked: currentStreak >= 7,
          category: 'consistency' as const
        },
        {
          id: 'commitment',
          title: 'Comprometimento',
          description: 'Complete 20 treinos',
          icon: <Medal className="h-6 w-6 text-green-600" />,
          xpReward: 150,
          unlocked: totalWorkouts >= 20,
          category: 'workout' as const
        },
        {
          id: 'advanced-streak',
          title: 'Sequência Avançada',
          description: 'Mantenha 21 dias consecutivos',
          icon: <Star className="h-6 w-6 text-purple-600" />,
          xpReward: 200,
          unlocked: currentStreak >= 21,
          category: 'consistency' as const
        }
      ],
      avancado: [
        {
          id: 'elite-level',
          title: 'Nível Elite',
          description: 'Complete 10 treinos intensos',
          icon: <Crown className="h-6 w-6 text-gold-600" />,
          xpReward: 100,
          unlocked: totalWorkouts >= 10,
          category: 'workout' as const
        },
        {
          id: 'advanced-consistency',
          title: 'Consistência Avançada',
          description: 'Mantenha 10 dias consecutivos',
          icon: <Flame className="h-6 w-6 text-orange-600" />,
          xpReward: 125,
          unlocked: currentStreak >= 10,
          category: 'consistency' as const
        },
        {
          id: 'master-trainer',
          title: 'Mestre dos Treinos',
          description: 'Complete 30 treinos',
          icon: <Award className="h-6 w-6 text-orange-600" />,
          xpReward: 200,
          unlocked: totalWorkouts >= 30,
          category: 'workout' as const
        },
        {
          id: 'champion',
          title: 'Campeão',
          description: 'Mantenha 30 dias consecutivos',
          icon: <Trophy className="h-6 w-6 text-yellow-600" />,
          xpReward: 300,
          unlocked: currentStreak >= 30,
          category: 'consistency' as const
        }
      ]
    };

    return baseAchievements[level as keyof typeof baseAchievements] || baseAchievements.sedentario;
  };

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Simular dados de XP e streak baseados no progresso do usuário
        const { data: progressData } = await supabase
          .from('plan_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_completed', true);

        const completedItems = progressData?.length || 0;
        const calculatedXP = completedItems * 25; // 25 XP por exercício completado
        const simulatedStreak = Math.min(completedItems, 7); // Simular streak
        const simulatedWorkouts = Math.floor(completedItems / 3); // Simular treinos completos

        setUserXP(calculatedXP);
        setCurrentStreak(simulatedStreak);
        setTotalWorkouts(simulatedWorkouts);

        // Atualizar achievements baseado no nível de condicionamento
        const levelAchievements = getAchievementsByFitnessLevel(fitnessLevel);
        const updatedAchievements = levelAchievements.map(achievement => ({
          ...achievement,
          unlocked: achievement.id.includes('workout') ? 
            (achievement.id === 'first-step' || achievement.id === 'getting-started' || achievement.id === 'intermediate-start' || achievement.id === 'elite-level') ? simulatedWorkouts >= 1 :
            achievement.id === 'basic-routine' ? simulatedWorkouts >= 5 :
            achievement.id === 'first-milestone' ? simulatedWorkouts >= 10 :
            achievement.id === 'commitment' ? simulatedWorkouts >= 20 :
            achievement.id === 'master-trainer' ? simulatedWorkouts >= 30 :
            false :
            achievement.id.includes('consistency') ?
            (achievement.id === 'week-1') ? simulatedStreak >= 3 :
            (achievement.id === 'motivation' || achievement.id === 'consistency-week') ? simulatedStreak >= 5 :
            (achievement.id === 'solid-base') ? simulatedStreak >= 7 :
            (achievement.id === 'advanced-consistency') ? simulatedStreak >= 10 :
            (achievement.id === 'steady-progress') ? simulatedStreak >= 14 :
            (achievement.id === 'advanced-streak') ? simulatedStreak >= 21 :
            (achievement.id === 'champion') ? simulatedStreak >= 30 :
            false : false
        }));

        setAchievements(updatedAchievements);

      } catch (error) {
        console.error('Erro ao carregar dados de gamificação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, [user, fitnessLevel]);

  const currentLevel = getCurrentLevel(userXP);
  const nextLevel = getNextLevel(userXP);
  const progressToNext = nextLevel ? ((userXP - currentLevel.xpRequired) / (nextLevel.xpRequired - currentLevel.xpRequired)) * 100 : 100;

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

  // Mapear nível de condicionamento para exibição
  const fitnessLevelLabels = {
    sedentario: 'Sedentário',
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado'
  };

  const currentFitnessLabel = fitnessLevelLabels[fitnessLevel as keyof typeof fitnessLevelLabels] || 'Iniciante';

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
            <br />
            <span className="font-semibold">Nível de Condicionamento: {currentFitnessLabel}</span>
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
            Conquistas para {currentFitnessLabel} ({unlockedAchievements.length}/{achievements.length})
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
            <br />
            <span className="text-sm font-medium">Conquistas adaptadas ao seu nível: {currentFitnessLabel}</span>
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
