import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userProfile } = await req.json();
    console.log('🚀 Dados recebidos na API:', userProfile);

    const groqApiKey = Deno.env.get('GROQ_API_KEY');

    if (!groqApiKey || groqApiKey.trim() === '') {
      console.error('❌ GROQ_API_KEY não configurada ou vazia');
      console.log('📋 Usando plano de fallback devido à chave não configurada');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    console.log('✅ Chave Groq configurada, gerando prompt personalizado...');

    // ... keep existing code (mapping objects for goals, equipment, limitations, fitness level)

    const goalsMap = {
      'perder_peso': 'perder peso e queimar gordura corporal',
      'ganhar_massa': 'ganhar massa muscular e hipertrofia',
      'tonificar': 'tonificar o corpo e definir músculos',
      'condicionamento': 'melhorar condicionamento cardiovascular',
      'forca': 'aumentar força e potência muscular',
      'flexibilidade': 'melhorar flexibilidade e mobilidade',
      'geral': 'condicionamento físico geral',
      'hipertrofia': 'ganhar massa muscular e hipertrofia'
    };

    const equipmentMap = {
      'academia_completa': 'academia completa com halteres, barras, máquinas de musculação, esteiras e equipamentos de cardio',
      'casa_halteres': 'treino em casa com halteres, barras, elásticos e equipamentos básicos',
      'casa_basico': 'treino em casa com equipamentos básicos limitados',
      'peso_corporal': 'exercícios usando apenas o peso corporal, sem equipamentos',
      'parque': 'exercícios ao ar livre em parques com barras e equipamentos públicos'
    };

    const limitationsMap = {
      'nenhuma': 'nenhuma limitação física',
      'joelho': 'problemas no joelho - evitar impacto e sobrecarga',
      'costas': 'problemas nas costas - foco em fortalecimento do core',
      'ombro': 'problemas no ombro - evitar movimentos overhead',
      'tornozelo': 'problemas no tornozelo - exercícios de baixo impacto',
      'cardiaco': 'problemas cardíacos - intensidade moderada controlada',
      'outros': 'outras limitações físicas específicas'
    };

    const fitnessLevelMap = {
      'sedentario': 'sedentário - iniciante absoluto sem experiência em exercícios',
      'pouco_ativo': 'pouco ativo - experiência limitada com exercícios',
      'moderado': 'moderadamente ativo - alguma experiência com treinos',
      'ativo': 'ativo - experiência regular com exercícios',
      'muito_ativo': 'muito ativo - experiência avançada em treinamento',
      'avancado': 'atlético avançado - alto nível de condicionamento',
      'iniciante': 'iniciante - pouca experiência em treinamento'
    };

    const goals = goalsMap[userProfile.fitness_goals?.[0]] || userProfile.fitness_goals?.[0] || 'melhorar condicionamento geral';
    const equipment = equipmentMap[userProfile.equipment] || userProfile.equipment || 'equipamentos básicos';
    const limitations = limitationsMap[userProfile.limitations] || userProfile.limitations || 'nenhuma limitação';
    const fitnessLevel = fitnessLevelMap[userProfile.fitness_level] || userProfile.fitness_level || 'iniciante';
    const availableDays = userProfile.available_days || 3;

    // Calcular IMC para personalização adicional
    let imcInfo = '';
    if (userProfile.height && userProfile.weight) {
      const heightInMeters = userProfile.height / 100;
      const imc = userProfile.weight / (heightInMeters * heightInMeters);
      imcInfo = `IMC: ${imc.toFixed(1)} - `;
      if (imc < 18.5) imcInfo += 'Abaixo do peso - foco em ganho de massa e força';
      else if (imc < 25) imcInfo += 'Peso normal - manutenção e tonificação';
      else if (imc < 30) imcInfo += 'Sobrepeso - foco em queima de gordura';
      else imcInfo += 'Obesidade - exercícios de baixo impacto e queima calórica';
    }

    // Definir estrutura clara dos dias da semana baseada nos dias disponíveis
    const dayStructure = getDayStructure(availableDays);

    // Criar prompt super detalhado e personalizado
    const prompt = `Você é um renomado personal trainer certificado com 15 anos de experiência em treinamento personalizado. Crie um plano de treino EXTREMAMENTE DETALHADO, ESPECÍFICO e PERSONALIZADO em português baseado no perfil completo abaixo:

PERFIL COMPLETO DO ALUNO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- ${imcInfo}
- Nível atual: ${fitnessLevel}
- Objetivo principal: ${goals}
- Dias disponíveis: ${availableDays} por semana
- Duração por sessão: ${userProfile.session_duration || 60} minutos
- Equipamentos disponíveis: ${equipment}
- Limitações físicas: ${limitations}

ESTRUTURA OBRIGATÓRIA DOS DIAS:
${dayStructure.map((day, index) => `Treino ${index + 1}: ${day}`).join('\n')}

INSTRUÇÕES CRÍTICAS PARA ESTRUTURA DO TREINO:

1. NOMENCLATURA OBRIGATÓRIA DOS EXERCÍCIOS (USE EXATAMENTE ESTA ESTRUTURA):
   - "Semana 1 - ${dayStructure[0]}: [Nome do Exercício]"
   - "Semana 1 - ${dayStructure[1]}: [Nome do Exercício]"
   ${availableDays >= 3 ? `- "Semana 1 - ${dayStructure[2]}: [Nome do Exercício]"` : ''}
   ${availableDays >= 4 ? `- "Semana 1 - ${dayStructure[3]}: [Nome do Exercício]"` : ''}
   ${availableDays >= 5 ? `- "Semana 1 - ${dayStructure[4]}: [Nome do Exercício]"` : ''}
   
   Continue para todas as 12 semanas:
   - "Semana 2 - ${dayStructure[0]}: [Nome do Exercício]"
   - "Semana 3 - ${dayStructure[0]}: [Nome do Exercício]"
   - Até "Semana 12 - ${dayStructure[availableDays-1]}: [Nome do Exercício]"

2. DISTRIBUIÇÃO DOS TREINOS:
   - CADA SEMANA DEVE TER EXATAMENTE ${availableDays} TREINOS
   - Total: ${availableDays * 12} exercícios (${availableDays} treinos x 12 semanas)
   - JAMAIS deixe uma semana com menos treinos que o solicitado

3. EXERCÍCIOS ESPECÍFICOS:
   - Escolha exercícios que maximizem o objetivo: ${goals}
   - Inclua variações progressivas e regressivas
   - Especifique técnica de execução biomecânica detalhada
   - Adicione músculos primários e secundários trabalhados

4. PRESCRIÇÃO DETALHADA:
   - Séries, repetições e descanso específicos por semana
   - Percentual de carga ou percepção de esforço
   - Progressões semanais concretas
   - Adaptações para limitações: ${limitations}

5. PERIODIZAÇÃO POR SEMANAS:
   - Semanas 1-3: Adaptação anatômica
   - Semanas 4-6: Desenvolvimento básico
   - Semanas 7-9: Intensificação
   - Semanas 10-12: Polimento/Pico

RETORNE APENAS um JSON válido no seguinte formato:

{
  "title": "Plano Periodizado: [Objetivo] - Nível [Nível]",
  "description": "Plano periodizado de 12 semanas específico para [objetivo principal], considerando [limitações], com ${availableDays} sessões semanais usando [equipamentos]. Desenvolvido considerando perfil individual completo.",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 12,
  "exercises": [
    {
      "name": "Semana 1 - ${dayStructure[0]}: [Exercício Principal 1]",
      "sets": "3",
      "reps": "8-12",
      "rest": "90-120s",
      "instructions": "EXECUÇÃO TÉCNICA detalhada. Semana 1: Foco na adaptação anatômica. MÚSCULOS: [primários e secundários]. PROGRESSÃO: [detalhes específicos]."
    }
  ],
  "nutrition_tips": [
    "Estratégia nutricional específica para [objetivo]: timing, macronutrientes e hidratação",
    "Suplementação básica recomendada considerando [objetivo] e perfil individual",
    "Timing nutricional pré e pós-treino otimizado para [objetivo]",
    "Protocolo de hidratação específico para intensidade de treino planejada"
  ]
}

REQUISITOS CRÍTICOS:
- Crie EXATAMENTE ${availableDays * 12} exercícios completos (${availableDays} treinos x 12 semanas)
- CADA SEMANA deve ter EXATAMENTE ${availableDays} treinos
- SEMPRE use a nomenclatura: "Semana X - [Dia da Semana]: [Exercício]"
- Cada exercício deve ter instruções de NO MÍNIMO 80 palavras
- Considere TODAS as limitações: ${limitations}
- Adapte 100% aos equipamentos: ${equipment}
- O campo difficulty_level deve ser exatamente: "iniciante", "intermediario", ou "avancado"

RETORNE APENAS O JSON, sem markdown, sem explicações adicionais.`;

    console.log('📤 Enviando requisição detalhada para Groq API...');

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um personal trainer certificado especialista em ciência do exercício com 15 anos de experiência. Crie planos de treino extremamente detalhados e personalizados baseados no perfil completo do aluno.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.2,
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      
      console.log('📋 Usando plano de fallback devido ao erro na API Groq');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    const data = await response.json();
    console.log('✅ Resposta recebida do Groq com sucesso');

    let content = data.choices?.[0]?.message?.content || '';

    if (!content || content.trim() === '') {
      console.log('⚠️ Conteúdo vazio da API Groq, usando fallback');
      const fallbackPlan = createFallbackPlan(userProfile);
      
      return new Response(
        JSON.stringify(fallbackPlan),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders 
          } 
        }
      );
    }

    // Limpar e extrair JSON da resposta
    content = content.trim();
    
    // Remover possíveis marcadores de código
    if (content.includes('```json')) {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }
    } else if (content.includes('```')) {
      const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }
    }

    let workoutPlan;
    try {
      workoutPlan = JSON.parse(content);
      console.log('✅ JSON parseado com sucesso da API Groq');
      
      // Validar e corrigir difficulty_level
      const validLevels = ['iniciante', 'intermediario', 'avancado'];
      if (!workoutPlan.difficulty_level || !validLevels.includes(workoutPlan.difficulty_level)) {
        workoutPlan.difficulty_level = mapFitnessLevelToDifficulty(userProfile.fitness_level);
      }
      
      // Validar estrutura básica
      if (!workoutPlan.title || !workoutPlan.exercises || !Array.isArray(workoutPlan.exercises)) {
        throw new Error('Estrutura do JSON inválida da API Groq');
      }

      // Adicionar flag indicando que veio da API Groq
      workoutPlan.source = 'groq_api';
      workoutPlan.generated_for = {
        goals: goals,
        equipment: equipment,
        level: fitnessLevel,
        limitations: limitations,
        days: availableDays,
        duration: userProfile.session_duration || 60
      };
      
      console.log('🎯 Plano personalizado gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback
      console.log('📋 Usando plano de fallback devido ao erro de parse');
      workoutPlan = createFallbackPlan(userProfile);
    }

    console.log('🎉 Retornando plano final gerado pela API Groq');

    return new Response(
      JSON.stringify(workoutPlan),
      { 
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Erro geral no generate-workout-plan:', error);
    
    // Em caso de erro geral, retornar plano básico
    const basicPlan = createFallbackPlan(null);

    return new Response(
      JSON.stringify(basicPlan),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        } 
      }
    );
  }
});

function getDayStructure(availableDays: number): string[] {
  const dayOptions = [
    ['Segunda-feira', 'Quarta-feira'],
    ['Segunda-feira', 'Quarta-feira', 'Sexta-feira'],
    ['Segunda-feira', 'Terça-feira', 'Quinta-feira', 'Sexta-feira'],
    ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira'],
    ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'],
    ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
  ];
  
  return dayOptions[Math.min(availableDays - 1, dayOptions.length - 1)] || dayOptions[2];
}

function mapFitnessLevelToDifficulty(fitnessLevel: string): string {
  switch (fitnessLevel) {
    case 'sedentario':
    case 'pouco_ativo':
    case 'iniciante':
      return 'iniciante';
    case 'moderado':
    case 'ativo':
    case 'intermediario':
      return 'intermediario';
    case 'muito_ativo':
    case 'avancado':
      return 'avancado';
    default:
      return 'iniciante';
  }
}

function createFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'iniciante';
  const goals = userProfile?.fitness_goals?.[0] || 'condicionamento geral';
  const availableDays = userProfile?.available_days || 3;
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  
  // Mapear objetivos para descrição
  const goalsDescription = {
    'perder_peso': 'perda de peso e queima de gordura',
    'ganhar_massa': 'ganho de massa muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral',
    'hipertrofia': 'ganho de massa muscular e hipertrofia'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  const dayStructure = getDayStructure(availableDays);
  
  // Criar exercícios garantindo exatamente availableDays treinos por semana
  const exercises = [];
  
  // Exercícios base por dia
  const exercisesByDay = {
    'Segunda-feira': ['Agachamento Livre', 'Flexão de Braço', 'Prancha Isométrica'],
    'Terça-feira': ['Afundo Alternado', 'Flexão Inclinada', 'Ponte Glútea'],
    'Quarta-feira': ['Agachamento Sumo', 'Flexão Diamante', 'Mountain Climber'],
    'Quinta-feira': ['Agachamento Búlgaro', 'Flexão Declinada', 'Prancha Lateral'],
    'Sexta-feira': ['Agachamento Jump', 'Flexão Hindu', 'Burpee Modificado'],
    'Sábado': ['Circuito Funcional', 'Core Training', 'Mobilidade'],
    'Domingo': ['Yoga Flow', 'Alongamento', 'Relaxamento']
  };
  
  for (let week = 1; week <= 12; week++) {
    for (let dayIndex = 0; dayIndex < availableDays; dayIndex++) {
      const dayName = dayStructure[dayIndex];
      const dayExercises = exercisesByDay[dayName] || exercisesByDay['Segunda-feira'];
      
      dayExercises.forEach((exerciseName) => {
        exercises.push({
          name: `Semana ${week} - ${dayName}: ${exerciseName}`,
          sets: week <= 4 ? 2 : 3,
          reps: week <= 4 ? "8-10" : "10-15",
          rest: "60-90s",
          instructions: `EXECUÇÃO TÉCNICA: Técnica biomecânica detalhada para ${exerciseName}. Semana ${week}: Progressão adequada considerando ${goalDesc}. MÚSCULOS: Grupos musculares específicos trabalhados. ADAPTAÇÕES: Considerações para nível ${difficultyLevel}.`
        });
      });
    }
  }
  
  return {
    title: `Plano Periodizado ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano periodizado de 12 semanas específico para ${goalDesc} para nível ${difficultyLevel}, com ${availableDays} sessões semanais. Este treino foi desenvolvido considerando seu perfil e objetivos específicos.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 12,
    source: 'fallback',
    exercises: exercises,
    nutrition_tips: [
      "Semana 1-2: Proteína pós-treino moderada (15-20g) para adaptação inicial",
      "Semana 3-4: Aumento para 25-30g de proteína pós-treino para suporte à recuperação",
      "Hidratação progressiva: 35ml por kg de peso + 300ml extra nas primeiras semanas",
      "Carboidratos pré-treino: começar com 20-30g, progredir para 30-50g",
      "Timing nutricional: manter consistência nos horários das refeições",
      "Sono reparador: 7-9h por noite, especialmente importante nas primeiras semanas",
      "Suplementação básica: considere apenas após a terceira semana de adaptação"
    ]
  };
}
