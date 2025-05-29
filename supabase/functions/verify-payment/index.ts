
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
    
    console.log('Verificando pagamento:', { paymentId, userId })
    
    if (!paymentId || !userId) {
      throw new Error('PaymentId e UserId são obrigatórios')
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Usar API de produção do Asaas
    const asaasApiKey = Deno.env.get('ASAAS_PROD_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas de produção não configurada')
    }

    // Primeiro, verificar se a assinatura existe no nosso banco
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('payment_id', paymentId)
      .eq('user_id', userId)
      .single()

    if (subError || !subscription) {
      console.error('Assinatura não encontrada:', subError)
      throw new Error('Assinatura não encontrada no banco de dados')
    }

    console.log('Assinatura encontrada:', subscription)

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

    console.log('Status do pagamento no Asaas:', paymentData.status, 'Pago:', isPaid)

    if (isPaid) {
      // Calcular nova data de expiração
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 dias a partir de agora

      console.log('Atualizando assinatura para ativa até:', expiresAt.toISOString())

      // Atualizar assinatura no banco
      const { data: updatedSub, error: updateError } = await supabaseClient
        .from('subscriptions')
        .update({
          status: 'active',
          expires_at: expiresAt.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', paymentId)
        .eq('user_id', userId)
        .select()

      if (updateError) {
        console.error('Erro ao atualizar assinatura:', updateError)
        throw new Error(`Erro ao ativar assinatura: ${updateError.message}`)
      }

      console.log('Assinatura atualizada com sucesso:', updatedSub)

      // Verificar se realmente foi atualizada
      const { data: verifyUpdate } = await supabaseClient
        .from('subscriptions')
        .select('*')
        .eq('payment_id', paymentId)
        .eq('user_id', userId)
        .single()

      console.log('Verificação da atualização:', verifyUpdate)
    }

    return new Response(
      JSON.stringify({ 
        paid: isPaid,
        status: paymentData.status,
        paymentId: paymentId,
        message: isPaid ? 'Pagamento confirmado e assinatura ativada!' : 'Pagamento ainda pendente'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro geral na verificação:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        paid: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
