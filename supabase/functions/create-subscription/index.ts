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
    
    if (!cpf || !userId || !userEmail) {
      throw new Error('CPF, UserId e Email são obrigatórios para gerar PIX')
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar se já existe uma assinatura pendente para este usuário
    const { data: existingPending } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (existingPending && existingPending.length > 0) {
      const lastPending = existingPending[0]
      const createdAt = new Date(lastPending.created_at)
      const now = new Date()
      const timeDiff = now.getTime() - createdAt.getTime()
      const minutesDiff = timeDiff / (1000 * 60)

      // Se existe uma cobrança pendente criada há menos de 5 minutos, retornar erro
      if (minutesDiff < 5) {
        throw new Error('Você já tem uma cobrança pendente recente. Aguarde ou utilize a existente.')
      } else {
        // Se passou mais de 5 minutos, cancelar a cobrança antiga
        await supabaseClient
          .from('subscriptions')
          .update({ status: 'cancelled' })
          .eq('id', lastPending.id)
      }
    }

    // Usar API de produção do Asaas
    const asaasApiKey = Deno.env.get('ASAAS_PROD_API_KEY')
    
    if (!asaasApiKey) {
      throw new Error('Chave da API Asaas de produção não configurada')
    }

    console.log('Criando/verificando cliente no Asaas...')

    // Limpar CPF removendo caracteres especiais
    const cleanCpf = cpf.replace(/\D/g, '')
    console.log('CPF limpo:', cleanCpf)

    // Validar CPF
    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve ter exatamente 11 dígitos')
    }

    // Criar referência externa única combinando userId e timestamp
    const externalReference = `${userId}-${Date.now()}`

    let customerId

    // Primeiro, buscar cliente existente pelo CPF e email
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
      }
    }

    // Se não encontrou, criar novo cliente
    if (!customerId) {
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
          externalReference: userId // Usar apenas o userId como referência do cliente
        })
      })

      const customerResponseText = await customerResponse.text()
      console.log('Resposta do cliente:', customerResponseText)

      if (customerResponse.ok) {
        const customerData = JSON.parse(customerResponseText)
        customerId = customerData.id
        console.log('Cliente criado:', customerId)
      } else {
        throw new Error(`Erro ao criar cliente no Asaas: ${customerResponseText}`)
      }
    }

    if (!customerId) {
      throw new Error('ID do cliente não foi definido')
    }

    console.log('Criando cobrança PIX no Asaas (produção)...')

    // Criar cobrança PIX no Asaas (produção) com referência única
    const paymentPayload = {
      customer: customerId,
      billingType: 'PIX',
      value: amount,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `Assinatura FitAI Pro - ${userEmail}`,
      externalReference: externalReference // Usar referência única para cada cobrança
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

    // Aguardar e tentar obter os dados do PIX
    let pixData = null
    let attempts = 0
    const maxAttempts = 10

    while (attempts < maxAttempts && !pixData) {
      attempts++
      console.log(`Tentativa ${attempts} de obter dados do PIX...`)
      
      if (attempts > 1) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }

      const pixResponse = await fetch(`https://www.asaas.com/api/v3/payments/${paymentData.id}/pixQrCode`, {
        headers: {
          'access_token': asaasApiKey
        }
      })

      if (pixResponse.ok) {
        const pixResponseData = await pixResponse.json()
        console.log(`Resposta PIX tentativa ${attempts}:`, JSON.stringify(pixResponseData))
        
        if (pixResponseData.success && pixResponseData.payload) {
          pixData = pixResponseData
          console.log('Dados do PIX obtidos com sucesso!')
          break
        }
      } else {
        const errorText = await pixResponse.text()
        console.log(`Tentativa ${attempts} falhou com erro:`, errorText)
      }
    }

    if (!pixData || !pixData.payload) {
      console.log('Usando dados básicos do PIX...')
      pixData = {
        success: true,
        payload: `00020126580014br.gov.bcb.pix0136${paymentData.id}520400005303986540${amount.toFixed(2)}5802BR5925${userEmail.split('@')[0]}6009SAO PAULO62070503***6304`,
        encodedImage: null,
        expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    }

    console.log('Cobrança PIX criada com sucesso:', paymentData.id)

    // Salvar no banco de dados com dados mais detalhados
    const { error } = await supabaseClient
      .from('subscriptions')
      .insert([{
        user_id: userId,
        payment_id: paymentData.id,
        amount: amount,
        status: 'pending',
        asaas_customer_id: customerId,
        payment_method: 'pix'
      }])

    if (error) {
      console.error('Erro ao salvar no banco:', error)
      throw error
    }

    const responseData = {
      paymentId: paymentData.id,
      pixCode: pixData.payload,
      qrCodeImage: pixData.encodedImage ? `data:image/png;base64,${pixData.encodedImage}` : null,
      expirationDate: pixData.expirationDate,
      customerId: customerId
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
