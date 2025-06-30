
import { ExerciseMedia } from '@/types/exercise';

interface ExerciseDBExercise {
  id: string;
  name: string;
  gifUrl: string;
  instructions: string[];
  target: string;
  bodyPart: string;
}

class ExerciseImageService {
  private readonly EXERCISE_DB_BASE = 'https://exercisedb.p.rapidapi.com';
  private readonly API_KEY = 'demo'; // Para demo, usar chave real em produção
  
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // Mapeamento melhorado de exercícios para imagens reais
  private readonly EXERCISE_MAPPING: Record<string, string[]> = {
    // Exercícios de peitoral
    'supino': ['bench press', 'chest press', 'supino reto'],
    'supino reto': ['bench press', 'barbell bench press'],
    'supino inclinado': ['incline bench press', 'incline barbell press'],
    'flexao': ['push up', 'pushup', 'flexão de braço'],
    'flexão': ['push up', 'pushup', 'push-up'],
    'crucifixo': ['dumbbell flyes', 'chest fly', 'pec fly'],
    
    // Exercícios de costas
    'remada': ['barbell row', 'bent over row', 'rowing'],
    'remada curvada': ['bent over barbell row', 'barbell row'],
    'puxada': ['lat pulldown', 'pull down', 'pulldown'],
    'puxada frontal': ['lat pulldown', 'front pulldown'],
    'pull up': ['pull up', 'pullup', 'barra fixa'],
    'barra fixa': ['pull up', 'chin up'],
    
    // Exercícios de pernas
    'agachamento': ['squat', 'barbell squat', 'back squat'],
    'agachamento livre': ['barbell squat', 'back squat'],
    'leg press': ['leg press', '45 degree leg press'],
    'extensora': ['leg extension', 'quadriceps extension'],
    'flexora': ['leg curl', 'hamstring curl'],
    'afundo': ['lunge', 'walking lunge', 'forward lunge'],
    'passada': ['lunge', 'walking lunge'],
    
    // Exercícios de ombro
    'desenvolvimento': ['shoulder press', 'military press', 'overhead press'],
    'elevacao lateral': ['lateral raise', 'side raise', 'dumbbell lateral raise'],
    'elevação lateral': ['lateral raise', 'side raise'],
    'elevacao frontal': ['front raise', 'anterior raise'],
    
    // Exercícios de braço
    'rosca direta': ['bicep curl', 'barbell curl', 'standing barbell curl'],
    'rosca biceps': ['bicep curl', 'dumbbell curl'],
    'triceps testa': ['skull crusher', 'lying tricep extension'],
    'triceps pulley': ['tricep pushdown', 'cable pushdown'],
    
    // Exercícios de core
    'abdominal': ['crunch', 'sit up', 'abdominal crunch'],
    'prancha': ['plank', 'front plank', 'forearm plank'],
    'elevacao de pernas': ['leg raise', 'hanging leg raise']
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      return this.exerciseCache.get(cacheKey)!;
    }
    
    try {
      // Buscar por mapeamento melhorado primeiro
      const mappedNames = this.getMappedExerciseNames(exerciseName);
      
      for (const mappedName of mappedNames) {
        const exercises = await this.fetchExercisesByName(mappedName);
        if (exercises.length > 0) {
          const media = this.convertToExerciseMedia(exercises[0], exerciseName);
          this.exerciseCache.set(cacheKey, media);
          return media;
        }
      }
      
      // Se não encontrar, usar imagens específicas melhoradas
      const fallbackMedia = this.generateSpecificFallbackMedia(exerciseName);
      this.exerciseCache.set(cacheKey, fallbackMedia);
      return fallbackMedia;
      
    } catch (error) {
      console.warn('Erro ao buscar imagens do exercício:', error);
      return this.generateSpecificFallbackMedia(exerciseName);
    }
  }
  
  private getMappedExerciseNames(exerciseName: string): string[] {
    const normalizedName = exerciseName.toLowerCase().trim();
    
    // Procurar correspondência exata primeiro
    if (this.EXERCISE_MAPPING[normalizedName]) {
      return this.EXERCISE_MAPPING[normalizedName];
    }
    
    // Procurar correspondência parcial
    for (const [key, values] of Object.entries(this.EXERCISE_MAPPING)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return values;
      }
    }
    
    // Fallback para nome original
    return [normalizedName];
  }
  
  private async fetchExercisesByName(name: string): Promise<ExerciseDBExercise[]> {
    // Simulação melhorada com mais exercícios
    const mockExercises: Record<string, ExerciseDBExercise> = {
      'squat': {
        id: '1',
        name: 'Squat',
        gifUrl: 'https://v2.exercisedb.io/image/original/FjocvOTRLnxBuKUyoxfJPw',
        instructions: ['Stand with feet shoulder-width apart', 'Lower your body as if sitting back', 'Keep chest up and knees behind toes', 'Return to starting position'],
        target: 'quadriceps',
        bodyPart: 'upper legs'
      },
      'barbell squat': {
        id: '1',
        name: 'Barbell Squat',
        gifUrl: 'https://v2.exercisedb.io/image/original/FjocvOTRLnxBuKUyoxfJPw',
        instructions: ['Position barbell on upper back', 'Stand with feet shoulder-width apart', 'Squat down keeping chest up', 'Drive through heels to return'],
        target: 'quadriceps',
        bodyPart: 'upper legs'
      },
      'bench press': {
        id: '2',
        name: 'Bench Press',
        gifUrl: 'https://v2.exercisedb.io/image/original/T3LU73fAYXhxD5lVq5kVcA',
        instructions: ['Lie on bench with feet flat', 'Grip barbell slightly wider than shoulders', 'Lower bar to chest', 'Press up explosively'],
        target: 'pectorals',
        bodyPart: 'chest'
      },
      'push up': {
        id: '3',
        name: 'Push Up',
        gifUrl: 'https://v2.exercisedb.io/image/original/rSMqS46StJZfhIlEGjKnVQ',
        instructions: ['Start in plank position', 'Lower chest to ground', 'Push back up to start', 'Keep body straight throughout'],
        target: 'pectorals',
        bodyPart: 'chest'
      },
      'pull up': {
        id: '4',
        name: 'Pull Up',
        gifUrl: 'https://v2.exercisedb.io/image/original/cqeAXQrNbOFzwYD1Xh8iPQ',
        instructions: ['Hang from pull-up bar', 'Pull body up until chin over bar', 'Lower with control', 'Repeat for reps'],
        target: 'lats',
        bodyPart: 'back'
      },
      'lat pulldown': {
        id: '5',
        name: 'Lat Pulldown',
        gifUrl: 'https://v2.exercisedb.io/image/original/Br3Uyk8CW6L1MEQHgq3LWQ',
        instructions: ['Sit at pulldown machine', 'Grip bar wider than shoulders', 'Pull bar to upper chest', 'Control the return'],
        target: 'lats',
        bodyPart: 'back'
      },
      'bicep curl': {
        id: '6',
        name: 'Bicep Curl',
        gifUrl: 'https://v2.exercisedb.io/image/original/j3rXXQy9CUlCWdoFyNQjkw',
        instructions: ['Stand with dumbbells at sides', 'Curl weights toward shoulders', 'Keep elbows stationary', 'Lower with control'],
        target: 'biceps',
        bodyPart: 'upper arms'
      }
    };
    
    // Buscar correspondência mais flexível
    const normalizedSearch = name.toLowerCase();
    for (const [key, exercise] of Object.entries(mockExercises)) {
      if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
        return [exercise];
      }
    }
    
    return [];
  }
  
  private convertToExerciseMedia(exercise: ExerciseDBExercise, originalName: string): ExerciseMedia[] {
    return [
      {
        type: 'gif',
        url: exercise.gifUrl,
        alt: `${originalName} - Demonstração do movimento`,
        thumbnail: exercise.gifUrl
      },
      {
        type: 'image',
        url: exercise.gifUrl,
        alt: `${originalName} - Posição correta`,
        thumbnail: exercise.gifUrl
      }
    ];
  }
  
  private generateSpecificFallbackMedia(exerciseName: string): ExerciseMedia[] {
    // Gerar imagens mais específicas baseadas no tipo de exercício
    const exerciseType = this.getExerciseType(exerciseName);
    const unsplashQueries = this.getUnsplashQueries(exerciseType);
    
    return [
      {
        type: 'image',
        url: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80&auto=format`,
        alt: `${exerciseName} - Demonstração`,
        thumbnail: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=center&q=60&auto=format`
      },
      {
        type: 'gif',
        url: `https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop&crop=center&q=80&auto=format`,
        alt: `${exerciseName} - Execução do movimento`,
        thumbnail: `https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=150&h=150&fit=crop&crop=center&q=60&auto=format`
      }
    ];
  }
  
  private getExerciseType(exerciseName: string): 'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'core' | 'general' {
    const name = exerciseName.toLowerCase();
    
    if (name.includes('supino') || name.includes('flexao') || name.includes('peitoral')) return 'chest';
    if (name.includes('remada') || name.includes('puxada') || name.includes('dorsal')) return 'back';
    if (name.includes('agachamento') || name.includes('leg') || name.includes('coxa')) return 'legs';
    if (name.includes('desenvolvimento') || name.includes('elevacao') || name.includes('ombro')) return 'shoulders';
    if (name.includes('rosca') || name.includes('triceps') || name.includes('biceps')) return 'arms';
    if (name.includes('abdominal') || name.includes('prancha') || name.includes('core')) return 'core';
    
    return 'general';
  }
  
  private getUnsplashQueries(exerciseType: string): { primary: string; secondary: string } {
    const queries = {
      chest: { primary: 'gym+chest+workout', secondary: 'fitness+training' },
      back: { primary: 'gym+back+workout', secondary: 'pull+up+exercise' },
      legs: { primary: 'squat+workout', secondary: 'leg+training' },
      shoulders: { primary: 'shoulder+press', secondary: 'deltoid+workout' },
      arms: { primary: 'bicep+curl', secondary: 'arm+workout' },
      core: { primary: 'core+workout', secondary: 'abs+training' },
      general: { primary: 'gym+workout', secondary: 'fitness+exercise' }
    };
    
    return queries[exerciseType as keyof typeof queries] || queries.general;
  }
}

export const exerciseImageService = new ExerciseImageService();
