
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
You are a professional personal trainer. Create a workout plan in VALID JSON format only.

USER DATA:
- Age: ${age} years
- Height: ${height} cm  
- Weight: ${weight} kg
- BMI: ${bmi.toFixed(1)} (${bmiCategory})
- Fitness level: ${fitness_level}
- Goals: ${fitness_goals}
- Workout days per week: ${workout_days}
- Session duration: ${available_time}
- Location: ${workout_location}
- Available equipment: ${availableEquipment}
- Preferred exercises: ${preferred_exercises || 'None specified'}
- Health conditions: ${health_conditions || 'None reported'}

CRITICAL INSTRUCTIONS:
1. Return ONLY valid JSON, no text before or after
2. Create exactly ${totalWorkouts} workouts (${workout_days} per week × 8 weeks)
3. Each workout must be ${available_time} duration
4. Use ONLY equipment available at: ${workout_location}
5. Adapt intensity for age ${age} and BMI ${bmi.toFixed(1)}

REQUIRED JSON STRUCTURE:
{
  "title": "8-Week Plan - ${fitness_level} (Age ${age})",
  "description": "Personalized plan for ${bmiCategory}, ${workout_location}, focused on ${fitness_goals}",
  "difficulty_level": "${fitness_level}",
  "duration_weeks": 8,
  "total_workouts": ${totalWorkouts},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Workout Name",
      "focus": "Target area",
      "estimated_duration": ${parseInt(available_time)},
      "warm_up": {
        "duration": 5,
        "exercises": [
          {
            "name": "Exercise name",
            "duration": 30,
            "instructions": "How to perform"
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Exercise name",
          "muscle_groups": ["chest", "shoulders"],
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "weight_guidance": "Start light",
          "instructions": "Detailed instructions",
          "form_cues": ["Keep core tight"],
          "progression_notes": "Increase weight when ready"
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [
          {
            "name": "Stretch name",
            "duration": 30,
            "instructions": "How to stretch"
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "Hydration tip for ${available_time} workouts",
    "Nutrition advice for BMI ${bmi.toFixed(1)} and goal ${fitness_goals}"
  ],
  "progression_schedule": {
    "week_1_2": "Adaptation phase",
    "week_3_4": "Progressive overload",
    "week_5_6": "Intensity increase", 
    "week_7_8": "Peak performance"
  }
}

Return ONLY the JSON object above, properly formatted and complete with all ${totalWorkouts} workouts.`;

    console.log('📤 Enviando requisição para Groq API...');

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
            content: 'You are a professional personal trainer. You MUST respond with ONLY valid JSON, no additional text or explanations. Start your response with { and end with }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 8000
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      throw new Error(`Erro na API Groq: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do Groq');

    let workoutPlan;
    try {
      const content = data.choices[0].message.content;
      console.log('🔍 Conteúdo recebido:', content.substring(0, 200) + '...');
      
      // Limpar o conteúdo para garantir que seja JSON válido
      let cleanContent = content.trim();
      
      // Remover texto antes do JSON se existir
      const jsonStart = cleanContent.indexOf('{');
      if (jsonStart > 0) {
        cleanContent = cleanContent.substring(jsonStart);
      }
      
      // Remover texto depois do JSON se existir
      const jsonEnd = cleanContent.lastIndexOf('}');
      if (jsonEnd < cleanContent.length - 1) {
        cleanContent = cleanContent.substring(0, jsonEnd + 1);
      }
      
      workoutPlan = JSON.parse(cleanContent);
      console.log('✅ JSON parseado com sucesso');
      
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.error('❌ Conteúdo original:', data.choices[0].message.content);
      throw new Error('Resposta da API não é um JSON válido');
    }

    // Validação do plano gerado
    if (!workoutPlan.workouts || workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Plano gerado com ${workoutPlan.workouts?.length || 0} treinos, esperado ${totalWorkouts}`);
      
      // Corrigir número de treinos se necessário
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
        console.log('✅ Número de treinos corrigido');
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
