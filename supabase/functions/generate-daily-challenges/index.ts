
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🚀 Iniciando geração de desafios diários...')

    // Primeiro, limpar desafios antigos (mais de 30 dias)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { error: cleanupError } = await supabaseClient
      .from('challenges')
      .delete()
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (cleanupError) {
      console.log('⚠️ Erro na limpeza de desafios antigos:', cleanupError)
    } else {
      console.log('🧹 Limpeza de desafios antigos concluída')
    }

    // Buscar usuários que têm gamificação configurada
    const { data: users, error: usersError } = await supabaseClient
      .from('user_gamification')
      .select('user_id, fitness_category, last_challenge_request')

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError)
      throw usersError
    }

    console.log(`📊 Encontrados ${users?.length || 0} usuários para processar`)

    let processedUsers = 0
    let usersWithNewChallenges = 0

    for (const user of users || []) {
      try {
        console.log(`👤 Processando usuário: ${user.user_id}`)

        // Verificar se o usuário já solicitou desafios hoje
        const today = new Date().toISOString().split('T')[0]
        const lastRequest = user.last_challenge_request ? new Date(user.last_challenge_request).toISOString().split('T')[0] : null

        if (lastRequest === today) {
          console.log(`⏭️ Usuário ${user.user_id} já teve desafios gerados hoje`)
          continue
        }

        // Buscar desafios ativos do usuário
        const { data: activeChallenges, error: challengesError } = await supabaseClient
          .from('challenges')
          .select(`
            id,
            title,
            user_challenge_progress!inner(is_completed)
          `)
          .eq('is_active', true)
          .or(`created_for_user.is.null,created_for_user.eq.${user.user_id}`)

        if (challengesError) {
          console.error(`❌ Erro ao buscar desafios para usuário ${user.user_id}:`, challengesError)
          continue
        }

        // Verificar se há desafios não completados
        const incompleteChallenges = activeChallenges?.filter(challenge => 
          !challenge.user_challenge_progress?.some(progress => progress.is_completed)
        ) || []

        if (incompleteChallenges.length > 0) {
          console.log(`⏸️ Usuário ${user.user_id} ainda tem ${incompleteChallenges.length} desafios não completados`)
          continue
        }

        console.log(`✅ Usuário ${user.user_id} elegível para novos desafios`)

        // Gerar novos desafios personalizados
        const challenges = generateChallengesForUser(user.fitness_category || 'iniciante')

        // Inserir novos desafios no banco
        const challengesToInsert = challenges.map(challenge => ({
          ...challenge,
          created_for_user: user.user_id,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 dias
        }))

        const { error: insertError } = await supabaseClient
          .from('challenges')
          .insert(challengesToInsert)

        if (insertError) {
          console.error(`❌ Erro ao inserir desafios para usuário ${user.user_id}:`, insertError)
          continue
        }

        // Atualizar data da última geração de desafios
        const { error: updateError } = await supabaseClient
          .from('user_gamification')
          .update({ 
            last_challenge_request: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.user_id)

        if (updateError) {
          console.error(`❌ Erro ao atualizar data de última solicitação para usuário ${user.user_id}:`, updateError)
        }

        console.log(`🎯 ${challenges.length} novos desafios criados para usuário ${user.user_id}`)
        usersWithNewChallenges++

      } catch (error) {
        console.error(`❌ Erro ao processar usuário ${user.user_id}:`, error)
      }

      processedUsers++
    }

    console.log(`✅ Processamento concluído: ${processedUsers} usuários processados, ${usersWithNewChallenges} receberam novos desafios`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        processedUsers,
        usersWithNewChallenges,
        message: 'Desafios diários gerados com sucesso!' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Erro geral na geração de desafios:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function generateChallengesForUser(fitnessCategory: string) {
  const challengePool = {
    iniciante: [
      {
        title: "Caminhada Matinal",
        description: "Faça uma caminhada de 15 minutos pela manhã",
        type: "daily",
        category: "workout",
        target_value: 1,
        target_unit: "sessão",
        xp_reward: 15,
        difficulty: "easy"
      },
      {
        title: "Exercícios de Respiração",
        description: "Pratique 5 minutos de respiração profunda",
        type: "daily",
        category: "general",
        target_value: 1,
        target_unit: "sessão",
        xp_reward: 10,
        difficulty: "easy"
      },
      {
        title: "Hidratação Consciente",
        description: "Beba 6 copos de água ao longo do dia",
        type: "daily",
        category: "nutrition",
        target_value: 6,
        target_unit: "copos",
        xp_reward: 12,
        difficulty: "easy"
      }
    ],
    intermediario: [
      {
        title: "Treino de Força",
        description: "Complete 20 flexões (pode ser de joelho)",
        type: "daily",
        category: "workout",
        target_value: 20,
        target_unit: "repetições",
        xp_reward: 25,
        difficulty: "medium"
      },
      {
        title: "Corrida Intervalada",
        description: "Faça 3 sprints de 30 segundos com 1 minuto de descanso",
        type: "daily",
        category: "workout",
        target_value: 3,
        target_unit: "sprints",
        xp_reward: 30,
        difficulty: "medium"
      },
      {
        title: "Alimentação Balanceada",
        description: "Inclua uma porção de proteína em cada refeição",
        type: "daily",
        category: "nutrition",
        target_value: 3,
        target_unit: "refeições",
        xp_reward: 20,
        difficulty: "medium"
      }
    ],
    avancado: [
      {
        title: "Treino HIIT",
        description: "Complete um treino HIIT de 20 minutos",
        type: "daily",
        category: "workout",
        target_value: 1,
        target_unit: "treino",
        xp_reward: 40,
        difficulty: "hard"
      },
      {
        title: "Levantamento de Peso",
        description: "Faça 4 séries de 8 repetições de agachamento com peso",
        type: "daily",
        category: "workout",
        target_value: 4,
        target_unit: "séries",
        xp_reward: 35,
        difficulty: "hard"
      },
      {
        title: "Planejamento Nutricional",
        description: "Calcule e registre suas macros do dia",
        type: "daily",
        category: "nutrition",
        target_value: 1,
        target_unit: "registro",
        xp_reward: 25,
        difficulty: "hard"
      }
    ]
  }

  const challenges = challengePool[fitnessCategory] || challengePool.iniciante
  
  // Selecionar 2-3 desafios aleatórios
  const shuffled = challenges.sort(() => 0.5 - Math.random())
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 2) // 2 ou 3 desafios
}
