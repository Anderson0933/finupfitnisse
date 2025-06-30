
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
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      return this.exerciseCache.get(cacheKey)!;
    }
    
    try {
      // Primeiro, tentar buscar por nome específico
      const searchTerm = this.normalizeExerciseName(exerciseName);
      const exercises = await this.fetchExercisesByName(searchTerm);
      
      if (exercises.length > 0) {
        const media = this.convertToExerciseMedia(exercises[0], exerciseName);
        this.exerciseCache.set(cacheKey, media);
        return media;
      }
      
      // Se não encontrar, usar placeholders melhorados
      const fallbackMedia = this.generateFallbackMedia(exerciseName);
      this.exerciseCache.set(cacheKey, fallbackMedia);
      return fallbackMedia;
      
    } catch (error) {
      console.warn('Erro ao buscar imagens do exercício:', error);
      return this.generateFallbackMedia(exerciseName);
    }
  }
  
  private async fetchExercisesByName(name: string): Promise<ExerciseDBExercise[]> {
    // Em ambiente real, usar API key válida
    // Por enquanto, simular dados para demonstração
    const mockExercises: Record<string, ExerciseDBExercise> = {
      'agachamento': {
        id: '1',
        name: 'Agachamento',
        gifUrl: 'https://v2.exercisedb.io/image/original/FjocvOTRLnxBuKUyoxfJPw',
        instructions: ['Posição inicial', 'Descer controladamente', 'Subir explosivamente'],
        target: 'quadriceps',
        bodyPart: 'lower legs'
      },
      'supino': {
        id: '2',
        name: 'Supino',
        gifUrl: 'https://v2.exercisedb.io/image/original/T3LU73fAYXhxD5lVq5kVcA',
        instructions: ['Deitar no banco', 'Descer a barra', 'Empurrar para cima'],
        target: 'pectorals',
        bodyPart: 'chest'
      },
      'flexao': {
        id: '3',
        name: 'Flexão',
        gifUrl: 'https://v2.exercisedb.io/image/original/rSMqS46StJZfhIlEGjKnVQ',
        instructions: ['Posição de prancha', 'Descer o corpo', 'Empurrar para cima'],
        target: 'pectorals',
        bodyPart: 'chest'
      }
    };
    
    const exercise = mockExercises[name.toLowerCase()];
    return exercise ? [exercise] : [];
  }
  
  private normalizeExerciseName(name: string): string {
    const nameMap: Record<string, string> = {
      'agachamento': 'agachamento',
      'squat': 'agachamento',
      'supino': 'supino',
      'bench press': 'supino',
      'flexao': 'flexao',
      'push up': 'flexao',
      'pushup': 'flexao',
      'remada': 'remada',
      'row': 'remada',
      'puxada': 'puxada',
      'pull': 'puxada'
    };
    
    const normalized = name.toLowerCase();
    for (const [key, value] of Object.entries(nameMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }
    
    return normalized;
  }
  
  private convertToExerciseMedia(exercise: ExerciseDBExercise, originalName: string): ExerciseMedia[] {
    return [
      {
        type: 'image',
        url: exercise.gifUrl,
        alt: `${originalName} - Posição inicial`,
        thumbnail: exercise.gifUrl
      },
      {
        type: 'gif',
        url: exercise.gifUrl,
        alt: `${originalName} - Movimento completo`,
        thumbnail: exercise.gifUrl
      }
    ];
  }
  
  private generateFallbackMedia(exerciseName: string): ExerciseMedia[] {
    const exerciseSlug = exerciseName.toLowerCase().replace(/\s+/g, '+');
    
    return [
      {
        type: 'image',
        url: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80`,
        alt: `${exerciseName} - Demonstração`,
        thumbnail: `https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&crop=center&q=60`
      },
      {
        type: 'gif',
        url: `https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400&h=300&fit=crop&crop=center&q=80`,
        alt: `${exerciseName} - Movimento`,
        thumbnail: `https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=150&h=150&fit=crop&crop=center&q=60`
      }
    ];
  }
}

export const exerciseImageService = new ExerciseImageService();
