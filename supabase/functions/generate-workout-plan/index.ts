
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
    console.log('🚀 Dados recebidos na API:', userProfile);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey || groqApiKey.trim() === '') {
      console.error('❌ GROQ_API_KEY não configurada ou vazia');
      console.log('📋 Usando plano de fallback devido à chave não configurada');
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

    console.log('✅ Chave Groq configurada, gerando prompt personalizado...');

    // Mapear valores para português mais amigável
    const goalsMap = {
      'perder_peso': 'perder peso e queimar gordura corporal',
      'ganhar_massa': 'ganhar massa muscular e hipertrofia',
      'tonificar': 'tonificar o corpo e definir músculos',
      'condicionamento': 'melhorar condicionamento cardiovascular',
      'forca': 'aumentar força e potência muscular',
      'flexibilidade': 'melhorar flexibilidade e mobilidade',
      'geral': 'condicionamento físico geral'
    };

    const equipmentMap = {
      'academia_completa': 'academia completa com halteres, barras, máquinas de musculação, esteiras e equipamentos de cardio',
      'casa_halteres': 'treino em casa com halteres, barras, elásticos e equipamentos básicos',
      'casa_basico': 'treino em casa com equipamentos básicos limitados',
      'peso_corporal': 'exercícios usando apenas o peso corporal, sem equipamentos',
      'parque': 'exercícios ao ar livre em parques com barras e equipamentos públicos'
    };

    const limitationsMap = {
      'nenhuma': 'nenhuma limitação física',
      'joelho': 'problemas no joelho - evitar impacto e sobrecarga',
      'costas': 'problemas nas costas - foco em fortalecimento do core',
      'ombro': 'problemas no ombro - evitar movimentos overhead',
      'tornozelo': 'problemas no tornozelo - exercícios de baixo impacto',
      'cardiaco': 'problemas cardíacos - intensidade moderada controlada',
      'outros': 'outras limitações físicas específicas'
    };

    const fitnessLevelMap = {
      'sedentario': 'sedentário - iniciante absoluto sem experiência em exercícios',
      'pouco_ativo': 'pouco ativo - experiência limitada com exercícios',
      'moderado': 'moderadamente ativo - alguma experiência com treinos',
      'ativo': 'ativo - experiência regular com exercícios',
      'muito_ativo': 'muito ativo - experiência avançada em treinamento',
      'avancado': 'atlético avançado - alto nível de condicionamento'
    };

    const goals = goalsMap[userProfile.fitness_goals?.[0]] || userProfile.fitness_goals?.[0] || 'melhorar condicionamento geral';
    const equipment = equipmentMap[userProfile.equipment] || userProfile.equipment || 'equipamentos básicos';
    const limitations = limitationsMap[userProfile.limitations] || userProfile.limitations || 'nenhuma limitação';
    const fitnessLevel = fitnessLevelMap[userProfile.fitness_level] || userProfile.fitness_level || 'iniciante';

    // Calcular IMC para personalização adicional
    let imcInfo = '';
    if (userProfile.height && userProfile.weight) {
      const heightInMeters = userProfile.height / 100;
      const imc = userProfile.weight / (heightInMeters * heightInMeters);
      imcInfo = `IMC: ${imc.toFixed(1)} - `;
      if (imc < 18.5) imcInfo += 'Abaixo do peso - foco em ganho de massa e força';
      else if (imc < 25) imcInfo += 'Peso normal - manutenção e tonificação';
      else if (imc < 30) imcInfo += 'Sobrepeso - foco em queima de gordura';
      else imcInfo += 'Obesidade - exercícios de baixo impacto e queima calórica';
    }

    // Criar prompt super detalhado e personalizado
    const prompt = `Você é um renomado personal trainer certificado com 15 anos de experiência em treinamento personalizado. Crie um plano de treino EXTREMAMENTE DETALHADO, ESPECÍFICO e PERSONALIZADO em português baseado no perfil completo abaixo:

PERFIL COMPLETO DO ALUNO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- ${imcInfo}
- Nível atual: ${fitnessLevel}
- Objetivo principal: ${goals}
- Dias disponíveis: ${userProfile.available_days || 3} por semana
- Duração por sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos disponíveis: ${equipment}
- Limitações físicas: ${limitations}

INSTRUÇÕES DETALHADAS PARA UM PLANO PROFISSIONAL:

1. ESTRUTURA DO TREINO PERIODIZADO:
   - Crie um plano de 12 semanas dividido em 4 fases de 3 semanas cada
   - PRIMEIRA SEMANA: Adaptação anatômica (cargas leves, foco na técnica)
   - SEGUNDA SEMANA: Progressão gradual (aumento de 10-15% na intensidade)
   - TERCEIRA SEMANA: Consolidação (manutenção da carga, melhora da execução)
   - QUARTA SEMANA: Progressão para próxima fase
   - Continue este padrão até a 12ª semana

2. NOMENCLATURA OBRIGATÓRIA DOS EXERCÍCIOS:
   - Use SEMPRE: "PRIMEIRA SEMANA - Treino 1: [Nome do Exercício]"
   - Use SEMPRE: "SEGUNDA SEMANA - Treino 1: [Nome do Exercício]"
   - Use SEMPRE: "TERCEIRA SEMANA - Treino 2: [Nome do Exercício]"
   - E assim por diante até "DÉCIMA SEGUNDA SEMANA"
   - Para aquecimentos: "PRIMEIRA SEMANA - Aquecimento Específico"

3. EXERCÍCIOS ESPECÍFICOS:
   - Escolha exercícios que maximizem o objetivo: ${goals}
   - Inclua variações progressivas e regressivas
   - Especifique técnica de execução biomecânica detalhada
   - Adicione músculos primários e secundários trabalhados
   - Inclua tempo sob tensão e cadência quando relevante

4. PRESCRIÇÃO DETALHADA:
   - Séries, repetições e descanso específicos por semana
   - Percentual de carga ou percepção de esforço
   - Progressões semanais concretas
   - Adaptações para limitações: ${limitations}

5. PERIODIZAÇÃO POR SEMANAS:
   - Semanas 1-3: Adaptação anatômica
   - Semanas 4-6: Desenvolvimento básico
   - Semanas 7-9: Intensificação
   - Semanas 10-12: Polimento/Pico

6. AQUECIMENTO E RECUPERAÇÃO:
   - Aquecimento específico para cada semana (8-12 minutos)
   - Alongamento e mobilidade pós-treino
   - Protocolos de recuperação entre sessões

RETORNE APENAS um JSON válido no seguinte formato:

{
  "title": "Plano Periodizado: [Objetivo] - Nível [Nível]",
  "description": "Plano periodizado de 12 semanas específico para [objetivo principal], considerando [limitações], com [X] sessões semanais usando [equipamentos]. Desenvolvido considerando perfil individual completo.",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "exercises": [
    {
      "name": "PRIMEIRA SEMANA - Aquecimento Específico",
      "sets": 1,
      "reps": "10-12 minutos",
      "rest": "Transição",
      "instructions": "AQUECIMENTO DETALHADO: [5-6 exercícios específicos com descrição biomecânica completa, preparação articular, ativação neuromuscular, elevação da temperatura corporal]. Progressão específica para primeira semana com intensidade baixa."
    },
    {
      "name": "PRIMEIRA SEMANA - Treino 1: [Nome do Exercício Principal Específico]",
      "sets": "3",
      "reps": "8-12",
      "rest": "90-120s",
      "instructions": "EXECUÇÃO TÉCNICA: [Posição inicial detalhada, fase excêntrica, fase concêntrica, respiração, músculos primários e estabilizadores]. PRIMEIRA SEMANA: Foco total na adaptação anatômica e aprendizado motor. ADAPTAÇÕES: [considerações para limitações específicas]. VARIAÇÕES: [alternativas por nível]."
    },
    {
      "name": "SEGUNDA SEMANA - Treino 1: [Mesmo exercício com progressão]",
      "sets": "3-4",
      "reps": "10-15",
      "rest": "90-120s",
      "instructions": "EXECUÇÃO TÉCNICA: [mesma base técnica]. SEGUNDA SEMANA: Progressão gradual com 10-15% mais intensidade ou volume. Manter foco na técnica perfeita. ADAPTAÇÕES: [considerações específicas]. VARIAÇÕES: [progressões para segunda semana]."
    }
  ],
  "nutrition_tips": [
    "Estratégia nutricional específica para [objetivo]: timing, macronutrientes e hidratação",
    "Suplementação básica recomendada considerando [objetivo] e perfil individual",
    "Timing nutricional pré e pós-treino otimizado para [objetivo]",
    "Protocolo de hidratação específico para intensidade de treino planejada"
  ]
}

REQUISITOS CRÍTICOS:
- Crie NO MÍNIMO ${Math.max(userProfile.available_days || 3, 3) * 12} exercícios completos (incluindo progressões semanais)
- SEMPRE use a nomenclatura: "PRIMEIRA SEMANA", "SEGUNDA SEMANA", etc.
- Cada exercício deve ter instruções de NO MÍNIMO 80 palavras
- Considere TODAS as limitações: ${limitations}
- Adapte 100% aos equipamentos: ${equipment}
- Faça progressão semanal específica e realista
- Use terminology técnica profissional
- O campo difficulty_level deve ser exatamente: "iniciante", "intermediario", ou "avancado"
- Seja específico em músculos trabalhados, biomecânica e progressões

RETORNE APENAS O JSON, sem markdown, sem explicações adicionais.`;

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
            content: 'Você é um personal trainer certificado especialista em ciência do exercício com 15 anos de experiência. Crie planos de treino extremamente detalhados e personalizados baseados no perfil completo do aluno.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.2, // Menor para mais consistência
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      
      console.log('📋 Usando plano de fallback devido ao erro na API Groq');
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
    console.log('✅ Resposta recebida do Groq com sucesso');

    let content = data.choices?.[0]?.message?.content || '';

    if (!content || content.trim() === '') {
      console.log('⚠️ Conteúdo vazio da API Groq, usando fallback');
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
      console.log('✅ JSON parseado com sucesso da API Groq');
      
      // Validar e corrigir difficulty_level
      const validLevels = ['iniciante', 'intermediario', 'avancado'];
      if (!workoutPlan.difficulty_level || !validLevels.includes(workoutPlan.difficulty_level)) {
        workoutPlan.difficulty_level = mapFitnessLevelToDifficulty(userProfile.fitness_level);
      }
      
      // Validar estrutura básica
      if (!workoutPlan.title || !workoutPlan.exercises || !Array.isArray(workoutPlan.exercises)) {
        throw new Error('Estrutura do JSON inválida da API Groq');
      }

      // Adicionar flag indicando que veio da API Groq
      workoutPlan.source = 'groq_api';
      workoutPlan.generated_for = {
        goals: goals,
        equipment: equipment,
        level: fitnessLevel,
        limitations: limitations,
        days: userProfile.available_days || 3,
        duration: userProfile.session_duration || 60
      };
      
      console.log('🎯 Plano personalizado gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback
      console.log('📋 Usando plano de fallback devido ao erro de parse');
      workoutPlan = createFallbackPlan(userProfile);
    }

    console.log('🎉 Retornando plano final gerado pela API Groq');

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
    console.error('💥 Erro geral no generate-workout-plan:', error);
    
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
    title: `Plano Periodizado ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano periodizado de 12 semanas específico para ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    source: 'fallback',
    exercises: [
      {
        name: "PRIMEIRA SEMANA - Aquecimento Dinâmico",
        sets: 1,
        reps: "8-10 minutos",
        rest: "N/A",
        instructions: "Aquecimento articular completo: rotações de pescoço, ombros, quadris e tornozelos. Caminhada no local com elevação gradual dos joelhos. Polichinelos leves. PRIMEIRA SEMANA: Foco na adaptação e preparação do sistema cardiovascular."
      },
      {
        name: "PRIMEIRA SEMANA - Treino 1: Agachamento Livre",
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "8-10" : "10-12",
        rest: "90s",
        instructions: "Posição inicial: pés na largura dos ombros, pontas levemente para fora. Descida: flexione quadris e joelhos simultaneamente, mantendo o peso nos calcanhares. Desça até coxas paralelas ao chão. Subida: empurre o chão com os pés, ativando glúteos e quadríceps. PRIMEIRA SEMANA: Cargas muito leves, foco total na técnica e mobilidade articular."
      },
      {
        name: "PRIMEIRA SEMANA - Treino 1: Flexão de Braço",
        sets: 2,
        reps: level === 'sedentario' ? "5-8" : "8-10",
        rest: "60s",
        instructions: "Posição: apoio nas mãos (na largura dos ombros) e pontas dos pés. Corpo alinhado da cabeça aos calcanhares. Descida controlada até peito quase tocar o solo. Subida explosiva estendendo completamente os braços. PRIMEIRA SEMANA: Adaptação dos músculos estabilizadores, pode usar apoio nos joelhos se necessário."
      },
      {
        name: "SEGUNDA SEMANA - Treino 1: Agachamento Livre",
        sets: level === 'sedentario' ? 3 : 4,
        reps: level === 'sedentario' ? "10-12" : "12-15",
        rest: "90s",
        instructions: "Mesma técnica da primeira semana. SEGUNDA SEMANA: Progressão gradual com 15% mais repetições. Manter cadência controlada (2 segundos descida, 1 segundo subida). Foco na ativação dos glúteos e core."
      },
      {
        name: "SEGUNDA SEMANA - Treino 1: Flexão de Braço",
        sets: 3,
        reps: level === 'sedentario' ? "8-10" : "10-12",
        rest: "60s",
        instructions: "Progressão da primeira semana. SEGUNDA SEMANA: Aumento do volume total, manter técnica perfeita. Se conseguir fazer todas as repetições facilmente, progredir para flexão completa (sair do apoio nos joelhos)."
      },
      {
        name: "TERCEIRA SEMANA - Treino 1: Agachamento com Pausa",
        sets: level === 'sedentario' ? 3 : 4,
        reps: level === 'sedentario' ? "10-12" : "12-15",
        rest: "90-120s",
        instructions: "Mesmo movimento do agachamento livre, mas com pausa de 2 segundos na posição mais baixa. TERCEIRA SEMANA: Consolidação da força e melhora da estabilidade. Maior ativação muscular devido à pausa isométrica."
      },
      {
        name: "TERCEIRA SEMANA - Treino 1: Flexão Diamante (Iniciantes: Normal)",
        sets: 3,
        reps: level === 'sedentario' ? "6-8" : "8-12",
        rest: "90s",
        instructions: "Para iniciantes: flexão normal com técnica aperfeiçoada. Para intermediários: flexão diamante (mãos formando diamante). TERCEIRA SEMANA: Variação para estimular diferentes padrões de movimento e evitar adaptação."
      }
    ],
    nutrition_tips: [
      "PRIMEIRA E SEGUNDA SEMANA: Proteína pós-treino moderada (15-20g) para adaptação inicial",
      "TERCEIRA SEMANA: Aumento para 25-30g de proteína pós-treino para suporte à recuperação",
      "Hidratação progressiva: 35ml por kg de peso + 300ml extra na primeira semana, 500ml extra da segunda semana em diante",
      "Carboidratos pré-treino: começar com 20-30g na primeira semana, progredir para 30-50g",
      "Timing nutricional: manter consistência nos horários das refeições para regular o metabolismo",
      "Sono reparador: 7-9h por noite, especialmente importante nas primeiras semanas de adaptação",
      "Suplementação básica: considere apenas após a terceira semana, quando o corpo estiver adaptado"
    ]
  };
}
