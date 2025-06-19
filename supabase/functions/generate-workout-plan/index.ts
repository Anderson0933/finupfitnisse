
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
Você é um personal trainer profissional brasileiro com mais de 15 anos de experiência. Crie um plano de treino EXTREMAMENTE DETALHADO em formato JSON válido.

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
6. TODAS as instruções devem estar em português brasileiro claro e detalhado
7. As instruções dos exercícios devem ser MUITO EXPLICATIVAS, como se você fosse um personal experiente orientando presencialmente
8. Inclua detalhes sobre posicionamento corporal, respiração, amplitude de movimento e sensações esperadas
9. Explique PASSO A PASSO como executar cada exercício
10. Inclua dicas de segurança e erros comuns a evitar

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
            "instructions": "Instruções detalhadas em português: Comece na posição inicial [descrever posição exata], execute o movimento [descrever movimento completo], mantenha a respiração [quando inspirar/expirar], foque em [sensações esperadas]. Este aquecimento prepara [músculos específicos] para o treino."
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
          "weight_guidance": "Orientação específica sobre carga baseada no nível ${fitness_level}",
          "instructions": "INSTRUÇÕES ULTRA DETALHADAS EM PORTUGUÊS BRASILEIRO: PASSO 1 - POSIÇÃO INICIAL: [Descrever exatamente como se posicionar, onde colocar os pés, como segurar o equipamento, postura do tronco, alinhamento da coluna]. PASSO 2 - EXECUÇÃO DO MOVIMENTO: [Descrever o movimento completo, qual parte do corpo se move primeiro, direção do movimento, amplitude completa, velocidade de execução]. PASSO 3 - RESPIRAÇÃO: [Quando inspirar profundamente, quando expirar com força, como manter o ritmo respiratório]. PASSO 4 - FINALIZAÇÃO: [Como retornar à posição inicial de forma controlada, como finalizar cada repetição]. PASSO 5 - SENSAÇÕES ESPERADAS: [Onde deve sentir o músculo trabalhando, como saber se está executando corretamente, sensações normais vs. sinais de alerta]. PASSO 6 - DICAS DE SEGURANÇA: [Erros mais comuns a evitar, sinais de má execução, como proteger articulações].",
          "form_cues": [
            "Mantenha o core sempre contraído durante todo o movimento para proteger a coluna",
            "Controle rigorosamente a velocidade - 2 segundos na fase excêntrica (descida), 1 segundo na fase concêntrica (subida)",
            "Foque intensamente na conexão mente-músculo, visualize o músculo trabalhando a cada repetição",
            "Mantenha a respiração fluida e controlada, nunca prenda o ar durante o esforço",
            "Verifique constantemente o alinhamento da coluna e postura antes de iniciar cada série"
          ],
          "progression_notes": "PROGRESSÃO SEMANAL DETALHADA: Semana 1-2 (Adaptação): Foque exclusivamente na técnica perfeita com peso leve a moderado, domine o padrão de movimento. Semana 3-4 (Sobrecarga): Aumente o peso em 5-10% quando conseguir completar todas as repetições com 2 repetições de reserva. Semana 5-6 (Intensificação): Continue a progressão de carga, reduza o descanso em 10-15 segundos. Semana 7-8 (Pico): Teste seus limites mantendo sempre a técnica perfeita, aumente a densidade do treino."
        }
      ],
      "cool_down": {
        "duration": 5,
        "exercises": [
          {
            "name": "Nome do alongamento",
            "duration": 45,
            "instructions": "Instruções detalhadas do alongamento em português: Posicione-se [posição inicial detalhada], execute o alongamento [como fazer o movimento], mantenha [intensidade adequada], respire [padrão respiratório], sinta [benefícios específicos]. Este alongamento ajuda na recuperação de [músculos específicos] e previne [problemas comuns]."
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "HIDRATAÇÃO: Beba pelo menos 500ml de água pura 30-45 minutos antes do treino de ${available_time} para otimizar a performance",
    "PRÉ-TREINO: Consuma carboidratos de fácil digestão 60-90 minutos antes (banana com aveia, torrada com mel) para energia sustentada",
    "PÓS-TREINO: Consuma proteína de alta qualidade + carboidrato até 30 minutos após o treino para maximizar a recuperação muscular",
    "PARA SEU PERFIL (IMC ${bmi.toFixed(1)}, objetivo ${fitness_goals}): Ajuste as porções conforme orientação nutricional individualizada",
    "SONO E RECUPERAÇÃO: Durma 7-9 horas por noite para otimizar a recuperação muscular e síntese proteica",
    "ALIMENTAÇÃO BALANCEADA: Inclua proteínas magras, carboidratos complexos e gorduras boas em cada refeição"
  ],
  "progression_schedule": {
    "week_1_2": "FASE DE ADAPTAÇÃO (Semanas 1-2): Foque na aprendizagem motora e técnica perfeita, use cargas leves a moderadas, priorize a forma correta sobre o peso",
    "week_3_4": "FASE DE SOBRECARGA (Semanas 3-4): Implemente sobrecarga progressiva aumentando peso/intensidade quando dominar completamente o movimento",
    "week_5_6": "FASE DE INTENSIFICAÇÃO (Semanas 5-6): Aumente a densidade do treino, reduza descansos, desafie-se mantendo sempre a forma correta", 
    "week_7_8": "FASE DE PICO (Semanas 7-8): Teste seus limites com segurança, maximize a performance conquistada, prepare para novo ciclo"
  }
}

IMPORTANTE: Crie TODOS os ${totalWorkouts} treinos completos. Cada treino deve ter instruções EXTREMAMENTE detalhadas em português brasileiro, como se você fosse um personal trainer experiente orientando pessoalmente o aluno. Seja específico sobre técnica, respiração, sensações e progressão.

Retorne APENAS o objeto JSON válido, completo e bem formatado.`;

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
            content: 'Você é um personal trainer brasileiro profissional e experiente. Você DEVE responder APENAS com JSON válido, sem texto adicional. Todas as instruções devem ser EXTREMAMENTE DETALHADAS em português brasileiro, como se você fosse um personal trainer experiente orientando presencialmente. Inicie sua resposta com { e termine com }. NUNCA adicione texto antes ou depois do JSON.'
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
      let content = data.choices[0].message.content;
      console.log('🔍 Conteúdo recebido (primeiros 500 chars):', content.substring(0, 500) + '...');
      
      // Limpeza mais robusta do conteúdo
      content = content.trim();
      
      // Remover qualquer texto antes da primeira chave
      const jsonStartIndex = content.indexOf('{');
      if (jsonStartIndex > 0) {
        content = content.substring(jsonStartIndex);
        console.log('🧹 Removido texto antes do JSON');
      }
      
      // Encontrar a última chave fechando
      const jsonEndIndex = content.lastIndexOf('}');
      if (jsonEndIndex !== content.length - 1 && jsonEndIndex > 0) {
        content = content.substring(0, jsonEndIndex + 1);
        console.log('🧹 Removido texto após o JSON');
      }
      
      // Verificar se o JSON está completo
      if (!content.startsWith('{') || !content.endsWith('}')) {
        console.error('❌ JSON malformado - não inicia com { ou não termina com }');
        throw new Error('Resposta da API não é um JSON válido - formato incorreto');
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
      console.error('❌ Conteúdo que causou erro:', data.choices[0].message.content);
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
