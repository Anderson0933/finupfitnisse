
import { ExerciseMedia } from '@/types/exercise';

class ExerciseImageService {
  private exerciseCache = new Map<string, ExerciseMedia[]>();
  
  // GIFs demonstrativos reais de exercícios
  private readonly EXERCISE_GIFS: Record<string, ExerciseMedia[]> = {
    // Exercícios de peitoral
    'supino': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif',
        alt: 'Supino - Demonstração do movimento completo',
        thumbnail: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/200.gif'
      }
    ],
    'supino reto': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/giphy.gif',
        alt: 'Supino Reto - Execução com barra, movimento de descida e subida',
        thumbnail: 'https://media.giphy.com/media/l0HlBO7eyXzSZkJri/200.gif'
      }
    ],
    'supino inclinado': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif',
        alt: 'Supino Inclinado - Ângulo de 45°, movimento controlado',
        thumbnail: 'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/200.gif'
      }
    ],
    'flexao': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/giphy.gif',
        alt: 'Flexão - Movimento de descida e subida, corpo alinhado',
        thumbnail: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/200.gif'
      }
    ],
    'flexão': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/giphy.gif',
        alt: 'Flexão de Braço - Cadência controlada, 2 segundos para descer',
        thumbnail: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/200.gif'
      }
    ],
    
    // Exercícios de costas
    'remada': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif',
        alt: 'Remada - Puxada com cotovelos junto ao corpo, escápulas unidas',
        thumbnail: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/200.gif'
      }
    ],
    'puxada': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/giphy.gif',
        alt: 'Puxada - Movimento amplo, ativação do latíssimo do dorso',
        thumbnail: 'https://media.giphy.com/media/26tn33aiTi1jkl6H6/200.gif'
      }
    ],
    
    // Exercícios de pernas
    'agachamento': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        alt: 'Agachamento - Descida até 90°, joelhos alinhados com os pés',
        thumbnail: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif'
      }
    ],
    'leg press': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/giphy.gif',
        alt: 'Leg Press - Movimento completo, pés na largura dos ombros',
        thumbnail: 'https://media.giphy.com/media/3oKIPnAiaMCws8nOsE/200.gif'
      }
    ],
    
    // Exercícios de ombro
    'desenvolvimento': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
        alt: 'Desenvolvimento - Movimento vertical, ombros estabilizados',
        thumbnail: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/200.gif'
      }
    ],
    'elevacao lateral': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3oKIPfnmN9NEqiMUDu/giphy.gif',
        alt: 'Elevação Lateral - Movimento controlado até a altura dos ombros',
        thumbnail: 'https://media.giphy.com/media/3oKIPfnmN9NEqiMUDu/200.gif'
      }
    ],
    'elevação lateral': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3oKIPfnmN9NEqiMUDu/giphy.gif',
        alt: 'Elevação Lateral - Evitar usar o impulso, movimento isolado',
        thumbnail: 'https://media.giphy.com/media/3oKIPfnmN9NEqiMUDu/200.gif'
      }
    ],
    
    // Exercícios de braço
    'rosca direta': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/giphy.gif',
        alt: 'Rosca Direta - Flexão do bíceps, cotovelos fixos',
        thumbnail: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/200.gif'
      }
    ],
    'rosca biceps': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/giphy.gif',
        alt: 'Rosca Bíceps - Contração máxima no topo do movimento',
        thumbnail: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/200.gif'
      }
    ],
    'triceps': [
      {
        type: 'gif',
        url: 'https://media.giphy.com/media/3oKIPnKuS9W7IjNkFO/giphy.gif',
        alt: 'Tríceps - Extensão completa, movimento controlado',
        thumbnail: 'https://media.giphy.com/media/3oKIPnKuS9W7IjNkFO/200.gif'
      }
    ]
  };

  // Mapeamento de palavras-chave para GIFs por categoria
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

  // GIFs demonstrativos por categoria muscular (URLs do Giphy)
  private readonly CATEGORY_GIFS: Record<string, ExerciseMedia> = {
    chest: {
      type: 'gif',
      url: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/giphy.gif',
      alt: 'Exercício de Peitoral - Demonstração dos movimentos básicos',
      thumbnail: 'https://media.giphy.com/media/3o7TKqnN349PBUtGFO/200.gif'
    },
    back: {
      type: 'gif',
      url: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/giphy.gif',
      alt: 'Exercício de Costas - Demonstração da técnica correta',
      thumbnail: 'https://media.giphy.com/media/l0HlPystfePnAI3G8/200.gif'
    },
    legs: {
      type: 'gif',
      url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
      alt: 'Exercício de Pernas - Demonstração do movimento completo',
      thumbnail: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif'
    },
    shoulders: {
      type: 'gif',
      url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
      alt: 'Exercício de Ombros - Demonstração da amplitude correta',
      thumbnail: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/200.gif'
    },
    arms: {
      type: 'gif',
      url: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/giphy.gif',
      alt: 'Exercício de Braços - Demonstração da execução perfeita',
      thumbnail: 'https://media.giphy.com/media/l0HlsJ0VqTbOSdRyE/200.gif'
    },
    general: {
      type: 'gif',
      url: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/giphy.gif',
      alt: 'Demonstração de Exercício - Forma e técnica corretas',
      thumbnail: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/200.gif'
    }
  };

  // Fallback final com GIF genérico de exercício
  private readonly FINAL_FALLBACK: ExerciseMedia = {
    type: 'gif',
    url: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/giphy.gif',
    alt: 'Demonstração do Exercício - Como executar corretamente',
    thumbnail: 'https://media.giphy.com/media/SVCSsoKU5v6ZJLa4eq/200.gif'
  };
  
  async searchExerciseImages(exerciseName: string): Promise<ExerciseMedia[]> {
    const cacheKey = exerciseName.toLowerCase();
    
    if (this.exerciseCache.has(cacheKey)) {
      console.log(`💾 Cache hit para demonstração: ${exerciseName}`);
      return this.exerciseCache.get(cacheKey)!;
    }
    
    console.log(`🎬 Buscando GIF demonstrativo para: ${exerciseName}`);
    
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
      
      // 4. Fallback final com GIF genérico
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
