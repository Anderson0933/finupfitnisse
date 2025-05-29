
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
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Grok:', response.status, errorText);
      throw new Error(`Erro da API Grok: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Resposta recebida do Grok');

    let content = data.choices[0]?.message?.content || '';

    // Limpar e extrair JSON da resposta
    content = content.trim();
    
    // Remover possíveis marcadores de código
    if (content.startsWith('```json')) {
      content = content.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (content.startsWith('```')) {
      content = content.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(content);
      console.log('JSON parseado com sucesso');
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.log('Conteúdo recebido:', content);
      
      // Plano de fallback baseado no perfil do usuário
      workoutPlan = {
        title: `Plano de Treino ${userProfile.fitness_level || 'Personalizado'}`,
        description: `Plano focado em ${Array.isArray(userProfile.fitness_goals) ? userProfile.fitness_goals.join(' e ') : 'condicionamento geral'} para ${userProfile.fitness_level || 'iniciante'}`,
        difficulty_level: userProfile.fitness_level || 'iniciante',
        duration_weeks: 8,
        exercises: [
          {
            name: "Agachamento",
            sets: 3,
            reps: "12-15",
            rest: "60s",
            instructions: "Mantenha os pés na largura dos ombros, desça controladamente até formar 90 graus com os joelhos, mantenha o core contraído"
          },
          {
            name: "Flexão de Braço",
            sets: 3,
            reps: "8-12",
            rest: "60s",
            instructions: "Mantenha o corpo alinhado, desça até o peito quase tocar o chão, suba controladamente"
          },
          {
            name: "Prancha",
            sets: 3,
            reps: "30-60s",
            rest: "45s",
            instructions: "Mantenha o corpo reto, apoie nos antebraços e pontas dos pés, contraia o abdômen"
          }
        ],
        nutrition_tips: [
          "Consuma proteína após o treino para recuperação muscular",
          "Mantenha-se bem hidratado durante todo o dia",
          "Inclua carboidratos complexos nas refeições pré-treino",
          "Evite alimentos processados e açúcares em excesso"
        ]
      };
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
