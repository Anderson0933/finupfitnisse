
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, Clock, Dumbbell, Target, Play, Calendar, Eye, User, ChevronDown, ChevronUp } from 'lucide-react';
import WorkoutTimer from './WorkoutTimer';

interface Exercise {
  name: string;
  muscle_groups: string[];
  sets: number;
  reps: string;
  rest_seconds: number;
  weight_guidance: string;
  instructions: string;
  visual_demo?: string;
  form_cues: string[];
  progression_notes: string;
  execution_rhythm?: string;
  breathing_pattern?: string;
  safety_tips?: string;
}

interface WarmUpExercise {
  name: string;
  duration: number;
  instructions: string;
  visual_demo?: string;
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
  const [showVisualDemo, setShowVisualDemo] = useState<Record<string, boolean>>({});

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

  const toggleVisualDemo = (exerciseName: string) => {
    setShowVisualDemo(prev => ({
      ...prev,
      [exerciseName]: !prev[exerciseName]
    }));
  };

  const renderVisualDemo = (exercise: any, type: string, index: number) => {
    const demoKey = `${type}_${index}`;
    const isVisible = showVisualDemo[demoKey];
    
    if (!exercise.visual_demo && !exercise.execution_rhythm && !exercise.breathing_pattern) {
      return null;
    }

    return (
      <div className="mt-4">
        <Button
          onClick={() => toggleVisualDemo(demoKey)}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 mb-3 w-full justify-between bg-blue-50 hover:bg-blue-100 border-blue-200"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-700">🤖💪 Ver Demonstração do Coach IA</span>
          </div>
          {isVisible ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
        
        {isVisible && (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-lg font-bold">🤖</span>
              </div>
              <div>
                <h4 className="font-bold text-blue-800 text-lg">Coach IA - Demonstração Completa</h4>
                <p className="text-blue-600 text-sm">Seu instrutor virtual te ensina passo a passo</p>
              </div>
            </div>

            {exercise.visual_demo && (
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  🎯 Demonstração Visual Completa
                </h5>
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm">
                  {exercise.visual_demo}
                </div>
              </div>
            )}

            {exercise.execution_rhythm && (
              <div className="bg-white border border-purple-200 rounded-lg p-4">
                <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  🎵 Ritmo de Execução
                </h5>
                <div className="text-gray-700 leading-relaxed text-sm">
                  {exercise.execution_rhythm}
                </div>
              </div>
            )}

            {exercise.breathing_pattern && (
              <div className="bg-white border border-green-200 rounded-lg p-4">
                <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  🫁 Padrão Respiratório
                </h5>
                <div className="text-gray-700 leading-relaxed text-sm">
                  {exercise.breathing_pattern}
                </div>
              </div>
            )}

            {exercise.safety_tips && (
              <div className="bg-white border border-red-200 rounded-lg p-4">
                <h5 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  ⚠️ Dicas de Segurança
                </h5>
                <div className="text-gray-700 leading-relaxed text-sm">
                  {exercise.safety_tips}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3">
              <p className="text-sm text-center font-medium">
                💡 O Coach IA está sempre aqui para te ajudar a executar os exercícios com perfeição!
              </p>
            </div>
          </div>
        )}
      </div>
    );
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
            <div className="text-center">
              <Badge variant="outline" className="text-lg px-3 py-1 mb-2">
                {progressPercentage()}% Completo
              </Badge>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <User className="h-4 w-4" />
                🤖💪 Coach IA
              </div>
            </div>
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
                  <h4 className="font-semibold text-orange-800 mb-2">{exercise.name}</h4>
                  <p className="text-sm text-orange-700 mb-2">{exercise.instructions}</p>
                  <div className="text-sm text-orange-600">
                    ⏱️ {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')} minutos
                  </div>
                  
                  {renderVisualDemo(exercise, 'warmup', index)}
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
                  <div className="flex items-center justify-between">
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
                  </div>
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

                  {renderVisualDemo(exercise, 'exercise', index)}

                  <div className="space-y-2">
                    <h5 className="font-medium text-gray-800">Pontos Importantes:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {exercise.form_cues.map((cue, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2" />
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
                  <h4 className="font-semibold text-green-800 mb-2">{exercise.name}</h4>
                  <p className="text-sm text-green-700 mb-2">{exercise.instructions}</p>
                  <div className="text-sm text-green-600">
                    ⏱️ {Math.floor(exercise.duration / 60)}:{(exercise.duration % 60).toString().padStart(2, '0')} minutos
                  </div>
                  
                  {renderVisualDemo(exercise, 'cooldown', index)}
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
