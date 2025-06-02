
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

    // Buscar usuários que foram criados há mais de 48h
    const { data: expiredUsers, error: usersError } = await supabaseClient
      .from('profiles')
      .select('id, created_at')
      .lt('created_at', limitDate.toISOString())

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      throw usersError
    }

    console.log(`👥 Encontrados ${expiredUsers?.length || 0} usuários para verificar`)

    let deletedCount = 0

    for (const user of expiredUsers || []) {
      console.log(`🔍 Verificando usuário ${user.id} (criado em ${user.created_at})`)
      
      // Verificar se tem assinatura ativa separadamente
      const { data: activeSubscription } = await supabaseClient
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .gte('expires_at', now.toISOString())
        .maybeSingle()

      if (!activeSubscription) {
        // Verificar se já teve alguma assinatura paga (mesmo expirada)
        const { data: anySubscription } = await supabaseClient
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'expired', 'cancelled'])
          .maybeSingle()

        if (!anySubscription) {
          console.log(`🗑️ Excluindo usuário ${user.id} - nunca teve assinatura paga`)
          
          try {
            // Excluir dados relacionados primeiro
            console.log(`🧹 Limpando dados relacionados do usuário ${user.id}`)
            
            await supabaseClient.from('ai_conversations').delete().eq('user_id', user.id)
            await supabaseClient.from('user_progress').delete().eq('user_id', user.id)
            await supabaseClient.from('user_workout_plans').delete().eq('user_id', user.id)
            await supabaseClient.from('workout_plans').delete().eq('user_id', user.id)
            await supabaseClient.from('user_profiles').delete().eq('user_id', user.id)
            await supabaseClient.from('plan_progress').delete().eq('user_id', user.id)
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
          console.log(`💰 Usuário ${user.id} já teve assinatura paga, mantendo conta`)
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
        checkedUsers: expiredUsers?.length || 0,
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
