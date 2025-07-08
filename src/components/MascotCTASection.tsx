import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ArrowRight, Star, Users, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import FitAIMascot from './FitAIMascot';

const MascotCTASection = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      window.location.href = '/dashboard';
    } else {
      window.location.href = '/auth';
    }
  };

  const stats = [
    { icon: Target, value: '95%', label: 'Taxa de Sucesso' },
    { icon: Users, value: '50k+', label: 'Usuários Ativos' },
    { icon: Trophy, value: '98%', label: 'Satisfação' },
    { icon: Star, value: '4.9', label: 'Avaliação' }
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Lado esquerdo - Mascote e CTA */}
          <div className="text-center lg:text-left">
            <div className="flex justify-center lg:justify-start mb-6">
              <FitAIMascot 
                variant="cta" 
                message="Pronto para transformar seu corpo com IA?"
                showCTA={true}
                onCTAClick={handleGetStarted}
              />
            </div>
            
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Mais de 50.000 pessoas já transformaram seus corpos!
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Seu <span className="gradient-text">Personal Trainer IA</span> está esperando por você!
              </h2>
              
              <p className="text-lg text-gray-600 max-w-2xl">
                Junte-se a milhares de pessoas que já descobriram o poder da inteligência artificial 
                para alcançar seus objetivos fitness. <span className="font-semibold text-blue-600">Comece grátis hoje!</span>
              </p>
            </div>
          </div>

          {/* Lado direito - Stats */}
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="flex items-center justify-center mb-3">
                      <stat.icon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 shadow-xl">
              <CardContent className="p-6 text-center text-white">
                <h3 className="text-xl font-bold mb-2">🎁 Oferta Especial</h3>
                <p className="text-blue-100 mb-4">
                  Comece gratuitamente e veja os resultados em apenas 7 dias!
                </p>
                <Button 
                  onClick={handleGetStarted}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full shadow-lg transform hover:scale-105 transition-all"
                >
                  <Zap className="h-5 w-5 mr-2" />
                  {user ? 'Ir para Dashboard' : 'Começar Agora - É Grátis!'}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MascotCTASection;