
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

interface WorkoutTimerProps {
  initialSeconds: number;
  onComplete?: () => void;
  title?: string;
}

const WorkoutTimer = ({ initialSeconds, onComplete, title = "Descanso" }: WorkoutTimerProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Criar um beep de notificação usando Web Audio API
    const createBeep = () => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    };

    if (seconds === 0 && isActive) {
      setIsActive(false);
      setIsCompleted(true);
      createBeep();
      onComplete?.();
    }
  }, [seconds, isActive, onComplete]);

  useEffect(() => {
    if (isActive && seconds > 0) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s - 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, seconds]);

  const toggle = () => {
    setIsActive(!isActive);
  };

  const reset = () => {
    setSeconds(initialSeconds);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((initialSeconds - seconds) / initialSeconds) * 100;
  };

  return (
    <Card className={`border-2 transition-all duration-300 ${
      isCompleted ? 'border-green-500 bg-green-50' : 
      isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
    }`}>
      <CardContent className="p-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        
        {/* Círculo de progresso */}
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="#e5e7eb"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={isCompleted ? "#10b981" : isActive ? "#3b82f6" : "#9ca3af"}
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgressPercentage() / 100)}`}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-lg font-bold ${
              isCompleted ? 'text-green-600' : 
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {formatTime(seconds)}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            onClick={toggle}
            variant={isActive ? "destructive" : "default"}
            size="sm"
            className="flex items-center gap-1"
          >
            {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isActive ? 'Pausar' : 'Iniciar'}
          </Button>
          
          <Button
            onClick={reset}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>

        {isCompleted && (
          <div className="mt-3 text-green-600 font-medium">
            ✅ Descanso concluído!
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WorkoutTimer;
