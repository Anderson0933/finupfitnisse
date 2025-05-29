
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
    
    const response = generateNutritionResponse(message, conversationHistory)

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

function generateNutritionResponse(message: string, history: any[]) {
  const lowerMessage = message.toLowerCase()

  if (lowerMessage.includes('calorias') || lowerMessage.includes('calórica')) {
    return `Para calcular suas calorias diárias, uso a fórmula de Harris-Benedict:

**Homens**: TMB = 88,362 + (13,397 × peso) + (4,799 × altura) - (5,677 × idade)
**Mulheres**: TMB = 447,593 + (9,247 × peso) + (3,098 × altura) - (4,330 × idade)

Depois multiplicamos pelo nível de atividade:
• Sedentário: TMB × 1,2
• Pouco ativo: TMB × 1,375
• Moderado: TMB × 1,55
• Ativo: TMB × 1,725
• Muito ativo: TMB × 1,9

Quer que eu calcule para você? Me diga seu peso, altura, idade e nível de atividade! 📊`
  }

  if (lowerMessage.includes('café da manhã') || lowerMessage.includes('manhã')) {
    return `Ótimas opções para café da manhã saudável:

🥣 **Opção 1**: Aveia + banana + pasta de amendoim + canela
🍳 **Opção 2**: Ovos mexidos + abacate + pão integral
🥤 **Opção 3**: Smoothie (banana + whey + aveia + leite)
🧀 **Opção 4**: Iogurte grego + frutas vermelhas + granola

**Dicas importantes:**
• Inclua sempre uma fonte de proteína
• Carboidratos complexos dão energia duradoura
• Gorduras boas (abacate, oleaginosas) saciam mais

Qual dessas opções te interessou mais? Posso dar a receita detalhada! 🍳`
  }

  if (lowerMessage.includes('massa muscular') || lowerMessage.includes('músculo')) {
    return `Para ganhar massa muscular, foque em:

🥩 **Proteínas** (1,6-2,2g/kg peso):
• Carnes magras, peixes, ovos
• Whey protein, caseína
• Feijão, lentilha, quinoa

🍚 **Carboidratos** (4-6g/kg peso):
• Arroz integral, batata doce
• Aveia, quinoa, frutas

🥑 **Gorduras boas** (0,8-1,2g/kg peso):
• Abacate, oleaginosas, azeite
• Salmão, sardinha

⚡ **Timing importante**:
• Pré-treino: carboidrato + pouca proteína
• Pós-treino: proteína + carboidrato (janela de 30-60min)

Quer um exemplo de plano alimentar para ganho de massa? 💪`
  }

  if (lowerMessage.includes('perder peso') || lowerMessage.includes('emagrecer')) {
    return `Para perder peso de forma saudável:

📉 **Déficit Calórico**: 300-500 calorias/dia
• Queima 1kg de gordura por semana
• Sustentável a longo prazo

🥗 **Estratégias eficazes**:
• Aumente proteínas (saciedade + massa muscular)
• Priorize alimentos integrais
• Beba água antes das refeições
• Coma devagar e mastigue bem

🚫 **Evite**:
• Dietas muito restritivas
• Cortar grupos alimentares
• Pular refeições

⏰ **Jejum intermitente** pode ajudar:
• 16:8 (16h jejum, 8h alimentação)
• Sempre com orientação

Quer que eu monte um exemplo de cardápio para emagrecimento? 🎯`
  }

  if (lowerMessage.includes('receita') || lowerMessage.includes('como fazer')) {
    return `Aqui estão algumas receitas práticas e saudáveis:

🥤 **Smoothie Proteico**:
• 1 banana madura
• 1 dose whey protein
• 200ml leite (ou vegetal)
• 1 colher aveia
• Gelo a gosto

🍳 **Omelete Nutritiva**:
• 2-3 ovos
• Espinafre, tomate, cebola
• Queijo cottage
• Azeite para refogar

🥗 **Salada Completa**:
• Mix de folhas
• Grão de bico ou frango
• Abacate, tomate cereja
• Azeite + limão

Qual receita te interessou? Posso dar mais detalhes ou sugerir variações! 👨‍🍳`
  }

  if (lowerMessage.includes('pré-treino') || lowerMessage.includes('pre treino')) {
    return `Lanches ideais pré-treino (30-60min antes):

⚡ **Energia rápida**:
• Banana + mel
• Tapioca com geleia
• Água de coco

🔋 **Energia duradoura**:
• Aveia + frutas
• Pão integral + pasta de amendoim
• Iogurte + granola

💡 **Dicas importantes**:
• Evite muita fibra (pode causar desconforto)
• Hidrate-se bem
• Se treino for longo (>1h), inclua carboidrato

☕ **Cafeína natural**:
• Café preto 30min antes
• Chá verde
• Aumenta performance e queima de gordura

Que tipo de treino você vai fazer? Posso ajustar a sugestão! 🏃‍♂️`
  }

  return `Olá! Sou sua nutricionista virtual! 🥗

Posso te ajudar com:
• Cálculo de calorias e macronutrientes
• Planos alimentares personalizados  
• Receitas saudáveis e práticas
• Dicas de alimentação pré e pós-treino
• Orientações para ganho de massa ou perda de peso
• Sugestões de suplementação

Como posso te ajudar hoje com sua alimentação? 😊`
}
