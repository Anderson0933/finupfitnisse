
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
    const prompt = `Você é um personal trainer PhD em Fisiologia do Exercício com 20 anos de experiência. Crie um plano de treino EXTREMAMENTE DETALHADO e profissional em português.

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

1. ANÁLISE BIOMECÂNICA: Para cada exercício, inclua anatomia detalhada, músculos primários e sinergistas
2. PROGRESSÃO CIENTÍFICA: Base as progressões em princípios de sobrecarga progressiva
3. PERIODIZAÇÃO: Inclua microciclos e mesociclos estruturados
4. SEGURANÇA: Considerações específicas para limitações mencionadas
5. INDIVIDUALIZAÇÃO: Adapte intensidade, volume e densidade ao perfil

RETORNE APENAS um JSON válido no seguinte formato EXPANDIDO:

{
  "title": "Plano de Treino Científico Personalizado - [OBJETIVO PRINCIPAL]",
  "description": "Descrição detalhada de 150-200 palavras explicando a metodologia, princípios aplicados e resultados esperados",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "weekly_structure": {
    "days_per_week": ${userProfile.available_days || 3},
    "session_duration": "${userProfile.session_duration || 60} minutos",
    "rest_days": "Descrição de como usar os dias de descanso",
    "progression_schedule": "Como progredir semanalmente"
  },
  "warm_up": {
    "duration": "10-15 minutos",
    "phases": [
      {
        "name": "Ativação Cardiovascular",
        "duration": "5 minutos",
        "exercises": ["Exercício específico 1", "Exercício específico 2"],
        "intensity": "Descrição da intensidade",
        "instructions": "Instruções detalhadas de execução"
      },
      {
        "name": "Mobilidade Articular",
        "duration": "5 minutos", 
        "exercises": ["Mobilização específica 1", "Mobilização específica 2"],
        "instructions": "Como executar cada mobilização"
      },
      {
        "name": "Ativação Neuromuscular",
        "duration": "5 minutos",
        "exercises": ["Ativação específica 1", "Ativação específica 2"],
        "instructions": "Técnicas de ativação pré-treino"
      }
    ]
  },
  "exercises": [
    {
      "name": "Nome Completo do Exercício",
      "category": "Força|Cardio|Flexibilidade|Funcional",
      "primary_muscles": ["Músculo principal 1", "Músculo principal 2"],
      "secondary_muscles": ["Músculo secundário 1", "Músculo secundário 2"],
      "sets": 3,
      "reps": "8-12",
      "rest": "90-120s",
      "tempo": "3-1-2-1 (excêntrica-pausa-concêntrica-pausa)",
      "load": "70-80% 1RM ou peso que permita completar as repetições com 2-3 reps de reserva",
      "biomechanics": {
        "starting_position": "Descrição anatômica detalhada da posição inicial",
        "movement_execution": "Descrição passo-a-passo da execução com pontos anatômicos",
        "breathing_pattern": "Quando inspirar e expirar durante o movimento",
        "key_cues": ["Dica técnica 1", "Dica técnica 2", "Dica técnica 3"]
      },
      "progression": {
        "beginner": "Como executar para iniciantes",
        "intermediate": "Progressão para intermediários", 
        "advanced": "Variação avançada",
        "weekly_progression": "Como aumentar carga/volume semanalmente"
      },
      "safety": {
        "common_mistakes": ["Erro comum 1", "Erro comum 2"],
        "injury_prevention": "Cuidados específicos para evitar lesões",
        "contraindications": "Quando NÃO fazer este exercício"
      },
      "modifications": {
        "easier_version": "Versão mais fácil do exercício",
        "equipment_alternatives": "Alternativas com outros equipamentos",
        "limitation_adaptations": "Adaptações para limitações específicas"
      }
    }
  ],
  "cool_down": {
    "duration": "10-15 minutos",
    "phases": [
      {
        "name": "Redução Gradual da FC",
        "duration": "5 minutos",
        "activities": ["Caminhada leve", "Respiração controlada"],
        "target_hr": "60-70% da FC máxima"
      },
      {
        "name": "Alongamento Estático",
        "duration": "10 minutos",
        "stretches": [
          {
            "muscle_group": "Grupo muscular",
            "stretch_name": "Nome do alongamento",
            "duration": "30-60 segundos",
            "instructions": "Como executar o alongamento",
            "breathing": "Padrão respiratório durante o alongamento"
          }
        ]
      }
    ]
  },
  "periodization": {
    "phase_1": {
      "weeks": "1-4",
      "focus": "Adaptação Anatômica",
      "volume": "Alto",
      "intensity": "Baixa-Moderada", 
      "characteristics": "Descrição da primeira fase"
    },
    "phase_2": {
      "weeks": "5-8", 
      "focus": "Desenvolvimento de Força",
      "volume": "Moderado",
      "intensity": "Moderada-Alta",
      "characteristics": "Descrição da segunda fase"
    },
    "phase_3": {
      "weeks": "9-12",
      "focus": "Especialização",
      "volume": "Moderado-Baixo",
      "intensity": "Alta",
      "characteristics": "Descrição da fase final"
    }
  },
  "nutrition_protocol": {
    "pre_workout": {
      "timing": "30-60 minutos antes",
      "foods": ["Alimento específico 1", "Alimento específico 2"],
      "macros": "Proporção de carboidratos, proteínas e gorduras",
      "hydration": "Protocolo de hidratação pré-treino"
    },
    "post_workout": {
      "timing": "Até 30 minutos após",
      "foods": ["Alimento específico 1", "Alimento específico 2"],
      "macros": "Proporção ideal para recuperação",
      "supplements": "Suplementos recomendados (se aplicável)"
    },
    "daily_guidelines": [
      "Diretriz nutricional diária 1",
      "Diretriz nutricional diária 2",
      "Diretriz nutricional diária 3"
    ]
  },
  "recovery_protocols": {
    "sleep": "7-9 horas por noite com dicas de higiene do sono",
    "active_recovery": "Atividades para dias de descanso",
    "stress_management": "Técnicas de gerenciamento de estresse",
    "monitoring": "Como monitorar sinais de overtraining"
  },
  "tracking_metrics": {
    "performance": ["Métrica 1", "Métrica 2", "Métrica 3"],
    "body_composition": "Como acompanhar mudanças corporais",
    "subjective": "Escalas subjetivas para monitoramento"
  },
  "safety_guidelines": [
    "Guideline de segurança 1 específica para o perfil",
    "Guideline de segurança 2 específica para o perfil", 
    "Guideline de segurança 3 específica para o perfil"
  ]
}

CRITÉRIOS OBRIGATÓRIOS:
- Inclua 8-12 exercícios PRINCIPAIS
- Cada exercício deve ter instruções de pelo menos 200 palavras
- Considere as limitações físicas em TODOS os exercícios
- Use terminologia técnica mas explicada
- Base as progressões em evidências científicas
- Inclua pelo menos 3 variações para cada exercício
- Detalhe a biomecânica de cada movimento
- Forneça protocolos específicos de nutrição e recuperação

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
        max_tokens: 4000,
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
      if (!workoutPlan.title || !workoutPlan.exercises || !Array.isArray(workoutPlan.exercises)) {
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
    title: `Plano de Treino Científico ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano personalizado baseado em evidências científicas focado em ${goalDesc} para nível ${difficultyLevel}. Este programa foi desenvolvido considerando princípios de periodização, sobrecarga progressiva e especificidade do treinamento. O plano utiliza metodologia de treinamento funcional integrada com princípios biomecânicos para maximizar resultados e minimizar riscos de lesão. Cada exercício foi selecionado considerando seu perfil individual, limitações e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    weekly_structure: {
      days_per_week: userProfile?.available_days || 3,
      session_duration: `${userProfile?.session_duration || 60} minutos`,
      rest_days: "Utilize dias de descanso para recuperação ativa: caminhadas leves, yoga, ou mobilidade. O descanso é crucial para adaptação muscular e prevenção de overtraining.",
      progression_schedule: "Aumente carga 5-10% quando conseguir completar todas as séries com 2+ repetições de reserva. Progresse volume antes de intensidade."
    },
    warm_up: {
      duration: "15 minutos",
      phases: [
        {
          name: "Ativação Cardiovascular",
          duration: "5 minutos",
          exercises: ["Marcha estacionária", "Elevação de joelhos", "Polichinelos modificados"],
          intensity: "50-60% da frequência cardíaca máxima, percepção de esforço 3-4/10",
          instructions: "Inicie com movimentos lentos e gradualmente aumente a velocidade. Foque na coordenação e na elevação progressiva da temperatura corporal."
        },
        {
          name: "Mobilidade Articular",
          duration: "5 minutos",
          exercises: ["Círculos de braços", "Rotação de quadril", "Flexão lateral do tronco"],
          instructions: "Execute movimentos amplos e controlados em todas as direções. Não force além do conforto, busque amplitude gradual."
        },
        {
          name: "Ativação Neuromuscular",
          duration: "5 minutos",
          exercises: ["Ponte glútea", "Prancha modificada", "Agachamento parcial"],
          instructions: "Foque na ativação dos músculos estabilizadores e na conexão mente-músculo. Execute com controle total do movimento."
        }
      ]
    },
    exercises: [
      {
        name: "Agachamento Livre (Bodyweight Squat)",
        category: "Força",
        primary_muscles: ["Quadríceps", "Glúteo Máximo"],
        secondary_muscles: ["Isquiotibiais", "Panturrilhas", "Core"],
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "8-12" : "12-15",
        rest: "60-90s",
        tempo: "3-1-2-1 (descida lenta, pausa, subida controlada, pausa no topo)",
        load: "Peso corporal, progredindo para sobrecarga externa conforme técnica aprimora",
        biomechanics: {
          starting_position: "Pés na largura dos ombros, dedos ligeiramente voltados para fora (15-30°). Coluna neutra, peito aberto, olhar para frente. Braços estendidos à frente para equilíbrio.",
          movement_execution: "Inicie o movimento empurrando o quadril para trás, flexionando joelhos e quadris simultaneamente. Desça até coxas paralelas ao solo ou máxima amplitude confortável. Mantenha joelhos alinhados com os pés, peso distribuído entre calcanhar e meio do pé. Retorne empurrando o chão com os pés, extensão simultânea de quadril e joelhos.",
          breathing_pattern: "Inspire na descida (fase excêntrica), segure brevemente no fundo, expire na subida (fase concêntrica)",
          key_cues: ["Joelhos seguem direção dos pés", "Peito aberto durante todo movimento", "Peso nos calcanhares", "Core contraído"]
        },
        progression: {
          beginner: "Agachamento em cadeira: sente e levante de uma cadeira sem usar as mãos",
          intermediate: "Agachamento completo com pausa de 2 segundos no fundo do movimento",
          advanced: "Agachamento búlgaro ou agachamento com salto",
          weekly_progression: "Semana 1-2: Foque na técnica. Semana 3-4: Aumente repetições. Semana 5+: Adicione complexidade ou carga"
        },
        safety: {
          common_mistakes: ["Joelhos colapsando para dentro", "Inclinação excessiva do tronco", "Calcanhar saindo do chão"],
          injury_prevention: "Mantenha sempre alinhamento neutro da coluna. Pare se sentir dor nos joelhos ou lombar.",
          contraindications: "Evite se tiver lesão aguda no joelho ou quadril. Consulte profissional se houver histórico de lesões."
        },
        modifications: {
          easier_version: "Agachamento parcial ou com apoio em TRX/elástico",
          equipment_alternatives: "Use cadeira para apoio ou halteres para sobrecarga",
          limitation_adaptations: "Para problemas de joelho: amplitude reduzida. Para problemas de tornozelo: use cunha sob calcanhares"
        }
      },
      {
        name: "Flexão de Braço (Push-up)",
        category: "Força",
        primary_muscles: ["Peitoral Maior", "Tríceps Braquial"],
        secondary_muscles: ["Deltóide Anterior", "Core", "Serrátil Anterior"],
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "5-10" : "8-15",
        rest: "60-90s",
        tempo: "2-1-2-1 (descida controlada, pausa, subida explosiva, pausa no topo)",
        load: "Peso corporal com progressões de inclinação e apoio",
        biomechanics: {
          starting_position: "Posição de prancha: mãos apoiadas no solo, largura dos ombros, dedos espalhados. Corpo alinhado da cabeça aos pés, core contraído, glúteos ativados.",
          movement_execution: "Flexione cotovelos a aproximadamente 45° do corpo, descendo até peito quase tocar o solo. Mantenha alinhamento corporal. Empurre o solo para retornar à posição inicial, extensão completa dos braços.",
          breathing_pattern: "Inspire na descida, expire no esforço de subida",
          key_cues: ["Corpo rígido como prancha", "Cotovelos próximos ao corpo", "Core sempre contraído", "Movimento completo"]
        },
        progression: {
          beginner: "Flexão na parede ou com joelhos apoiados no solo",
          intermediate: "Flexão completa no solo com técnica perfeita",
          advanced: "Flexão com pés elevados ou com aplauso",
          weekly_progression: "Inicie com versão que permite 8 repetições com boa técnica, progride quando conseguir 15 repetições"
        },
        safety: {
          common_mistakes: ["Quadril muito alto ou baixo", "Cotovelos muito abertos", "Amplitude incompleta"],
          injury_prevention: "Pare se sentir dor nos ombros ou punhos. Mantenha punhos neutros.",
          contraindications: "Evite com lesões agudas de ombro, cotovelo ou punho"
        },
        modifications: {
          easier_version: "Flexão inclinada (mãos em superfície elevada)",
          equipment_alternatives: "Use TRX, elásticos ou halteres para variações",
          limitation_adaptations: "Para problemas de punho: use apoios ou punhos fechados"
        }
      }
    ],
    cool_down: {
      duration: "15 minutos",
      phases: [
        {
          name: "Redução Gradual da FC",
          duration: "5 minutos",
          activities: ["Caminhada lenta", "Respiração diafragmática"],
          target_hr: "Retorno gradual à frequência cardíaca de repouso + 20-30 bpm"
        },
        {
          name: "Alongamento Estático",
          duration: "10 minutos",
          stretches: [
            {
              muscle_group: "Quadríceps",
              stretch_name: "Alongamento em pé",
              duration: "30-45 segundos cada perna",
              instructions: "Flexione joelho, aproxime calcanhar ao glúteo, mantenha quadris alinhados",
              breathing: "Respiração lenta e profunda, relaxe na expiração"
            },
            {
              muscle_group: "Isquiotibiais",
              stretch_name: "Alongamento sentado",
              duration: "30-45 segundos cada perna",
              instructions: "Sentado, estenda uma perna, flexione tronco mantendo coluna reta",
              breathing: "Inspire para preparar, expire ao inclinar"
            }
          ]
        }
      ]
    },
    periodization: {
      phase_1: {
        weeks: "1-4",
        focus: "Adaptação Anatômica e Aprendizado Motor",
        volume: "Alto (séries e repetições)",
        intensity: "Baixa (peso corporal, técnica)",
        characteristics: "Estabelecimento de padrões de movimento, fortalecimento de tecidos conectivos, melhora da coordenação neuromuscular"
      },
      phase_2: {
        weeks: "5-8",
        focus: "Desenvolvimento de Força e Resistência",
        volume: "Moderado-Alto",
        intensity: "Moderada (progressões, maior complexidade)",
        characteristics: "Introdução de sobrecargas progressivas, aumento da complexidade dos exercícios, desenvolvimento da capacidade de trabalho"
      },
      phase_3: {
        weeks: "9-12",
        focus: "Especialização e Performance",
        volume: "Moderado",
        intensity: "Moderada-Alta",
        characteristics: "Refinamento técnico, exercícios específicos para objetivos, pico de performance"
      }
    },
    nutrition_protocol: {
      pre_workout: {
        timing: "30-60 minutos antes do treino",
        foods: ["Banana com aveia", "Torrada integral com mel", "Água de coco"],
        macros: "Priorize carboidratos de rápida absorção (20-30g), baixo teor de gordura e fibras",
        hydration: "500ml de água 2 horas antes, 250ml 30 minutos antes"
      },
      post_workout: {
        timing: "Até 30 minutos após o treino (janela anabólica)",
        foods: ["Whey protein com banana", "Ovo mexido com pão integral", "Iogurte grego com frutas"],
        macros: "Proteína de alto valor biológico (20-25g) + carboidratos para reposição (30-40g)",
        supplements: "Whey protein, creatina (3-5g), BCAA se necessário"
      },
      daily_guidelines: [
        "Consuma 1.6-2.2g de proteína por kg de peso corporal diariamente",
        "Mantenha hidratação adequada: 35ml por kg de peso corporal",
        "Inclua carboidratos complexos nas refeições principais",
        "Consuma gorduras boas: abacate, nuts, azeite (20-30% das calorias totais)"
      ]
    },
    recovery_protocols: {
      sleep: "7-9 horas por noite. Evite telas 1 hora antes de dormir, mantenha quarto escuro e fresco (18-21°C)",
      active_recovery: "Caminhadas leves, yoga, natação recreativa, mobilidade articular",
      stress_management: "Meditação, respiração diafragmática, atividades prazerosas",
      monitoring: "Observe: qualidade do sono, humor, motivação, performance nos treinos"
    },
    tracking_metrics: {
      performance: ["Número de repetições realizadas", "Tempo de execução", "Percepção subjetiva de esforço (PSE)"],
      body_composition: "Medidas corporais semanais, fotos de progresso, peso corporal",
      subjective: "Escala de humor (1-10), qualidade do sono (1-10), motivação para treinar (1-10)"
    },
    safety_guidelines: [
      "Pare imediatamente se sentir dor aguda ou desconforto anormal durante qualquer exercício",
      "Mantenha sempre hidratação adequada antes, durante e após os treinos",
      "Respeite os dias de descanso - a recuperação é quando ocorrem as adaptações",
      "Progrida gradualmente - aumentos súbitos de volume ou intensidade podem levar a lesões",
      "Consulte um profissional de saúde antes de iniciar se tiver condições médicas pré-existentes"
    ]
  };
}

function createFallbackPlan(userProfile: any) {
  return createDetailedFallbackPlan(userProfile);
}
