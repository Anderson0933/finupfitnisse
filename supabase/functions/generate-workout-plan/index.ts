
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

    // Criar prompt ULTRA DETALHADO baseado no perfil do usuário
    const prompt = `Você é um personal trainer PhD em Fisiologia do Exercício com 20 anos de experiência. Crie um plano de treino EXTREMAMENTE DETALHADO e profissional em português, ORGANIZADO POR DIAS DA SEMANA.

PERFIL COMPLETO DO USUÁRIO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- IMC: ${userProfile.height && userProfile.weight ? (userProfile.weight / Math.pow(userProfile.height/100, 2)).toFixed(1) : 'Não calculado'}
- Nível: ${userProfile.fitness_level || 'Iniciante'}
- Objetivos: ${goals}
- Dias disponíveis: ${userProfile.available_days || 3} por semana
- Duração da sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos: ${equipment}
- Limitações: ${limitations}

INSTRUÇÕES PARA CRIAÇÃO DO PLANO:

1. ESTRUTURA POR DIAS: Organize o treino por dias específicos (Segunda, Terça, etc.)
2. DETALHAMENTO MÁXIMO: Cada exercício deve ter instruções biomecânicas completas
3. PROGRESSÃO CIENTÍFICA: Base as progressões em princípios de sobrecarga progressiva
4. PERIODIZAÇÃO: Inclua microciclos e mesociclos estruturados
5. SEGURANÇA: Considerações específicas para limitações mencionadas

RETORNE APENAS um JSON válido no seguinte formato EXPANDIDO:

{
  "title": "Plano de Treino Científico Personalizado - [OBJETIVO PRINCIPAL]",
  "description": "Descrição detalhada de 200-300 palavras explicando a metodologia, princípios aplicados e resultados esperados",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "weekly_structure": {
    "days_per_week": ${userProfile.available_days || 3},
    "session_duration": "${userProfile.session_duration || 60} minutos",
    "rest_days": "Descrição completa de como usar os dias de descanso com atividades específicas",
    "progression_schedule": "Protocolo detalhado de como progredir semanalmente com percentuais específicos"
  },
  "weekly_schedule": [
    {
      "day": "Segunda-feira",
      "focus": "Treino de Força - Membros Superiores",
      "duration": "${userProfile.session_duration || 60} minutos",
      "warm_up": {
        "duration": "15 minutos",
        "activities": [
          {
            "name": "Ativação Cardiovascular",
            "duration": "5 minutos",
            "description": "Descrição detalhada da atividade",
            "intensity": "50-60% FCmax",
            "instructions": "Instruções passo-a-passo específicas"
          },
          {
            "name": "Mobilidade Articular",
            "duration": "5 minutos", 
            "description": "Mobilizações específicas para o treino do dia",
            "instructions": "Como executar cada mobilização com detalhes anatômicos"
          },
          {
            "name": "Ativação Neuromuscular",
            "duration": "5 minutos",
            "description": "Ativações específicas para membros superiores",
            "instructions": "Técnicas de ativação pré-treino detalhadas"
          }
        ]
      },
      "exercises": [
        {
          "name": "Nome Completo do Exercício",
          "category": "Força|Cardio|Flexibilidade|Funcional",
          "primary_muscles": ["Músculo principal 1", "Músculo principal 2"],
          "secondary_muscles": ["Músculo secundário 1", "Músculo secundário 2"],
          "sets": 4,
          "reps": "8-12",
          "rest": "90-120s",
          "tempo": "3-1-2-1 (excêntrica-pausa-concêntrica-pausa)",
          "load": "70-80% 1RM ou descrição específica da carga",
          "execution": {
            "starting_position": "Descrição anatômica ultra-detalhada da posição inicial com pontos de referência corporais",
            "movement_phase_1": "Descrição detalhada da primeira fase do movimento",
            "movement_phase_2": "Descrição detalhada da fase de transição",
            "movement_phase_3": "Descrição detalhada da fase final do movimento",
            "breathing_pattern": "Padrão respiratório específico para cada fase",
            "key_cues": ["Dica técnica específica 1", "Dica técnica específica 2", "Dica técnica específica 3"]
          },
          "biomechanics": {
            "joint_actions": "Ações articulares envolvidas no movimento",
            "muscle_activation_sequence": "Sequência de ativação muscular",
            "force_vectors": "Direção das forças aplicadas",
            "stability_requirements": "Requisitos de estabilidade e core"
          },
          "progression": {
            "week_1_2": "Protocolo específico para semanas 1-2",
            "week_3_4": "Protocolo específico para semanas 3-4", 
            "week_5_8": "Protocolo específico para semanas 5-8",
            "week_9_12": "Protocolo específico para semanas 9-12",
            "load_progression": "Como aumentar carga especificamente",
            "volume_progression": "Como aumentar volume especificamente"
          },
          "safety": {
            "contraindications": "Quando NÃO fazer este exercício",
            "common_mistakes": ["Erro técnico comum 1", "Erro técnico comum 2"],
            "injury_prevention": "Cuidados específicos detalhados",
            "warning_signs": "Sinais de alerta para parar o exercício"
          },
          "modifications": {
            "beginner_version": "Versão detalhada para iniciantes",
            "advanced_version": "Versão detalhada para avançados",
            "equipment_alternatives": "Alternativas detalhadas com outros equipamentos",
            "limitation_adaptations": "Adaptações específicas para cada limitação mencionada"
          }
        }
      ],
      "cool_down": {
        "duration": "15 minutos",
        "activities": [
          {
            "name": "Redução da Frequência Cardíaca",
            "duration": "5 minutos",
            "description": "Atividades específicas para redução gradual da FC",
            "target_hr": "Faixa de FC alvo específica"
          },
          {
            "name": "Alongamento Estático",
            "duration": "10 minutos",
            "stretches": [
              {
                "muscle_group": "Grupo muscular específico",
                "stretch_name": "Nome do alongamento",
                "duration": "45-60 segundos",
                "instructions": "Instruções anatômicas detalhadas",
                "breathing": "Padrão respiratório durante o alongamento"
              }
            ]
          }
        ]
      }
    }
  ],
  "nutrition_protocol": {
    "pre_workout": {
      "timing": "60-90 minutos antes",
      "meals": [
        {
          "option": "Opção 1",
          "foods": ["Alimento específico 1", "Alimento específico 2"],
          "macros": "Carboidratos: 30-40g, Proteínas: 15-20g, Gorduras: <10g",
          "timing_rationale": "Justificativa científica do timing"
        }
      ],
      "hydration": "Protocolo específico de hidratação pré-treino",
      "supplements": "Suplementos recomendados com dosagens específicas"
    },
    "during_workout": {
      "hydration": "Protocolo de hidratação durante o treino",
      "electrolytes": "Reposição de eletrólitos se necessário",
      "energy": "Reposição energética para treinos longos"
    },
    "post_workout": {
      "timing": "Até 45 minutos após",
      "meals": [
        {
          "option": "Opção 1",
          "foods": ["Alimento específico 1", "Alimento específico 2"],
          "macros": "Proteínas: 25-30g, Carboidratos: 40-50g",
          "timing_rationale": "Justificativa da janela anabólica"
        }
      ],
      "supplements": "Suplementos pós-treino com dosagens e timing"
    },
    "daily_nutrition": {
      "total_calories": "Estimativa calórica diária baseada no objetivo",
      "macros_distribution": "Distribuição de macronutrientes específica",
      "meal_timing": "Timing ideal das refeições",
      "hydration_daily": "Meta de hidratação diária"
    }
  },
  "recovery_protocols": {
    "sleep": {
      "duration": "7-9 horas por noite",
      "quality_tips": ["Dica 1 para qualidade do sono", "Dica 2", "Dica 3"],
      "sleep_hygiene": "Protocolo completo de higiene do sono"
    },
    "active_recovery": {
      "activities": ["Atividade 1", "Atividade 2"],
      "duration": "30-45 minutos",
      "intensity": "Baixa intensidade específica"
    },
    "stress_management": {
      "techniques": ["Técnica 1", "Técnica 2"],
      "implementation": "Como implementar no dia a dia"
    },
    "monitoring": {
      "biomarkers": ["Biomarcador 1", "Biomarcador 2"],
      "subjective_scales": "Escalas subjetivas para monitoramento"
    }
  },
  "periodization": {
    "mesocycle_1": {
      "weeks": "1-4",
      "focus": "Adaptação Anatômica e Técnica",
      "volume": "Alto volume, baixa intensidade",
      "intensity": "60-70% 1RM",
      "characteristics": "Descrição detalhada dos objetivos da fase"
    },
    "mesocycle_2": {
      "weeks": "5-8",
      "focus": "Desenvolvimento de Força e Hipertrofia",
      "volume": "Moderado volume, intensidade crescente", 
      "intensity": "70-85% 1RM",
      "characteristics": "Descrição detalhada dos objetivos da fase"
    },
    "mesocycle_3": {
      "weeks": "9-12",
      "focus": "Especialização e Pico de Performance",
      "volume": "Volume moderado, alta intensidade",
      "intensity": "80-95% 1RM",
      "characteristics": "Descrição detalhada dos objetivos da fase"
    }
  },
  "tracking_metrics": {
    "performance": [
      {
        "metric": "Nome da métrica",
        "measurement_method": "Como medir",
        "frequency": "Frequência de medição",
        "target_improvement": "Meta de melhoria esperada"
      }
    ],
    "body_composition": {
      "metrics": ["Peso corporal", "Percentual de gordura", "Massa muscular"],
      "measurement_frequency": "Semanal/Quinzenal",
      "tracking_methods": "Métodos específicos de acompanhamento"
    },
    "subjective_wellness": {
      "scales": ["Energia (1-10)", "Humor (1-10)", "Motivação (1-10)"],
      "frequency": "Diária",
      "interpretation": "Como interpretar os resultados"
    }
  },
  "safety_guidelines": [
    "Guideline de segurança 1 específica e detalhada para o perfil",
    "Guideline de segurança 2 com protocolo de ação",
    "Guideline de segurança 3 com sinais de alerta específicos"
  ]
}

CRITÉRIOS OBRIGATÓRIOS:
- Crie um cronograma completo para ${userProfile.available_days || 3} dias por semana
- Cada dia deve ter foco específico (ex: Superiores, Inferiores, Corpo todo)
- Inclua 6-10 exercícios PRINCIPAIS por dia de treino
- Cada exercício deve ter instruções de pelo menos 300 palavras
- Considere as limitações físicas em TODOS os exercícios
- Use terminologia técnica mas sempre explicada
- Base as progressões em evidências científicas atuais
- Inclua pelo menos 4 variações/progressões para cada exercício
- Detalhe completamente a biomecânica de cada movimento
- Forneça protocolos específicos e detalhados de nutrição e recuperação
- Inclua cronograma específico de quando fazer cada coisa

RETORNE APENAS O JSON, sem markdown, sem explicações adicionais.`;

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
        max_tokens: 8000,
        temperature: 0.2,
      }),
    });

    console.log('Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Groq:', response.status, errorText);
      
      console.log('Usando plano de fallback devido ao erro na API');
      const fallbackPlan = createDetailedFallbackPlan(userProfile);
      
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
      const fallbackPlan = createDetailedFallbackPlan(userProfile);
      
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
      
      // Validar estrutura básica
      if (!workoutPlan.title || (!workoutPlan.exercises && !workoutPlan.weekly_schedule)) {
        throw new Error('Estrutura do JSON inválida');
      }
      
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', content);
      
      workoutPlan = createDetailedFallbackPlan(userProfile);
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
    
    const basicPlan = createDetailedFallbackPlan(null);

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

function createDetailedFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'sedentario';
  const goals = userProfile?.fitness_goals?.[0] || 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  const availableDays = userProfile?.available_days || 3;
  
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
  
  // Criar cronograma baseado no número de dias disponíveis
  const scheduleTemplates = {
    3: [
      { day: "Segunda-feira", focus: "Treino de Corpo Inteiro - Força" },
      { day: "Quarta-feira", focus: "Treino Cardiovascular e Core" },
      { day: "Sexta-feira", focus: "Treino de Corpo Inteiro - Resistência" }
    ],
    4: [
      { day: "Segunda-feira", focus: "Treino de Membros Superiores" },
      { day: "Terça-feira", focus: "Treino de Membros Inferiores" },
      { day: "Quinta-feira", focus: "Treino Cardiovascular e Core" },
      { day: "Sexta-feira", focus: "Treino de Corpo Inteiro" }
    ],
    5: [
      { day: "Segunda-feira", focus: "Treino de Peito e Tríceps" },
      { day: "Terça-feira", focus: "Treino de Costas e Bíceps" },
      { day: "Quarta-feira", focus: "Treino de Pernas e Glúteos" },
      { day: "Quinta-feira", focus: "Treino de Ombros e Core" },
      { day: "Sexta-feira", focus: "Treino Cardiovascular e Flexibilidade" }
    ]
  };

  const schedule = scheduleTemplates[availableDays] || scheduleTemplates[3];
  
  return {
    title: `Plano de Treino Científico ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano personalizado baseado em evidências científicas focado em ${goalDesc} para nível ${difficultyLevel}. Este programa foi desenvolvido considerando princípios de periodização, sobrecarga progressiva e especificidade do treinamento. O plano utiliza metodologia de treinamento funcional integrada com princípios biomecânicos para maximizar resultados e minimizar riscos de lesão. Cada exercício foi selecionado considerando seu perfil individual, limitações e objetivos específicos. A periodização foi estruturada em microciclos progressivos, com adaptação de volume e intensidade ao longo das 12 semanas. O programa inclui protocolos detalhados de aquecimento, exercícios principais, resfriamento, nutrição e recuperação, todos baseados nas mais recentes pesquisas em ciência do exercício.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    weekly_structure: {
      days_per_week: availableDays,
      session_duration: `${userProfile?.session_duration || 60} minutos`,
      rest_days: "Utilize dias de descanso para recuperação ativa: caminhadas leves de 20-30 minutos, yoga restaurativa, técnicas de respiração diafragmática, automassagem com rolo, mobilidade articular suave. O descanso é crucial para adaptação muscular, síntese proteica e prevenção de overtraining. Mantenha atividade física leve para promover circulação sanguínea e remoção de metabólitos.",
      progression_schedule: "Semanas 1-2: Foque na técnica perfeita, aumente repetições em 10-15%. Semanas 3-4: Aumente carga em 5-10% quando conseguir completar todas as séries com 2+ repetições de reserva. Semanas 5-8: Progrida volume antes de intensidade, aumente séries em 20%. Semanas 9-12: Intensifique carga em 10-15%, mantenha técnica impecável. Monitore recuperação constantemente."
    },
    weekly_schedule: schedule.map((dayPlan, index) => ({
      day: dayPlan.day,
      focus: dayPlan.focus,
      duration: `${userProfile?.session_duration || 60} minutos`,
      warm_up: {
        duration: "15 minutos",
        activities: [
          {
            name: "Ativação Cardiovascular",
            duration: "5 minutos",
            description: "Elevação gradual da frequência cardíaca e temperatura corporal",
            intensity: "50-60% da frequência cardíaca máxima, percepção de esforço 3-4/10",
            instructions: "Inicie com marcha estacionária por 2 minutos, progredindo para elevação de joelhos alternados por 1 minuto, seguido de polichinelos modificados por 2 minutos. Mantenha respiração controlada e monitore a elevação gradual da temperatura corporal através do início da transpiração leve."
          },
          {
            name: "Mobilidade Articular",
            duration: "5 minutos",
            description: "Mobilização específica das articulações que serão utilizadas no treino",
            instructions: "Execute movimentos circulares amplos: 10 círculos de braços para frente e para trás, 10 rotações de quadril em cada direção, 10 flexões laterais do tronco, 10 rotações de tornozelo. Foque na amplitude máxima sem dor, preparando as articulações para movimentos mais complexos."
          },
          {
            name: "Ativação Neuromuscular",
            duration: "5 minutos",
            description: "Ativação dos músculos estabilizadores e preparação neuromuscular",
            instructions: "Realize ponte glútea (10 repetições com pausa de 3 segundos), prancha modificada (manter por 30 segundos), agachamento parcial (10 repetições lentas). Foque na conexão mente-músculo e ativação do core para estabilização."
          }
        ]
      },
      exercises: index === 0 ? [
        {
          name: "Agachamento Livre com Técnica Biomecânica Avançada",
          category: "Força",
          primary_muscles: ["Quadríceps (Reto Femoral, Vasto Lateral, Vasto Medial, Vasto Intermédio)", "Glúteo Máximo"],
          secondary_muscles: ["Isquiotibiais (Bíceps Femoral, Semitendinoso, Semimembranoso)", "Gastrocnêmio", "Core (Transverso do Abdome, Multífidos)"],
          sets: level === 'sedentario' ? 3 : 4,
          reps: level === 'sedentario' ? "10-12" : "12-15",
          rest: "90-120s",
          tempo: "3-1-2-1 (3s descida excêntrica, 1s pausa isométrica, 2s subida concêntrica, 1s pausa no topo)",
          load: "Peso corporal progredindo para sobrecarga externa. Inicie com domínio técnico completo antes de adicionar carga",
          execution: {
            starting_position: "Posicionamento: pés na largura dos ombros (distância glenoumeral), dedos dos pés voltados 15-30° para fora (rotação externa natural). Coluna vertebral em posição neutra, curvatura lombar natural preservada. Peito aberto com retração escapular leve. Olhar fixo em ponto à frente na altura dos olhos. Core pré-ativado com contração isométrica do transverso do abdome.",
            movement_phase_1: "Fase Excêntrica (Descida): Inicie o movimento com flexão simultânea de quadril e joelhos. Empurre o quadril para trás como se fosse sentar em cadeira imaginária. Mantenha joelhos alinhados com direção dos pés, evitando valgo ou varo. Distribua peso entre calcanhar e meio do pé (tripé plantar). Desça até coxas paralelas ao solo ou máxima amplitude sem compensações.",
            movement_phase_2: "Fase de Transição: Pausa isométrica de 1 segundo no fundo do movimento. Mantenha tensão muscular ativa em quadríceps e glúteos. Verifique alinhamento: joelhos sobre pés, tronco inclinado 45-60°, core contraído.",
            movement_phase_3: "Fase Concêntrica (Subida): Inicie extensão simultânea de quadril e joelhos. Empurre o chão com os pés, ativando glúteos e quadríceps simultaneamente. Mantenha alinhamento corporal durante toda ascensão. Finalize com extensão completa sem hiperextensão lombar.",
            breathing_pattern: "Inspiração profunda no topo antes da descida, segure ar durante descida e pausa, expire forcadamente durante a subida (valsalva modificada)",
            key_cues: ["Joelhos seguem trajetória dos pés", "Quadril inicia o movimento", "Peito alto durante execução", "Core firme como prancha", "Peso nos calcanhares"]
          },
          biomechanics: {
            joint_actions: "Flexão/extensão de quadril (30-50°), flexão/extensão de joelhos (90-100°), dorsiflexão/plantiflexão de tornozelos",
            muscle_activation_sequence: "Glúteo máximo e quadríceps co-ativação, seguido de isquiotibiais para estabilização, core para manutenção postural",
            force_vectors: "Força gravitacional descendente, força reativa do solo ascendente, vetores de cisalhamento mínimos nos joelhos",
            stability_requirements: "Estabilização frontal e sagital do tronco, controle rotacional dos quadris, estabilização dinâmica dos tornozelos"
          },
          progression: {
            week_1_2: "Foco exclusivo na técnica: 3 séries de 8-10 repetições com peso corporal. Velocidade controlada 4-2-3-1. Descanso 60-90s. Priorize amplitude completa sem dor.",
            week_3_4: "Progressão de volume: 3 séries de 12-15 repetições. Introduza pausa de 2s no fundo. Descanso 90s. Adicione variação de largura dos pés.",
            week_5_8: "Introdução de sobrecarga: adicione peso progressivamente (2-5kg por semana). 4 séries de 10-12 repetições. Descanso 90-120s. Mantenha técnica perfeita.",
            week_9_12: "Especialização: 4 séries de 8-10 repetições com carga mais significativa. Introduza variações como agachamento búlgaro ou com salto. Foque em potência.",
            load_progression: "Aumente carga apenas quando conseguir completar todas as séries/repetições com 2-3 reps de reserva e técnica perfeita",
            volume_progression: "Aumente repetições em 10-20% antes de aumentar carga. Aumente séries após dominar volume de repetições"
          },
          safety: {
            contraindications: "Lesões agudas de joelho, quadril ou lombar. Instabilidade articular não tratada. Dor durante execução.",
            common_mistakes: ["Joelhos colapsando em valgo (para dentro)", "Inclinação excessiva do tronco", "Calcanhar saindo do chão", "Flexão excessiva da coluna lombar", "Respiração inadequada"],
            injury_prevention: "Aquecimento adequado obrigatório. Progressão gradual de carga. Parar imediatamente se houver dor articular. Manter alinhamento neutro da coluna.",
            warning_signs: "Dor nos joelhos, desconforto lombar, perda de equilíbrio repetitiva, fadiga técnica excessiva"
          },
          modifications: {
            beginner_version: "Agachamento em cadeira: sente e levante de cadeira sem usar braços. Agachamento parcial (45° flexão joelhos). Apoio em TRX ou barra fixa.",
            advanced_version: "Agachamento búlgaro unilateral, agachamento com salto (pliométrico), agachamento frontal com carga, agachamento sumo",
            equipment_alternatives: "Cadeira para amplitude limitada, TRX para apoio, halteres para sobrecarga, kettlebell para variação de carga",
            limitation_adaptations: "Problemas joelho: amplitude reduzida 60-70°. Problemas tornozelo: calço sob calcanhares. Problemas lombar: amplitude controlada, foco em mobilidade quadril"
          }
        },
        {
          name: "Flexão de Braço Biomecânica Completa",
          category: "Força",
          primary_muscles: ["Peitoral Maior (Porção Clavicular e Esternal)", "Tríceps Braquial (Cabeça Longa, Lateral e Medial)"],
          secondary_muscles: ["Deltóide Anterior", "Core (Reto Abdominal, Transverso)", "Serrátil Anterior", "Estabilizadores Escapulares"],
          sets: level === 'sedentario' ? 2 : 3,
          reps: level === 'sedentario' ? "5-8" : "8-12",
          rest: "90-120s",
          tempo: "2-1-2-1 (2s descida controlada, 1s pausa, 2s subida explosiva, 1s pausa no topo)",
          load: "Peso corporal com progressões de inclinação. Modifique ângulo para ajustar dificuldade",
          execution: {
            starting_position: "Posição de prancha alta: mãos apoiadas no solo na largura dos ombros, dedos espalhados com indicadores paralelos. Corpo perfeitamente alinhado da cabeça aos calcanhares. Core contraído maximamente, glúteos ativados. Escápulas em posição neutra, nem protraídas nem retraídas excessivamente.",
            movement_phase_1: "Fase Excêntrica (Descida): Flexione cotovelos mantendo-os próximos ao corpo (45° máximo de abdução). Controle descida até peito quase tocar o solo (2-3cm distância). Mantenha alinhamento corporal rígido durante toda descida.",
            movement_phase_2: "Fase de Transição: Pausa momentânea (1s) na posição inferior mantendo tensão muscular ativa. Verifique: corpo ainda alinhado, cotovelos controlados, core ativado.",
            movement_phase_3: "Fase Concêntrica (Subida): Empurre o solo explosivamente, estendendo cotovelos completamente. Mantenha trajetória linear do corpo. Finalize com extensão total dos braços sem hiperextensão dos cotovelos.",
            breathing_pattern: "Inspire no topo, segure durante descida, expire forcadamente durante subida (técnica valsalva modificada)",
            key_cues: ["Corpo rígido como prancha", "Cotovelos próximos ao corpo", "Empurre o chão", "Core contraído sempre", "Movimento completo"]
          },
          biomechanics: {
            joint_actions: "Flexão/extensão horizontal do ombro, flexão/extensão do cotovelo, estabilização escapular",
            muscle_activation_sequence: "Peitoral e deltóide anterior iniciam movimento, tríceps completa extensão, core mantém estabilidade",
            force_vectors: "Força gravitacional corporal, resistência do solo, vetores de cisalhamento nos ombros",
            stability_requirements: "Estabilização anti-extensão do tronco, controle rotacional das escápulas, estabilização anti-rotação"
          },
          progression: {
            week_1_2: "Versão inclinada: mãos em superfície 30-60cm elevada. 2-3 séries de 8-10 reps. Foque na técnica perfeita.",
            week_3_4: "Redução gradual da inclinação. 3 séries de 10-12 reps. Aumente tempo de descida para 3 segundos.",
            week_5_8: "Flexão completa no solo. 3 séries de 8-12 reps. Adicione pausa de 2s na posição inferior.",
            week_9_12: "Progressões avançadas: pés elevados, flexão diamante, flexão com aplauso. 3-4 séries.",
            load_progression: "Diminua inclinação gradualmente. Quando dominar 15 reps no solo, progride para variações",
            volume_progression: "Aumente repetições antes de diminuir inclinação. Meta: 15 reps perfeitas antes de progressão"
          },
          safety: {
            contraindications: "Lesões agudas de ombro, cotovelo ou punho. Instabilidade escapular não tratada.",
            common_mistakes: ["Quadril muito alto (posição de V)", "Quadril caído (hiperextensão lombar)", "Cotovelos muito abertos (90°)", "Amplitude incompleta", "Perda do alinhamento corporal"],
            injury_prevention: "Aquecimento específico de ombros e punhos. Progressão respeitosa. Parar se houver dor articular.",
            warning_signs: "Dor no ombro, desconforto no punho, incapacidade de manter alinhamento, compensações posturais"
          },
          modifications: {
            beginner_version: "Flexão na parede (vertical), flexão inclinada 45-60°, flexão com joelhos apoiados",
            advanced_version: "Flexão com pés elevados, flexão diamante, flexão arqueada, flexão com uma mão (progressão)",
            equipment_alternatives: "Superfícies elevadas para inclinação, TRX para assistência, push-up handles para conforto punhos",
            limitation_adaptations: "Problemas punho: use apoios ou punhos fechados. Problemas ombro: amplitude reduzida, inclinação maior"
          }
        }
      ] : [
        {
          name: "Exercício Específico do Dia",
          category: "Força",
          primary_muscles: ["Músculo Principal"],
          secondary_muscles: ["Músculo Secundário"],
          sets: 3,
          reps: "8-12",
          rest: "90s",
          tempo: "2-1-2-1",
          load: "Adequada ao exercício",
          execution: {
            starting_position: "Posição inicial detalhada para o exercício específico",
            movement_phase_1: "Primeira fase do movimento",
            movement_phase_2: "Fase de transição",
            movement_phase_3: "Fase final do movimento",
            breathing_pattern: "Padrão respiratório específico",
            key_cues: ["Dica 1", "Dica 2", "Dica 3"]
          },
          biomechanics: {
            joint_actions: "Ações articulares específicas",
            muscle_activation_sequence: "Sequência de ativação muscular",
            force_vectors: "Direção das forças aplicadas",
            stability_requirements: "Requisitos de estabilidade"
          },
          progression: {
            week_1_2: "Protocolo semanas 1-2",
            week_3_4: "Protocolo semanas 3-4",
            week_5_8: "Protocolo semanas 5-8",
            week_9_12: "Protocolo semanas 9-12",
            load_progression: "Como progredir carga",
            volume_progression: "Como progredir volume"
          },
          safety: {
            contraindications: "Quando não fazer",
            common_mistakes: ["Erro 1", "Erro 2"],
            injury_prevention: "Como prevenir lesões",
            warning_signs: "Sinais de alerta"
          },
          modifications: {
            beginner_version: "Versão iniciante",
            advanced_version: "Versão avançada",
            equipment_alternatives: "Alternativas de equipamento",
            limitation_adaptations: "Adaptações para limitações"
          }
        }
      ],
      cool_down: {
        duration: "15 minutos",
        activities: [
          {
            name: "Redução da Frequência Cardíaca",
            duration: "5 minutos",
            description: "Transição gradual do estado de exercício para repouso",
            target_hr: "Redução para 60-70% da FC máxima (FC repouso + 20-30 bpm)"
          },
          {
            name: "Alongamento Estático",
            duration: "10 minutos",
            stretches: [
              {
                muscle_group: "Quadríceps",
                stretch_name: "Alongamento em pé unilateral",
                duration: "45-60 segundos cada perna",
                instructions: "Em pé, flexione joelho levando calcanhar em direção ao glúteo. Mantenha quadris alinhados e evite hiperextensão lombar. Segure tornozelo suavemente. Sinta alongamento na parte anterior da coxa.",
                breathing: "Respiração lenta e profunda: inspire por 4s, expire por 6s. Relaxe músculo na expiração"
              },
              {
                muscle_group: "Isquiotibiais",
                stretch_name: "Alongamento sentado unilateral",
                duration: "45-60 segundos cada perna",
                instructions: "Sentado, estenda uma perna à frente. Flexione tronco mantendo coluna reta, não curvando lombar. Incline a partir do quadril. Sinta alongamento posterior da coxa.",
                breathing: "Inspiração para preparar posição, expiração longa para aprofundar alongamento gradualmente"
              }
            ]
          }
        ]
      }
    })),
    exercises: [
      {
        name: "Agachamento Livre Biomecânico",
        sets: level === 'sedentario' ? 3 : 4,
        reps: level === 'sedentario' ? "10-12" : "12-15",
        rest: "90-120s",
        instructions: "Exercício fundamental para desenvolvimento de força nos membros inferiores com ênfase biomecânica completa"
      },
      {
        name: "Flexão de Braço Progressiva",
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "5-8" : "8-12",
        rest: "90-120s",
        instructions: "Desenvolvimento de força nos membros superiores com progressão técnica sistematizada"
      }
    ],
    nutrition_protocol: {
      pre_workout: {
        timing: "60-90 minutos antes do treino",
        meals: [
          {
            option: "Refeição Completa",
            foods: ["Aveia integral (40g)", "Banana média (1 unidade)", "Mel (1 colher sopa)", "Castanha do Pará (3 unidades)"],
            macros: "Carboidratos: 45-50g, Proteínas: 8-12g, Gorduras: 8-10g, Calorias: ~280-320",
            timing_rationale: "Carboidratos de absorção moderada para energia sustentada, proteínas para preservação muscular durante exercício"
          },
          {
            option: "Lanche Rápido",
            foods: ["Torrada integral (2 fatias)", "Pasta de amendoim natural (1 colher sopa)", "Água de coco (200ml)"],
            macros: "Carboidratos: 35-40g, Proteínas: 10-12g, Gorduras: 8-10g, Calorias: ~250-280",
            timing_rationale: "Opção para quem treina mais cedo, combinação de energia rápida e sustentada"
          }
        ],
        hydration: "500-750ml de água 2 horas antes, 250ml 30 minutos antes. Monitor cor da urina (amarelo claro ideal)",
        supplements: "Opcional: Cafeína 100-200mg (1-2h antes) para melhora performance. Creatina 3-5g (timing flexível)"
      },
      during_workout: {
        hydration: "150-250ml a cada 15-20 minutos durante exercício. Água suficiente para treinos <60min",
        electrolytes: "Para treinos >60min ou clima quente: bebida isotônica com 6-8% carboidratos",
        energy: "Treinos >90min: 15-30g carboidratos/hora (banana, tâmaras, gel energético)"
      },
      post_workout: {
        timing: "Idealmente até 45 minutos após treino (janela anabólica otimizada)",
        meals: [
          {
            option: "Shake Proteico",
            foods: ["Whey protein (25-30g)", "Banana grande (1 unidade)", "Leite desnatado (250ml)", "Aveia em flocos (20g)"],
            macros: "Proteínas: 35-40g, Carboidratos: 40-45g, Gorduras: 3-5g, Calorias: ~320-360",
            timing_rationale: "Proteína de rápida absorção + carboidratos para reposição glicogênica e síntese proteica"
          },
          {
            option: "Refeição Sólida",
            foods: ["Peito de frango grelhado (100g)", "Batata doce cozida (150g)", "Brócolis refogado (100g)", "Azeite extra virgem (1 colher sopa)"],
            macros: "Proteínas: 30-35g, Carboidratos: 35-40g, Gorduras: 12-15g, Calorias: ~350-400",
            timing_rationale: "Refeição completa balanceada para recuperação completa e saciedade prolongada"
          }
        ],
        supplements: "Whey protein (se refeição insuficiente), Creatina 3-5g, Glutamina 5-10g (opcional para recuperação)"
      },
      daily_nutrition: {
        total_calories: `${Math.round((userProfile?.weight || 70) * (goals.includes('perder') ? 25 : goals.includes('ganhar') ? 35 : 30))} kcal/dia aproximadamente`,
        macros_distribution: "Proteínas: 1.6-2.2g/kg peso corporal, Carboidratos: 3-7g/kg (ajustar por objetivo), Gorduras: 0.8-1.2g/kg",
        meal_timing: "5-6 refeições/dia espaçadas 3-4h. Café manhã rico em proteínas. Jantar leve 2-3h antes dormir",
        hydration_daily: `${Math.round((userProfile?.weight || 70) * 35)}ml água/dia (35ml por kg peso corporal)`
      }
    },
    recovery_protocols: {
      sleep: {
        duration: "7-9 horas por noite (8h ideal para recuperação ótima)",
        quality_tips: [
          "Manter horários consistentes de dormir/acordar mesmo nos fins de semana",
          "Quarto escuro (blackout), silencioso e fresco (18-21°C temperatura ideal)",
          "Evitar telas 1-2h antes dormir (luz azul suprime melatonina)",
          "Rotina relaxante: leitura, meditação, banho morno"
        ],
        sleep_hygiene: "Cama apenas para dormir. Evitar cafeína 6h antes. Exposição luz natural manhã. Cochilo máximo 20min antes 15h"
      },
      active_recovery: {
        activities: [
          "Caminhada leve 20-30min (zona aeróbica 1: conversação confortável)",
          "Yoga restaurativa ou Hatha Yoga 30-45min",
          "Natação recreativa ritmo muito leve",
          "Mobilidade articular e alongamento estático 15-20min"
        ],
        duration: "30-60 minutos dependendo atividade",
        intensity: "Baixíssima: 50-65% FC máxima, percepção esforço 2-4/10"
      },
      stress_management: {
        techniques: [
          "Meditação mindfulness 10-20min diários (apps: Headspace, Calm)",
          "Respiração diafragmática: 4-7-8 (inspire 4s, segure 7s, expire 8s)",
          "Journaling: 5-10min escrevendo pensamentos/gratidão",
          "Hobbies prazerosos não relacionados fitness"
        ],
        implementation: "Escolher 1-2 técnicas favoritas. Praticar consistentemente no mesmo horário. Começar 5min/dia e progredir"
      },
      monitoring: {
        biomarkers: [
          "Frequência cardíaca repouso (medir ao acordar, <5 bpm variação normal)",
          "Variabilidade FC (apps: HRV4Training, Elite HRV)",
          "Qualidade sono (duração, eficiência, despertar noturno)",
          "Peso corporal (mesma hora, mesmas condições, 3x/semana)"
        ],
        subjective_scales: "Energia (1-10), Humor (1-10), Motivação treinar (1-10), Dor muscular (1-10), Qualidade sono (1-10). Registrar diariamente"
      }
    },
    periodization: {
      mesocycle_1: {
        weeks: "1-4",
        focus: "Adaptação Anatômica e Aprendizado Motor",
        volume: "Alto volume, baixa intensidade: 3-4 séries, 12-15 reps, 60-70% esforço percebido",
        intensity: "Baixa-Moderada: foco técnica perfeita, 2-4 reps reserva sempre",
        characteristics: "Estabelecimento padrões movimento. Fortalecimento tendões/ligamentos. Melhora coordenação neuromuscular. Base aeróbica. Adaptação sistema cardiovascular ao exercício."
      },
      mesocycle_2: {
        weeks: "5-8",
        focus: "Desenvolvimento Força e Resistência Muscular",
        volume: "Moderado-Alto: 3-4 séries, 8-12 reps, carga progressiva",
        intensity: "Moderada: 70-80% esforço, 1-3 reps reserva, introdução sobrecarga",
        characteristics: "Hipertrofia miofibrilar. Aumento força relativa. Melhora capacidade trabalho. Progressão cargas/volumes. Especialização movimentos."
      },
      mesocycle_3: {
        weeks: "9-12",
        focus: "Especialização e Consolidação Adaptações",
        volume: "Moderado: qualidade sobre quantidade",
        intensity: "Moderada-Alta: 75-85% esforço, refinamento técnico",
        characteristics: "Pico adaptações neuromusculares. Refinamento técnico avançado. Preparação manutenção resultados. Introdução variações exercícios específicos."
      }
    },
    tracking_metrics: {
      performance: [
        {
          metric: "Repetições Máximas por Exercício",
          measurement_method: "Teste semanal: máx reps técnica perfeita até fadiga técnica",
          frequency: "Semanal (mesmo dia semana, mesmas condições)",
          target_improvement: "10-20% aumento repetições por mês nas primeiras 8 semanas"
        },
        {
          metric: "Tempo Execução Série Completa",
          measurement_method: "Cronometrar tempo para completar série completa mantendo técnica",
          frequency: "Bi-semanal durante treinos principais",
          target_improvement: "Melhora 5-10% eficiência tempo vs qualidade técnica"
        },
        {
          metric: "Percepção Subjetiva Esforço (PSE) Escala 1-10",
          measurement_method: "Avaliar esforço 5min pós cada exercício principal",
          frequency: "Cada treino, registrar PSE por exercício",
          target_improvement: "Mesma PSE com maior carga/volume ao longo semanas"
        }
      ],
      body_composition: {
        metrics: ["Peso corporal", "Circunferências (cintura, quadril, braço, coxa)", "Fotos progresso (frente, perfil, costas)"],
        measurement_frequency: "Peso: 3x/semana. Circunferências: quinzenal. Fotos: mensal",
        tracking_methods: "Balança mesma hora. Fita métrica pontos anatômicos padronizados. Fotos mesma iluminação/posição"
      },
      subjective_wellness: {
        scales: [
          "Energia Geral (1=exausto, 10=muito energético)",
          "Humor (1=muito irritado, 10=muito positivo)",
          "Motivação Treinar (1=zero vontade, 10=muito animado)",
          "Dor Muscular Geral (1=sem dor, 10=dor intensa)",
          "Qualidade Sono (1=péssima, 10=excelente)"
        ],
        frequency: "Diária (manhã, mesmo horário)",
        interpretation: "Média 7+ = ótimo. 5-6 = atenção. <5 = ajustar treino/recuperação. Tendências mais importantes que valores isolados"
      }
    },
    safety_guidelines: [
      "Pare qualquer exercício imediatamente se sentir dor articular aguda, desconforto cardiovascular anormal (tontura, náusea, dor peito) ou perda controle motor. Dor muscular normal vs dor articular/ligamentar deve ser diferenciada claramente.",
      "Mantenha hidratação otimizada: monitore cor urina (amarelo claro ideal), beba água antes sensação sede, aumente ingestão dias quentes/treinos intensos. Desidratação >2% peso corporal prejudica performance significativamente.",
      "Respeite religiosamente dias descanso programados: adaptações ocorrem durante recuperação, não durante treino. Overtraining manifesta-se como: FC repouso elevada persistente, humor deprimido, queda performance, sono prejudicado, maior susceptibilidade infecções.",
      "Progressão conservadora obrigatória: aumentos >10% carga/volume semanal aumentam drasticamente risco lesões. Regra 10%: nunca aumente mais que 10% distância, tempo, peso ou repetições por semana. Corpo adapta gradualmente.",
      "Consulta médica obrigatória antes início se: >45 anos sedentário, histórico cardiovascular, diabetes, hipertensão não controlada, lesões prévias não reabilitadas, medicamentos que afetem resposta exercício, qualquer condição médica crônica."
    ]
  };
}

function createFallbackPlan(userProfile: any) {
  return createDetailedFallbackPlan(userProfile);
}
