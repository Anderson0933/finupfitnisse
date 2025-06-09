
import { Bot, Dumbbell, Apple, TrendingUp, Users, Shield, Smartphone, Zap, Target, Flame, Timer, Award } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Bot,
      title: 'Personal Trainer IA',
      description: 'Coach virtual que te conhece melhor que você mesmo. Cria treinos personalizados que evoluem com seu progresso.',
      color: 'from-orange-500 to-red-600',
      intensity: '🔥'
    },
    {
      icon: Target,
      title: 'Treinos Personalizados',
      description: 'Algoritmo avançado que adapta exercícios, séries e cargas baseado na sua evolução em tempo real.',
      color: 'from-blue-500 to-purple-600',
      intensity: '🎯'
    },
    {
      icon: Flame,
      title: 'Queima de Gordura',
      description: 'Protocolos científicos de HIIT e treino funcional para acelerar seu metabolismo e queimar gordura 24h.',
      color: 'from-red-500 to-pink-600',
      intensity: '💥'
    },
    {
      icon: Timer,
      title: 'Treinos Rápidos',
      description: 'Sessões de 15-45 minutos que cabem na sua rotina. Máxima eficiência, resultados extraordinários.',
      color: 'from-green-500 to-emerald-600',
      intensity: '⚡'
    },
    {
      icon: Apple,
      title: 'Nutrição Esportiva',
      description: 'Planos alimentares para ganho de massa, definição ou performance. Receitas práticas e saborosas.',
      color: 'from-emerald-500 to-green-600',
      intensity: '🥗'
    },
    {
      icon: TrendingUp,
      title: 'Análise Avançada',
      description: 'Métricas detalhadas de força, resistência, composição corporal e evolução física mensal.',
      color: 'from-purple-500 to-indigo-600',
      intensity: '📊'
    },
    {
      icon: Award,
      title: 'Sistema de Conquistas',
      description: 'Gamificação inteligente com desafios, medalhas e rankings para manter sua motivação em alta.',
      color: 'from-yellow-500 to-orange-600',
      intensity: '🏆'
    },
    {
      icon: Users,
      title: 'Comunidade Fitness',
      description: 'Conecte-se com atletas, compartilhe conquistas e encontre parceiros de treino na sua região.',
      color: 'from-pink-500 to-rose-600',
      intensity: '👥'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium mb-6 backdrop-blur-sm">
            <Dumbbell className="h-5 w-5 mr-2" />
            💪 Arsenal Completo
          </div>
          <h2 className="text-5xl font-black text-white mb-6">
            TECNOLOGIA
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">DE PONTA</span>
            <span className="block text-white">PARA SEU FÍSICO</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            🚀 Ferramentas profissionais que transformam iniciantes em atletas. 
            <br />
            <strong className="text-orange-400">Metodologia comprovada por 15.000+ transformações.</strong>
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-white/10 hover:border-orange-500/30 transition-all duration-300 hover:-translate-y-2 backdrop-blur-sm"
              >
                {/* Intensity Badge */}
                <div className="absolute -top-3 -right-3 text-2xl">
                  {feature.intensity}
                </div>

                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <IconComponent className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-orange-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed text-sm">
                  {feature.description}
                </p>

                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA with fitness theme */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-10 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <div className="text-4xl mb-4">🔥💪🚀</div>
              <h3 className="text-3xl font-black mb-4">PRONTO PARA SUA MELHOR VERSÃO?</h3>
              <p className="text-orange-100 mb-8 text-lg max-w-2xl mx-auto">
                Junte-se a <strong>15.000+ atletas</strong> que já destruíram seus limites com nossa IA. 
                Resultados garantidos em 30 dias ou seu dinheiro de volta!
              </p>
              <button 
                className="bg-white text-orange-600 px-10 py-4 rounded-xl font-black text-xl hover:bg-gray-100 transition-colors shadow-2xl transform hover:scale-105"
                onClick={() => window.location.href = '/auth'}
              >
                🚀 COMEÇAR TRANSFORMAÇÃO AGORA
              </button>
              <div className="mt-4 text-orange-200 text-sm">
                ✅ Teste grátis por 24h • 🔒 Sem compromisso • 💳 Cancele quando quiser
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
