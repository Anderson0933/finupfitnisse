
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Lightbulb, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Tip {
  id: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  triggerCondition: (context: any) => boolean;
}

interface ContextualTipsProps {
  currentTab: string;
  workoutPlan: any;
  onSwitchTab: (tab: string) => void;
}

const ContextualTips = ({ currentTab, workoutPlan, onSwitchTab }: ContextualTipsProps) => {
  const [currentTip, setCurrentTip] = useState<Tip | null>(null);
  const [dismissedTips, setDismissedTips] = useState<string[]>([]);

  const tips: Tip[] = [
    {
      id: 'first-workout-tip',
      title: '💡 Dica: Comece com um Treino Personalizado',
      description: 'Que tal criar seu primeiro plano de treino? Nossa IA vai personalizar exercícios baseados nos seus objetivos e nível de condicionamento.',
      action: {
        label: 'Criar Treino Agora',
        onClick: () => onSwitchTab('workout')
      },
      triggerCondition: (context) => 
        context.currentTab === 'workout' && !context.workoutPlan && !dismissedTips.includes('first-workout-tip')
    },
    {
      id: 'nutrition-complement-tip',
      title: '🍎 Dica: Complete com Nutrição',
      description: 'Você já tem um treino! Agora que tal complementar com um plano nutricional? A combinação de exercícios e alimentação adequada acelera seus resultados.',
      action: {
        label: 'Ver Nutrição',
        onClick: () => onSwitchTab('nutrition')
      },
      triggerCondition: (context) => 
        context.currentTab === 'workout' && context.workoutPlan && !dismissedTips.includes('nutrition-complement-tip')
    },
    {
      id: 'assistant-help-tip',
      title: '🤖 Dica: Use o Assistente para Dúvidas',
      description: 'Tem alguma dúvida sobre os exercícios ou técnica? O assistente IA está sempre disponível para te ajudar com orientações personalizadas.',
      action: {
        label: 'Falar com Assistente',
        onClick: () => onSwitchTab('assistant')
      },
      triggerCondition: (context) => 
        (context.currentTab === 'workout' || context.currentTab === 'nutrition') && !dismissedTips.includes('assistant-help-tip')
    }
  ];

  useEffect(() => {
    const context = { currentTab, workoutPlan };
    const applicableTip = tips.find(tip => tip.triggerCondition(context));
    
    if (applicableTip && !dismissedTips.includes(applicableTip.id)) {
      // Delay para não mostrar a dica imediatamente
      const timer = setTimeout(() => {
        setCurrentTip(applicableTip);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setCurrentTip(null);
    }
  }, [currentTab, workoutPlan, dismissedTips]);

  const dismissTip = (tipId: string) => {
    setDismissedTips(prev => [...prev, tipId]);
    setCurrentTip(null);
  };

  if (!currentTip) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        className="fixed bottom-4 right-4 z-30 max-w-sm mx-4"
      >
        <Card className="shadow-xl border-blue-200 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                <span className="font-medium text-blue-800 text-sm">
                  {currentTip.title}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dismissTip(currentTip.id)}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            
            <p className="text-gray-700 text-xs mb-3 leading-relaxed">
              {currentTip.description}
            </p>
            
            {currentTip.action && (
              <Button
                onClick={currentTip.action.onClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs flex items-center justify-center gap-2"
                size="sm"
              >
                {currentTip.action.label}
                <ArrowRight className="h-3 w-3" />
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualTips;
