
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
  
  try {
    // Primeira tentativa - JSON direto
    const parsed = JSON.parse(cleanContent);
    console.log('✅ JSON parseado com sucesso');
    return parsed;
  } catch (parseError) {
    console.warn('⚠️ Primeira tentativa falhou, tentando correções...');
    
    try {
      // Segunda tentativa - corrigir vírgulas extras e problemas comuns
      let fixedContent = cleanContent
        // Remover vírgulas antes de } e ]
        .replace(/,(\s*[}\]])/g, '$1')
        // Remover vírgulas duplicadas
        .replace(/,+/g, ',')
        // Corrigir aspas quebradas em strings
        .replace(/([^"]),\s*"([^"]*)"([^,:}\]]*)/g, '$1, "$2$3"')
        // Remover quebras de linha problemáticas dentro de strings
        .replace(/"([^"]*)\n([^"]*)"/g, '"$1 $2"');

      const parsed = JSON.parse(fixedContent);
      console.log('✅ JSON parseado na segunda tentativa');
      return parsed;
    } catch (secondError) {
      console.error('❌ Erro crítico no parsing:', secondError.message);
      
      // Como último recurso, tentar extrair e criar um plano básico válido
      try {
        // Extrair informações básicas que conseguimos encontrar
        const titleMatch = cleanContent.match(/"title"\s*:\s*"([^"]+)"/);
        const descMatch = cleanContent.match(/"description"\s*:\s*"([^"]+)"/);
        const levelMatch = cleanContent.match(/"difficulty_level"\s*:\s*"([^"]+)"/);
        
        if (titleMatch && descMatch && levelMatch) {
          console.warn('⚠️ Criando plano básico a partir de fragmentos...');
          return {
            title: titleMatch[1],
            description: descMatch[1],
            difficulty_level: levelMatch[1],
            duration_weeks: 6,
            total_workouts: 18,
            workouts: [], // Será preenchido depois
            nutrition_tips: [
              "Mantenha-se hidratado bebendo pelo menos 2-3 litros de água por dia",
              "Consuma proteína após o treino para recuperação muscular",
              "Inclua carboidratos complexos antes do treino para energia",
              "Mantenha uma alimentação equilibrada rica em nutrientes",
              "Evite alimentos processados e priorize alimentos naturais"
            ],
            progression_schedule: {
              week_1_2: "Adaptação e aprendizado dos movimentos básicos",
              week_3_4: "Aumento gradual da intensidade e carga",
              week_5_6: "Consolidação e preparação para próximo nível"
            }
          };
        }
        
        throw new Error('Não foi possível extrair informações básicas do JSON');
      } catch (fallbackError) {
        console.error('❌ Falha em todas as tentativas de parsing');
        throw new Error(`Erro ao processar JSON: ${parseError.message}`);
      }
    }
  }
}

async function processQueueItem(supabase: any, queueItem: any) {
  console.log('🚀 Processando item da fila:', queueItem.id);
  
  try {
    // Marcar como processando
    await supabase
      .from('workout_plan_queue')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    const requestData = queueItem.request_data;
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    
    if (!groqApiKey) {
      throw new Error('GROQ_API_KEY não configurada');
    }

    // Calcular IMC e configurações
    const heightInMeters = requestData.height / 100;
    const bmi = requestData.weight / (heightInMeters * heightInMeters);
    let bmiCategory = '';
    
    if (bmi < 18.5) bmiCategory = 'abaixo do peso';
    else if (bmi < 25) bmiCategory = 'peso normal';
    else if (bmi < 30) bmiCategory = 'sobrepeso';
    else bmiCategory = 'obesidade';

    // Determinar equipamentos baseado no local
    let availableEquipment = '';
    let workoutStyle = '';
    
    switch (requestData.workout_location) {
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

    const totalWorkouts = requestData.workout_days * 6;

    const prompt = `
Você é um personal trainer brasileiro experiente e detalhista. Crie um plano de treino personalizado COMPLETO em JSON válido com instruções muito detalhadas.

DADOS DO CLIENTE:
- ${requestData.age} anos, ${requestData.height}cm, ${requestData.weight}kg (IMC: ${bmi.toFixed(1)} - ${bmiCategory})
- Nível: ${requestData.fitness_level}
- Objetivo: ${requestData.fitness_goals}
- Local: ${requestData.workout_location} - ${availableEquipment}
- ${requestData.workout_days} dias/semana, ${requestData.available_time} por treino
- Condições: ${requestData.health_conditions || 'Nenhuma'}

IMPORTANTE: Retorne APENAS JSON válido, sem formatação markdown, começando com { e terminando com }.

Estrutura obrigatória com instruções MUITO DETALHADAS:
{
  "title": "Plano ${requestData.workout_days}x/semana - ${requestData.fitness_level}",
  "description": "Plano personalizado completo para ${requestData.fitness_goals} em ${requestData.workout_location} durante 6 semanas",
  "difficulty_level": "${requestData.fitness_level}",
  "duration_weeks": 6,
  "total_workouts": ${totalWorkouts},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Nome Específico do Treino",
      "focus": "Grupos musculares detalhados trabalhados",
      "estimated_duration": ${parseInt(requestData.available_time)},
      "warm_up": {
        "duration": 8,
        "exercises": [
          {
            "name": "Exercício de aquecimento específico",
            "duration": 90,
            "instructions": "Instruções muito detalhadas: posição inicial, movimento completo, respiração, ritmo, cuidados especiais e objetivos do aquecimento."
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Nome completo do exercício",
          "muscle_groups": ["grupo_primário", "grupo_secundário", "grupo_estabilizador"],
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "weight_guidance": "Orientação específica de carga baseada no nível e objetivo",
          "instructions": "Instruções extremamente detalhadas: 1) Posição inicial exata (pés, mãos, coluna, core); 2) Fase concêntrica completa (movimento, músculos ativados, respiração); 3) Fase excêntrica controlada (tempo, controle, tensão); 4) Pontos de atenção críticos; 5) Variações para diferentes níveis; 6) Sinais de execução correta.",
          "form_cues": [
            "Dica técnica específica 1 com detalhes anatômicos",
            "Dica técnica específica 2 com foco na segurança",
            "Dica técnica específica 3 para otimizar resultados",
            "Erro comum a evitar com explicação detalhada"
          ],
          "progression_notes": "Como progredir especificamente: semana a semana, aumento de carga, variações de dificuldade, sinais para progressão.",
          "safety_tips": "Cuidados específicos, contraindicações, quando parar, adaptações para lesões.",
          "breathing_pattern": "Padrão respiratório detalhado para cada fase do movimento."
        }
      ],
      "cool_down": {
        "duration": 7,
        "exercises": [
          {
            "name": "Alongamento específico",
            "duration": 60,
            "instructions": "Instruções detalhadas: posição, amplitude, respiração, tempo de manutenção, sensações esperadas, músculos alvos."
          }
        ]
      },
      "workout_tips": [
        "Dica específica para este treino baseada no objetivo",
        "Orientação nutricional pré/pós treino",
        "Hidratação específica para a intensidade"
      ]
    }
  ],
  "nutrition_tips": [
    "Hidratação específica: quantidade por peso corporal e atividade",
    "Proteína pós-treino: timing ideal, quantidade e fontes recomendadas",
    "Carboidratos pré-treino: tipos, timing e quantidades",
    "Suplementação básica se necessária para o objetivo específico",
    "Alimentação para recuperação muscular baseada no treino"
  ],
  "progression_schedule": {
    "week_1_2": "Adaptação neural e técnica: foco na forma perfeita, cargas moderadas, estabelecimento de padrões de movimento",
    "week_3_4": "Intensificação controlada: aumento progressivo de cargas, maior volume, refinamento técnico",
    "week_5_6": "Máxima adaptação: cargas elevadas, técnicas avançadas, preparação para novo ciclo"
  },
  "recovery_guidelines": {
    "sleep": "Orientações específicas de sono para recuperação muscular",
    "rest_days": "Como aproveitar dias de descanso para otimizar resultados",
    "signs_of_overtraining": "Sinais importantes para reconhecer e prevenir overtraining"
  }
}

INSTRUÇÕES CRÍTICAS:
- Crie TODOS os ${totalWorkouts} treinos únicos e variados para 6 SEMANAS COMPLETAS
- Cada exercício deve ter instruções EXTREMAMENTE detalhadas (mínimo 3-4 frases por instrução)
- Inclua variações e progressões específicas para cada exercício
- Use apenas equipamentos disponíveis para ${requestData.workout_location}
- Adapte intensidade e complexidade para nível ${requestData.fitness_level}
- Foque no objetivo específico: ${requestData.fitness_goals}
- Considere limitações: ${requestData.health_conditions || 'Nenhuma'}
- Mantenha português brasileiro em todas as instruções`;

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
            content: 'Você é um personal trainer brasileiro extremamente experiente e detalhista. Responda APENAS com JSON válido, sem formatação markdown. Inicie com { e termine com }. Seja MUITO detalhado nas instruções dos exercícios, incluindo anatomia, biomecânica, respiração e progressões específicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 25000,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Groq: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    let workoutPlan;
    try {
      workoutPlan = cleanAndParseJSON(content);
    } catch (parseError) {
      console.error('❌ Falha no parsing, criando plano de emergência...');
      
      // Criar um plano básico funcional
      workoutPlan = {
        title: `Plano ${requestData.workout_days}x/semana - ${requestData.fitness_level}`,
        description: `Plano personalizado para ${requestData.fitness_goals} em ${requestData.workout_location}`,
        difficulty_level: requestData.fitness_level,
        duration_weeks: 6,
        total_workouts: totalWorkouts,
        workouts: [],
        nutrition_tips: [
          "Mantenha-se hidratado bebendo pelo menos 2-3 litros de água por dia",
          "Consuma proteína após o treino para recuperação muscular",
          "Inclua carboidratos complexos antes do treino para energia",
          "Mantenha uma alimentação equilibrada rica em nutrientes",
          "Evite alimentos processados e priorize alimentos naturais"
        ],
        progression_schedule: {
          week_1_2: "Adaptação e aprendizado dos movimentos básicos",
          week_3_4: "Aumento gradual da intensidade e carga",
          week_5_6: "Consolidação e preparação para próximo nível"
        }
      };
      
      // Gerar treinos básicos
      for (let week = 1; week <= 6; week++) {
        for (let day = 1; day <= requestData.workout_days; day++) {
          const workout = {
            week,
            day,
            title: `Treino ${day} - Semana ${week}`,
            focus: "Treino completo de corpo inteiro",
            estimated_duration: parseInt(requestData.available_time) || 45,
            warm_up: {
              duration: 10,
              exercises: [{
                name: "Aquecimento Geral",
                duration: 600,
                instructions: "Realize movimentos articulares suaves e cardio leve para preparar o corpo."
              }]
            },
            main_exercises: [{
              name: "Exercício Principal",
              muscle_groups: ["corpo_inteiro"],
              sets: 3,
              reps: "10-15",
              rest_seconds: 60,
              weight_guidance: "Use carga adequada ao seu nível",
              instructions: "Execute com boa técnica, focando na forma correta.",
              form_cues: ["Mantenha postura alinhada", "Respire corretamente", "Execute movimento controlado"],
              progression_notes: "Aumente gradualmente a intensidade conforme evolui.",
              safety_tips: "Pare se sentir dor ou desconforto.",
              breathing_pattern: "Expire no esforço, inspire no relaxamento."
            }],
            cool_down: {
              duration: 10,
              exercises: [{
                name: "Alongamento Geral",
                duration: 600,
                instructions: "Alongue os principais grupos musculares trabalhados."
              }]
            },
            workout_tips: [
              "Mantenha boa hidratação durante o treino",
              "Foque na qualidade dos movimentos",
              "Respeite seus limites"
            ]
          };
          workoutPlan.workouts.push(workout);
        }
      }
    }
    
    // Garantir que temos 6 semanas e o número correto de treinos
    workoutPlan.duration_weeks = 6;
    
    if (!workoutPlan.workouts || workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Ajustando número de treinos para ${totalWorkouts}`);
      
      if (!workoutPlan.workouts) workoutPlan.workouts = [];
      
      while (workoutPlan.workouts.length < totalWorkouts) {
        const week = Math.floor(workoutPlan.workouts.length / requestData.workout_days) + 1;
        const day = (workoutPlan.workouts.length % requestData.workout_days) + 1;
        
        const workout = {
          week,
          day,
          title: `Treino ${day} - Semana ${week}`,
          focus: "Treino completo",
          estimated_duration: parseInt(requestData.available_time) || 45,
          warm_up: {
            duration: 10,
            exercises: [{
              name: "Aquecimento",
              duration: 600,
              instructions: "Aquecimento adequado para preparar o corpo."
            }]
          },
          main_exercises: [{
            name: "Exercício Principal",
            muscle_groups: ["geral"],
            sets: 3,
            reps: "10-15",
            rest_seconds: 60,
            weight_guidance: "Carga adequada",
            instructions: "Execute com boa técnica.",
            form_cues: ["Boa postura", "Respiração correta"],
            progression_notes: "Progrida gradualmente.",
            safety_tips: "Execute com segurança.",
            breathing_pattern: "Respiração controlada."
          }],
          cool_down: {
            duration: 10,
            exercises: [{
              name: "Alongamento",
              duration: 600,
              instructions: "Alongamento final."
            }]
          },
          workout_tips: ["Hidrate-se bem", "Mantenha boa forma"]
        };
        workoutPlan.workouts.push(workout);
      }
      
      workoutPlan.total_workouts = totalWorkouts;
    }

    // Salvar plano no banco
    const { error: saveError } = await supabase
      .from('user_workout_plans')
      .upsert({
        user_id: requestData.user_id,
        plan_data: workoutPlan
      });

    if (saveError) {
      console.error('❌ Erro ao salvar plano:', saveError);
      throw saveError;
    }

    // Marcar como completo
    await supabase
      .from('workout_plan_queue')
      .update({ 
        status: 'completed', 
        completed_at: new Date().toISOString() 
      })
      .eq('id', queueItem.id);

    console.log('✅ Plano processado com sucesso:', workoutPlan.title);
    
    return workoutPlan;

  } catch (error) {
    console.error('❌ Erro ao processar item da fila:', error);
    
    // Marcar como falha
    await supabase
      .from('workout_plan_queue')
      .update({ 
        status: 'failed', 
        error_message: error.message,
        completed_at: new Date().toISOString()
      })
      .eq('id', queueItem.id);
      
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Buscar próximo item na fila
    const { data: queueItem, error: queueError } = await supabase
      .from('workout_plan_queue')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (queueError) {
      if (queueError.code === 'PGRST116') {
        return new Response(JSON.stringify({ message: 'Nenhum item na fila' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw queueError;
    }

    const workoutPlan = await processQueueItem(supabase, queueItem);

    return new Response(JSON.stringify({ 
      success: true, 
      plan: workoutPlan,
      queue_item_id: queueItem.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Erro na função de processamento:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
