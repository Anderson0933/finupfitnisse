
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
    const { userEmail, amount } = await req.json()
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Integração com Asaas API
    const asaasApiKey = Deno.env.get('ASAAS_API_KEY') || Deno.env.get('ASAAS_SANDBOX_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas não configurada')
    }

    // Criar cobrança PIX no Asaas
    const asaasResponse = await fetch('https://sandbox.asaas.com/api/v3/payments', {
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
        description: 'Assinatura FitAI Pro - Mensal'
      })
    })

    if (!asaasResponse.ok) {
      throw new Error('Erro ao criar cobrança no Asaas')
    }

    const paymentData = await asaasResponse.json()

    // Salvar no banco de dados
    const { error } = await supabaseClient
      .from('subscriptions')
      .insert([{
        user_id: (await supabaseClient.auth.getUser()).data.user?.id,
        payment_id: paymentData.id,
        amount: amount,
        status: 'pending'
      }])

    if (error) throw error

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
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
