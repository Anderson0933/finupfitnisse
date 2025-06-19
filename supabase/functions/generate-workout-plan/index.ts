
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Função para limpar e validar JSON de forma mais robusta
function cleanAndParseJSON(content: string): any {
  console.log('🧹 Iniciando limpeza do JSON...');
  
  // Remover possíveis caracteres de markdown ou formatação
  let cleanContent = content
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .replace(/^\s*json\s*/i, '')
    .trim();

  // Encontrar o início e fim do JSON principal
  const jsonStart = cleanContent.indexOf('{');
  const jsonEnd = cleanContent.lastIndexOf('}');
  
  if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
    throw new Error('Não foi possível encontrar JSON válido na resposta');
  }
  
  cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
  
  // Validar balanceamento de chaves e colchetes
  const openBraces = (cleanContent.match(/{/g) || []).length;
  const closeBraces = (cleanContent.match(/}/g) || []).length;
  const openBrackets = (cleanContent.match(/\[/g) || []).length;
  const closeBrackets = (cleanContent.match(/\]/g) || []).length;
  
  console.log('🔍 Validação de estrutura:', { 
    openBraces, closeBraces, openBrackets, closeBrackets,
    tamanho: cleanContent.length 
  });
  
  if (openBraces !== closeBraces) {
    console.error('❌ Chaves desbalanceadas, tentando corrigir...');
    
    // Tentar corrigir chaves faltantes
    const diff = openBraces - closeBraces;
    if (diff > 0) {
      cleanContent += '}}'.repeat(diff);
    }
  }
  
  if (openBrackets !== closeBrackets) {
    console.error('❌ Colchetes desbalanceados, tentando corrigir...');
    
    // Tentar corrigir colchetes faltantes  
    const diff = openBrackets - closeBrackets;
    if (diff > 0) {
      cleanContent += ']'.repeat(diff);
    }
  }
  
  // Tentar parsing com diferentes estratégias
  let parsed;
  
  try {
    // Primeira tentativa - JSON direto
    parsed = JSON.parse(cleanContent);
    console.log('✅ JSON parseado com sucesso na primeira tentativa');
    return parsed;
  } catch (firstError) {
    console.warn('⚠️ Primeira tentativa falhou:', firstError.message);
    
    try {
      // Segunda tentativa - remover vírgulas extras
      const noExtraCommas = cleanContent
        .replace(/,(\s*[}\]])/g, '$1')  // Remove vírgulas antes de } e ]
        .replace(/,+/g, ',');          // Remove vírgulas duplicadas
      
      parsed = JSON.parse(noExtraCommas);
      console.log('✅ JSON parseado com sucesso na segunda tentativa (vírgulas)');
      return parsed;
    } catch (secondError) {
      console.warn('⚠️ Segunda tentativa falhou:', secondError.message);
      
      try {
        // Terceira tentativa - corrigir aspas
        const fixedQuotes = cleanContent
          .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')  // Adicionar aspas em chaves
          .replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ': "$1"$2'); // Adicionar aspas em valores string
        
        parsed = JSON.parse(fixedQuotes);
        console.log('✅ JSON parseado com sucesso na terceira tentativa (aspas)');
        return parsed;
      } catch (thirdError) {
        console.error('❌ Todas as tentativas de parsing falharam');
        console.error('Erro original:', firstError.message);
        console.error('Conteúdo problemático (primeiros 1000 chars):', cleanContent.substring(0, 1000));
        
        // Como último recurso, tentar extrair partes válidas
        throw new Error(`Erro ao processar JSON: ${firstError.message}`);
      }
    }
  }
}

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

    // Calcular total de treinos para 8 semanas (VOLTANDO PARA 8 SEMANAS)
    const totalWorkouts = workout_days * 8;

    const prompt = `
Você é um personal trainer brasileiro profissional. Crie um plano de treino personalizado em JSON válido.

DADOS DO CLIENTE:
- ${age} anos, ${height}cm, ${weight}kg (IMC: ${bmi.toFixed(1)} - ${bmiCategory})
- Nível: ${fitness_level}
- Objetivo: ${fitness_goals}
- Local: ${workout_location} - ${availableEquipment}
- ${workout_days} dias/semana, ${available_time} por treino
- Condições: ${health_conditions || 'Nenhuma'}

IMPORTANTE: Retorne APENAS JSON válido, sem formatação markdown, começando com { e terminando com }.

Estrutura obrigatória:
{
  "title": "Plano ${workout_days}x/semana - ${fitness_level}",
  "description": "Plano personalizado para ${fitness_goals} em ${workout_location}",
  "difficulty_level": "${fitness_level}",
  "duration_weeks": 8,
  "total_workouts": ${totalWorkouts},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Nome do Treino",
      "focus": "Grupos musculares trabalhados",
      "estimated_duration": ${parseInt(available_time)},
      "warm_up": {
        "duration": 5,
        "exercises": [
          {
            "name": "Exercício de aquecimento",
            "duration": 60,
            "instructions": "Instruções claras do movimento."
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Nome do exercício",
          "muscle_groups": ["grupo1", "grupo2"],
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "weight_guidance": "Orientação de carga",
          "instructions": "Instruções detalhadas de execução, posição corporal e respiração.",
          "form_cues": ["Dica importante 1", "Dica importante 2"],
          "progression_notes": "Como progredir na carga ou dificuldade."
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [
          {
            "name": "Alongamento",
            "duration": 45,
            "instructions": "Instruções do alongamento."
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "Hidrate-se bem durante o treino",
    "Consuma proteína após o treino"
  ],
  "progression_schedule": {
    "week_1_2": "Foco na adaptação e técnica",
    "week_3_4": "Aumento progressivo da intensidade",
    "week_5_6": "Intensificação do treinamento",
    "week_7_8": "Máxima intensidade e consolidação"
  }
}

Crie TODOS os ${totalWorkouts} treinos variados e completos para 8 SEMANAS. Use apenas equipamentos disponíveis para ${workout_location}.`;

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
            content: 'Você é um personal trainer brasileiro experiente. Responda APENAS com JSON válido, sem formatação markdown. Inicie com { e termine com }. Seja detalhado nas instruções dos exercícios.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 20000,
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
      const content = data.choices[0].message.content.trim();
      console.log('🔍 Tamanho do conteúdo recebido:', content.length, 'caracteres');
      
      // Usar nossa função robusta de limpeza e parsing
      workoutPlan = cleanAndParseJSON(content);
      
      console.log('✅ JSON parseado com sucesso');
      console.log('📋 Plano criado:', {
        title: workoutPlan.title,
        total_workouts: workoutPlan.total_workouts,
        workouts_count: workoutPlan.workouts?.length || 0,
        duration_weeks: workoutPlan.duration_weeks
      });
      
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('❌ Conteúdo problemático (primeiros 1500 chars):', data.choices[0].message.content.substring(0, 1500));
      throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }

    // Validação e correção do plano
    if (!workoutPlan.workouts || workoutPlan.workouts.length === 0) {
      console.error('❌ Nenhum treino encontrado no plano');
      throw new Error('Plano gerado sem treinos válidos');
    }

    // Garantir que temos 8 semanas e o número correto de treinos
    workoutPlan.duration_weeks = 8;
    
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
      console.log('✅ Número de treinos corrigido para 8 semanas');
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

    console.log('🎉 Plano gerado com sucesso - completo com', workoutPlan.workouts.length, 'treinos para 8 semanas');

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
