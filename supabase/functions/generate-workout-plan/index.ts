
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
    const { userProfile } = await req.json()

    // Aqui você integraria com a API do Grok
    // Por enquanto, vou criar um plano básico baseado nos dados do usuário
    
    const workoutPlan = generateBasicWorkoutPlan(userProfile)

    return new Response(
      JSON.stringify(workoutPlan),
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

function generateBasicWorkoutPlan(userProfile: any) {
  const difficultyLevel = getDifficultyLevel(userProfile.fitness_level)
  const exercises = generateExercises(userProfile)
  
  return {
    title: `Plano Personalizado - ${difficultyLevel}`,
    description: `Plano de treino ${difficultyLevel.toLowerCase()} focado em ${userProfile.fitness_goals.join(', ')}`,
    difficulty_level: difficultyLevel.toLowerCase(),
    duration_weeks: 8,
    exercises: exercises,
    nutrition_tips: generateNutritionTips(userProfile.fitness_goals)
  }
}

function getDifficultyLevel(fitnessLevel: string) {
  switch (fitnessLevel) {
    case 'sedentario':
    case 'pouco_ativo':
      return 'Iniciante'
    case 'moderado':
    case 'ativo':
      return 'Intermediário'
    case 'muito_ativo':
      return 'Avançado'
    default:
      return 'Iniciante'
  }
}

function generateExercises(userProfile: any) {
  const baseExercises = [
    {
      name: "Agachamento",
      sets: 3,
      reps: "12-15",
      rest: "60s",
      instructions: "Mantenha os pés na largura dos ombros, desça até formar 90 graus com os joelhos"
    },
    {
      name: "Flexão de braço",
      sets: 3,
      reps: "8-12",
      rest: "60s",
      instructions: "Mantenha o corpo alinhado, desça até o peito quase tocar o chão"
    },
    {
      name: "Prancha",
      sets: 3,
      reps: "30-60s",
      rest: "60s",
      instructions: "Mantenha o corpo reto, apoiado nos antebraços e pontas dos pés"
    }
  ]

  // Adicionar exercícios específicos baseados nos objetivos
  if (userProfile.fitness_goals.includes('Ganhar massa muscular')) {
    baseExercises.push({
      name: "Levantamento terra",
      sets: 4,
      reps: "6-8",
      rest: "90s",
      instructions: "Mantenha as costas retas, levante a barra até a posição ereta"
    })
  }

  if (userProfile.fitness_goals.includes('Perder peso')) {
    baseExercises.push({
      name: "Burpees",
      sets: 3,
      reps: "10-15",
      rest: "45s",
      instructions: "Movimento completo: agachamento, prancha, flexão, salto"
    })
  }

  return baseExercises
}

function generateNutritionTips(goals: string[]) {
  const tips = []

  if (goals.includes('Perder peso')) {
    tips.push("Mantenha um déficit calórico de 300-500 calorias por dia")
    tips.push("Aumente o consumo de proteínas para manter a massa muscular")
  }

  if (goals.includes('Ganhar massa muscular')) {
    tips.push("Consuma 1,6-2,2g de proteína por kg de peso corporal")
    tips.push("Mantenha um pequeno superávit calórico de 200-400 calorias")
  }

  tips.push("Beba pelo menos 2,5L de água por dia")
  tips.push("Coma vegetais e frutas em todas as refeições")

  return tips
}
