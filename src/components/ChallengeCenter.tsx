import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Flame, Star, Clock } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ChallengeCard from './challenges/ChallengeCard';
import ChallengeHistory from './challenges/ChallengeHistory';
import AchievementCard from './challenges/AchievementCard';
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

interface UserStatsData {
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
  const [userStats, setUserStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges');
  const [updating, setUpdating] = useState(false);
  const [lastRequestDate, setLastRequestDate] = useState<string | null>(null);
  const { toast } = useToast();

  const ensureUserGamification = async () => {
    if (!user) return null;

    try {
      const { data: existing, error: selectError } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (!existing) {
        console.log('Criando entrada de gamificação para o usuário');
        const { data: newStats, error: insertError } = await supabase
          .from('user_gamification')
          .insert({ 
            user_id: user.id,
            total_xp: 0,
            current_level: 1,
            current_streak: 0,
            best_streak: 0,
            total_workouts_completed: 0,
            achievements_unlocked: []
          })
          .select()
          .single();

        if (insertError) throw insertError;
        return newStats;
      }

      return existing;
    } catch (error: any) {
      console.error('Erro ao garantir entrada de gamificação:', error);
      throw error;
    }
  };

  const calculateLevel = (totalXP: number) => {
    return Math.floor(totalXP / 100) + 1;
  };

  const loadData = async () => {
    if (!user || updating) return;

    try {
      console.log('🔄 Carregando dados do centro de desafios...');

      // Garantir que o usuário tenha entrada na tabela de gamificação
      const gamificationData = await ensureUserGamification();

      // Buscar a última data de solicitação de desafios
      const { data: lastRequest, error: lastRequestError } = await supabase
        .from('user_gamification')
        .select('last_challenge_request')
        .eq('user_id', user.id)
        .single();

      if (!lastRequestError && lastRequest) {
        setLastRequestDate(lastRequest.last_challenge_request);
      }

      // Carregar apenas desafios ativos e relevantes para o usuário
      // Buscar desafios gerais (sem created_for_user) ou específicos para este usuário
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .or(`created_for_user.is.null,created_for_user.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (challengesError) throw challengesError;

      // Carregar progresso do usuário nos desafios
      const { data: progressData, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('*')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      // Combinar desafios com progresso e garantir tipos corretos
      let challengesWithProgress: Challenge[] = challengesData?.map(challenge => ({
        ...challenge,
        type: challenge.type as 'daily' | 'weekly' | 'monthly',
        category: challenge.category as 'workout' | 'nutrition' | 'general',
        difficulty: challenge.difficulty as 'easy' | 'medium' | 'hard',
        progress: progressData?.find(p => p.challenge_id === challenge.id) || {
          current_progress: 0,
          is_completed: false
        }
      })) || [];

      // Filtrar duplicatas por título e categoria (manter o mais recente)
      const uniqueChallenges = challengesWithProgress.reduce((acc, current) => {
        const key = `${current.title}-${current.category}`;
        const existing = acc.find(item => `${item.title}-${item.category}` === key);
        
        if (!existing) {
          acc.push(current);
        } else {
          // Se já existe, manter o mais recente
          if (new Date(current.created_at) > new Date(existing.created_at)) {
            const index = acc.findIndex(item => `${item.title}-${item.category}` === key);
            acc[index] = current;
          }
        }
        
        return acc;
      }, [] as Challenge[]);

      setChallenges(uniqueChallenges);

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

      // Combinar conquistas com status de desbloqueio e garantir tipos corretos
      const achievementsWithStatus: Achievement[] = achievementsData?.map(achievement => ({
        ...achievement,
        rarity: achievement.rarity as 'common' | 'rare' | 'epic' | 'legendary',
        unlocked_at: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at
      })) || [];

      setAchievements(achievementsWithStatus);

      // Carregar estatísticas do usuário (com nível calculado automaticamente)
      if (gamificationData) {
        const calculatedLevel = calculateLevel(gamificationData.total_xp);
        
        // Se o nível calculado for diferente do armazenado, atualizar
        if (calculatedLevel !== gamificationData.current_level) {
          const { data: updatedStats, error: updateError } = await supabase
            .from('user_gamification')
            .update({ current_level: calculatedLevel })
            .eq('user_id', user.id)
            .select()
            .single();

          if (updateError) {
            console.error('Erro ao atualizar nível:', updateError);
            setUserStats({ ...gamificationData, current_level: calculatedLevel });
          } else {
            setUserStats(updatedStats);
          }
        } else {
          setUserStats(gamificationData);
        }
      }

      console.log('✅ Dados carregados com sucesso');

    } catch (error: any) {
      console.error('Erro ao carregar dados do centro de desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (user && !loading) return;
    
    const initializeData = async () => {
      await loadData();
      setLoading(false);
    };

    if (user) {
      initializeData();
    }
  }, [user]);

  const updateChallengeProgress = async (challengeId: string, increment: number = 1) => {
    if (!user || updating) return;

    try {
      setUpdating(true);
      
      const challenge = challenges.find(c => c.id === challengeId);
      if (!challenge) return;

      const currentProgress = challenge.progress?.current_progress || 0;
      const newProgress = Math.min(currentProgress + increment, challenge.target_value);
      const isCompleted = newProgress >= challenge.target_value;
      const wasAlreadyCompleted = challenge.progress?.is_completed || false;

      console.log('🎯 Atualizando progresso do desafio:', {
        challengeId,
        challengeTitle: challenge.title,
        currentProgress,
        newProgress,
        isCompleted,
        wasAlreadyCompleted,
        xpReward: challenge.xp_reward
      });

      // Atualizar progresso do desafio
      const { error: progressError } = await supabase
        .from('user_challenge_progress')
        .upsert({
          user_id: user.id,
          challenge_id: challengeId,
          current_progress: newProgress,
          is_completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,challenge_id'
        });

      if (progressError) {
        console.error('❌ Erro ao atualizar progresso:', progressError);
        throw progressError;
      }

      console.log('✅ Progresso do desafio atualizado com sucesso');

      // Se o desafio foi completado agora
      if (isCompleted && !wasAlreadyCompleted) {
        console.log('🎉 Desafio completado! Atualizando XP...');
        
        // Buscar XP atual e atualizar
        const { data: currentStats, error: statsError } = await supabase
          .from('user_gamification')
          .select('total_xp, current_level')
          .eq('user_id', user.id)
          .single();

        if (statsError) {
          console.error('❌ Erro ao buscar XP atual:', statsError);
        } else {
          const newTotalXP = currentStats.total_xp + challenge.xp_reward;
          const newLevel = calculateLevel(newTotalXP);

          console.log(`💰 Atualizando XP: ${currentStats.total_xp} + ${challenge.xp_reward} = ${newTotalXP}`);

          const { error: updateXPError } = await supabase
            .from('user_gamification')
            .update({ 
              total_xp: newTotalXP,
              current_level: newLevel,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);

          if (updateXPError) {
            console.error('❌ Erro ao atualizar XP:', updateXPError);
            toast({
              title: "Aviso",
              description: "Desafio completado, mas houve erro ao atualizar XP.",
              variant: "destructive"
            });
          } else {
            console.log(`✅ XP atualizado com sucesso! Novo nível: ${newLevel}`);
            
            const levelUp = newLevel > currentStats.current_level;
            
            toast({
              title: "🎉 Desafio Concluído!",
              description: `+${challenge.xp_reward} XP conquistado!${levelUp ? ` Subiu para nível ${newLevel}!` : ''}`,
            });
          }
        }
      } else if (!isCompleted) {
        toast({
          title: "Progresso Atualizado!",
          description: `${newProgress}/${challenge.target_value} ${challenge.target_unit}`,
        });
      }

      // Recarregar apenas os dados necessários
      await loadData();

    } catch (error: any) {
      console.error('❌ Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
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

  const canRequestNewChallenges = () => {
    if (!lastRequestDate) return true;
    
    const today = new Date().toISOString().split('T')[0];
    const lastRequest = new Date(lastRequestDate).toISOString().split('T')[0];
    
    return today !== lastRequest;
  };

  const getNextAvailableTime = () => {
    if (!lastRequestDate) return null;
    
    const lastRequest = new Date(lastRequestDate);
    const nextAvailable = new Date(lastRequest);
    nextAvailable.setDate(nextAvailable.getDate() + 1);
    nextAvailable.setHours(0, 0, 0, 0);
    
    return nextAvailable;
  };

  const formatTimeUntilNext = () => {
    const nextTime = getNextAvailableTime();
    if (!nextTime) return '';
    
    const now = new Date();
    const diff = nextTime.getTime() - now.getTime();
    
    if (diff <= 0) return '';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const requestNewChallenges = async () => {
    if (!user || updating || !canRequestNewChallenges()) return;

    try {
      setUpdating(true);
      
      console.log('🎯 Solicitando novos desafios...');
      
      const { data, error } = await supabase.functions.invoke('generate-daily-challenges');
      
      if (error) {
        console.error('❌ Erro ao gerar novos desafios:', error);
        throw error;
      }
      
      console.log('✅ Novos desafios solicitados:', data);
      
      // Atualizar a data da última solicitação
      const today = new Date().toISOString();
      const { error: updateError } = await supabase
        .from('user_gamification')
        .update({ 
          last_challenge_request: today,
          updated_at: today
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Erro ao atualizar data da solicitação:', updateError);
      } else {
        setLastRequestDate(today);
      }
      
      toast({
        title: "Novos Desafios Gerados!",
        description: "Seus novos desafios estão disponíveis.",
      });
      
      // Recarregar dados
      await loadData();
      
    } catch (error: any) {
      console.error('❌ Erro ao solicitar novos desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar novos desafios.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
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

  // Calcular XP necessário para o próximo nível
  const getXPForNextLevel = (level: number) => level * 100;
  const currentLevelXP = userStats ? getXPForNextLevel(userStats.current_level - 1) : 0;
  const nextLevelXP = userStats ? getXPForNextLevel(userStats.current_level) : 100;
  const progressToNextLevel = userStats ? ((userStats.total_xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100 : 0;

  const canRequest = canRequestNewChallenges();
  const timeUntilNext = formatTimeUntilNext();

  return (
    <div className="space-y-6">
      {/* Header com apenas nível */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5" />
            Nível {userStats?.current_level || 1}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>XP Total</span>
              <span className="font-semibold">{userStats?.total_xp || 0}</span>
            </div>
            <Progress 
              value={Math.min(progressToNextLevel, 100)} 
              className="h-2 bg-blue-300" 
            />
            <div className="text-xs opacity-90">
              {Math.max(0, nextLevelXP - (userStats?.total_xp || 0))} XP para nível {(userStats?.current_level || 1) + 1}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Desafios
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challenges" className="space-y-6">
          {/* Desafios Ativos */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-500" />
                Desafios Ativos
              </CardTitle>
              {activeChallenges.length === 0 && (
                <div className="flex flex-col items-end gap-2">
                  <Button 
                    onClick={requestNewChallenges}
                    disabled={updating || !canRequest}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updating ? 'Gerando...' : canRequest ? 'Solicitar Novos Desafios' : 'Aguarde...'}
                  </Button>
                  {!canRequest && timeUntilNext && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      Disponível em {timeUntilNext}
                    </div>
                  )}
                </div>
              )}
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
                      disabled={updating}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Parabéns! Você completou todos os desafios! 🎉</p>
                  {canRequest ? (
                    <p className="text-sm mt-2">Clique no botão acima para solicitar novos desafios personalizados!</p>
                  ) : (
                    <p className="text-sm mt-2">Novos desafios estarão disponíveis em {timeUntilNext || 'breve'}!</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Desafios Concluídos - Componente Melhorado */}
          <ChallengeHistory
            completedChallenges={completedChallenges}
            onUpdateProgress={updateChallengeProgress}
            getDifficultyColor={getDifficultyColor}
            disabled={updating}
          />
        </TabsContent>

        {/* Conquistas */}
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
      </Tabs>
    </div>
  );
};

export default ChallengeCenter;
