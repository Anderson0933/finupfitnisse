
import { useState, useEffect } from 'react';
import { Play, Star, Users, Trophy, Zap, ArrowRight, Clock, Target, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import FitAIMascot from './FitAIMascot';

const HeroSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se usuário está logado
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      // Se usuário já está logado, vai para dashboard
      window.location.href = '/dashboard';
    } else {
      // Se não está logado, vai para página de auth
      window.location.href = '/auth';
    }
  };

  // Array de fotos reais de usuários para as avaliações
  const userPhotos = [
    "/lovable-uploads/0b060a08-68e5-4f13-b13a-fe6265993f15.png",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=40&h=40&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face"
  ];

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-green-50">
      {/* Enhanced background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-40 left-1/2 w-96 h-96 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-3 h-3 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-32 left-40 w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Enhanced Content */}
          <div className="text-center lg:text-left animate-fade-in">
            {/* Mascote Hero */}
            <div className="flex justify-center lg:justify-start mb-6">
              <FitAIMascot 
                variant="hero" 
                message="Oi! Sou o FitAI, seu personal trainer IA! 💪"
              />
            </div>
            
            {/* Enhanced Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-sm font-medium mb-8 border border-blue-200">
              <Brain className="h-5 w-5 mr-2" />
              <span className="font-semibold">IA Avançada</span>
              <span className="mx-2">•</span>
              <span>Resultados Comprovados</span>
            </div>

            {/* Enhanced Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-8">
              <span className="block text-gray-900">Seu Personal</span>
              <span className="block gradient-text">IA Definitivo</span>
              <span className="block text-gray-700 text-3xl sm:text-4xl lg:text-5xl mt-2">está aqui!</span>
            </h1>

            {/* Enhanced Description */}
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transforme seu corpo com <span className="font-semibold text-blue-600">inteligência artificial avançada</span>. 
              Treinos adaptativos, nutrição personalizada e acompanhamento 24/7. 
              <span className="block mt-2 text-lg text-green-600 font-medium">✨ Comece grátis agora!</span>
            </p>

            {/* Enhanced Stats */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-6 w-6 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">95%</span>
                </div>
                <p className="text-sm text-gray-600">Taxa de Sucesso</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-green-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">24/7</span>
                </div>
                <p className="text-sm text-gray-600">Disponibilidade</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-6 w-6 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold text-gray-900">50k+</span>
                </div>
                <p className="text-sm text-gray-600">Usuários Ativos</p>
              </div>
            </div>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-10 py-5 text-xl font-semibold glow-button shadow-2xl transform transition-all hover:scale-105"
                onClick={handleGetStarted}
              >
                <Zap className="h-6 w-6 mr-2" />
                {user ? 'Ir para Dashboard' : 'Começar Gratuitamente'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-gray-300 hover:border-blue-500 px-10 py-5 text-xl font-medium bg-white/80 backdrop-blur-sm hover:bg-blue-50 transition-all"
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="h-6 w-6 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Enhanced Social proof with real user photos */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {userPhotos.slice(0, 5).map((photo, i) => (
                    <img 
                      key={i} 
                      src={photo}
                      alt={`Usuário ${i + 1}`}
                      className="w-10 h-10 rounded-full border-3 border-white shadow-lg object-cover"
                    />
                  ))}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 border-3 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
                    +50k
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1,2,3,4,5].map((i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <span className="font-semibold text-gray-900">4.9/5</span>
                  </div>
                  <span className="text-xs text-gray-500">(2.847 avaliações)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">50.000+ usuários transformados</span>
              </div>
            </div>
          </div>

          {/* Enhanced Hero Interactive Area */}
          <div className="relative animate-slide-up">
            <div className="relative bg-gradient-to-br from-blue-500 via-purple-600 to-green-500 rounded-3xl p-8 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Enhanced glass card overlay */}
              <div className="glass rounded-2xl p-8 space-y-6 transform -rotate-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-bold text-xl">Dashboard IA</h3>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-400" />
                    <span className="text-yellow-300 font-semibold">Nível PRO</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span className="font-medium">Treino Personalizado</span>
                      <span className="bg-green-500 px-3 py-1 rounded-full text-xs font-semibold">Ativo</span>
                    </div>
                    <div className="text-white/80 text-sm">Adaptado ao seu nível e objetivos</div>
                  </div>
                  
                  <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span className="font-medium">Plano Nutricional IA</span>
                      <span className="bg-blue-500 px-3 py-1 rounded-full text-xs font-semibold">Atualizado</span>
                    </div>
                    <div className="text-white/80 text-sm">Baseado em suas preferências</div>
                  </div>
                  
                  <div className="bg-white/25 rounded-xl p-4 backdrop-blur-sm">
                    <div className="flex items-center justify-between text-white text-sm mb-2">
                      <span className="font-medium">Progresso Semanal</span>
                      <span className="bg-purple-500 px-3 py-1 rounded-full text-xs font-semibold">+12%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-3 mt-2">
                      <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full animate-pulse" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="text-white text-sm">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">Meta Mensal</span>
                      <span className="font-bold text-lg">78% Concluída</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/80">
                      <Brain className="h-4 w-4" />
                      <span>IA analisando seus dados...</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced floating badges */}
              <div className="absolute -top-6 -right-6 bg-white rounded-full p-4 shadow-xl animate-float">
                <Brain className="h-8 w-8 text-blue-500" />
              </div>
              
              <div className="absolute -bottom-6 -left-6 bg-white rounded-full p-4 shadow-xl animate-float" style={{ animationDelay: '1s' }}>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>

              <div className="absolute top-6 -left-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full px-4 py-2 shadow-lg animate-float" style={{ animationDelay: '2s' }}>
                <span className="text-sm font-semibold">IA Ativa</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Video Modal */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-5xl w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Veja o FitAI Pro em Ação</h3>
              <Button 
                variant="ghost" 
                onClick={() => setIsVideoPlaying(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-inner"> 
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
            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">Pronto para começar sua transformação?</p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3"
                onClick={() => {
                  setIsVideoPlaying(false);
                  handleGetStarted();
                }}
              >
                {user ? 'Ir para Dashboard' : 'Começar Agora Gratuitamente'}
              </Button>
            </div>
          </div>
        </div>
       )}
    </section>
  );
};

export default HeroSection;
