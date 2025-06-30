import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log('=== VERIFICANDO SESSÃO DE RESET ===');
        console.log('URL atual:', window.location.href);
        console.log('Parâmetros da URL:', window.location.search);
        
        // Verificar se há parâmetros de reset na URL
        const urlParams = new URLSearchParams(window.location.search);
        const accessToken = urlParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token');
        const type = urlParams.get('type');
        
        console.log('Parâmetros encontrados:', {
          access_token: accessToken ? 'presente' : 'ausente',
          refresh_token: refreshToken ? 'presente' : 'ausente',
          type: type
        });
        
        // Se há tokens na URL, tentar fazer login com eles
        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Tentando fazer login com tokens da URL...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('❌ Erro ao definir sessão:', error);
            setIsValidSession(false);
            return;
          }
          
          console.log('✅ Sessão definida com sucesso:', data);
          setIsValidSession(true);
          return;
        }
        
        // Verificar se há uma sessão válida
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          setIsValidSession(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Sessão válida encontrada');
          setIsValidSession(true);
          return;
        }

        console.log('❌ Nenhuma sessão válida encontrada');
        setIsValidSession(false);

      } catch (error) {
        console.error('❌ Erro na verificação:', error);
        setIsValidSession(false);
      }
    };

    checkSession();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "Por favor, verifique se as senhas são iguais.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('=== ATUALIZANDO SENHA ===');
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('❌ Erro ao atualizar senha:', error);
        throw error;
      }

      console.log('✅ Senha atualizada com sucesso');

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso.",
      });

      // Redirecionar para login
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro:', error);
      
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Verificando...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Dumbbell className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">FitAI Pro</h1>
          </div>

          <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Link inválido</CardTitle>
              <CardDescription className="text-blue-200">
                O link de redefinição expirou ou é inválido.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <Button 
                onClick={() => navigate('/forgot-password')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              >
                Solicitar novo link
              </Button>
              
              <Button 
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
              >
                Voltar ao login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FitAI Pro</h1>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Nova senha</CardTitle>
            <CardDescription className="text-blue-200">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Atualizando...
                  </>
                ) : 'Atualizar senha'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
