
import { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';
import * as THREE from 'three';

interface Avatar3DDemoProps {
  exerciseName: string;
  movementType: 'push' | 'pull' | 'squat' | 'deadlift' | 'lunge' | 'plank';
}

// Componente do Avatar 3D animado
const AnimatedAvatar = ({ movementType, isPlaying }: { movementType: string, isPlaying: boolean }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [animationPhase, setAnimationPhase] = useState(0);

  useFrame((state) => {
    if (!meshRef.current || !isPlaying) return;

    const time = state.clock.getElapsedTime();
    const speed = 1.5;

    // Definir animações baseadas no tipo de movimento
    switch (movementType) {
      case 'squat':
        // Simulação de agachamento
        meshRef.current.position.y = Math.sin(time * speed) * 0.5 + 1;
        meshRef.current.rotation.x = Math.sin(time * speed) * 0.2;
        break;
      case 'push':
        // Simulação de flexão/supino
        meshRef.current.position.z = Math.sin(time * speed) * 0.3;
        meshRef.current.rotation.x = Math.sin(time * speed) * 0.1;
        break;
      case 'pull':
        // Simulação de puxada
        meshRef.current.position.z = -Math.sin(time * speed) * 0.3;
        meshRef.current.rotation.x = -Math.sin(time * speed) * 0.1;
        break;
      case 'deadlift':
        // Simulação de levantamento terra
        meshRef.current.rotation.x = Math.sin(time * speed) * 0.3;
        meshRef.current.position.y = Math.abs(Math.sin(time * speed)) * 0.3 + 0.8;
        break;
      case 'lunge':
        // Simulação de afundo
        meshRef.current.position.x = Math.sin(time * speed) * 0.3;
        meshRef.current.rotation.z = Math.sin(time * speed) * 0.2;
        break;
      default:
        // Respiração suave para exercícios estáticos
        meshRef.current.scale.setScalar(1 + Math.sin(time * 2) * 0.02);
    }
  });

  return (
    <group>
      {/* Corpo principal */}
      <mesh ref={meshRef} position={[0, 1, 0]}>
        <boxGeometry args={[0.8, 1.6, 0.4]} />
        <meshStandardMaterial color="#4F46E5" />
      </mesh>
      
      {/* Cabeça */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial color="#F59E0B" />
      </mesh>
      
      {/* Braços */}
      <mesh position={[-0.6, 1.4, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      <mesh position={[0.6, 1.4, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#7C3AED" />
      </mesh>
      
      {/* Pernas */}
      <mesh position={[-0.25, 0.2, 0]}>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      <mesh position={[0.25, 0.2, 0]}>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <meshStandardMaterial color="#059669" />
      </mesh>
      
      {/* Plataforma */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[3, 0.1, 3]} />
        <meshStandardMaterial color="#6B7280" />
      </mesh>
    </group>
  );
};

const Avatar3DDemo = ({ exerciseName, movementType }: Avatar3DDemoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const toggleAnimation = () => {
    setIsPlaying(!isPlaying);
  };

  const resetCamera = () => {
    // Esta função seria chamada para resetar a câmera
    setIsPlaying(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🤖 Demonstração 3D
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Canvas 3D */}
        <div className="relative h-80 bg-gradient-to-b from-blue-50 to-blue-100 rounded-lg overflow-hidden">
          <Canvas camera={{ position: [3, 3, 3], fov: 60 }}>
            <Suspense fallback={null}>
              {/* Iluminação */}
              <ambientLight intensity={0.5} />
              <directionalLight position={[10, 10, 5]} intensity={1} />
              <pointLight position={[-10, 0, -20]} intensity={0.5} />
              
              {/* Avatar animado */}
              <AnimatedAvatar movementType={movementType} isPlaying={isPlaying} />
              
              {/* Texto informativo */}
              <Text
                position={[0, 3.5, 0]}
                fontSize={0.3}
                color="#1F2937"
                anchorX="center"
                anchorY="middle"
              >
                {exerciseName}
              </Text>
              
              {/* Controles de câmera */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={2}
                maxDistance={8}
              />
            </Suspense>
          </Canvas>
          
          {/* Overlay com instruções */}
          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs p-2 rounded">
            Arraste para rotacionar • Scroll para zoom
          </div>
        </div>

        {/* Controles de animação */}
        <div className="flex justify-center space-x-2">
          <Button
            onClick={toggleAnimation}
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            className="flex items-center gap-2"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pausar' : 'Demonstrar'}
          </Button>
          <Button
            onClick={resetCamera}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {/* Informações do movimento */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Tipo de Movimento:</h4>
          <p className="text-sm text-blue-600 capitalize">
            {movementType === 'push' && '🔄 Movimento de Empurrar'}
            {movementType === 'pull' && '🔄 Movimento de Puxar'}
            {movementType === 'squat' && '🔄 Movimento de Agachamento'}
            {movementType === 'deadlift' && '🔄 Movimento de Levantamento'}
            {movementType === 'lunge' && '🔄 Movimento de Afundo'}
            {movementType === 'plank' && '🔄 Exercício Isométrico'}
          </p>
          <p className="text-xs text-blue-500 mt-1">
            Clique em "Demonstrar" para ver a animação do movimento
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default Avatar3DDemo;
