
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      user_id, 
      age,
      height, 
      weight,
      fitness_level, 
      fitness_goals, 
      available_time, 
      preferred_exercises, 
      health_conditions, 
      workout_days, 
      workout_location 
    } = await req.json();

    console.log('🚀 Dados recebidos na API:', {
      user_id,
      age,
      height,
      weight,
      fitness_level,
      fitness_goals,
      available_time,
      preferred_exercises,
      health_conditions,
      workout_days,
      workout_location
    });

    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    console.log('✅ Chave Groq configurada, gerando prompt personalizado...');

    // Calcular IMC
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmiCategory = '';
    
    if (bmi < 18.5) bmiCategory = 'abaixo do peso';
    else if (bmi < 25) bmiCategory = 'peso normal';
    else if (bmi < 30) bmiCategory = 'sobrepeso';
    else bmiCategory = 'obesidade';

    // Determinar equipamentos baseado no local
    let availableEquipment = '';
    let workoutStyle = '';
    
    switch (workout_location) {
      case 'casa':
        availableEquipment = 'apenas peso corporal, sem equipamentos';
        workoutStyle = 'treinos funcionais com peso corporal';
        break;
      case 'casa_equipamentos':
        availableEquipment = 'halteres, elásticos, tapete, possível barra fixa';
        workoutStyle = 'treinos com equipamentos básicos';
        break;
      case 'academia':
        availableEquipment = 'equipamentos completos: máquinas, pesos livres, cardio';
        workoutStyle = 'musculação tradicional';
        break;
      case 'parque':
        availableEquipment = 'barras, paralelas, espaço para corrida';
        workoutStyle = 'calistenia e exercícios ao ar livre';
        break;
      case 'condominio':
        availableEquipment = 'equipamentos básicos de academia';
        workoutStyle = 'treinos adaptados';
        break;
    }

    // Calcular total exato de treinos - REDUZIDO para evitar JSON muito grande
    const totalWorkouts = Math.min(workout_days * 4, 16); // Máximo 16 treinos (4 semanas)

    const prompt = `
Você é um personal trainer brasileiro profissional. Crie um plano CONCISO em JSON válido com EXATAMENTE ${totalWorkouts} treinos.

DADOS:
- ${age} anos, ${height}cm, ${weight}kg (IMC: ${bmi.toFixed(1)} - ${bmiCategory})
- Nível: ${fitness_level}
- Objetivo: ${fitness_goals}
- Local: ${workout_location} - ${availableEquipment}
- ${workout_days} dias/semana, ${available_time} por treino
- Condições: ${health_conditions || 'Nenhuma'}

REGRAS CRÍTICAS:
1. Retorne APENAS JSON válido
2. MÁXIMO 2 exercícios principais por treino
3. Instruções MUITO BREVES (máx 15 palavras)
4. Use APENAS equipamentos de: ${workout_location}

JSON OBRIGATÓRIO:
{
  "title": "Plano ${workout_days}x/semana - ${fitness_level}",
  "description": "Plano para ${fitness_goals} em ${workout_location}",
  "difficulty_level": "${fitness_level}",
  "duration_weeks": 4,
  "total_workouts": ${totalWorkouts},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Nome do Treino",
      "focus": "Grupos trabalhados",
      "estimated_duration": ${parseInt(available_time)},
      "warm_up": {
        "duration": 5,
        "exercises": [{"name": "Aquecimento", "duration": 60, "instructions": "Descrição breve."}]
      },
      "main_exercises": [
        {
          "name": "Exercício 1",
          "muscle_groups": ["grupo1"],
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "weight_guidance": "Orientação breve",
          "instructions": "Instrução muito breve: posição, movimento, respiração.",
          "form_cues": ["Dica 1", "Dica 2"],
          "progression_notes": "Como progredir."
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [{"name": "Alongamento", "duration": 45, "instructions": "Alongue suavemente."}]
      }
    }
  ],
  "nutrition_tips": ["Hidrate-se bem", "Proteína pós-treino"],
  "progression_schedule": {
    "week_1_2": "Adaptação técnica",
    "week_3_4": "Aumento progressivo"
  }
}

Crie TODOS os ${totalWorkouts} treinos. Seja MUITO CONCISO. Máximo 2 exercícios principais por treino.`;

    console.log('📤 Enviando requisição para Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é um personal trainer brasileiro. Responda APENAS com JSON válido e conciso. Inicie com { e termine com }. Instruções muito breves.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 8000, // Reduzido drasticamente
        top_p: 0.9
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API Groq:', response.status, errorText);
      throw new Error(`Erro na API Groq: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do Groq');

    let workoutPlan;
    try {
      let content = data.choices[0].message.content.trim();
      console.log('🔍 Tamanho do conteúdo:', content.length, 'caracteres');
      
      // Limpeza mais agressiva do conteúdo
      const jsonStart = content.indexOf('{');
      const jsonEnd = content.lastIndexOf('}');
      
      if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
        console.error('❌ JSON inválido - marcadores não encontrados');
        throw new Error('Resposta não contém JSON válido');
      }
      
      content = content.substring(jsonStart, jsonEnd + 1);
      console.log('🧹 JSON extraído, tamanho final:', content.length);
      
      // Validação de balanceamento de chaves
      const openBraces = (content.match(/{/g) || []).length;
      const closeBraces = (content.match(/}/g) || []).length;
      
      if (openBraces !== closeBraces) {
        console.error('❌ Chaves desbalanceadas:', { openBraces, closeBraces });
        throw new Error(`Chaves desbalanceadas: ${openBraces} aberturas, ${closeBraces} fechamentos`);
      }
      
      workoutPlan = JSON.parse(content);
      console.log('✅ JSON parseado com sucesso');
      console.log('📋 Plano criado:', {
        title: workoutPlan.title,
        total_workouts: workoutPlan.total_workouts,
        workouts_count: workoutPlan.workouts?.length || 0
      });
      
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('❌ Conteúdo problemático (primeiros 500 chars):', data.choices[0].message.content.substring(0, 500));
      throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }

    // Validação e correção do plano
    if (!workoutPlan.workouts || workoutPlan.workouts.length === 0) {
      console.error('❌ Nenhum treino encontrado no plano');
      throw new Error('Plano gerado sem treinos válidos');
    }

    // Garantir que temos o número correto de treinos
    if (workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Ajustando número de treinos: ${workoutPlan.workouts.length} → ${totalWorkouts}`);
      
      // Se temos poucos treinos, duplicar os existentes
      while (workoutPlan.workouts.length < totalWorkouts) {
        const baseIndex = workoutPlan.workouts.length % (workoutPlan.workouts.length || 1);
        const baseWorkout = workoutPlan.workouts[baseIndex];
        const newWeek = Math.floor(workoutPlan.workouts.length / workout_days) + 1;
        const newDay = (workoutPlan.workouts.length % workout_days) + 1;
        
        const newWorkout = {
          ...baseWorkout,
          week: newWeek,
          day: newDay,
          title: `${baseWorkout.title} - S${newWeek}D${newDay}`
        };
        workoutPlan.workouts.push(newWorkout);
      }
      
      // Se temos muitos treinos, cortar
      if (workoutPlan.workouts.length > totalWorkouts) {
        workoutPlan.workouts = workoutPlan.workouts.slice(0, totalWorkouts);
      }
      
      workoutPlan.total_workouts = totalWorkouts;
      console.log('✅ Número de treinos corrigido');
    }

    // Salvar no banco de dados
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error: saveError } = await supabase
      .from('user_workout_plans')
      .insert({
        user_id: user_id,
        plan_data: workoutPlan
      });

    if (saveError) {
      console.error('❌ Erro ao salvar plano:', saveError);
    } else {
      console.log('✅ Plano salvo no banco de dados');
    }

    console.log('🎉 Plano gerado com sucesso');

    return new Response(JSON.stringify({ plan: workoutPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
