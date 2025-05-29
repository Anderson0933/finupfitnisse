
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { paymentId, userId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Usar API de produção do Asaas
    const asaasApiKey = Deno.env.get('ASAAS_PROD_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas de produção não configurada')
    }

    console.log('Verificando pagamento no Asaas (produção):', paymentId)

    // Verificar status do pagamento no Asaas (produção)
    const asaasResponse = await fetch(`https://www.asaas.com/api/v3/payments/${paymentId}`, {
      headers: {
        'access_token': asaasApiKey
      }
    })

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text()
      console.error('Erro na resposta do Asaas:', errorText)
      throw new Error('Erro ao verificar pagamento no Asaas')
    }

    const paymentData = await asaasResponse.json()
    const isPaid = paymentData.status === 'RECEIVED' || paymentData.status === 'CONFIRMED'

    console.log('Status do pagamento:', paymentData.status, 'Pago:', isPaid)

    if (isPaid) {
      // Atualizar assinatura no banco
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // Adicionar 1 mês

      const { error } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          expires_at: expiresAt.toISOString()
        })
        .eq('payment_id', paymentId)
        .eq('user_id', userId)

      if (error) {
        console.error('Erro ao atualizar assinatura:', error)
        throw error
      }

      console.log('Assinatura ativada com sucesso para o usuário:', userId)
    }

    return new Response(
      JSON.stringify({ 
        paid: isPaid,
        status: paymentData.status 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
