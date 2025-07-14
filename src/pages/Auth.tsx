
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { sendPasswordReset } = usePasswordReset();

  const promoterCode = searchParams.get('promoter_code');
  const authType = searchParams.get('type');

  useEffect(() => {
    if (user && !authLoading) {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (authType === 'signup') {
      setIsLogin(false);
    }
  }, [authType]);

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleForgotPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-md backdrop-blur-xl bg-white/10 border-white/20 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-white">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </CardTitle>
          <CardDescription className="text-center text-blue-200">
            {promoterCode && !isLogin 
              ? 'Complete seu cadastro como promoter'
              : isLogin 
                ? 'Entre com suas credenciais'
                : 'Crie sua conta no FitAI'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLogin ? (
            <LoginForm 
              onToggleMode={handleToggleMode}
              onForgotPassword={handleForgotPassword}
            />
          ) : (
            <SignupForm onToggleMode={handleToggleMode} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
