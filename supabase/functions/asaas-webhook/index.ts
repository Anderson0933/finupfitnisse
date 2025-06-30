
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
    const webhookData = await req.json()
    
    console.log('Webhook recebido do Asaas:', JSON.stringify(webhookData, null, 2))
    
    // Validar se é um evento de pagamento que nos interessa
    if (!webhookData.event || !['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'].includes(webhookData.event)) {
      console.log('Evento ignorado:', webhookData.event)
      return new Response(JSON.stringify({ message: 'Evento ignorado' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const paymentData = webhookData.payment
    if (!paymentData || !paymentData.id) {
      console.error('Dados de pagamento inválidos:', paymentData)
      return new Response(JSON.stringify({ error: 'Dados de pagamento inválidos' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Buscar assinatura pelo payment_id
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('payment_id', paymentData.id)
      .single()

    if (subError || !subscription) {
      console.error('Assinatura não encontrada para payment_id:', paymentData.id, subError)
      return new Response(JSON.stringify({ error: 'Assinatura não encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Verificar se já foi processado
    if (subscription.status === 'active') {
      console.log('Pagamento já processado anteriormente:', paymentData.id)
      return new Response(JSON.stringify({ message: 'Pagamento já processado' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Calcular nova data de expiração (30 dias a partir de agora)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    console.log('Ativando assinatura via webhook:', {
      subscriptionId: subscription.id,
      paymentId: paymentData.id,
      userId: subscription.user_id,
      expiresAt: expiresAt.toISOString()
    })

    // Atualizar assinatura para ativa
    const { data: updatedSub, error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({
        status: 'active',
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscription.id)
      .select()

    if (updateError) {
      console.error('Erro ao atualizar assinatura:', updateError)
      return new Response(JSON.stringify({ error: 'Erro ao ativar assinatura' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('Assinatura ativada com sucesso via webhook:', updatedSub)

    // Criar notificação para o usuário
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: subscription.user_id,
        title: 'Pagamento Confirmado!',
        message: 'Sua assinatura FitAI Pro foi ativada automaticamente. Aproveite todos os recursos!',
        type: 'success'
      })

    return new Response(JSON.stringify({ 
      message: 'Webhook processado com sucesso',
      subscriptionId: subscription.id,
      paymentId: paymentData.id,
      status: 'active'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Erro no webhook:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
