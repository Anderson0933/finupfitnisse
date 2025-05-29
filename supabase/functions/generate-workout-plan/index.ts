
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
    console.log('Dados recebidos:', userProfile);

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

    // Criar prompt mais detalhado baseado no perfil do usuário
    const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em português com base nas seguintes informações:

Perfil do usuário:
- Idade: ${userProfile.age || 'Não informado'}
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- Nível de condicionamento: ${userProfile.fitness_level || 'Iniciante'}
- Objetivos: ${Array.isArray(userProfile.fitness_goals) ? userProfile.fitness_goals.join(', ') : 'Melhorar condicionamento geral'}
- Dias disponíveis: ${userProfile.available_days || 3} por semana
- Duração da sessão: ${userProfile.session_duration || 60} minutos

Retorne APENAS um JSON válido no seguinte formato:
{
  "title": "Nome do Plano de Treino",
  "description": "Descrição detalhada do plano",
  "difficulty_level": "iniciante",
  "duration_weeks": 8,
  "exercises": [
    {
      "name": "Nome do Exercício",
      "sets": 3,
      "reps": "12-15",
      "rest": "60s",
      "instructions": "Instruções detalhadas do exercício"
    }
  ],
  "nutrition_tips": ["Dica nutricional 1", "Dica nutricional 2", "Dica nutricional 3"]
}

IMPORTANTE: O campo difficulty_level deve ser exatamente uma dessas opções: "iniciante", "intermediario", "avancado"
Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.`;

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
      return 'intermediario';
    case 'muito_ativo':
      return 'avancado';
    default:
      return 'iniciante';
  }
}

function createFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'sedentario';
  const goals = Array.isArray(userProfile?.fitness_goals) ? userProfile.fitness_goals.join(' e ') : 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  
  return {
    title: `Plano de Treino ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)}`,
    description: `Plano personalizado focado em ${goals} para nível ${difficultyLevel}`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    exercises: [
      {
        name: "Aquecimento - Caminhada no Local",
        sets: 1,
        reps: "5 minutos",
        rest: "N/A",
        instructions: "Movimento suave para aquecer o corpo antes dos exercícios principais"
      },
      {
        name: "Agachamento",
        sets: 3,
        reps: level === 'sedentario' ? "8-10" : "12-15",
        rest: "60s",
        instructions: "Mantenha os pés na largura dos ombros, desça controladamente até formar 90 graus com os joelhos"
      },
      {
        name: "Flexão de Braço",
        sets: 3,
        reps: level === 'sedentario' ? "5-8" : "8-12",
        rest: "60s",
        instructions: "Se necessário, faça com os joelhos apoiados. Mantenha o corpo alinhado"
      },
      {
        name: "Prancha",
        sets: 3,
        reps: level === 'sedentario' ? "20-30s" : "30-60s",
        rest: "45s",
        instructions: "Mantenha o corpo reto, apoie nos antebraços e pontas dos pés, contraia o abdômen"
      },
      {
        name: "Alongamento Final",
        sets: 1,
        reps: "5-10 minutos",
        rest: "N/A",
        instructions: "Alongue todos os grupos musculares trabalhados, mantendo cada posição por 20-30 segundos"
      }
    ],
    nutrition_tips: [
      "Consuma proteína após o treino para recuperação muscular",
      "Mantenha-se bem hidratado durante todo o dia",
      "Inclua carboidratos complexos nas refeições pré-treino",
      "Consuma frutas e vegetais variados diariamente",
      "Evite alimentos processados e açúcares em excesso"
    ]
  };
}
