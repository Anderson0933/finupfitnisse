
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

    // Criar prompt mais detalhado baseado no perfil do usuário
    const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em português com base nas seguintes informações:

Perfil do usuário:
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

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "Plano de Treino Personalizado",
  "description": "Descrição detalhada do plano considerando o perfil do usuário",
  "difficulty_level": "iniciante",
  "duration_weeks": 8,
  "exercises": [
    {
      "name": "Nome do Exercício",
      "sets": 3,
      "reps": "12-15",
      "rest": "60s",
      "instructions": "Instruções detalhadas e seguras do exercício"
    }
  ],
  "nutrition_tips": ["Dica nutricional 1", "Dica nutricional 2", "Dica nutricional 3"]
}

IMPORTANTE: 
- O campo difficulty_level deve ser exatamente uma dessas opções: "iniciante", "intermediario", "avancado"
- Inclua pelo menos 5-8 exercícios adequados ao nível e equipamentos
- As instruções devem ser claras e seguras
- Considere as limitações físicas mencionadas
- Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.`;

    console.log('Enviando requisição para Groq...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Mudando para um modelo disponível
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
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
    description: `Plano personalizado focado em ${goalDesc} para nível ${difficultyLevel}. Este treino foi desenvolvido considerando seu perfil e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    exercises: [
      {
        name: "Aquecimento - Caminhada no Local",
        sets: 1,
        reps: "5 minutos",
        rest: "N/A",
        instructions: "Movimento suave para aquecer o corpo antes dos exercícios principais. Mantenha um ritmo confortável."
      },
      {
        name: "Agachamento",
        sets: 3,
        reps: level === 'sedentario' ? "8-10" : "12-15",
        rest: "60s",
        instructions: "Mantenha os pés na largura dos ombros, desça controladamente até formar 90 graus com os joelhos. Mantenha o peito erguido e o peso nos calcanhares."
      },
      {
        name: "Flexão de Braço",
        sets: 3,
        reps: level === 'sedentario' ? "5-8" : "8-12",
        rest: "60s",
        instructions: "Se necessário, faça com os joelhos apoiados. Mantenha o corpo alinhado da cabeça aos pés. Desça até o peito quase tocar o chão."
      },
      {
        name: "Prancha",
        sets: 3,
        reps: level === 'sedentario' ? "20-30s" : "30-60s",
        rest: "45s",
        instructions: "Mantenha o corpo reto, apoie nos antebraços e pontas dos pés, contraia o abdômen. Respire normalmente durante o exercício."
      },
      {
        name: "Afundo",
        sets: 3,
        reps: level === 'sedentario' ? "6-8 cada perna" : "10-12 cada perna",
        rest: "60s",
        instructions: "Dê um passo à frente, desça até formar 90 graus em ambos os joelhos. Mantenha o tronco ereto e o peso distribuído."
      },
      {
        name: "Alongamento Final",
        sets: 1,
        reps: "5-10 minutos",
        rest: "N/A",
        instructions: "Alongue todos os grupos musculares trabalhados, mantendo cada posição por 20-30 segundos. Respire profundamente durante os alongamentos."
      }
    ],
    nutrition_tips: [
      "Consuma proteína após o treino para recuperação muscular (ovos, frango, peixe)",
      "Mantenha-se bem hidratado durante todo o dia (pelo menos 2L de água)",
      "Inclua carboidratos complexos nas refeições pré-treino (aveia, batata-doce)",
      "Consuma frutas e vegetais variados diariamente para vitaminas e minerais",
      "Evite alimentos processados e açúcares em excesso para melhores resultados"
    ]
  };
}
