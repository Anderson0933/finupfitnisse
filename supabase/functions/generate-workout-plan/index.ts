
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

    // Criar prompt super detalhado e personalizado para 8 semanas
    const prompt = `Você é um renomado personal trainer certificado com 15 anos de experiência em treinamento personalizado. Crie um plano de treino EXTREMAMENTE DETALHADO, ESPECÍFICO e PERSONALIZADO de 8 SEMANAS em português baseado no perfil completo abaixo:

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

INSTRUÇÕES DETALHADAS PARA UM PLANO PROFISSIONAL DE 8 SEMANAS:

1. ESTRUTURA DO TREINO (8 SEMANAS):
   - Semanas 1-2: Adaptação e Familiarização (volume baixo, foco na técnica)
   - Semanas 3-4: Progressão Gradual (aumento de volume e intensidade)
   - Semanas 5-6: Intensificação (volume moderado/alto, intensidade crescente)
   - Semanas 7-8: Pico e Consolidação (refinamento e máxima intensidade)

2. EXERCÍCIOS ESPECÍFICOS COM INSTRUÇÕES DETALHADAS:
   - Posição inicial detalhada com pontos de referência
   - Execução passo a passo (preparação, execução, finalização)
   - Respiração específica para cada fase do movimento
   - Músculos primários, secundários e estabilizadores
   - Variações progressivas semana a semana
   - Sinais de execução correta vs incorreta

3. PRESCRIÇÃO DETALHADA POR SEMANA:
   - Semana 1-2: Series/repetições/descanso específicos
   - Semana 3-4: Progressão com aumento gradual
   - Semana 5-6: Intensificação com técnicas avançadas
   - Semana 7-8: Refinamento e consolidação dos ganhos

4. AQUECIMENTO E RECUPERAÇÃO ESPECÍFICOS:
   - Aquecimento progressivo de 10-15 minutos para cada sessão
   - Mobilidade articular específica para exercícios do dia
   - Ativação neuromuscular direcionada
   - Protocolo de alongamento pós-treino de 10 minutos
   - Técnicas de recuperação entre sessões

RETORNE APENAS um JSON válido no seguinte formato:

{
  "title": "Plano Personalizado 8 Semanas: [Objetivo] - Nível [Nível]",
  "description": "Plano periodizado de 8 semanas específico para [objetivo principal], considerando [limitações], com [X] sessões semanais usando [equipamentos]. Desenvolvido considerando perfil individual completo com progressão semanal detalhada.",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 8,
  "exercises": [
    {
      "name": "SEMANA 1-2 - Aquecimento Completo",
      "sets": 1,
      "reps": "12-15 minutos",
      "rest": "Fluxo contínuo",
      "instructions": "AQUECIMENTO PROGRESSIVO DETALHADO: 1) Caminhada estacionária 3min (frequência cardíaca 50-60% máximo); 2) Rotações articulares: pescoço (8x cada direção), ombros (10x frente/trás), cotovelos (8x), punhos (8x), quadris (10x), joelhos (8x), tornozelos (8x); 3) Movimentos dinâmicos: polichinelos leves (30s), elevação joelhos (30s), chutes glúteos (30s); 4) Ativação muscular: agachamento ar (10x), flexão parede (8x), prancha 20s. PROGRESSÃO: Semana 1 intensidade 40-50%, semana 2 intensidade 50-60%. SINAIS CORRETOS: Leve suor, articulações móveis, músculos aquecidos."
    },
    {
      "name": "SEMANA 1-2 - Agachamento Livre Fundamental",
      "sets": "2-3",
      "reps": "8-10",
      "rest": "90-120s",
      "instructions": "POSIÇÃO INICIAL: Pés largura dos ombros, pontas levemente abertas (15-30°), peso nos calcanhares. PREPARAÇÃO: Core contraído, peito aberto, olhar frontal, braços estendidos à frente. EXECUÇÃO DESCIDA: Inicie com flexão do quadril (sentar para trás), joelhos seguem direção dos pés, desça até coxas paralelas ao solo (90°), mantenha joelhos alinhados. RESPIRAÇÃO: Inspire na descida, segure ar no fundo. EXECUÇÃO SUBIDA: Empurre solo com calcanhares, ative glúteos e quadríceps, expire na subida, estenda completamente quadris no topo. MÚSCULOS: Primários (glúteos, quadríceps), secundários (posterior coxa, panturrilha), estabilizadores (core, eretores espinais). PROGRESSÃO: Semana 1 (8 reps, 2 séries), semana 2 (10 reps, 3 séries). ERROS COMUNS: Joelhos para dentro, peso na ponta do pé, inclinação excessiva do tronco."
    },
    {
      "name": "SEMANA 3-4 - Agachamento com Pausa",
      "sets": "3-4",
      "reps": "10-12",
      "rest": "90s",
      "instructions": "EVOLUÇÃO DO AGACHAMENTO BÁSICO: Mesma técnica da semana 1-2, mas adicione pausa de 2-3 segundos na posição mais baixa. OBJETIVO: Aumentar tempo sob tensão, melhorar força na posição mais difícil, desenvolver controle motor. EXECUÇÃO: Desça controladamente (3s), pause 2-3s na posição baixa mantendo tensão, suba explosivamente (2s). RESPIRAÇÃO: Inspire na descida, mantenha ar durante pausa, expire na subida. PROGRESSÃO: Semana 3 (10 reps, 3 séries, pausa 2s), semana 4 (12 reps, 4 séries, pausa 3s). BENEFÍCIOS: Maior ativação muscular, melhora da mobilidade de quadril/tornozelo, desenvolvimento de força isométrica."
    },
    {
      "name": "SEMANA 5-6 - Agachamento com Salto",
      "sets": "3-4",
      "reps": "6-8",
      "rest": "120s",
      "instructions": "VERSÃO PLIOMÉTRICA AVANÇADA: Combine técnica perfeita do agachamento com componente explosivo. PREPARAÇÃO: Posição padrão do agachamento, foco na qualidade antes da velocidade. EXECUÇÃO: Desça controladamente até 90°, pause brevemente, exploda para cima com salto vertical máximo, aterrisse suavemente nos calcanhares, absorva impacto flexionando joelhos, retorne posição inicial. RESPIRAÇÃO: Inspire na descida, expire explosivamente no salto. FOCO: Potência, coordenação, desenvolvimento de fibras rápidas. PROGRESSÃO: Semana 5 (6 reps, 3 séries, salto baixo), semana 6 (8 reps, 4 séries, salto máximo). CUIDADOS: Aterrissagem suave, evite se limitações de joelho/tornozelo."
    }
  ],
  "nutrition_tips": [
    "HIDRATAÇÃO OTIMIZADA: 35-40ml por kg de peso corporal + 500-750ml extra nos dias de treino. Beba 200ml 30min antes do treino.",
    "TIMING PRÉ-TREINO: Consuma 30-50g de carboidratos complexos 1-2h antes (aveia, batata-doce, banana). Evite gorduras 2h antes do treino.",
    "RECUPERAÇÃO PÓS-TREINO: Janela anabólica de 30-60min - consuma 20-30g de proteína + 30-40g de carboidratos (whey + banana, ou frango + arroz).",
    "PROGRESSÃO SEMANAL: Semanas 1-2 foque em estabelecer rotina alimentar; semanas 3-4 otimize timing; semanas 5-6 ajuste quantidades; semanas 7-8 personalize completamente.",
    "MICRONUTRIENTES ESSENCIAIS: Magnésio para recuperação muscular, vitamina D para força óssea, ômega-3 para redução inflamatória, zinco para síntese proteica.",
    "CONTROLE DE ENERGIA: Semanas 1-4 mantenha ingestão normal, semanas 5-8 ajuste conforme objetivos (déficit para perda de peso, superávit para ganho de massa)."
  ]
}

REQUISITOS CRÍTICOS:
- Crie NO MÍNIMO ${Math.max(userProfile.available_days || 3, 3) * 6} exercícios completos organizados por semanas
- Cada exercício deve ter instruções de NO MÍNIMO 120 palavras com detalhes técnicos
- Inclua progressão específica semana a semana (1-2, 3-4, 5-6, 7-8)
- Considere TODAS as limitações: ${limitations}
- Adapte 100% aos equipamentos: ${equipment}
- Use terminologia técnica profissional mas acessível
- O campo difficulty_level deve ser exatamente: "iniciante", "intermediario", ou "avancado"
- Seja específico em músculos, biomecânica, respiração e progressões semanais

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
            content: 'Você é um personal trainer certificado especialista em ciência do exercício com 15 anos de experiência. Crie planos de treino de 8 semanas extremamente detalhados e personalizados com progressão semanal específica.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.2,
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
      
      console.log('🎯 Plano personalizado de 8 semanas gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback
      console.log('📋 Usando plano de fallback devido ao erro de parse');
      workoutPlan = createFallbackPlan(userProfile);
    }

    console.log('🎉 Retornando plano final de 8 semanas gerado pela API Groq');

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
    title: `Plano de Treino 8 Semanas ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano personalizado de 8 semanas focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos com progressão semanal detalhada.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    source: 'fallback',
    exercises: [
      {
        name: "SEMANA 1-2: Aquecimento Dinâmico Fundamental",
        sets: 1,
        reps: "10-12 minutos",
        rest: "Fluxo contínuo",
        instructions: "AQUECIMENTO PROGRESSIVO DETALHADO: Inicie com caminhada estacionária por 3 minutos mantendo frequência cardíaca em 50-60% do máximo. Execute rotações articulares completas: pescoço (8 repetições cada direção), ombros para frente e trás (10 repetições), cotovelos (8 círculos), punhos (8 rotações), quadris (10 círculos amplos), joelhos (8 flexões), tornozelos (8 rotações cada pé). Continue com movimentos dinâmicos: polichinelos leves por 30 segundos, elevação alternada de joelhos por 30 segundos, chutes nos glúteos por 30 segundos. Finalize com ativação muscular: 10 agachamentos no ar, 8 flexões na parede, prancha por 20 segundos. PROGRESSÃO: Semana 1 intensidade 40-50%, semana 2 intensidade 50-60%. SINAIS DE AQUECIMENTO ADEQUADO: Leve transpiração, articulações móveis, músculos aquecidos e preparados para exercícios mais intensos."
      },
      {
        name: "SEMANA 1-2: Agachamento Livre Básico",
        sets: level === 'sedentario' ? 2 : 3,
        reps: level === 'sedentario' ? "6-8" : "8-10",
        rest: "90-120s",
        instructions: "POSIÇÃO INICIAL DETALHADA: Posicione os pés na largura dos ombros com pontas levemente voltadas para fora (15-30 graus). Distribua o peso corporal nos calcanhares, mantenha o peito aberto e olhar direcionado para frente. PREPARAÇÃO: Contraia o core como se fosse receber um soco no abdômen, estenda os braços à frente para equilíbrio. EXECUÇÃO DA DESCIDA: Inicie o movimento sentando para trás (flexão do quadril), permita que os joelhos sigam a direção natural dos pés, desça controladamente até as coxas ficarem paralelas ao solo formando 90 graus. RESPIRAÇÃO: Inspire profundamente durante a descida, segure o ar no ponto mais baixo. EXECUÇÃO DA SUBIDA: Empurre o solo com os calcanhares, ative conscientemente glúteos e quadríceps, expire durante a subida, estenda completamente os quadris no topo do movimento. MÚSCULOS TRABALHADOS: Primários (glúteos máximo e médio, quadríceps), secundários (posteriores de coxa, panturrilhas), estabilizadores (core, eretores da espinha). PROGRESSÃO SEMANAL: Semana 1 (6-8 repetições, 2 séries), semana 2 (8-10 repetições, 3 séries). ERROS MAIS COMUNS: Joelhos colapsando para dentro, peso transferido para ponta dos pés, inclinação excessiva do tronco para frente."
      },
      {
        name: "SEMANA 1-2: Flexão de Braço Adaptada",
        sets: 2,
        reps: level === 'sedentario' ? "4-6" : "6-10",
        rest: "60-90s",
        instructions: "VERSÃO ADAPTADA PARA INICIANTES: Realize flexão com apoio nos joelhos (mulheres) ou parede (iniciantes absolutos). POSIÇÃO INICIAL: Apoio nas mãos na largura dos ombros, dedos apontados para frente, corpo alinhado da cabeça aos joelhos (versão joelhos) ou da cabeça aos pés (versão parede). PREPARAÇÃO: Core contraído, glúteos ativados, pescoço neutro. EXECUÇÃO DESCIDA: Flexione os cotovelos próximos ao corpo (não abertos), desça controladamente até peito quase tocar o solo ou parede, mantenha alinhamento corporal. RESPIRAÇÃO: Inspire durante descida, expire durante subida. EXECUÇÃO SUBIDA: Empurre o solo ou parede explosivamente, estenda completamente os braços. MÚSCULOS: Primários (peitoral maior, tríceps, deltóide anterior), estabilizadores (core, serrátil anterior). PROGRESSÃO: Semana 1 versão mais fácil, semana 2 aumente repetições ou dificuldade. ADAPTAÇÕES: Joelho para iniciantes, parede para sedentários, tradicional para avançados."
      },
      {
        name: "SEMANA 3-4: Agachamento com Pausa Isométrica",
        sets: 3,
        reps: "8-12",
        rest: "90s",
        instructions: "EVOLUÇÃO DO AGACHAMENTO BÁSICO: Utilize a mesma técnica perfeita desenvolvida nas semanas 1-2, mas adicione componente isométrico para aumentar dificuldade e benefícios. TÉCNICA: Execute a descida controlada em 3 segundos, mantenha a posição mais baixa (90 graus) por 2-3 segundos mantendo toda a tensão muscular, suba explosivamente em 2 segundos. OBJETIVO ESPECÍFICO: Aumentar tempo sob tensão muscular, melhorar força na amplitude mais difícil, desenvolver controle motor e propriocepção. RESPIRAÇÃO ESPECÍFICA: Inspire profundamente na descida, mantenha o ar durante toda a pausa isométrica, expire explosivamente durante a subida. FOCO MENTAL: Durante a pausa, concentre-se em manter ativação de glúteos e quadríceps, evite relaxar a musculatura. PROGRESSÃO DETALHADA: Semana 3 (8-10 repetições, 3 séries, pausa de 2 segundos), semana 4 (10-12 repetições, 3-4 séries, pausa de 3 segundos). BENEFÍCIOS ESPECÍFICOS: Maior ativação das unidades motoras, melhora significativa da mobilidade de quadril e tornozelo, desenvolvimento de força isométrica funcional, preparação para variações mais avançadas."
      },
      {
        name: "SEMANA 3-4: Flexão Inclinada Progressiva",
        sets: 3,
        reps: "8-12",
        rest: "60-90s",
        instructions: "PROGRESSÃO DA FLEXÃO: Utilize uma superfície elevada (banco, degrau, cama) para reduzir a carga e permitir melhor execução técnica. POSIÇÃO: Mãos apoiadas na superfície elevada na largura dos ombros, corpo em linha reta da cabeça aos pés, pés no solo. ALTURA PROGRESSIVA: Semana 3 superfície mais alta (60-70cm), semana 4 superfície mais baixa (30-40cm). EXECUÇÃO TÉCNICA: Desça controladamente até peito tocar a superfície, cotovelos próximos ao corpo (45 graus), suba explosivamente mantendo alinhamento corporal. RESPIRAÇÃO: Inspire na descida (2-3 segundos), expire na subida (1-2 segundos). MÚSCULOS TRABALHADOS: Peitoral maior e menor, tríceps braquial, deltóide anterior, core como estabilizador. PROGRESSÃO: Semana 3 (8 reps, superfície alta), semana 4 (12 reps, superfície baixa). OBJETIVO: Preparar para flexão tradicional no solo, desenvolver força específica do padrão de empurrar horizontal."
      },
      {
        name: "SEMANA 5-6: Agachamento com Salto Controlado",
        sets: 3,
        reps: "6-8",
        rest: "120s",
        instructions: "VERSÃO PLIOMÉTRICA PARA DESENVOLVIMENTO DE POTÊNCIA: Combine técnica perfeita do agachamento com componente explosivo de salto vertical. PREPARAÇÃO MENTAL: Foque na qualidade antes da velocidade, visualize o movimento completo antes de executar. EXECUÇÃO DETALHADA: Desça com controle total até 90 graus (2-3 segundos), pause brevemente na posição baixa, exploda verticalmente com máxima intenção, aterrisse suavemente primeiro nos antepés depois calcanhares, absorva o impacto flexionando joelhos e quadris, retorne imediatamente à posição inicial. RESPIRAÇÃO ESPECÍFICA: Inspire na descida, segure durante pausa, expire explosivamente durante o salto, inspire novamente no aterrissagem. FOCO TÉCNICO: Potência de membros inferiores, coordenação intermuscular, desenvolvimento específico de fibras musculares rápidas. PROGRESSÃO: Semana 5 (6 repetições, 3 séries, salto baixo-médio), semana 6 (8 repetições, 3-4 séries, salto máximo). CUIDADOS ESPECIAIS: Aterrissagem sempre suave e controlada, evite completamente se houver limitações de joelho ou tornozelo, priorize qualidade sobre quantidade."
      },
      {
        name: "SEMANA 5-6: Flexão Tradicional no Solo",
        sets: 3,
        reps: "6-10",
        rest: "90s",
        instructions: "FLEXÃO COMPLETA NO SOLO: Progressão natural das semanas anteriores, agora executando o movimento tradicional completo. POSIÇÃO INICIAL: Apoio nas mãos (largura dos ombros) e pontas dos pés, corpo perfeitamente alinhado como uma tábua rígida da cabeça aos calcanhares. PREPARAÇÃO: Core maximamente contraído, glúteos ativados, escápulas estabilizadas, pescoço em posição neutra. EXECUÇÃO DESCIDA: Flexione cotovelos mantendo-os próximos ao corpo (ângulo de 45 graus com tronco), desça controladamente até peito quase tocar o solo, mantenha alinhamento corporal perfeito. EXECUÇÃO SUBIDA: Empurre o solo com força máxima, estenda completamente os cotovelos, mantenha tensão corporal durante todo movimento. RESPIRAÇÃO TÉCNICA: Inspiração profunda durante descida (2-3 segundos), expiração explosiva durante subida (1-2 segundos). MÚSCULOS PRIMÁRIOS: Peitoral maior, tríceps braquial, deltóide anterior. ESTABILIZADORES: Core completo, serrátil anterior, músculos profundos da coluna. PROGRESSÃO: Semana 5 (6-8 repetições), semana 6 (8-10 repetições). VARIAÇÕES: Se muito fácil, eleve os pés; se difícil, retorne à versão inclinada."
      },
      {
        name: "SEMANA 7-8: Agachamento Búlgaro Unilateral",
        sets: 3,
        reps: "6-8 cada perna",
        rest: "90-120s",
        instructions: "EXERCÍCIO AVANÇADO UNILATERAL: Versão mais desafiadora que trabalha cada perna independentemente, melhorando força, equilíbrio e corrigindo assimetrias. POSIÇÃO INICIAL: Fique de costas para um banco ou cadeira (60-90cm de distância), coloque o peito do pé traseiro apoiado na superfície, perna da frente firmemente plantada no solo. PREPARAÇÃO: 90% do peso na perna da frente, perna traseira apenas para apoio e equilíbrio, tronco ereto, core ativado. EXECUÇÃO: Desça flexionando principalmente o joelho da frente até formar 90 graus, joelho traseiro quase toca o solo, suba empurrando com calcanhar da perna da frente. RESPIRAÇÃO: Inspire na descida, expire na subida. FOCO: Glúteo e quadríceps da perna de apoio, estabilizadores do core e quadril. PROGRESSÃO: Semana 7 (6 reps cada perna, foco na técnica), semana 8 (8 reps cada perna, aumento da amplitude). BENEFÍCIOS: Correção de desequilíbrios musculares, melhora do equilíbrio unilateral, maior ativação dos glúteos, transferência para atividades funcionais. CUIDADOS: Inicie com amplitude menor, aumente gradualmente conforme mobilidade e força melhoram."
      },
      {
        name: "SEMANA 7-8: Flexão com Variações Avançadas",
        sets: 3,
        reps: "5-8",
        rest: "120s",
        instructions: "FLEXÕES AVANÇADAS PARA FINALIZAÇÃO DO CICLO: Implemente variações mais desafiadoras para consolidar ganhos e preparar para próximo nível. VARIAÇÃO 1 - FLEXÃO DIAMANTE: Mãos formam diamante com dedos, trabalha mais tríceps. VARIAÇÃO 2 - FLEXÃO ARCHER: Uma mão faz movimento completo, outra só apoia (alterna). VARIAÇÃO 3 - FLEXÃO COM PAUSA: 3 segundos na posição baixa. EXECUÇÃO TÉCNICA: Mantenha princípios básicos de todas flexões anteriores, adapte conforme variação escolhida, priorize sempre qualidade sobre quantidade. RESPIRAÇÃO: Padrão estabelecido (inspire descida, expire subida), adapte timing conforme variação. PROGRESSÃO INTELIGENTE: Semana 7 escolha uma variação e domine, semana 8 combine duas variações ou aumente dificuldade. MÚSCULOS: Dependendo da variação - peitoral, tríceps, deltóides, core como base sempre. OBJETIVO: Consolidar força desenvolvida, preparar para progressões futuras, manter motivação através de novos desafios. ADAPTAÇÃO: Se variações muito difíceis, retorne à flexão tradicional com mais repetições ou séries."
      },
      {
        name: "Alongamento Completo Progressivo por Semana",
        sets: 1,
        reps: "10-15 minutos",
        rest: "N/A",
        instructions: "PROTOCOLO DE ALONGAMENTO PROGRESSIVO POR FASE: SEMANAS 1-2 (Básico): Quadríceps em pé (30s cada), isquiotibiais sentado (30s cada), panturrilha na parede (30s cada), glúteos deitado (30s cada), peitoral na porta (30s), ombros cruzados (20s cada). SEMANAS 3-4 (Intermediário): Adicione rotação de quadril (8 cada direção), alongamento de iliopsoas em afundo (30s cada), torção espinhal deitado (30s cada lado), alongamento de tríceps (20s cada). SEMANAS 5-6 (Avançado): Inclua sequência de yoga: cão olhando para baixo (45s), cão olhando para cima (30s), posição da criança (45s), torção sentada (30s cada lado). SEMANAS 7-8 (Integrado): Combine movimentos fluidos, respiração profunda coordenada, foco em áreas mais tensas identificadas durante programa. RESPIRAÇÃO: Sempre profunda e relaxante, expire alongando mais. PRINCÍPIO: Nunca força excessiva, apenas tensão confortável, progressão gradual da flexibilidade. BENEFÍCIOS SEMANAIS: Melhora mobilidade, reduz tensão, acelera recuperação, prepara corpo para próxima sessão."
      }
    ],
    nutrition_tips: [
      "HIDRATAÇÃO PROGRESSIVA POR SEMANA: Semanas 1-2 estabeleça base de 35ml/kg peso corporal. Semanas 3-4 adicione 500ml extras dias de treino. Semanas 5-6 otimize timing (200ml 30min antes, pequenos goles durante, 300ml após). Semanas 7-8 personalize conforme suor e ambiente.",
      "TIMING PRÉ-TREINO EVOLUÍDO: Semanas 1-2 teste tolerância com banana ou aveia 1h antes. Semanas 3-4 refine quantidade (30-50g carboidratos). Semanas 5-6 adicione pequena quantidade proteína se treino > 60min. Semanas 7-8 protocolo personalizado baseado em energia e performance.",
      "RECUPERAÇÃO PÓS-TREINO OTIMIZADA: Semanas 1-2 foque em proteína básica (20-25g). Semanas 3-4 adicione carboidratos simples (banana, mel). Semanas 5-6 combine proteína + carboidrato + antioxidantes (frutas vermelhas). Semanas 7-8 ajuste proporções baseado em resultados e composição corporal.",
      "PROGRESSÃO CALÓRICA INTELIGENTE: Semanas 1-2 mantenha ingestão habitual, observe mudanças. Semanas 3-4 ajuste pequenos déficits/superávits (10-15%). Semanas 5-6 monitore energia e resultados, ajuste conforme necessário. Semanas 7-8 protocolo refinado para manter ganhos.",
      "MICRONUTRIENTES ESTRATÉGICOS: Foque em magnésio (recuperação muscular), vitamina D (força óssea), ômega-3 (inflamação), zinco (síntese proteica), vitamina C (colágeno). Inclua vegetais coloridos, frutas variadas, oleaginosas, peixes duas vezes por semana.",
      "SONO E RECUPERAÇÃO: 7-9h por noite, rotina consistente, ambiente escuro e fresco. Evite telas 1h antes dormir, considere chá de camomila, magnésio antes deitar se necessário."
    ]
  };
}
