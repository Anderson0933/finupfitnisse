
import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // URLs de imagens confiáveis - usando diferentes services para maior confiabilidade
  private readonly RELIABLE_IMAGES: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=1',
        alt: 'Supino - Demonstração',
        thumbnail: 'https://picsum.photos/150/150?random=1'
      }
    ],
    'supino reto': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=2',
        alt: 'Supino Reto - Movimento',
        thumbnail: 'https://picsum.photos/150/150?random=2'
      }
    ],
    'supino inclinado': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=3',
        alt: 'Supino Inclinado - Posição',
        thumbnail: 'https://picsum.photos/150/150?random=3'
      }
    ],
    'flexao': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=4',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://picsum.photos/150/150?random=4'
      }
    ],
    'flexão': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=5',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://picsum.photos/150/150?random=5'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=6',
        alt: 'Remada - Posição',
        thumbnail: 'https://picsum.photos/150/150?random=6'
      }
    ],
    'puxada': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=7',
        alt: 'Puxada - Execução',
        thumbnail: 'https://picsum.photos/150/150?random=7'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=8',
        alt: 'Agachamento - Movimento',
        thumbnail: 'https://picsum.photos/150/150?random=8'
      }
    ],
    'leg press': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=9',
        alt: 'Leg Press - Execução',
        thumbnail: 'https://picsum.photos/150/150?random=9'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=10',
        alt: 'Desenvolvimento - Posição',
        thumbnail: 'https://picsum.photos/150/150?random=10'
      }
    ],
    'elevacao lateral': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=11',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://picsum.photos/150/150?random=11'
      }
    ],
    'elevação lateral': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=12',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://picsum.photos/150/150?random=12'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=13',
        alt: 'Rosca Direta - Bíceps',
        thumbnail: 'https://picsum.photos/150/150?random=13'
      }
    ],
    'rosca biceps': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=14',
        alt: 'Rosca Bíceps - Execução',
        thumbnail: 'https://picsum.photos/150/150?random=14'
      }
    ],
    'triceps': [
      {
        type: 'image',
        url: 'https://picsum.photos/600/400?random=15',
        alt: 'Tríceps - Posição',
        thumbnail: 'https://picsum.photos/150/150?random=15'
      }
    ]
  };

  // Fallback por categoria mais confiável
  private readonly CATEGORY_FALLBACKS: Record<string, ExerciseMedia> = {
    chest: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=101',
      alt: 'Exercício de Peitoral',
      thumbnail: 'https://picsum.photos/150/150?random=101'
    },
    back: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=102',
      alt: 'Exercício de Costas',
      thumbnail: 'https://picsum.photos/150/150?random=102'
    },
    legs: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=103',
      alt: 'Exercício de Pernas',
      thumbnail: 'https://picsum.photos/150/150?random=103'
    },
    shoulders: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=104',
      alt: 'Exercício de Ombros',
      thumbnail: 'https://picsum.photos/150/150?random=104'
    },
    arms: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=105',
      alt: 'Exercício de Braços',
      thumbnail: 'https://picsum.photos/150/150?random=105'
    },
    general: {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=106',
      alt: 'Exercício Físico',
      thumbnail: 'https://picsum.photos/150/150?random=106'
    }
  };

  // Fallback final - múltiplas opções confiáveis
  private readonly FINAL_FALLBACKS: ExerciseMedia[] = [
    {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Exercicio',
      alt: 'Exercício',
      thumbnail: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Ex'
    },
    {
      type: 'image',
      url: 'https://picsum.photos/600/400?random=999',
      alt: 'Exercício',  
      thumbnail: 'https://picsum.photos/150/150?random=999'
    }
  ];
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      console.log(`💾 Cache hit para: ${exerciseName}`);
      return this.exerciseCache.get(cacheKey)!;
    }
    
    console.log(`🔍 Buscando imagens para: ${exerciseName}`);
    
    try {
      // Tentar busca exata
      const exactMatch = this.findExactMatch(exerciseName);
      if (exactMatch) {
        console.log(`✅ Imagem específica encontrada para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, exactMatch);
        return exactMatch;
      }
      
      // Buscar por palavra-chave
      const keywordMatch = this.findKeywordMatch(exerciseName);
      if (keywordMatch) {
        console.log(`✅ Imagem por palavra-chave encontrada para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, keywordMatch);
        return keywordMatch;
      }
      
      // Usar fallback por categoria
      const category = this.getExerciseCategory(exerciseName);
      const fallbackImage = this.CATEGORY_FALLBACKS[category];
      const result = [{
        ...fallbackImage,
        alt: `${exerciseName} - ${fallbackImage.alt}`
      }];
      
      console.log(`📂 Usando imagem de categoria (${category}) para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar imagens para ${exerciseName}:`, error);
      
      // Retornar fallback final confiável
      const finalResult = [{
        ...this.FINAL_FALLBACKS[0],
        alt: `${exerciseName} - Demonstração`
      }];
      
      console.log(`🆘 Usando fallback final para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, finalResult);
      return finalResult;
    }
  }
  
  private findExactMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase().trim();
    return this.RELIABLE_IMAGES[normalizedName] || null;
  }
  
  private findKeywordMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase();
    
    for (const [key, images] of Object.entries(this.RELIABLE_IMAGES)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return images;
      }
    }
    
    return null;
  }
  
  private getExerciseCategory(exerciseName: string): string {
    const normalizedName = exerciseName.toLowerCase();
    
    if (normalizedName.includes('supino') || normalizedName.includes('flexao') || 
        normalizedName.includes('peitoral') || normalizedName.includes('crucifixo')) {
      return 'chest';
    }
    
    if (normalizedName.includes('remada') || normalizedName.includes('puxada') || 
        normalizedName.includes('costas') || normalizedName.includes('pull')) {
      return 'back';
    }
    
    if (normalizedName.includes('agachamento') || normalizedName.includes('leg') || 
        normalizedName.includes('coxa') || normalizedName.includes('perna') ||
        normalizedName.includes('quadriceps') || normalizedName.includes('gluteo')) {
      return 'legs';
    }
    
    if (normalizedName.includes('ombro') || normalizedName.includes('desenvolvimento') ||
        normalizedName.includes('elevacao') || normalizedName.includes('deltoid')) {
      return 'shoulders';
    }
    
    if (normalizedName.includes('rosca') || normalizedName.includes('triceps') || 
        normalizedName.includes('biceps') || normalizedName.includes('braco')) {
      return 'arms';
    }
    
    return 'general';
  }
}

export const exerciseImageService = new ExerciseImageService();
