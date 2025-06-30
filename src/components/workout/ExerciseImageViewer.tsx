
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

  useEffect(() => {
    console.log(`🎬 ExerciseImageViewer: Carregando GIF demonstrativo para ${exerciseName}`);
    loadExerciseGif();
  }, [exerciseName]);

  const loadExerciseGif = async () => {
    setIsLoading(true);
    setHasError(false);
    
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

  const currentMedia = exerciseMedia[0]; // Usando apenas o primeiro item

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
  if (hasError || !exerciseMedia || exerciseMedia.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg h-80 flex items-center justify-center">
            <div className="text-center space-y-3">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <div className="space-y-1">
                <p className="text-gray-500 font-medium">Demonstração não disponível</p>
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
        <div className="space-y-0">
          {/* Área de demonstração principal */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            <div className="aspect-video flex items-center justify-center min-h-[400px]">
              {currentMedia && (
                <div className="relative w-full h-full">
                  <img
                    src={currentMedia.url}
                    alt={currentMedia.alt}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    onLoad={() => {
                      console.log(`✅ Demonstração carregada: ${currentMedia.url}`);
                    }}
                    onError={(e) => {
                      console.error(`❌ Erro ao carregar demonstração: ${currentMedia.url}`);
                      const target = e.target as HTMLImageElement;
                      
                      // Fallback para GIF genérico
                      if (!target.src.includes('placeholder')) {
                        console.log(`🔄 Usando fallback para: ${exerciseName}`);
                        target.src = 'https://via.placeholder.com/600x400/3b82f6/ffffff?text=Demonstracao+do+Exercicio';
                      }
                    }}
                  />
                  
                  {/* Overlay com informações */}
                  <div className="absolute top-4 left-4 space-y-2">
                    <div className="bg-black bg-opacity-80 text-white px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                      🎬 Demonstração do Exercício
                    </div>
                    {currentMedia.type === 'gif' && (
                      <div className="bg-green-600 bg-opacity-90 text-white px-3 py-1 rounded-full text-xs font-medium">
                        ▶️ Animação
                      </div>
                    )}
                  </div>

                  {/* Controle de play/pause para GIFs */}
                  {currentMedia.type === 'gif' && (
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
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Informações da demonstração */}
          <div className="p-6 bg-white border-t">
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {exerciseName}
                </h3>
                <p className="text-sm text-gray-600">
                  {currentMedia?.alt || 'Demonstração da execução correta'}
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span>Movimento Correto</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span>Forma Adequada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span>Cadência</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ExerciseImageViewer;
