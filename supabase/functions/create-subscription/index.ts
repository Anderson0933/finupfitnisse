
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
    const { userEmail, amount, userId } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Usar API de produção do Asaas
    const asaasApiKey = Deno.env.get('ASAAS_PROD_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas de produção não configurada')
    }

    console.log('Criando cobrança PIX no Asaas (produção)...')

    // Criar cobrança PIX no Asaas (produção)
    const asaasResponse = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify({
        customer: userEmail,
        billingType: 'PIX',
        value: amount,
        dueDate: new Date().toISOString().split('T')[0],
        description: 'Assinatura FitAI Pro - Mensal',
        externalReference: userId
      })
    })

    if (!asaasResponse.ok) {
      const errorText = await asaasResponse.text()
      console.error('Erro na resposta do Asaas:', errorText)
      throw new Error('Erro ao criar cobrança no Asaas')
    }

    const paymentData = await asaasResponse.json()
    console.log('Cobrança criada com sucesso:', paymentData.id)

    // Salvar no banco de dados
    const { error } = await supabaseClient
      .from('subscriptions')
      .insert([{
        user_id: userId,
        payment_id: paymentData.id,
        amount: amount,
        status: 'pending'
      }])

    if (error) {
      console.error('Erro ao salvar no banco:', error)
      throw error
    }

    return new Response(
      JSON.stringify({
        paymentId: paymentData.id,
        pixCode: paymentData.pixTransaction?.payload,
        qrCodeImage: paymentData.pixTransaction?.qrCodeImage,
        expirationDate: paymentData.pixTransaction?.expirationDate
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
