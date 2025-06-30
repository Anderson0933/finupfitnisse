
import { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

// Corresponde ao esquema do banco de dados
export interface OnboardingState {
  user_id: string;
  has_seen_tour: boolean;
  completed_checklist_steps: string[];
  hide_checklist: boolean;
  dismissed_contextual_tips: string[];
}

const defaultState: Omit<OnboardingState, 'user_id'> = {
  has_seen_tour: false,
  completed_checklist_steps: [],
  hide_checklist: false,
  dismissed_contextual_tips: [],
};

export const useOnboarding = (user: User | null) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getOrCreateOnboardingStatus = useCallback(async (userId: string) => {
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('user_onboarding_status')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching onboarding status:', error);
      toast({ title: 'Erro ao carregar seu progresso', variant: 'destructive' });
      setOnboardingState(null);
      setIsLoading(false);
      return;
    }

    if (data) {
      setOnboardingState(data);
    } else {
      // Nenhum registro encontrado, crie um para o novo usuário
      const { data: newData, error: insertError } = await supabase
        .from('user_onboarding_status')
        .insert({ user_id: userId, ...defaultState })
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating onboarding status:', insertError);
        toast({ title: 'Erro ao iniciar seu progresso', variant: 'destructive' });
        setOnboardingState(null);
      } else {
        setOnboardingState(newData);
      }
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (user) {
      getOrCreateOnboardingStatus(user.id);
    } else {
      setIsLoading(false);
      setOnboardingState(null);
    }
  }, [user, getOrCreateOnboardingStatus]);

  const updateOnboardingStatus = async (updates: Partial<OnboardingState>) => {
    if (!user || !onboardingState) return;

    const previousState = onboardingState;
    
    // Atualizar estado otimisticamente
    setOnboardingState(current => current ? { ...current, ...updates } : null);

    const { error } = await supabase
      .from('user_onboarding_status')
      .update(updates)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error updating onboarding status:', error);
      toast({ title: 'Erro ao salvar seu progresso', variant: 'destructive' });
      // Reverter estado em caso de erro
      setOnboardingState(previousState);
    }
  };

  const markTourAsCompleted = () => {
    if (onboardingState?.has_seen_tour) return;
    updateOnboardingStatus({ has_seen_tour: true });
  };
  
  const markStepAsCompleted = (stepId: string) => {
    if (!onboardingState || onboardingState.completed_checklist_steps.includes(stepId)) return;
    
    console.log(`📝 Marcando passo '${stepId}' como completado`);
    const newSteps = [...onboardingState.completed_checklist_steps, stepId];
    updateOnboardingStatus({ completed_checklist_steps: newSteps });
  };

  const hideChecklist = () => {
    if (onboardingState?.hide_checklist) return;
    updateOnboardingStatus({ hide_checklist: true });
  };

  const dismissContextualTip = (tipId: string) => {
    if (!onboardingState || onboardingState.dismissed_contextual_tips.includes(tipId)) return;

    const newTips = [...onboardingState.dismissed_contextual_tips, tipId];
    updateOnboardingStatus({ dismissed_contextual_tips: newTips });
  };

  const resetOnboarding = () => {
    if (!user) return;
    updateOnboardingStatus({ ...defaultState });
    toast({ title: 'Progresso de onboarding resetado' });
  };

  const shouldShowTour = !isLoading && user && onboardingState && !onboardingState.has_seen_tour;
  const shouldShowChecklist = !isLoading && user && onboardingState && !onboardingState.hide_checklist;
  
  return {
    onboardingState,
    isLoadingOnboarding: isLoading,
    shouldShowTour,
    shouldShowChecklist,
    markTourAsCompleted,
    markStepAsCompleted,
    hideChecklist,
    dismissContextualTip,
    resetOnboarding,
  };
};
