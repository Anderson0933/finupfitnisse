
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🧹 Iniciando limpeza de contas expiradas...')
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calcular a data limite: 48h atrás
    const now = new Date()
    const limitDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    
    console.log(`📅 Buscando usuários para exclusão baseado em critérios de 48h`)

    // Buscar todos os usuários do auth
    const { data: authUsers, error: authError } = await supabaseClient.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Erro ao buscar usuários do auth:', authError)
      throw authError
    }

    let deletedCount = 0
    let checkedUsers = 0

    for (const user of authUsers.users) {
      checkedUsers++
      console.log(`🔍 Verificando usuário ${user.email} (${user.id})`)
      
      // Verificar se tem assinatura ativa
      const { data: activeSubscription, error: activeSubError } = await supabaseClient
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', now.toISOString())
        .maybeSingle()

      if (activeSubError && activeSubError.code !== 'PGRST116') {
        console.error(`❌ Erro ao verificar assinatura ativa para ${user.email}:`, activeSubError)
        continue
      }

      if (activeSubscription) {
        console.log(`✅ Usuário ${user.email} tem assinatura ativa, mantendo conta`)
        continue
      }

      // Verificar status de promoter
      const { data: promoterData, error: promoterError } = await supabaseClient
        .from('promoters')
        .select('status, deactivated_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (promoterError && promoterError.code !== 'PGRST116') {
        console.error(`❌ Erro ao verificar promoter para ${user.email}:`, promoterError)
        continue
      }

      // Se é promoter ativo, manter conta
      if (promoterData && promoterData.status === 'active') {
        console.log(`⭐ Usuário ${user.email} é promoter ativo, mantendo conta`)
        continue
      }

      // Verificar se já teve alguma assinatura paga (mesmo expirada)
      const { data: anySubscription, error: anySubError } = await supabaseClient
        .from('subscriptions')
        .select('id, status, payment_method, amount')
        .eq('user_id', user.id)
        .in('status', ['active', 'expired', 'cancelled'])
        .maybeSingle()

      if (anySubError && anySubError.code !== 'PGRST116') {
        console.error(`❌ Erro ao verificar histórico de assinaturas para ${user.email}:`, anySubError)
        continue
      }

      if (anySubscription) {
        console.log(`💰 Usuário ${user.email} já teve assinatura paga (${anySubscription.status}), mantendo conta`)
        continue
      }

      // Determinar se deve excluir baseado no tipo de usuário
      let shouldDelete = false
      
      if (promoterData && promoterData.status === 'inactive' && promoterData.deactivated_at) {
        // Ex-promoter: verificar se passou de 48h desde desativação
        const deactivatedAt = new Date(promoterData.deactivated_at)
        if (deactivatedAt < limitDate) {
          console.log(`🗑️ Ex-promoter ${user.email} desativado há mais de 48h, marcando para exclusão`)
          shouldDelete = true
        } else {
          console.log(`⏳ Ex-promoter ${user.email} ainda dentro do período de carência`)
        }
      } else if (!promoterData) {
        // Usuário normal: verificar se passou de 48h desde criação
        const userCreatedAt = new Date(user.created_at)
        if (userCreatedAt < limitDate) {
          console.log(`🗑️ Usuário normal ${user.email} criado há mais de 48h, marcando para exclusão`)
          shouldDelete = true
        } else {
          console.log(`⏳ Usuário normal ${user.email} ainda dentro do período de teste`)
        }
      }

      if (shouldDelete) {
        try {
          console.log(`🧹 Limpando dados relacionados do usuário ${user.email}`)
          
          // Excluir em ordem para evitar problemas de foreign key
          await supabaseClient.from('ai_conversations').delete().eq('user_id', user.id)
          await supabaseClient.from('user_progress').delete().eq('user_id', user.id)
          await supabaseClient.from('user_workout_plans').delete().eq('user_id', user.id)
          await supabaseClient.from('workout_plans').delete().eq('user_id', user.id)
          await supabaseClient.from('user_profiles').delete().eq('user_id', user.id)
          await supabaseClient.from('plan_progress').delete().eq('user_id', user.id)
          await supabaseClient.from('subscriptions').delete().eq('user_id', user.id)
          await supabaseClient.from('user_onboarding_status').delete().eq('user_id', user.id)
          await supabaseClient.from('user_gamification').delete().eq('user_id', user.id)
          await supabaseClient.from('user_challenge_progress').delete().eq('user_id', user.id)
          await supabaseClient.from('user_achievements').delete().eq('user_id', user.id)
          await supabaseClient.from('notifications').delete().eq('user_id', user.id)
          await supabaseClient.from('promoters').delete().eq('user_id', user.id)
          await supabaseClient.from('profiles').delete().eq('id', user.id)

          // Excluir usuário do auth (isso vai cascatear outras exclusões)
          const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user.id)
          
          if (deleteAuthError) {
            console.error(`❌ Erro ao excluir usuário ${user.email} do auth:`, deleteAuthError)
          } else {
            deletedCount++
            console.log(`✅ Usuário ${user.email} excluído com sucesso`)
          }
        } catch (deleteError) {
          console.error(`❌ Erro ao excluir usuário ${user.email}:`, deleteError)
        }
      }
    }

    console.log(`🎯 Limpeza concluída: ${deletedCount} contas excluídas de ${checkedUsers} verificadas`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Limpeza concluída: ${deletedCount} contas excluídas de ${checkedUsers} verificadas`,
        deletedCount,
        checkedUsers,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('💥 Erro na limpeza de contas:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
