
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, Dumbbell, Target, Play, Calendar } from 'lucide-react';
import WorkoutTimer from './WorkoutTimer';

interface Exercise {
  name: string;
  muscle_groups: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  weight_guidance: string;
  instructions: string;
  form_cues: string[];
  progression_notes: string;
}

interface WarmUpExercise {
  name: string;
  duration: number;
  instructions: string;
}

interface Workout {
  week: number;
  day: number;
  title: string;
  focus: string;
  estimated_duration: number;
  warm_up: {
    duration: number;
    exercises: WarmUpExercise[];
  };
  main_exercises: Exercise[];
  cool_down: {
    duration: number;
    exercises: WarmUpExercise[];
  };
}

interface WorkoutSessionProps {
  workout: Workout;
  onComplete?: () => void;
  onExerciseComplete?: (exerciseName: string) => void;
}

const WorkoutSession = ({ workout, onComplete, onExerciseComplete }: WorkoutSessionProps) => {
  const [activePhase, setActivePhase] = useState<'warm-up' | 'main' | 'cool-down'>('warm-up');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [showTimer, setShowTimer] = useState(false);

  const handleExerciseComplete = (exerciseName: string) => {
    setCompletedExercises(prev => new Set([...prev, exerciseName]));
    onExerciseComplete?.(exerciseName);
  };

  const handleSetComplete = () => {
    const currentExercise = workout.main_exercises[currentExerciseIndex];
    
    if (currentSet < currentExercise.sets) {
      setCurrentSet(prev => prev + 1);
      setShowTimer(true);
    } else {
      // Exercício completo
      handleExerciseComplete(currentExercise.name);
      
      if (currentExerciseIndex < workout.main_exercises.length - 1) {
        // Próximo exercício
        setCurrentExerciseIndex(prev => prev + 1);
        setCurrentSet(1);
        setShowTimer(false);
      } else {
        // Treino principal completo
        setActivePhase('cool-down');
        setShowTimer(false);
      }
    }
  };

  const progressPercentage = () => {
    const total = workout.main_exercises.length;
    const completed = completedExercises.size;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header do Treino */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-blue-800 flex items-center gap-2">
                <Dumbbell className="h-6 w-6" />
                {workout.title}
              </CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Semana {workout.week} - Dia {workout.day}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  ~{workout.estimated_duration} min
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {workout.focus}
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {progressPercentage()}% Completo
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Fases do Treino */}
      <Tabs value={activePhase} onValueChange={(value) => setActivePhase(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="warm-up" className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${activePhase === 'warm-up' ? 'bg-orange-500' : 'bg-gray-300'}`} />
            Aquecimento
          </TabsTrigger>
          <TabsTrigger value="main" className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${activePhase === 'main' ? 'bg-blue-500' : 'bg-gray-300'}`} />
            Treino Principal
          </TabsTrigger>
          <TabsTrigger value="cool-down" className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${activePhase === 'cool-down' ? 'bg-green-500' : 'bg-gray-300'}`} />
            Relaxamento
          </TabsTrigger>
        </TabsList>

        {/* Aquecimento */}
        <TabsContent value="warm-up" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600 flex items-center gap-2">
                🔥 Aquecimento ({workout.warm_up.duration} minutos)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workout.warm_up.exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <h4 className="font-semibold text-orange-800">{exercise.name}</h4>
                  <p className="text-sm text-orange-700 mt-1">{exercise.instructions}</p>
                  <div className="mt-2 text-sm text-orange-600">
                    ⏱️ {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')} minutos
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <Button 
                  onClick={() => setActivePhase('main')}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Treino Principal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treino Principal */}
        <TabsContent value="main" className="space-y-4">
          {showTimer && currentExerciseIndex < workout.main_exercises.length && (
            <WorkoutTimer
              initialSeconds={workout.main_exercises[currentExerciseIndex].rest_seconds}
              title={`Descanso - Série ${currentSet}/${workout.main_exercises[currentExerciseIndex].sets}`}
              onComplete={() => setShowTimer(false)}
            />
          )}

          {workout.main_exercises.map((exercise, index) => {
            const isActive = index === currentExerciseIndex && activePhase === 'main';
            const isCompleted = completedExercises.has(exercise.name);
            
            return (
              <Card key={index} className={`transition-all duration-300 ${
                isActive ? 'border-blue-500 bg-blue-50' : 
                isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${
                    isCompleted ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        isActive ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`} />
                    )}
                    {exercise.name}
                    {isActive && (
                      <Badge variant="outline" className="ml-auto">
                        Série {currentSet}/{exercise.sets}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-4">
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

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800">Músculos Trabalhados:</h5>
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscle_groups.map((muscle, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{muscle}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800">Instruções:</h5>
                    <p className="text-sm text-gray-600">{exercise.instructions}</p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800">Pontos Importantes:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {exercise.form_cues.map((cue, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                          {cue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {exercise.progression_notes && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800">Progressão:</h5>
                      <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                        💡 {exercise.progression_notes}
                      </p>
                    </div>
                  )}

                  {isActive && !isCompleted && (
                    <div className="pt-4 border-t">
                      <Button 
                        onClick={handleSetComplete}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                      >
                        {currentSet < exercise.sets ? 
                          `Série ${currentSet} Concluída - Descansar` : 
                          'Exercício Completo'
                        }
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Relaxamento */}
        <TabsContent value="cool-down" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 flex items-center gap-2">
                🧘 Relaxamento ({workout.cool_down.duration} minutos)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workout.cool_down.exercises.map((exercise, index) => (
                <div key={index} className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <h4 className="font-semibold text-green-800">{exercise.name}</h4>
                  <p className="text-sm text-green-700 mt-1">{exercise.instructions}</p>
                  <div className="mt-2 text-sm text-green-600">
                    ⏱️ {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')} minutos
                  </div>
                </div>
              ))}
              <div className="pt-4 border-t">
                <Button 
                  onClick={onComplete}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  ✅ Treino Concluído!
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutSession;
