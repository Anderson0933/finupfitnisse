import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

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
      fitness_level, 
      fitness_goals, 
      available_time, 
      preferred_exercises, 
      health_conditions, 
      workout_days,
      workout_location // NOVO CAMPO ESSENCIAL
    } = await req.json();
    
    console.log('🚀 Dados recebidos na API:', { 
      user_id, 
      fitness_level, 
      fitness_goals, 
      available_time, 
      preferred_exercises, 
      health_conditions, 
      workout_days,
      workout_location 
    });

    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey || groqApiKey.trim() === '') {
      console.error('❌ GROQ_API_KEY não configurada ou vazia');
      console.log('📋 Usando plano de fallback devido à chave não configurada');
      const fallbackPlan = createEnhancedFallbackPlan({ 
        fitness_level, 
        fitness_goals, 
        available_days: workout_days, 
        session_duration: parseInt(available_time.replace('min', '')),
        health_conditions,
        preferred_exercises,
        workout_location // INCLUIR LOCAL
      });
      
      return new Response(
        JSON.stringify({ plan: fallbackPlan }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('✅ Chave Groq configurada, gerando prompt personalizado avançado...');

    // Mapear tempo disponível para minutos
    const timeInMinutes = parseInt(available_time.replace('min', ''));

    // Mapear local de treino para equipamentos disponíveis
    const locationEquipment = getLocationEquipment(workout_location);

    // Criar prompt detalhado para 8 semanas com estrutura correta
    const enhancedPrompt = `Você é um personal trainer certificado com 15 anos de experiência. Crie um plano de treino de 8 SEMANAS estruturado com EXATAMENTE ${workout_days} dias por semana.

PERFIL COMPLETO DO ALUNO:
- Nível: ${fitness_level}
- Objetivo: ${fitness_goals}
- Dias Disponíveis: EXATAMENTE ${workout_days} por semana
- Duração por Sessão: EXATAMENTE ${timeInMinutes} minutos
- Local de Treino: ${workout_location} (${locationEquipment})
- Exercícios Preferidos: ${preferred_exercises || 'Nenhuma preferência'}
- Limitações: ${health_conditions || 'Nenhuma limitação'}

IMPORTANTE: 
- O plano deve ter EXATAMENTE ${workout_days * 8} treinos distribuídos em 8 semanas
- ${workout_days} treinos por semana, cada um com duração de ${timeInMinutes} minutos
- Todos os exercícios devem ser adequados para ${workout_location}: ${locationEquipment}

RETORNE APENAS um JSON seguindo EXATAMENTE esta estrutura:

{
  "title": "Plano ${workout_location.toUpperCase()} - 8 Semanas - ${fitness_goals} - Nível ${fitness_level}",
  "description": "Plano periodizado personalizado de 8 semanas para ${workout_location} com ${workout_days} treinos semanais de ${timeInMinutes} minutos cada",
  "difficulty_level": "${mapFitnessLevelToDifficulty(fitness_level)}",
  "duration_weeks": 8,
  "total_workouts": ${workout_days * 8},
  "workouts": [
    ${generateWorkoutStructure(workout_days, timeInMinutes, fitness_level, workout_location)}
  ],
  "nutrition_tips": [
    "Hidrate-se com 35-40ml por kg de peso corporal diariamente",
    "Consuma proteína 30min após o treino para recuperação muscular",
    "Mantenha refeições equilibradas ao longo do dia",
    "Evite treinar em jejum prolongado"
  ],
  "progression_schedule": {
    "weeks_1_2": "Adaptação - foco na técnica e volume baixo",
    "weeks_3_4": "Progressão gradual - aumento de volume",
    "weeks_5_6": "Intensificação - técnicas avançadas",
    "weeks_7_8": "Consolidação - refinamento e pico"
  }
}

Crie EXATAMENTE ${workout_days * 8} treinos completos, distribuídos igualmente nas 8 semanas (${workout_days} treinos por semana). Cada treino deve ter duração de ${timeInMinutes} minutos e incluir warm_up, main_exercises detalhados e cool_down ADEQUADOS PARA ${workout_location}.`;

    console.log('📤 Enviando requisição detalhada para Groq API...');

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
            content: 'Você é um personal trainer certificado especialista em ciência do exercício. Crie planos de treino estruturados seguindo exatamente o formato JSON solicitado.' 
          },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      
      console.log('📋 Usando plano de fallback avançado devido ao erro na API Groq');
      const fallbackPlan = createEnhancedFallbackPlan({
        fitness_level, 
        fitness_goals, 
        available_days: workout_days, 
        session_duration: timeInMinutes,
        health_conditions,
        preferred_exercises,
        workout_location
      });
      
      return new Response(
        JSON.stringify({ plan: fallbackPlan }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do Groq com sucesso');

    let content = data.choices?.[0]?.message?.content || '';

    if (!content || content.trim() === '') {
      console.log('⚠️ Conteúdo vazio da API Groq, usando fallback avançado');
      const fallbackPlan = createEnhancedFallbackPlan({
        fitness_level, 
        fitness_goals, 
        available_days: workout_days, 
        session_duration: timeInMinutes,
        health_conditions,
        preferred_exercises,
        workout_location
      });
      
      return new Response(
        JSON.stringify({ plan: fallbackPlan }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Limpar e extrair JSON da resposta
    content = content.trim();
    
    // Remover possíveis marcadores de código
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }
    }

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(content);
      console.log('✅ JSON parseado com sucesso da API Groq');
      
      // Validar e corrigir structure
      workoutPlan = validateAndFixPlan(workoutPlan, workout_days, timeInMinutes, fitness_level, workout_location);
      
      console.log('🎯 Plano personalizado avançado de 8 semanas gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback avançado
      console.log('📋 Usando plano de fallback avançado devido ao erro de parse');
      workoutPlan = createEnhancedFallbackPlan({
        fitness_level, 
        fitness_goals, 
        available_days: workout_days, 
        session_duration: timeInMinutes,
        health_conditions,
        preferred_exercises,
        workout_location
      });
    }

    console.log('🎉 Retornando plano final avançado de 8 semanas');

    return new Response(
      JSON.stringify({ plan: workoutPlan }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Erro geral no generate-workout-plan:', error);
    
    // Em caso de erro geral, retornar plano básico avançado
    const basicPlan = createEnhancedFallbackPlan({
      fitness_level: 'iniciante',
      fitness_goals: 'condicionamento geral',
      available_days: 3,
      session_duration: 60,
      workout_location: 'casa'
    });

    return new Response(
      JSON.stringify({ plan: basicPlan }),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

function mapFitnessLevelToDifficulty(fitnessLevel: string): string {
  switch (fitnessLevel) {
    case 'sedentario':
    case 'pouco_ativo':
    case 'iniciante':
      return 'iniciante';
    case 'moderado':
    case 'ativo':
    case 'intermediario':
      return 'intermediario';
    case 'muito_ativo':
    case 'avancado':
      return 'avancado';
    default:
      return 'iniciante';
  }
}

// NOVA FUNÇÃO: Mapear local para equipamentos disponíveis
function getLocationEquipment(location: string): string {
  switch (location) {
    case 'casa':
      return 'apenas peso corporal, sem equipamentos';
    case 'casa_equipamentos':
      return 'peso corporal, halteres, elásticos, tapete';
    case 'academia':
      return 'equipamentos completos, máquinas, pesos livres, cardio';
    case 'parque':
      return 'peso corporal, barras de exercício, bancos';
    case 'condominio':
      return 'equipamentos básicos, alguns pesos, esteira';
    default:
      return 'peso corporal';
  }
}

function generateWorkoutStructure(workoutDays: number, sessionDuration: number, fitnessLevel: string, workoutLocation: string): string {
  // Esta função seria usada no prompt para dar exemplo de estrutura
  return `{
      "week": 1,
      "day": 1,
      "title": "Treino A - ${workoutLocation.toUpperCase()}",
      "focus": "Adaptação técnica para ${workoutLocation}",
      "estimated_duration": ${sessionDuration},
      "warm_up": {
        "duration": ${Math.round(sessionDuration * 0.15)},
        "exercises": [
          {
            "name": "Aquecimento para ${workoutLocation}",
            "duration": ${Math.round(sessionDuration * 0.15 * 60)},
            "instructions": "Aquecimento específico para ${workoutLocation}"
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Exercício adequado para ${workoutLocation}",
          "muscle_groups": ["Grupo Muscular"],
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "weight_guidance": "Adequado para ${workoutLocation}",
          "instructions": "Instruções específicas para ${workoutLocation}",
          "form_cues": ["Dica técnica"],
          "progression_notes": "Como progredir em ${workoutLocation}"
        }
      ],
      "cool_down": {
        "duration": ${Math.round(sessionDuration * 0.15)},
        "exercises": [
          {
            "name": "Alongamento",
            "duration": ${Math.round(sessionDuration * 0.15 * 60)},
            "instructions": "Alongamentos para ${workoutLocation}"
          }
        ]
      }
    }`;
}

function validateAndFixPlan(plan: any, workoutDays: number, sessionDuration: number, fitnessLevel: string, workoutLocation: string): any {
  // Garantir que o plano tenha a estrutura correta
  if (!plan.workouts || !Array.isArray(plan.workouts)) {
    plan.workouts = [];
  }

  // Verificar se tem o número correto de treinos
  const expectedWorkouts = workoutDays * 8;
  if (plan.workouts.length !== expectedWorkouts) {
    console.log(`⚠️ Plano tem ${plan.workouts.length} treinos, esperado ${expectedWorkouts}. Corrigindo...`);
    plan = createEnhancedFallbackPlan({
      fitness_level: fitnessLevel,
      available_days: workoutDays,
      session_duration: sessionDuration,
      workout_location: workoutLocation
    });
  }

  // Garantir que cada treino tenha a duração correta
  if (plan.workouts) {
    plan.workouts.forEach((workout: any) => {
      if (workout.estimated_duration !== sessionDuration) {
        workout.estimated_duration = sessionDuration;
      }
    });
  }

  // Corrigir total_workouts
  plan.total_workouts = expectedWorkouts;
  plan.difficulty_level = mapFitnessLevelToDifficulty(fitnessLevel);

  return plan;
}

function createEnhancedFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'iniciante';
  const goals = userProfile?.fitness_goals || 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  const availableDays = userProfile?.available_days || 3;
  const sessionDuration = userProfile?.session_duration || 60;
  const workoutLocation = userProfile?.workout_location || 'casa';
  
  console.log(`📋 Criando plano fallback: ${availableDays} dias/semana, ${sessionDuration} min/sessão, local: ${workoutLocation}`);
  
  // Mapear objetivos para descrição
  const goalsDescription = {
    'perder_peso': 'perda de peso e queima de gordura',
    'perda_peso': 'perda de peso e queima de gordura',
    'ganhar_massa': 'ganho de massa muscular',
    'hipertrofia': 'ganho de massa muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral',
    'saude_geral': 'condicionamento geral'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  
  // Criar workouts estruturados para 8 semanas
  const workouts = [];
  
  // Templates de treino baseados no local e número de dias
  const workoutTemplates = generateWorkoutTemplates(availableDays, sessionDuration, workoutLocation);
  
  for (let week = 1; week <= 8; week++) {
    for (let day = 1; day <= availableDays; day++) {
      const templateIndex = (day - 1) % workoutTemplates.length;
      const template = workoutTemplates[templateIndex];
      
      const workout = {
        week: week,
        day: day,
        title: template.title,
        focus: getWeekFocus(week),
        estimated_duration: sessionDuration,
        warm_up: {
          duration: Math.round(sessionDuration * 0.15),
          exercises: [
            {
              name: `Aquecimento para ${workoutLocation}`,
              duration: Math.round(sessionDuration * 0.15 * 60),
              instructions: `Aquecimento adequado para treino em ${workoutLocation}: movimentos articulares e ativação muscular`
            }
          ]
        },
        main_exercises: template.exercises.map(exercise => ({
          ...exercise,
          sets: getWeekSets(week, exercise.sets),
          reps: getWeekReps(week, exercise.reps),
          rest_seconds: getWeekRest(week, exercise.rest_seconds),
          progression_notes: getWeekProgression(week)
        })),
        cool_down: {
          duration: Math.round(sessionDuration * 0.15),
          exercises: [
            {
              name: 'Alongamento e Relaxamento',
              duration: Math.round(sessionDuration * 0.15 * 60),
              instructions: `Alongue os principais grupos musculares trabalhados, adequado para ${workoutLocation}`
            }
          ]
        }
      };
      
      workouts.push(workout);
    }
  }
  
  return {
    title: `Plano ${workoutLocation.toUpperCase()} - 8 Semanas ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano de treino periodizado de 8 semanas, desenvolvido especificamente para ${goalDesc} em ${workoutLocation}, com ${availableDays} sessões semanais de ${sessionDuration} minutos cada.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    total_workouts: availableDays * 8,
    source: 'enhanced_fallback',
    workouts: workouts,
    nutrition_tips: [
      'Hidrate-se com 35-40ml de água por kg de peso corporal diariamente',
      'Consuma proteína de qualidade 30-60 minutos após o treino',
      'Mantenha refeições equilibradas com carboidratos, proteínas e gorduras saudáveis',
      'Evite treinar em jejum prolongado ou muito próximo às refeições principais'
    ],
    progression_schedule: {
      weeks_1_2: 'Adaptação e familiarização - foco na técnica correta',
      weeks_3_4: 'Progressão gradual - aumento de volume e repetições',
      weeks_5_6: 'Intensificação - técnicas avançadas e maior sobrecarga',
      weeks_7_8: 'Consolidação e refinamento - manutenção da qualidade técnica'
    }
  };
}

function generateWorkoutTemplates(availableDays: number, sessionDuration: number, workoutLocation: string) {
  const templates = [];
  
  // Exercícios baseados no local
  const locationExercises = getLocationExercises(workoutLocation);
  
  if (availableDays <= 2) {
    // Full body para 1-2 dias
    templates.push({
      title: `Treino Full Body A - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.fullBodyA
    });
    
    templates.push({
      title: `Treino Full Body B - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.fullBodyB
    });
  } else if (availableDays === 3) {
    // Treino ABC
    templates.push({
      title: `Treino A - Pernas e Glúteos - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.lowerBody
    });
    
    templates.push({
      title: `Treino B - Peito, Ombros e Tríceps - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.pushDay
    });
    
    templates.push({
      title: `Treino C - Costas e Bíceps - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.pullDay
    });
  } else {
    // 4+ dias - Upper/Lower split
    templates.push({
      title: `Treino Upper - Membros Superiores - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.upperBody
    });
    
    templates.push({
      title: `Treino Lower - Membros Inferiores - ${workoutLocation.toUpperCase()}`,
      exercises: locationExercises.lowerBody
    });
  }
  
  return templates;
}

// NOVA FUNÇÃO: Exercícios específicos por local
function getLocationExercises(location: string) {
  switch (location) {
    case 'casa':
      return {
        fullBodyA: [
          {
            name: 'Agachamento Livre',
            muscle_groups: ['Quadríceps', 'Glúteos', 'Core'],
            sets: 3,
            reps: '12-15',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Desça até os quadris ficarem paralelos ao chão.',
            form_cues: ['Peito ereto', 'Peso nos calcanhares']
          },
          {
            name: 'Flexão de Braço',
            muscle_groups: ['Peitoral', 'Deltoides', 'Tríceps'],
            sets: 3,
            reps: '8-12',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Descida controlada até o peito quase tocar o chão.',
            form_cues: ['Corpo reto', 'Cotovelos a 45 graus']
          }
        ],
        fullBodyB: [
          {
            name: 'Afundo',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 3,
            reps: '10 cada perna',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Passo grande à frente, desça flexionando ambos os joelhos.',
            form_cues: ['Joelho da frente alinhado', 'Descida controlada']
          },
          {
            name: 'Prancha',
            muscle_groups: ['Core', 'Ombros'],
            sets: 3,
            reps: '30-60s',
            rest_seconds: 45,
            weight_guidance: 'Peso corporal',
            instructions: 'Posição de flexão, mantenha corpo reto e estável.',
            form_cues: ['Core contraído', 'Respiração constante']
          }
        ],
        lowerBody: [
          {
            name: 'Agachamento Profundo',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 4,
            reps: '12-15',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Agachamento com maior amplitude.',
            form_cues: ['Flexibilidade de tornozelo', 'Core ativo']
          }
        ],
        pushDay: [
          {
            name: 'Flexão de Braço Variações',
            muscle_groups: ['Peitoral', 'Tríceps'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Varie entre flexão normal, diamante e inclinada.',
            form_cues: ['Corpo alinhado', 'Amplitude completa']
          }
        ],
        pullDay: [
          {
            name: 'Remada Australiana (mesa)',
            muscle_groups: ['Latíssimo', 'Romboides'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Use uma mesa resistente para fazer remada.',
            form_cues: ['Corpo reto', 'Ombros retraídos']
          }
        ],
        upperBody: [
          {
            name: 'Flexão Combinada',
            muscle_groups: ['Peito', 'Ombros', 'Tríceps'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Combine diferentes variações de flexão.',
            form_cues: ['Forma perfeita', 'Controle total']
          }
        ]
      };
    
    case 'academia':
      return {
        fullBodyA: [
          {
            name: 'Agachamento com Barra',
            muscle_groups: ['Quadríceps', 'Glúteos', 'Core'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Barra + peso progressivo',
            instructions: 'Agachamento livre com barra nas costas.',
            form_cues: ['Peito ereto', 'Joelhos alinhados']
          },
          {
            name: 'Supino Reto',
            muscle_groups: ['Peitoral', 'Tríceps', 'Deltoides'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Barra + anilhas',
            instructions: 'Supino com barra no banco reto.',
            form_cues: ['Escápulas retraídas', 'Pegada firme']
          }
        ],
        fullBodyB: [
          {
            name: 'Leg Press',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 4,
            reps: '12-15',
            rest_seconds: 90,
            weight_guidance: 'Máquina leg press',
            instructions: 'Leg press com amplitude completa.',
            form_cues: ['Pés alinhados', 'Controle na descida']
          },
          {
            name: 'Puxada na Polia',
            muscle_groups: ['Latíssimo', 'Bíceps'],
            sets: 4,
            reps: '10-12',
            rest_seconds: 90,
            weight_guidance: 'Polia alta',
            instructions: 'Puxada frontal na polia.',
            form_cues: ['Peito estufado', 'Cotovelos para baixo']
          }
        ],
        lowerBody: [
          {
            name: 'Agachamento Livre',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 120,
            weight_guidance: 'Barra + peso',
            instructions: 'Agachamento livre com barra.',
            form_cues: ['Técnica perfeita', 'Progressão gradual']
          }
        ],
        pushDay: [
          {
            name: 'Supino Inclinado',
            muscle_groups: ['Peitoral Superior', 'Tríceps'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Halteres ou barra',
            instructions: 'Supino inclinado para peitoral superior.',
            form_cues: ['Ângulo de 30-45°', 'Controle total']
          }
        ],
        pullDay: [
          {
            name: 'Remada Curvada',
            muscle_groups: ['Latíssimo', 'Romboides', 'Bíceps'],
            sets: 4,
            reps: '8-12',
            rest_seconds: 90,
            weight_guidance: 'Barra ou halteres',
            instructions: 'Remada curvada com barra.',
            form_cues: ['Costas retas', 'Cotovelos junto ao corpo']
          }
        ],
        upperBody: [
          {
            name: 'Desenvolvimento com Halteres',
            muscle_groups: ['Deltoides', 'Tríceps'],
            sets: 4,
            reps: '10-12',
            rest_seconds: 90,
            weight_guidance: 'Halteres',
            instructions: 'Desenvolvimento sentado com halteres.',
            form_cues: ['Costas apoiadas', 'Amplitude completa']
          }
        ]
      };
    
    case 'parque':
      return {
        fullBodyA: [
          {
            name: 'Agachamento no Parque',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 4,
            reps: '15-20',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Agachamento usando banco ou superfície do parque.',
            form_cues: ['Use o ambiente', 'Aproveite o ar livre']
          },
          {
            name: 'Flexão na Barra',
            muscle_groups: ['Peitoral', 'Tríceps'],
            sets: 3,
            reps: '5-10',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Flexão inclinada usando barra do parque.',
            form_cues: ['Corpo alinhado', 'Controle do movimento']
          }
        ],
        fullBodyB: [
          {
            name: 'Corrida Intervalada',
            muscle_groups: ['Cardio', 'Pernas'],
            sets: 5,
            reps: '1 min forte / 1 min leve',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Intercale intensidade na corrida.',
            form_cues: ['Respire bem', 'Mantenha ritmo']
          }
        ],
        lowerBody: [
          {
            name: 'Step-up no Banco',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 4,
            reps: '12 cada perna',
            rest_seconds: 75,
            weight_guidance: 'Peso corporal',
            instructions: 'Subida no banco alternando pernas.',
            form_cues: ['Controle na descida', 'Força na subida']
          }
        ],
        pushDay: [
          {
            name: 'Mergulho no Banco',
            muscle_groups: ['Tríceps', 'Peitorais'],
            sets: 4,
            reps: '8-15',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Mergulho usando banco do parque.',
            form_cues: ['Cotovelos para trás', 'Amplitude controlada']
          }
        ],
        pullDay: [
          {
            name: 'Barra Fixa',
            muscle_groups: ['Latíssimo', 'Bíceps'],
            sets: 4,
            reps: '3-8',
            rest_seconds: 120,
            weight_guidance: 'Peso corporal',
            instructions: 'Barra fixa na estrutura do parque.',
            form_cues: ['Pegada firme', 'Subida controlada']
          }
        ],
        upperBody: [
          {
            name: 'Exercícios na Barra',
            muscle_groups: ['Braços', 'Costas'],
            sets: 4,
            reps: 'Máximo possível',
            rest_seconds: 90,
            weight_guidance: 'Peso corporal',
            instructions: 'Combine barra fixa e paralelas.',
            form_cues: ['Use as estruturas', 'Técnica primeiro']
          }
        ]
      };
    
    default:
      // Fallback para casa
      return {
        fullBodyA: [
          {
            name: 'Agachamento Livre',
            muscle_groups: ['Quadríceps', 'Glúteos'],
            sets: 3,
            reps: '12-15',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Agachamento básico em casa.',
            form_cues: ['Técnica correta', 'Amplitude completa']
          }
        ],
        fullBodyB: [
          {
            name: 'Flexão de Braço',
            muscle_groups: ['Peitoral', 'Tríceps'],
            sets: 3,
            reps: '8-12',
            rest_seconds: 60,
            weight_guidance: 'Peso corporal',
            instructions: 'Flexão básica em casa.',
            form_cues: ['Corpo reto', 'Controle total']
          }
        ],
        lowerBody: [],
        pushDay: [],
        pullDay: [],
        upperBody: []
      };
  }
}

function getWeekFocus(week: number): string {
  if (week <= 2) return 'Adaptação e familiarização';
  if (week <= 4) return 'Progressão gradual';
  if (week <= 6) return 'Intensificação';
  return 'Consolidação e refinamento';
}

function getWeekSets(week: number, baseSets: number): number {
  if (week <= 2) return baseSets;
  if (week <= 4) return baseSets + 1;
  if (week <= 6) return baseSets + 1;
  return baseSets;
}

function getWeekReps(week: number, baseReps: string): string {
  if (week <= 2) return baseReps;
  if (week <= 4) return baseReps.includes('-') ? baseReps.replace(/(\d+)-(\d+)/, (match, min, max) => `${parseInt(min) + 2}-${parseInt(max) + 2}`) : baseReps;
  if (week <= 6) return baseReps;
  return baseReps;
}

function getWeekRest(week: number, baseRest: number): number {
  if (week <= 2) return baseRest;
  if (week <= 4) return baseRest + 15;
  if (week <= 6) return baseRest + 30;
  return baseRest + 15;
}

function getWeekProgression(week: number): string {
  if (week <= 2) return 'Foque na técnica perfeita e aprendizado dos movimentos';
  if (week <= 4) return 'Aumente gradualmente o volume e intensidade';
  if (week <= 6) return 'Maximize a intensidade e explore variações avançadas';
  return 'Mantenha a qualidade técnica e consolide os ganhos';
}
