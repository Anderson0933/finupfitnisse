
import { supabase } from '@/integrations/supabase/client';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'forum_reply' | 'workout_reminder' | 'achievement';
  actionUrl?: string;
  metadata?: any;
}

export const createNotification = async ({
  userId,
  title,
  message,
  type = 'info',
  actionUrl,
  metadata = {}
}: CreateNotificationParams) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        action_url: actionUrl,
        metadata
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro inesperado ao criar notificação:', error);
    return null;
  }
};

// Funções utilitárias para tipos específicos de notificação
export const createForumReplyNotification = (userId: string, postTitle: string, replierName: string) => {
  return createNotification({
    userId,
    title: 'Nova resposta no fórum',
    message: `${replierName} respondeu ao seu post "${postTitle}"`,
    type: 'forum_reply',
    actionUrl: '/dashboard', // Pode ser ajustado para ir direto ao post
    metadata: { postTitle, replierName }
  });
};

export const createWorkoutReminderNotification = (userId: string) => {
  return createNotification({
    userId,
    title: 'Hora do treino!',
    message: 'Não esqueça de completar seu treino de hoje',
    type: 'workout_reminder',
    actionUrl: '/dashboard',
    metadata: { reminderType: 'daily' }
  });
};

export const createAchievementNotification = (userId: string, achievement: string) => {
  return createNotification({
    userId,
    title: 'Conquista desbloqueada!',
    message: `Parabéns! Você conquistou: ${achievement}`,
    type: 'achievement',
    actionUrl: '/dashboard',
    metadata: { achievement }
  });
};
