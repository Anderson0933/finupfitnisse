
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, conversationHistory } = await req.json()

    // Aqui você integraria com a API do Grok
    // Por enquanto, vou simular uma resposta básica
    
    const response = generateFitnessResponse(message, conversationHistory)

    return new Response(
      JSON.stringify({ message: response }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

function generateFitnessResponse(message: string, history: any[]) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('treino') || lowerMessage.includes('exercício')) {
    return `Ótima pergunta sobre treinos! Para te ajudar melhor, preciso saber:

• Qual é seu objetivo principal? (ganhar massa, perder peso, condicionamento)
• Quantos dias por semana você pode treinar?
• Tem acesso a academia ou prefere treinos em casa?

Com essas informações posso criar sugestões específicas para você! 💪`
  }

  if (lowerMessage.includes('dor') || lowerMessage.includes('lesão')) {
    return `⚠️ Se você está sentindo dor ou suspeita de lesão, é fundamental consultar um médico ou fisioterapeuta.

Algumas dicas gerais para prevenção:
• Sempre faça aquecimento antes do treino
• Mantenha boa forma nos exercícios
• Respeite os tempos de descanso
• Hidrate-se adequadamente

Posso te ajudar com exercícios de aquecimento e alongamento se quiser!`
  }

  if (lowerMessage.includes('alimentação') || lowerMessage.includes('dieta')) {
    return `Para orientações completas sobre alimentação, recomendo usar nosso assistente de nutrição específico na aba "Nutrição"!

Mas posso te dar algumas dicas básicas:
• Mantenha regularidade nas refeições
• Hidrate-se bem (2,5L+ de água/dia)
• Inclua proteínas em todas as refeições
• Não corte carboidratos completamente

Quer dicas específicas para pré ou pós-treino? 🍎`
  }

  if (lowerMessage.includes('motivação') || lowerMessage.includes('desânimo')) {
    return `Entendo que manter a motivação pode ser desafiador! Aqui estão algumas estratégias:

🎯 **Metas SMART**: Específicas, Mensuráveis, Atingíveis
📊 **Acompanhe progresso**: Use nossa aba de evolução
👥 **Encontre apoio**: Treinar com amigos ajuda
🎉 **Celebre pequenas vitórias**: Cada treino conta!
📱 **Rotina consistente**: Mesmo horário ajuda a criar hábito

Lembre-se: consistência vence perfeição. Que tal começarmos com um objetivo pequeno para hoje?`
  }

  return `Olá! Sou seu assistente de fitness e estou aqui para te ajudar! 

Posso te auxiliar com:
• Dúvidas sobre exercícios e técnicas
• Sugestões de treinos
• Dicas de motivação
• Orientações gerais sobre fitness

Como posso te ajudar hoje? 😊`
}
