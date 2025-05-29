
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
    console.log('Mensagem recebida:', message);
    
    const grokApiKey = Deno.env.get('GROK_API_KEY');

    if (!grokApiKey) {
      console.error('GROK_API_KEY não configurada');
      
      // Retornar resposta de fallback
      const fallbackResponse = "Olá! Sou seu assistente de fitness. No momento estou com problemas de configuração, mas posso te dar algumas dicas básicas:\n\n• Para perder peso: combine exercícios cardiovasculares com musculação\n• Para ganhar massa muscular: foque em exercícios de força com progressão de cargas\n• Para melhorar condicionamento: inclua HIIT e exercícios funcionais\n• Sempre aqueça antes dos treinos e alongue depois\n\nPor favor, tente novamente em alguns minutos.";
      
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
        content: 'Você é um assistente pessoal de fitness especializado em treinos, exercícios, técnicas e motivação. Responda sempre em português de forma clara, motivadora e prática. Dê conselhos específicos e úteis sobre exercícios, técnicas de treino, equipamentos e motivação.'
      },
      ...conversationHistory.slice(-10).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }))
    ];

    console.log('Enviando para Grok API...');

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

    console.log('Status da resposta Grok:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erro da API Grok:', errorText);
      
      // Retornar resposta de fallback mais específica baseada na mensagem do usuário
      let fallbackResponse = "Desculpe, estou com problemas técnicos no momento. ";
      
      if (message.toLowerCase().includes('treino') || message.toLowerCase().includes('exercício')) {
        fallbackResponse += "Sobre treinos: recomendo começar com 3-4 exercícios básicos como agachamento, flexão, prancha e caminhada. Faça 3 séries de 10-15 repetições com 60 segundos de descanso.";
      } else if (message.toLowerCase().includes('peso') || message.toLowerCase().includes('emagrecer')) {
        fallbackResponse += "Para perder peso: combine exercícios cardiovasculares (caminhada, corrida) com musculação. Mantenha uma alimentação equilibrada e crie um déficit calórico moderado.";
      } else if (message.toLowerCase().includes('massa') || message.toLowerCase().includes('músculo')) {
        fallbackResponse += "Para ganhar massa muscular: foque em exercícios compostos (agachamento, supino, remada), aumente progressivamente as cargas e mantenha uma alimentação rica em proteínas.";
      } else {
        fallbackResponse += "Posso te ajudar com dicas sobre treinos, exercícios, técnicas e motivação. Tente fazer uma pergunta mais específica e eu te darei conselhos práticos!";
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
    const assistantMessage = data.choices[0]?.message?.content || 'Desculpe, não consegui processar sua solicitação. Tente reformular sua pergunta.';

    console.log('Resposta processada com sucesso');

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
    console.error('Erro no chat-assistant:', error);
    
    const fallbackResponse = "Desculpe, ocorreu um erro inesperado. Sou seu assistente de fitness e posso te ajudar com:\n\n• Dicas de treino e exercícios\n• Técnicas de execução\n• Planejamento de rotinas\n• Motivação e consistência\n\nTente fazer sua pergunta novamente!";
    
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
