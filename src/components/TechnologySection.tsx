
import { Brain, Zap, Target, Smartphone, Cloud, Shield, BarChart3, Users } from 'lucide-react';

const TechnologySection = () => {
  const technologies = [
    {
      icon: Brain,
      title: 'Machine Learning Avançado',
      description: 'Nossa IA aprende continuamente com seus dados para otimizar seus treinos',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      title: 'Algoritmos Adaptativos',
      description: 'Ajustes automáticos baseados no seu progresso e feedback em tempo real',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: BarChart3,
      title: 'Análise Preditiva',
      description: 'Prevê seus resultados e ajusta estratégias para máxima eficiência',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Cloud,
      title: 'Processamento em Nuvem',
      description: 'Poder computacional ilimitado para análises complexas dos seus dados',
      color: 'from-orange-500 to-yellow-500'
    }
  ];

  const features = [
    'Reconhecimento de padrões corporais',
    'Otimização nutricional automatizada',
    'Prevenção de lesões com IA',
    'Motivação personalizada',
    'Integração com wearables',
    'Comunidade inteligente'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500 rounded-full opacity-10 animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-green-500 rounded-full opacity-10 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100/20 to-purple-100/20 text-blue-200 text-sm font-medium mb-4 backdrop-blur-sm border border-blue-300/30">
            <Zap className="h-4 w-4 mr-2" />
            Tecnologia de Ponta
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powered by
            <span className="block gradient-text">Inteligência Artificial</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nossa tecnologia revolucionária combina machine learning, análise de dados 
            e ciência do esporte para criar a experiência fitness mais avançada do mundo.
          </p>
        </div>

        {/* Technology Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {technologies.map((tech, index) => {
            const IconComponent = tech.icon;
            return (
              <div 
                key={index} 
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 hover:-translate-y-2"
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${tech.color} text-white mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="h-7 w-7" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-300 transition-colors">
                  {tech.title}
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {tech.description}
                </p>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Features List */}
          <div>
            <h3 className="text-3xl font-bold mb-8">
              Recursos que fazem a diferença
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-white font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: AI Visualization */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="text-center mb-6">
                <Brain className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
                <h4 className="text-xl font-semibold text-white mb-2">IA em Ação</h4>
                <p className="text-gray-300 text-sm">Processando dados em tempo real</p>
              </div>

              {/* Simulated Data Flow */}
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                  <span className="text-white text-sm">Análise Biomecânica</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full animate-pulse" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                  <span className="text-white text-sm">Otimização Nutricional</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '92%', animationDelay: '0.5s' }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
                  <span className="text-white text-sm">Previsão de Resultados</span>
                  <div className="w-16 bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full animate-pulse" style={{ width: '78%', animationDelay: '1s' }}></div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-3 animate-float">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full p-3 animate-float" style={{ animationDelay: '1s' }}>
                <Shield className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologySection;
