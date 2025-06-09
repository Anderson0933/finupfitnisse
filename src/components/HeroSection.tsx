
import { useState } from 'react';
import { Play, Star, Users, Trophy, Zap, Dumbbell, Target, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  return (
    <section id="home" className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-green-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/4 left-1/2 w-36 h-36 bg-orange-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '3s' }}></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 items-center w-full">
            {/* Content */}
            <div className="text-center lg:text-left animate-fade-in">
              {/* Fitness Badge */}
              <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium mb-8 backdrop-blur-sm">
                <Dumbbell className="h-5 w-5 mr-2 text-orange-400" />
                🔥 Transformação Corporal com IA
              </div>

              {/* Main heading with fitness focus */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-8">
                <span className="text-white">DESTRUA</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-500 to-pink-500">SEUS LIMITES</span>
                <br />
                <span className="text-white">COM IA</span>
              </h1>

              {/* Strong fitness description */}
              <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                💪 <strong className="text-orange-400">Personal trainer IA 24/7</strong> que cria treinos intensos, 
                acompanha cada repetição e acelera seus resultados. 
                <br />
                <span className="text-green-400 font-semibold">🎯 Resultados GARANTIDOS em 30 dias!</span>
              </p>

              {/* Stats row */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 mb-10">
                <div className="flex items-center text-white">
                  <div className="bg-orange-500 rounded-full p-2 mr-3">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl">95%</div>
                    <div className="text-sm text-gray-400">Taxa de Sucesso</div>
                  </div>
                </div>
                <div className="flex items-center text-white">
                  <div className="bg-blue-500 rounded-full p-2 mr-3">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl">30</div>
                    <div className="text-sm text-gray-400">Dias Resultados</div>
                  </div>
                </div>
                <div className="flex items-center text-white">
                  <div className="bg-green-500 rounded-full p-2 mr-3">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-2xl">15K+</div>
                    <div className="text-sm text-gray-400">Transformados</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-10 py-6 text-xl font-bold shadow-2xl transform hover:scale-105 transition-all duration-300"
                  onClick={() => window.location.href = '/auth'}
                >
                  🚀 INICIAR TRANSFORMAÇÃO
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg backdrop-blur-sm"
                  onClick={() => setIsVideoPlaying(true)}
                >
                  <Play className="h-6 w-6 mr-2" />
                  Ver Transformações
                </Button>
              </div>

              {/* Social proof with fitness focus */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-400 to-red-500 border-2 border-slate-900 flex items-center justify-center">
                        <Dumbbell className="h-4 w-4 text-white" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-white">4.9/5</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-400">✅ TESTE GRÁTIS POR 24H</div>
                  <div className="text-xs">Sem cartão • Sem compromisso</div>
                </div>
              </div>
            </div>

            {/* Fitness Dashboard Mock */}
            <div className="relative animate-slide-up">
              <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 shadow-2xl backdrop-blur-sm border border-white/10">
                {/* Workout Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-xl">💪 Seu Treino Hoje</h3>
                    <div className="flex items-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-400" />
                      <span className="text-yellow-400 font-bold">Nível 8</span>
                    </div>
                  </div>
                  
                  {/* Workout Cards */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <div className="font-bold">🔥 Supino Inclinado</div>
                          <div className="text-sm text-gray-300">4x12 • 80kg</div>
                        </div>
                        <div className="bg-green-500 px-3 py-1 rounded-full text-xs font-bold">FEITO</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <div className="font-bold">💥 Agachamento Búlgaro</div>
                          <div className="text-sm text-gray-300">3x15 cada perna</div>
                        </div>
                        <div className="bg-orange-500 px-3 py-1 rounded-full text-xs font-bold animate-pulse">ATIVO</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center justify-between text-white">
                        <div>
                          <div className="font-bold">⚡ HIIT Cardio</div>
                          <div className="text-sm text-gray-300">20 min • Alta intensidade</div>
                        </div>
                        <div className="bg-gray-600 px-3 py-1 rounded-full text-xs">PRÓXIMO</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white font-semibold">Progresso Semanal</span>
                      <span className="text-green-400 font-bold text-xl">92%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full animate-pulse" style={{ width: '92%' }}></div>
                    </div>
                    <div className="text-center mt-3 text-green-400 font-bold text-sm">
                      🎯 Meta: Queimar 2.500 calorias esta semana
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-6 -right-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-full p-4 shadow-lg animate-float">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4 shadow-lg animate-float" style={{ animationDelay: '1s' }}>
                  <Zap className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-4xl w-full border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🏆 Transformações Reais</h3>
              <Button variant="ghost" onClick={() => setIsVideoPlaying(false)} className="text-white hover:bg-white/10">
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden"> 
              <video 
                src="https://res.cloudinary.com/dz7g1kzxi/video/upload/v1748636068/svjomqwiyhnp6tzgfx6y.mp4" 
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
