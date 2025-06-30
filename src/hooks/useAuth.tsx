
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isPromoter: boolean;
  hasPremiumAccess: boolean;
}

export const useAuth = () => {
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
      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter: false,
        hasPremiumAccess: false,
      }));
      return;
    }

    try {
      // Verificar se é admin/master - sempre tem acesso completo
      const isAdmin = user.email === 'casimiroanderson45@gmail.com';
      
      // Se é admin, pula todas as verificações e dá acesso total
      if (isAdmin) {
        setAuthState(prev => ({
          ...prev,
          isAdmin: true,
          isPromoter: false,
          hasPremiumAccess: true,
        }));
        return;
      }

      // Para usuários não-admin, verificar normalmente
      // Verificar se é promoter ativo
      const { data: promoterData } = await supabase
        .from('promoters')
        .select('status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const isPromoter = !!promoterData;

      // Verificar se tem assinatura ativa
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gt('expires_at', new Date().toISOString())
        .single();

      const hasActiveSubscription = !!subscriptionData;
      const hasPremiumAccess = hasActiveSubscription || isPromoter;

      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter,
        hasPremiumAccess,
      }));
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      setAuthState(prev => ({
        ...prev,
        isAdmin: false,
        isPromoter: false,
        hasPremiumAccess: false,
      }));
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          isLoading: false,
        }));
        
        // Check permissions after setting user
        setTimeout(() => {
          checkUserPermissions(session?.user ?? null);
        }, 0);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isLoading: false,
      }));
      
      setTimeout(() => {
        checkUserPermissions(session?.user ?? null);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signOut,
    refreshPermissions: () => checkUserPermissions(authState.user),
  };
};
