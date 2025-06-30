
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Info } from 'lucide-react';
import ExerciseImageViewer from './ExerciseImageViewer';
import Avatar3DDemo from './Avatar3DDemo';
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

  // Determinar tipo de movimento baseado no nome do exercício
  const getMovementType = (exerciseName: string): 'push' | 'pull' | 'squat' | 'deadlift' | 'lunge' | 'plank' => {
    const name = exerciseName.toLowerCase();
    if (name.includes('agachamento') || name.includes('squat')) return 'squat';
    if (name.includes('supino') || name.includes('flexão') || name.includes('push')) return 'push';
    if (name.includes('puxada') || name.includes('remada') || name.includes('pull')) return 'pull';
    if (name.includes('terra') || name.includes('deadlift')) return 'deadlift';
    if (name.includes('afundo') || name.includes('lunge')) return 'lunge';
    if (name.includes('prancha') || name.includes('plank')) return 'plank';
    return 'push'; // default
  };

  // Criar dados de exemplo para demonstração
  const exampleMedia = [
    {
      type: 'image' as const,
      url: `https://via.placeholder.com/400x300/3B82F6/ffffff?text=Posição+Inicial`,
      alt: `${exercise.name} - Posição Inicial`
    },
    {
      type: 'gif' as const,
      url: `https://via.placeholder.com/400x300/10B981/ffffff?text=Movimento+Completo`,
      alt: `${exercise.name} - Movimento Completo`
    }
  ];

  return (
    <Card className={`transition-all duration-300 ${
      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {exercise.name}
            {isActive && <Badge variant="outline">Ativo</Badge>}
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <span className="font-medium">Séries:</span> {exercise.sets}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Reps:</span> {exercise.reps}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Descanso:</span> {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')}
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Carga:</span> {exercise.weight_guidance}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="instructions" className="text-xs">
              📋 Instruções
            </TabsTrigger>
            <TabsTrigger value="visual" className="text-xs">
              🖼️ Visual
            </TabsTrigger>
            <TabsTrigger value="3d" className="text-xs">
              🤖 3D Demo
            </TabsTrigger>
            <TabsTrigger value="muscles" className="text-xs">
              💪 Músculos
            </TabsTrigger>
          </TabsList>

          {/* Tab de Instruções */}
          <TabsContent value="instructions" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Como Executar:</h4>
                <p className="text-sm text-gray-600">{exercise.instructions}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Pontos Importantes:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {exercise.form_cues.map((cue, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      {cue}
                    </li>
                  ))}
                </ul>
              </div>

              {exercise.progression_notes && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-1">💡 Progressão:</h4>
                  <p className="text-sm text-blue-600">{exercise.progression_notes}</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Tab Visual */}
          <TabsContent value="visual" className="mt-4">
            {showVisuals ? (
              <ExerciseImageViewer
                exerciseName={exercise.name}
                media={exercise.visuals?.images || exampleMedia}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-500">Visuais desabilitados</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Tab 3D Demo */}
          <TabsContent value="3d" className="mt-4">
            {showVisuals ? (
              <Avatar3DDemo
                exerciseName={exercise.name}
                movementType={getMovementType(exercise.name)}
              />
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-500">Demonstração 3D desabilitada</p>
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
