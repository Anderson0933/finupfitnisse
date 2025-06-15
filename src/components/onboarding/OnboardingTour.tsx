import { useState } from 'react';
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
  }
];

const OnboardingTour = ({ isOpen, onClose, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);

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
    onComplete();
    onClose();
  };

  const skipTour = () => {
    onComplete(); // Também marca como concluído ao pular
    onClose();
  };

  if (!isOpen || currentStep >= tourSteps.length) return null;

  const step = tourSteps[currentStep];

  return (
    <>
      {/* Overlay escuro com z-index menor */}
      <div className="fixed inset-0 bg-black/40 z-40 pointer-events-auto" onClick={skipTour} />
      
      {/* Card do tour com z-index adequado e posicionamento responsivo */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed z-50 max-w-sm w-[calc(100%-2rem)] top-20 left-1/2 -translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2"
        >
          <Card className="shadow-2xl border-blue-200 bg-white/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  {currentStep + 1} de {tourSteps.length}
                </Badge>
                <Button variant="ghost" size="sm" onClick={skipTour} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6 leading-relaxed text-sm">
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
                  size="sm"
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
