
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Flame, Star, Crown, Award, Plus, Calendar, Timer } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChallengeCard from './challenges/ChallengeCard';
import AchievementCard from './challenges/AchievementCard';
import UserStats from './challenges/UserStats';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'workout' | 'nutrition' | 'general';
  target_value: number;
  target_unit: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  start_date: string;
  end_date: string;
  is_active: boolean;
  progress?: {
    current_progress: number;
    is_completed: boolean;
  };
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
}

interface UserStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  best_streak: number;
  total_workouts_completed: number;
  achievements_unlocked: string[];
}

interface ChallengeCenterProps {
  user: User | null;
}

const ChallengeCenter = ({ user }: ChallengeCenterProps) => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Carregar desafios ativos
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Carregar progresso do usuário nos desafios
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Combinar desafios com progresso
      const challengesWithProgress = challengesData?.map(challenge => ({
        ...challenge,
        progress: progressData?.find(p => p.challenge_id === challenge.id) || {
          current_progress: 0,
          is_completed: false
        }
      })) || [];

      setChallenges(challengesWithProgress);

      // Carregar conquistas
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .order('xp_reward', { ascending: false });

      if (achievementsError) throw achievementsError;

      // Carregar conquistas desbloqueadas pelo usuário
      const { data: userAchievements, error: userAchievementsError } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (userAchievementsError) throw userAchievementsError;

      // Combinar conquistas com status de desbloqueio
      const achievementsWithStatus = achievementsData?.map(achievement => ({
        ...achievement,
        unlocked_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
      })) || [];

      setAchievements(achievementsWithStatus);

      // Carregar estatísticas do usuário
      const { data: statsData, error: statsError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (statsError && statsError.code !== 'PGRST116') throw statsError;

      if (!statsData) {
        // Criar entrada inicial para gamificação
        const { data: newStats, error: createError } = await supabase
          .from('user_gamification')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (createError) throw createError;
        setUserStats(newStats);
      } else {
        setUserStats(statsData);
      }

    } catch (error: any) {
      console.error('Erro ao carregar dados do centro de desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChallengeProgress = async (challengeId: string, increment: number = 1) => {
    if (!user) return;

    try {
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const currentProgress = challenge.progress?.current_progress || 0;
      const newProgress = Math.min(currentProgress + increment, challenge.target_value);
      const isCompleted = newProgress >= challenge.target_value;

      // Upsert progresso do desafio
      const { error } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        });

      if (error) throw error;

      if (isCompleted) {
        toast({
          title: "🎉 Desafio Concluído!",
          description: `Você ganhou ${challenge.xp_reward} XP!`,
        });
      }

      // Recarregar dados
      await loadData();

    } catch (error: any) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const activeChallenges = challenges.filter(c => !c.progress?.is_completed);
  const completedChallenges = challenges.filter(c => c.progress?.is_completed);
  const unlockedAchievements = achievements.filter(a => a.unlocked_at);
  const lockedAchievements = achievements.filter(a => !a.unlocked_at);

  return (
    <div className="space-y-6">
      {/* Header com estatísticas do usuário */}
      <UserStats userStats={userStats} />

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Desafios
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Ranking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {/* Desafios Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Desafios Ativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onUpdateProgress={updateChallengeProgress}
                      getDifficultyColor={getDifficultyColor}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Todos os desafios foram concluídos! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Desafios Concluídos */}
          {completedChallenges.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Desafios Concluídos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      onUpdateProgress={updateChallengeProgress}
                      getDifficultyColor={getDifficultyColor}
                      completed
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          {/* Conquistas Desbloqueadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Conquistas Desbloqueadas ({unlockedAchievements.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {unlockedAchievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {unlockedAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      getRarityColor={getRarityColor}
                      unlocked
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Complete desafios para desbloquear conquistas!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conquistas Bloqueadas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gray-400" />
                Conquistas Bloqueadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    getRarityColor={getRarityColor}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Ranking Global
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Ranking em desenvolvimento...</p>
                <p className="text-sm">Em breve você poderá competir com outros usuários!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeCenter;
