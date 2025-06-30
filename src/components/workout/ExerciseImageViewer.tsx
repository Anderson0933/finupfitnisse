
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { ExerciseMedia } from '@/types/exercise';

interface ExerciseImageViewerProps {
  exerciseName: string;
  media: ExerciseMedia[];
}

const ExerciseImageViewer = ({ exerciseName, media }: ExerciseImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentMedia = media[currentIndex];

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % media.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  if (!media || media.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
            <p className="text-gray-500">Demonstração visual não disponível</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Área de exibição principal */}
          <div className="relative bg-gray-100 rounded-lg overflow-hidden">
            <div className="aspect-video flex items-center justify-center">
              {currentMedia.type === 'gif' || currentMedia.type === 'video' ? (
                <div className="relative w-full h-full">
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt}
                    className="w-full h-full object-cover"
                  />
                  {currentMedia.type === 'video' && (
                    <Button
                      onClick={togglePlay}
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-2 right-2 opacity-80 hover:opacity-100"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              ) : (
                <img
                  src={currentMedia.url}
                  alt={currentMedia.alt}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Controles de navegação */}
            {media.length > 1 && (
              <>
                <Button
                  onClick={prevImage}
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={nextImage}
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-80 hover:opacity-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Indicadores de mídia */}
          {media.length > 1 && (
            <div className="flex justify-center space-x-2">
              {media.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Informações da mídia */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              {currentMedia.type === 'gif' && '🎬 Demonstração Animada'}
              {currentMedia.type === 'image' && '📸 Posição Correta'}
              {currentMedia.type === 'video' && '🎥 Vídeo Demonstrativo'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {currentIndex + 1} de {media.length}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
