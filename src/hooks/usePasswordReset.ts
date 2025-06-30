
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendPasswordReset = async (email: string) => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Por favor, insira seu email primeiro",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);

    try {
      console.log('=== ENVIANDO EMAIL DE RECUPERAÇÃO ===');
      console.log('Email:', email);
      
      // Usar a URL atual do projeto
      const redirectUrl = `${window.location.origin}/reset-password`;
      console.log('Redirect URL:', redirectUrl);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        console.error('❌ Erro do Supabase:', error);
        throw error;
      }

      console.log('✅ Email de recuperação enviado com sucesso');

      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha. Se não receber, verifique o spam.",
      });

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao enviar email:', error);
      
      let errorMessage = "Erro ao enviar email de recuperação";
      
      if (error.message?.includes('rate limit')) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error.message?.includes('invalid')) {
        errorMessage = "Email inválido ou não encontrado no sistema.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendPasswordReset,
    isLoading,
  };
};
