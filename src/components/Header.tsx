import React from 'react';
import { Dumbbell, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const Header = () => {
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
            className="hidden md:inline-flex border-white/20 text-white hover:bg-white/10"
            onClick={() => window.location.href = '/auth'}
          >
            Entrar
          </Button>
          <Button 
            className="glow-button"
            onClick={() => window.location.href = '/auth'}
          >
            Começar Agora
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden border-white/20 text-white">
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
                  className="border-white/20 text-white hover:bg-white/10"
                  onClick={() => window.location.href = '/auth'}
                >
                  Entrar
                </Button>
                <Button 
                  className="glow-button"
                  onClick={() => window.location.href = '/auth'}
                >
                  Começar Agora
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
