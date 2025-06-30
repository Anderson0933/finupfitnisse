
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RefreshCw, AlertCircle } from 'lucide-react';
import { ExerciseMedia } from '@/types/exercise';
import { exerciseImageService } from '@/utils/exerciseImageService';

interface ExerciseImageViewerProps {
  exerciseName: string;
  media?: ExerciseMedia[];
}

const ExerciseImageViewer = ({ exerciseName, media }: ExerciseImageViewerProps) => {
  const [exerciseMedia, setExerciseMedia] = useState<ExerciseMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    console.log(`🎬 ExerciseImageViewer: Carregando GIF demonstrativo para ${exerciseName}`);
    loadExerciseGif();
  }, [exerciseName]);

  const loadExerciseGif = async () => {
    setIsLoading(true);
    setHasError(false);
    setImageError(false);
    
    try {
      console.log(`🔄 Buscando demonstração em GIF para: ${exerciseName}`);
      const images = await exerciseImageService.searchExerciseImages(exerciseName);
      
      console.log(`📥 Mídia recebida para ${exerciseName}:`, images);
      
      if (images && images.length > 0) {
        console.log(`✅ Demonstração carregada para ${exerciseName}`);
        setExerciseMedia(images);
        setHasError(false);
      } else {
        console.error(`❌ Nenhuma demonstração encontrada para ${exerciseName}`);
        setHasError(true);
      }
    } catch (error) {
      console.error(`💥 Erro ao carregar demonstração para ${exerciseName}:`, error);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    console.error(`❌ Erro ao carregar imagem para ${exerciseName}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    console.log(`✅ GIF carregado com sucesso para ${exerciseName}`);
    setImageError(false);
  };

  const currentMedia = exerciseMedia[0];

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg h-80 flex items-center justify-center">
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
  if (hasError || !exerciseMedia || exerciseMedia.length === 0 || imageError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-80 flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Demonstração temporariamente indisponível</p>
                <p className="text-sm text-gray-400">{exerciseName}</p>
              </div>
              <Button 
                onClick={loadExerciseGif}
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
        <div className="relative bg-black">
          <div className="aspect-video flex items-center justify-center min-h-[300px]">
            {currentMedia && !imageError && (
              <div className="relative w-full h-full">
                <img
                  src={currentMedia.url}
                  alt={currentMedia.alt}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  style={{
                    display: isPlaying ? 'block' : 'none'
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="text-white text-center">
                      <Play className="h-16 w-16 mx-auto mb-2" />
                      <p className="text-lg">GIF Pausado</p>
                    </div>
                  </div>
                )}
                
                {/* Overlay com informações */}
                <div className="absolute top-4 left-4">
                  <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                    🎬 {exerciseName}
                  </div>
                </div>

                {/* Controle de play/pause */}
                <div className="absolute bottom-4 right-4">
                  <Button
                    onClick={() => setIsPlaying(!isPlaying)}
                    variant="secondary"
                    size="sm"
                    className="bg-white bg-opacity-90 hover:bg-white shadow-lg"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pausar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Reproduzir
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Informações da demonstração */}
        <div className="p-4 bg-white">
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-800">
                {exerciseName}
              </h3>
              <p className="text-sm text-gray-600">
                {currentMedia?.alt || 'Demonstração da execução correta'}
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-left">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                💡 Dica de Execução
              </h4>
              <p className="text-sm text-blue-700">
                Observe atentamente o movimento demonstrado e mantenha a mesma cadência e amplitude. 
                Foque na forma correta antes de aumentar a carga.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
