import { useState, useEffect } from 'react';

export const useMascotTracking = () => {
  const [interactions, setInteractions] = useState<{
    clicks: number;
    dismissals: number;
    lastInteraction: string | null;
  }>({
    clicks: 0,
    dismissals: 0,
    lastInteraction: null
  });

  useEffect(() => {
    const stored = localStorage.getItem('mascot-interactions');
    if (stored) {
      try {
        setInteractions(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing mascot interactions:', error);
      }
    }
  }, []);

  const trackClick = (context: string) => {
    const newInteractions = {
      ...interactions,
      clicks: interactions.clicks + 1,
      lastInteraction: context
    };
    setInteractions(newInteractions);
    localStorage.setItem('mascot-interactions', JSON.stringify(newInteractions));
    
    // Analytics - você pode integrar com seu sistema de analytics aqui
    console.log('Mascot clicked:', context);
  };

  const trackDismissal = (context: string) => {
    const newInteractions = {
      ...interactions,
      dismissals: interactions.dismissals + 1,
      lastInteraction: context
    };
    setInteractions(newInteractions);
    localStorage.setItem('mascot-interactions', JSON.stringify(newInteractions));
    
    console.log('Mascot dismissed:', context);
  };

  const isDismissed = (context: string): boolean => {
    return localStorage.getItem(`mascot-${context}-dismissed`) === 'true';
  };

  const shouldShowMascot = (context: string): boolean => {
    // Lógica para decidir se deve mostrar o mascote
    // Baseado em interações anteriores, tempo no site, etc.
    return !isDismissed(context) && interactions.dismissals < 3;
  };

  return {
    interactions,
    trackClick,
    trackDismissal,
    isDismissed,
    shouldShowMascot
  };
};

export default useMascotTracking;