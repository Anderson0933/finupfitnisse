
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
  Dumbbell,
  CheckCircle2,
  Lock,
  User,
  Medal,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { GamificationManager } from './GamificationPersistentManager';

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
  category: 'workout' | 'streak' | 'level' | 'special';
  fitnessCategory?: 'iniciante' | 'intermediario' | 'avancado' | 'all';
}

const GamificationSection = ({ user }: GamificationSectionProps) => {
  const [userXP, setUserXP] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [bestStreak, setBestStreak] = useState(0);
  const [fitnessCategory, setFitnessCategory] = useState<'iniciante' | 'intermediario' | 'avancado'>('iniciante');
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const levels: UserLevel[] = [
    { level: 1, title: 'Iniciante', xpRequired: 0, color: 'bg-gray-100 text-gray-800', icon: <User className="h-4 w-4" /> },
    { level: 2, title: 'Guerreiro', xpRequired: 100, color: 'bg-green-100 text-green-800', icon: <Target className="h-4 w-4" /> },
    { level: 3, title: 'Atleta', xpRequired: 300, color: 'bg-blue-100 text-blue-800', icon: <Dumbbell className="h-4 w-4" /> },
    { level: 4, title: 'Veterano', xpRequired: 600, color: 'bg-purple-100 text-purple-800', icon: <Star className="h-4 w-4" /> },
    { level: 5, title: 'Mestre', xpRequired: 1000, color: 'bg-orange-100 text-orange-800', icon: <Award className="h-4 w-4" /> },
    { level: 6, title: 'Lenda', xpRequired: 1500, color: 'bg-yellow-100 text-yellow-800', icon: <Crown className="h-4 w-4" /> },
  ];

  const getAchievementsByCategory = (category: typeof fitnessCategory): Achievement[] => {
    const baseAchievements: Achievement[] = [
      {
        id: 'first-workout',
        title: 'Primeiro Passo',
        description: 'Complete seu primeiro treino',
        icon: <Dumbbell className="h-6 w-6 text-blue-600" />,
        xpReward: 50,
        unlocked: unlockedAchievements.includes('first-workout'),
        category: 'workout',
        fitnessCategory: 'all'
      },
      {
        id: 'streak-3',
        title: 'Consistência',
        description: 'Mantenha uma sequência de 3 dias',
        icon: <Flame className="h-6 w-6 text-orange-600" />,
        xpReward: 75,
        unlocked: unlockedAchievements.includes('streak-3'),
        category: 'streak',
        fitnessCategory: 'all'
      },
      {
        id: 'workout-10',
        title: category === 'iniciante' ? 'Dedicação Iniciante' : category === 'intermediario' ? 'Força Intermediária' : 'Potência Avançada',
        description: category === 'iniciante' ? 'Complete 10 treinos básicos' : category === 'intermediario' ? 'Complete 10 treinos intermediários' : 'Complete 10 treinos avançados',
        icon: <Trophy className="h-6 w-6 text-yellow-600" />,
        xpReward: category === 'iniciante' ? 100 : category === 'intermediario' ? 150 : 200,
        unlocked: unlockedAchievements.includes('workout-10'),
        category: 'workout',
        fitnessCategory: category
      },
      {
        id: 'streak-7',
        title: 'Força de Vontade',
        description: 'Sequência de 7 dias consecutivos',
        icon: <Star className="h-6 w-6 text-purple-600" />,
        xpReward: 150,
        unlocked: unlockedAchievements.includes('streak-7'),
        category: 'streak',
        fitnessCategory: 'all'
      },
      {
        id: 'workout-25',
        title: category === 'iniciante' ? 'Guerreiro Novato' : category === 'intermediario' ? 'Atleta Dedicado' : 'Mestre da Disciplina',
        description: category === 'iniciante' ? 'Complete 25 treinos básicos' : category === 'intermediario' ? 'Complete 25 treinos intermediários' : 'Complete 25 treinos avançados',
        icon: <Medal className="h-6 w-6 text-green-600" />,
        xpReward: category === 'iniciante' ? 200 : category === 'intermediario' ? 300 : 400,
        unlocked: unlockedAchievements.includes('workout-25'),
        category: 'workout',
        fitnessCategory: category
      },
      {
        id: 'workout-50',
        title: category === 'iniciante' ? 'Determinação Total' : category === 'intermediario' ? 'Elite Fitness' : 'Lenda Viva',
        description: category === 'iniciante' ? 'Complete 50 treinos básicos' : category === 'intermediario' ? 'Complete 50 treinos intermediários' : 'Complete 50 treinos avançados',
        icon: <Crown className="h-6 w-6 text-gold-600" />,
        xpReward: category === 'iniciante' ? 400 : category === 'intermediario' ? 600 : 800,
        unlocked: unlockedAchievements.includes('workout-50'),
        category: 'workout',
        fitnessCategory: category
      },
      {
        id: 'streak-30',
        title: 'Imparável',
        description: 'Mantenha 30 dias de atividade',
        icon: <Flame className="h-6 w-6 text-red-600" />,
        xpReward: 500,
        unlocked: unlockedAchievements.includes('streak-30'),
        category: 'streak',
        fitnessCategory: 'all'
      }
    ];

    return baseAchievements.filter(achievement => 
      achievement.fitnessCategory === 'all' || achievement.fitnessCategory === category
    );
  };

  useEffect(() => {
    const loadGamificationData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Buscar dados de gamificação persistentes
        let gamificationData = await GamificationManager.getUserGamificationData(user.id);
        
        if (!gamificationData) {
          // Se não existe, criar baseado no perfil atual
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('fitness_level')
            .eq('user_id', user.id)
            .maybeSingle();
          
          gamificationData = await GamificationManager.initializeUserGamification(
            user.id, 
            userProfile?.fitness_level || 'iniciante'
          );
        }

        // Atualizar estados
        setUserXP(gamificationData.total_xp);
        setCurrentStreak(gamificationData.current_streak);
        setTotalWorkouts(gamificationData.total_workouts_completed);
        setCurrentLevel(gamificationData.current_level);
        setBestStreak(gamificationData.best_streak);
        setFitnessCategory(gamificationData.fitness_category);
        setUnlockedAchievements(gamificationData.achievements_unlocked);

      } catch (error) {
        console.error('Erro ao carregar dados de gamificação:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGamificationData();
  }, [user]);

  const getCurrentLevel = (xp: number): UserLevel => {
    return levels.slice().reverse().find(level => xp >= level.xpRequired) || levels[0];
  };

  const getNextLevel = (xp: number): UserLevel | null => {
    return levels.find(level => xp < level.xpRequired) || null;
  };

  const currentLevelData = getCurrentLevel(userXP);
  const nextLevel = getNextLevel(userXP);
  const progressToNext = nextLevel ? ((userXP - currentLevelData.xpRequired) / (nextLevel.xpRequired - currentLevelData.xpRequired)) * 100 : 100;

  const achievements = getAchievementsByCategory(fitnessCategory);
  const unlockedList = achievements.filter(a => a.unlocked);
  const lockedList = achievements.filter(a => !a.unlocked);

  const getCategoryDisplay = (category: typeof fitnessCategory) => {
    switch (category) {
      case 'iniciante': return { name: 'Iniciante', color: 'text-green-600', emoji: '🌱' };
      case 'intermediario': return { name: 'Intermediário', color: 'text-blue-600', emoji: '💪' };
      case 'avancado': return { name: 'Avançado', color: 'text-red-600', emoji: '🔥' };
    }
  };

  const categoryDisplay = getCategoryDisplay(fitnessCategory);

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
            Sistema de Conquistas {categoryDisplay.emoji}
          </CardTitle>
          <CardDescription className="text-yellow-700 text-sm md:text-base">
            Conquiste XP, desbloqueie conquistas e suba de nível! Categoria atual: <span className={`font-bold ${categoryDisplay.color}`}>{categoryDisplay.name}</span>
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-blue-800 font-bold text-lg">{userXP}</p>
                <p className="text-blue-600 text-xs">XP Total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Flame className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-orange-800 font-bold text-lg">{currentStreak}</p>
                <p className="text-orange-600 text-xs">Sequência</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <Dumbbell className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-green-800 font-bold text-lg">{totalWorkouts}</p>
                <p className="text-green-600 text-xs">Treinos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Trophy className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-purple-800 font-bold text-lg">{bestStreak}</p>
                <p className="text-purple-600 text-xs">Melhor Seq.</p>
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
            Conquistas {categoryDisplay.name} ({unlockedList.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Unlocked Achievements */}
            {unlockedList.length > 0 && (
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Desbloqueadas
                </h4>
                <div className="grid gap-3">
                  {unlockedList.map((achievement) => (
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
            {lockedList.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Próximas Conquistas
                </h4>
                <div className="grid gap-3">
                  {lockedList.map((achievement) => (
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

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-md">
        <CardContent className="p-6 text-center">
          <HelpCircle className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-blue-800 mb-2">Conquistas Persistentes!</h3>
          <p className="text-blue-600 text-sm mb-4">
            Suas conquistas e XP são permanentes! Mesmo criando novos planos de treino, seu progresso é mantido e se adapta ao seu nível atual.
          </p>
          <div className="flex justify-center">
            <Badge className={`${categoryDisplay.color} bg-opacity-20 px-3 py-1`}>
              {categoryDisplay.emoji} Categoria: {categoryDisplay.name}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamificationSection;
