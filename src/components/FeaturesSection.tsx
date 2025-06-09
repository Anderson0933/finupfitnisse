
import { Bot, Dumbbell, Apple, TrendingUp, Users, Shield, Smartphone, Zap } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Bot,
      title: 'IA Personal Trainer',
      description: 'Assistente virtual inteligente que cria treinos personalizados baseados no seu perfil, objetivos e evolução.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Dumbbell,
      title: 'Treinos Adaptativos',
      description: 'Planos que evoluem com você. A IA ajusta exercícios, séries e cargas conforme seu progresso.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Apple,
      title: 'Nutrição Inteligente',
      description: 'Dicas personalizadas de alimentação e receitas saudáveis baseadas no seu estilo de vida.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: TrendingUp,
      title: 'Análise de Progresso',
      description: 'Acompanhe sua evolução com gráficos detalhados e insights inteligentes sobre seu desempenho.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      icon: Users,
      title: 'Comunidade Ativa',
      description: 'Conecte-se com outros usuários, compartilhe conquistas e encontre motivação na comunidade.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: Shield,
      title: 'Dados Seguros',
      description: 'Seus dados pessoais e de saúde são protegidos com criptografia de nível militar.',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      icon: Smartphone,
      title: 'App Responsivo',
      description: 'Acesse de qualquer dispositivo. Design otimizado para celular, tablet e desktop.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      icon: Zap,
      title: 'Resultados Rápidos',
      description: 'Metodologia comprovada que gera resultados visíveis nas primeiras semanas de treino.',
      color: 'from-yellow-500 to-yellow-600'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-4">
            <Zap className="h-4 w-4 mr-2" />
            Recursos Avançados
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Tudo que você precisa para
            <span className="block gradient-text">alcançar seus objetivos</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nossa plataforma combina inteligência artificial avançada com metodologias comprovadas 
            para criar a experiência de treino mais completa do mercado.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-6 w-6" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Pronto para começar sua transformação?</h3>
            <p className="text-blue-100 mb-6">Junte-se a milhares de pessoas que já estão alcançando seus objetivos com nossa IA.</p>
            <button className="bg-white text-blue-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors glow-button">
              Experimente Grátis por algumas horas.
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
