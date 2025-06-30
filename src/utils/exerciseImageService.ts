
import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // URLs de imagens estáveis e confiáveis
  private readonly RELIABLE_IMAGES: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Supino+Reto',
        alt: 'Supino Reto - Posição Inicial',
        thumbnail: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Supino'
      }
    ],
    'supino reto': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Supino+Reto',
        alt: 'Supino Reto - Movimento',
        thumbnail: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Supino'
      }
    ],
    'supino inclinado': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/10B981/FFFFFF?text=Supino+Inclinado',
        alt: 'Supino Inclinado - Posição',
        thumbnail: 'https://via.placeholder.com/150x150/10B981/FFFFFF?text=Inclinado'
      }
    ],
    'flexao': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Flexao+de+Braco',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Flexao'
      }
    ],
    'flexão': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/F59E0B/FFFFFF?text=Flexao+de+Braco',
        alt: 'Flexão de Braço - Execução',
        thumbnail: 'https://via.placeholder.com/150x150/F59E0B/FFFFFF?text=Flexao'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Remada+Curvada',
        alt: 'Remada Curvada - Posição',
        thumbnail: 'https://via.placeholder.com/150x150/DC2626/FFFFFF?text=Remada'
      }
    ],
    'puxada': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/7C3AED/FFFFFF?text=Puxada+Frontal',
        alt: 'Puxada Frontal - Execução',
        thumbnail: 'https://via.placeholder.com/150x150/7C3AED/FFFFFF?text=Puxada'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/059669/FFFFFF?text=Agachamento+Livre',
        alt: 'Agachamento Livre - Movimento',
        thumbnail: 'https://via.placeholder.com/150x150/059669/FFFFFF?text=Agachamento'
      }
    ],
    'leg press': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/B91C1C/FFFFFF?text=Leg+Press',
        alt: 'Leg Press - Execução',
        thumbnail: 'https://via.placeholder.com/150x150/B91C1C/FFFFFF?text=Leg+Press'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/EA580C/FFFFFF?text=Desenvolvimento',
        alt: 'Desenvolvimento - Posição',
        thumbnail: 'https://via.placeholder.com/150x150/EA580C/FFFFFF?text=Desenvolvimento'
      }
    ],
    'elevacao lateral': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/7C2D12/FFFFFF?text=Elevacao+Lateral',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://via.placeholder.com/150x150/7C2D12/FFFFFF?text=Elevacao'
      }
    ],
    'elevação lateral': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/7C2D12/FFFFFF?text=Elevacao+Lateral',
        alt: 'Elevação Lateral - Movimento',
        thumbnail: 'https://via.placeholder.com/150x150/7C2D12/FFFFFF?text=Elevacao'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Rosca+Direta',
        alt: 'Rosca Direta - Bíceps',
        thumbnail: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Rosca'
      }
    ],
    'rosca biceps': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Rosca+Biceps',
        alt: 'Rosca Bíceps - Execução',
        thumbnail: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Biceps'
      }
    ],
    'triceps': [
      {
        type: 'image',
        url: 'https://via.placeholder.com/600x400/EC4899/FFFFFF?text=Triceps+Testa',
        alt: 'Tríceps Testa - Posição',
        thumbnail: 'https://via.placeholder.com/150x150/EC4899/FFFFFF?text=Triceps'
      }
    ]
  };

  // Fallback geral por categoria
  private readonly CATEGORY_FALLBACKS: Record<string, ExerciseMedia> = {
    chest: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/3B82F6/FFFFFF?text=Exercicio+de+Peitoral',
      alt: 'Exercício de Peitoral',
      thumbnail: 'https://via.placeholder.com/150x150/3B82F6/FFFFFF?text=Peitoral'
    },
    back: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Exercicio+de+Costas',
      alt: 'Exercício de Costas',
      thumbnail: 'https://via.placeholder.com/150x150/DC2626/FFFFFF?text=Costas'
    },
    legs: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/059669/FFFFFF?text=Exercicio+de+Pernas',
      alt: 'Exercício de Pernas',
      thumbnail: 'https://via.placeholder.com/150x150/059669/FFFFFF?text=Pernas'
    },
    shoulders: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/EA580C/FFFFFF?text=Exercicio+de+Ombros',
      alt: 'Exercício de Ombros',
      thumbnail: 'https://via.placeholder.com/150x150/EA580C/FFFFFF?text=Ombros'
    },
    arms: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/8B5CF6/FFFFFF?text=Exercicio+de+Bracos',
      alt: 'Exercício de Braços',
      thumbnail: 'https://via.placeholder.com/150x150/8B5CF6/FFFFFF?text=Bracos'
    },
    general: {
      type: 'image',
      url: 'https://via.placeholder.com/600x400/6B7280/FFFFFF?text=Exercicio+Fisico',
      alt: 'Exercício Físico',
      thumbnail: 'https://via.placeholder.com/150x150/6B7280/FFFFFF?text=Exercicio'
    }
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      return this.exerciseCache.get(cacheKey)!;
    }
    
    console.log(`🔍 Buscando imagens para: ${exerciseName}`);
    
    // Primeiro tentar busca exata
    const exactMatch = this.findExactMatch(exerciseName);
    if (exactMatch) {
      console.log(`✅ Encontrada imagem específica para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, exactMatch);
      return exactMatch;
    }
    
    // Buscar por palavra-chave
    const keywordMatch = this.findKeywordMatch(exerciseName);
    if (keywordMatch) {
      console.log(`✅ Encontrada imagem por palavra-chave para: ${exerciseName}`);
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
    
    console.log(`📸 Usando imagem de categoria (${category}) para: ${exerciseName}`);
    this.exerciseCache.set(cacheKey, result);
    return result;
  }
  
  private findExactMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase().trim();
    return this.RELIABLE_IMAGES[normalizedName] || null;
  }
  
  private findKeywordMatch(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase();
    
    // Buscar por palavras-chave
    for (const [key, images] of Object.entries(this.RELIABLE_IMAGES)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        return images;
      }
    }
    
    return null;
  }
  
  private getExerciseCategory(exerciseName: string): string {
    const normalizedName = exerciseName.toLowerCase();
    
    // Peitoral
    if (normalizedName.includes('supino') || normalizedName.includes('flexao') || 
        normalizedName.includes('peitoral') || normalizedName.includes('crucifixo')) {
      return 'chest';
    }
    
    // Costas
    if (normalizedName.includes('remada') || normalizedName.includes('puxada') || 
        normalizedName.includes('costas') || normalizedName.includes('pull')) {
      return 'back';
    }
    
    // Pernas
    if (normalizedName.includes('agachamento') || normalizedName.includes('leg') || 
        normalizedName.includes('coxa') || normalizedName.includes('perna') ||
        normalizedName.includes('quadriceps') || normalizedName.includes('gluteo')) {
      return 'legs';
    }
    
    // Ombros
    if (normalizedName.includes('ombro') || normalizedName.includes('desenvolvimento') ||
        normalizedName.includes('elevacao') || normalizedName.includes('deltoid')) {
      return 'shoulders';
    }
    
    // Braços
    if (normalizedName.includes('rosca') || normalizedName.includes('triceps') || 
        normalizedName.includes('biceps') || normalizedName.includes('braco')) {
      return 'arms';
    }
    
    return 'general';
  }
}

export const exerciseImageService = new ExerciseImageService();
