
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Mail, Lock, User, Eye, EyeOff, Zap, Target, TrendingUp } from 'lucide-react';
import GoogleSignInButton from '@/components/GoogleSignInButton';

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Conta criada com sucesso!",
        description: "Verifique seu email para confirmar a conta.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex">
      {/* Left Side - Hero Section */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-center items-center p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-green-600/20" />
        <div className="relative z-10 max-w-md text-center">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Dumbbell className="h-16 w-16 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 gradient-text bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
            FitAI Pro
          </h1>
          
          <p className="text-xl text-blue-200 mb-8">
            Seu Personal Trainer com Inteligência Artificial
          </p>
          
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Zap className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Treinos Personalizados</h3>
                <p className="text-sm text-gray-300">IA cria planos únicos para seus objetivos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Acompanhamento Inteligente</h3>
                <p className="text-sm text-gray-300">Progresso monitorado automaticamente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold">Resultados Garantidos</h3>
                <p className="text-sm text-gray-300">Evolução constante e mensurável</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 lg:max-w-md xl:max-w-lg flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Dumbbell className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">FitAI Pro</h1>
            <p className="text-blue-200">Seu Personal Trainer IA</p>
          </div>

          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-white">Bem-vindo</CardTitle>
              <CardDescription className="text-blue-200">
                Entre ou crie sua conta para começar
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5">
                  <TabsTrigger 
                    value="signin" 
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
                  >
                    Entrar
                  </TabsTrigger>
                  <TabsTrigger 
                    value="signup"
                    className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300"
                  >
                    Cadastrar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-5">
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Seu email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Sua senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Entrando...</span>
                        </div>
                      ) : 'Entrar'}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparent px-2 text-gray-400">ou</span>
                      </div>
                    </div>
                    
                    <GoogleSignInButton />
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-5">
                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="text"
                          placeholder="Seu nome completo"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type="email"
                          placeholder="Seu email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Criar senha"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Criando conta...</span>
                        </div>
                      ) : 'Criar conta'}
                    </Button>
                    
                    <div className="relative my-6">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/20"></div>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-transparent px-2 text-gray-400">ou</span>
                      </div>
                    </div>
                    
                    <GoogleSignInButton />
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
