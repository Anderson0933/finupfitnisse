
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
    const { userId, subscriptionId } = await req.json()
    
    console.log('Processando conversão de afiliado:', { userId, subscriptionId })
    
    if (!userId || !subscriptionId) {
      throw new Error('UserId e SubscriptionId são obrigatórios')
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Chamar a função para processar conversão de referência
    const { error } = await supabaseClient.rpc('process_referral_conversion', {
      p_referred_user_id: userId,
      p_subscription_id: subscriptionId
    })

    if (error) {
      console.error('Erro ao processar conversão:', error)
      throw error
    }

    console.log('Conversão de afiliado processada com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Conversão processada com sucesso'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Erro geral:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
