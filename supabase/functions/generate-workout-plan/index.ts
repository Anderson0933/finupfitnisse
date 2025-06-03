
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
      'hipertrofia': 'ganhar massa muscular (hipertrofia)',
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

    // Criar prompt MUITO mais detalhado e específico
    const prompt = `Você é um personal trainer EXPERT certificado pela ACSM com 20+ anos de experiência em prescrição de exercícios. Crie um plano de treino EXTREMAMENTE DETALHADO e científico baseado no perfil:

PERFIL COMPLETO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- Nível: ${userProfile.fitness_level || 'Iniciante'}
- Objetivo Principal: ${goals}
- Frequência: ${userProfile.available_days || 3} dias/semana
- Duração/sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos: ${equipment}
- Limitações: ${limitations}

INSTRUÇÕES OBRIGATÓRIAS:
1. Crie exercícios ESPECÍFICOS para o equipamento disponível
2. Adapte TODAS as orientações para o nível de condicionamento
3. Inclua técnicas de execução DETALHADAS com pontos anatômicos
4. Forneça orientações de respiração para cada exercício
5. Explique o PORQUÊ de cada exercício para o objetivo
6. Inclua progressões semanais ESPECÍFICAS
7. Adicione dicas de segurança e prevenção de lesões

Retorne APENAS um JSON válido no formato EXATO:

{
  "title": "Plano de Treino [Nível] - [Objetivo Principal]",
  "description": "Descrição científica do plano explicando metodologia, periodização e resultados esperados (4-5 linhas detalhadas)",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 8,
  "weekly_structure": {
    "training_days": ${userProfile.available_days || 3},
    "rest_days": ${7 - (userProfile.available_days || 3)},
    "weekly_progression": "Progressão específica semana a semana com percentuais de carga e volume"
  },
  "warm_up": {
    "duration": "10-12 minutos",
    "exercises": [
      {
        "name": "Exercício de aquecimento específico",
        "duration": "2-3 minutos",
        "instructions": "Instruções biomecânicas detalhadas, músculos envolvidos, respiração"
      }
    ]
  },
  "exercises": [
    {
      "name": "Nome técnico completo do exercício",
      "category": "peito|costas|pernas|ombros|bracos|core|cardio",
      "sets": 3,
      "reps": "8-12",
      "rest": "60-90s",
      "weight_guidance": "Orientação ESPECÍFICA de carga (% RM, RPE, ou referência concreta)",
      "execution_tempo": "3-1-2-1 (excêntrica-pausa-concêntrica-pausa)",
      "instructions": "Instruções EXTREMAMENTE detalhadas: posição inicial, movimento completo, pontos anatômicos, respiração, ativação muscular consciente",
      "breathing_pattern": "Padrão respiratório específico para o exercício",
      "common_mistakes": "3-4 erros principais com explicação do porquê evitar",
      "safety_tips": "Dicas específicas de segurança e sinais de alerta",
      "modifications": {
        "easier": "Versão adaptada com explicação biomecânica",
        "harder": "Progressão avançada com técnicas específicas"
      },
      "muscle_focus": "Músculos primários, secundários e estabilizadores",
      "why_this_exercise": "Justificativa científica de por que este exercício para o objetivo"
    }
  ],
  "workout_splits": {
    "day_1": {
      "focus": "Grupo muscular ou tipo de treino",
      "exercises": ["Lista de exercícios específicos para este dia"]
    },
    "day_2": {
      "focus": "Grupo muscular ou tipo de treino", 
      "exercises": ["Lista de exercícios específicos para este dia"]
    }
  },
  "cool_down": {
    "duration": "10-15 minutos",
    "exercises": [
      {
        "name": "Alongamento/relaxamento específico",
        "duration": "45-60 segundos",
        "instructions": "Técnica de alongamento, respiração, músculos alvo"
      }
    ]
  },
  "progression_guidelines": [
    "Semana 1-2: Orientações específicas com cargas e volumes",
    "Semana 3-4: Progressão detalhada",
    "Semana 5-6: Intensificação com métodos específicos",
    "Semana 7-8: Pico de treinamento ou transição"
  ],
  "nutrition_timing": [
    "Pré-treino (30-60min antes): Alimentos específicos e quantidades",
    "Durante treino: Hidratação e suplementação se necessário",
    "Pós-treino (até 2h): Janela anabólica com alimentos específicos",
    "Distribuição diária de macronutrientes para o objetivo"
  ],
  "recovery_protocols": [
    "Tempo de descanso específico entre grupos musculares",
    "Técnicas de recuperação ativa nos dias off",
    "Sinais de overreaching e quando descansar",
    "Qualidade do sono e sua importância para o objetivo"
  ],
  "performance_tracking": [
    "Métricas específicas para acompanhar (força, volume, medidas)",
    "Como registrar progressos semanalmente",
    "Sinais de que está funcionando",
    "Quando e como ajustar o plano"
  ],
  "safety_protocols": [
    "Aquecimento obrigatório específico para limitações",
    "Sinais de PARE IMEDIATAMENTE",
    "Adaptações para as limitações mencionadas",
    "Quando procurar orientação médica"
  ]
}

REGRAS CRÍTICAS:
- 8-12 exercícios principais variados e específicos
- Cada instrução deve ter mínimo 3-4 linhas TÉCNICAS
- Considere SEMPRE as limitações físicas mencionadas
- Use terminologia técnica mas acessível
- Crie divisão de treino lógica (se mais de 3 dias)
- Adapte intensidade ao nível real do praticante
- O campo difficulty_level deve ser EXATAMENTE: "iniciante", "intermediario" ou "avancado"
- NUNCA use exercícios genéricos ou instruções vagas
- Personalize TUDO para o perfil específico fornecido`;

    console.log('Enviando requisição para Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 6000,
        temperature: 0.2,
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
      
      // Validar estrutura básica
      if (!workoutPlan.title || !workoutPlan.exercises || !Array.isArray(workoutPlan.exercises)) {
        throw new Error('Estrutura do JSON inválida');
      }
      
      // Garantir compatibilidade com interface existente
      if (!workoutPlan.nutrition_tips) {
        workoutPlan.nutrition_tips = workoutPlan.nutrition_timing || [];
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
    'hipertrofia': 'hipertrofia muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  
  return {
    title: `Plano de Treino ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano científico personalizado focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido com metodologia progressiva, considerando seu perfil específico, limitações e objetivos. Inclui orientações detalhadas de execução, respiração e progressão semanal para resultados otimizados.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    weekly_structure: {
      training_days: userProfile?.available_days || 3,
      rest_days: 7 - (userProfile?.available_days || 3),
      weekly_progression: "Semana 1-2: Adaptação neuromuscular (60-70% carga máxima). Semana 3-4: Aumento de 10-15% na carga. Semana 5-6: Intensificação (75-85% carga). Semana 7-8: Pico ou deload conforme resposta."
    },
    warm_up: {
      duration: "10-12 minutos",
      exercises: [
        {
          name: "Mobilidade Articular Dinâmica",
          duration: "4-5 minutos",
          instructions: "Execute movimentos circulares lentos de todas as articulações principais: pescoço (8 reps cada direção), ombros (10 reps frente/trás), quadris (8 reps cada direção), joelhos (extensão/flexão 10x), tornozelos (círculos 8x cada). Respire profundamente, mantenha controle total do movimento. Objetivo: aumentar amplitude articular e preparar sistema nervoso."
        },
        {
          name: "Ativação Cardiovascular Progressiva",
          duration: "3-4 minutos",
          instructions: "Inicie com marcha estacionária leve (30s), evolua para elevação de joelhos (30s), depois polichinelos moderados (45s), finalize com corrida estacionária leve (60s). Monitore frequência cardíaca: deve atingir 50-60% da FCmax. Respiração controlada: inspire pelo nariz, expire pela boca."
        },
        {
          name: "Ativação Muscular Específica",
          duration: "3-4 minutos",
          instructions: "Execute movimentos preparatórios dos grupos que serão treinados: agachamento sem peso (8x), flexão de braço na parede (8x), prancha isométrica (20s), ponte de glúteo (8x). Foque na qualidade do movimento e conexão mente-músculo. Contraia conscientemente os músculos alvo."
        }
      ]
    },
    exercises: [
      {
        name: "Agachamento Corporal Técnico",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "8-10" : "12-15",
        rest: "60-90s",
        weight_guidance: "Use apenas peso corporal. Quando conseguir 15 reps com técnica perfeita e 2 reps em reserva, considere adicionar resistência (colete, halteres)",
        execution_tempo: "3-2-2-1 (3s descida controlada, 2s pausa no fundo, 2s subida explosiva, 1s contração no topo)",
        instructions: "POSIÇÃO INICIAL: Pés na largura dos ombros, dedos levemente apontados para fora (15-30°). Peito erguido, olhar horizontal, core ativado. EXECUÇÃO: Inicie empurrando o quadril para trás como se fosse sentar numa cadeira. Desça controladamente mantendo joelhos alinhados com a ponta dos pés. Desça até coxas paralelas ao solo (90° no joelho). SUBIDA: Empurre através dos calcanhares, estenda quadris e joelhos simultaneamente. Mantenha peito erguido durante todo movimento.",
        breathing_pattern: "Inspire na descida (fase excêntrica), segure na pausa inferior, expire durante a subida (fase concêntrica)",
        common_mistakes: "Joelhos convergindo para dentro (valgo), peso nos dedos dos pés, tronco inclinando excessivamente para frente, não atingir amplitude completa",
        safety_tips: "Se sentir dor no joelho, reduza amplitude. Mantenha sempre controle do movimento. Pare se perder a forma técnica",
        modifications: {
          easier: "Agachamento assistido: use TRX, elástico ou apoie numa cadeira. Reduza amplitude até 45° se necessário",
          harder: "Agachamento búlgaro (uma perna), agachamento com salto, ou agachamento pistol (progressão avançada)"
        },
        muscle_focus: "Primários: Quadríceps (vasto medial, lateral, intermédio, reto femoral), Glúteo máximo. Secundários: Isquiotibiais, panturrilhas. Estabilizadores: Core, glúteo médio",
        why_this_exercise: "Movimento funcional que recruta maior massa muscular, estimula liberação hormonal, melhora força de membros inferiores e mobilidade de quadril essencial para atividades diárias"
      },
      {
        name: "Flexão de Braço Progressiva",
        category: "peito",
        sets: 3,
        reps: level === 'sedentario' ? "5-8" : "8-12",
        rest: "60-90s",
        weight_guidance: "Peso corporal. Ajuste inclinação para adequar dificuldade: mais alto = mais fácil, solo = padrão, pés elevados = mais difícil",
        execution_tempo: "2-1-1-1 (2s descida, 1s pausa no peito, 1s subida explosiva, 1s contração no topo)",
        instructions: "POSIÇÃO: Prancha alta com mãos na largura dos ombros, dedos apontados para frente. Corpo alinhado da cabeça aos pés como uma tábua rígida. DESCIDA: Flexione cotovelos a 45° do corpo, desça até peito quase tocar o solo. Mantenha core contraído, glúteos ativos. SUBIDA: Empurre o chão com força, estenda braços completamente. Mantenha alinhamento corporal durante todo movimento.",
        breathing_pattern: "Inspire na descida, expire com força durante a subida (pode ajudar na geração de força)",
        common_mistakes: "Quadril caído ou elevado, cotovelos muito abertos (90°), amplitude incompleta, cabeça projetada para frente",
        safety_tips: "Se sentir dor no punho, use punhos fechados ou apoio para punho. Mantenha sempre core ativado para proteger lombar",
        modifications: {
          easier: "Flexão com joelhos apoiados, flexão na parede (em pé), ou flexão inclinada (mãos elevadas)",
          harder: "Flexão com pés elevados, flexão diamante (mãos em triângulo), flexão archer (alternando braços)"
        },
        muscle_focus: "Primários: Peitoral maior (porções clavicular e esternal), Tríceps braquial. Secundários: Deltoides anterior. Estabilizadores: Core completo, serrátil anterior",
        why_this_exercise: "Exercício composto que desenvolve força funcional do tronco superior, melhora estabilidade do core e pode ser facilmente progressivo conforme evolução"
      },
      {
        name: "Prancha Isométrica Técnica",
        category: "core",
        sets: 3,
        reps: level === 'sedentario' ? "20-30s" : "30-45s",
        rest: "45-60s",
        weight_guidance: "Peso corporal. Foque na qualidade: melhor manter menos tempo com técnica perfeita que mais tempo com compensações",
        execution_tempo: "Isométrico - manter posição estática com tensão constante",
        instructions: "POSIÇÃO: Apoie antebraços paralelos, cotovelos alinhados sob ombros. Pés unidos ou afastados na largura do quadril. ALINHAMENTO: Linha reta da cabeça aos calcanhares. Pelve neutra (nem anteriorizada nem posteriorizada). ATIVAÇÃO: Contraia abdômen como se fosse receber um soco, glúteos ativos, respiração controlada. Olhar para o chão mantendo pescoço neutro.",
        breathing_pattern: "Respiração normal e controlada - não prenda a respiração. Inspire/expire mantendo tensão abdominal",
        common_mistakes: "Quadril elevado (pirâmide), quadril caído, ombros projetados à frente, respiração presa, tensão excessiva no pescoço",
        safety_tips: "Se lombar doer, reduza tempo ou eleve quadril ligeiramente. Mantenha sempre respiração fluida",
        modifications: {
          easier: "Prancha com joelhos apoiados, prancha inclinada (antebraços elevados), reduzir tempo para 10-15s",
          harder: "Prancha com elevação alternada de braços, pernas, ou prancha lateral"
        },
        muscle_focus: "Primários: Reto abdominal, transverso do abdômen, oblíquos. Secundários: Glúteos, deltoides, serrátil anterior. Estabilizadores: Eretor da espinha",
        why_this_exercise: "Desenvolve estabilidade do core essencial para todos os movimentos, melhora postura, fortalece musculatura profunda do abdômen e previne dores lombares"
      },
      {
        name: "Afundo Alternado Controlado",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "6-8 cada perna" : "10-12 cada perna",
        rest: "60-90s",
        weight_guidance: "Peso corporal inicialmente. Quando dominar movimento, pode adicionar halteres nas mãos ou colete de peso",
        execution_tempo: "2-2-2-1 (2s descida, 2s pausa no fundo, 2s subida, 1s estabilização)",
        instructions: "POSIÇÃO INICIAL: Em pé, pés na largura do quadril, core ativado. MOVIMENTO: Dê passo largo à frente (aproximadamente 2-3 pés), mantenha tronco ereto. DESCIDA: Flexione ambos joelhos até joelho de trás quase tocar o chão (90° em ambas pernas). Peso distribuído 70% perna da frente, 30% de trás. SUBIDA: Empurre através do calcanhar da frente, retorne à posição inicial. Alterne as pernas.",
        breathing_pattern: "Inspire ao dar o passo e na descida, expire durante a subida e retorno à posição inicial",
        common_mistakes: "Passo muito curto ou longo, joelho da frente ultrapassando dedos, inclinação excessiva do tronco, apoio nos dedos do pé de trás",
        safety_tips: "Se tiver problemas de equilíbrio, segure numa parede lateralmente. Comece com passos menores e aumente gradualmente",
        modifications: {
          easier: "Afundo reverso (passo para trás), afundo com apoio lateral, ou afundo estático (sem alternância)",
          harder: "Afundo com salto, afundo búlgaro, afundo lateral, ou afundo caminhando"
        },
        muscle_focus: "Primários: Quadríceps, Glúteo máximo da perna da frente. Secundários: Isquiotibiais, panturrilhas. Estabilizadores: Core, glúteo médio, músculos do tornozelo",
        why_this_exercise: "Movimento unilateral que corrige desequilíbrios musculares, melhora estabilidade e força funcional, simula padrões de movimento do dia a dia como subir escadas"
      },
      {
        name: "Ponte de Glúteo Ativada",
        category: "pernas",
        sets: 3,
        reps: level === 'sedentario' ? "12-15" : "15-20",
        rest: "45-60s",
        weight_guidance: "Peso corporal. Para progressão, use uma perna só ou adicione peso sobre o quadril (anilha, livro)",
        execution_tempo: "1-3-1-1 (1s subida, 3s contração no topo, 1s descida, 1s pausa)",
        instructions: "POSIÇÃO: Deitado de costas, joelhos flexionados 90°, pés firmes no chão na largura do quadril. Braços ao lado do corpo para estabilidade. MOVIMENTO: Contraia glúteos conscientemente, eleve quadril formando linha reta dos joelhos aos ombros. CONTRAÇÃO: No topo, aperte glúteos por 3 segundos como se fosse quebrar uma noz. DESCIDA: Desça controladamente até quase tocar o solo, sem relaxar completamente.",
        breathing_pattern: "Expire durante a subida e contração dos glúteos, inspire na descida controlada",
        common_mistakes: "Usar costas em vez de glúteos, elevar muito (hiperextensão lombar), não contrair glúteos no topo, descida muito rápida",
        safety_tips: "Se sentir lombar, reduza amplitude e foque mais na contração dos glúteos. Mantenha pés bem apoiados",
        modifications: {
          easier: "Amplitude menor, sem pausa no topo, ou ponte com pés elevados",
          harder: "Ponte com uma perna, ponte com peso, ou ponte com banda elástica nos joelhos"
        },
        muscle_focus: "Primários: Glúteo máximo, médio e mínimo. Secundários: Isquiotibiais, eretor da espinha baixa. Estabilizadores: Core, adutores",
        why_this_exercise: "Ativa e fortalece glúteos que são frequentemente inativos no sedentarismo, melhora postura, reduz dor lombar e prepara para exercícios mais complexos"
      }
    ],
    workout_splits: {
      day_1: {
        focus: "Corpo Inteiro - Ênfase Membros Inferiores",
        exercises: ["Agachamento Corporal Técnico", "Ponte de Glúteo Ativada", "Prancha Isométrica Técnica"]
      },
      day_2: {
        focus: "Corpo Inteiro - Ênfase Membros Superiores", 
        exercises: ["Flexão de Braço Progressiva", "Prancha Isométrica Técnica", "Afundo Alternado Controlado"]
      },
      day_3: {
        focus: "Corpo Inteiro - Integração e Condicionamento",
        exercises: ["Agachamento + Flexão", "Afundo Alternado", "Ponte de Glúteo", "Prancha Dinâmica"]
      }
    },
    cool_down: {
      duration: "10-15 minutos",
      exercises: [
        {
          name: "Alongamento de Quadríceps",
          duration: "45-60 segundos cada perna",
          instructions: "Em pé, segure o pé por trás levando calcanhar ao glúteo. Mantenha joelhos alinhados, pelve neutra. Sinta alongamento na parte frontal da coxa. Respire profundamente e relaxe na posição."
        },
        {
          name: "Alongamento de Isquiotibiais",
          duration: "45-60 segundos cada perna",
          instructions: "Sentado com uma perna estendida, incline tronco para frente mantendo coluna reta. Alcance em direção ao pé sem forçar. Sinta alongamento na parte posterior da coxa."
        },
        {
          name: "Alongamento de Peitorais e Ombros",
          duration: "45-60 segundos",
          instructions: "Apoie antebraço na parede ou portal, gire corpo para lado oposto. Mantenha ombro alinhado, sinta alongamento no peito e ombro anterior. Faça bilateral."
        },
        {
          name: "Relaxamento e Respiração",
          duration: "2-3 minutos",
          instructions: "Deitado confortavelmente, pratique respiração diafragmática: inspire 4s pelo nariz (barriga sobe), segure 4s, expire 6s pela boca. Relaxe todos os músculos progressivamente."
        }
      ]
    },
    progression_guidelines: [
      "Semana 1-2: Domínio da técnica com 60-70% da capacidade máxima. Foque na forma perfeita, conexão mente-músculo e estabelecimento do padrão motor",
      "Semana 3-4: Aumento de 1-2 repetições por exercício ou adicione 1 série extra. Mantenha técnica impecável, introduza variações básicas se necessário",
      "Semana 5-6: Intensificação com 75-85% capacidade máxima. Adicione tempo de tensão (pausas) ou variações mais desafiadoras dos exercícios básicos",
      "Semana 7-8: Pico de intensidade ou semana de deload conforme resposta individual. Avalie necessidade de progressão para exercícios mais avançados",
      "SINAIS PARA PROGRESSÃO: Consegue completar todas as séries e reps com 2-3 repetições em reserva, técnica permanece perfeita, recuperação adequada entre sessões"
    ],
    nutrition_timing: [
      "PRÉ-TREINO (60-90min antes): Carboidrato de absorção média + proteína magra. Exemplo: 1 banana + 1 iogurte grego, ou 2 fatias pão integral + peito peru + água (400-500ml)",
      "DURANTE TREINO: Hidratação constante - 150-200ml água a cada 15-20min. Se treino >60min, considere bebida esportiva com eletrólitos",
      "PÓS-TREINO (até 2h - janela anabólica): Proteína de alta qualidade + carboidrato. Exemplo: whey protein + banana, ou sanduíche peito frango + suco natural",
      "DISTRIBUIÇÃO DIÁRIA: Proteína 1,6-2,2g/kg peso corporal. Carboidratos 45-65% calorias totais. Gorduras 20-35%. Hidratação: 35ml/kg peso + reposição do suor"
    ],
    recovery_tips: [
      "DESCANSO ENTRE TREINOS: Mínimo 48h para mesmo grupo muscular. Músculos crescem durante recuperação, não durante treino",
      "SONO OTIMIZADO: 7-9h por noite. 80% da liberação de GH ocorre no sono profundo. Ambiente escuro, fresco (18-21°C), sem eletrônicos 1h antes",
      "RECUPERAÇÃO ATIVA: Caminhada leve 20-30min, alongamento, yoga ou mobilidade nos dias de descanso. Mantém circulação sem estresse adicional",
      "SINAIS DE OVERTRAINING: Fadiga persistente, humor alterado, queda performance, dores articulares, frequência cardíaca elevada em repouso. PARE e descanse 3-7 dias",
      "TÉCNICAS COMPLEMENTARES: Banho morno, automassagem com rolo, meditação/mindfulness, hidratação adequada constante"
    ],
    performance_tracking: [
      "MÉTRICAS SEMANAIS: Número de repetições completadas por exercício, tempo de sustentação para isométricos, percepção de esforço (escala 1-10)",
      "MEDIDAS CORPORAIS: Peso corporal, circunferências (braço, cintura, coxa, quadril) a cada 2 semanas. Fotos de progresso mensais",
      "INDICADORES DE PERFORMANCE: Facilidade para atividades diárias, disposição geral, qualidade do sono, humor, energia durante o dia",
      "REGISTRO DE TREINO: Anote séries/reps completadas, dificuldade percebida, como se sentiu. Use app ou caderno para acompanhar evolução",
      "QUANDO AJUSTAR: Se não houve progressão em 2 semanas consecutivas, aumente intensidade. Se muito difícil por 3 treinos seguidos, reduza volume temporariamente"
    ],
    safety_protocols: [
      "AQUECIMENTO OBRIGATÓRIO: NUNCA pule - previne 80% das lesões. Mínimo 8-10min com mobilidade + ativação cardiovascular + preparação neuromuscular",
      "SINAIS DE PARADA IMEDIATA: Dor aguda/cortante, tontura, náusea, dor no peito, falta de ar desproporcional, dor articular súbita",
      "ADAPTAÇÕES PARA LIMITAÇÕES: Se problemas articulares, reduza amplitude e aumente controle. Se cardiovascular, monitore FC e use escala de percepção",
      "PROGRESSÃO GRADUAL: Aumentos máximos de 10% por semana em volume/intensidade. Lei dos 10% previne lesões por uso excessivo",
      "ORIENTAÇÃO PROFISSIONAL: Procure médico se dor persistir >48h, se houver limitação funcional, ou antes de iniciar se >40 anos ou fatores de risco"
    ]
  };
}
