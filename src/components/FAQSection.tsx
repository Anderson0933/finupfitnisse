
import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, HelpCircle, MessageCircle, RefreshCw, Dumbbell, Calendar, Trophy } from 'lucide-react';

interface FAQSectionProps {
  user: User | null;
  onSwitchToAssistant?: () => void;
}

const FAQSection = ({ user, onSwitchToAssistant }: FAQSectionProps) => {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const faqs = [
    {
      id: 'finished-plan',
      icon: Trophy,
      question: 'Finalizei meu plano de treino, o que fazer agora?',
      answer: 'Parabéns por completar seu plano! Agora você tem algumas opções:\n\n• **Gerar um novo plano**: Vá para a aba "Treinos" e clique em "Gerar Novo Plano" para criar um programa atualizado baseado em sua evolução.\n\n• **Revisar seu progresso**: Acesse a aba "Evolução" para ver como você melhorou durante as 8 semanas.\n\n• **Conversar com o assistente**: Use nossa IA para receber orientações personalizadas sobre o próximo passo.',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'new-plan',
      icon: RefreshCw,
      question: 'Como gerar um novo plano de treino?',
      answer: 'Para gerar um novo plano:\n\n1. Vá para a aba "Treinos"\n2. Se você já tem um plano ativo, clique em "Gerar Novo Plano"\n3. Preencha o formulário com seus objetivos atuais\n4. Nossa IA criará um novo programa de 8 semanas adaptado ao seu nível atual\n\n*Dica: Atualize suas informações (peso, experiência) para um plano mais preciso.*',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'exercise-doubts',
      icon: Dumbbell,
      question: 'Tenho dúvidas sobre como executar um exercício',
      answer: 'Para dúvidas sobre exercícios:\n\n• **Consulte as instruções detalhadas**: Cada exercício tem instruções completas com posição, execução e respiração.\n\n• **Use o Assistente IA**: Vá para a aba "Assistente" e pergunte especificamente sobre o exercício.\n\n• **Exemplo de pergunta**: "Como fazer agachamento corretamente?" ou "Qual a postura certa para flexão?"',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'modify-plan',
      icon: Calendar,
      question: 'Posso modificar meu plano de treino?',
      answer: 'Atualmente, para modificações:\n\n• **Use o Assistente IA**: Pergunte sobre adaptações específicas como "Como substituir exercícios que não posso fazer?"\n\n• **Gere um novo plano**: Se suas necessidades mudaram significativamente, é melhor criar um plano completamente novo.\n\n• **Consulte a IA**: Nossa assistente pode sugerir variações e adaptações personalizadas.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'progress-tracking',
      icon: Calendar,
      question: 'Como acompanhar meu progresso?',
      answer: 'Para acompanhar sua evolução:\n\n• **Aba Evolução**: Registre seus treinos, pesos e medidas regularmente.\n\n• **Marque exercícios como concluídos**: No seu plano, marque cada exercício após completá-lo.\n\n• **Use o chat**: Converse com a IA sobre seu progresso e receba dicas de melhoria.\n\n• **Seja consistente**: Registre dados semanalmente para ver sua evolução.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      id: 'nutrition-help',
      icon: MessageCircle,
      question: 'Como obter ajuda com alimentação?',
      answer: 'Para dicas de nutrição:\n\n• **Aba Nutrição**: Acesse nosso assistente de nutrição especializado.\n\n• **Pergunte à IA**: Use o assistente para perguntas como "O que comer antes do treino?" ou "Cardápio para ganhar massa muscular".\n\n• **Dicas personalizadas**: Nossa IA considera seus objetivos para dar sugestões alimentares adequadas.',
      color: 'from-pink-500 to-pink-600'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-blue-200 shadow-lg">
        <CardHeader className="border-b border-blue-100 bg-blue-50">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-lg md:text-xl">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <HelpCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            Dúvidas Frequentes
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
          <div className="space-y-4">
            {faqs.map((faq) => {
              const IconComponent = faq.icon;
              const isOpen = openItems.includes(faq.id);
              
              return (
                <Collapsible key={faq.id}>
                  <Card className="border border-gray-200 hover:border-blue-300 transition-colors">
                    <CollapsibleTrigger 
                      onClick={() => toggleItem(faq.id)}
                      className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-r ${faq.color} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-4 w-4 text-white" />
                          </div>
                          <h3 className="text-sm md:text-base font-medium text-gray-900">
                            {faq.question}
                          </h3>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="h-5 w-5 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                        <div className="ml-11">
                          <p className="text-sm md:text-base text-gray-700 whitespace-pre-line leading-relaxed">
                            {faq.answer}
                          </p>
                          
                          {faq.id === 'finished-plan' && onSwitchToAssistant && (
                            <div className="mt-4 flex flex-col sm:flex-row gap-2">
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => {
                                  // Trigger tab change to workout
                                  const workoutTab = document.querySelector('[data-value="workout"]') as HTMLElement;
                                  workoutTab?.click();
                                }}
                              >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Gerar Novo Plano
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={onSwitchToAssistant}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Conversar com IA
                              </Button>
                            </div>
                          )}
                          
                          {(faq.id === 'exercise-doubts' || faq.id === 'modify-plan' || faq.id === 'nutrition-help') && onSwitchToAssistant && (
                            <div className="mt-4">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={onSwitchToAssistant}
                              >
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Conversar com Assistente
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </div>
          
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Não encontrou sua dúvida?
              </h3>
              <p className="text-blue-600 mb-4 text-sm md:text-base">
                Nossa IA está sempre pronta para ajudar com qualquer pergunta sobre fitness, treinos e nutrição.
              </p>
              {onSwitchToAssistant && (
                <Button 
                  onClick={onSwitchToAssistant}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com Assistente IA
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQSection;
