
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, ThumbsUp, TrendingUp } from 'lucide-react';

interface CommunityStatsData {
  totalPosts: number;
  totalReplies: number;
  totalLikes: number;
  activeUsers: number;
  todayPosts: number;
  weekGrowth: number;
}

const CommunityStats = () => {
  const [stats, setStats] = useState<CommunityStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Buscar estatísticas básicas
      const [postsResult, repliesResult, likesResult] = await Promise.all([
        supabase.from('forum_posts').select('id', { count: 'exact', head: true }),
        supabase.from('forum_replies').select('id', { count: 'exact', head: true }),
        supabase.from('forum_post_likes').select('id', { count: 'exact', head: true })
      ]);

      // Posts de hoje
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      
      const { count: todayPostsCount } = await supabase
        .from('forum_posts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', todayStart.toISOString());

      // Usuários únicos que postaram nos últimos 7 dias
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const { data: activeUsersData } = await supabase
        .from('forum_posts')
        .select('user_id')
        .gte('created_at', weekAgo.toISOString());

      const uniqueActiveUsers = new Set(activeUsersData?.map(p => p.user_id) || []).size;

      setStats({
        totalPosts: postsResult.count || 0,
        totalReplies: repliesResult.count || 0,
        totalLikes: likesResult.count || 0,
        activeUsers: uniqueActiveUsers,
        todayPosts: todayPostsCount || 0,
        weekGrowth: 12 // Placeholder - seria calculado comparando com semana anterior
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Estatísticas da Comunidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: 'Total de Posts',
      value: stats.totalPosts,
      icon: MessageSquare,
      color: 'text-blue-600'
    },
    {
      label: 'Respostas',
      value: stats.totalReplies,
      icon: Users,
      color: 'text-green-600'
    },
    {
      label: 'Curtidas',
      value: stats.totalLikes,
      icon: ThumbsUp,
      color: 'text-red-600'
    },
    {
      label: 'Usuários Ativos',
      value: stats.activeUsers,
      icon: TrendingUp,
      color: 'text-purple-600'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Estatísticas da Comunidade</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="text-center">
                <div className={`flex items-center justify-center mb-2 ${item.color}`}>
                  <Icon className="h-5 w-5 mr-1" />
                  <span className="text-2xl font-bold">{item.value}</span>
                </div>
                <p className="text-sm text-gray-600">{item.label}</p>
              </div>
            );
          })}
        </div>
        
        {stats.todayPosts > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-center text-gray-600">
              <span className="font-semibold text-green-600">{stats.todayPosts}</span> novos posts hoje
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommunityStats;
