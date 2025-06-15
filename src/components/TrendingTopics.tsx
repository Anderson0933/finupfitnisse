
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, ThumbsUp } from 'lucide-react';

interface TrendingTopic {
  id: string;
  title: string;
  category: string;
  category_color: string;
  replies_count: number;
  likes_count: number;
  activity_score: number;
}

const TrendingTopics = () => {
  const [topics, setTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingTopics();
  }, []);

  const loadTrendingTopics = async () => {
    try {
      // Buscar posts com mais atividade nas últimas 24h
      const { data, error } = await supabase
        .from('forum_posts')
        .select(`
          id,
          title,
          likes_count,
          replies_count,
          created_at,
          forum_categories (
            name,
            color
          )
        `)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('likes_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      const trendingTopics = (data || []).map(post => ({
        id: post.id,
        title: post.title,
        category: post.forum_categories?.name || 'Geral',
        category_color: post.forum_categories?.color || '#6B7280',
        replies_count: post.replies_count,
        likes_count: post.likes_count,
        activity_score: post.likes_count + (post.replies_count * 2)
      }));

      setTopics(trendingTopics);
    } catch (error) {
      console.error('Erro ao carregar trending topics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          Trending Topics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length === 0 ? (
          <p className="text-gray-600 text-sm">Nenhum trending topic ainda</p>
        ) : (
          <div className="space-y-3">
            {topics.map((topic, index) => (
              <div key={topic.id} className="border-b border-gray-100 pb-2 last:border-b-0">
                <div className="flex items-start gap-2">
                  <span className="text-sm font-bold text-orange-500 min-w-[20px]">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                      {topic.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Badge 
                        style={{ backgroundColor: topic.category_color }}
                        className="text-white text-xs px-2 py-0"
                      >
                        {topic.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span>{topic.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        <span>{topic.replies_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TrendingTopics;
