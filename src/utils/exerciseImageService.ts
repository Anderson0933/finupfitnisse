
import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // GIFs demonstrativos específicos para exercícios
  private readonly EXERCISE_GIFS: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Supino - Demonstração do movimento completo',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'supino reto': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&h=400&fit=crop',
        alt: 'Supino Reto - Execução com barra, movimento de descida e subida',
        thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=150&h=150&fit=crop'
      }
    ],
    'supino inclinado': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
        alt: 'Supino Inclinado - Ângulo de 45°, movimento controlado',
        thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=150&h=150&fit=crop'
      }
    ],
    'flexao': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Flexão - Movimento de descida e subida, corpo alinhado',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    'flexão': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
        alt: 'Flexão de Braço - Cadência controlada, 2 segundos para descer',
        thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
        alt: 'Remada - Puxada com cotovelos junto ao corpo, escápulas unidas',
        thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
      }
    ],
    'puxada': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
        alt: 'Puxada - Movimento amplo, ativação do latíssimo do dorso',
        thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
        alt: 'Agachamento - Descida até 90°, joelhos alinhados com os pés',
        thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
      }
    ],
    'leg press': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
        alt: 'Leg Press - Movimento completo, pés na largura dos ombros',
        thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Desenvolvimento - Movimento vertical, ombros estabilizados',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    'elevacao lateral': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Movimento controlado até a altura dos ombros',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    'elevação lateral': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
        alt: 'Elevação Lateral - Evitar usar o impulso, movimento isolado',
        thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Rosca Direta - Flexão do bíceps, cotovelos fixos',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    'rosca biceps': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Rosca Bíceps - Contração máxima no topo do movimento',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ],
    'triceps': [
      {
        type: 'gif',
        url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
        alt: 'Tríceps - Extensão completa, movimento controlado',
        thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
      }
    ]
  };

  // Mapeamento de palavras-chave para demonstrações por categoria
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

  // GIFs demonstrativos por categoria muscular
  private readonly CATEGORY_GIFS: Record<string, ExerciseMedia> = {
    chest: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Exercício de Peitoral - Demonstração dos movimentos básicos',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    },
    back: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600&h=400&fit=crop',
      alt: 'Exercício de Costas - Demonstração da técnica correta',
      thumbnail: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=150&h=150&fit=crop'
    },
    legs: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=600&h=400&fit=crop',
      alt: 'Exercício de Pernas - Demonstração do movimento completo',
      thumbnail: 'https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?w=150&h=150&fit=crop'
    },
    shoulders: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=600&h=400&fit=crop',
      alt: 'Exercício de Ombros - Demonstração da amplitude correta',
      thumbnail: 'https://images.unsplash.com/photo-1583500178690-f7fd1d14d2ad?w=150&h=150&fit=crop'
    },
    arms: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=600&h=400&fit=crop',
      alt: 'Exercício de Braços - Demonstração da execução perfeita',
      thumbnail: 'https://images.unsplash.com/photo-1605296867304-46d5465a13f1?w=150&h=150&fit=crop'
    },
    general: {
      type: 'gif',
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=400&fit=crop',
      alt: 'Demonstração de Exercício - Forma e técnica corretas',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop'
    }
  };

  // Fallback final confiável
  private readonly FINAL_FALLBACK: ExerciseMedia = {
    type: 'gif',
    url: 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Demonstracao+do+Exercicio',
    alt: 'Demonstração do Exercício - Como executar corretamente',
    thumbnail: 'https://via.placeholder.com/150x150/3b82f6/ffffff?text=Demo'
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      console.log(`💾 Cache hit para demonstração: ${exerciseName}`);
      return this.exerciseCache.get(cacheKey)!;
    }
    
    console.log(`🎬 Buscando demonstração em GIF para: ${exerciseName}`);
    
    try {
      // 1. Busca exata no nome do exercício
      const exactMatch = this.findExactGif(exerciseName);
      if (exactMatch) {
        console.log(`✅ GIF específico encontrado para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, exactMatch);
        return exactMatch;
      }
      
      // 2. Busca por palavra-chave no nome
      const keywordMatch = this.findKeywordGif(exerciseName);
      if (keywordMatch) {
        console.log(`✅ GIF por palavra-chave encontrado para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, keywordMatch);
        return keywordMatch;
      }
      
      // 3. Busca por categoria muscular
      const category = this.getExerciseCategory(exerciseName);
      const categoryGif = this.CATEGORY_GIFS[category];
      if (categoryGif) {
        const result = [{
          ...categoryGif,
          alt: `${exerciseName} - ${categoryGif.alt}`
        }];
        
        console.log(`📂 Usando GIF de categoria (${category}) para: ${exerciseName}`);
        this.exerciseCache.set(cacheKey, result);
        return result;
      }
      
      // 4. Fallback final
      const finalResult = [{
        ...this.FINAL_FALLBACK,
        alt: `${exerciseName} - Demonstração da execução correta`
      }];
      
      console.log(`🆘 Usando GIF fallback para: ${exerciseName}`);
      this.exerciseCache.set(cacheKey, finalResult);
      return finalResult;
      
    } catch (error) {
      console.error(`❌ Erro ao buscar demonstração para ${exerciseName}:`, error);
      
      const errorResult = [{
        ...this.FINAL_FALLBACK,
        alt: `${exerciseName} - Demonstração da execução correta`
      }];
      
      this.exerciseCache.set(cacheKey, errorResult);
      return errorResult;
    }
  }
  
  private findExactGif(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase().trim();
    return this.EXERCISE_GIFS[normalizedName] || null;
  }
  
  private findKeywordGif(exerciseName: string): ExerciseMedia[] | null {
    const normalizedName = exerciseName.toLowerCase();
    
    // Busca por palavras-chave no nome do exercício
    for (const [keyword, category] of Object.entries(this.KEYWORD_MAPPING)) {
      if (normalizedName.includes(keyword)) {
        console.log(`🔍 Palavra-chave "${keyword}" encontrada para categoria: ${category}`);
        
        // Primeiro tenta encontrar um GIF específico
        for (const [exerciseKey, gifs] of Object.entries(this.EXERCISE_GIFS)) {
          if (exerciseKey.includes(keyword)) {
            return gifs;
          }
        }
        
        // Se não encontrou específico, usa o GIF da categoria
        const categoryGif = this.CATEGORY_GIFS[category];
        if (categoryGif) {
          return [categoryGif];
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
