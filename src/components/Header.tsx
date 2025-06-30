
import React, { useState, useEffect } from 'react';
import { Dumbbell, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Header = () => {
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

  const handleLogin = () => {
    if (user) {
      // Se usuário já está logado, vai para dashboard
      window.location.href = '/dashboard';
    } else {
      // Se não está logado, vai para página de auth
      window.location.href = '/auth';
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-white" />
          <span className="text-2xl font-bold text-white">FitAI Pro</span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-white hover:text-blue-300 transition-colors">
            Recursos
          </a>
          <a href="#pricing" className="text-white hover:text-blue-300 transition-colors">
            Preços
          </a>
          <a href="#contact" className="text-white hover:text-blue-300 transition-colors">
            Contato
          </a>
        </nav>

        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="hidden md:inline-flex border-white text-white hover:bg-white hover:text-blue-800 bg-white/10 backdrop-blur-sm"
            onClick={handleLogin}
          >
            {user ? 'Dashboard' : 'Entrar'}
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold"
            onClick={handleGetStarted}
          >
            {user ? 'Ir para Dashboard' : 'Começar Agora'}
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" className="md:hidden text-white bg-transparent hover:bg-white/10 border-none">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="glass border-white/20">
              <div className="flex flex-col space-y-4 mt-8">
                <a href="#features" className="text-white hover:text-blue-300 transition-colors">
                  Recursos
                </a>
                <a href="#pricing" className="text-white hover:text-blue-300 transition-colors">
                  Preços
                </a>
                <a href="#contact" className="text-white hover:text-blue-300 transition-colors">
                  Contato
                </a>
                <Separator className="bg-white/20" />
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-800 bg-white/10"
                  onClick={handleLogin}
                >
                  {user ? 'Dashboard' : 'Entrar'}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                  onClick={handleGetStarted}
                >
                  {user ? 'Ir para Dashboard' : 'Começar Agora'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
