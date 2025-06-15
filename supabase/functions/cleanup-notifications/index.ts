
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calcular data de 30 dias atrás
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    console.log(`Iniciando limpeza de notificações anteriores a: ${thirtyDaysAgo.toISOString()}`)

    // Deletar notificações antigas
    const { data, error, count } = await supabase
      .from('notifications')
      .delete({ count: 'exact' })
      .lt('created_at', thirtyDaysAgo.toISOString())

    if (error) {
      console.error('Erro ao limpar notificações:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao limpar notificações' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const deletedCount = count || 0
    console.log(`Limpeza concluída. ${deletedCount} notificações removidas.`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        deletedCount,
        cleanupDate: thirtyDaysAgo.toISOString()
      }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro inesperado:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
