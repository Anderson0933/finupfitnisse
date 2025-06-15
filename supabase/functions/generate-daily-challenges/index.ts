
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

    console.log('🎯 Iniciando geração automática de desafios diários...')

    // Desativar desafios antigos que expiraram
    const today = new Date().toISOString().split('T')[0]
    
    await supabase
      .from('challenges')
      .update({ is_active: false })
      .lt('end_date', today)

    console.log('🗑️ Desafios expirados desativados')

    // Verificar se já existem desafios ativos para hoje
    const { data: existingChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('type', 'daily')
      .eq('start_date', today)
      .eq('is_active', true)

    if (existingChallenges && existingChallenges.length > 0) {
      console.log('✅ Desafios diários já existem para hoje')
      return new Response(
        JSON.stringify({ message: 'Desafios diários já existem para hoje' }), 
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gerar novos desafios diários
    const newDailyChallenges = [
      {
        title: 'Treino do Dia',
        description: 'Complete 1 treino hoje',
        type: 'daily',
        category: 'workout',
        target_value: 1,
        target_unit: 'treino',
        xp_reward: 20,
        difficulty: 'easy',
        start_date: today,
        end_date: today,
        is_active: true
      },
      {
        title: 'Hidratação Diária',
        description: 'Beba 8 copos de água hoje',
        type: 'daily',
        category: 'nutrition',
        target_value: 8,
        target_unit: 'copos',
        xp_reward: 15,
        difficulty: 'easy',
        start_date: today,
        end_date: today,
        is_active: true
      },
      {
        title: 'Atividade Física',
        description: 'Faça 30 minutos de atividade física',
        type: 'daily',
        category: 'workout',
        target_value: 30,
        target_unit: 'minutos',
        xp_reward: 25,
        difficulty: 'medium',
        start_date: today,
        end_date: today,
        is_active: true
      },
      {
        title: 'Passo Saudável',
        description: 'Caminhe por 15 minutos',
        type: 'daily',
        category: 'general',
        target_value: 15,
        target_unit: 'minutos',
        xp_reward: 10,
        difficulty: 'easy',
        start_date: today,
        end_date: today,
        is_active: true
      }
    ]

    const { data: insertedChallenges, error: insertError } = await supabase
      .from('challenges')
      .insert(newDailyChallenges)
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir novos desafios:', insertError)
      throw insertError
    }

    console.log(`✅ ${insertedChallenges?.length || 0} novos desafios diários criados para ${today}`)

    // Verificar e gerar desafios semanais se necessário
    const { data: weeklyActiveChallenges } = await supabase
      .from('challenges')
      .select('id')
      .eq('type', 'weekly')
      .eq('is_active', true)
      .gte('end_date', today)

    if (!weeklyActiveChallenges || weeklyActiveChallenges.length === 0) {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 6) // 7 dias no total

      const newWeeklyChallenges = [
        {
          title: 'Guerreiro da Semana',
          description: 'Complete 5 treinos esta semana',
          type: 'weekly',
          category: 'workout',
          target_value: 5,
          target_unit: 'treinos',
          xp_reward: 100,
          difficulty: 'medium',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: true
        },
        {
          title: 'Consistência Semanal',
          description: 'Complete desafios diários por 7 dias consecutivos',
          type: 'weekly',
          category: 'general',
          target_value: 7,
          target_unit: 'dias',
          xp_reward: 75,
          difficulty: 'medium',
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          is_active: true
        }
      ]

      const { data: weeklyInserted, error: weeklyError } = await supabase
        .from('challenges')
        .insert(newWeeklyChallenges)
        .select()

      if (weeklyError) {
        console.error('❌ Erro ao inserir desafios semanais:', weeklyError)
      } else {
        console.log(`✅ ${weeklyInserted?.length || 0} novos desafios semanais criados`)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Novos desafios gerados com sucesso!',
        dailyChallenges: insertedChallenges?.length || 0
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
