
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🎯 Iniciando geração inteligente de desafios...')

    const today = new Date().toISOString().split('T')[0]
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const cleanupDate = sevenDaysAgo.toISOString().split('T')[0]

    // 1. LIMPEZA: Remover desafios antigos (mais de 7 dias)
    console.log('🧹 Iniciando limpeza de desafios antigos...')
    
    const { data: oldChallenges, error: selectError } = await supabase
      .from('challenges')
      .select('id')
      .lt('end_date', cleanupDate)

    if (selectError) {
      console.error('❌ Erro ao buscar desafios antigos:', selectError)
    } else if (oldChallenges && oldChallenges.length > 0) {
      // Primeiro, remover progresso dos usuários nos desafios antigos
      const { error: progressDeleteError } = await supabase
        .from('user_challenge_progress')
        .delete()
        .in('challenge_id', oldChallenges.map(c => c.id))

      if (progressDeleteError) {
        console.error('❌ Erro ao remover progresso antigo:', progressDeleteError)
      } else {
        console.log(`🗑️ Removido progresso de ${oldChallenges.length} desafios antigos`)
      }

      // Depois, remover os desafios antigos
      const { error: challengesDeleteError } = await supabase
        .from('challenges')
        .delete()
        .in('id', oldChallenges.map(c => c.id))

      if (challengesDeleteError) {
        console.error('❌ Erro ao remover desafios antigos:', challengesDeleteError)
      } else {
        console.log(`🗑️ Removidos ${oldChallenges.length} desafios antigos (anteriores a ${cleanupDate})`)
      }
    } else {
      console.log('✨ Nenhum desafio antigo para limpar')
    }

    // 2. Desativar desafios que expiraram
    await supabase
      .from('challenges')
      .update({ is_active: false })
      .lt('end_date', today)

    console.log('🗑️ Desafios expirados desativados')

    // 3. Buscar usuários que completaram todos os desafios ativos
    console.log('🔍 Buscando usuários que completaram todos os desafios ativos...')

    // Primeiro, buscar todos os desafios ativos
    const { data: activeChallenges, error: activeChallengesError } = await supabase
      .from('challenges')
      .select('id')
      .eq('is_active', true)
      .gte('end_date', today)

    if (activeChallengesError) {
      console.error('❌ Erro ao buscar desafios ativos:', activeChallengesError)
      throw activeChallengesError
    }

    console.log(`📊 Encontrados ${activeChallenges?.length || 0} desafios ativos`)

    let usersNeedingNewChallenges: string[] = []

    if (activeChallenges && activeChallenges.length > 0) {
      // Buscar usuários que completaram TODOS os desafios ativos
      const { data: userProgress, error: progressError } = await supabase
        .from('user_challenge_progress')
        .select('user_id, challenge_id, is_completed')
        .in('challenge_id', activeChallenges.map(c => c.id))
        .eq('is_completed', true)

      if (progressError) {
        console.error('❌ Erro ao buscar progresso dos usuários:', progressError)
      } else {
        // Agrupar por usuário e verificar quem completou todos
        const userCompletionMap = new Map<string, Set<string>>()
        
        userProgress?.forEach(progress => {
          if (!userCompletionMap.has(progress.user_id)) {
            userCompletionMap.set(progress.user_id, new Set())
          }
          userCompletionMap.get(progress.user_id)!.add(progress.challenge_id)
        })

        // Verificar quais usuários completaram TODOS os desafios ativos
        const totalActiveChallenges = activeChallenges.length
        usersNeedingNewChallenges = Array.from(userCompletionMap.entries())
          .filter(([userId, completedChallenges]) => 
            completedChallenges.size === totalActiveChallenges
          )
          .map(([userId]) => userId)

        console.log(`👥 ${usersNeedingNewChallenges.length} usuários completaram todos os desafios ativos`)
      }
    } else {
      // Se não há desafios ativos, buscar todos os usuários que têm gamificação
      console.log('📝 Nenhum desafio ativo encontrado, buscando todos os usuários...')
      const { data: allUsers, error: usersError } = await supabase
        .from('user_gamification')
        .select('user_id')

      if (usersError) {
        console.error('❌ Erro ao buscar usuários:', usersError)
      } else {
        usersNeedingNewChallenges = allUsers?.map(u => u.user_id) || []
        console.log(`👥 ${usersNeedingNewChallenges.length} usuários encontrados para novos desafios`)
      }
    }

    // 4. Gerar novos desafios personalizados
    if (usersNeedingNewChallenges.length === 0) {
      console.log('✅ Nenhum usuário precisa de novos desafios no momento')
      return new Response(
        JSON.stringify({ 
          message: 'Nenhum usuário precisa de novos desafios',
          cleaned: oldChallenges?.length || 0,
          usersReady: 0
        }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Templates de desafios por categoria
    const challengeTemplates = {
      daily: [
        {
          title: 'Treino do Dia',
          description: 'Complete 1 treino hoje',
          category: 'workout',
          target_value: 1,
          target_unit: 'treino',
          xp_reward: 20,
          difficulty: 'easy'
        },
        {
          title: 'Hidratação Diária',
          description: 'Beba 8 copos de água hoje',
          category: 'nutrition',
          target_value: 8,
          target_unit: 'copos',
          xp_reward: 15,
          difficulty: 'easy'
        },
        {
          title: 'Atividade Física',
          description: 'Faça 30 minutos de atividade física',
          category: 'workout',
          target_value: 30,
          target_unit: 'minutos',
          xp_reward: 25,
          difficulty: 'medium'
        },
        {
          title: 'Passo Saudável',
          description: 'Caminhe por 15 minutos',
          category: 'general',
          target_value: 15,
          target_unit: 'minutos',
          xp_reward: 10,
          difficulty: 'easy'
        }
      ]
    }

    // Gerar desafios diários para cada usuário
    let totalCreatedChallenges = 0

    for (const userId of usersNeedingNewChallenges) {
      // Selecionar 2-3 desafios aleatórios para cada usuário
      const selectedTemplates = challengeTemplates.daily
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)

      const userChallenges = selectedTemplates.map(template => ({
        ...template,
        type: 'daily',
        start_date: today,
        end_date: today,
        is_active: true,
        created_for_user: userId // Campo para rastrear para quem foi criado
      }))

      const { data: insertedChallenges, error: insertError } = await supabase
        .from('challenges')
        .insert(userChallenges)
        .select()

      if (insertError) {
        console.error(`❌ Erro ao criar desafios para usuário ${userId}:`, insertError)
      } else {
        totalCreatedChallenges += insertedChallenges?.length || 0
        console.log(`✅ ${insertedChallenges?.length || 0} novos desafios criados para usuário ${userId}`)
      }
    }

    console.log(`🎉 Total: ${totalCreatedChallenges} novos desafios criados para ${usersNeedingNewChallenges.length} usuários`)

    return new Response(
      JSON.stringify({ 
        message: 'Novos desafios gerados com sucesso!',
        usersWithNewChallenges: usersNeedingNewChallenges.length,
        totalChallengesCreated: totalCreatedChallenges,
        cleanedOldChallenges: oldChallenges?.length || 0
      }), 
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Erro na função generate-daily-challenges:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }), 
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
