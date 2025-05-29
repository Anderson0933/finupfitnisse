
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

    const asaasApiKey = Deno.env.get('ASAAS_API_KEY') || Deno.env.get('ASAAS_SANDBOX_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas não configurada')
    }

    // Verificar status do pagamento no Asaas
    const asaasResponse = await fetch(`https://sandbox.asaas.com/api/v3/payments/${paymentId}`, {
      headers: {
        'access_token': asaasApiKey
      }
    })

    if (!asaasResponse.ok) {
      throw new Error('Erro ao verificar pagamento no Asaas')
    }

    const paymentData = await asaasResponse.json()
    const isPaid = paymentData.status === 'RECEIVED' || paymentData.status === 'CONFIRMED'

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

      if (error) throw error
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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
