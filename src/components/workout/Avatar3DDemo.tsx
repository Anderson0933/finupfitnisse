
import { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere, Box, Cylinder } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import * as THREE from 'three';

interface Avatar3DDemoProps {
  exerciseName: string;
  movementType: 'push' | 'pull' | 'squat' | 'deadlift' | 'lunge' | 'plank';
}

// Componente do Avatar 3D melhorado com anatomia mais realista
const EnhancedAvatar = ({ movementType, isPlaying }: { movementType: string, isPlaying: boolean }) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const leftLegRef = useRef<THREE.Mesh>(null);
  const rightLegRef = useRef<THREE.Mesh>(null);
  
  const [animationProgress, setAnimationProgress] = useState(0);

  useFrame((state) => {
    if (!isPlaying || !groupRef.current) return;

    const time = state.clock.getElapsedTime();
    const speed = 1.2;
    const progress = (Math.sin(time * speed) + 1) / 2; // 0 to 1
    setAnimationProgress(progress);

    // Animações específicas por tipo de movimento
    switch (movementType) {
      case 'squat':
        animateSquat(progress);
        break;
      case 'push':
        animatePush(progress);
        break;
      case 'pull':
        animatePull(progress);
        break;
      case 'deadlift':
        animateDeadlift(progress);
        break;
      case 'lunge':
        animateLunge(progress);
        break;
      case 'plank':
        animatePlank(progress);
        break;
      default:
        animateIdle(time);
    }
  });

  const animateSquat = (progress: number) => {
    if (!torsoRef.current || !leftLegRef.current || !rightLegRef.current) return;
    
    // Descer e subir
    const squat = Math.sin(progress * Math.PI) * 0.8;
    torsoRef.current.position.y = 1.2 - squat;
    
    // Rotação das pernas
    const legRotation = progress * 0.6;
    leftLegRef.current.rotation.x = legRotation;
    rightLegRef.current.rotation.x = legRotation;
    
    // Leve inclinação do torso
    torsoRef.current.rotation.x = progress * 0.2;
  };

  const animatePush = (progress: number) => {
    if (!leftArmRef.current || !rightArmRef.current || !torsoRef.current) return;
    
    // Movimento dos braços para frente e para trás
    const armExtension = Math.sin(progress * Math.PI) * 0.4;
    leftArmRef.current.position.z = armExtension;
    rightArmRef.current.position.z = armExtension;
    
    // Rotação dos braços
    leftArmRef.current.rotation.x = -progress * 0.3;
    rightArmRef.current.rotation.x = -progress * 0.3;
    
    // Leve movimento do torso
    torsoRef.current.position.z = armExtension * 0.3;
  };

  const animatePull = (progress: number) => {
    if (!leftArmRef.current || !rightArmRef.current || !torsoRef.current) return;
    
    // Movimento de puxar
    const pullMotion = Math.sin(progress * Math.PI) * 0.5;
    leftArmRef.current.position.z = -pullMotion;
    rightArmRef.current.position.z = -pullMotion;
    
    // Rotação para simular puxada
    leftArmRef.current.rotation.x = progress * 0.4;
    rightArmRef.current.rotation.x = progress * 0.4;
    
    // Inclinação do torso
    torsoRef.current.rotation.x = -progress * 0.2;
  };

  const animateDeadlift = (progress: number) => {
    if (!torsoRef.current || !groupRef.current) return;
    
    // Flexão do quadril
    const bend = progress * 0.8;
    torsoRef.current.rotation.x = bend;
    groupRef.current.position.y = -bend * 0.3;
  };

  const animateLunge = (progress: number) => {
    if (!leftLegRef.current || !rightLegRef.current || !groupRef.current) return;
    
    // Movimento de afundo
    const lunge = Math.sin(progress * Math.PI) * 0.6;
    leftLegRef.current.position.z = lunge;
    leftLegRef.current.rotation.x = progress * 0.5;
    
    groupRef.current.position.y = -Math.abs(lunge) * 0.4;
  };

  const animatePlank = (progress: number) => {
    if (!torsoRef.current) return;
    
    // Respiração suave
    const breathe = Math.sin(progress * Math.PI * 4) * 0.02;
    torsoRef.current.scale.set(1 + breathe, 1 + breathe, 1);
  };

  const animateIdle = (time: number) => {
    if (!groupRef.current) return;
    
    // Respiração suave
    const breathe = Math.sin(time * 2) * 0.01;
    groupRef.current.scale.setScalar(1 + breathe);
  };

  return (
    <group ref={groupRef}>
      {/* Cabeça mais realista */}
      <Sphere ref={headRef} args={[0.22]} position={[0, 2.1, 0]}>
        <meshStandardMaterial color="#FBBF24" />
      </Sphere>
      
      {/* Pescoço */}
      <Cylinder args={[0.1, 0.12, 0.15]} position={[0, 1.85, 0]}>
        <meshStandardMaterial color="#F59E0B" />
      </Cylinder>
      
      {/* Torso mais anatômico */}
      <Box ref={torsoRef} args={[0.7, 1.0, 0.35]} position={[0, 1.2, 0]}>
        <meshStandardMaterial color="#4F46E5" />
      </Box>
      
      {/* Ombros */}
      <Sphere args={[0.15]} position={[-0.45, 1.6, 0]}>
        <meshStandardMaterial color="#6366F1" />
      </Sphere>
      <Sphere args={[0.15]} position={[0.45, 1.6, 0]}>
        <meshStandardMaterial color="#6366F1" />
      </Sphere>
      
      {/* Braços com articulações */}
      <group>
        {/* Braço esquerdo */}
        <Cylinder ref={leftArmRef} args={[0.08, 0.08, 0.6]} position={[-0.5, 1.3, 0]} rotation={[0, 0, 0.2]}>
          <meshStandardMaterial color="#7C3AED" />
        </Cylinder>
        <Sphere args={[0.09]} position={[-0.5, 1.0, 0]}>
          <meshStandardMaterial color="#8B5CF6" />
        </Sphere>
        <Cylinder args={[0.07, 0.07, 0.5]} position={[-0.5, 0.6, 0]}>
          <meshStandardMaterial color="#7C3AED" />
        </Cylinder>
        
        {/* Braço direito */}
        <Cylinder ref={rightArmRef} args={[0.08, 0.08, 0.6]} position={[0.5, 1.3, 0]} rotation={[0, 0, -0.2]}>
          <meshStandardMaterial color="#7C3AED" />
        </Cylinder>
        <Sphere args={[0.09]} position={[0.5, 1.0, 0]}>
          <meshStandardMaterial color="#8B5CF6" />
        </Sphere>
        <Cylinder args={[0.07, 0.07, 0.5]} position={[0.5, 0.6, 0]}>
          <meshStandardMaterial color="#7C3AED" />
        </Cylinder>
      </group>
      
      {/* Quadril */}
      <Box args={[0.6, 0.3, 0.3]} position={[0, 0.55, 0]}>
        <meshStandardMaterial color="#3730A3" />
      </Box>
      
      {/* Pernas com articulações */}
      <group>
        {/* Perna esquerda */}
        <Cylinder ref={leftLegRef} args={[0.1, 0.1, 0.8]} position={[-0.2, 0.1, 0]}>
          <meshStandardMaterial color="#059669" />
        </Cylinder>
        <Sphere args={[0.08]} position={[-0.2, -0.3, 0]}>
          <meshStandardMaterial color="#10B981" />
        </Sphere>
        <Cylinder args={[0.08, 0.08, 0.7]} position={[-0.2, -0.65, 0]}>
          <meshStandardMaterial color="#059669" />
        </Cylinder>
        
        {/* Perna direita */}
        <Cylinder ref={rightLegRef} args={[0.1, 0.1, 0.8]} position={[0.2, 0.1, 0]}>
          <meshStandardMaterial color="#059669" />
        </Cylinder>
        <Sphere args={[0.08]} position={[0.2, -0.3, 0]}>
          <meshStandardMaterial color="#10B981" />
        </Sphere>
        <Cylinder args={[0.08, 0.08, 0.7]} position={[0.2, -0.65, 0]}>
          <meshStandardMaterial color="#059669" />
        </Cylinder>
      </group>
      
      {/* Pés */}
      <Box args={[0.15, 0.05, 0.3]} position={[-0.2, -1.05, 0.1]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      <Box args={[0.15, 0.05, 0.3]} position={[0.2, -1.05, 0.1]}>
        <meshStandardMaterial color="#374151" />
      </Box>
      
      {/* Plataforma melhorada */}
      <Cylinder args={[2, 2, 0.1]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color="#6B7280" />
      </Cylinder>
    </group>
  );
};

const Avatar3DDemo = ({ exerciseName, movementType }: Avatar3DDemoProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          🤖 Demonstração 3D Interativa
        </CardTitle>
        <p className="text-sm text-gray-600">{getMovementDescription()}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Canvas 3D melhorado */}
        <div className="relative h-96 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50 rounded-xl overflow-hidden shadow-inner">
          <Canvas camera={{ position: [4, 2, 4], fov: 50 }}>
            <Suspense fallback={null}>
              {/* Iluminação cinematográfica */}
              <ambientLight intensity={0.4} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1.2} 
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
              />
              <pointLight position={[-5, 5, -5]} intensity={0.6} color="#FF6B6B" />
              <pointLight position={[5, 2, 5]} intensity={0.4} color="#4ECDC4" />
              
              {/* Avatar 3D melhorado */}
              <EnhancedAvatar movementType={movementType} isPlaying={isPlaying} />
              
              {/* Texto informativo flutuante */}
              <Text
                position={[0, 3.5, 0]}
                fontSize={0.25}
                color="#1F2937"
                anchorX="center"
                anchorY="middle"
                font="/fonts/inter-bold.woff"
              >
                {exerciseName}
              </Text>
              
              {/* Status da animação */}
              {isPlaying && (
                <Text
                  position={[0, -2, 0]}
                  fontSize={0.15}
                  color="#059669"
                  anchorX="center"
                  anchorY="middle"
                >
                  ▶ Em Movimento
                </Text>
              )}
              
              {/* Controles de câmera aprimorados */}
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={3}
                maxDistance={8}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI - Math.PI / 6}
                autoRotate={!isPlaying}
                autoRotateSpeed={0.5}
              />
            </Suspense>
          </Canvas>
          
          {/* Instruções overlay */}
          {showInstructions && (
            <div className="absolute top-3 left-3 bg-black bg-opacity-60 text-white text-xs p-3 rounded-lg backdrop-blur-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-medium">Controles:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-white hover:text-gray-300"
                  onClick={() => setShowInstructions(false)}
                >
                  ×
                </Button>
              </div>
              <div className="space-y-1 text-xs">
                <div>🖱️ Arraste: Rotacionar</div>
                <div>🔍 Scroll: Zoom</div>
                <div>▶️ Play: Ver movimento</div>
              </div>
            </div>
          )}
          
          {/* Indicador de carregamento */}
          <div className="absolute bottom-3 right-3 bg-white bg-opacity-80 px-2 py-1 rounded text-xs text-gray-600">
            WebGL Ativo
          </div>
        </div>

        {/* Controles de animação melhorados */}
        <div className="flex justify-center items-center gap-3">
          <Button
            onClick={toggleAnimation}
            variant={isPlaying ? "secondary" : "default"}
            size="sm"
            className="flex items-center gap-2 px-4"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pausar Demonstração' : 'Iniciar Demonstração'}
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
          
          <Button
            onClick={() => setShowInstructions(!showInstructions)}
            variant="ghost"
            size="sm"
            className="flex items-center gap-2"
          >
            {showInstructions ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            Dicas
          </Button>
        </div>

        {/* Informações detalhadas do movimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              🎯 Tipo de Movimento
            </h4>
            <p className="text-sm text-blue-700">
              {movementType === 'push' && '🔄 Empurrar - Movimento concêntrico'}
              {movementType === 'pull' && '🔄 Puxar - Movimento excêntrico controlado'}
              {movementType === 'squat' && '🔄 Agachamento - Movimento vertical'}
              {movementType === 'deadlift' && '🔄 Levantamento - Articulação do quadril'}
              {movementType === 'lunge' && '🔄 Afundo - Movimento unilateral'}
              {movementType === 'plank' && '🔄 Isométrico - Contração estática'}
            </p>
          </div>
          
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              💡 Dica de Execução
            </h4>
            <p className="text-sm text-green-700">
              Observe o ritmo da animação e mantenha o controle durante todo o movimento. 
              A fase excêntrica (descida) deve ser mais lenta que a concêntrica (subida).
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Avatar3DDemo;
