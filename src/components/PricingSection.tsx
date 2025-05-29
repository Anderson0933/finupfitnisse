
import { Check, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const features = [
    'IA Personal Trainer 24/7',
    'Treinos personalizados adaptativos',
    'Plano nutricional inteligente',
    'Acompanhamento de progresso',
    'Comunidade exclusiva',
    'Suporte prioritário',
    'Acesso mobile e desktop',
    'Backup automático dos dados'
  ];

  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium mb-4">
            <Star className="h-4 w-4 mr-2" />
            Plano Premium
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Um investimento na sua
            <span className="block gradient-text">saúde e bem-estar</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Por menos de R$ 2,30 por dia, tenha acesso completo ao seu personal trainer 
            e nutricionista pessoal com inteligência artificial.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 text-white shadow-2xl">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-2 rounded-full text-sm font-bold flex items-center">
                <Star className="h-4 w-4 mr-1 fill-current" />
                MAIS POPULAR
              </div>
            </div>

            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold mb-2">FitAI Pro Premium</h3>
              <p className="text-blue-100 mb-6">Acesso completo a todas as funcionalidades</p>
              
              <div className="mb-4">
                <span className="text-5xl font-bold">R$ 69</span>
                <span className="text-2xl">,90</span>
                <span className="text-blue-200 ml-2">/mês</span>
              </div>
              
              <p className="text-sm text-blue-200">
                Apenas R$ 2,30 por dia • Cancele quando quiser
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="w-full bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 text-lg glow-button"
            >
              <Zap className="h-5 w-5 mr-2" />
              Começar Minha Transformação
            </Button>

            {/* Guarantee */}
            <div className="text-center mt-6 text-sm text-blue-200">
              🛡️ Garantia de 7 dias • 📱 Sem fidelidade • 💳 Pagamento seguro
            </div>
          </div>

          {/* Money back guarantee */}
          <div className="bg-gray-50 rounded-2xl p-6 mt-8 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="bg-green-100 rounded-full p-2">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Garantia de Satisfação</h4>
            <p className="text-gray-600 text-sm">
              Experimente por 24h. Se não estiver satisfeito, devolvemos 100% do seu dinheiro.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">Perguntas Frequentes</h3>
          <div className="space-y-6">
            {[
              {
                question: "Posso cancelar a qualquer momento?",
                answer: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento através do seu painel de controle."
              },
              {
                question: "A IA realmente funciona?",
                answer: "Nossa IA foi treinada com dados de milhares de treinos e é constantemente atualizada. Mais de 95% dos usuários relatam resultados nas primeiras 4 semanas."
              },
              {
                question: "Funciona para iniciantes?",
                answer: "Perfeitamente! Nossa IA adapta os treinos para todos os níveis, desde iniciantes até atletas avançados."
              },
              {
                question: "Preciso de equipamentos especiais?",
                answer: "Não necessariamente. A IA pode criar treinos para academia, casa, com ou sem equipamentos específicos."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
