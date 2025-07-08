import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FitAIMascot from './FitAIMascot';
import useMascotTracking from '@/hooks/useMascotTracking';

const FloatingMascot = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { trackClick, trackDismissal, shouldShowMascot } = useMascotTracking();

  useEffect(() => {
    // Mostrar o mascote após 5 segundos se apropriado
    const timer = setTimeout(() => {
      if (shouldShowMascot('floating')) {
        setIsVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [shouldShowMascot]);

  const handleDismiss = () => {
    setIsVisible(false);
    trackDismissal('floating');
    localStorage.setItem('mascot-floating-dismissed', 'true');
  };

  const handleClick = () => {
    trackClick('floating-mascot');
    window.location.href = '/auth';
  };

  if (!isVisible || !shouldShowMascot('floating')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 group">
      <div className="relative">
        {/* Botão de fechar */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-white rounded-full shadow-lg hover:bg-gray-100 z-10"
        >
          <X className="h-3 w-3" />
        </Button>
        
        {/* Mascote clicável */}
        <div 
          onClick={handleClick}
          className="cursor-pointer transform hover:scale-110 transition-transform duration-300"
        >
          <FitAIMascot 
            variant="floating" 
            message="Quer começar sua transformação? Clique em mim! 🚀"
          />
        </div>
        
        {/* Animação de pulso */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-ping opacity-30"></div>
      </div>
    </div>
  );
};

export default FloatingMascot;