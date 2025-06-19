
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

    // Calcular total exato de treinos
    const totalWorkouts = workout_days * 8; // 8 semanas

    const prompt = `
Você é um personal trainer profissional brasileiro com mais de 15 anos de experiência. Crie um plano de treino CONCISO em formato JSON válido.

DADOS DO USUÁRIO:
- Idade: ${age} anos
- Altura: ${height} cm  
- Peso: ${weight} kg
- IMC: ${bmi.toFixed(1)} (${bmiCategory})
- Nível de condicionamento: ${fitness_level}
- Objetivos: ${fitness_goals}
- Dias de treino por semana: ${workout_days}
- Duração da sessão: ${available_time}
- Local: ${workout_location}
- Equipamentos disponíveis: ${availableEquipment}
- Exercícios preferidos: ${preferred_exercises || 'Nenhum especificado'}
- Condições de saúde: ${health_conditions || 'Nenhuma relatada'}

INSTRUÇÕES CRÍTICAS:
1. Retorne APENAS JSON válido, sem texto antes ou depois
2. Crie exatamente ${totalWorkouts} treinos (${workout_days} por semana × 8 semanas)
3. Cada treino deve ter duração de ${available_time}
4. Use APENAS equipamentos disponíveis em: ${workout_location}
5. Adapte intensidade para idade ${age} e IMC ${bmi.toFixed(1)}
6. TODAS as instruções devem estar em português brasileiro
7. Mantenha as instruções CONCISAS mas claras
8. Foque no essencial, evite textos muito longos
9. Máximo 3-4 exercícios principais por treino

ESTRUTURA JSON OBRIGATÓRIA:
{
  "title": "Plano 8 Semanas - ${fitness_level} (${age} anos)",
  "description": "Plano personalizado para ${bmiCategory}, ${workout_location}, focado em ${fitness_goals}",
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
            "name": "Nome do aquecimento",
            "duration": 60,
            "instructions": "Instruções concisas em português: posição inicial, movimento, respiração."
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
          "weight_guidance": "Orientação sobre carga",
          "instructions": "INSTRUÇÕES CONCISAS: Posição inicial, execução, respiração, finalização.",
          "form_cues": [
            "Core contraído",
            "Movimento controlado",
            "Respiração fluida"
          ],
          "progression_notes": "Como progredir semanalmente."
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [
          {
            "name": "Nome do alongamento",
            "duration": 45,
            "instructions": "Instruções concisas do alongamento."
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "Hidratação: 500ml de água 30min antes do treino",
    "Pré-treino: carboidratos 60-90min antes",
    "Pós-treino: proteína + carboidrato até 30min após"
  ],
  "progression_schedule": {
    "week_1_2": "Adaptação: foque na técnica",
    "week_3_4": "Sobrecarga: aumente peso/intensidade",
    "week_5_6": "Intensificação: reduza descansos",
    "week_7_8": "Pico: teste limites com segurança"
  }
}

IMPORTANTE: Crie TODOS os ${totalWorkouts} treinos. Mantenha as instruções CONCISAS para evitar problemas de parsing. Retorne APENAS o JSON válido.`;

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
            content: 'Você é um personal trainer brasileiro profissional. Responda APENAS com JSON válido e conciso. Inicie com { e termine com }. Mantenha instruções curtas mas claras.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 15000, // Reduzido para evitar respostas muito longas
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
      let content = data.choices[0].message.content;
      console.log('🔍 Tamanho do conteúdo recebido:', content.length, 'caracteres');
      
      // Limpeza mais robusta do conteúdo
      content = content.trim();
      
      // Remover qualquer texto antes da primeira chave
      const jsonStartIndex = content.indexOf('{');
      if (jsonStartIndex > 0) {
        content = content.substring(jsonStartIndex);
        console.log('🧹 Removido texto antes do JSON');
      }
      
      // Encontrar a última chave fechando válida
      let braceCount = 0;
      let lastValidIndex = -1;
      
      for (let i = 0; i < content.length; i++) {
        if (content[i] === '{') {
          braceCount++;
        } else if (content[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastValidIndex = i;
            break;
          }
        }
      }
      
      if (lastValidIndex > 0 && lastValidIndex < content.length - 1) {
        content = content.substring(0, lastValidIndex + 1);
        console.log('🧹 Removido texto após o JSON válido');
      }
      
      // Verificar se o JSON está completo
      if (!content.startsWith('{') || !content.endsWith('}')) {
        console.error('❌ JSON malformado - não inicia com { ou não termina com }');
        throw new Error('Resposta da API não é um JSON válido - formato incorreto');
      }
      
      // Tentar validar se é um JSON bem formado antes do parse
      const braceCheck = (content.match(/{/g) || []).length;
      const closeBraceCheck = (content.match(/}/g) || []).length;
      
      if (braceCheck !== closeBraceCheck) {
        console.error('❌ JSON malformado - chaves não balanceadas:', { braceCheck, closeBraceCheck });
        throw new Error('JSON malformado - chaves não balanceadas');
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
      console.error('❌ Primeiros 1000 chars do conteúdo:', data.choices[0].message.content.substring(0, 1000));
      throw new Error(`Erro ao processar resposta da IA: ${parseError.message}`);
    }

    // Validação do plano gerado
    if (!workoutPlan.workouts || workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Plano gerado com ${workoutPlan.workouts?.length || 0} treinos, esperado ${totalWorkouts}`);
      
      // Se temos pelo menos alguns treinos, tentar completar
      if (workoutPlan.workouts && workoutPlan.workouts.length > 0) {
        while (workoutPlan.workouts.length < totalWorkouts) {
          const baseWorkout = workoutPlan.workouts[workoutPlan.workouts.length % workout_days];
          const newWeek = Math.floor(workoutPlan.workouts.length / workout_days) + 1;
          const newDay = (workoutPlan.workouts.length % workout_days) + 1;
          
          const newWorkout = {
            ...baseWorkout,
            week: newWeek,
            day: newDay,
            title: `${baseWorkout.title} - Semana ${newWeek}`
          };
          workoutPlan.workouts.push(newWorkout);
        }
        workoutPlan.total_workouts = totalWorkouts;
        console.log('✅ Número de treinos corrigido automaticamente');
      }
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
