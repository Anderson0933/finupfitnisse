
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle, Dumbbell, TrendingUp, MessageCircle, Apple } from 'lucide-react';

const FAQSection = () => {
  const faqData = [
    {
      id: "treino-finalizado",
      question: "Finalizei o treino, o que faço agora?",
      answer: "Parabéns por completar seu treino! Agora você pode: 1) Registrar seu progresso na aba 'Evolução' marcando os exercícios como concluídos; 2) Anotar como se sentiu e qualquer observação importante; 3) Verificar suas conquistas na seção de gamificação; 4) Planejar seu próximo treino. Lembre-se de descansar adequadamente entre as sessões!"
    },
    {
      id: "como-marcar-progresso",
      question: "Como marco meu progresso nos exercícios?",
      answer: "Vá até a aba 'Evolução' e você encontrará seu plano de treino atual. Clique nos exercícios que completou para marcá-los como concluídos. Isso ajuda a acompanhar sua consistência e desbloquear conquistas no sistema de gamificação."
    },
    {
      id: "alterar-plano",
      question: "Posso alterar meu plano de treino?",
      answer: "Sim! Na aba 'Treinos', você pode gerar um novo plano a qualquer momento. Clique em 'Gerar Novo Plano' e preencha o formulário com suas preferências atuais. O sistema criará um plano personalizado baseado nas suas novas informações."
    },
    {
      id: "usar-assistente",
      question: "Como usar o assistente de IA?",
      answer: "O assistente na aba 'Assistente' pode responder dúvidas sobre exercícios, técnicas, nutrição e motivação. Digite sua pergunta e ele fornecerá respostas personalizadas. É como ter um personal trainer sempre disponível!"
    },
    {
      id: "conquistas-gamificacao",
      question: "Como funcionam as conquistas e gamificação?",
      answer: "O sistema de gamificação recompensa sua consistência! Você ganha XP completando treinos, mantém streaks (sequências) de atividade e desbloqueia conquistas especiais. Verifique seu progresso na seção de gamificação da aba 'Evolução'."
    },
    {
      id: "nutricao-dicas",
      question: "Onde encontro dicas de nutrição?",
      answer: "Na aba 'Nutrição', você encontra um assistente especializado em alimentação saudável. Ele pode criar planos alimentares, sugerir receitas, calcular calorias e responder dúvidas sobre nutrição esportiva."
    },
    {
      id: "frequencia-treino",
      question: "Com que frequência devo treinar?",
      answer: "A frequência ideal depende do seu nível e objetivos, mas geralmente recomenda-se: Iniciantes: 2-3x por semana; Intermediários: 3-4x por semana; Avançados: 4-6x por semana. Sempre inclua dias de descanso para recuperação muscular."
    },
    {
      id: "dor-muscular",
      question: "É normal sentir dor muscular após o treino?",
      answer: "Sim, é normal sentir dor muscular leve (DOMS) 24-48h após o treino, especialmente se você é iniciante ou aumentou a intensidade. Isso indica que os músculos estão se adaptando. Porém, dor intensa ou em articulações pode indicar lesão - neste caso, descanse e procure orientação médica."
    },
    {
      id: "nao-vejo-resultados",
      question: "Não estou vendo resultados, o que fazer?",
      answer: "Resultados levam tempo! Mudanças na força aparecem em 2-4 semanas, na composição corporal em 4-8 semanas. Certifique-se de: seguir o plano consistentemente, ter uma alimentação adequada, descansar bem, progredir gradualmente na intensidade. Use a aba 'Evolução' para acompanhar seu progresso."
    },
    {
      id: "exercicio-dificil",
      question: "Um exercício está muito difícil, posso modificar?",
      answer: "Absolutamente! Use o assistente de IA para pedir variações mais fáceis do exercício. Você também pode reduzir repetições, usar progressões mais simples ou substituir por exercícios similares. O importante é manter a consistência e progredir gradualmente."
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg shadow-md">
              <HelpCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800">
            Dúvidas Frequentes
          </CardTitle>
          <CardDescription className="text-blue-600">
            Encontre respostas para as principais dúvidas sobre o FitAI Pro
          </CardDescription>
        </CardHeader>
      </Card>

      <Card className="bg-white/80 border-blue-200 shadow-lg backdrop-blur-sm">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {faqData.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-blue-200">
                <AccordionTrigger className="text-left hover:text-blue-600 font-medium">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-gray-700 pl-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-lg">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Ainda tem dúvidas?
            </h3>
            <p className="text-blue-600 mb-4">
              Use nosso assistente de IA para perguntas específicas sobre treinos, nutrição e fitness!
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 text-sm text-blue-700 bg-white/60 px-3 py-2 rounded-full">
                <Dumbbell className="h-4 w-4" />
                <span>Treinos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-green-700 bg-white/60 px-3 py-2 rounded-full">
                <Apple className="h-4 w-4" />
                <span>Nutrição</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-purple-700 bg-white/60 px-3 py-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
                <span>Assistente IA</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-orange-700 bg-white/60 px-3 py-2 rounded-full">
                <TrendingUp className="h-4 w-4" />
                <span>Progresso</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FAQSection;
