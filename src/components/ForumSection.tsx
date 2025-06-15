
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, MessageSquare, ThumbsUp, Clock, Pin, Users, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import CreatePostDialog from '@/components/CreatePostDialog';
import PostDetail from '@/components/PostDetail';
import UserBadge from '@/components/UserBadge';
import TrendingTopics from '@/components/TrendingTopics';
import CommunityStats from '@/components/CommunityStats';

interface ForumCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category_id: string;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  is_closed: boolean;
  created_at: string;
  updated_at: string;
  category: ForumCategory;
  user_email?: string;
}

interface ForumSectionProps {
  user: User | null;
}

const ForumSection = ({ user }: ForumSectionProps) => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'replies'>('recent');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
    loadPosts();
  }, []);

  useEffect(() => {
    filterAndSortPosts();
  }, [posts, selectedCategory, searchTerm, sortBy]);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar categorias",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('forum_posts')
        .select(`
          *,
          forum_categories (
            id,
            name,
            description,
            icon,
            color
          )
        `)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const userIds = [...new Set((postsData || []).map(post => post.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const postsWithUsers = (postsData || []).map(post => ({
        ...post,
        category: post.forum_categories,
        user_email: profilesData?.find(p => p.id === post.user_id)?.full_name || 'Usuário anônimo'
      }));

      setPosts(postsWithUsers);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortPosts = () => {
    let filtered = posts;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category_id === selectedCategory);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower) ||
        post.user_email?.toLowerCase().includes(searchLower)
      );
    }

    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'replies':
        filtered.sort((a, b) => b.replies_count - a.replies_count);
        break;
      default:
        filtered.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
    }

    setFilteredPosts(filtered);
  };

  const handlePostCreated = () => {
    loadPosts();
    setShowCreatePost(false);
    toast({
      title: "Post criado com sucesso!",
      description: "Seu post foi publicado no fórum."
    });
  };

  const getCategoryIcon = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'Dumbbell': <MessageSquare className="h-4 w-4" />,
      'Apple': <MessageSquare className="h-4 w-4" />,
      'Heart': <MessageSquare className="h-4 w-4" />,
      'Settings': <MessageSquare className="h-4 w-4" />,
      'HelpCircle': <MessageSquare className="h-4 w-4" />
    };
    return icons[iconName] || <MessageSquare className="h-4 w-4" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Agora há pouco';
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return 'Ontem';
    return date.toLocaleDateString('pt-BR');
  };

  const getUserBadges = (post: ForumPost) => {
    const badges = [];
    if (post.likes_count >= 50) badges.push('expert');
    if (post.replies_count >= 20) badges.push('popular');
    return badges;
  };

  if (selectedPost) {
    return (
      <PostDetail 
        post={selectedPost}
        user={user}
        onBack={() => setSelectedPost(null)}
        onPostUpdated={loadPosts}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header do Fórum */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="h-6 w-6" />
                Fórum da Comunidade
              </CardTitle>
              <CardDescription className="text-purple-100">
                Compartilhe experiências, tire dúvidas e conecte-se com outros membros
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowCreatePost(true)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Post
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Abas principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="stats">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-6">
          {/* Filtros e Busca */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar posts, usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Badge 
                    variant={selectedCategory === 'all' ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory('all')}
                  >
                    Todas
                  </Badge>
                  {categories.map((category) => (
                    <Badge
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      className="cursor-pointer"
                      style={{ 
                        backgroundColor: selectedCategory === category.id ? category.color : 'transparent',
                        borderColor: category.color 
                      }}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                    </Badge>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant={sortBy === 'recent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('recent')}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Recentes
                  </Button>
                  <Button
                    variant={sortBy === 'popular' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('popular')}
                  >
                    <ThumbsUp className="h-4 w-4 mr-1" />
                    Populares
                  </Button>
                  <Button
                    variant={sortBy === 'replies' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSortBy('replies')}
                  >
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Mais Comentados
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Posts */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando posts...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Nenhum post encontrado</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedCategory !== 'all' 
                      ? 'Tente ajustar os filtros ou criar um novo post.'
                      : 'Seja o primeiro a criar um post na comunidade!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6" onClick={() => setSelectedPost(post)}>
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          {post.is_pinned && (
                            <Pin className="h-4 w-4 text-orange-500" />
                          )}
                          <Badge 
                            style={{ backgroundColor: post.category.color }}
                            className="text-white"
                          >
                            {getCategoryIcon(post.category.icon)}
                            <span className="ml-1">{post.category.name}</span>
                          </Badge>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-600">{post.user_email}</span>
                          
                          {/* Badges do usuário */}
                          {getUserBadges(post).map((badgeType, index) => (
                            <UserBadge key={index} type={badgeType as any} size="sm" />
                          ))}
                          
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 line-clamp-2 mb-3">
                          {post.content.substring(0, 200)}...
                        </p>

                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{post.replies_count}</span>
                          </div>
                          {post.is_closed && (
                            <Badge variant="outline" className="text-xs">
                              Fechado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TrendingTopics />
            <CommunityStats />
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <CommunityStats />
        </TabsContent>
      </Tabs>

      {/* Dialog para criar post */}
      <CreatePostDialog
        isOpen={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onPostCreated={handlePostCreated}
        categories={categories}
        user={user}
      />
    </div>
  );
};

export default ForumSection;
