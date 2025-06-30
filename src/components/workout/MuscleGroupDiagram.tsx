
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MuscleGroup } from '@/types/exercise';
import { findMuscleMatch, getMuscleIntensity } from '@/utils/muscleMapping';

interface MuscleGroupDiagramProps {
  muscleGroups: string[];
  detailedMuscles?: MuscleGroup;
}

const MuscleGroupDiagram = ({ muscleGroups, detailedMuscles }: MuscleGroupDiagramProps) => {
  const [activeView, setActiveView] = useState<'front' | 'back'>('front');
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Mapeamento anatômico mais preciso dos músculos
  const musclePositions = {
    front: {
      'peitoral': { x: 130, y: 100, width: 80, height: 50, rx: 15 },
      'deltoides': { x: 70, y: 80, width: 50, height: 35, rx: 10 },
      'biceps': { x: 55, y: 120, width: 30, height: 50, rx: 8 },
      'abdominais': { x: 140, y: 160, width: 60, height: 70, rx: 12 },
      'quadriceps': { x: 120, y: 250, width: 80, height: 90, rx: 15 },
      'panturrilha': { x: 130, y: 380, width: 50, height: 60, rx: 10 },
      'antebraco': { x: 50, y: 175, width: 25, height: 45, rx: 6 }
    },
    back: {
      'trapezio': { x: 120, y: 70, width: 100, height: 40, rx: 12 },
      'latissimo': { x: 90, y: 120, width: 120, height: 80, rx: 18 },
      'triceps': { x: 220, y: 120, width: 30, height: 50, rx: 8 },
      'gluteos': { x: 115, y: 220, width: 90, height: 60, rx: 15 },
      'isquiotibiais': { x: 120, y: 290, width: 80, height: 80, rx: 12 },
      'panturrilha': { x: 130, y: 380, width: 50, height: 60, rx: 10 }
    }
  };

  const getMuscleColor = (muscle: string) => {
    const intensity = getMuscleIntensity(muscleGroups, muscle, detailedMuscles);
    
    const colors = {
      primary: '#DC2626',     // Vermelho forte
      secondary: '#F59E0B',   // Amarelo/laranja
      stabilizer: '#10B981',  // Verde
      inactive: '#E5E7EB'     // Cinza claro
    };
    
    return colors[intensity];
  };

  const getMuscleOpacity = (muscle: string) => {
    const intensity = getMuscleIntensity(muscleGroups, muscle, detailedMuscles);
    return intensity === 'inactive' ? 0.2 : (hoveredMuscle === muscle ? 0.9 : 0.7);
  };

  const renderMuscleGroup = (muscle: string, position: any) => (
    <g key={muscle}>
      <rect
        x={position.x}
        y={position.y}
        width={position.width}
        height={position.height}
        fill={getMuscleColor(muscle)}
        stroke="#374151"
        strokeWidth="1.5"
        rx={position.rx}
        className="transition-all duration-300 cursor-pointer hover:stroke-2 hover:stroke-blue-500"
        onMouseEnter={() => setHoveredMuscle(muscle)}
        onMouseLeave={() => setHoveredMuscle(null)}
        opacity={getMuscleOpacity(muscle)}
      />
      {hoveredMuscle === muscle && (
        <text
          x={position.x + position.width / 2}
          y={position.y + position.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs font-semibold fill-white"
          style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
        >
          {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
        </text>
      )}
    </g>
  );

  const getIntensityStats = () => {
    const stats = { primary: 0, secondary: 0, stabilizer: 0 };
    const allMuscles = [...Object.keys(musclePositions.front), ...Object.keys(musclePositions.back)];
    
    allMuscles.forEach(muscle => {
      const intensity = getMuscleIntensity(muscleGroups, muscle, detailedMuscles);
      if (intensity !== 'inactive') {
        stats[intensity]++;
      }
    });
    
    return stats;
  };

  const stats = getIntensityStats();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          💪 Músculos Trabalhados
        </CardTitle>
        
        {/* Estatísticas rápidas */}
        <div className="flex flex-wrap gap-2 text-sm">
          {stats.primary > 0 && (
            <Badge variant="outline" className="bg-red-50 border-red-200 text-red-700">
              🔴 {stats.primary} Primários
            </Badge>
          )}
          {stats.secondary > 0 && (
            <Badge variant="outline" className="bg-yellow-50 border-yellow-200 text-yellow-700">
              🟡 {stats.secondary} Secundários  
            </Badge>
          )}
          {stats.stabilizer > 0 && (
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
              🟢 {stats.stabilizer} Estabilizadores
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Controles de visualização */}
        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'front' | 'back')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front" className="flex items-center gap-2">
              👤 Vista Frontal
            </TabsTrigger>
            <TabsTrigger value="back" className="flex items-center gap-2">
              🔄 Vista Posterior
            </TabsTrigger>
          </TabsList>

          <TabsContent value="front" className="space-y-4">
            <div className="flex justify-center">
              <svg width="320" height="460" viewBox="0 0 320 460" className="border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100">
                {/* Silhueta corporal frontal mais realista */}
                <defs>
                  <linearGradient id="bodyGradientFront" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#F8FAFC', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#E2E8F0', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                
                {/* Corpo base */}
                <path
                  d="M160 40 
                     C175 40, 185 50, 185 65 
                     L185 85 
                     C205 85, 225 100, 225 120 
                     L225 180 
                     C225 200, 215 215, 200 220 
                     L200 240 
                     C220 240, 235 255, 235 275 
                     L235 350 
                     C235 370, 225 385, 210 390 
                     L210 420 
                     C210 440, 195 450, 175 450 
                     L145 450 
                     C125 450, 110 440, 110 420 
                     L110 390 
                     C95 385, 85 370, 85 350 
                     L85 275 
                     C85 255, 100 240, 120 240 
                     L120 220 
                     C105 215, 95 200, 95 180 
                     L95 120 
                     C95 100, 115 85, 135 85 
                     L135 65 
                     C135 50, 145 40, 160 40"
                  fill="url(#bodyGradientFront)"
                  stroke="#CBD5E1"
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
              <svg width="320" height="460" viewBox="0 0 320 460" className="border rounded-lg bg-gradient-to-b from-green-50 to-green-100">
                <defs>
                  <linearGradient id="bodyGradientBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#F0FDF4', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#DCFCE7', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                
                {/* Corpo base posterior */}
                <path
                  d="M160 40 
                     C175 40, 185 50, 185 65 
                     L185 85 
                     C205 85, 225 100, 225 120 
                     L225 180 
                     C225 200, 215 215, 200 220 
                     L200 240 
                     C220 240, 235 255, 235 275 
                     L235 350 
                     C235 370, 225 385, 210 390 
                     L210 420 
                     C210 440, 195 450, 175 450 
                     L145 450 
                     C125 450, 110 440, 110 420 
                     L110 390 
                     C95 385, 85 370, 85 350 
                     L85 275 
                     C85 255, 100 240, 120 240 
                     L120 220 
                     C105 215, 95 200, 95 180 
                     L95 120 
                     C95 100, 115 85, 135 85 
                     L135 65 
                     C135 50, 145 40, 160 40"
                  fill="url(#bodyGradientBack)"
                  stroke="#CBD5E1"
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
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-gray-300"
                style={{ backgroundColor: getMuscleColor(hoveredMuscle) }}
              />
              <p className="font-semibold text-blue-800 capitalize">
                {hoveredMuscle.replace(/_/g, ' ')}
              </p>
            </div>
            <p className="text-sm text-blue-600">
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'primary' && 'Músculo Primário - Trabalhado intensamente'}
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'secondary' && 'Músculo Secundário - Auxilia no movimento'}
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'stabilizer' && 'Músculo Estabilizador - Mantém postura'}
            </p>
          </div>
        )}

        {/* Lista de músculos trabalhados */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-800">Grupos Musculares Envolvidos:</h4>
          <div className="flex flex-wrap gap-2">
            {muscleGroups.map((muscle, index) => (
              <Badge key={index} variant="secondary" className="text-xs px-3 py-1">
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
