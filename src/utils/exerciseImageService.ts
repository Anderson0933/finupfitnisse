
import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // Imagens específicas para exercícios - usando URLs mais confiáveis
  private readonly EXERCISE_IMAGES: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Supino - Demonstração',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'supino reto': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
        alt: 'Supino Reto - Posição Correta',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
      }
    ],
    'supino inclinado': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
        alt: 'Supino Inclinado - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop'
      }
    ],
    'flexao': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Flexão de Braço - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'flexão': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
        alt: 'Remada - Posição Correta',
        thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
      }
    ],
    'puxada': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
        alt: 'Puxada - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
        alt: 'Agachamento - Movimento Correto',
        thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
      }
    ],
    'leg press': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
        alt: 'Leg Press - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Desenvolvimento - Posição Correta',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    'elevacao lateral': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    'elevação lateral': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Rosca Direta - Bíceps',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    'rosca biceps': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Rosca Bíceps - Posição',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    'triceps': [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Tríceps - Execução',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ]
  };

  // Mapeamento de palavras-chave para categorias com imagens específicas
  private readonly KEYWORD_MAPPING: Record<string, string> = {
    // Peitoral
    'supino': 'chest',
    'peitoral': 'chest',
    'crucifixo': 'chest',
    'flexao': 'chest',
    'flexão': 'chest',
    
    // Costas
    'remada': 'back',
    'puxada': 'back',
    'costas': 'back',
    'pull': 'back',
    'lat': 'back',
    
    // Pernas
    'agachamento': 'legs',
    'leg': 'legs',
    'coxa': 'legs',
    'perna': 'legs',
    'quadriceps': 'legs',
    'gluteo': 'legs',
    'glúteo': 'legs',
    
    // Ombros
    'ombro': 'shoulders',
    'desenvolvimento': 'shoulders',
    'elevacao': 'shoulders',
    'elevação': 'shoulders',
    'deltoid': 'shoulders',
    
    // Braços
    'rosca': 'arms',
    'triceps': 'arms',
    'tríceps': 'arms',
    'biceps': 'arms',
    'bíceps': 'arms',
    'braco': 'arms',
    'braço': 'arms'
  };

  // Imagens por categoria
  private readonly CATEGORY_IMAGES: Record<string, ExerciseMedia> = {
    chest: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Exercício de Peitoral',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    },
    back: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
      alt: 'Exercício de Costas',
      thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
    },
    legs: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
      alt: 'Exercício de Pernas',
      thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
    },
    shoulders: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
      alt: 'Exercício de Ombros',
      thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
    },
    arms: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
      alt: 'Exercício de Braços',
      thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
    },
    general: {
      type: 'image',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Exercício Físico',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    }
  };

  // Fallback final mais confiável
  private readonly FINAL_FALLBACK: ExerciseMedia = {
    type: 'image',
    url: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Exercicio',
    alt: 'Exercício',
    thumbnail: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Ex'
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      console.log(`💾 Cache hit para: ${exerciseName}`);
      return this.exerciseCache.get(cacheKey)!;
    }
    
    console.log(`🔍 Buscando imagens específicas para: ${exerciseName}`);
    
    try {
      // 1. Busca exata no nome do exercício
      const exactMatch = this.findExactMatch(exerciseName);
      if (exactMatch) {
        console.log(`✅ Imagem específica encontrada para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, exactMatch);
        return exactMatch;
      }
      
      // 2. Busca por palavra-chave no nome
      const keywordMatch = this.findKeywordMatch(exerciseName);
      if (keywordMatch) {
        console.log(`✅ Imagem por palavra-chave encontrada para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, keywordMatch);
        return keywordMatch;
      }
      
      // 3. Busca por categoria muscular
      const category = this.getExerciseCategory(exerciseName);
      const categoryImage = this.CATEGORY_IMAGES[category];
      if (categoryImage) {
        const result = [{
          ...categoryImage,
          alt: `${exerciseName} - ${categoryImage.alt}`
        }];
        
        console.log(`📂 Usando imagem de categoria (${category}) para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, result);
        return result;
      }
      
      // 4. Fallback final
      const finalResult = [{
        ...this.FINAL_FALLBACK,
        alt: `${exerciseName} - Demonstração`
      }];
      
      console.log(`🆘 Usando fallback final para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, finalResult);
      return finalResult;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar imagens para ${exerciseName}:`, error);
      
      const errorResult = [{
        ...this.FINAL_FALLBACK,
        alt: `${exerciseName} - Demonstração`
      }];
      
      this.exerciseCache.set(cacheKey, errorResult);
      return errorResult;
    }
  }
  
  private findExactMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase().trim();
    return this.EXERCISE_IMAGES[normalizedName] || null;
  }
  
  private findKeywordMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase();
    
    // Busca por palavras-chave no nome do exercício
    for (const [keyword, category] of Object.entries(this.KEYWORD_MAPPING)) {
      if (normalizedName.includes(keyword)) {
        console.log(`🔍 Palavra-chave "${keyword}" encontrada para categoria: ${category}`);
        
        // Primeiro tenta encontrar uma imagem específica
        for (const [exerciseKey, images] of Object.entries(this.EXERCISE_IMAGES)) {
          if (exerciseKey.includes(keyword)) {
            return images;
          }
        }
        
        // Se não encontrou específica, usa a imagem da categoria
        const categoryImage = this.CATEGORY_IMAGES[category];
        if (categoryImage) {
          return [categoryImage];
        }
      }
    }
    
    return null;
  }
  
  private getExerciseCategory(exerciseName: string): string {
    const normalizedName = exerciseName.toLowerCase();
    
    // Busca por palavras-chave para determinar categoria
    for (const [keyword, category] of Object.entries(this.KEYWORD_MAPPING)) {
      if (normalizedName.includes(keyword)) {
        return category;
      }
    }
    
    return 'general';
  }
}

export const exerciseImageService = new ExerciseImageService();
