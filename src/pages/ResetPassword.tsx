
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Dumbbell, Lock, Eye, EyeOff, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [diagnosticInfo, setDiagnosticInfo] = useState<string>('');
  const [detailedError, setDetailedError] = useState<string>('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const validateResetToken = async () => {
      try {
        console.log('=== INICIANDO VALIDAÇÃO DE TOKEN ===');
        
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        const tokenHash = searchParams.get('token_hash');
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        console.log('🔍 PARÂMETROS DA URL:', { 
          type, 
          hasAccess: !!accessToken, 
          hasRefresh: !!refreshToken,
          hasTokenHash: !!tokenHash,
          error,
          errorDescription,
          fullUrl: window.location.href
        });

        // Se há erro explícito na URL
        if (error) {
          console.log('❌ Erro explícito na URL:', error, errorDescription);
          setDetailedError(`Erro: ${error} - ${errorDescription || 'Token inválido ou expirado'}`);
          setDiagnosticInfo(`Erro na URL: ${error}`);
          setIsValidSession(false);
          return;
        }

        setDiagnosticInfo(`Tipo: ${type || 'ausente'}, Token Hash: ${tokenHash ? 'Presente' : 'Ausente'}, Access Token: ${accessToken ? 'Presente' : 'Ausente'}`);

        // Verificar se é uma URL de recovery válida
        if (type !== 'recovery') {
          console.log('❌ Tipo inválido ou ausente:', type);
          setDetailedError(`Tipo de autenticação inválido: ${type || 'não especificado'}`);
          setIsValidSession(false);
          return;
        }

        // Estratégia 1: Usar verifyOtp com token_hash (método principal)
        if (tokenHash) {
          console.log('🔄 Validando com verifyOtp (token_hash)...');
          
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: 'recovery'
          });

          if (error) {
            console.error('❌ Erro verifyOtp:', error.message);
            setDetailedError(`verifyOtp falhou: ${error.message}`);
            
            // Se o token expirou, tentar estratégia alternativa
            if ((error.message.includes('expired') || error.message.includes('invalid')) && accessToken && refreshToken) {
              console.log('🔄 Token expirado, tentando setSession com tokens...');
              
              const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!sessionError && sessionData.session) {
                console.log('✅ Sessão estabelecida via setSession');
                setIsValidSession(true);
                setUserEmail(sessionData.session.user.email || '');
                setDetailedError('');
                return;
              } else {
                console.error('❌ setSession também falhou:', sessionError?.message);
                setDetailedError(`Ambos os métodos falharam. verifyOtp: ${error.message}, setSession: ${sessionError?.message || 'erro desconhecido'}`);
              }
            }
            
            setIsValidSession(false);
            return;
          }

          if (data.session && data.user) {
            console.log('✅ Token válido, sessão estabelecida via verifyOtp');
            setIsValidSession(true);
            setUserEmail(data.user.email || '');
            setDetailedError('');
            return;
          }
        }

        // Estratégia 2: Tentar setSession se tivermos os tokens
        if (accessToken && refreshToken) {
          console.log('🔄 Tentando setSession como backup...');
          
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (!sessionError && sessionData.session) {
            console.log('✅ Sessão estabelecida via setSession (backup)');
            setIsValidSession(true);
            setUserEmail(sessionData.session.user.email || '');
            setDetailedError('');
            return;
          } else {
            console.error('❌ setSession falhou:', sessionError?.message);
            setDetailedError(`setSession falhou: ${sessionError?.message || 'erro desconhecido'}`);
          }
        }

        // Se chegou até aqui, todos os métodos falharam
        console.log('❌ Todos os métodos de validação falharam');
        setDetailedError('Nenhum método de validação foi bem-sucedido. O link pode estar expirado ou inválido.');
        setIsValidSession(false);

      } catch (error: any) {
        console.error('❌ Erro geral na validação:', error);
        setDetailedError(`Erro inesperado: ${error.message}`);
        setIsValidSession(false);
      }
    };

    validateResetToken();
  }, [searchParams]);

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
        console.error('❌ Erro updateUser:', error);
        throw error;
      }

      console.log('✅ Senha atualizada com sucesso');

      toast({
        title: "Senha atualizada!",
        description: "Sua senha foi alterada com sucesso. Redirecionando...",
      });

      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro na atualização:', error);
      
      toast({
        title: "Erro ao atualizar senha",
        description: error.message || "Houve um problema ao atualizar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewLink = async () => {
    if (!userEmail) {
      navigate('/auth');
      toast({
        title: "Solicite um novo link",
        description: "Use a opção 'Esqueci minha senha' na página de login.",
      });
      return;
    }

    setResendLoading(true);

    try {
      // Usar a mesma lógica de detecção de ambiente da tela de login
      const isDevelopment = window.location.hostname === 'localhost' || 
                           window.location.hostname.includes('127.0.0.1') ||
                           window.location.hostname.includes('lovable.app');
      
      const redirectUrl = isDevelopment 
        ? `${window.location.origin}/reset-password`
        : 'https://fitaipro.cloud/reset-password';

      const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
        redirectTo: redirectUrl,
      });

      if (error) throw error;

      toast({
        title: "Novo link enviado!",
        description: "Verifique sua caixa de entrada para o novo link de redefinição.",
      });

    } catch (error: any) {
      console.error('Erro ao reenviar link:', error);
      toast({
        title: "Erro ao enviar link",
        description: "Não foi possível enviar um novo link. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setResendLoading(false);
    }
  };

  if (isValidSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
        <div className="text-center text-white">
          <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg mb-2">Verificando link de redefinição...</p>
          <p className="text-sm text-gray-400">{diagnosticInfo}</p>
          {detailedError && (
            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-left">
              <p className="text-xs text-red-300">Debug: {detailedError}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
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
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-400/30">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">Link inválido ou expirado</CardTitle>
              <CardDescription className="text-blue-200">
                O link de redefinição de senha expirou ou é inválido. 
                Links têm duração limitada por segurança.
              </CardDescription>
              
              {/* Informações de diagnóstico */}
              <div className="mt-4 space-y-2">
                <p className="text-xs text-gray-400">{diagnosticInfo}</p>
                {detailedError && (
                  <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-left">
                    <p className="text-xs text-red-300">Detalhes técnicos: {detailedError}</p>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                {userEmail && (
                  <Button 
                    onClick={handleRequestNewLink}
                    disabled={resendLoading}
                    className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
                  >
                    {resendLoading ? (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Enviando...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>Reenviar link</span>
                      </div>
                    )}
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/auth')}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                >
                  Solicitar novo link
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
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
            {userEmail && (
              <p className="text-sm text-gray-400 mt-2">Para: {userEmail}</p>
            )}
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
                className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold"
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
