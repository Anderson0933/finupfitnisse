
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
    const { userEmail, amount, userId, cpf } = await req.json()
    
    console.log('Dados recebidos:', { userEmail, amount, userId, cpf })
    
    if (!cpf) {
      throw new Error('CPF é obrigatório para gerar PIX')
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

    console.log('Criando/verificando cliente no Asaas...')

    // Primeiro, criar/verificar cliente no Asaas
    let customerId
    
    // Limpar CPF removendo caracteres especiais
    const cleanCpf = cpf.replace(/\D/g, '')
    console.log('CPF limpo:', cleanCpf)

    const customerResponse = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify({
        name: userEmail.split('@')[0],
        email: userEmail,
        cpfCnpj: cleanCpf,
        externalReference: userId
      })
    })

    const customerResponseText = await customerResponse.text()
    console.log('Resposta do cliente:', customerResponseText)

    let customerData
    if (customerResponse.ok) {
      customerData = JSON.parse(customerResponseText)
      customerId = customerData.id
      console.log('Cliente criado:', customerId)
    } else {
      // Se cliente já existe, buscar pelo email ou CPF
      const searchResponse = await fetch(`https://www.asaas.com/api/v3/customers?email=${userEmail}&cpfCnpj=${cleanCpf}`, {
        headers: {
          'access_token': asaasApiKey
        }
      })
      
      if (searchResponse.ok) {
        const searchData = await searchResponse.json()
        console.log('Busca de cliente:', searchData)
        if (searchData.data && searchData.data.length > 0) {
          customerId = searchData.data[0].id
          console.log('Cliente encontrado:', customerId)
        } else {
          throw new Error('Não foi possível criar ou encontrar cliente no Asaas')
        }
      } else {
        throw new Error('Erro ao buscar cliente existente no Asaas')
      }
    }

    if (!customerId) {
      throw new Error('ID do cliente não foi definido')
    }

    console.log('Criando cobrança PIX no Asaas (produção)...')

    // Criar cobrança PIX no Asaas (produção)
    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: amount,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 horas
      description: 'Assinatura FitAI Pro - Mensal',
      externalReference: userId
    }

    console.log('Payload do pagamento:', JSON.stringify(paymentPayload))

    const asaasResponse = await fetch('https://www.asaas.com/api/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'access_token': asaasApiKey
      },
      body: JSON.stringify(paymentPayload)
    })

    const asaasResponseText = await asaasResponse.text()
    console.log('Resposta do pagamento:', asaasResponseText)

    if (!asaasResponse.ok) {
      console.error('Erro na resposta do Asaas:', asaasResponseText)
      throw new Error(`Erro ao criar cobrança no Asaas: ${asaasResponseText}`)
    }

    const paymentData = JSON.parse(asaasResponseText)
    console.log('Dados do pagamento:', JSON.stringify(paymentData))

    // Verificar se temos os dados do PIX
    if (!paymentData.pixTransaction || !paymentData.pixTransaction.payload) {
      console.error('Dados do PIX não encontrados na resposta:', paymentData)
      throw new Error('Dados do PIX não foram gerados. Verifique a configuração do Asaas.')
    }

    console.log('Cobrança PIX criada com sucesso:', paymentData.id)

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

    const responseData = {
      paymentId: paymentData.id,
      pixCode: paymentData.pixTransaction?.payload || null,
      qrCodeImage: paymentData.pixTransaction?.qrCodeImage || null,
      expirationDate: paymentData.pixTransaction?.expirationDate || null
    }

    console.log('Resposta final:', JSON.stringify(responseData))

    return new Response(
      JSON.stringify(responseData),
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
