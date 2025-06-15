
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TourStep {
  id: string;
  target: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
}

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    target: '.main-dashboard-tabs',
    title: '🎉 Bem-vindo ao FitAI Pro!',
    description: 'Vamos fazer um tour rápido pelas principais funcionalidades do seu personal trainer com IA.',
    position: 'bottom'
  },
  {
    id: 'workout-tab',
    target: '[data-value="workout"]',
    title: '💪 Gerador de Treinos',
    description: 'Aqui você cria treinos personalizados com nossa IA. Basta responder algumas perguntas sobre seus objetivos.',
    position: 'bottom'
  },
  {
    id: 'assistant-tab',
    target: '[data-value="assistant"]',
    title: '🤖 Assistente Pessoal',
    description: 'Seu personal trainer virtual 24/7. Tire dúvidas, peça ajuda com exercícios e receba orientações.',
    position: 'bottom'
  },
  {
    id: 'nutrition-tab',
    target: '[data-value="nutrition"]',
    title: '🍎 Nutrição Inteligente',
    description: 'Receba planos alimentares personalizados e dicas nutricionais baseadas em seus objetivos.',
    position: 'bottom'
  },
  {
    id: 'progress-tab',
    target: '[data-value="progress"]',
    title: '📈 Acompanhe sua Evolução',
    description: 'Registre seus treinos, peso e medidas. Veja gráficos do seu progresso ao longo do tempo.',
    position: 'bottom'
  },
  {
    id: 'notifications',
    target: '.notification-bell',
    title: '🔔 Notificações',
    description: 'Receba lembretes de treino, dicas personalizadas e atualizações importantes.',
    position: 'left'
  }
];

const OnboardingTour = ({ isOpen, onClose, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen && currentStep < tourSteps.length) {
      const targetElement = document.querySelector(tourSteps[currentStep].target) as HTMLElement;
      setHighlightElement(targetElement);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetElement.style.position = 'relative';
        targetElement.style.zIndex = '1001';
      }
    }
  }, [isOpen, currentStep]);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTour = () => {
    if (highlightElement) {
      highlightElement.style.zIndex = '';
    }
    onComplete();
    onClose();
  };

  const skipTour = () => {
    if (highlightElement) {
      highlightElement.style.zIndex = '';
    }
    onClose();
  };

  if (!isOpen || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay escuro */}
      <div className="fixed inset-0 bg-black/50 z-1000 pointer-events-auto" />
      
      {/* Card do tour */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed z-1002 max-w-sm"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <Card className="shadow-2xl border-blue-200 bg-white">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {currentStep + 1} de {tourSteps.length}
                </Badge>
                <Button variant="ghost" size="sm" onClick={skipTour}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {step.description}
              </p>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Anterior
                </Button>
                
                <Button
                  onClick={nextStep}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  {currentStep === tourSteps.length - 1 ? (
                    <>
                      <Check className="h-4 w-4" />
                      Finalizar
                    </>
                  ) : (
                    <>
                      Próximo
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default OnboardingTour;
