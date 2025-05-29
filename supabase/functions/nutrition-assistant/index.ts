
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory } = await req.json();
    console.log('Mensagem de nutrição recebida:', message);
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      console.error('GROK_API_KEY não configurada');
      
      // Retornar resposta de fallback para nutrição
      const fallbackResponse = "Olá! Sou sua assistente de nutrição. No momento estou com problemas de configuração, mas posso te dar algumas dicas básicas:\n\n🥗 **Alimentação balanceada:**\n• Inclua proteínas em todas as refeições\n• Consuma 5-7 porções de frutas e vegetais por dia\n• Prefira carboidratos integrais\n• Mantenha-se hidratado (2-3L de água/dia)\n\n💡 **Dicas práticas:**\n• Faça 5-6 refeições menores ao dia\n• Evite alimentos ultraprocessados\n• Mastigue bem os alimentos\n\nPor favor, tente novamente em alguns minutos.";
      
      return new Response(
        JSON.stringify({ message: fallbackResponse }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Preparar mensagens para o Grok
    const messages: ChatMessage[] = [
      {
        role: 'assistant',
        content: 'Você é uma nutricionista especializada em alimentação saudável, planos alimentares, receitas e suplementação. Responda sempre em português de forma clara, prática e científica. Dê conselhos específicos sobre nutrição, receitas saudáveis, planejamento alimentar e orientações sobre suplementos quando apropriado.'
      },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Enviando para Grok API (nutrição)...');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'grok-beta',
        messages: messages,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    console.log('Status da resposta Grok (nutrição):', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Grok (nutrição):', errorText);
      
      // Retornar resposta de fallback específica baseada na mensagem
      let fallbackResponse = "Desculpe, estou com problemas técnicos no momento. ";
      
      if (message.toLowerCase().includes('receita') || message.toLowerCase().includes('cozinhar')) {
        fallbackResponse += "Sobre receitas: experimente saladas coloridas com proteína (frango, peixe, ovos), smoothies com frutas e vegetais verdes, ou pratos assados com temperos naturais.";
      } else if (message.toLowerCase().includes('peso') || message.toLowerCase().includes('emagrecer')) {
        fallbackResponse += "Para perder peso: crie um déficit calórico moderado, aumente o consumo de proteínas e fibras, reduza açúcares e faça refeições regulares.";
      } else if (message.toLowerCase().includes('músculo') || message.toLowerCase().includes('massa')) {
        fallbackResponse += "Para ganhar massa muscular: consuma 1,6-2,2g de proteína por kg de peso corporal, inclua carboidratos pós-treino e mantenha um superávit calórico controlado.";
      } else if (message.toLowerCase().includes('caloria')) {
        fallbackResponse += "Sobre calorias: para uma estimativa básica, use a fórmula: peso × 24 (para mulheres) ou peso × 26 (para homens), depois ajuste conforme atividade física.";
      } else {
        fallbackResponse += "Posso te ajudar com planejamento alimentar, receitas saudáveis, contagem de calorias e orientações nutricionais. Faça uma pergunta específica!";
      }
      
      return new Response(
        JSON.stringify({ message: fallbackResponse }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação sobre nutrição. Tente reformular sua pergunta.';

    console.log('Resposta de nutrição processada com sucesso');

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('Erro no nutrition-assistant:', error);
    
    const fallbackResponse = "Desculpe, ocorreu um erro inesperado. Sou sua assistente de nutrição e posso te ajudar com:\n\n🥗 Planejamento alimentar\n🍎 Receitas saudáveis\n📊 Contagem de calorias e macros\n💊 Orientações sobre suplementação\n🎯 Estratégias para objetivos específicos\n\nTente fazer sua pergunta novamente!";
    
    return new Response(
      JSON.stringify({ message: fallbackResponse }),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});
