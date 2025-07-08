import { useState } from 'react';
import { X, ArrowRight, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FitAIMascot from './FitAIMascot';

interface MascotPromoBannerProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  onButtonClick?: () => void;
  dismissible?: boolean;
  variant?: 'top' | 'bottom' | 'sidebar';
  className?: string;
}

const MascotPromoBanner = ({
  title = "🎯 Transforme seu corpo com IA!",
  subtitle = "Mais de 50.000 pessoas já descobriram o segredo. Comece grátis hoje!",
  buttonText = "Começar Agora - É Grátis!",
  onButtonClick,
  dismissible = true,
  variant = 'top',
  className = ""
}: MascotPromoBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      window.location.href = '/auth';
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(`mascot-banner-${variant}-dismissed`, 'true');
  };

  const variantStyles = {
    top: "fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 text-white shadow-lg",
    bottom: "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 text-white shadow-lg",
    sidebar: "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl shadow-xl"
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FitAIMascot 
              variant="small" 
              className="flex-shrink-0" 
            />
            <div className="min-w-0">
              <h3 className={`font-bold text-sm md:text-base ${variant === 'sidebar' ? 'text-gray-900' : 'text-white'}`}>
                {title}
              </h3>
              <p className={`text-xs md:text-sm opacity-90 ${variant === 'sidebar' ? 'text-gray-600' : 'text-blue-100'}`}>
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              onClick={handleButtonClick}
              size="sm"
              className={`${
                variant === 'sidebar' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white' 
                  : 'bg-white text-blue-600 hover:bg-blue-50'
              } font-semibold rounded-full shadow-lg transform hover:scale-105 transition-all`}
            >
              <Zap className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">{buttonText}</span>
              <span className="sm:hidden">Começar</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>

            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className={`p-1 hover:bg-white/20 rounded-full ${variant === 'sidebar' ? 'text-gray-500 hover:text-gray-700' : 'text-white/80 hover:text-white'}`}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Indicador de confiança */}
        <div className="flex items-center justify-center mt-2 gap-2">
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className={`text-xs ${variant === 'sidebar' ? 'text-gray-600' : 'text-white/80'}`}>
            4.9/5 • 50.000+ usuários transformados
          </span>
        </div>
      </div>
    </div>
  );
};

export default MascotPromoBanner;