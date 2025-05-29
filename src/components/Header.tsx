
import { useState } from 'react';
import { Menu, X, Dumbbell, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  isAuthenticated?: boolean;
  userEmail?: string;
  onSignOut?: () => void;
}

const Header = ({ isAuthenticated = false, userEmail, onSignOut }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Dumbbell className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">FitAI Pro</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors">Início</a>
            <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Preços</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contato</a>
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{userEmail}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost">Entrar</Button>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Começar Agora
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white/95 backdrop-blur-md">
            <nav className="flex flex-col space-y-3">
              <a href="#home" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">Início</a>
              <a href="#features" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">Recursos</a>
              <a href="#pricing" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">Preços</a>
              <a href="#contact" className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors">Contato</a>
              
              {isAuthenticated ? (
                <div className="px-4 py-2 space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{userEmail}</span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onSignOut}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-2">
                  <Button variant="ghost" className="w-full">Entrar</Button>
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600">
                    Começar Agora
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
