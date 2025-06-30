
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import ExerciseImageViewer from './ExerciseImageViewer';
import MuscleGroupDiagram from './MuscleGroupDiagram';
import { EnhancedExercise } from '@/types/exercise';

interface VisualExerciseCardProps {
  exercise: EnhancedExercise;
  isActive?: boolean;
  showVisuals?: boolean;
  onToggleVisuals?: () => void;
}

const VisualExerciseCard = ({ 
  exercise, 
  isActive = false, 
  showVisuals = true, 
  onToggleVisuals 
}: VisualExerciseCardProps) => {
  const [activeTab, setActiveTab] = useState('instructions');

  return (
    <Card className={`transition-all duration-300 ${
      isActive ? 'border-blue-500 bg-blue-50/50 shadow-lg' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {exercise.name}
            {isActive && <Badge variant="default" className="bg-blue-500">Em Execução</Badge>}
          </CardTitle>
          {onToggleVisuals && (
            <Button
              onClick={onToggleVisuals}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showVisuals ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showVisuals ? 'Ocultar' : 'Mostrar'} Visuais
            </Button>
          )}
        </div>
        
        {/* Informações básicas do exercício */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-lg text-sm">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Séries</span>
            <span className="font-semibold text-gray-800">{exercise.sets}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Reps</span>
            <span className="font-semibold text-gray-800">{exercise.reps}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Descanso</span>
            <span className="font-semibold text-gray-800">
              {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Carga</span>
            <span className="font-semibold text-gray-800 text-xs">{exercise.weight_guidance}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="instructions" className="text-xs px-2">
              📋 Instruções
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs px-2">
              🖼️ Visual
            </TabsTrigger>
            <TabsTrigger value="muscles" className="text-xs px-2">
              💪 Músculos
            </TabsTrigger>
          </TabsList>

          {/* Tab de Instruções */}
          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  🎯 Como Executar
                </h4>
                <p className="text-sm text-blue-700 leading-relaxed">{exercise.instructions}</p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  ⚠️ Pontos Importantes
                </h4>
                <ul className="text-sm text-yellow-700 space-y-2">
                  {exercise.form_cues.map((cue, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                      <span className="leading-relaxed">{cue}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {exercise.progression_notes && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                    📈 Como Progredir
                  </h4>
                  <p className="text-sm text-green-700 leading-relaxed">{exercise.progression_notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Visual */}
          <TabsContent value="visual" className="mt-4">
            {showVisuals ? (
              <ExerciseImageViewer
                exerciseName={exercise.name}
                media={exercise.visuals?.images}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <div className="space-y-2">
                      <EyeOff className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-gray-500">Visuais desabilitados</p>
                      <p className="text-xs text-gray-400">Clique em "Mostrar Visuais" para ativar</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab Músculos */}
          <TabsContent value="muscles" className="mt-4">
            <MuscleGroupDiagram
              muscleGroups={exercise.muscle_groups}
              detailedMuscles={exercise.muscle_anatomy}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VisualExerciseCard;
