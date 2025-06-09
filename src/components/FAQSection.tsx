
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  MessageCircle, 
  Trophy, 
  Target, 
  Clock,
  TrendingUp,
  Dumbbell,
  Apple,
  Heart,
  Zap,
  CheckCircle2,
  ArrowRight,
  Star,
  RefreshCw
} from 'lucide-react';

interface FAQSectionProps {
  onSwitchToAssistant?: () => void;
}

const FAQSection = ({ onSwitchToAssistant }: FAQSectionProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const faqs = [
    {
      id: 'finished-workout',
      question: '🏆 Finalizei meu treino, o que faço agora?',
      answer: 'Parabéns! Após finalizar seu treino: 1) Registre seu progresso na aba "Evolução", 2) Faça um alongamento leve, 3) Hidrate-se bem, 4) Se completou todas as semanas do plano, é hora de gerar um novo treino mais desafiador na aba "Treinos"!',
      category: 'treino',
      icon: <Trophy className="h-5 w-5 text-yellow-600" />
    },
    {
      id: 'new-plan',
      question: '🔄 Quando devo gerar um novo plano de treino?',
      answer: 'Gere um novo plano quando: 1) Completar as semanas do plano atual, 2) Sentir que os exercícios ficaram muito fáceis, 3) Quiser focar em outros objetivos, 4) Após 4-6 semanas para evitar adaptação muscular. O IA criará um plano mais avançado baseado no seu progresso!',
      category: 'treino',
      icon: <RefreshCw className="h-5 w-5 text-blue-600" />
    },
    {
      id: 'rest-days',
      question: '😴 Quantos dias de descanso preciso por semana?',
      answer: 'Recomendamos 1-2 dias de descanso completo por semana. Nos dias de descanso, você pode fazer atividades leves como caminhada ou alongamento. O descanso é essencial para recuperação muscular e crescimento!',
      category: 'recuperacao',
      icon: <Clock className="h-5 w-5 text-green-600" />
    },
    {
      id: 'nutrition-timing',
      question: '🍎 Quando devo comer antes e depois do treino?',
      answer: 'Antes: 1-2h antes com carboidratos e proteínas leves. 30min antes: banana ou fruta. Depois: até 30min após com proteína + carboidrato (whey + fruta, ou refeição completa). Consulte nosso assistente nutricional para planos personalizados!',
      category: 'nutricao',
      icon: <Apple className="h-5 w-5 text-orange-600" />
    },
    {
      id: 'not-seeing-results',
      question: '📈 Não estou vendo resultados, o que fazer?',
      answer: 'Resultados levam tempo! Verifique: 1) Está seguindo o plano corretamente? 2) Alimentação adequada? 3) Dormindo bem? 4) Registrando progresso? Use nossa aba "Evolução" para acompanhar. Resultados visíveis geralmente aparecem em 4-6 semanas.',
      category: 'progresso',
      icon: <TrendingUp className="h-5 w-5 text-purple-600" />
    },
    {
      id: 'exercise-difficulty',
      question: '💪 Exercício está muito difícil/fácil, posso modificar?',
      answer: 'Sim! Muito difícil: reduza peso, séries ou repetições. Muito fácil: aumente peso, séries ou diminua descanso. Use nosso assistente IA para sugestões específicas de modificações para cada exercício!',
      category: 'treino',
      icon: <Dumbbell className="h-5 w-5 text-red-600" />
    },
    {
      id: 'muscle-soreness',
      question: '🔥 Estou com dor muscular, posso treinar?',
      answer: 'Dor leve (DOMS) é normal em 24-48h. Pode treinar outros grupos musculares. Dor intensa ou articular: descanse! Dicas: alongue, hidrate-se, durma bem. Se persistir >3 dias, consulte um profissional.',
      category: 'recuperacao',
      icon: <Heart className="h-5 w-5 text-pink-600" />
    },
    {
      id: 'plateau',
      question: '⚡ Meus resultados estagnaram, e agora?',
      answer: 'Plateaus são normais! Estratégias: 1) Varie exercícios, 2) Aumente intensidade, 3) Mude rep/séries, 4) Gere novo plano, 5) Revise alimentação, 6) Melhore sono. Nosso assistente pode sugerir mudanças específicas!',
      category: 'progresso',
      icon: <Zap className="h-5 w-5 text-yellow-500" />
    }
  ];

  const categories = [
    { key: 'treino', label: 'Treino', color: 'bg-blue-100 text-blue-800' },
    { key: 'nutricao', label: 'Nutrição', color: 'bg-green-100 text-green-800' },
    { key: 'recuperacao', label: 'Recuperação', color: 'bg-purple-100 text-purple-800' },
    { key: 'progresso', label: 'Progresso', color: 'bg-orange-100 text-orange-800' }
  ];

  const handleSwitchToAssistant = () => {
    if (onSwitchToAssistant) {
      onSwitchToAssistant();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-blue-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-800 text-xl md:text-2xl flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <HelpCircle className="h-6 w-6 md:h-8 md:w-8 text-white" />
            </div>
            Dúvidas Frequentes - Fitness
          </CardTitle>
          <CardDescription className="text-blue-700 text-sm md:text-base">
            Respostas rápidas para as principais dúvidas sobre treino, nutrição e evolução
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Badge key={category.key} className={`${category.color} text-xs font-medium px-3 py-1`}>
            {category.label}
          </Badge>
        ))}
      </div>

      {/* FAQ Accordion */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardContent className="p-6">
          <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="space-y-4">
            {faqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <AccordionTrigger className="hover:no-underline px-4 py-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3 text-left">
                    {faq.icon}
                    <span className="font-semibold text-gray-800 text-sm md:text-base">{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 py-4 bg-white">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-gray-700 text-sm md:text-base leading-relaxed">{faq.answer}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Assistant CTA */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800 text-sm md:text-base flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Não encontrou sua dúvida?
                </h3>
                <p className="text-blue-700 text-xs md:text-sm mt-1 leading-relaxed">
                  Nosso <strong>Personal Trainer IA</strong> responde qualquer pergunta específica sobre seu treino, 
                  técnicas de exercícios, nutrição personalizada e muito mais!
                </p>
              </div>
            </div>
            <Button 
              onClick={handleSwitchToAssistant}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs md:text-sm px-3 md:px-4 py-2 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Conversar com</span> IA
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQSection;
