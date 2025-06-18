
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

    console.log('✅ Chave Groq configurada, gerando prompt personalizado avançado...');

    // Calcular IMC
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    let bmiCategory = '';
    
    if (bmi < 18.5) bmiCategory = 'abaixo do peso';
    else if (bmi < 25) bmiCategory = 'peso normal';
    else if (bmi < 30) bmiCategory = 'sobrepeso';
    else bmiCategory = 'obesidade';

    // Determinar experiência baseada na idade e nível
    let experienceLevel = '';
    if (age < 25 && fitness_level === 'sedentario') {
      experienceLevel = 'jovem iniciante';
    } else if (age >= 40 && fitness_level === 'intermediario') {
      experienceLevel = 'adulto experiente';
    } else if (age >= 50) {
      experienceLevel = 'adulto maduro';
    } else {
      experienceLevel = fitness_level;
    }

    // Definir equipamentos baseado no local
    let availableEquipment = '';
    let workoutStyle = '';
    
    switch (workout_location) {
      case 'casa':
        availableEquipment = 'apenas peso corporal, sem equipamentos';
        workoutStyle = 'treinos funcionais com peso corporal, flexibilidade e cardio';
        break;
      case 'casa_equipamentos':
        availableEquipment = 'halteres, elásticos, tapete, possível barra fixa';
        workoutStyle = 'treinos com equipamentos básicos, exercícios funcionais';
        break;
      case 'academia':
        availableEquipment = 'equipamentos completos: máquinas, pesos livres, cardio';
        workoutStyle = 'musculação tradicional com progressão de cargas';
        break;
      case 'parque':
        availableEquipment = 'barras, paralelas, espaço para corrida e exercícios ao ar livre';
        workoutStyle = 'calistenia, corrida, exercícios funcionais ao ar livre';
        break;
      case 'condominio':
        availableEquipment = 'equipamentos básicos de academia';
        workoutStyle = 'treinos adaptados com equipamentos limitados';
        break;
    }

    // Calcular total exato de treinos
    const totalWorkouts = workout_days * 8; // 8 semanas

    const prompt = `
Você é um personal trainer especialista em criar planos de treino personalizados. 

DADOS PESSOAIS DO CLIENTE:
- Idade: ${age} anos
- Altura: ${height} cm
- Peso: ${weight} kg
- IMC: ${bmi.toFixed(1)} (${bmiCategory})
- Nível de experiência: ${experienceLevel}

PARÂMETROS DO TREINO:
- Dias por semana: ${workout_days}
- Tempo por treino: ${available_time}
- Local: ${workout_location}
- Equipamentos disponíveis: ${availableEquipment}
- Estilo de treino: ${workoutStyle}

OBJETIVOS: ${fitness_goals}
EXERCÍCIOS PREFERIDOS: ${preferred_exercises || 'Nenhuma preferência específica'}
CONDIÇÕES DE SAÚDE: ${health_conditions || 'Nenhuma limitação reportada'}

INSTRUÇÕES CRÍTICAS:
1. Crie EXATAMENTE ${totalWorkouts} treinos (${workout_days} treinos/semana × 8 semanas)
2. Cada treino deve durar ${available_time}
3. Considere a idade (${age} anos) para intensidade e recuperação
4. Adapte para o IMC ${bmi.toFixed(1)} (${bmiCategory})
5. Use APENAS equipamentos de: ${workout_location}
6. Progresse gradualmente considerando o nível ${fitness_level}

RETORNE UM JSON VÁLIDO com esta estrutura EXATA:
{
  "title": "Plano Personalizado - ${experienceLevel} (${age} anos)",
  "description": "Plano de 8 semanas adaptado para ${bmiCategory}, ${workout_location}, focado em ${fitness_goals}",
  "difficulty_level": "${fitness_level}",
  "duration_weeks": 8,
  "total_workouts": ${totalWorkouts},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Nome do Treino",
      "duration": "${available_time}",
      "exercises": [
        {
          "name": "Nome do Exercício",
          "sets": 3,
          "reps": "8-12",
          "rest": "60s",
          "notes": "Instruções específicas considerando idade ${age} e ${workout_location}"
        }
      ]
    }
  ],
  "nutrition_tips": [
    "Dica nutricional para IMC ${bmi.toFixed(1)} e objetivo ${fitness_goals}",
    "Hidratação adequada para treinos de ${available_time}"
  ],
  "progression_schedule": {
    "week_1_2": "Adaptação e aprendizado de movimentos",
    "week_3_4": "Aumento gradual de intensidade",
    "week_5_6": "Progressão com foco nos objetivos",
    "week_7_8": "Consolidação e preparação para próximo ciclo"
  }
}

IMPORTANTE: 
- Para idade ${age}, ajuste intensidade e tempo de recuperação
- Para ${bmiCategory}, adapte exercícios cardiovasculares  
- Para ${workout_location}, use APENAS equipamentos disponíveis
- Garanta progressão segura para nível ${fitness_level}
`;

    console.log('📤 Enviando requisição detalhada para Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'Você é um personal trainer especialista que sempre retorna JSON válido e cria planos detalhados considerando dados biométricos completos.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.status}`);
    }

    console.log('✅ Resposta recebida do Groq com sucesso');

    const data = await response.json();
    
    console.log('✅ JSON parseado com sucesso da API Groq');

    let workoutPlan;
    try {
      const content = data.choices[0].message.content;
      workoutPlan = JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao parsear JSON da API:', parseError);
      throw new Error('Resposta da API não é um JSON válido');
    }

    console.log('🎯 Plano personalizado avançado de 8 semanas gerado com sucesso pela API Groq!');

    // Validação crítica do plano gerado
    if (!workoutPlan.workouts || workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Plano gerado com ${workoutPlan.workouts?.length || 0} treinos, corrigindo para ${totalWorkouts}...`);
      
      // Se necessário, duplicar ou ajustar treinos para atingir o número exato
      if (workoutPlan.workouts && workoutPlan.workouts.length > 0) {
        while (workoutPlan.workouts.length < totalWorkouts) {
          const baseWorkout = workoutPlan.workouts[workoutPlan.workouts.length % workout_days];
          const newWorkout = {
            ...baseWorkout,
            week: Math.floor(workoutPlan.workouts.length / workout_days) + 1,
            day: (workoutPlan.workouts.length % workout_days) + 1
          };
          workoutPlan.workouts.push(newWorkout);
        }
        workoutPlan.total_workouts = totalWorkouts;
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
      console.error('Erro ao salvar plano:', saveError);
    } else {
      console.log('✅ Plano salvo no banco de dados com sucesso');
    }

    console.log('🎉 Retornando plano final avançado de 8 semanas');

    return new Response(JSON.stringify({ plan: workoutPlan }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
