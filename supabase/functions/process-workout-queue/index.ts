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
    const parsed = JSON.parse(cleanContent);
    console.log('✅ JSON parseado com sucesso');
    return parsed;
  } catch (parseError) {
    console.error('❌ Erro ao parsear JSON:', parseError);
    throw new Error(`Erro ao processar JSON: ${parseError.message}`);
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
Você é um personal trainer brasileiro experiente e didático. Crie um plano de treino personalizado COMPLETO em JSON válido com instruções MUITO detalhadas e demonstrações visuais explicativas.

DADOS DO CLIENTE:
- ${requestData.age} anos, ${requestData.height}cm, ${requestData.weight}kg (IMC: ${bmi.toFixed(1)} - ${bmiCategory})
- Nível: ${requestData.fitness_level}
- Objetivo: ${requestData.fitness_goals}
- Local: ${requestData.workout_location} - ${availableEquipment}
- ${requestData.workout_days} dias/semana, ${requestData.available_time} por treino
- Condições: ${requestData.health_conditions || 'Nenhuma'}

IMPORTANTE: Retorne APENAS JSON válido, sem formatação markdown, começando com { e terminando com }.

🤖💪 COACH VIRTUAL: Inclua um coach virtual que demonstra VISUALMENTE cada exercício com descrições passo a passo muito detalhadas, como se fosse um boneco demonstrando os movimentos.

Estrutura obrigatória com demonstrações visuais:
{
  "title": "Plano ${requestData.workout_days}x/semana - ${requestData.fitness_level}",
  "description": "Plano personalizado completo para ${requestData.fitness_goals} em ${requestData.workout_location} durante 6 semanas com demonstrações visuais",
  "difficulty_level": "${requestData.fitness_level}",
  "duration_weeks": 6,
  "total_workouts": ${totalWorkouts},
  "coach_avatar": "🤖💪 Coach IA - Seu instrutor virtual",
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
            "instructions": "Instruções muito detalhadas: posição inicial, movimento completo, respiração, ritmo, cuidados especiais e objetivos do aquecimento.",
            "visual_demo": "🤖 DEMONSTRAÇÃO VISUAL: [Posição inicial] Coach IA está em pé, pés afastados na largura dos ombros, braços ao lado do corpo. [Movimento] Eleva os braços lateralmente até a altura dos ombros enquanto inspira, depois baixa controladamente enquanto expira. [Ritmo] Movimento lento e controlado, 2 segundos para subir, 2 segundos para descer. [Visualização] Imagine que está movendo os braços através de água densa, mantendo controle total."
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
          "visual_demo": "🤖 DEMONSTRAÇÃO COMPLETA: [Setup] Coach IA posiciona-se com pés paralelos, joelhos levemente flexionados, core ativado. [Fase 1 - Preparação] Pega a posição inicial com precisão: mãos posicionadas exatamente [localização], ombros alinhados sobre [referência anatômica]. [Fase 2 - Execução] Inicia o movimento [direção específica], contraindo [músculos específicos], mantendo [pontos de estabilização]. [Fase 3 - Retorno] Controla o retorno com [tempo específico], mantendo tensão em [músculos específicos]. [Respiração] Inspira durante [fase específica], expira durante [fase específica]. [Erro Comum] ❌ NÃO fazer [erro específico] - demonstra o movimento incorreto para comparação. [Versão Correta] ✅ FAZER assim - demonstra a execução perfeita novamente.",
          "form_cues": [
            "🎯 Dica técnica específica 1 com detalhes anatômicos e demonstração visual",
            "⚠️ Dica técnica específica 2 com foco na segurança e como o Coach IA mantém a forma",
            "💪 Dica técnica específica 3 para otimizar resultados com visualização",
            "❌ Erro comum a evitar - Coach IA demonstra o que NÃO fazer vs ✅ o que FAZER"
          ],
          "progression_notes": "Como progredir especificamente: semana a semana, aumento de carga, variações de dificuldade, sinais para progressão. Coach IA demonstra as progressões visuais.",
          "safety_tips": "Cuidados específicos com demonstração visual de posicionamento seguro pelo Coach IA.",
          "breathing_pattern": "Padrão respiratório detalhado com demonstração visual: Coach IA mostra quando inspirar (expandindo o peito) e quando expirar (contraindo o abdome).",
          "execution_rhythm": "🎵 Ritmo de execução: Coach IA demonstra o tempo ideal - [X] segundos fase concêntrica, [Y] segundos fase excêntrica, com contagem visual."
        }
      ],
      "cool_down": {
        "duration": 7,
        "exercises": [
          {
            "name": "Alongamento específico",
            "duration": 60,
            "instructions": "Instruções detalhadas: posição, amplitude, respiração, tempo de manutenção, sensações esperadas, músculos alvos.",
            "visual_demo": "🤖 DEMONSTRAÇÃO DE ALONGAMENTO: Coach IA assume a posição [posição específica], mantém por [tempo], demonstra a respiração profunda (peito subindo e descendo), mostra a amplitude correta sem forçar, indica onde você deve sentir o alongamento."
          }
        ]
      },
      "workout_tips": [
        "💡 Dica específica para este treino com demonstração visual pelo Coach IA",
        "🥤 Orientação nutricional pré/pós treino com demonstração de hidratação",
        "💧 Hidratação específica demonstrada pelo Coach IA - quando e quanto beber"
      ]
    }
  ],
  "nutrition_tips": [
    "💧 Hidratação específica: quantidade por peso corporal e atividade - Coach IA demonstra como medir",
    "🥩 Proteína pós-treino: timing ideal, quantidade e fontes recomendadas com demonstrações visuais",
    "🍌 Carboidratos pré-treino: tipos, timing e quantidades - Coach IA mostra porções ideais",
    "💊 Suplementação básica se necessária para o objetivo específico",
    "🍽️ Alimentação para recuperação muscular baseada no treino com demonstrações visuais de timing"
  ],
  "progression_schedule": {
    "week_1_2": "Adaptação neural e técnica: foco na forma perfeita demonstrada pelo Coach IA, cargas moderadas, estabelecimento de padrões de movimento",
    "week_3_4": "Intensificação controlada: aumento progressivo de cargas com demonstrações visuais, maior volume, refinamento técnico",
    "week_5_6": "Máxima adaptação: cargas elevadas com técnicas avançadas demonstradas pelo Coach IA, preparação para novo ciclo"
  },
  "recovery_guidelines": {
    "sleep": "Orientações específicas de sono para recuperação muscular com demonstrações de posições ideais",
    "rest_days": "Como aproveitar dias de descanso para otimizar resultados - Coach IA demonstra atividades leves",
    "signs_of_overtraining": "Sinais importantes para reconhecer e prevenir overtraining com demonstrações visuais"
  }
}

INSTRUÇÕES CRÍTICAS PARA O COACH VIRTUAL:
- O Coach IA 🤖💪 deve demonstrar VISUALMENTE cada movimento como um boneco explicativo
- Inclua descrições detalhadas de COMO o Coach IA executa cada movimento
- Use emojis e símbolos visuais para tornar as demonstrações mais claras
- Descreva a posição corporal do Coach IA em cada fase do exercício
- Inclua demonstrações de erros comuns (❌) vs execução correta (✅)
- Mostre o ritmo e respiração através das ações do Coach IA
- Crie TODOS os ${totalWorkouts} treinos únicos e variados para 6 SEMANAS COMPLETAS
- Cada exercício deve ter demonstração visual completa pelo Coach IA (mínimo 4-5 frases por demonstração)
- Use apenas equipamentos disponíveis para ${requestData.workout_location}
- Adapte intensidade e complexidade para nível ${requestData.fitness_level}
- Foque no objetivo específico: ${requestData.fitness_goals}
- Considere limitações: ${requestData.health_conditions || 'Nenhuma'}
- Mantenha português brasileiro em todas as instruções e demonstrações`;

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
            content: 'Você é um personal trainer brasileiro extremamente experiente e didático. Responda APENAS com JSON válido, sem formatação markdown. Inicie com { e termine com }. Seja MUITO detalhado nas instruções dos exercícios com demonstrações visuais completas pelo Coach IA virtual, incluindo anatomia, biomecânica, respiração e progressões específicas. O Coach IA deve ser como um boneco demonstrativo que mostra cada movimento detalhadamente.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 26000,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro na API Groq: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    
    const workoutPlan = cleanAndParseJSON(content);
    
    // Garantir que temos 6 semanas e o número correto de treinos
    workoutPlan.duration_weeks = 6;
    
    if (workoutPlan.workouts.length !== totalWorkouts) {
      console.warn(`⚠️ Ajustando número de treinos: ${workoutPlan.workouts.length} → ${totalWorkouts}`);
      
      while (workoutPlan.workouts.length < totalWorkouts) {
        const baseIndex = workoutPlan.workouts.length % (workoutPlan.workouts.length || 1);
        const baseWorkout = workoutPlan.workouts[baseIndex];
        const newWeek = Math.floor(workoutPlan.workouts.length / requestData.workout_days) + 1;
        const newDay = (workoutPlan.workouts.length % requestData.workout_days) + 1;
        
        const newWorkout = {
          ...baseWorkout,
          week: newWeek,
          day: newDay,
          title: `${baseWorkout.title} - S${newWeek}D${newDay}`
        };
        workoutPlan.workouts.push(newWorkout);
      }
      
      if (workoutPlan.workouts.length > totalWorkouts) {
        workoutPlan.workouts = workoutPlan.workouts.slice(0, totalWorkouts);
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
