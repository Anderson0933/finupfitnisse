
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
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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

    console.log('✅ Chave Groq configurada, gerando prompt personalizado avançado...');

    // Mapear valores para português mais amigável
    const goalsMap = {
      'perder_peso': 'perder peso e queimar gordura corporal',
      'perda_peso': 'perder peso e queimar gordura corporal',
      'ganhar_massa': 'ganhar massa muscular e hipertrofia',
      'hipertrofia': 'ganhar massa muscular e hipertrofia',
      'tonificar': 'tonificar o corpo e definir músculos',
      'condicionamento': 'melhorar condicionamento cardiovascular',
      'forca': 'aumentar força e potência muscular',
      'flexibilidade': 'melhorar flexibilidade e mobilidade',
      'geral': 'condicionamento físico geral',
      'saude_geral': 'condicionamento físico geral'
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
      'iniciante': 'iniciante - alguma experiência básica com treinos',
      'moderado': 'moderadamente ativo - alguma experiência com treinos',
      'intermediario': 'intermediário - experiência regular com exercícios',
      'ativo': 'ativo - experiência regular com exercícios',
      'muito_ativo': 'muito ativo - experiência avançada em treinamento',
      'avancado': 'atlético avançado - alto nível de condicionamento'
    };

    const goals = goalsMap[userProfile.fitness_goals?.[0]] || userProfile.fitness_goals?.[0] || 'melhorar condicionamento geral';
    const equipment = equipmentMap[userProfile.equipment] || userProfile.equipment || 'equipamentos básicos';
    const limitations = limitationsMap[userProfile.limitations] || userProfile.limitations || 'nenhuma limitação';
    const fitnessLevel = fitnessLevelMap[userProfile.fitness_level] || userProfile.fitness_level || 'iniciante';

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

    // Criar prompt detalhado para 8 semanas com estrutura correta
    const enhancedPrompt = `Você é um personal trainer certificado com 15 anos de experiência. Crie um plano de treino de 8 SEMANAS estruturado com ${userProfile.available_days || 3} dias por semana.

PERFIL COMPLETO DO ALUNO:
- Idade: ${userProfile.age || 'Não informado'} anos
- Sexo: ${userProfile.gender || 'Não informado'}
- Altura: ${userProfile.height || 'Não informado'} cm
- Peso: ${userProfile.weight || 'Não informado'} kg
- ${imcInfo}
- Nível: ${fitnessLevel}
- Objetivo: ${goals}
- Dias Disponíveis: ${userProfile.available_days || 3} por semana
- Duração: ${userProfile.session_duration || 60} minutos
- Equipamentos: ${equipment}
- Limitações: ${limitations}

RETORNE APENAS um JSON seguindo EXATAMENTE esta estrutura:

{
  "title": "Plano de Treino de 8 Semanas - [Objetivo] - Nível [Nível]",
  "description": "Plano periodizado personalizado...",
  "difficulty_level": "iniciante|intermediario|avancado",
  "duration_weeks": 8,
  "total_workouts": ${(userProfile.available_days || 3) * 8},
  "workouts": [
    {
      "week": 1,
      "day": 1,
      "title": "Treino A - Corpo Inteiro",
      "focus": "Adaptação e aprendizado técnico",
      "estimated_duration": 45,
      "warm_up": {
        "duration": 10,
        "exercises": [
          {
            "name": "Caminhada no Local",
            "duration": 300,
            "instructions": "Marche no local elevando os joelhos moderadamente"
          }
        ]
      },
      "main_exercises": [
        {
          "name": "Agachamento Livre",
          "muscle_groups": ["Quadríceps", "Glúteos", "Core"],
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "weight_guidance": "Peso corporal",
          "instructions": "Posição inicial: Pés na largura dos ombros...",
          "form_cues": ["Mantenha o peito ereto", "Joelhos alinhados com os pés"],
          "progression_notes": "Aumente para 15 reps na semana 2"
        }
      ],
      "cool_down": {
        "duration": 8,
        "exercises": [
          {
            "name": "Alongamento de Quadríceps",
            "duration": 30,
            "instructions": "Segure o pé e puxe em direção ao glúteo"
          }
        ]
      }
    }
  ],
  "nutrition_tips": [
    "Hidrate-se com 35-40ml por kg de peso corporal diariamente",
    "Consuma proteína 30min após o treino para recuperação muscular"
  ],
  "progression_schedule": {
    "weeks_1_2": "Adaptação - foco na técnica e volume baixo",
    "weeks_3_4": "Progressão gradual - aumento de volume",
    "weeks_5_6": "Intensificação - técnicas avançadas",
    "weeks_7_8": "Consolidação - refinamento e pico"
  }
}

IMPORTANTE: Crie EXATAMENTE ${(userProfile.available_days || 3) * 8} treinos completos distribuídos nas 8 semanas. Cada treino deve ter warm_up, main_exercises detalhados e cool_down.`;

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
            content: 'Você é um personal trainer certificado especialista em ciência do exercício. Crie planos de treino estruturados seguindo exatamente o formato JSON solicitado.' 
          },
          { role: 'user', content: enhancedPrompt }
        ],
        max_tokens: 16000,
        temperature: 0.1,
      }),
    });

    console.log('📊 Status da resposta Groq:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro da API Groq:', response.status, errorText);
      
      console.log('📋 Usando plano de fallback avançado devido ao erro na API Groq');
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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
      console.log('⚠️ Conteúdo vazio da API Groq, usando fallback avançado');
      const fallbackPlan = createEnhancedFallbackPlan(userProfile);
      
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
      if (!workoutPlan.title || !workoutPlan.workouts || !Array.isArray(workoutPlan.workouts)) {
        throw new Error('Estrutura do JSON inválida da API Groq');
      }

      // Adicionar flag indicando que veio da API Groq
      workoutPlan.source = 'groq_api_enhanced';
      workoutPlan.generated_for = {
        goals: goals,
        equipment: equipment,
        level: fitnessLevel,
        limitations: limitations,
        days: userProfile.available_days || 3,
        duration: userProfile.session_duration || 60
      };
      
      console.log('🎯 Plano personalizado avançado de 8 semanas gerado com sucesso pela API Groq!');
      
    } catch (parseError) {
      console.error('❌ Erro ao fazer parse do JSON da API Groq:', parseError);
      console.log('📄 Conteúdo recebido:', content.substring(0, 500) + '...');
      
      // Usar plano de fallback avançado
      console.log('📋 Usando plano de fallback avançado devido ao erro de parse');
      workoutPlan = createEnhancedFallbackPlan(userProfile);
    }

    console.log('🎉 Retornando plano final avançado de 8 semanas gerado pela API Groq');

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
    
    // Em caso de erro geral, retornar plano básico avançado
    const basicPlan = createEnhancedFallbackPlan(null);

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

function createEnhancedFallbackPlan(userProfile: any) {
  const level = userProfile?.fitness_level || 'sedentario';
  const goals = userProfile?.fitness_goals?.[0] || 'condicionamento geral';
  const difficultyLevel = mapFitnessLevelToDifficulty(level);
  const availableDays = userProfile?.available_days || 3;
  const sessionDuration = userProfile?.session_duration || 60;
  
  // Mapear objetivos para descrição
  const goalsDescription = {
    'perder_peso': 'perda de peso e queima de gordura',
    'perda_peso': 'perda de peso e queima de gordura',
    'ganhar_massa': 'ganho de massa muscular',
    'hipertrofia': 'ganho de massa muscular',
    'tonificar': 'tonificação corporal',
    'condicionamento': 'melhora do condicionamento físico',
    'forca': 'aumento da força',
    'flexibilidade': 'melhora da flexibilidade',
    'geral': 'condicionamento geral',
    'saude_geral': 'condicionamento geral'
  };

  const goalDesc = goalsDescription[goals] || 'condicionamento geral';
  
  // Criar workouts estruturados para 8 semanas
  const workouts = [];
  
  for (let week = 1; week <= 8; week++) {
    for (let day = 1; day <= availableDays; day++) {
      const workoutIndex = ((week - 1) * availableDays) + day;
      
      let workoutTitle = '';
      let focus = '';
      let mainExercises = [];
      
      if (availableDays === 3) {
        // Treino ABC
        if (day === 1) {
          workoutTitle = 'Treino A - Pernas e Glúteos';
          focus = week <= 2 ? 'Adaptação técnica' : week <= 4 ? 'Progressão de volume' : week <= 6 ? 'Intensificação' : 'Consolidação';
          mainExercises = [
            {
              name: 'Agachamento Livre',
              muscle_groups: ['Quadríceps', 'Glúteos', 'Core'],
              sets: week <= 2 ? 3 : week <= 4 ? 4 : week <= 6 ? 4 : 3,
              reps: week <= 2 ? '10-12' : week <= 4 ? '12-15' : week <= 6 ? '8-12' : '10-12',
              rest_seconds: week <= 2 ? 60 : week <= 4 ? 90 : week <= 6 ? 120 : 90,
              weight_guidance: 'Peso corporal ou halteres',
              instructions: 'Posição inicial: Pés na largura dos ombros, pontas levemente voltadas para fora. Desça flexionando joelhos e quadril, mantendo peito ereto e coluna neutra.',
              form_cues: ['Mantenha o peito ereto', 'Joelhos alinhados com os pés', 'Peso nos calcanhares'],
              progression_notes: week <= 2 ? 'Foque na técnica perfeita' : week <= 4 ? 'Aumente repetições gradualmente' : week <= 6 ? 'Adicione peso se possível' : 'Mantenha qualidade técnica'
            }
          ];
        } else if (day === 2) {
          workoutTitle = 'Treino B - Peito, Ombros e Tríceps';
          focus = week <= 2 ? 'Adaptação técnica' : week <= 4 ? 'Progressão de volume' : week <= 6 ? 'Intensificação' : 'Consolidação';
          mainExercises = [
            {
              name: 'Flexão de Braço',
              muscle_groups: ['Peitoral', 'Deltoides', 'Tríceps'],
              sets: week <= 2 ? 3 : week <= 4 ? 4 : week <= 6 ? 4 : 3,
              reps: week <= 2 ? '6-10' : week <= 4 ? '8-12' : week <= 6 ? '6-10' : '8-10',
              rest_seconds: week <= 2 ? 60 : week <= 4 ? 90 : week <= 6 ? 120 : 90,
              weight_guidance: 'Peso corporal',
              instructions: 'Posição inicial: Mãos no chão ligeiramente mais afastadas que os ombros. Corpo reto da cabeça aos calcanhares. Desça controladamente até o peito quase tocar o chão.',
              form_cues: ['Corpo reto como prancha', 'Cotovelos a 45 graus', 'Amplitude completa'],
              progression_notes: week <= 2 ? 'Pode usar joelhos se necessário' : week <= 4 ? 'Busque amplitude completa' : week <= 6 ? 'Explore variações' : 'Foque na qualidade'
            }
          ];
        } else {
          workoutTitle = 'Treino C - Costas e Bíceps';
          focus = week <= 2 ? 'Adaptação técnica' : week <= 4 ? 'Progressão de volume' : week <= 6 ? 'Intensificação' : 'Consolidação';
          mainExercises = [
            {
              name: 'Remada Isométrica',
              muscle_groups: ['Latíssimo', 'Romboides', 'Bíceps'],
              sets: week <= 2 ? 3 : week <= 4 ? 4 : week <= 6 ? 4 : 3,
              reps: week <= 2 ? '30s' : week <= 4 ? '45s' : week <= 6 ? '60s' : '45s',
              rest_seconds: week <= 2 ? 60 : week <= 4 ? 90 : week <= 6 ? 120 : 90,
              weight_guidance: 'Resistência elástica ou peso corporal',
              instructions: 'Simule movimento de remada, contraindo fortemente músculos das costas. Mantenha postura ereta e ombros para trás.',
              form_cues: ['Ombros para trás', 'Peito aberto', 'Cotovelos junto ao corpo'],
              progression_notes: week <= 2 ? 'Concentre-se na ativação muscular' : week <= 4 ? 'Aumente tempo gradualmente' : week <= 6 ? 'Maximize contração' : 'Mantenha intensidade'
            }
          ];
        }
      } else {
        // Adaptação para outros números de dias
        workoutTitle = `Treino ${day} - Corpo Inteiro`;
        focus = week <= 2 ? 'Adaptação e familiarização' : week <= 4 ? 'Progressão gradual' : week <= 6 ? 'Intensificação' : 'Consolidação';
        mainExercises = [
          {
            name: day % 2 === 1 ? 'Agachamento Livre' : 'Flexão de Braço',
            muscle_groups: day % 2 === 1 ? ['Quadríceps', 'Glúteos'] : ['Peitoral', 'Tríceps'],
            sets: week <= 2 ? 3 : week <= 4 ? 4 : 4,
            reps: week <= 2 ? '8-12' : week <= 4 ? '10-15' : '8-12',
            rest_seconds: week <= 2 ? 60 : week <= 4 ? 90 : 120,
            weight_guidance: 'Peso corporal',
            instructions: day % 2 === 1 ? 
              'Agachamento: Pés na largura dos ombros, desça flexionando joelhos e quadril.' :
              'Flexão: Mãos no chão, corpo reto, desça peito até quase tocar o solo.',
            form_cues: day % 2 === 1 ? 
              ['Joelhos alinhados', 'Peito ereto'] : 
              ['Corpo reto', 'Amplitude completa'],
            progression_notes: `Semana ${week}: ${focus}`
          }
        ];
      }
      
      workouts.push({
        week: week,
        day: day,
        title: workoutTitle,
        focus: focus,
        estimated_duration: sessionDuration,
        warm_up: {
          duration: 10,
          exercises: [
            {
              name: 'Aquecimento Geral',
              duration: 300,
              instructions: 'Movimentos articulares e ativação gradual'
            },
            {
              name: 'Mobilidade Específica',
              duration: 300,
              instructions: 'Prepare as articulações para o treino'
            }
          ]
        },
        main_exercises: mainExercises,
        cool_down: {
          duration: 8,
          exercises: [
            {
              name: 'Alongamento Geral',
              duration: 240,
              instructions: 'Alongue os músculos trabalhados'
            },
            {
              name: 'Relaxamento',
              duration: 240,
              instructions: 'Respire fundo e relaxe'
            }
          ]
        }
      });
    }
  }
  
  return {
    title: `Plano de Treino 8 Semanas ${difficultyLevel.charAt(0).toUpperCase() + difficultyLevel.slice(1)} - ${goalDesc.charAt(0).toUpperCase() + goalDesc.slice(1)}`,
    description: `Plano de treino periodizado de 8 semanas, desenvolvido especificamente para ${goalDesc}, considerando ${userProfile?.limitations || 'nenhuma limitação'}, com ${availableDays} sessões semanais de ${sessionDuration} minutos cada.`,
    difficulty_level: difficultyLevel,
    duration_weeks: 8,
    total_workouts: availableDays * 8,
    source: 'enhanced_fallback',
    workouts: workouts,
    nutrition_tips: [
      'Hidrate-se com 35-40ml de água por kg de peso corporal diariamente',
      'Consuma proteína de qualidade 30-60 minutos após o treino',
      'Mantenha refeições equilibradas com carboidratos, proteínas e gorduras saudáveis',
      'Evite treinar em jejum prolongado ou muito próximo às refeições principais'
    ],
    progression_schedule: {
      weeks_1_2: 'Adaptação e familiarização - foco na técnica correta',
      weeks_3_4: 'Progressão gradual - aumento de volume e repetições',
      weeks_5_6: 'Intensificação - técnicas avançadas e maior sobrecarga',
      weeks_7_8: 'Consolidação e refinamento - manutenção da qualidade técnica'
    }
  };
}
