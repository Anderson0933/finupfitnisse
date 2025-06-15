
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Flame, Target, TrendingUp } from 'lucide-react';

interface UserStatsData {
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  total_workouts_completed: number;
  achievements_unlocked: string[];
}

interface UserStatsProps {
  userStats: UserStatsData | null;
}

const UserStats = ({ userStats }: UserStatsProps) => {
  if (!userStats) return null;

  // Calcular XP necessário para o próximo nível
  const getXPForNextLevel = (level: number) => level * 100;
  const currentLevelXP = getXPForNextLevel(userStats.current_level - 1);
  const nextLevelXP = getXPForNextLevel(userStats.current_level);
  const progressToNextLevel = ((userStats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Nível e XP */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Nível {userStats.current_level}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Total</span>
              <span className="font-semibold">{userStats.total_xp}</span>
            </div>
            <Progress 
              value={Math.min(progressToNextLevel, 100)} 
              className="h-2 bg-blue-300" 
            />
            <div className="text-xs opacity-90">
              {Math.max(0, nextLevelXP - userStats.total_xp)} XP para nível {userStats.current_level + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sequência Atual */}
      <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-5 w-5" />
            Sequência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.current_streak}</div>
            <div className="text-sm opacity-90">dias consecutivos</div>
            <div className="text-xs mt-2 opacity-75">
              Recorde: {userStats.best_streak} dias
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treinos Completados */}
      <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="h-5 w-5" />
            Treinos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.total_workouts_completed}</div>
            <div className="text-sm opacity-90">completados</div>
            <div className="text-xs mt-2 opacity-75">
              Continue assim! 💪
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conquistas */}
      <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5" />
            Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold">{userStats.achievements_unlocked.length}</div>
            <div className="text-sm opacity-90">desbloqueadas</div>
            <div className="text-xs mt-2 opacity-75">
              Colete todas! 🏆
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserStats;
