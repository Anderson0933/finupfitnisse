
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';

interface OnboardingState {
  hasSeenTour: boolean;
  hasCompletedOnboarding: boolean;
  shouldShowChecklist: boolean;
}

export const useOnboarding = (user: User | null) => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>({
    hasSeenTour: false,
    hasCompletedOnboarding: false,
    shouldShowChecklist: false
  });

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = () => {
    if (!user) return;

    const storageKey = `onboarding_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      const parsed = JSON.parse(stored);
      setOnboardingState(parsed);
    } else {
      // Novo usuário - mostrar tour e checklist
      setOnboardingState({
        hasSeenTour: false,
        hasCompletedOnboarding: false,
        shouldShowChecklist: true
      });
    }
  };

  const markTourAsCompleted = () => {
    if (!user) return;
    
    const newState = {
      ...onboardingState,
      hasSeenTour: true
    };
    
    setOnboardingState(newState);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState));
  };

  const markOnboardingAsCompleted = () => {
    if (!user) return;
    
    const newState = {
      ...onboardingState,
      hasCompletedOnboarding: true,
      shouldShowChecklist: false
    };
    
    setOnboardingState(newState);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState));
  };

  const hideChecklist = () => {
    if (!user) return;
    
    const newState = {
      ...onboardingState,
      shouldShowChecklist: false
    };
    
    setOnboardingState(newState);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState));
  };

  const resetOnboarding = () => {
    if (!user) return;
    
    const newState = {
      hasSeenTour: false,
      hasCompletedOnboarding: false,
      shouldShowChecklist: true
    };
    
    setOnboardingState(newState);
    localStorage.setItem(`onboarding_${user.id}`, JSON.stringify(newState));
  };

  const shouldShowTour = user && !onboardingState.hasSeenTour;

  return {
    onboardingState,
    shouldShowTour,
    markTourAsCompleted,
    markOnboardingAsCompleted,
    hideChecklist,
    resetOnboarding
  };
};
