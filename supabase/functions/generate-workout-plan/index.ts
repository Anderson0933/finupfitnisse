
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
    const { goal, experience, days, equipment } = await req.json();
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      throw new Error('GROK_API_KEY não configurada');
    }

    const prompt = `Você é um personal trainer experiente. Crie um plano de treino personalizado em português com base nas seguintes informações:

Objetivo: ${goal}
Experiência: ${experience}
Dias por semana: ${days}
Equipamentos disponíveis: ${equipment}

Retorne APENAS um JSON válido no seguinte formato:
{
  "name": "Nome do Plano",
  "description": "Descrição detalhada do plano",
  "difficulty_level": "iniciante|intermediário|avançado",
  "duration_weeks": 8,
  "exercises": [
    {
      "name": "Nome do Exercício",
      "sets": 3,
      "reps": "12-15",
      "rest": "60s",
      "instructions": "Instruções detalhadas"
    }
  ],
  "nutrition_tips": ["Dica 1", "Dica 2", "Dica 3"]
}`;

    console.log('Gerando plano de treino com Grok...');

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
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Grok:', errorText);
      throw new Error(`Erro da API Grok: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0]?.message?.content || '';

    // Limpar e extrair JSON da resposta
    content = content.trim();
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(content);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', content);
      
      // Plano de fallback
      workoutPlan = {
        name: "Plano de Treino Personalizado",
        description: `Plano focado em ${goal} para ${experience} com ${days} dias por semana`,
        difficulty_level: experience,
        duration_weeks: 8,
        exercises: [
          {
            name: "Agachamento",
            sets: 3,
            reps: "12-15",
            rest: "60s",
            instructions: "Mantenha os pés na largura dos ombros e desça até formar 90 graus com os joelhos"
          },
          {
            name: "Flexão de Braço",
            sets: 3,
            reps: "8-12",
            rest: "60s",
            instructions: "Mantenha o corpo alinhado e desça até o peito quase tocar o chão"
          }
        ],
        nutrition_tips: [
          "Consuma proteína após o treino",
          "Mantenha-se hidratado",
          "Inclua carboidratos complexos na dieta"
        ]
      };
    }

    return new Response(
      JSON.stringify({ workoutPlan }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Erro no generate-workout-plan:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
