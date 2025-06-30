
// Sistema inteligente de mapeamento muscular
export const MUSCLE_SYNONYMS: Record<string, string[]> = {
  // Peitorais
  'peitoral': ['chest', 'pectoralis', 'peito', 'pectoral', 'pectoralis_major', 'peitoral_maior'],
  
  // Dorsais
  'latissimo': ['lats', 'latissimus', 'dorsal', 'back', 'costas', 'latissimo_dorso'],
  'trapezio': ['traps', 'trapezius', 'trapeze', 'trapezio_superior'],
  
  // Ombros
  'deltoides': ['delts', 'deltoid', 'shoulder', 'ombro', 'deltoides_anterior', 'deltoides_posterior'],
  
  // Braços
  'biceps': ['bicep', 'biceps_braquial', 'biceps_brachii'],
  'triceps': ['tricep', 'triceps_braquial', 'triceps_brachii'],
  
  // Core
  'abdominais': ['abs', 'abdominals', 'core', 'reto_abdominal', 'obliquos'],
  
  // Pernas
  'quadriceps': ['quads', 'quadriceps_femoral', 'coxa_anterior'],
  'isquiotibiais': ['hamstrings', 'posterior_coxa', 'biceps_femoral'],
  'gluteos': ['glutes', 'gluteus', 'bumbum', 'nadega', 'gluteo_maximo'],
  'panturrilha': ['calves', 'gastrocnemio', 'soleo', 'panturrilhas'],
  
  // Antebraços
  'antebraco': ['forearms', 'antebracos', 'punho']
};

export const MUSCLE_CATEGORIES = {
  upper_body: ['peitoral', 'deltoides', 'biceps', 'triceps', 'latissimo', 'trapezio'],
  core: ['abdominais'],
  lower_body: ['quadriceps', 'isquiotibiais', 'gluteos', 'panturrilha']
};

export function findMuscleMatch(exerciseMuscles: string[], targetMuscle: string): boolean {
  const synonyms = MUSCLE_SYNONYMS[targetMuscle] || [targetMuscle];
  
  return exerciseMuscles.some(muscle => 
    synonyms.some(synonym => 
      muscle.toLowerCase().includes(synonym.toLowerCase()) ||
      synonym.toLowerCase().includes(muscle.toLowerCase())
    )
  );
}

export function getMuscleIntensity(exerciseMuscles: string[], targetMuscle: string, muscleAnatomy?: any): 'primary' | 'secondary' | 'stabilizer' | 'inactive' {
  if (muscleAnatomy) {
    if (muscleAnatomy.primary?.some((m: string) => findMuscleMatch([m], targetMuscle))) {
      return 'primary';
    }
    if (muscleAnatomy.secondary?.some((m: string) => findMuscleMatch([m], targetMuscle))) {
      return 'secondary';
    }
    if (muscleAnatomy.stabilizer?.some((m: string) => findMuscleMatch([m], targetMuscle))) {
      return 'stabilizer';
    }
  }
  
  if (findMuscleMatch(exerciseMuscles, targetMuscle)) {
    return 'primary';
  }
  
  return 'inactive';
}
