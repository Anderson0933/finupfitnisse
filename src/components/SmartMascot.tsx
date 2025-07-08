import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import FitAIMascot from './FitAIMascot';
import MascotPromoBanner from './MascotPromoBanner';
import useMascotTracking from '@/hooks/useMascotTracking';

interface SmartMascotProps {
  context?: 'page-load' | 'scroll' | 'idle' | 'exit-intent';
  position?: 'top-banner' | 'bottom-banner' | 'sidebar' | 'inline';
  delay?: number;
  className?: string;
}

const SmartMascot = ({ 
  context = 'page-load', 
  position = 'inline',
  delay = 0,
  className = ""
}: SmartMascotProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [userActivity, setUserActivity] = useState('active');
  const location = useLocation();
  const { trackClick, shouldShowMascot } = useMascotTracking();

  // Mensagens contextuais baseadas na página atual
  const getContextualMessage = () => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      return "Ei! Que tal começar sua transformação agora? 🚀";
    } else if (pathname === '/auth') {
      return "Estou aqui para te ajudar! Vamos começar? 💪";
    } else if (pathname === '/dashboard') {
      return "Parabéns por estar aqui! Vamos treinar hoje? 🏆";
    } else {
      return "Precisa de ajuda? Estou aqui para você! 😊";
    }
  };

  // Títulos contextuais para banners
  const getContextualTitle = () => {
    const pathname = location.pathname;
    
    if (pathname === '/') {
      return "🎯 Transforme seu corpo com IA!";
    } else if (pathname === '/auth') {
      return "🚀 Bem-vindo à revolução fitness!";
    } else if (pathname === '/dashboard') {
      return "💪 Continue sua jornada!";
    } else {
      return "✨ Descubra o poder da IA!";
    }
  };

  // Detectar inatividade do usuário
  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimer);
      setUserActivity('active');
      
      inactivityTimer = setTimeout(() => {
        setUserActivity('idle');
      }, 30000); // 30 segundos de inatividade
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetInactivityTimer, true);
    });

    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer, true);
      });
    };
  }, []);

  // Lógica para mostrar o mascote baseada no contexto
  useEffect(() => {
    if (!shouldShowMascot(`smart-${context}-${position}`)) {
      return;
    }

    const showMascot = () => {
      setIsVisible(true);
    };

    let timer: NodeJS.Timeout;

    switch (context) {
      case 'page-load':
        timer = setTimeout(showMascot, delay);
        break;
        
      case 'idle':
        if (userActivity === 'idle') {
          timer = setTimeout(showMascot, delay);
        }
        break;
        
      case 'scroll':
        const handleScroll = () => {
          if (window.scrollY > 300) {
            showMascot();
            window.removeEventListener('scroll', handleScroll);
          }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
        
      case 'exit-intent':
        const handleMouseLeave = (e: MouseEvent) => {
          if (e.clientY <= 0) {
            showMascot();
          }
        };
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => document.removeEventListener('mouseleave', handleMouseLeave);
        
      default:
        timer = setTimeout(showMascot, delay);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [context, delay, userActivity, shouldShowMascot]);

  const handleMascotClick = () => {
    trackClick(`smart-${context}-${position}`);
    window.location.href = '/auth';
  };

  if (!isVisible) {
    return null;
  }

  // Renderizar diferentes tipos baseados na posição
  switch (position) {
    case 'top-banner':
      return (
        <MascotPromoBanner
          variant="top"
          title={getContextualTitle()}
          subtitle="Mais de 50.000 pessoas já transformaram seus corpos!"
          onButtonClick={handleMascotClick}
          className={className}
        />
      );
      
    case 'bottom-banner':
      return (
        <MascotPromoBanner
          variant="bottom"
          title={getContextualTitle()}
          subtitle="Comece sua transformação hoje mesmo!"
          onButtonClick={handleMascotClick}
          className={className}
        />
      );
      
    case 'sidebar':
      return (
        <MascotPromoBanner
          variant="sidebar"
          title={getContextualTitle()}
          subtitle="Junte-se a milhares de pessoas que já descobriram o segredo!"
          onButtonClick={handleMascotClick}
          className={className}
        />
      );
      
    case 'inline':
    default:
      return (
        <div className={`flex items-center justify-center p-4 ${className}`}>
          <FitAIMascot
            variant="cta"
            message={getContextualMessage()}
            showCTA={true}
            onCTAClick={handleMascotClick}
          />
        </div>
      );
  }
};

export default SmartMascot;