import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // URLs de imagens do Unsplash com IDs específicos e confiáveis
  private readonly RELIABLE_IMAGES: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Supino Reto - Posição Inicial',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'supino reto': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Supino Reto - Movimento',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'supino inclinado': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584380931214-dbb5b72e6232?w=600&h=400&fit=crop',
        alt: 'Supino Inclinado - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1584380931214-dbb5b72e6232?w=150&h=150&fit=crop'
      }
    ],
    'flexao': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    'flexão': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
        alt: 'Remada Curvada - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop'
      }
    ],
    'puxada': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=600&h=400&fit=crop',
        alt: 'Puxada Frontal - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1594737625785-a6cbdabd333c?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1566241142205-ec39cb545736?w=600&h=400&fit=crop',
        alt: 'Agachamento Livre - Movimento',
        thumbnail: 'https://images.unsplash.com/photo-1566241142205-ec39cb545736?w=150&h=150&fit=crop'
      }
    ],
    'leg press': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=600&h=400&fit=crop',
        alt: 'Leg Press - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
        alt: 'Desenvolvimento - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
      }
    ],
    'elevacao lateral': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'elevação lateral': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
        alt: 'Rosca Direta - Bíceps',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
      }
    ],
    'rosca biceps': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
        alt: 'Rosca Bíceps - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
      }
    ],
    'triceps': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
        alt: 'Tríceps Testa - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop'
      }
    ]
  };

  // Fallback por categoria com URLs mais confiáveis
  private readonly CATEGORY_FALLBACKS: Record<string, ExerciseMedia> = {
    chest: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Exercício de Peitoral',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    },
    back: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
      alt: 'Exercício de Costas',
      thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=150&h=150&fit=crop'
    },
    legs: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1566241142205-ec39cb545736?w=600&h=400&fit=crop',
      alt: 'Exercício de Pernas',
      thumbnail: 'https://images.unsplash.com/photo-1566241142205-ec39cb545736?w=150&h=150&fit=crop'
    },
    shoulders: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
      alt: 'Exercício de Ombros',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
    },
    arms: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
      alt: 'Exercício de Braços',
      thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
    },
    general: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Exercício Físico',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    }
  };

  // Fallback final sempre funcional
  private readonly FINAL_FALLBACK: ExerciseMedia = {
    type: 'image',
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwSDM1MFYyNTBIMjUwVjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRLEHT+",
    alt: 'Exercício',
    thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA2MEg5MFY5MEg2MFY2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRLEHT+
  };
  
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
        await this.validateImages(exactMatch);
        this.exerciseCache.set(cacheKey, exactMatch);
        return exactMatch;
      }
      
      // Buscar por palavra-chave
      const keywordMatch = this.findKeywordMatch(exerciseName);
      if (keywordMatch) {
        console.log(`✅ Imagem por palavra-chave encontrada para: ${exerciseName}`);
        await this.validateImages(keywordMatch);
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
      await this.validateImages(result);
      this.exerciseCache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar imagens para ${exerciseName}:`, error);
      
      // Retornar fallback final
      const finalResult = [{
        ...this.FINAL_FALLBACK,
        alt: `${exerciseName} - Demonstração`
      }];
      
      console.log(`🆘 Usando fallback final para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, finalResult);
      return finalResult;
    }
  }

  private async validateImages(images: ExerciseMedia[]): Promise<void> {
    for (const image of images) {
      try {
        await this.testImageLoad(image.url);
      } catch (error) {
        console.warn(`⚠️ Falha ao carregar imagem ${image.url}, usando fallback`);
        image.url = this.FINAL_FALLBACK.url;
        image.thumbnail = this.FINAL_FALLBACK.thumbnail;
      }
    }
  }

  private testImageLoad(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
      
      // Timeout após 5 segundos
      setTimeout(() => reject(new Error('Image load timeout')), 5000);
    });
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
