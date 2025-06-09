
import { useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { GamificationManager } from '@/components/GamificationPersistentManager';
import { useToast } from '@/hooks/use-toast';

export const useWorkoutCompletion = (user: User | null) => {
  const { toast } = useToast();

  const handleWorkoutCompletion = useCallback(async (xpGained: number = 25) => {
    if (!user) {
      console.warn('Usuário não logado para registrar conclusão de treino');
      return;
    }

    try {
      await GamificationManager.updateWorkoutCompletion(user.id, xpGained);
      
      toast({
        title: "Treino Concluído! 🎉",
        description: `Parabéns! Você ganhou ${xpGained} XP!`,
        duration: 3000,
      });

    } catch (error) {
      console.error('Erro ao registrar conclusão de treino:', error);
      toast({
        title: "Erro ao Registrar Progresso",
        description: "Não foi possível atualizar suas conquistas.",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const handleFitnessLevelUpdate = useCallback(async (newFitnessLevel: string) => {
    if (!user) return;

    try {
      await GamificationManager.updateFitnessCategory(user.id, newFitnessLevel);
      
      toast({
        title: "Nível Atualizado! 📈",
        description: "Suas conquistas foram atualizadas para o novo nível!",
        duration: 3000,
      });

    } catch (error) {
      console.error('Erro ao atualizar nível fitness:', error);
    }
  }, [user, toast]);

  return {
    handleWorkoutCompletion,
    handleFitnessLevelUpdate
  };
};
