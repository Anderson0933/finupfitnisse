
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPromoter: boolean;
  hasPremiumAccess: boolean;
}

export const useAuth = () => {
  const { toast } = useToast();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAdmin: false,
    isPromoter: false,
    hasPremiumAccess: false,
  });

  const checkUserPermissions = async (user: User | null) => {
    if (!user) {
      console.log('🔍 Limpando permissões - usuário não logado');
      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter: false,
        hasPremiumAccess: false,
      }));
      return;
    }

    try {
      console.log('🔍 Verificando permissões para usuário:', user.email);
      
      // Verificar se é admin/master - sempre tem acesso completo
      const isAdmin = user.email === 'casimiroanderson45@gmail.com';
      
      if (isAdmin) {
        console.log('👑 Usuário é admin - acesso total');
        setAuthState(prev => ({
          ...prev,
          isAdmin: true,
          isPromoter: false,
          hasPremiumAccess: true,
        }));
        return;
      }

      // Para usuários não-admin, verificar normalmente
      console.log('👤 Verificando status de promoter...');
      const { data: promoterData, error: promoterError } = await supabase
        .from('promoters')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (promoterError) {
        console.warn('⚠️ Erro ao verificar promoter:', promoterError.message);
      }

      const isPromoter = !!promoterData;
      console.log('⭐ Status de promoter:', isPromoter ? 'Ativo' : 'Não é promoter');

      // Verificar se tem assinatura ativa
      console.log('💳 Verificando assinatura ativa...');
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (subscriptionError) {
        console.warn('⚠️ Erro ao verificar assinatura:', subscriptionError.message);
      }

      const hasActiveSubscription = !!subscriptionData;
      console.log('💰 Assinatura ativa:', hasActiveSubscription ? 'Sim' : 'Não');

      const hasPremiumAccess = hasActiveSubscription || isPromoter;
      console.log('✅ Acesso premium:', hasPremiumAccess ? 'Liberado' : 'Bloqueado');

      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter,
        hasPremiumAccess,
      }));

    } catch (error: any) {
      console.error('💥 Erro ao verificar permissões:', error);
      
      // Não mostrar toast para erros de permissão para evitar spam
      // toast({ 
      //   title: "Erro ao verificar permissões", 
      //   description: "Algumas funcionalidades podem estar limitadas.", 
      //   variant: "destructive" 
      // });

      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter: false,
        hasPremiumAccess: false,
      }));
    }
  };

  useEffect(() => {
    console.log('🚀 Iniciando configuração de autenticação...');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Evento de auth:', event, session ? 'com sessão' : 'sem sessão');
        
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));
        
        // Check permissions after setting user (com delay para evitar problemas)
        setTimeout(() => {
          checkUserPermissions(session?.user ?? null);
        }, 100);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Erro ao obter sessão existente:', error);
      } else {
        console.log('🔍 Sessão existente encontrada:', session ? 'sim' : 'não');
      }
      
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
      
      setTimeout(() => {
        checkUserPermissions(session?.user ?? null);
      }, 100);
    });

    return () => {
      console.log('🧹 Limpando subscription de auth');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('👋 Fazendo logout...');
      await supabase.auth.signOut();
      console.log('✅ Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  return {
    ...authState,
    signOut,
    refreshPermissions: () => checkUserPermissions(authState.user),
  };
};
