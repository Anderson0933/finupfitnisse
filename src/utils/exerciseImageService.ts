
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
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // Mapeamento melhorado com exercícios reais brasileiros
  private readonly EXERCISE_MAPPING: Record<string, { keywords: string[], category: string }> = {
    // Exercícios de peitoral
    'supino': { keywords: ['bench press', 'chest press'], category: 'chest' },
    'supino reto': { keywords: ['barbell bench press', 'flat bench press'], category: 'chest' },
    'supino inclinado': { keywords: ['incline bench press', 'incline press'], category: 'chest' },
    'flexao': { keywords: ['push up', 'pushup'], category: 'chest' },
    'flexão': { keywords: ['push up', 'pushup'], category: 'chest' },
    'crucifixo': { keywords: ['dumbbell fly', 'chest fly'], category: 'chest' },
    
    // Exercícios de costas
    'remada': { keywords: ['barbell row', 'bent over row'], category: 'back' },
    'remada curvada': { keywords: ['bent over row', 'barbell row'], category: 'back' },
    'puxada': { keywords: ['lat pulldown', 'pulldown'], category: 'back' },
    'pull up': { keywords: ['pull up', 'pullup'], category: 'back' },
    'barra fixa': { keywords: ['pull up', 'chin up'], category: 'back' },
    
    // Exercícios de pernas
    'agachamento': { keywords: ['squat', 'barbell squat'], category: 'legs' },
    'leg press': { keywords: ['leg press'], category: 'legs' },
    'extensora': { keywords: ['leg extension'], category: 'legs' },
    'flexora': { keywords: ['leg curl', 'hamstring curl'], category: 'legs' },
    'afundo': { keywords: ['lunge', 'walking lunge'], category: 'legs' },
    
    // Exercícios de ombro
    'desenvolvimento': { keywords: ['shoulder press', 'military press'], category: 'shoulders' },
    'elevacao lateral': { keywords: ['lateral raise', 'side raise'], category: 'shoulders' },
    'elevação lateral': { keywords: ['lateral raise', 'side raise'], category: 'shoulders' },
    
    // Exercícios de braço
    'rosca direta': { keywords: ['bicep curl', 'barbell curl'], category: 'arms' },
    'rosca biceps': { keywords: ['bicep curl', 'dumbbell curl'], category: 'arms' },
    'triceps testa': { keywords: ['skull crusher', 'lying tricep extension'], category: 'arms' },
    'triceps pulley': { keywords: ['tricep pushdown'], category: 'arms' },
  };

  // URLs de imagens específicas e confiáveis do Unsplash
  private readonly FALLBACK_IMAGES: Record<string, ExerciseMedia[]> = {
    chest: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício de Peitoral - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&q=60'
      }
    ],
    back: [
      {
        type: 'image', 
        url: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício de Costas - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=150&h=150&fit=crop&q=60'
      }
    ],
    legs: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1566241134466-a85a44b8f8a8?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício de Pernas - Demonstração', 
        thumbnail: 'https://images.unsplash.com/photo-1566241134466-a85a44b8f8a8?w=150&h=150&fit=crop&q=60'
      }
    ],
    shoulders: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício de Ombros - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop&q=60'
      }
    ],
    arms: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583500178690-f7bf168ac3d1?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício de Braços - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7bf168ac3d1?w=150&h=150&fit=crop&q=60'
      }
    ],
    general: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=600&h=400&fit=crop&q=80',
        alt: 'Exercício - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=150&h=150&fit=crop&q=60'
      }
    ]
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      return this.exerciseCache.get(cacheKey)!;
    }
    
    try {
      // Buscar por categoria do exercício
      const category = this.getExerciseCategory(exerciseName);
      
      // Tentar APIs externas primeiro (simulado por enquanto)
      const apiImages = await this.tryExternalAPIs(exerciseName);
      if (apiImages.length > 0) {
        this.exerciseCache.set(cacheKey, apiImages);
        return apiImages;
      }
      
      // Usar fallback específico da categoria
      const fallbackImages = this.FALLBACK_IMAGES[category] || this.FALLBACK_IMAGES.general;
      
      // Personalizar as imagens com o nome do exercício
      const personalizedImages = fallbackImages.map(img => ({
        ...img,
        alt: `${exerciseName} - ${img.alt.split(' - ')[1]}`,
      }));
      
      this.exerciseCache.set(cacheKey, personalizedImages);
      return personalizedImages;
      
    } catch (error) {
      console.warn('Erro ao buscar imagens:', error);
      return this.FALLBACK_IMAGES.general.map(img => ({
        ...img,
        alt: `${exerciseName} - Demonstração`
      }));
    }
  }
  
  private async tryExternalAPIs(exerciseName: string): Promise<ExerciseMedia[]> {
    // Por enquanto retornamos vazio, mas aqui poderia integrar APIs reais
    // como ExerciseDB, Wger API, etc.
    
    // Simulação de busca bem-sucedida para exercícios comuns
    const commonExercises: Record<string, ExerciseMedia[]> = {
      'supino': [
        {
          type: 'gif',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop&q=80',
          alt: 'Supino - Movimento Completo',
          thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop&q=60'
        }
      ],
      'agachamento': [
        {
          type: 'gif',
          url: 'https://images.unsplash.com/photo-1566241134466-a85a44b8f8a8?w=600&h=400&fit=crop&q=80', 
          alt: 'Agachamento - Movimento Completo',
          thumbnail: 'https://images.unsplash.com/photo-1566241134466-a85a44b8f8a8?w=150&h=150&fit=crop&q=60'
        }
      ]
    };
    
    const normalizedName = exerciseName.toLowerCase();
    return commonExercises[normalizedName] || [];
  }
  
  private getExerciseCategory(exerciseName: string): string {
    const normalizedName = exerciseName.toLowerCase();
    
    // Verificar mapeamento direto
    for (const [exercise, config] of Object.entries(this.EXERCISE_MAPPING)) {
      if (normalizedName.includes(exercise) || exercise.includes(normalizedName)) {
        return config.category;
      }
    }
    
    // Fallback por palavras-chave
    if (normalizedName.includes('supino') || normalizedName.includes('flexao') || normalizedName.includes('peitoral')) {
      return 'chest';
    }
    if (normalizedName.includes('remada') || normalizedName.includes('puxada') || normalizedName.includes('costas')) {
      return 'back';
    }
    if (normalizedName.includes('agachamento') || normalizedName.includes('leg') || normalizedName.includes('coxa')) {
      return 'legs';
    }
    if (normalizedName.includes('ombro') || normalizedName.includes('desenvolvimento')) {
      return 'shoulders';
    }
    if (normalizedName.includes('rosca') || normalizedName.includes('triceps') || normalizedName.includes('biceps')) {
      return 'arms';
    }
    
    return 'general';
  }
}

export const exerciseImageService = new ExerciseImageService();
