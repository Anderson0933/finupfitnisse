
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react';
import * as THREE from 'three';

interface Avatar3DDemoProps {
  exerciseName: string;
  movementType: 'push' | 'pull' | 'squat' | 'deadlift' | 'lunge' | 'plank';
}

// Componente de fallback quando WebGL falha
const WebGLFallback = ({ exerciseName }: { exerciseName: string }) => (
  <div className="h-96 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 rounded-xl flex items-center justify-center">
    <div className="text-center space-y-4 p-8">
      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto" />
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800">3D não disponível</h3>
        <p className="text-sm text-gray-600">
          Seu dispositivo não suporta WebGL ou há um problema de compatibilidade.
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm font-medium text-blue-800">
            Exercício: {exerciseName}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Use as outras abas para ver instruções e demonstrações visuais
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Avatar simplificado e mais estável
const SimpleAvatar = ({ movementType, isPlaying }: { movementType: string, isPlaying: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!isPlaying || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const progress = (Math.sin(time * 0.8) + 1) / 2;

    // Animações mais suaves e visíveis
    switch (movementType) {
      case 'squat':
        if (torsoRef.current && leftLegRef.current && rightLegRef.current) {
          const squat = progress * 0.6;
          torsoRef.current.position.y = 1.2 - squat;
          leftLegRef.current.rotation.x = progress * 0.4;
          rightLegRef.current.rotation.x = progress * 0.4;
        }
        break;
      case 'push':
        if (leftArmRef.current && rightArmRef.current) {
          const push = Math.sin(progress * Math.PI) * 0.3;
          leftArmRef.current.position.z = push;
          rightArmRef.current.position.z = push;
          leftArmRef.current.rotation.x = -progress * 0.2;
          rightArmRef.current.rotation.x = -progress * 0.2;
        }
        break;
      case 'pull':
        if (leftArmRef.current && rightArmRef.current && torsoRef.current) {
          const pull = Math.sin(progress * Math.PI) * 0.4;
          leftArmRef.current.position.z = -pull;
          rightArmRef.current.position.z = -pull;
          torsoRef.current.rotation.x = -progress * 0.1;
        }
        break;
      default:
        // Respiração suave
        if (groupRef.current) {
          const breathe = Math.sin(time * 2) * 0.02;
          groupRef.current.scale.setScalar(1 + breathe);
        }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Cabeça */}
      <Sphere args={[0.2]} position={[0, 2, 0]}>
        <meshLambertMaterial color="#FCD34D" />
      </Sphere>
      
      {/* Torso */}
      <Box ref={torsoRef} args={[0.6, 0.8, 0.3]} position={[0, 1.2, 0]}>
        <meshLambertMaterial color="#3B82F6" />
      </Box>
      
      {/* Braços */}
      <Cylinder ref={leftArmRef} args={[0.06, 0.06, 0.5]} position={[-0.4, 1.3, 0]} rotation={[0, 0, 0.3]}>
        <meshLambertMaterial color="#8B5CF6" />
      </Cylinder>
      <Cylinder ref={rightArmRef} args={[0.06, 0.06, 0.5]} position={[0.4, 1.3, 0]} rotation={[0, 0, -0.3]}>
        <meshLambertMaterial color="#8B5CF6" />
      </Cylinder>
      
      {/* Pernas */}
      <Cylinder ref={leftLegRef} args={[0.08, 0.08, 0.7]} position={[-0.15, 0.5, 0]}>
        <meshLambertMaterial color="#059669" />
      </Cylinder>
      <Cylinder ref={rightLegRef} args={[0.08, 0.08, 0.7]} position={[0.15, 0.5, 0]}>
        <meshLambertMaterial color="#059669" />
      </Cylinder>
      
      {/* Base */}
      <Cylinder args={[1.5, 1.5, 0.1]} position={[0, -0.05, 0]}>
        <meshLambertMaterial color="#6B7280" />
      </Cylinder>
    </group>
  );
};

const Avatar3DDemo = ({ exerciseName, movementType }: Avatar3DDemoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Verificar suporte WebGL
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (error) {
      console.warn('WebGL não suportado:', error);
      setHasWebGL(false);
    }
  }, []);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetView = () => {
    setIsPlaying(false);
  };

  const getMovementDescription = () => {
    const descriptions = {
      push: 'Movimento de empurrar - ativa peitorais, deltoides e tríceps',
      pull: 'Movimento de puxar - trabalha dorsais, bíceps e posteriores',
      squat: 'Agachamento - fortalece quadríceps, glúteos e core',
      deadlift: 'Levantamento - desenvolve posterior, glúteos e core',
      lunge: 'Afundo - melhora equilíbrio e força unilateral',
      plank: 'Isométrico - fortalece core e estabilizadores'
    };
    
    return descriptions[movementType] || 'Exercício funcional completo';
  };

  if (!hasWebGL) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🤖 Demonstração 3D
          </CardTitle>
          <p className="text-sm text-gray-600">{getMovementDescription()}</p>
        </CardHeader>
        <CardContent>
          <WebGLFallback exerciseName={exerciseName} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🤖 Demonstração 3D Interativa
        </CardTitle>
        <p className="text-sm text-gray-600">{getMovementDescription()}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Canvas 3D melhorado com tratamento de erro */}
        <div className="relative h-96 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 rounded-xl overflow-hidden shadow-inner">
          <Canvas 
            camera={{ position: [3, 2, 3], fov: 60 }}
            onCreated={({ gl }) => {
              gl.setClearColor('#f8fafc');
            }}
            fallback={<WebGLFallback exerciseName={exerciseName} />}
          >
            <Suspense fallback={null}>
              {/* Iluminação melhorada e mais estável */}
              <ambientLight intensity={0.6} />
              <directionalLight 
                position={[5, 5, 5]} 
                intensity={0.8}
                castShadow={false}
              />
              <pointLight position={[-3, 3, -3]} intensity={0.4} color="#60A5FA" />
              
              {/* Avatar simplificado */}
              <SimpleAvatar movementType={movementType} isPlaying={isPlaying} />
              
              {/* Texto do exercício */}
              <Text
                position={[0, 3, 0]}
                fontSize={0.2}
                color="#1F2937"
                anchorX="center"
                anchorY="middle"
              >
                {exerciseName}
              </Text>
              
              {/* Status da animação */}
              {isPlaying && (
                <Text
                  position={[0, -1.5, 0]}
                  fontSize={0.12}
                  color="#059669"
                  anchorX="center"
                  anchorY="middle"
                >
                  ▶ Em Movimento
                </Text>
              )}
              
              {/* Controles de câmera */}
              <OrbitControls
                enablePan={false}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={6}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
                autoRotate={!isPlaying}
                autoRotateSpeed={1}
              />
            </Suspense>
          </Canvas>
        </div>

        {/* Controles de animação */}
        <div className="flex justify-center items-center gap-3">
          <Button
            onClick={toggleAnimation}
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            className="flex items-center gap-2 px-4"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pausar' : 'Iniciar'} Demonstração
          </Button>
          
          <Button
            onClick={resetView}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Informações do movimento */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            🎯 Sobre o Movimento
          </h4>
          <p className="text-sm text-blue-700">{getMovementDescription()}</p>
          <p className="text-xs text-blue-600 mt-2">
            Use os controles para rotacionar a câmera e observe o movimento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Avatar3DDemo;
