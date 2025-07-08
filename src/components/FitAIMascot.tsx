import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, MessageCircle } from 'lucide-react';
import fitaiMascot from '@/assets/fitai-mascot-professional.png';

interface FitAIMascotProps {
  variant?: 'hero' | 'floating' | 'cta' | 'small';
  message?: string;
  showCTA?: boolean;
  onCTAClick?: () => void;
  className?: string;
}

const FitAIMascot = ({ 
  variant = 'small', 
  message = "Oi! Sou o FitAI, seu personal trainer IA! 💪",
  showCTA = false,
  onCTAClick,
  className = ""
}: FitAIMascotProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleGetStarted = () => {
    if (onCTAClick) {
      onCTAClick();
    } else {
      window.location.href = '/auth';
    }
  };

  const variants = {
    hero: "w-24 h-24 md:w-32 md:h-32",
    floating: "w-12 h-12 md:w-16 md:h-16",
    cta: "w-20 h-20 md:w-24 md:h-24",
    small: "w-10 h-10 md:w-12 md:h-12"
  };

  const containerVariants = {
    hero: "relative",
    floating: "fixed bottom-6 right-6 z-40",
    cta: "flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-2xl border border-blue-200/20 backdrop-blur-sm",
    small: "relative"
  };

  return (
    <div className={`${containerVariants[variant]} ${className}`}>
      <div className="relative group">
        <img 
          src={fitaiMascot}
          alt="FitAI Mascot"
          className={`${variants[variant]} object-contain transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } filter drop-shadow-lg`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Animação de flutuação */}
        <div className="absolute inset-0 animate-float"></div>
      </div>

      {/* Balão de fala com melhor design */}
      {variant === 'floating' && (
        <div className="absolute -top-20 -left-48 w-48 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-2xl border-0 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-105">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
            <p className="text-sm text-gray-700 font-medium">{message}</p>
          </div>
          <div className="absolute -bottom-2 right-8 w-4 h-4 bg-white/95 backdrop-blur-sm border-0 transform rotate-45"></div>
        </div>
      )}

      {/* CTA para variant cta - Design mais limpo */}
      {variant === 'cta' && showCTA && (
        <div className="text-center space-y-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-gray-800 font-medium mb-2">{message}</p>
            <p className="text-sm text-gray-600">Comece sua transformação hoje mesmo!</p>
          </div>
          
          <Button 
            onClick={handleGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all"
          >
            <Zap className="h-5 w-5 mr-2" />
            Começar Gratuitamente
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Mensagem para variant hero - Design mais sutil */}
      {variant === 'hero' && (
        <div className="absolute -top-12 -left-16 w-56 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-800 font-medium">{message}</p>
              <p className="text-xs text-gray-600 mt-1">Clique em "Começar Agora" para me conhecer melhor!</p>
            </div>
          </div>
          <div className="absolute -bottom-1 left-6 w-3 h-3 bg-white/90 backdrop-blur-sm transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default FitAIMascot;