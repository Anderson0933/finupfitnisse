
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { ExerciseMedia } from '@/types/exercise';
import { exerciseImageService } from '@/utils/exerciseImageService';

interface ExerciseImageViewerProps {
  exerciseName: string;
  media?: ExerciseMedia[];
}

const ExerciseImageViewer = ({ exerciseName, media }: ExerciseImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exerciseMedia, setExerciseMedia] = useState<ExerciseMedia[]>(media || []);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [hasImageError, setHasImageError] = useState(false);

  // Carregar imagens reais se não foram fornecidas
  useEffect(() => {
    if (!media || media.length === 0) {
      loadExerciseImages();
    }
  }, [exerciseName, media]);

  const loadExerciseImages = async () => {
    setIsLoading(true);
    setImageError(null);
    setHasImageError(false);
    
    try {
      console.log(`Carregando imagens para: ${exerciseName}`);
      const images = await exerciseImageService.searchExerciseImages(exerciseName);
      console.log(`Encontradas ${images.length} imagens para ${exerciseName}:`, images);
      setExerciseMedia(images);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      setImageError('Não foi possível carregar as imagens do exercício');
      // Definir fallback direto
      setExerciseMedia([
        {
          type: 'image',
          url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
          alt: `${exerciseName} - Demonstração`,
          thumbnail: ''
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMedia = exerciseMedia[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % exerciseMedia.length);
    setHasImageError(false);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + exerciseMedia.length) % exerciseMedia.length);
    setHasImageError(false);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.warn(`Erro ao carregar imagem: ${currentMedia?.url}`);
    setHasImageError(true);
    
    // Tentar carregar uma imagem de fallback mais genérica
    const target = e.target as HTMLImageElement;
    const fallbackUrl = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80';
    
    if (target.src !== fallbackUrl) {
      target.src = fallbackUrl;
    }
  };

  // Auto-play para múltiplas imagens
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && exerciseMedia.length > 1) {
      interval = setInterval(() => {
        nextImage();
      }, 3000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, exerciseMedia.length]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
              <p className="text-gray-500">Carregando demonstração...</p>
              <p className="text-xs text-gray-400">Buscando a melhor imagem para {exerciseName}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exerciseMedia || exerciseMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Imagens não disponíveis</p>
                <p className="text-sm text-gray-400">{exerciseName}</p>
              </div>
              <Button 
                onClick={loadExerciseImages}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Carregar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="space-y-0">
          {/* Área de exibição principal */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group">
            <div className="aspect-video flex items-center justify-center min-h-[300px]">
              {currentMedia && (
                <div className="relative w-full h-full">
                  {hasImageError ? (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <div className="text-center space-y-2">
                        <AlertCircle className="h-8 w-8 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500">Imagem não disponível</p>
                        <p className="text-xs text-gray-400">{exerciseName}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={currentMedia.url}
                        alt={currentMedia.alt}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={handleImageError}
                        loading="lazy"
                      />
                      
                      {/* Overlay com tipo de mídia */}
                      <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                        {currentMedia.type === 'gif' && '🎬 Demonstração'}
                        {currentMedia.type === 'image' && '📸 Posição'}
                        {currentMedia.type === 'video' && '🎥 Vídeo'}
                      </div>
                      
                      {/* Indicador de erro de carregamento anterior */}
                      {imageError && (
                        <div className="absolute top-3 right-3 bg-yellow-500 bg-opacity-90 text-white px-2 py-1 rounded text-xs">
                          ⚠️ Fallback
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Controles de navegação */}
            {exerciseMedia.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="secondary"
                  size="sm"
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-90 hover:opacity-100 transition-opacity bg-white shadow-lg border"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="secondary"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-90 hover:opacity-100 transition-opacity bg-white shadow-lg border"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Controles inferiores */}
          <div className="p-4 space-y-4">
            {/* Indicadores e controles */}
            {exerciseMedia.length > 1 && (
              <div className="flex justify-center items-center gap-4">
                <div className="flex space-x-2">
                  {exerciseMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setCurrentIndex(index);
                        setHasImageError(false);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-blue-500 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-3 py-1 h-7"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 mr-1" />
                      Auto
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Informações da mídia */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="flex items-center gap-1 text-gray-600">
                  {currentMedia?.type === 'gif' && '🎬 Demonstração Animada'}
                  {currentMedia?.type === 'image' && '📸 Posição Correta'}
                  {currentMedia?.type === 'video' && '🎥 Vídeo Demonstrativo'}
                </span>
                {exerciseMedia.length > 1 && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {currentIndex + 1} de {exerciseMedia.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">{exerciseName}</p>
                <p className="text-xs text-gray-500">{currentMedia?.alt}</p>
              </div>
              
              {imageError && (
                <div className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                  💡 Usando imagem alternativa - algumas imagens podem não estar disponíveis
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
