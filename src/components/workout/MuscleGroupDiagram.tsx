
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

  // Anatomia humana realista com posições mais precisas
  const muscleAnatomy = {
    front: {
      // Cabeça e pescoço
      'pescoco': { path: "M160 45 C150 40, 170 40, 160 45 L160 65", color: '#E5E7EB' },
      
      // Peitoral - formato mais anatômico
      'peitoral': { 
        path: "M120 85 C105 85, 95 95, 95 110 L95 130 C95 145, 110 155, 130 155 L190 155 C210 155, 225 145, 225 130 L225 110 C225 95, 215 85, 200 85 C190 75, 170 75, 160 80 C150 75, 130 75, 120 85 Z", 
        color: '#DC2626' 
      },
      
      // Deltoides - formato de ombro
      'deltoides': { 
        path: "M75 75 C65 70, 55 75, 50 85 L50 105 C50 115, 60 125, 75 125 L95 115 C105 110, 105 95, 95 85 L75 75 Z M225 75 C235 70, 245 75, 250 85 L250 105 C250 115, 240 125, 225 125 L205 115 C195 110, 195 95, 205 85 L225 75 Z", 
        color: '#F59E0B' 
      },
      
      // Bíceps
      'biceps': { 
        path: "M75 125 C65 125, 55 135, 55 145 L55 175 C55 185, 65 195, 75 195 C85 195, 95 185, 95 175 L95 145 C95 135, 85 125, 75 125 Z M225 125 C235 125, 245 135, 245 145 L245 175 C245 185, 235 195, 225 195 C215 195, 205 185, 205 175 L205 145 C205 135, 215 125, 225 125 Z", 
        color: '#8B5CF6' 
      },
      
      // Abdominais - retângulos sobrepostos
      'abdominais': { 
        path: "M130 160 L190 160 L190 185 L130 185 Z M130 190 L190 190 L190 215 L130 215 Z M130 220 L190 220 L190 245 L130 245 Z", 
        color: '#10B981' 
      },
      
      // Quadríceps - formato de coxa
      'quadriceps': { 
        path: "M115 250 C105 250, 95 260, 95 275 L95 325 C95 340, 105 350, 120 350 L140 350 C150 350, 160 340, 160 325 L160 275 C160 260, 150 250, 140 250 L115 250 Z M180 250 C170 250, 160 260, 160 275 L160 325 C160 340, 170 350, 180 350 L200 350 C215 350, 225 340, 225 325 L225 275 C225 260, 215 250, 200 250 L180 250 Z", 
        color: '#DC2626' 
      },
      
      // Panturrilhas
      'panturrilha': { 
        path: "M125 360 C115 360, 105 370, 105 380 L105 420 C105 435, 115 445, 125 445 C135 445, 145 435, 145 420 L145 380 C145 370, 135 360, 125 360 Z M195 360 C185 360, 175 370, 175 380 L175 420 C175 435, 185 445, 195 445 C205 445, 215 435, 215 420 L215 380 C215 370, 205 360, 195 360 Z", 
        color: '#059669' 
      }
    },
    back: {
      // Trapézio - formato de diamante superior
      'trapezio': { 
        path: "M100 70 L160 55 L220 70 L200 110 L120 110 Z", 
        color: '#F59E0B' 
      },
      
      // Latíssimo do dorso - formato de asa
      'latissimo': { 
        path: "M80 120 C70 115, 60 125, 65 140 L70 180 C75 200, 90 210, 110 205 L150 195 L150 155 C140 145, 120 140, 100 140 C90 135, 85 130, 80 120 Z M240 120 C250 115, 260 125, 255 140 L250 180 C245 200, 230 210, 210 205 L170 195 L170 155 C180 145, 200 140, 220 140 C230 135, 235 130, 240 120 Z", 
        color: '#DC2626' 
      },
      
      // Tríceps
      'triceps': { 
        path: "M225 125 C235 125, 245 135, 245 145 L245 175 C245 185, 235 195, 225 195 C215 195, 205 185, 205 175 L205 145 C205 135, 215 125, 225 125 Z M75 125 C85 125, 95 135, 95 145 L95 175 C95 185, 85 195, 75 195 C65 195, 55 185, 55 175 L55 145 C55 135, 65 125, 75 125 Z", 
        color: '#8B5CF6' 
      },
      
      // Glúteos - formato arredondado
      'gluteos': { 
        path: "M115 220 C105 220, 95 235, 95 250 C95 265, 105 280, 120 285 L140 285 C155 280, 165 265, 165 250 C165 235, 155 220, 140 220 L115 220 Z M180 220 C170 220, 160 235, 160 250 C160 265, 170 280, 185 285 L205 285 C220 280, 230 265, 230 250 C230 235, 220 220, 205 220 L180 220 Z", 
        color: '#F59E0B' 
      },
      
      // Isquiotibiais - posterior da coxa
      'isquiotibiais': { 
        path: "M115 290 C105 290, 95 300, 95 315 L95 345 C95 360, 105 370, 120 370 L140 370 C150 370, 160 360, 160 345 L160 315 C160 300, 150 290, 140 290 L115 290 Z M180 290 C170 290, 160 300, 160 315 L160 345 C160 360, 170 370, 180 370 L200 370 C215 370, 225 360, 225 345 L225 315 C225 300, 215 290, 200 290 L180 290 Z", 
        color: '#DC2626' 
      },
      
      // Panturrilhas (mesma posição)
      'panturrilha': { 
        path: "M125 380 C115 380, 105 390, 105 400 L105 440 C105 455, 115 465, 125 465 C135 465, 145 455, 145 440 L145 400 C145 390, 135 380, 125 380 Z M195 380 C185 380, 175 390, 175 400 L175 440 C175 455, 185 465, 195 465 C205 465, 215 455, 215 440 L215 400 C215 390, 205 380, 195 380 Z", 
        color: '#059669' 
      }
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
    return intensity === 'inactive' ? 0.3 : (hoveredMuscle === muscle ? 0.9 : 0.7);
  };

  const renderMuscle = (muscle: string, data: any) => (
    <g key={muscle}>
      <path
        d={data.path}
        fill={getMuscleColor(muscle)}
        stroke="#374151"
        strokeWidth="1"
        className="transition-all duration-300 cursor-pointer hover:stroke-2 hover:stroke-blue-500"
        onMouseEnter={() => setHoveredMuscle(muscle)}
        onMouseLeave={() => setHoveredMuscle(null)}
        opacity={getMuscleOpacity(muscle)}
      />
      {hoveredMuscle === muscle && (
        <text
          x="160"
          y="30"
          textAnchor="middle"
          className="text-sm font-bold fill-gray-800 bg-white"
          style={{ 
            filter: 'drop-shadow(1px 1px 2px rgba(255,255,255,0.8))',
            textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
          }}
        >
          {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
        </text>
      )}
    </g>
  );

  const getIntensityStats = () => {
    const stats = { primary: 0, secondary: 0, stabilizer: 0 };
    const allMuscles = [...Object.keys(muscleAnatomy.front), ...Object.keys(muscleAnatomy.back)];
    
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
          💪 Anatomia Muscular
        </CardTitle>
        
        {/* Estatísticas */}
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
              <svg width="320" height="480" viewBox="0 0 320 480" className="border rounded-lg bg-gradient-to-b from-blue-50 to-blue-100">
                <defs>
                  <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#F8FAFC', stopOpacity: 0.8 }} />
                    <stop offset="100%" style={{ stopColor: '#E2E8F0', stopOpacity: 0.8 }} />
                  </linearGradient>
                </defs>
                
                {/* Silhueta anatômica de base */}
                <path
                  d="M160 20 C175 20, 185 30, 185 45 L185 65 C200 70, 210 85, 210 105 L210 155 C210 170, 205 180, 195 185 L195 220 C210 225, 220 240, 220 260 L220 350 C220 370, 210 385, 195 390 L195 460 C195 470, 185 480, 175 480 L145 480 C135 480, 125 470, 125 460 L125 390 C110 385, 100 370, 100 350 L100 260 C100 240, 110 225, 125 220 L125 185 C115 180, 110 170, 110 155 L110 105 C110 85, 120 70, 135 65 L135 45 C135 30, 145 20, 160 20"
                  fill="url(#bodyGradient)"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                
                {/* Músculos frontais */}
                {Object.entries(muscleAnatomy.front).map(([muscle, data]) =>
                  renderMuscle(muscle, data)
                )}
              </svg>
            </div>
          </TabsContent>

          <TabsContent value="back" className="space-y-4">
            <div className="flex justify-center">
              <svg width="320" height="480" viewBox="0 0 320 480" className="border rounded-lg bg-gradient-to-b from-green-50 to-green-100">
                {/* Mesma silhueta base */}
                <path
                  d="M160 20 C175 20, 185 30, 185 45 L185 65 C200 70, 210 85, 210 105 L210 155 C210 170, 205 180, 195 185 L195 220 C210 225, 220 240, 220 260 L220 350 C220 370, 210 385, 195 390 L195 460 C195 470, 185 480, 175 480 L145 480 C135 480, 125 470, 125 460 L125 390 C110 385, 100 370, 100 350 L100 260 C100 240, 110 225, 125 220 L125 185 C115 180, 110 170, 110 155 L110 105 C110 85, 120 70, 135 65 L135 45 C135 30, 145 20, 160 20"
                  fill="url(#bodyGradient)"
                  stroke="#CBD5E1"
                  strokeWidth="1"
                />
                
                {/* Músculos posteriores */}
                {Object.entries(muscleAnatomy.back).map(([muscle, data]) =>
                  renderMuscle(muscle, data)
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
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'primary' && 'Músculo Primário - Trabalhado intensamente durante o exercício'}
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'secondary' && 'Músculo Secundário - Auxilia no movimento principal'}
              {getMuscleIntensity(muscleGroups, hoveredMuscle, detailedMuscles) === 'stabilizer' && 'Músculo Estabilizador - Mantém postura e equilíbrio'}
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
