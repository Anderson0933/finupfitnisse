
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
    const { userProfile } = await req.json();
    console.log('Dados recebidos na API:', userProfile);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey) {
      console.error('GROQ_API_KEY não configurada');
      console.log('Usando plano de fallback devido à chave não configurada');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('Chave Groq configurada, gerando prompt...');

    // Mapear valores para português mais amigável
    const goalsMap = {
      'perder_peso': 'perder peso e queimar gordura',
      'ganhar_massa': 'ganhar massa muscular',
      'tonificar': 'tonificar o corpo',
      'condicionamento': 'melhorar condicionamento físico',
      'forca': 'aumentar força',
      'flexibilidade': 'melhorar flexibilidade',
      'geral': 'fitness geral'
    };

    const equipmentMap = {
      'academia_completa': 'academia completa com todos os equipamentos',
      'casa_halteres': 'casa com halteres e equipamentos básicos',
      'casa_basico': 'casa com equipamentos básicos',
      'peso_corporal': 'apenas peso corporal, sem equipamentos',
      'parque': 'parque ou área externa'
    };

    const limitationsMap = {
      'nenhuma': 'nenhuma limitação física',
      'joelho': 'problemas no joelho',
      'costas': 'problemas nas costas',
      'ombro': 'problemas no ombro',
      'tornozelo': 'problemas no tornozelo',
      'cardiaco': 'problemas cardíacos',
      'outros': 'outras limitações físicas'
    };

    const goals = goalsMap[userProfile.fitness_goals?.[0]] || userProfile.fitness_goals?.[0] || 'melhorar condicionamento geral';
    const equipment = equipmentMap[userProfile.equipment] || userProfile.equipment || 'equipamentos básicos';
    const limitations = limitationsMap[userProfile.limitations] || userProfile.limitations || 'nenhuma limitação';

    // Criar prompt muito mais detalhado para planos completos
    const prompt = `Você é um personal trainer experiente e especialista em ciência do exercício. Crie um plano de treino EXTREMAMENTE DETALHADO e personalizado em português com base nas seguintes informações:

PERFIL DO USUÁRIO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- Nível de condicionamento: ${userProfile.fitness_level || 'Iniciante'}
- Objetivos: ${goals}
- Dias disponíveis: ${userProfile.available_days || 3} por semana
- Duração da sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos: ${equipment}
- Limitações: ${limitations}

INSTRUÇÕES PARA O PLANO:
1. Crie um plano dividido por DIAS DA SEMANA específicos
2. Cada exercício deve ter instruções biomecânicas detalhadas
3. Inclua progressão semanal específica
4. Adicione tempo de descanso específico por exercício
5. Inclua aquecimento e alongamento detalhados
6. Adicione dicas de execução e músculos trabalhados
7. Inclua variações para diferentes níveis
8. Adicione protocolo de recuperação entre treinos
9. NÃO inclua recomendações médicas ou avisos sobre consultar médicos

RETORNE APENAS um JSON válido no seguinte formato EXPANDIDO:

{
  "title": "Plano de Treino Personalizado - [Objetivo Principal]",
  "description": "Descrição detalhada considerando perfil completo, objetivos e limitações específicas",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "weekly_schedule": {
    "segunda": {
      "focus": "Descrição do foco do dia",
      "warm_up": [
        {
          "exercise": "Nome do aquecimento",
          "duration": "tempo",
          "instructions": "instruções detalhadas"
        }
      ],
      "main_workout": [
        {
          "exercise": "Nome do exercício",
          "muscle_groups": ["grupo muscular 1", "grupo muscular 2"],
          "sets": 3,
          "reps": "8-12",
          "rest": "90s",
          "weight_progression": "Como progredir na carga",
          "execution_tips": "Dicas específicas de execução",
          "biomechanics": "Explicação biomecânica do movimento",
          "common_mistakes": "Erros comuns a evitar",
          "modifications": {
            "easier": "Versão mais fácil",
            "harder": "Versão mais difícil"
          }
        }
      ],
      "cool_down": [
        {
          "exercise": "Alongamento específico",
          "duration": "30s",
          "instructions": "Como executar o alongamento"
        }
      ]
    },
    "terca": {
      "focus": "Descanso ativo ou treino complementar",
      "activities": ["Caminhada leve", "Alongamento", "Mobilidade"]
    },
    "quarta": {
      "focus": "Foco do dia",
      "warm_up": [],
      "main_workout": [],
      "cool_down": []
    },
    "quinta": {
      "focus": "Descanso ou treino leve",
      "activities": []
    },
    "sexta": {
      "focus": "Foco do dia",
      "warm_up": [],
      "main_workout": [],
      "cool_down": []
    },
    "sabado": {
      "focus": "Treino opcional ou atividade recreativa",
      "activities": []
    },
    "domingo": {
      "focus": "Descanso completo",
      "activities": ["Descanso total", "Hidratação", "Preparação para semana"]
    }
  },
  "progression_protocol": {
    "week_1_2": "Adaptação e aprendizado dos movimentos",
    "week_3_4": "Aumento gradual da intensidade",
    "week_5_8": "Consolidação e progressão constante",
    "week_9_12": "Intensificação e refinamento"
  },
  "nutrition_guidelines": {
    "pre_workout": {
      "timing": "30-60 minutos antes",
      "foods": ["Sugestão 1", "Sugestão 2"],
      "macros": "Proporção de carboidratos e proteínas"
    },
    "post_workout": {
      "timing": "Até 30 minutos após",
      "foods": ["Sugestão 1", "Sugestão 2"],
      "macros": "Proporção para recuperação"
    },
    "daily_targets": {
      "protein": "X gramas por kg de peso corporal",
      "carbs": "Recomendação específica",
      "fats": "Porcentagem do total calórico",
      "water": "Litros por dia baseado no peso"
    },
    "supplements": ["Suplemento opcional 1", "Suplemento opcional 2"]
  },
  "recovery_protocols": {
    "between_sets": "Tempo de descanso específico por tipo de exercício",
    "between_workouts": "Protocolo de recuperação entre sessões",
    "sleep": "Recomendações de sono para recuperação",
    "stress_management": "Técnicas para reduzir cortisol"
  },
  "progress_tracking": {
    "weekly_assessments": "O que medir semanalmente",
    "monthly_evaluations": "Avaliações mensais completas",
    "adjustment_protocols": "Quando e como ajustar o plano"
  },
  "safety_guidelines": [
    "Dica de segurança 1 específica para o perfil",
    "Dica de segurança 2 considerando limitações",
    "Protocolo em caso de dor ou desconforto",
    "Sinais de overtraining para observar"
  ]
}

IMPORTANTE: 
- Crie um plano COMPLETO com pelo menos ${userProfile.available_days || 3} dias de treino efetivo
- Considere TODAS as limitações físicas mencionadas
- Adapte os exercícios aos equipamentos disponíveis
- Inclua progressão realista e segura
- O campo difficulty_level deve ser exatamente: "iniciante", "intermediario", ou "avancado"
- Seja específico nas instruções biomecânicas
- NÃO inclua recomendações para consultar médicos
- Retorne APENAS o JSON, sem markdown, sem explicações adicionais`;

    console.log('Enviando requisição para Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.3,
      }),
    });

    console.log('Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Groq:', response.status, errorText);
      
      // Se der erro, usar plano fallback
      console.log('Usando plano de fallback devido ao erro na API');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const data = await response.json    console.log(\'Resposta recebida do Groq\');
    console.log(\'Conteúdo bruto da resposta Groq:\', JSON.stringify(data)); // Log bruto

    let content = data.choices?.[0]?.message?.content || \'\';

    if (!content) {
      console.log('Conteúdo vazio, usando fallback');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
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
      console.log(\'JSON parseado com sucesso\
Conteúdo parseado:\', JSON.stringify(workoutPlan)); // Log do JSON parseado
      
      // Validar e corrigir difficulty_levell
      const validLevels = ['iniciante', 'intermediario', 'avancado'];
      if (!workoutPlan.difficulty_level || !validLevels.includes(workoutPlan.difficulty_level)) {
        workoutPlan.difficulty_level = mapFitnessLevelToDifficulty(userProfile.fitness_level);
      }
      
      // Converter estrutura nova para formato compatível com o frontend
      if (workoutPlan.weekly_schedule) {
        // workoutPlan.exercises = convertWeeklyScheduleToExercises(workoutPlan.weekly_schedule); // Comentado para enviar estrutura completa
      }
      
      // Validar estrutura básica - agora checando weekly_schedule
      if (!workoutPlan.title || !workoutPlan.weekly_schedule) {
        console.error(\'Estrutura JSON inválida: Título ou weekly_schedule ausente.\');
        throw new Error(\'Estrutura do JSON inválida: Título ou weekly_schedule ausente.\');
      }     
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', content);
      
      // Usar plano de fallback
      workoutPlan = createFallbackPlan(userProfile);
    }

    console.log('Retornando plano final:', workoutPlan);

    return new Response(
      JSON.stringify(workoutPlan),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Erro no generate-workout-plan:', error);
    
    // Em caso de erro geral, retornar plano básico
    const basicPlan = createFallbackPlan(null);

    return new Response(
      JSON.stringify(basicPlan),
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

function convertWeeklyScheduleToExercises(weeklySchedule: any): any[] {
  const exercises = [];
  let exerciseIndex = 0;
  
  Object.entries(weeklySchedule).forEach(([day, dayData]: [string, any]) => {
    if (dayData.main_workout && Array.isArray(dayData.main_workout)) {
      dayData.main_workout.forEach((exercise: any) => {
        exercises.push({
          name: `${day.charAt(0).toUpperCase() + day.slice(1)}: ${exercise.exercise}`,
          sets: exercise.sets || 3,
          reps: exercise.reps || "8-12",
          rest: exercise.rest || "60s",
          instructions: `${exercise.execution_tips || ''}\n\nBiomecânica: ${exercise.biomechanics || ''}\n\nMúsculos: ${exercise.muscle_groups ? exercise.muscle_groups.join(', ') : ''}\n\nProgressão: ${exercise.weight_progression || ''}\n\nErros comuns: ${exercise.common_mistakes || ''}`
        });
        exerciseIndex++;
      });
    }
  });
  
  // Se não tiver exercícios suficientes, adicionar alguns básicos
  if (exercises.length < 5) {
    exercises.push(
      {
        name: "Aquecimento Geral",
        sets: 1,
        reps: "5-10 min",
        rest: "N/A",
        instructions: "Caminhada leve, movimentos articulares e ativação muscular progressiva"
      },
      {
        name: "Exercício Principal 1",
        sets: 3,
        reps: "8-12",
        rest: "90s",
        instructions: "Exercício focado no objetivo principal do treino"
      }
    );
  }
  
  return exercises;
}

function mapFitnessLevelToDifficulty(fitnessLevel: string): string {
  switch (fitnessLevel) {
    case 'sedentario':
    case 'pouco_ativo':
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

function createFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'sedentario';
  const goals = userProfile?.fitness_goals?.[0] || 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  
  // Mapear objetivos para descrição
  const goalsDescription = {
    'perder_peso': 'perda de peso e queima de gordura',
    'ganhar_massa': 'ganho de massa muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  
  return {
    title: `Plano de Treino ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano personalizado focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    exercises: [
      {
        name: "Segunda-feira: Aquecimento Dinâmico",
        sets: 1,
        reps: "8-10 minutos",
        rest: "N/A",
        instructions: "Aquecimento articular completo: rotações de pescoço, ombros, quadris e tornozelos. Caminhada no local com elevação gradual dos joelhos. Polichinelos leves. Prepare o corpo para os exercícios principais."
      },
      {
        name: "Segunda-feira: Agachamento Livre",
        sets: level === 'sedentario' ? 3 : 4,
        reps: level === 'sedentario' ? "8-10" : "12-15",
        rest: "90s",
        instructions: "Posição inicial: pés na largura dos ombros, pontas levemente para fora. Descida: flexione quadris e joelhos simultaneamente, mantendo o peso nos calcanhares. Desça até coxas paralelas ao chão. Subida: empurre o chão com os pés, ativando glúteos e quadríceps. Mantenha o tronco ereto e core ativado durante todo movimento."
      },
      {
        name: "Segunda-feira: Flexão de Braço",
        sets: 3,
        reps: level === 'sedentario' ? "5-8" : "10-15",
        rest: "60s",
        instructions: "Posição: apoio nas mãos (na largura dos ombros) e pontas dos pés. Corpo alinhado da cabeça aos calcanhares. Descida controlada até peito quase tocar o solo. Subida explosiva estendendo completamente os braços. Respiração: inspire na descida, expire na subida. Variação mais fácil: apoio nos joelhos."
      },
      {
        name: "Quarta-feira: Prancha Isométrica",
        sets: 3,
        reps: level === 'sedentario' ? "20-30s" : "45-60s",
        rest: "45s",
        instructions: "Posição: apoio nos antebraços e pontas dos pés. Corpo reto como uma tábua. Core contraído, glúteos ativados. Respiração normal e controlada. Olhar fixo no chão. Evite arquear as costas ou elevar muito o quadril. Foque na qualidade da contração abdominal."
      },
      {
        name: "Quarta-feira: Afundo Alternado",
        sets: 3,
        reps: level === 'sedentario' ? "6-8 cada perna" : "10-12 cada perna",
        rest: "60s",
        instructions: "Passo à frente amplo, descendo até formar 90° em ambos os joelhos. Joelho da frente alinhado com o tornozelo. Tronco ereto, core ativado. Impulso com perna da frente para retornar. Alterne as pernas. Trabalha quadríceps, glúteos e melhora equilíbrio e coordenação."
      },
      {
        name: "Sexta-feira: Burpee Modificado",
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "3-5" : "5-8",
        rest: "90s",
        instructions: "Movimento completo: agachamento, apoio no chão, extensão das pernas (posição de flexão), retorno à posição de agachamento, salto com braços elevados. Exercício metabólico completo que trabalha força e condicionamento. Execute com controle, priorizando a técnica sobre a velocidade."
      },
      {
        name: "Alongamento Final Completo",
        sets: 1,
        reps: "10-15 minutos",
        rest: "N/A",
        instructions: "Sequência de alongamentos estáticos: quadríceps (30s), isquiotibiais (30s), panturrilha (30s), glúteos (30s), peitoral (30s), ombros (30s), lombar (30s). Respiração profunda e relaxante. Mantenha cada posição sem dor, apenas tensão confortável. Essencial para recuperação e flexibilidade."
      }
    ],
    nutrition_tips: [
      "Proteína pós-treino: consuma 20-30g dentro de 30min após exercitar-se (whey, ovos, frango, peixe)",
      "Hidratação otimizada: 35ml por kg de peso corporal + 500-750ml extra nos dias de treino",
      "Carboidratos pré-treino: consuma 30-50g de carboidratos complexos 1-2h antes (aveia, batata-doce, banana)",
      "Timing nutricional: café da manhã rico em proteína, almoço balanceado, jantar leve 3h antes de dormir",
      "Micronutrientes essenciais: inclua vegetais coloridos, frutas variadas e oleaginosas para vitaminas e minerais",
      "Sono reparador: 7-9h por noite para recuperação muscular e produção de hormônios anabólicos",
      "Suplementação básica: considere vitamina D, ômega-3 e multivitamínico após consulta profissional"
    ]
  };
}
