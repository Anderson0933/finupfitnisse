
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
Você é um personal trainer profissional brasileiro com mais de 10 anos de experiência. Crie um plano de treino DETALHADO em formato JSON válido.

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
7. As instruções dos exercícios devem ser MUITO DETALHADAS e explicativas
8. Inclua posicionamento corporal, respiração, amplitude de movimento
9. Explique como sentir o músculo trabalhando
10. Inclua variações para iniciantes e avançados quando apropriado

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
      "focus": "Área trabalhada",
      "estimated_duration": ${parseInt(available_time)},
      "warm_up": {
        "duration": 5,
        "exercises": [
          {
            "name": "Nome do exercício",
            "duration": 30,
            "instructions": "Instruções detalhadas passo a passo em português, incluindo posição inicial, movimento completo, respiração e pontos de atenção"
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Nome do exercício",
          "muscle_groups": ["peito", "ombros"],
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "weight_guidance": "Comece leve e aumente progressivamente",
          "instructions": "Instruções MUITO DETALHADAS em português brasileiro: 1) Posição inicial - Detalhe exato de como se posicionar, onde colocar os pés, como segurar o equipamento, postura do tronco. 2) Execução - Descreva o movimento completo, velocidade, amplitude, qual parte do corpo se move primeiro. 3) Respiração - Quando inspirar e quando expirar durante o movimento. 4) Finalização - Como retornar à posição inicial de forma controlada. 5) Sensações - Como deve sentir o músculo trabalhando, onde deve sentir o esforço. 6) Erros comuns - O que evitar durante a execução.",
          "form_cues": [
            "Mantenha o core sempre contraído durante todo o movimento",
            "Controle a velocidade - 2 segundos na descida, 1 segundo na subida",
            "Foque na conexão mente-músculo, sinta o músculo trabalhando",
            "Mantenha a respiração fluida, nunca prenda o ar",
            "Verifique o alinhamento da coluna antes de iniciar cada série"
          ],
          "progression_notes": "Semana 1-2: Foque na técnica perfeita com peso leve. Semana 3-4: Aumente o peso em 5-10% quando conseguir fazer todas as repetições com facilidade. Semana 5-6: Continue progressão de carga. Semana 7-8: Teste seus limites mantendo a técnica."
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [
          {
            "name": "Nome do alongamento",
            "duration": 30,
            "instructions": "Instruções detalhadas do alongamento em português: posição inicial, como executar, intensidade do alongamento, respiração durante o exercício, benefícios específicos"
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "Hidratação: Beba pelo menos 500ml de água 30 minutos antes do treino de ${available_time}",
    "Pré-treino: Consuma carboidratos de fácil digestão 1 hora antes (banana, aveia)",
    "Pós-treino: Proteína + carboidrato até 30min após o treino para recuperação",
    "Para IMC ${bmi.toFixed(1)} e objetivo ${fitness_goals}: ajuste as porções conforme orientação nutricional",
    "Durma 7-8 horas por noite para otimizar a recuperação muscular"
  ],
  "progression_schedule": {
    "week_1_2": "Fase de adaptação - Foque na técnica perfeita, cargas leves a moderadas",
    "week_3_4": "Sobrecarga progressiva - Aumente peso/intensidade quando dominar o movimento",
    "week_5_6": "Aumento de intensidade - Desafie-se mantendo a forma correta", 
    "week_7_8": "Performance máxima - Teste seus limites com segurança"
  }
}

LEMBRE-SE: As instruções dos exercícios devem ser extremamente detalhadas, como se você estivesse pessoalmente orientando o aluno. Inclua detalhes sobre postura, respiração, sensações esperadas e progressão. Seja específico sobre como executar cada movimento de forma segura e eficaz.

Retorne APENAS o objeto JSON acima, devidamente formatado e completo com todos os ${totalWorkouts} treinos em português brasileiro.`;

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
            content: 'Você é um personal trainer brasileiro profissional especialista em criar planos de treino detalhados. Você DEVE responder APENAS com JSON válido, sem texto adicional. Todas as instruções devem ser EXTREMAMENTE DETALHADAS em português brasileiro, como se você fosse um personal trainer experiente orientando presencialmente. Inicie sua resposta com { e termine com }.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 16000
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
