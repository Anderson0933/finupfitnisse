
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserGamificationData {
  user_id: string;
  total_xp: number;
  current_level: number;
  achievements_unlocked: string[];
  total_workouts_completed: number;
  current_streak: number;
  best_streak: number;
  last_activity_date: string | null;
  fitness_category: 'iniciante' | 'intermediario' | 'avancado';
  created_at: string;
  updated_at: string;
}

export class GamificationManager {
  static async getUserGamificationData(userId: string): Promise<UserGamificationData | null> {
    try {
      const { data, error } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar dados de gamificação:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de gamificação:', error);
      return null;
    }
  }

  static async initializeUserGamification(userId: string, fitnessLevel: string = 'iniciante'): Promise<UserGamificationData> {
    const fitnessCategory = this.mapFitnessLevelToCategory(fitnessLevel);
    
    const initialData = {
      user_id: userId,
      total_xp: 0,
      current_level: 1,
      achievements_unlocked: [],
      total_workouts_completed: 0,
      current_streak: 0,
      best_streak: 0,
      last_activity_date: null,
      fitness_category: fitnessCategory
    };

    const { data, error } = await supabase
      .from('user_gamification')
      .upsert(initialData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao inicializar gamificação:', error);
      throw error;
    }

    return data;
  }

  static async updateWorkoutCompletion(userId: string, xpGained: number = 25): Promise<void> {
    try {
      // Buscar dados atuais
      let gamificationData = await this.getUserGamificationData(userId);
      
      if (!gamificationData) {
        // Se não existe, criar com base no perfil do usuário
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('fitness_level')
          .eq('user_id', userId)
          .maybeSingle();
        
        gamificationData = await this.initializeUserGamification(
          userId, 
          userProfile?.fitness_level || 'iniciante'
        );
      }

      const today = new Date().toISOString().split('T')[0];
      const lastActivity = gamificationData.last_activity_date;
      
      // Calcular streak
      let newStreak = 1;
      if (lastActivity) {
        const lastDate = new Date(lastActivity);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - lastDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Dia consecutivo
          newStreak = gamificationData.current_streak + 1;
        } else if (diffDays === 0) {
          // Mesmo dia, manter streak
          newStreak = gamificationData.current_streak;
        }
        // Se diffDays > 1, streak quebrou, volta para 1
      }

      const newXP = gamificationData.total_xp + xpGained;
      const newLevel = this.calculateLevel(newXP);
      const newBestStreak = Math.max(gamificationData.best_streak, newStreak);

      // Verificar novas conquistas
      const newAchievements = this.checkNewAchievements(
        gamificationData,
        {
          total_xp: newXP,
          current_level: newLevel,
          total_workouts_completed: gamificationData.total_workouts_completed + 1,
          current_streak: newStreak,
          best_streak: newBestStreak
        }
      );

      // Atualizar dados
      const { error } = await supabase
        .from('user_gamification')
        .update({
          total_xp: newXP,
          current_level: newLevel,
          total_workouts_completed: gamificationData.total_workouts_completed + 1,
          current_streak: newStreak,
          best_streak: newBestStreak,
          last_activity_date: today,
          achievements_unlocked: [...gamificationData.achievements_unlocked, ...newAchievements],
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Erro ao atualizar gamificação:', error);
      }

    } catch (error) {
      console.error('Erro ao processar conclusão de treino:', error);
    }
  }

  static async updateFitnessCategory(userId: string, newFitnessLevel: string): Promise<void> {
    const fitnessCategory = this.mapFitnessLevelToCategory(newFitnessLevel);
    
    const { error } = await supabase
      .from('user_gamification')
      .update({ 
        fitness_category: fitnessCategory,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      console.error('Erro ao atualizar categoria fitness:', error);
    }
  }

  private static mapFitnessLevelToCategory(fitnessLevel: string): 'iniciante' | 'intermediario' | 'avancado' {
    const level = fitnessLevel.toLowerCase();
    if (level.includes('avancado') || level.includes('expert')) return 'avancado';
    if (level.includes('intermediario') || level.includes('regular')) return 'intermediario';
    return 'iniciante';
  }

  private static calculateLevel(xp: number): number {
    if (xp >= 1500) return 6;
    if (xp >= 1000) return 5;
    if (xp >= 600) return 4;
    if (xp >= 300) return 3;
    if (xp >= 100) return 2;
    return 1;
  }

  private static checkNewAchievements(
    oldData: UserGamificationData, 
    newData: { total_xp: number; current_level: number; total_workouts_completed: number; current_streak: number; best_streak: number }
  ): string[] {
    const newAchievements: string[] = [];
    const unlockedAchievements = oldData.achievements_unlocked;

    // Verificar conquistas baseadas em treinos
    if (newData.total_workouts_completed >= 1 && !unlockedAchievements.includes('first-workout')) {
      newAchievements.push('first-workout');
    }
    if (newData.total_workouts_completed >= 10 && !unlockedAchievements.includes('workout-10')) {
      newAchievements.push('workout-10');
    }
    if (newData.total_workouts_completed >= 25 && !unlockedAchievements.includes('workout-25')) {
      newAchievements.push('workout-25');
    }
    if (newData.total_workouts_completed >= 50 && !unlockedAchievements.includes('workout-50')) {
      newAchievements.push('workout-50');
    }

    // Verificar conquistas de streak
    if (newData.current_streak >= 3 && !unlockedAchievements.includes('streak-3')) {
      newAchievements.push('streak-3');
    }
    if (newData.current_streak >= 7 && !unlockedAchievements.includes('streak-7')) {
      newAchievements.push('streak-7');
    }
    if (newData.current_streak >= 30 && !unlockedAchievements.includes('streak-30')) {
      newAchievements.push('streak-30');
    }

    // Verificar conquistas de nível
    if (newData.current_level >= 3 && !unlockedAchievements.includes('level-3')) {
      newAchievements.push('level-3');
    }
    if (newData.current_level >= 5 && !unlockedAchievements.includes('level-5')) {
      newAchievements.push('level-5');
    }

    return newAchievements;
  }
}
