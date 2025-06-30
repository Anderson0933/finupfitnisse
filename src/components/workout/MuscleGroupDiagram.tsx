
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MuscleGroup } from '@/types/exercise';

interface MuscleGroupDiagramProps {
  muscleGroups: string[];
  detailedMuscles?: MuscleGroup;
}

const MuscleGroupDiagram = ({ muscleGroups, detailedMuscles }: MuscleGroupDiagramProps) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Mapeamento de músculos para coordenadas SVG
  const musclePositions = {
    front: {
      'peitoral': { x: 150, y: 120, width: 100, height: 60 },
      'deltoides': { x: 80, y: 100, width: 60, height: 40 },
      'biceps': { x: 60, y: 140, width: 40, height: 60 },
      'abdominais': { x: 140, y: 180, width: 80, height: 80 },
      'quadriceps': { x: 120, y: 280, width: 100, height: 120 },
      'panturrilha': { x: 130, y: 420, width: 60, height: 80 }
    },
    back: {
      'trapezio': { x: 130, y: 80, width: 100, height: 60 },
      'latissimo': { x: 100, y: 140, width: 140, height: 100 },
      'triceps': { x: 60, y: 140, width: 40, height: 60 },
      'gluteos': { x: 120, y: 240, width: 100, height: 80 },
      'isquiotibiais': { x: 120, y: 320, width: 100, height: 100 },
      'panturrilha': { x: 130, y: 420, width: 60, height: 80 }
    }
  };

  const getMuscleColor = (muscle: string) => {
    if (!detailedMuscles) {
      return muscleGroups.some(mg => mg.toLowerCase().includes(muscle.toLowerCase())) ? '#3B82F6' : '#E5E7EB';
    }

    if (detailedMuscles.primary.some(m => m.toLowerCase().includes(muscle.toLowerCase()))) {
      return '#DC2626'; // Vermelho para músculos primários
    }
    if (detailedMuscles.secondary.some(m => m.toLowerCase().includes(muscle.toLowerCase()))) {
      return '#F59E0B'; // Amarelo para músculos secundários
    }
    if (detailedMuscles.stabilizer.some(m => m.toLowerCase().includes(muscle.toLowerCase()))) {
      return '#10B981'; // Verde para músculos estabilizadores
    }
    return '#E5E7EB'; // Cinza para não trabalhados
  };

  const renderMuscleGroup = (muscle: string, position: any) => (
    <rect
      key={muscle}
      x={position.x}
      y={position.y}
      width={position.width}
      height={position.height}
      fill={getMuscleColor(muscle)}
      stroke="#374151"
      strokeWidth="1"
      rx="8"
      className="transition-all duration-200 cursor-pointer hover:stroke-2 hover:stroke-blue-500"
      onMouseEnter={() => setHoveredMuscle(muscle)}
      onMouseLeave={() => setHoveredMuscle(null)}
      opacity={hoveredMuscle === muscle ? 0.8 : 0.6}
    />
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          💪 Músculos Trabalhados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Legenda */}
        {detailedMuscles && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="bg-red-50 border-red-200">
              🔴 Primários
            </Badge>
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200">
              🟡 Secundários
            </Badge>
            <Badge variant="outline" className="bg-green-50 border-green-200">
              🟢 Estabilizadores
            </Badge>
          </div>
        )}

        {/* Controles de visualização */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front">Vista Frontal</TabsTrigger>
            <TabsTrigger value="back">Vista Posterior</TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="space-y-4">
            <div className="flex justify-center">
              <svg width="300" height="500" viewBox="0 0 300 500" className="border rounded-lg">
                {/* Corpo base (silhueta frontal) */}
                <path
                  d="M150 50 C170 50, 180 70, 180 90 L180 110 C200 110, 220 130, 220 150 L220 200 C220 220, 210 240, 190 250 L190 350 C220 350, 240 370, 240 400 L240 450 C240 470, 220 480, 200 480 L100 480 C80 480, 60 470, 60 450 L60 400 C60 370, 80 350, 110 350 L110 250 C90 240, 80 220, 80 200 L80 150 C80 130, 100 110, 120 110 L120 90 C120 70, 130 50, 150 50"
                  fill="#F3F4F6"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                
                {/* Músculos frontais */}
                {Object.entries(musclePositions.front).map(([muscle, position]) =>
                  renderMuscleGroup(muscle, position)
                )}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="back" className="space-y-4">
            <div className="flex justify-center">
              <svg width="300" height="500" viewBox="0 0 300 500" className="border rounded-lg">
                {/* Corpo base (silhueta posterior) */}
                <path
                  d="M150 50 C170 50, 180 70, 180 90 L180 110 C200 110, 220 130, 220 150 L220 200 C220 220, 210 240, 190 250 L190 350 C220 350, 240 370, 240 400 L240 450 C240 470, 220 480, 200 480 L100 480 C80 480, 60 470, 60 450 L60 400 C60 370, 80 350, 110 350 L110 250 C90 240, 80 220, 80 200 L80 150 C80 130, 100 110, 120 110 L120 90 C120 70, 130 50, 150 50"
                  fill="#F3F4F6"
                  stroke="#9CA3AF"
                  strokeWidth="2"
                />
                
                {/* Músculos posteriores */}
                {Object.entries(musclePositions.back).map(([muscle, position]) =>
                  renderMuscleGroup(muscle, position)
                )}
              </svg>
            </div>
          </TabsContent>
        </Tabs>

        {/* Informação do músculo em hover */}
        {hoveredMuscle && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="font-medium text-blue-800 capitalize">{hoveredMuscle}</p>
            {detailedMuscles && (
              <p className="text-sm text-blue-600">
                {detailedMuscles.primary.some(m => m.toLowerCase().includes(hoveredMuscle.toLowerCase())) && 'Músculo Primário'}
                {detailedMuscles.secondary.some(m => m.toLowerCase().includes(hoveredMuscle.toLowerCase())) && 'Músculo Secundário'}
                {detailedMuscles.stabilizer.some(m => m.toLowerCase().includes(hoveredMuscle.toLowerCase())) && 'Músculo Estabilizador'}
              </p>
            )}
          </div>
        )}

        {/* Lista de músculos trabalhados */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-800">Grupos Musculares:</h4>
          <div className="flex flex-wrap gap-1">
            {muscleGroups.map((muscle, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {muscle}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MuscleGroupDiagram;
