
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

1. ESTRUTURA DO TREINO:
   - Crie um plano periodizado com divisão específica para ${userProfile.available_days || 3} dias
   - Inclua progressão semanal detalhada (semanas 1-4, 5-8, 9-12)
   - Considere volume, intensidade e densidade apropriados para o nível
   - Adapte completamente aos equipamentos disponíveis

2. EXERCÍCIOS ESPECÍFICOS:
   - Escolha exercícios que maximizem o objetivo: ${goals}
   - Inclua variações progressivas e regressivas
   - Especifique técnica de execução biomecânica detalhada
   - Adicione músculos primários e secundários trabalhados
   - Inclua tempo sob tensão e cadência quando relevante

3. PRESCRIÇÃO DETALHADA:
   - Séries, repetições e descanso específicos por fase
   - Percentual de carga ou percepção de esforço
   - Progressões semanais concretas
   - Adaptações para limitações: ${limitations}

4. PERIODIZAÇÃO:
   - Fase 1 (semanas 1-4): Adaptação anatômica
   - Fase 2 (semanas 5-8): Desenvolvimento específico
   - Fase 3 (semanas 9-12): Intensificação/Polimento

5. AQUECIMENTO E RECUPERAÇÃO:
   - Aquecimento específico para cada sessão (8-12 minutos)
   - Alongamento e mobilidade pós-treino
   - Protocolos de recuperação entre sessões

RETORNE APENAS um JSON válido no seguinte formato:

{
  "title": "Plano Personalizado: [Objetivo] - Nível [Nível]",
  "description": "Plano periodizado de 12 semanas específico para [objetivo principal], considerando [limitações], com [X] sessões semanais usando [equipamentos]. Desenvolvido considerando perfil individual completo.",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "exercises": [
    {
      "name": "DIA 1 - [Nome da Sessão]: Aquecimento Específico",
      "sets": 1,
      "reps": "10-12 minutos",
      "rest": "Transição",
      "instructions": "AQUECIMENTO DETALHADO: [5-6 exercícios específicos com descrição biomecânica completa, preparação articular, ativação neuromuscular, elevação da temperatura corporal]. Progressão: semana 1-2 (intensidade baixa), semana 3-4 (intensidade moderada)."
    },
    {
      "name": "DIA 1: [Nome do Exercício Principal Específico]",
      "sets": "3-4",
      "reps": "8-12",
      "rest": "90-120s",
      "instructions": "EXECUÇÃO TÉCNICA: [Posição inicial detalhada, fase excêntrica, fase concêntrica, respiração, músculos primários e estabilizadores]. PROGRESSÃO: Semana 1-2: [especificações], Semana 3-4: [especificações], etc. ADAPTAÇÕES: [considerações para limitações específicas]. VARIAÇÕES: [alternativas por nível]."
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
- Crie NO MÍNIMO ${Math.max(userProfile.available_days || 3, 3) * 5} exercícios completos (incluindo aquecimentos específicos para cada dia)
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
    title: `Plano de Treino ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano personalizado focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    source: 'fallback',
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
