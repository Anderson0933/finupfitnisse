
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
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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

    console.log('✅ Chave Groq configurada, gerando prompt personalizado avançado...');

    // Mapear valores para português mais amigável
    const goalsMap = {
      'perder_peso': 'perder peso e queimar gordura corporal',
      'perda_peso': 'perder peso e queimar gordura corporal',
      'ganhar_massa': 'ganhar massa muscular e hipertrofia',
      'hipertrofia': 'ganhar massa muscular e hipertrofia',
      'tonificar': 'tonificar o corpo e definir músculos',
      'condicionamento': 'melhorar condicionamento cardiovascular',
      'forca': 'aumentar força e potência muscular',
      'flexibilidade': 'melhorar flexibilidade e mobilidade',
      'geral': 'condicionamento físico geral',
      'saude_geral': 'condicionamento físico geral'
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
      'iniciante': 'iniciante - alguma experiência básica com treinos',
      'moderado': 'moderadamente ativo - alguma experiência com treinos',
      'intermediario': 'intermediário - experiência regular com exercícios',
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
    const enhancedPrompt = `Você é um personal trainer certificado com 15 anos de experiência, especialista em fisiologia do exercício, biomecânica e periodização de treino. Sua missão é criar um plano de treino holístico e EXTREMAMENTE DETALHADO de 8 SEMANAS, totalmente personalizado para o indivíduo, com foco em segurança, eficácia e progressão contínua.

PERFIL COMPLETO DO ALUNO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- ${imcInfo}
- Nível de Condicionamento Atual: ${fitnessLevel}
- Objetivo Principal: ${goals}
- Dias Disponíveis para Treino: ${userProfile.available_days || 3} por semana
- Duração por Sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos Disponíveis: ${equipment}
- Limitações Físicas/Condições de Saúde: ${limitations}

INSTRUÇÕES DETALHADAS PARA A CRIAÇÃO DO PLANO DE TREINO (8 SEMANAS):

1. ESTRUTURA DE PERIODIZAÇÃO (8 SEMANAS):
   - Semanas 1-2 (Adaptação e Familiarização): Foco em volume baixo a moderado, aprendizado da técnica correta dos exercícios, e construção de uma base sólida. Priorize movimentos multiarticulares básicos.
   - Semanas 3-4 (Progressão Gradual): Aumento progressivo de volume (séries/repetições) e/ou intensidade (carga/dificuldade). Introduza variações de exercícios para estimular novos músculos.
   - Semanas 5-6 (Intensificação e Sobrecarga Progressiva): Volume moderado a alto, com foco em técnicas avançadas (ex: drop-sets, super-sets, pausas, cadência controlada) para maximizar a sobrecarga e o estímulo muscular.
   - Semanas 7-8 (Pico, Consolidação e Preparação): Refinamento da técnica, consolidação dos ganhos e preparação para o próximo ciclo de treino.

2. EXERCÍCIOS ESPECÍFICOS COM INSTRUÇÕES EXTREMAMENTE DETALHADAS:
   Para CADA exercício, forneça:
   - Nome do Exercício: Claro e conciso.
   - Músculos Alvo: Primários, secundários e estabilizadores envolvidos.
   - Posição Inicial Detalhada: Descreva a postura, alinhamento corporal, posicionamento dos pés/mãos, e pontos de referência para garantir a segurança e eficácia.
   - Execução Passo a Passo: Divida o movimento em fases (preparação, fase concêntrica, fase excêntrica, finalização), com descrições precisas de cada etapa.
   - Respiração: Indique o momento correto para inspirar e expirar durante o movimento.
   - Sinais de Execução Correta: O que o aluno deve sentir e observar para saber que está executando corretamente.
   - Erros Comuns a Evitar: Descreva os erros mais frequentes e como corrigi-los.
   - Variações/Progressões: Sugira como o exercício pode ser modificado para se tornar mais fácil ou mais difícil.

3. PRESCRIÇÃO DETALHADA POR SEMANA (Séries, Repetições, Carga, Descanso, Cadência):
   Para cada semana, especifique séries, repetições, carga/intensidade, tempo de descanso e cadência (tempo sob tensão).

4. AQUECIMENTO E RECUPERAÇÃO ESPECÍFICOS PARA CADA SESSÃO:
   - Aquecimento Pré-Treino (10-15 minutos): Mobilidade articular, ativação neuromuscular, aquecimento cardiovascular.
   - Alongamento Pós-Treino (5-10 minutos): Alongamentos estáticos para os grupos musculares trabalhados.
   - Estratégias de Recuperação: Sugestões para otimizar a recuperação entre as sessões.

5. DICAS DE NUTRIÇÃO E HIDRATAÇÃO (Gerais e Específicas para o Objetivo):
   - Hidratação, timing de refeições, macronutrientes, micronutrientes, suplementação opcional.

6. CONSIDERAÇÕES IMPORTANTES:
   - Escuta corporal, consistência, adaptação, progressão lógica.

RETORNE APENAS um JSON válido seguindo EXATAMENTE a estrutura fornecida, com sessions contendo exercícios extremamente detalhados para cada semana e dia de treino. O plano deve ter NO MÍNIMO ${Math.max(userProfile.available_days || 3, 3) * 8} exercícios diferentes distribuídos ao longo das 8 semanas, com progressão detalhada.

Use o campo difficulty_level como: "iniciante", "intermediario", ou "avancado".

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
            content: 'Você é um personal trainer certificado especialista em ciência do exercício com 15 anos de experiência. Crie planos de treino de 8 semanas extremamente detalhados e personalizados com progressão semanal específica seguindo exatamente o formato JSON solicitado.' 
          },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      
      console.log('📋 Usando plano de fallback avançado devido ao erro na API Groq');
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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
      console.log('⚠️ Conteúdo vazio da API Groq, usando fallback avançado');
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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
      if (!workoutPlan.title || !workoutPlan.sessions || !Array.isArray(workoutPlan.sessions)) {
        throw new Error('Estrutura do JSON inválida da API Groq');
      }

      // Adicionar flag indicando que veio da API Groq
      workoutPlan.source = 'groq_api_enhanced';
      workoutPlan.generated_for = {
        goals: goals,
        equipment: equipment,
        level: fitnessLevel,
        limitations: limitations,
        days: userProfile.available_days || 3,
        duration: userProfile.session_duration || 60
      };
      
      console.log('🎯 Plano personalizado avançado de 8 semanas gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback avançado
      console.log('📋 Usando plano de fallback avançado devido ao erro de parse');
      workoutPlan = createEnhancedFallbackPlan(userProfile);
    }

    console.log('🎉 Retornando plano final avançado de 8 semanas gerado pela API Groq');

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
    
    // Em caso de erro geral, retornar plano básico avançado
    const basicPlan = createEnhancedFallbackPlan(null);

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
    case 'iniciante':
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

function createEnhancedFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'sedentario';
  const goals = userProfile?.fitness_goals?.[0] || 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  
  // Mapear objetivos para descrição
  const goalsDescription = {
    'perder_peso': 'perda de peso e queima de gordura',
    'perda_peso': 'perda de peso e queima de gordura',
    'ganhar_massa': 'ganho de massa muscular',
    'hipertrofia': 'ganho de massa muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral',
    'saude_geral': 'condicionamento geral'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  
  return {
    title: `Plano de Treino Avançado 8 Semanas ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano de treino periodizado de 8 semanas, desenvolvido especificamente para ${goalDesc}, considerando ${userProfile?.limitations || 'nenhuma limitação'}, com ${userProfile?.available_days || 3} sessões semanais e utilizando ${userProfile?.equipment || 'peso corporal'}. Este plano detalhado inclui progressão semanal, instruções de exercícios com foco em biomecânica, aquecimento, recuperação e dicas nutricionais, adaptado ao perfil individual completo.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    source: 'enhanced_fallback',
    sessions: [
      {
        week_range: "Semanas 1-2",
        focus: "Adaptação e Familiarização",
        daily_workouts: [
          {
            day: "Dia 1",
            theme: "Treino de Força Total - Adaptação",
            warm_up: {
              duration: "12-15 minutos",
              exercises: [
                {
                  name: "Caminhada/Corrida Leve",
                  duration: "5 minutos",
                  notes: "Elevação gradual da frequência cardíaca de 50% para 60% da FC máxima. Mantenha ritmo confortável onde consiga conversar."
                },
                {
                  name: "Mobilidade de Quadril - Rotações",
                  sets: 2,
                  reps: "10 por lado",
                  notes: "Círculos amplos com a perna, mãos na cintura para equilíbrio. Foque na amplitude completa do movimento."
                },
                {
                  name: "Alongamento Dinâmico de Tronco",
                  sets: 2,
                  reps: "8 por lado",
                  notes: "Torções suaves do tronco com braços estendidos, mantendo quadris fixos."
                }
              ]
            },
            exercises: [
              {
                name: "Agachamento Livre (Bodyweight Squat)",
                muscles_targeted: "Primários: Quadríceps (reto femoral, vasto lateral, vasto medial, vasto intermédio), Glúteos (máximo, médio, mínimo). Secundários: Isquiotibiais (bíceps femoral, semitendinoso, semimembranoso), Adutores. Estabilizadores: Core (reto abdominal, oblíquos, transverso do abdômen), Eretores da espinha, Gastrocnêmio.",
                initial_position: "Posicione-se em pé com os pés na largura dos ombros, pontas dos pés levemente voltadas para fora (10-15 graus). Distribua o peso uniformemente em ambos os pés, com ligeira ênfase nos calcanhares. Mantenha a coluna em posição neutra, peito aberto, ombros relaxados e para trás. Olhar direcionado para frente ou ligeiramente para cima. Braços estendidos à frente na altura dos ombros para equilíbrio, ou cruzados no peito.",
                execution_steps: "1. PREPARAÇÃO: Ative o core contraindo o abdômen como se fosse receber um soco. Inspire profundamente. 2. FASE EXCÊNTRICA (Descida): Inicie o movimento flexionando simultaneamente os joelhos e o quadril, como se fosse sentar em uma cadeira imaginária atrás de você. Mantenha o peito aberto e a coluna reta, evitando curvar as costas. Desça controladamente até que as coxas fiquem paralelas ao chão (90 graus de flexão no joelho) ou o máximo que sua mobilidade permitir sem compensações. 3. POSIÇÃO INFERIOR: Mantenha os joelhos alinhados com as pontas dos pés, sem deixá-los cair para dentro (valgo) ou para fora (varo). O peso deve estar distribuído nos calcanhares e parte média dos pés. 4. FASE CONCÊNTRICA (Subida): Empurre o chão com os calcanhares, iniciando a subida pela extensão do quadril (ativação dos glúteos) seguida pela extensão dos joelhos. Mantenha o tronco ereto durante toda a subida. Expire durante esta fase. 5. FINALIZAÇÃO: Estenda completamente os joelhos e quadris, retornando à posição inicial sem hiperextender.",
                breathing: "INSPIRAÇÃO: Durante a fase de descida (excêntrica), inspire profundamente pelo nariz, expandindo o diafragma. RETENÇÃO: Mantenha o ar brevemente na posição mais baixa para estabilização do core. EXPIRAÇÃO: Expire pela boca durante a subida (concêntrica), contraindo o abdômen para auxiliar na estabilização.",
                correct_execution_signs: "Peso distribuído nos calcanhares e parte média dos pés (não na ponta). Joelhos alinhados com as pontas dos pés durante todo o movimento. Coluna mantém curvatura natural (neutra). Peito aberto e ombros para trás. Sensação de 'sentar para trás' na descida. Ativação clara dos glúteos na subida. Movimento fluido e controlado sem compensações.",
                common_errors: "Joelhos caindo para dentro (valgo dinâmico) - corrija fortalecendo glúteo médio e conscientização. Arredondamento da lombar (flexão excessiva) - melhore mobilidade de quadril e tornozelo. Peso transferido para a ponta dos pés - foque em 'sentar para trás'. Inclinação excessiva do tronco para frente - trabalhe mobilidade de tornozelo. Amplitude limitada - progressivamente aumente a descida conforme mobilidade melhora.",
                progression_variations: "REGRESSÃO: Agachamento com apoio em cadeira (sente e levante), agachamento com TRX ou faixa elástica para assistência. PROGRESSÃO: Agachamento com pausa (3s em baixo), agachamento sumô (pés mais afastados), agachamento búlgaro (unilateral), agachamento com salto (pliométrico).",
                sets: 3,
                reps: "10-12",
                rest: "60-90s",
                cadence: "2-1-2-0 (2s descida, 1s pausa, 2s subida, sem pausa no topo)"
              },
              {
                name: "Flexão de Braço (Push-up)",
                muscles_targeted: "Primários: Peitoral maior (porção clavicular e esternocostal), Deltóides anteriores, Tríceps braquial (cabeça longa, lateral e medial). Secundários: Serrátil anterior, Peitoral menor. Estabilizadores: Core (reto abdominal, oblíquos, transverso), Glúteos, Eretores da espinha, Deltóides posteriores.",
                initial_position: "Posicione-se em decúbito ventral (barriga para baixo). Coloque as mãos no chão, palmas apoiadas, dedos apontando para frente, posicionadas um pouco mais afastadas que a largura dos ombros. Para iniciantes: apoie os joelhos no chão. Para nível intermediário/avançado: apoie na ponta dos pés. Mantenha o corpo em linha reta da cabeça aos calcanhares (ou joelhos), sem deixar o quadril cair ou elevar excessivamente. Ombros posicionados diretamente acima das mãos. Core contraído para manter alinhamento corporal.",
                execution_steps: "1. PREPARAÇÃO: Comece com os braços estendidos, corpo alinhado, core ativado. Inspire profundamente. 2. FASE EXCÊNTRICA (Descida): Flexione os cotovelos simultaneamente, abaixando o peito em direção ao chão de forma controlada. Os cotovelos devem apontar ligeiramente para trás e para fora (aproximadamente 45 graus em relação ao corpo), não completamente para os lados. Mantenha o corpo rígido como uma tábua durante toda a descida. Desça até que o peito quase toque o chão (2-3cm de distância). 3. POSIÇÃO INFERIOR: Pause brevemente na posição mais baixa, mantendo tensão muscular. 4. FASE CONCÊNTRICA (Subida): Empurre o chão com as palmas das mãos, estendendo os cotovelos para retornar à posição inicial. Mantenha o alinhamento corporal durante toda a subida. Expire durante esta fase. 5. FINALIZAÇÃO: Estenda completamente os braços sem travar os cotovelos em hiperextensão.",
                breathing: "INSPIRAÇÃO: Durante a descida, inspire pelo nariz, expandindo a caixa torácica. RETENÇÃO: Mantenha o ar brevemente na posição inferior para estabilização. EXPIRAÇÃO: Expire pela boca durante a subida, contraindo o core.",
                correct_execution_signs: "Corpo mantido em linha reta sem 'quebrar' no quadril. Cotovelos em ângulo de aproximadamente 45 graus. Amplitude completa de movimento (peito próximo ao chão). Core constantemente ativado. Movimento controlado sem 'cair' na descida. Sensação de empurrar o chão na subida.",
                common_errors: "Quadril caindo (lordose excessiva) - fortaleça core e glúteos. Quadril muito elevado (posição de pique) - consciência corporal e prática. Cotovelos muito abertos (90 graus) - ajuste para 45 graus para proteger ombros. Amplitude limitada (não desce suficiente) - trabalhe flexibilidade e força. Movimento muito rápido - foque na cadência controlada.",
                progression_variations: "REGRESSÃO: Flexão na parede (vertical), flexão inclinada (mãos elevadas em banco), flexão com joelhos apoiados. PROGRESSÃO: Flexão declinada (pés elevados), flexão com uma mão, flexão com aplauso, flexão archer (unilateral).",
                sets: 3,
                reps: "8-10",
                rest: "60-90s",
                cadence: "2-1-2-0 (2s descida, 1s pausa, 2s subida, sem pausa no topo)"
              }
            ],
            cool_down: {
              duration: "8-10 minutos",
              exercises: [
                {
                  name: "Alongamento de Peitoral na Parede",
                  duration: "30s por lado",
                  notes: "Em pé, coloque a palma da mão na parede, braço estendido na altura do ombro. Gire o corpo para o lado oposto sentindo alongamento no peitoral."
                },
                {
                  name: "Alongamento de Quadríceps",
                  duration: "30s por lado",
                  notes: "Em pé, segure o tornozelo e puxe o calcanhar em direção ao glúteo. Mantenha joelhos alinhados e quadril neutro."
                }
              ]
            }
          },
          {
            day: "Dia 2",
            theme: "Treino de Resistência e Core - Adaptação",
            warm_up: {
              duration: "12-15 minutos",
              exercises: [
                {
                  name: "Marcha Estacionária",
                  duration: "4 minutos",
                  notes: "Elevação alternada dos joelhos, braços acompanhando o movimento. Progressivamente aumente a intensidade."
                },
                {
                  name: "Mobilidade de Ombros - Círculos",
                  sets: 2,
                  reps: "10 para frente e 10 para trás",
                  notes: "Braços estendidos lateralmente, círculos amplos e controlados."
                }
              ]
            },
            exercises: [
              {
                name: "Prancha (Plank)",
                muscles_targeted: "Primários: Reto abdominal, Transverso do abdômen, Oblíquos interno e externo. Secundários: Eretores da espinha, Multífidos. Estabilizadores: Deltóides anteriores, Serrátil anterior, Glúteos, Quadríceps.",
                initial_position: "Posicione-se em decúbito ventral. Apoie-se nos antebraços (cotovelos diretamente abaixo dos ombros) e pontas dos pés. Para iniciantes: pode apoiar nos joelhos. Antebraços paralelos, mãos espalmadas no chão ou punhos fechados. Corpo deve formar uma linha reta da cabeça aos calcanhares (ou joelhos).",
                execution_steps: "1. PREPARAÇÃO: Posicione-se corretamente, ative o core contraindo profundamente o abdômen. 2. MANUTENÇÃO: Mantenha a posição isométrica, respirando normalmente. Foque em manter o alinhamento corporal sem deixar o quadril cair ou subir. 3. ATIVAÇÃO CONTÍNUA: Mantenha glúteos contraídos, core ativado, e ombros estáveis. 4. RESPIRAÇÃO: Respire de forma controlada e ritmada durante toda a sustentação.",
                breathing: "RESPIRAÇÃO CONTÍNUA: Mantenha respiração ritmada e controlada. Não prenda a respiração. Inspire pelo nariz, expire pela boca.",
                correct_execution_signs: "Corpo em linha reta sem curvatura. Core constantemente ativado. Glúteos contraídos. Ombros estáveis e alinhados. Respiração controlada e ritmada.",
                common_errors: "Quadril caído (lordose) - ative mais os glúteos e core. Quadril elevado - conscientização do alinhamento. Ombros desalinhados - posicione cotovelos sob os ombros. Respiração irregular - pratique respiração ritmada.",
                progression_variations: "REGRESSÃO: Prancha com joelhos apoiados, prancha inclinada (mãos elevadas). PROGRESSÃO: Prancha com elevação de perna, prancha lateral, prancha com movimentos dinâmicos.",
                sets: 3,
                reps: "20-30s",
                rest: "45-60s",
                cadence: "Isométrico - manter posição"
              }
            ],
            cool_down: {
              duration: "8-10 minutos",
              exercises: [
                {
                  name: "Posição da Criança (Child's Pose)",
                  duration: "60s",
                  notes: "Ajoelhado, sente nos calcanhares e estenda braços à frente, alongando coluna e relaxando."
                }
              ]
            }
          }
        ]
      },
      {
        week_range: "Semanas 3-4",
        focus: "Progressão Gradual",
        daily_workouts: [
          {
            day: "Dia 1",
            theme: "Treino de Força - Progressão",
            warm_up: {
              duration: "12-15 minutos",
              exercises: [
                {
                  name: "Aquecimento Cardiovascular Progressivo",
                  duration: "6 minutos",
                  notes: "Comece leve e aumente gradualmente: caminhada (2min) → caminhada rápida (2min) → trote leve (2min)."
                },
                {
                  name: "Mobilidade Dinâmica Completa",
                  sets: 2,
                  reps: "8 de cada movimento",
                  notes: "Rotações de braços, leg swings, torções de tronco, círculos de quadril."
                }
              ]
            },
            exercises: [
              {
                name: "Agachamento com Pausa",
                muscles_targeted: "Primários: Quadríceps, Glúteos. Secundários: Isquiotibiais, Core. Estabilizadores: Panturrilhas, Eretores da espinha.",
                initial_position: "Mesma posição do agachamento básico, com foco adicional na estabilização durante a pausa.",
                execution_steps: "Execute o agachamento normal, mas adicione uma pausa de 3 segundos na posição mais baixa, mantendo toda a tensão muscular ativa.",
                breathing: "Inspire na descida, mantenha o ar durante a pausa, expire na subida.",
                correct_execution_signs: "Manutenção da posição sem relaxar, ativação constante dos músculos durante a pausa.",
                common_errors: "Relaxar a musculatura durante a pausa, perder alinhamento na posição baixa.",
                progression_variations: "Aumente o tempo de pausa para 5 segundos, adicione peso corporal ou implementos.",
                sets: 4,
                reps: "8-10",
                rest: "90s",
                cadence: "2-3-2-0 (2s descida, 3s pausa, 2s subida)"
              }
            ],
            cool_down: {
              duration: "10 minutos",
              exercises: [
                {
                  name: "Sequência de Alongamentos Dirigidos",
                  duration: "10 minutos",
                  notes: "Quadríceps (1min cada lado), isquiotibiais (1min cada lado), glúteos (1min cada lado), panturrilhas (1min cada lado), lombar (2min)."
                }
              ]
            }
          }
        ]
      }
    ],
    nutrition_and_hydration_tips: [
      "**Hidratação Essencial Personalizada:** Consuma 35-40ml de água por kg de peso corporal diariamente (ex: 70kg = 2,5L/dia). Nos dias de treino, adicione 500-750ml extras. Beba 200-300ml de água 30 minutos antes do treino para otimizar a hidratação celular.",
      "**Estratégia Pré-Treino Detalhada (1-2 horas antes):** Priorize carboidratos complexos de absorção moderada (30-50g): aveia com banana, batata-doce assada, pão integral com mel, ou frutas como maçã com aveia. Evite alimentos ricos em gordura e fibras 2h antes do treino para prevenir desconforto digestivo. Inclua uma pequena quantidade de proteína (10-15g) se o treino for intenso.",
      "**Janela Anabólica Pós-Treino (até 60 minutos após):** Foque na recuperação muscular e reposição de glicogênio. Combine proteínas de alta qualidade e aminoácidos essenciais (20-30g) com carboidratos de rápida absorção (30-40g). Opções ideais: whey protein com banana e mel, frango grelhado com arroz branco, iogurte grego com frutas vermelhas, ou vitamina de frutas com proteína.",
      "**Progressão Nutricional Semanal Detalhada:** Semanas 1-2: Estabeleça rotina alimentar consistente, identifique horários de fome e saciedade, introduza fontes saudáveis de macronutrientes. Semanas 3-4: Otimize timing das refeições pré e pós-treino, ajuste porções conforme demanda energética, monitore níveis de energia durante treinos. Semanas 5-6: Refine quantidades de macronutrientes baseado na resposta corporal, aumente proteínas para ganho de massa (2g/kg) ou ajuste carboidratos para perda de peso. Semanas 7-8: Personalize completamente a dieta, foque em alimentos densos nutricionalmente, considere ciclagem de carboidratos se apropriado.",
      "**Micronutrientes Essenciais para Performance:** Magnésio (400-500mg/dia) - crucial para contração muscular e recuperação, encontrado em folhas verdes, castanhas e sementes. Vitamina D (1000-2000 UI/dia) - fundamental para saúde óssea e força muscular, exposição solar ou suplementação. Ômega-3 (1-2g/dia) - reduz inflamação e acelera recuperação, presente em peixes gordos, linhaça e chia. Zinco (8-11mg/dia) - essencial para síntese proteica e função imunológica, carnes magras e leguminosas.",
      "**Gestão Energética Progressiva:** Semanas 1-4: Mantenha ingestão calórica que suporte adequadamente o nível de atividade física, evite déficits drásticos que comprometam performance. Monitore peso corporal semanalmente. Semanas 5-8: Para perda de peso, implemente déficit calórico moderado de 300-500 calorias/dia, mantendo alta ingestão proteica para preservar massa muscular. Para ganho de massa, crie superávit controlado de 200-400 calorias/dia, focando em alimentos nutritivos e evitando ganho excessivo de gordura."
    ],
    important_considerations: [
      "**Princípio da Escuta Corporal Ativa:** Desenvolva consciência corporal aguçada. Dor aguda, especialmente articular, não é normal e requer investigação médica. Diferencie entre desconforto muscular normal do exercício (queimação, fadiga) e dor potencialmente lesiva (aguda, cortante, persistente). Sempre priorize a técnica correta sobre carga ou intensidade.",
      "**Consistência Como Fundamento:** A aderência contínua ao plano é exponencialmente mais importante que intensidade esporádica. Pequenos progressos diários acumulam resultados transformadores. É melhor treinar 3x/semana consistentemente por 8 semanas do que alternar entre períodos intensos e sedentários.",
      "**Adaptação Inteligente e Flexibilidade:** Este plano é uma estrutura científica, não um dogma rígido. À medida que você evolui, suas necessidades mudarão. Esteja preparado para adaptar exercícios conforme limitações ou progressões, ajustar cargas baseado na recuperação, e modificar volume conforme capacidade de treino se desenvolve.",
      "**Progressão Lógica e Segura:** Todo aumento de carga, volume ou intensidade deve seguir o princípio da sobrecarga progressiva gradual. Aumentos de 5-10% semanais são ideais para força, enquanto volume pode aumentar 10-15%. Evite saltos drásticos que levam a lesões ou overtraining.",
      "**Recuperação Como Pilar Fundamental:** O treino é apenas o estímulo; a adaptação acontece na recuperação. Priorize 7-9 horas de sono de qualidade, mantenha níveis de estresse controlados, utilize técnicas de relaxamento como respiração diafragmática ou meditação. Considere massagem, liberação miofascial e banhos mornos para acelerar recuperação muscular."
    ]
  };
}
