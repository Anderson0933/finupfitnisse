
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ThumbsUp, MessageSquare, Send, Pin, MoreHorizontal } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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

interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user_email?: string;
}

interface PostDetailProps {
  post: ForumPost;
  user: User | null;
  onBack: () => void;
  onPostUpdated: () => void;
}

const PostDetail = ({ post, user, onBack, onPostUpdated }: PostDetailProps) => {
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [newReply, setNewReply] = useState('');
  const [userLikedPost, setUserLikedPost] = useState(false);
  const [userLikedReplies, setUserLikedReplies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadReplies();
    if (user) {
      checkUserLikes();
    }
  }, [post.id, user]);

  const loadReplies = async () => {
    setLoading(true);
    try {
      const { data: repliesData, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Buscar informações dos usuários
      const userIds = [...new Set((repliesData || []).map(reply => reply.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', userIds);

      const repliesWithUsers = (repliesData || []).map(reply => ({
        ...reply,
        user_email: profilesData?.find(p => p.id === reply.user_id)?.full_name || 'Usuário anônimo'
      }));

      setReplies(repliesWithUsers);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar respostas",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkUserLikes = async () => {
    if (!user) return;

    try {
      // Verificar like no post
      const { data: postLike } = await supabase
        .from('forum_post_likes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', user.id)
        .maybeSingle();

      setUserLikedPost(!!postLike);

      // Verificar likes nas respostas
      const { data: replyLikes } = await supabase
        .from('forum_reply_likes')
        .select('reply_id')
        .eq('user_id', user.id)
        .in('reply_id', replies.map(r => r.id));

      const likedRepliesSet = new Set((replyLikes || []).map(like => like.reply_id));
      setUserLikedReplies(likedRepliesSet);
    } catch (error: any) {
      console.error('Erro ao verificar likes:', error);
    }
  };

  const handleLikePost = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir posts.",
        variant: "destructive"
      });
      return;
    }

    try {
      if (userLikedPost) {
        // Remover like
        await supabase
          .from('forum_post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setUserLikedPost(false);
      } else {
        // Adicionar like
        await supabase
          .from('forum_post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        setUserLikedPost(true);
      }
      
      onPostUpdated();
    } catch (error: any) {
      toast({
        title: "Erro ao curtir post",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLikeReply = async (replyId: string) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir respostas.",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = userLikedReplies.has(replyId);
      
      if (isLiked) {
        // Remover like
        await supabase
          .from('forum_reply_likes')
          .delete()
          .eq('reply_id', replyId)
          .eq('user_id', user.id);
        
        setUserLikedReplies(prev => {
          const newSet = new Set(prev);
          newSet.delete(replyId);
          return newSet;
        });
      } else {
        // Adicionar like
        await supabase
          .from('forum_reply_likes')
          .insert({
            reply_id: replyId,
            user_id: user.id
          });
        
        setUserLikedReplies(prev => new Set([...prev, replyId]));
      }
      
      loadReplies(); // Recarregar para atualizar contadores
    } catch (error: any) {
      toast({
        title: "Erro ao curtir resposta",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSubmitReply = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para responder.",
        variant: "destructive"
      });
      return;
    }

    if (!newReply.trim()) {
      toast({
        title: "Resposta vazia",
        description: "Por favor, escreva uma resposta.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('forum_replies')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newReply.trim()
        });

      if (error) throw error;

      setNewReply('');
      loadReplies();
      onPostUpdated();
      
      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada."
      });
    } catch (error: any) {
      toast({
        title: "Erro ao enviar resposta",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEditPost = user && user.id === post.user_id;

  return (
    <div className="space-y-6">
      {/* Header com botão voltar */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
      </div>

      {/* Post principal */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                {post.is_pinned && (
                  <Pin className="h-4 w-4 text-orange-500" />
                )}
                <Badge 
                  style={{ backgroundColor: post.category.color }}
                  className="text-white"
                >
                  {post.category.name}
                </Badge>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-600">{post.user_email}</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">{formatDate(post.created_at)}</span>
              </div>
              
              <CardTitle className="text-2xl">{post.title}</CardTitle>
            </div>
            
            {canEditPost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Editar</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="prose max-w-none mb-6">
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant={userLikedPost ? "default" : "outline"}
              size="sm"
              onClick={handleLikePost}
              className={userLikedPost ? "bg-red-500 hover:bg-red-600" : ""}
            >
              <ThumbsUp className="h-4 w-4 mr-1" />
              {post.likes_count}
            </Button>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MessageSquare className="h-4 w-4" />
              <span>{post.replies_count} respostas</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário para nova resposta */}
      {user && !post.is_closed && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Responder</h3>
            <div className="space-y-4">
              <Textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Escreva sua resposta..."
                className="min-h-[100px]"
                maxLength={3000}
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  {newReply.length}/3000 caracteres
                </p>
                <Button 
                  onClick={handleSubmitReply}
                  disabled={!newReply.trim() || submitting}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Enviando..." : "Responder"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de respostas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Respostas ({replies.length})
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando respostas...</p>
          </div>
        ) : replies.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Ainda não há respostas neste post.</p>
              {user && <p className="text-sm text-gray-500 mt-1">Seja o primeiro a responder!</p>}
            </CardContent>
          </Card>
        ) : (
          replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium">{reply.user_email}</span>
                    <span>•</span>
                    <span>{formatDate(reply.created_at)}</span>
                  </div>
                  
                  {user && user.id === reply.user_id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                
                <p className="whitespace-pre-wrap mb-4">{reply.content}</p>
                
                <Button
                  variant={userLikedReplies.has(reply.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLikeReply(reply.id)}
                  className={userLikedReplies.has(reply.id) ? "bg-red-500 hover:bg-red-600" : ""}
                >
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  {reply.likes_count}
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PostDetail;
