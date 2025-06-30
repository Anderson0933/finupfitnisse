
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause, RefreshCw } from 'lucide-react';
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

  // Carregar imagens reais se não foram fornecidas
  useEffect(() => {
    if (!media || media.length === 0) {
      loadExerciseImages();
    }
  }, [exerciseName, media]);

  const loadExerciseImages = async () => {
    setIsLoading(true);
    setImageError(null);
    
    try {
      const images = await exerciseImageService.searchExerciseImages(exerciseName);
      setExerciseMedia(images);
    } catch (error) {
      console.error('Erro ao carregar imagens:', error);
      setImageError('Erro ao carregar imagens do exercício');
    } finally {
      setIsLoading(false);
    }
  };

  const currentMedia = exerciseMedia[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % exerciseMedia.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + exerciseMedia.length) % exerciseMedia.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // Auto-play para GIFs
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && exerciseMedia.length > 1) {
      interval = setInterval(() => {
        nextImage();
      }, 3000); // Troca a cada 3 segundos
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
              <p className="text-gray-500">Carregando demonstração visual...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (imageError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg h-64 flex items-center justify-center">
            <div className="text-center space-y-3">
              <p className="text-red-600 font-medium">⚠️ {imageError}</p>
              <Button 
                onClick={loadExerciseImages}
                variant="outline"
                size="sm"
                className="text-red-600 border-red-300"
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

  if (!exerciseMedia || exerciseMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
            <div className="space-y-2">
              <p className="text-gray-500">📷 Demonstração visual não disponível</p>
              <p className="text-xs text-gray-400">Imagens serão adicionadas em breve</p>
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
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="aspect-video flex items-center justify-center min-h-[300px]">
              {currentMedia && (
                <div className="relative w-full h-full group">
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80';
                    }}
                  />
                  
                  {/* Overlay com tipo de mídia */}
                  <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {currentMedia.type === 'gif' && '🎬 Animação'}
                    {currentMedia.type === 'image' && '📸 Posição'}
                    {currentMedia.type === 'video' && '🎥 Vídeo'}
                  </div>
                  
                  {/* Controle de play para vídeos */}
                  {currentMedia.type === 'video' && (
                    <Button
                      onClick={togglePlay}
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-3 right-3 opacity-90 hover:opacity-100 bg-black bg-opacity-60 text-white border-0"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
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
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-90 hover:opacity-100 transition-opacity bg-white shadow-lg"
                  disabled={exerciseMedia.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="secondary"
                  size="sm"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-90 hover:opacity-100 transition-opacity bg-white shadow-lg"
                  disabled={exerciseMedia.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Controles inferiores */}
          <div className="p-4 space-y-4">
            {/* Indicadores de mídia */}
            {exerciseMedia.length > 1 && (
              <div className="flex justify-center items-center gap-3">
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
                
                {/* Auto-play toggle */}
                <Button
                  onClick={togglePlay}
                  variant="ghost"
                  size="sm"
                  className="text-xs px-2 py-1 h-6"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3 w-3 mr-1" />
                      Auto
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
              
              <p className="text-xs text-gray-500">
                {currentMedia?.alt}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
