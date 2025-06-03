
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

    // Criar prompt muito mais detalhado e profissional
    const prompt = `Você é um personal trainer certificado com 15+ anos de experiência. Crie um plano de treino EXTREMAMENTE DETALHADO e profissional em português com base no perfil:

PERFIL DO CLIENTE:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- Nível: ${userProfile.fitness_level || 'Iniciante'}
- Objetivos: ${goals}
- Dias/semana: ${userProfile.available_days || 3}
- Duração/sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos: ${equipment}
- Limitações: ${limitations}

IMPORTANTE: Retorne APENAS um JSON válido no formato exato abaixo:

{
  "title": "Plano de Treino Personalizado - [Objetivo Principal]",
  "description": "Descrição profissional detalhada do plano (3-4 linhas explicando metodologia, progressão e benefícios esperados)",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 8,
  "weekly_structure": {
    "training_days": [número de dias],
    "rest_days": [número de dias],
    "weekly_progression": "Descrição de como progredir semana a semana"
  },
  "warm_up": {
    "duration": "10-15 minutos",
    "exercises": [
      {
        "name": "Nome do exercício de aquecimento",
        "duration": "2-3 minutos",
        "instructions": "Instruções detalhadas e específicas"
      }
    ]
  },
  "exercises": [
    {
      "name": "Nome completo do exercício",
      "category": "peito|costas|pernas|ombros|bracos|core|cardio",
      "sets": 3,
      "reps": "8-12",
      "rest": "60-90s",
      "weight_guidance": "Orientação específica sobre carga (ex: 70% do peso máximo, peso que permita 2 reps a mais)",
      "execution_tempo": "2-1-2-1 (excêntrica-pausa-concêntrica-pausa)",
      "instructions": "Instruções MUITO detalhadas sobre execução, posicionamento, respiração e pontos de atenção",
      "common_mistakes": "Principais erros a evitar na execução",
      "modifications": {
        "easier": "Versão mais fácil para iniciantes",
        "harder": "Versão mais desafiadora para progressão"
      },
      "muscle_focus": "Músculos principais e secundários trabalhados"
    }
  ],
  "cool_down": {
    "duration": "10-15 minutos",
    "exercises": [
      {
        "name": "Nome do alongamento",
        "duration": "30-60 segundos",
        "instructions": "Como executar o alongamento corretamente"
      }
    ]
  },
  "progression_guidelines": [
    "Como progredir na carga semana a semana",
    "Sinais de que está pronto para aumentar intensidade",
    "Como ajustar volume conforme evolução"
  ],
  "nutrition_tips": [
    "Dica nutricional específica para o objetivo",
    "Timing de alimentação pré e pós treino",
    "Hidratação e suplementação básica"
  ],
  "recovery_tips": [
    "Importância do descanso entre treinos",
    "Qualidade do sono para recuperação",
    "Sinais de overtraining a observar"
  ],
  "safety_notes": [
    "Precauções específicas para as limitações mencionadas",
    "Quando parar um exercício",
    "Importância do aquecimento adequado"
  ]
}

DIRETRIZES OBRIGATÓRIAS:
1. Inclua 6-10 exercícios principais adequados ao nível e equipamentos
2. Cada exercício deve ter instruções de pelo menos 2-3 linhas
3. Considere SEMPRE as limitações físicas mencionadas
4. Crie progressão lógica dos exercícios (grandes grupos → isolados)
5. Balanceie grupos musculares conforme objetivo
6. Adapte intensidade ao nível de condicionamento
7. O campo difficulty_level deve ser EXATAMENTE: "iniciante", "intermediario" ou "avancado"
8. Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações extras`;

    console.log('Enviando requisição para Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000, // Aumentado para acomodar o conteúdo mais detalhado
        temperature: 0.3,
      }),
    });

    console.log('Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Groq:', response.status, errorText);
      
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

    const data = await response.json();
    console.log('Resposta recebida do Groq');

    let content = data.choices?.[0]?.message?.content || '';

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
      console.log('JSON parseado com sucesso');
      
      // Validar e corrigir difficulty_level
      const validLevels = ['iniciante', 'intermediario', 'avancado'];
      if (!workoutPlan.difficulty_level || !validLevels.includes(workoutPlan.difficulty_level)) {
        workoutPlan.difficulty_level = mapFitnessLevelToDifficulty(userProfile.fitness_level);
      }
      
      // Validar estrutura básica (adaptada para novo formato)
      if (!workoutPlan.title || !workoutPlan.exercises || !Array.isArray(workoutPlan.exercises)) {
        throw new Error('Estrutura do JSON inválida');
      }
      
      // Garantir compatibilidade com interface existente
      if (!workoutPlan.nutrition_tips) {
        workoutPlan.nutrition_tips = [];
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
    description: `Plano personalizado focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos com metodologia progressiva e orientações detalhadas.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    weekly_structure: {
      training_days: userProfile?.available_days || 3,
      rest_days: 7 - (userProfile?.available_days || 3),
      weekly_progression: "Aumento gradual de 5-10% na carga ou repetições a cada semana"
    },
    warm_up: {
      duration: "10-15 minutos",
      exercises: [
        {
          name: "Caminhada no Local",
          duration: "3-5 minutos",
          instructions: "Movimento suave para aquecer o sistema cardiovascular. Mantenha um ritmo confortável e respire profundamente."
        },
        {
          name: "Mobilidade Articular",
          duration: "5-7 minutos",
          instructions: "Movimentos circulares de ombros, quadris, joelhos e tornozelos. 10 repetições em cada direção."
        }
      ]
    },
    exercises: [
      {
        name: "Agachamento Livre",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "8-10" : "12-15",
        rest: "60-90s",
        weight_guidance: "Use apenas o peso corporal inicialmente. Quando conseguir fazer 15 reps facilmente, adicione peso",
        execution_tempo: "2-1-2-1 (2s descida, 1s pausa, 2s subida, 1s pausa)",
        instructions: "Mantenha os pés na largura dos ombros, desça controladamente até formar 90 graus com os joelhos. Mantenha o peito erguido, olhar para frente e o peso nos calcanhares. Inicie o movimento empurrando o quadril para trás.",
        common_mistakes: "Não deixe os joelhos ultrapassarem muito as pontas dos pés, não arredonde as costas, não desça muito rápido",
        modifications: {
          easier: "Agachamento com apoio na parede ou cadeira para assistência",
          harder: "Agachamento com salto ou agachamento búlgaro (uma perna)"
        },
        muscle_focus: "Quadríceps, glúteos, isquiotibiais e core"
      },
      {
        name: "Flexão de Braço",
        category: "peito",
        sets: 3,
        reps: level === 'sedentario' ? "5-8" : "8-12",
        rest: "60-90s",
        weight_guidance: "Use o peso corporal. Se muito difícil, faça com joelhos apoiados",
        execution_tempo: "2-0-1-0 (2s descida, explosiva subida)",
        instructions: "Mantenha o corpo alinhado da cabeça aos pés como uma prancha. Desça até o peito quase tocar o chão, empurre com força para subir. Mantenha o core contraído durante todo movimento.",
        common_mistakes: "Não deixe a barriga cair, não suba apenas parcialmente, não abra muito os cotovelos",
        modifications: {
          easier: "Flexão com joelhos apoiados ou flexão na parede",
          harder: "Flexão com pés elevados ou flexão diamante"
        },
        muscle_focus: "Peitoral maior, tríceps, deltoides anterior e core"
      },
      {
        name: "Prancha Isométrica",
        category: "core",
        sets: 3,
        reps: level === 'sedentario' ? "20-30s" : "30-60s",
        rest: "45-60s",
        weight_guidance: "Apenas peso corporal, foque na qualidade do movimento",
        execution_tempo: "Isométrico - mantenha a posição",
        instructions: "Apoie nos antebraços e pontas dos pés, mantenha o corpo reto como uma prancha. Contraia abdômen, glúteos e respire normalmente. Olhar para o chão mantendo pescoço neutro.",
        common_mistakes: "Não deixe o quadril subir ou descer, não prenda a respiração, não force o pescoço",
        modifications: {
          easier: "Prancha com joelhos apoiados ou prancha inclinada",
          harder: "Prancha com elevação alternada de braços ou pernas"
        },
        muscle_focus: "Core completo, deltoides e glúteos para estabilização"
      },
      {
        name: "Afundo Alternado",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "6-8 cada perna" : "10-12 cada perna",
        rest: "60-90s",
        weight_guidance: "Inicie sem peso, quando dominar o movimento adicione halteres",
        execution_tempo: "2-1-2-0 (2s descida, 1s pausa, 2s subida)",
        instructions: "Dê um passo à frente, desça até formar 90 graus em ambos os joelhos. O joelho da frente não deve ultrapassar a ponta do pé. Mantenha o tronco ereto e o peso distribuído. Empurre com o calcanhar da frente para voltar.",
        common_mistakes: "Não incline o corpo para frente, não deixe o joelho de trás tocar o chão violentamente",
        modifications: {
          easier: "Afundo com apoio lateral ou afundo estático",
          harder: "Afundo com salto ou afundo búlgaro elevado"
        },
        muscle_focus: "Quadríceps, glúteos, isquiotibiais e core para estabilização"
      },
      {
        name: "Ponte de Glúteo",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "10-15" : "15-20",
        rest: "45-60s",
        weight_guidance: "Peso corporal inicialmente, pode adicionar peso sobre o quadril posteriormente",
        execution_tempo: "1-2-1-0 (1s subida, 2s contração, 1s descida)",
        instructions: "Deitado de costas, joelhos flexionados, pés firmes no chão. Eleve o quadril contraindo glúteos, forme uma linha reta dos joelhos aos ombros. Mantenha a contração no topo por 2 segundos.",
        common_mistakes: "Não hiperextenda a lombar, não use só as costas para elevar, não esqueça de contrair os glúteos",
        modifications: {
          easier: "Ponte com amplitude reduzida",
          harder: "Ponte com uma perna ou ponte com peso"
        },
        muscle_focus: "Glúteos, isquiotibiais e músculos do core posterior"
      }
    ],
    cool_down: {
      duration: "10-15 minutos",
      exercises: [
        {
          name: "Alongamento de Quadríceps",
          duration: "30-45 segundos cada perna",
          instructions: "Em pé, segure o pé por trás e traga em direção ao glúteo. Mantenha joelhos alinhados e quadril neutro."
        },
        {
          name: "Alongamento de Isquiotibiais",
          duration: "30-45 segundos cada perna",
          instructions: "Sentado, estenda uma perna e incline o tronco para frente mantendo as costas retas."
        },
        {
          name: "Alongamento de Peitorais",
          duration: "30-45 segundos",
          instructions: "Apoie o antebraço na parede e gire o corpo para o lado oposto, sentindo o alongamento no peito."
        },
        {
          name: "Respiração Profunda",
          duration: "2-3 minutos",
          instructions: "Inspire profundamente pelo nariz por 4 segundos, segure por 4, expire pela boca por 6 segundos."
        }
      ]
    },
    progression_guidelines: [
      "Semana 1-2: Foque na técnica perfeita com cargas/repetições menores",
      "Semana 3-4: Aumente 1-2 repetições por exercício mantendo a qualidade",
      "Semana 5-6: Adicione 1 série extra nos exercícios principais ou aumente carga em 5-10%",
      "Semana 7-8: Considere variações mais desafiadoras dos exercícios básicos",
      "Sinais para progredir: consegue fazer todas as repetições com 2-3 reps 'na reserva'"
    ],
    nutrition_tips: [
      "Consuma proteína magra 1-2h antes do treino (ovos, iogurte, peito de frango)",
      "Hidrate-se bem: pelo menos 500ml de água 2h antes e 200ml a cada 15-20min durante o treino",
      "Pós-treino: combine proteína + carboidrato em até 2h (shake + banana, sanduíche de peito de peru)",
      "Para ganho de massa: 1,6-2,2g de proteína por kg de peso corporal ao dia",
      "Para perda de peso: mantenha déficit calórico moderado (300-500 calorias) sem extremos"
    ],
    recovery_tips: [
      "Durma 7-9 horas por noite - o músculo cresce durante o descanso, não no treino",
      "Respeite pelo menos 48h de descanso entre treinos do mesmo grupo muscular",
      "Faça pelo menos 1 dia completo de descanso por semana",
      "Escute seu corpo: se sentir fadiga extrema, dores articulares ou humor alterado, descanse",
      "Considere atividades leves nos dias de descanso: caminhada, alongamento, yoga"
    ],
    safety_notes: [
      "Pare imediatamente se sentir dor aguda ou diferente do desconforto muscular normal",
      "NUNCA pule o aquecimento - previne 80% das lesões relacionadas ao exercício",
      "Use roupas adequadas e tênis com boa absorção de impacto",
      "Se tiver limitações médicas, sempre consulte um profissional antes de aumentar intensidade",
      "Mantenha uma garrafa de água sempre próxima e hidrate-se regularmente"
    ]
  };
}
