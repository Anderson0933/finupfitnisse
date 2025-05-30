
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

    // Calcular a data limite: 48h atrás (24h de teste + 24h de carência)
    const now = new Date()
    const limitDate = new Date(now.getTime() - 48 * 60 * 60 * 1000)
    
    console.log(`📅 Buscando usuários criados antes de: ${limitDate.toISOString()}`)

    // Buscar usuários que:
    // 1. Foram criados há mais de 48h
    // 2. Não têm assinatura ativa
    const { data: expiredUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select(`
        id,
        created_at,
        subscriptions!inner(id, status, expires_at)
      `)
      .lt('created_at', limitDate.toISOString())

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      throw usersError
    }

    console.log(`👥 Encontrados ${expiredUsers?.length || 0} usuários para verificar`)

    let deletedCount = 0

    for (const user of expiredUsers || []) {
      // Verificar se tem assinatura ativa
      const { data: activeSubscription } = await supabaseClient
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', now.toISOString())
        .maybeSingle()

      if (!activeSubscription) {
        console.log(`🗑️ Excluindo usuário ${user.id} (criado em ${user.created_at})`)
        
        try {
          // Excluir dados relacionados primeiro
          await supabaseClient.from('ai_conversations').delete().eq('user_id', user.id)
          await supabaseClient.from('user_progress').delete().eq('user_id', user.id)
          await supabaseClient.from('user_workout_plans').delete().eq('user_id', user.id)
          await supabaseClient.from('workout_plans').delete().eq('user_id', user.id)
          await supabaseClient.from('user_profiles').delete().eq('user_id', user.id)
          await supabaseClient.from('subscriptions').delete().eq('user_id', user.id)
          await supabaseClient.from('profiles').delete().eq('id', user.id)

          // Excluir usuário do auth (isso vai cascatear outras exclusões)
          const { error: deleteAuthError } = await supabaseClient.auth.admin.deleteUser(user.id)
          
          if (deleteAuthError) {
            console.error(`❌ Erro ao excluir usuário ${user.id} do auth:`, deleteAuthError)
          } else {
            deletedCount++
            console.log(`✅ Usuário ${user.id} excluído com sucesso`)
          }
        } catch (deleteError) {
          console.error(`❌ Erro ao excluir usuário ${user.id}:`, deleteError)
        }
      } else {
        console.log(`✅ Usuário ${user.id} tem assinatura ativa, mantendo conta`)
      }
    }

    console.log(`🎯 Limpeza concluída: ${deletedCount} contas excluídas`)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Limpeza concluída: ${deletedCount} contas excluídas`,
        deletedCount,
        checkedUsers: expiredUsers?.length || 0
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
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
