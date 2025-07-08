import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight, MessageCircle } from 'lucide-react';
import fitaiMascot from '@/assets/fitai-mascot-transparent.png';

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
    hero: "w-32 h-32 md:w-40 md:h-40",
    floating: "w-16 h-16 md:w-20 md:h-20",
    cta: "w-24 h-24 md:w-28 md:h-28",
    small: "w-12 h-12 md:w-16 md:h-16"
  };

  const containerVariants = {
    hero: "relative",
    floating: "fixed bottom-6 right-6 z-40",
    cta: "flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border border-blue-200 shadow-xl",
    small: "relative"
  };

  return (
    <div className={`${containerVariants[variant]} ${className}`}>
      <div className="relative group">
        <img 
          src={fitaiMascot}
          alt="FitAI Mascot"
          className={`${variants[variant]} object-contain transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          } filter drop-shadow-lg`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
        
        {/* Efeito de brilho sutil */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
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

      {/* CTA para variant cta */}
      {variant === 'cta' && showCTA && (
        <div className="text-center space-y-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
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

      {/* Mensagem para variant hero */}
      {variant === 'hero' && (
        <div className="absolute -top-16 -left-20 w-64 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-xl border border-blue-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-start gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <p className="text-sm text-gray-800 font-medium">{message}</p>
              <p className="text-xs text-gray-600 mt-1">Clique em "Começar Agora" para me conhecer melhor!</p>
            </div>
          </div>
          <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default FitAIMascot;