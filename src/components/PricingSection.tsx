
import { Check, Star, Zap, Dumbbell, Trophy, Target, Flame, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingSection = () => {
  const features = [
    '🤖 Personal Trainer IA 24/7',
    '🎯 Treinos adaptativos intensos',
    '🔥 Protocolos de queima de gordura',
    '💪 Planos de ganho de massa',
    '📊 Análise corporal avançada',
    '🏆 Sistema de conquistas',
    '👥 Comunidade de atletas',
    '📱 App premium sem ads',
    '⚡ Treinos de 15-45 minutos',
    '🥗 Nutrição esportiva completa',
    '🎮 Gamificação motivacional',
    '☁️ Backup automático'
  ];

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-slate-800 via-slate-900 to-black">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Trophy className="h-5 w-5 mr-2" />
            💎 Plano Elite
          </div>
          <h2 className="text-5xl font-black text-white mb-6">
            INVISTA NA SUA
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">TRANSFORMAÇÃO</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            💸 <strong className="text-green-400">Menos de R$ 2,30 por dia</strong> para ter o melhor personal trainer do mundo.
            <br />
            🎯 <strong className="text-orange-400">ROI garantido:</strong> economia de +R$ 3.000/mês vs personal presencial.
          </p>
        </div>

        {/* Pricing Card */}
        <div className="max-w-lg mx-auto">
          <div className="relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-3xl p-8 border border-green-500/30 backdrop-blur-sm shadow-2xl">
            {/* Popular badge */}
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-black px-8 py-3 rounded-full text-sm font-black flex items-center shadow-lg">
                <Flame className="h-5 w-5 mr-2" />
                🔥 MAIS ESCOLHIDO
              </div>
            </div>

            <div className="text-center mb-8 mt-6">
              <div className="flex items-center justify-center mb-4">
                <Dumbbell className="h-8 w-8 text-orange-400 mr-3" />
                <h3 className="text-3xl font-black text-white">FitAI Pro Elite</h3>
              </div>
              <p className="text-green-300 mb-6 font-semibold">💪 Acesso total ao arsenal fitness mais avançado do mundo</p>
              
              <div className="mb-6">
                <div className="flex items-center justify-center">
                  <span className="text-6xl font-black text-white">R$ 69</span>
                  <div className="ml-2">
                    <span className="text-3xl text-white">,90</span>
                    <div className="text-green-400 text-lg font-bold">/mês</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30 mb-6">
                <p className="text-sm text-green-300 font-bold">
                  💎 Apenas R$ 2,30/dia • 🚫 Sem fidelidade • ⚡ Cancele quando quiser
                </p>
              </div>

              {/* Comparison */}
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
                  <div className="text-red-300 font-bold">Personal Tradicional</div>
                  <div className="text-white text-lg font-bold">R$ 3.000+/mês</div>
                </div>
                <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
                  <div className="text-green-300 font-bold">FitAI Pro</div>
                  <div className="text-white text-lg font-bold">R$ 69,90/mês</div>
                </div>
              </div>
            </div>

            {/* Features with fitness focus */}
            <div className="space-y-3 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center">
                  <div className="bg-green-500 rounded-full p-1 mr-3 flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black py-6 text-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/auth'}
            >
              <Zap className="h-6 w-6 mr-2" />
              🚀 INICIAR MINHA TRANSFORMAÇÃO
            </Button>

            {/* Guarantee */}
            <div className="text-center mt-6 text-sm text-green-300 bg-green-500/10 rounded-xl p-4 border border-green-500/20">
              <div className="font-bold text-lg mb-2">🛡️ GARANTIA BLINDADA</div>
              <div>✅ 24h teste grátis • 🔄 7 dias satisfação garantida • 💳 Pagamento 100% seguro</div>
            </div>
          </div>

          {/* Money back guarantee */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-2xl p-6 mt-8 text-center border border-white/10 backdrop-blur-sm">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full p-3">
                <Target className="h-8 w-8 text-white" />
              </div>
            </div>
            <h4 className="font-black text-white mb-3 text-xl">🎯 PROMESSA DE RESULTADOS</h4>
            <p className="text-gray-300">
              <strong className="text-green-400">Não transformou em 30 dias?</strong>
              <br />
              Devolvemos 100% do seu dinheiro, sem perguntas.
            </p>
          </div>
        </div>

        {/* FAQ Section with fitness focus */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h3 className="text-3xl font-black text-center text-white mb-12">🤔 Dúvidas Frequentes</h3>
          <div className="space-y-6">
            {[
              {
                question: "🔥 Funciona mesmo para queimar gordura?",
                answer: "SIM! Nossa IA usa protocolos cientificamente comprovados de HIIT e treino funcional. 95% dos usuários perdem 2-5kg no primeiro mês."
              },
              {
                question: "💪 Consigo ganhar massa muscular?",
                answer: "CLARO! Algoritmos avançados calculam volume, intensidade e progressão perfeita para hipertrofia. Ganho médio de 1-3kg de músculo em 90 dias."
              },
              {
                question: "⏰ Tenho pouco tempo, funciona?",
                answer: "PERFEITO! Treinos de 15-45 minutos, 3-5x por semana. Eficiência máxima para quem tem rotina corrida."
              },
              {
                question: "🏠 Posso treinar em casa?",
                answer: "TOTAL! IA adapta treinos para qualquer lugar: casa, academia, parque. Com ou sem equipamentos."
              },
              {
                question: "🔰 Sou iniciante, é difícil?",
                answer: "IDEAL para iniciantes! IA começa do seu nível atual e evolui gradualmente. Impossível se machucar."
              },
              {
                question: "💳 Posso cancelar quando quiser?",
                answer: "SIM! Zero fidelidade. Cancele em 2 cliques pelo app a qualquer momento."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
                <h4 className="font-bold text-white mb-3 text-lg">{faq.question}</h4>
                <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
