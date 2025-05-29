
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

    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      console.error('GROK_API_KEY não configurada');
      throw new Error('GROK_API_KEY não configurada');
    }

    console.log('Chave Grok configurada, gerando prompt...');

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
  "difficulty_level": "iniciante|intermediário|avançado",
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

Importante: Retorne APENAS o JSON, sem texto adicional, sem markdown, sem explicações.`;

    console.log('Enviando requisição para Grok...');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.3,
      }),
    });

    console.log('Status da resposta Grok:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Grok:', response.status, errorText);
      
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
    console.log('Resposta recebida do Grok');

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
    const basicPlan = {
      title: "Plano Básico de Exercícios",
      description: "Plano básico para iniciantes focado em movimentos fundamentais",
      difficulty_level: "iniciante",
      duration_weeks: 4,
      exercises: [
        {
          name: "Caminhada",
          sets: 1,
          reps: "20-30 minutos",
          rest: "N/A",
          instructions: "Mantenha um ritmo confortável e constante"
        },
        {
          name: "Agachamento Simples",
          sets: 2,
          reps: "10-12",
          rest: "60s",
          instructions: "Desça controladamente mantendo as costas retas"
        },
        {
          name: "Flexão na Parede",
          sets: 2,
          reps: "8-10",
          rest: "60s",
          instructions: "Apoie as mãos na parede e empurre suavemente"
        }
      ],
      nutrition_tips: [
        "Beba pelo menos 2 litros de água por dia",
        "Inclua frutas e vegetais nas refeições",
        "Evite alimentos processados"
      ]
    };

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

function createFallbackPlan(userProfile: any) {
  const level = userProfile.fitness_level || 'iniciante';
  const goals = Array.isArray(userProfile.fitness_goals) ? userProfile.fitness_goals.join(' e ') : 'condicionamento geral';
  
  return {
    title: `Plano de Treino ${level.charAt(0).toUpperCase() + level.slice(1)}`,
    description: `Plano personalizado focado em ${goals} para nível ${level}`,
    difficulty_level: level,
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
