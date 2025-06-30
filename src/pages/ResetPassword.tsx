
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handlePasswordRecovery = async () => {
      try {
        console.log('=== INICIANDO PROCESSO DE RECOVERY ===');
        
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        console.log('Parâmetros URL:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type,
          fullUrl: window.location.href
        });

        if (type !== 'recovery' || !accessToken || !refreshToken) {
          throw new Error('Link de recuperação inválido ou expirado');
        }

        console.log('Estabelecendo sessão com tokens...');
        
        // Primeiro, vamos garantir que não há sessão ativa
        await supabase.auth.signOut();
        
        // Aguardar um momento para garantir que a sessão foi limpa
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Estabelecer nova sessão com os tokens
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        console.log('Resultado setSession:', { 
          hasSession: !!sessionData.session,
          hasUser: !!sessionData.user,
          error: sessionError?.message 
        });

        if (sessionError) {
          throw new Error(`Erro ao estabelecer sessão: ${sessionError.message}`);
        }

        if (!sessionData.session || !sessionData.user) {
          throw new Error('Não foi possível estabelecer sessão válida');
        }

        // Verificar se a sessão está realmente ativa
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('Verificação final da sessão:', { 
          hasCurrentSession: !!currentSession.session,
          sessionId: currentSession.session?.user?.id
        });

        if (!currentSession.session) {
          throw new Error('Sessão não persistiu após estabelecimento');
        }

        setIsValidSession(true);
        console.log('✅ Sessão estabelecida com sucesso!');

      } catch (error: any) {
        console.error('❌ Erro no processo de recovery:', error);
        setIsValidSession(false);
        
        toast({
          title: "Link inválido ou expirado",
          description: error.message || "Por favor, solicite um novo link de redefinição de senha.",
          variant: "destructive",
        });
        
        setTimeout(() => navigate('/auth'), 3000);
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordRecovery();
  }, [navigate, toast, searchParams]);

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
      console.log('=== INICIANDO ATUALIZAÇÃO DE SENHA ===');
      
      // Verificar sessão antes de tentar atualizar
      const { data: currentSession } = await supabase.auth.getSession();
      console.log('Sessão atual antes da atualização:', { 
        hasSession: !!currentSession.session,
        userId: currentSession.session?.user?.id 
      });

      if (!currentSession.session) {
        throw new Error('Sessão não encontrada. Tente acessar o link novamente.');
      }

      console.log('Tentando atualizar senha...');
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });

      console.log('Resultado updateUser:', { 
        success: !!data.user, 
        error: error?.message,
        errorCode: error?.status
      });

      if (error) {
        if (error.message?.includes('session_not_found') || error.status === 403) {
          throw new Error('Sessão expirada. Por favor, solicite um novo link de redefinição.');
        }
        throw error;
      }

      if (!data.user) {
        throw new Error('Erro inesperado na atualização da senha');
      }

      console.log('✅ Senha atualizada com sucesso!');

      toast({
        title: "Senha atualizada com sucesso!",
        description: "Você será redirecionado para fazer login.",
      });

      // Fazer logout e redirecionar
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro na atualização de senha:', error);
      
      let errorMessage = "Ocorreu um erro inesperado. Tente novamente.";
      
      if (error.message?.includes('session_not_found') || error.status === 403) {
        errorMessage = "Sessão expirada. Por favor, solicite um novo link de redefinição.";
      } else if (error.message?.includes('weak_password')) {
        errorMessage = "A senha é muito fraca. Use uma senha mais forte.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao atualizar senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p>Verificando link de redefinição...</p>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <p>Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Header com logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <Dumbbell className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">FitAI Pro</h1>
          <p className="text-blue-200">Redefinir senha</p>
        </div>

        <Card className="backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-green-500/20 backdrop-blur-sm rounded-xl border border-green-400/30">
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl text-white">Criar nova senha</CardTitle>
            <CardDescription className="text-blue-200">
              Digite sua nova senha abaixo
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Nova senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua nova senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                    minLength={6}
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
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Confirmar senha</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme sua nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:border-green-400 focus:ring-1 focus:ring-green-400"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Indicador de força da senha */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-xs">
                    <div className={`h-2 w-full rounded-full ${
                      password.length >= 8 ? 'bg-green-500' : 
                      password.length >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className={
                      password.length >= 8 ? 'text-green-400' : 
                      password.length >= 6 ? 'text-yellow-400' : 'text-red-400'
                    }>
                      {password.length >= 8 ? 'Forte' : 
                       password.length >= 6 ? 'Média' : 'Fraca'}
                    </span>
                  </div>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={loading || !password || !confirmPassword}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                ) : 'Atualizar senha'}
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="w-full text-gray-300 hover:text-white hover:bg-white/10"
              >
                Voltar ao login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
