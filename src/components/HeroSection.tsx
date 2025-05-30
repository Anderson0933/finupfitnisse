import { useState } from 'react';
import { Play, Star, Users, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-6">
              <Zap className="h-4 w-4 mr-2" />
              IA Avançada para Seus Treinos
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Transforme seu
              <span className="block gradient-text">Corpo com IA</span>
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
              Tenha um personal trainer e nutricionista pessoal 24/7. Nossa IA cria treinos personalizados, 
              acompanha sua evolução e ajusta seu plano automaticamente. <strong>Teste grátis por algumas horas!</strong>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg glow-button"
                onClick={() => window.location.href = '/auth'}
              >
                Começar Gratuitamente
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 px-8 py-4 text-lg"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="h-5 w-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Social proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-2 border-white"></div>
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">4.9/5</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Mais de 10.000 usuários ativos</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Video Placeholder Area */}
          <div className="relative animate-slide-up">
            <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl p-8 shadow-2xl">
              {/* Glass card overlay */}
              <div className="glass rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Seu Plano Hoje</h3>
                  <Trophy className="h-6 w-6 text-yellow-400" />
                </div>
                
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>Treino de Peito</span>
                      <span className="bg-green-500 px-2 py-1 rounded text-xs">Concluído</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>Cardio HIIT</span>
                      <span className="bg-blue-500 px-2 py-1 rounded text-xs">Em andamento</span>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex items-center justify-between text-white text-sm">
                      <span>Alongamento</span>
                      <span className="bg-gray-500 px-2 py-1 rounded text-xs">Pendente</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="text-white text-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span>Progresso Semanal</span>
                      <span className="font-semibold">85%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-float">
                <Zap className="h-6 w-6 text-blue-500" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                <Trophy className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Demonstração do FitAI Pro</h3>
              {/* Changed button content to simple 'X' */}
              <Button variant="ghost" onClick={() => setIsVideoPlaying(false)}>
                X
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden"> 
              <video 
                src="https://res.cloudinary.com/dz7g1kzxi/video/upload/v1748609800/ox7vf9biy1vqnknqn97o.mkv" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          </div>
        </div>
       )}
    </section>
  );
};

export default HeroSection;
