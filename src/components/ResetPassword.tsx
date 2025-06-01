
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?tab=reset`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });

    } catch (error: any) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass border-white/20">
            <CardHeader>
              <CardTitle className="text-center text-white">Email Enviado!</CardTitle>
              <CardDescription className="text-center text-blue-200">
                Verifique sua caixa de entrada
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <div className="text-white">
                <p className="mb-4">
                  Enviamos um link para redefinir sua senha para:
                </p>
                <p className="font-medium text-blue-200">{email}</p>
              </div>
              
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/auth')}
                  className="w-full glow-button"
                >
                  Voltar ao Login
                </Button>
                
                <Button
                  onClick={() => {
                    setEmailSent(false);
                    setEmail('');
                  }}
                  variant="ghost"
                  className="w-full text-white hover:bg-white/10"
                >
                  Enviar para outro email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-green-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass border-white/20">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Mail className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-center text-white">Redefinir Senha</CardTitle>
            <CardDescription className="text-center text-blue-200">
              Digite seu email para receber um link de redefinição
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full glow-button"
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Link de Redefinição'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-blue-200">
                Lembrou da senha?{' '}
                <button
                  onClick={() => navigate('/auth')}
                  className="text-white hover:underline font-medium"
                >
                  Fazer login
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
