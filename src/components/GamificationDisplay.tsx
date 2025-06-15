
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Trophy, Star, Flame, Award, Target, TrendingUp, Zap } from 'lucide-react';

interface GamificationData {
  user_id: string;
  total_xp: number;
  current_level: number;
  total_workouts_completed: number;
  current_streak: number;
  best_streak: number;
  achievements_unlocked: string[];
  fitness_category: string;
  last_activity_date?: string;
}

interface GamificationDisplayProps {
  user: User | null;
}

const ACHIEVEMENTS = {
  'first_workout': { 
    name: 'Primeiro Passo', 
    description: 'Complete seu primeiro treino', 
    icon: Star,
    color: 'bg-yellow-500'
  },
  'streak_3': { 
    name: 'Consistência', 
    description: '3 dias consecutivos', 
    icon: Flame,
    color: 'bg-orange-500'
  },
  'streak_7': { 
    name: 'Guerreiro', 
    description: '7 dias consecutivos', 
    icon: Trophy,
    color: 'bg-red-500'
  },
  'streak_30': { 
    name: 'Lenda', 
    description: '30 dias consecutivos', 
    icon: Award,
    color: 'bg-purple-500'
  },
  'workouts_10': { 
    name: 'Dedicado', 
    description: '10 treinos completos', 
    icon: Target,
    color: 'bg-blue-500'
  },
  'workouts_50': { 
    name: 'Atleta', 
    description: '50 treinos completos', 
    icon: TrendingUp,
    color: 'bg-green-500'
  },
  'level_5': { 
    name: 'Evoluindo', 
    description: 'Alcance o nível 5', 
    icon: Zap,
    color: 'bg-indigo-500'
  }
};

const LEVELS_XP = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];

const GamificationDisplay: React.FC<GamificationDisplayProps> = ({ user }) => {
  const [gamificationData, setGamificationData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchGamificationData();
  }, [user]);

  const fetchGamificationData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar dados de gamificação:', error);
        return;
      }

      if (!data) {
        // Criar registro inicial se não existir
        const { data: newData, error: createError } = await supabase
          .from('user_gamification')
          .insert({
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            total_workouts_completed: 0,
            current_streak: 0,
            best_streak: 0,
            achievements_unlocked: [],
            fitness_category: 'iniciante'
          })
          .select()
          .single();

        if (createError) {
          console.error('Erro ao criar dados de gamificação:', createError);
          return;
        }

        setGamificationData(newData);
      } else {
        setGamificationData(data);
      }
    } catch (error) {
      console.error('Erro inesperado:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevelProgress = () => {
    if (!gamificationData) return { progress: 0, xpNeeded: 100, xpForNext: 100 };

    const currentLevel = gamificationData.current_level;
    const currentXP = gamificationData.total_xp;
    
    const xpForCurrentLevel = LEVELS_XP[currentLevel - 1] || 0;
    const xpForNextLevel = LEVELS_XP[currentLevel] || LEVELS_XP[LEVELS_XP.length - 1];
    
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const xpNeededForNext = xpForNextLevel - xpForCurrentLevel;
    
    const progress = Math.min(100, (xpInCurrentLevel / xpNeededForNext) * 100);
    
    return {
      progress,
      xpNeeded: xpNeededForNext - xpInCurrentLevel,
      xpForNext: xpForNextLevel
    };
  };

  const getFitnessLevelInfo = (category: string) => {
    const levels = {
      'iniciante': { name: 'Iniciante', color: 'bg-gray-500', description: 'Começando a jornada' },
      'intermediario': { name: 'Intermediário', color: 'bg-blue-500', description: 'Progredindo bem' },
      'avancado': { name: 'Avançado', color: 'bg-green-500', description: 'Nível experiente' },
      'atleta': { name: 'Atleta', color: 'bg-purple-500', description: 'Performance de elite' }
    };
    return levels[category as keyof typeof levels] || levels.iniciante;
  };

  if (loading) {
    return (
      <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gamificationData) {
    return (
      <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <p className="text-gray-600">Dados de gamificação não disponíveis</p>
        </CardContent>
      </Card>
    );
  }

  const { progress, xpNeeded } = getCurrentLevelProgress();
  const fitnessLevel = getFitnessLevelInfo(gamificationData.fitness_category);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Nível e XP */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Nível {gamificationData.current_level}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-600">XP: {gamificationData.total_xp}</span>
              <Badge className={`${fitnessLevel.color} text-white`}>
                {fitnessLevel.name}
              </Badge>
            </div>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-blue-600">
              {xpNeeded} XP para o próximo nível
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Sequência Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="text-3xl font-bold text-orange-600">
              {gamificationData.current_streak} dias
            </div>
            <div className="text-sm text-orange-600">
              Melhor: {gamificationData.best_streak} dias
            </div>
            <div className="w-full bg-orange-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (gamificationData.current_streak / 30) * 100)}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-green-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Estatísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-green-600">Treinos:</span>
              <span className="font-semibold text-green-800">
                {gamificationData.total_workouts_completed}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-600">Categoria:</span>
              <span className="font-semibold text-green-800">
                {fitnessLevel.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-green-600">Conquistas:</span>
              <span className="font-semibold text-green-800">
                {gamificationData.achievements_unlocked.length}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      {gamificationData.achievements_unlocked.length > 0 && (
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-lg md:col-span-2 lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold text-purple-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-500" />
              Conquistas Desbloqueadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gamificationData.achievements_unlocked.map((achievementId) => {
                const achievement = ACHIEVEMENTS[achievementId as keyof typeof ACHIEVEMENTS];
                if (!achievement) return null;

                const IconComponent = achievement.icon;
                
                return (
                  <div 
                    key={achievementId}
                    className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm border border-purple-200 hover:shadow-md transition-shadow"
                  >
                    <div className={`p-2 rounded-full ${achievement.color}`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-purple-800 truncate">
                        {achievement.name}
                      </p>
                      <p className="text-xs text-purple-600 truncate">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationDisplay;
