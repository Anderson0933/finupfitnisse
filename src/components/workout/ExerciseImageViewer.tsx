
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
  const [exerciseMedia, setExerciseMedia] = useState<ExerciseMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // SEMPRE carregar imagens quando o componente monta ou exercício muda
  useEffect(() => {
    console.log(`🖼️ ExerciseImageViewer: Carregando imagens para ${exerciseName}`);
    loadExerciseImages();
  }, [exerciseName]);

  const loadExerciseImages = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      console.log(`🔄 Iniciando carregamento de imagens para: ${exerciseName}`);
      const images = await exerciseImageService.searchExerciseImages(exerciseName);
      
      console.log(`📥 Imagens recebidas para ${exerciseName}:`, images);
      
      if (images && images.length > 0) {
        console.log(`✅ ${images.length} imagens carregadas para ${exerciseName}`);
        setExerciseMedia(images);
        setCurrentIndex(0);
        setHasError(false);
      } else {
        console.error(`❌ Nenhuma imagem retornada para ${exerciseName}`);
        setHasError(true);
      }
    } catch (error) {
      console.error(`💥 Erro crítico ao carregar imagens para ${exerciseName}:`, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const currentMedia = exerciseMedia[currentIndex];

  const nextImage = () => {
    if (exerciseMedia.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % exerciseMedia.length);
    }
  };

  const prevImage = () => {
    if (exerciseMedia.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + exerciseMedia.length) % exerciseMedia.length);
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
  }, [isPlaying, exerciseMedia.length, currentIndex]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
              <div>
                <p className="font-medium text-blue-700">Carregando demonstração</p>
                <p className="text-sm text-blue-600">{exerciseName}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (hasError || !exerciseMedia || exerciseMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Erro ao carregar imagem</p>
                <p className="text-sm text-gray-400">{exerciseName}</p>
              </div>
              <Button 
                onClick={loadExerciseImages}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
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
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                    onLoad={() => {
                      console.log(`✅ Imagem carregada com sucesso: ${currentMedia.url}`);
                    }}
                    onError={(e) => {
                      console.error(`❌ Erro ao carregar imagem: ${currentMedia.url}`);
                      const target = e.target as HTMLImageElement;
                      
                      // Tentar fallback simples
                      if (!target.src.includes('data:image')) {
                        console.log(`🔄 Tentando fallback para: ${exerciseName}`);
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMTUwSDM1MFYyNTBIMjUwVjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRLEHT+';
                      }
                    }}
                  />
                  
                  {/* Overlay com tipo de mídia */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                    {currentMedia.type === 'gif' && '🎬 Demonstração'}
                    {currentMedia.type === 'image' && '📸 Posição'}
                    {currentMedia.type === 'video' && '🎥 Vídeo'}
                  </div>
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
            {exerciseMedia.length > 1 && (
              <div className="flex justify-center items-center gap-4">
                <div className="flex space-x-2">
                  {exerciseMedia.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                        index === currentIndex 
                          ? 'bg-blue-500 scale-125' 
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
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
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
