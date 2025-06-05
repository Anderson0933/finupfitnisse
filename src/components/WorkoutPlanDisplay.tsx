
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Target, TrendingUp, Apple, Shield, BarChart3, Clock, Dumbbell, Heart, Zap } from 'lucide-react';

interface WorkoutPlanDisplayProps {
  plan: any;
  onCopyPlan: () => void;
  onDeletePlan: () => void;
  onGenerateNew: () => void;
  progressMap: Map<string, boolean>;
  onProgressChange: (itemId: string, completed: boolean) => void;
}

const WorkoutPlanDisplay = ({ 
  plan, 
  onCopyPlan, 
  onDeletePlan, 
  onGenerateNew,
  progressMap,
  onProgressChange 
}: WorkoutPlanDisplayProps) => {
  if (!plan) return null;

  const weekDays = [
    { key: 'segunda', name: 'Segunda-feira', icon: '💪' },
    { key: 'terca', name: 'Terça-feira', icon: '🏃' },
    { key: 'quarta', name: 'Quarta-feira', icon: '🔥' },
    { key: 'quinta', name: 'Quinta-feira', icon: '⚡' },
    { key: 'sexta', name: 'Sexta-feira', icon: '🎯' },
    { key: 'sabado', name: 'Sábado', icon: '🌟' },
    { key: 'domingo', name: 'Domingo', icon: '😌' }
  ];

  const renderDaySchedule = (day: any, dayName: string, dayIcon: string) => {
    if (!day) return null;

    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{dayIcon}</span>
            {dayName}
          </CardTitle>
          <CardDescription className="text-sm font-medium text-blue-600">
            {day.focus || 'Dia de treino'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Aquecimento */}
          {day.warm_up && day.warm_up.length > 0 && (
            <div>
              <h4 className="font-semibold text-orange-600 mb-2 flex items-center gap-1">
                <Zap className="h-4 w-4" /> Aquecimento
              </h4>
              <div className="space-y-2 ml-4">
                {day.warm_up.map((warmup: any, idx: number) => (
                  <div key={idx} className="text-sm border-l-2 border-orange-200 pl-3">
                    <div className="font-medium">{warmup.exercise}</div>
                    <div className="text-gray-600">{warmup.duration} - {warmup.instructions}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Treino Principal */}
          {day.main_workout && day.main_workout.length > 0 && (
            <div>
              <h4 className="font-semibold text-green-600 mb-2 flex items-center gap-1">
                <Dumbbell className="h-4 w-4" /> Treino Principal
              </h4>
              <div className="space-y-3 ml-4">
                {day.main_workout.map((exercise: any, idx: number) => {
                  const itemId = `${dayName}_${exercise.exercise}_${idx}`;
                  const isCompleted = progressMap.get(itemId) || false;
                  
                  return (
                    <Card key={idx} className={`border ${isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className={`font-semibold ${isCompleted ? 'text-green-700 line-through' : 'text-gray-800'}`}>
                            {exercise.exercise}
                          </h5>
                          <button
                            onClick={() => onProgressChange(itemId, isCompleted)}
                            className={`px-2 py-1 rounded text-xs ${
                              isCompleted 
                                ? 'bg-green-100 text-green-700 border border-green-300' 
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {isCompleted ? '✓ Feito' : 'Marcar'}
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2 text-xs">
                          <Badge variant="secondary">📊 {exercise.sets} séries</Badge>
                          <Badge variant="secondary">🔢 {exercise.reps} reps</Badge>
                          <Badge variant="secondary">⏰ {exercise.rest}</Badge>
                        </div>
                        
                        {exercise.muscle_groups && (
                          <div className="mb-2">
                            <span className="text-xs font-medium text-purple-600">Músculos: </span>
                            <span className="text-xs text-purple-700">{exercise.muscle_groups.join(', ')}</span>
                          </div>
                        )}
                        
                        <div className="space-y-1 text-xs text-gray-600">
                          {exercise.execution_tips && (
                            <div><strong>💡 Execução:</strong> {exercise.execution_tips}</div>
                          )}
                          {exercise.biomechanics && (
                            <div><strong>🧬 Biomecânica:</strong> {exercise.biomechanics}</div>
                          )}
                          {exercise.weight_progression && (
                            <div><strong>📈 Progressão:</strong> {exercise.weight_progression}</div>
                          )}
                        </div>
                        
                        {exercise.modifications && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                            <div><strong>🟢 Mais fácil:</strong> {exercise.modifications.easier}</div>
                            <div><strong>🔴 Mais difícil:</strong> {exercise.modifications.harder}</div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Alongamento */}
          {day.cool_down && day.cool_down.length > 0 && (
            <div>
              <h4 className="font-semibold text-blue-600 mb-2 flex items-center gap-1">
                <Heart className="h-4 w-4" /> Alongamento
              </h4>
              <div className="space-y-2 ml-4">
                {day.cool_down.map((cooldown: any, idx: number) => (
                  <div key={idx} className="text-sm border-l-2 border-blue-200 pl-3">
                    <div className="font-medium">{cooldown.exercise}</div>
                    <div className="text-gray-600">{cooldown.duration} - {cooldown.instructions}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Atividades de Descanso */}
          {day.activities && day.activities.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-600 mb-2 flex items-center gap-1">
                <Heart className="h-4 w-4" /> Atividades Recomendadas
              </h4>
              <div className="flex flex-wrap gap-1 ml-4">
                {day.activities.map((activity: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">{activity}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header do Plano */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-2">
            <div>
              <CardTitle className="text-xl text-green-800 mb-2">{plan.title}</CardTitle>
              <CardDescription className="text-green-700 mb-3">{plan.description}</CardDescription>
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Target className="h-3 w-3 mr-1" />
                  {plan.difficulty_level?.charAt(0).toUpperCase() + plan.difficulty_level?.slice(1)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Clock className="h-3 w-3 mr-1" />
                  {plan.duration_weeks} semanas
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={onCopyPlan} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                📋 Copiar
              </button>
              <button onClick={onGenerateNew} className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
                🔄 Novo
              </button>
              <button onClick={onDeletePlan} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                🗑️ Excluir
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Principais */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="schedule" className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Cronograma</span>
          </TabsTrigger>
          <TabsTrigger value="progression" className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Progressão</span>
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-1">
            <Apple className="h-4 w-4" />
            <span className="hidden sm:inline">Nutrição</span>
          </TabsTrigger>
          <TabsTrigger value="recovery" className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Recuperação</span>
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex items-center gap-1">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        {/* Cronograma Semanal */}
        <TabsContent value="schedule">
          <ScrollArea className="h-[600px] w-full">
            <div className="space-y-4">
              {weekDays.map(({ key, name, icon }) => {
                const dayData = plan.weekly_schedule?.[key];
                return renderDaySchedule(dayData, name, icon);
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Protocolo de Progressão */}
        <TabsContent value="progression">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Protocolo de Progressão
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.progression_protocol ? (
                <div className="grid gap-4">
                  {Object.entries(plan.progression_protocol).map(([period, description]) => (
                    <div key={period} className="border-l-4 border-green-400 pl-4">
                      <h4 className="font-semibold text-green-700 capitalize">
                        {period.replace('_', ' ')}
                      </h4>
                      <p className="text-gray-600">{description as string}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Protocolo de progressão não disponível.</p>
              )}
              
              {plan.progress_tracking && (
                <div className="mt-6">
                  <h4 className="font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Acompanhamento de Progresso
                  </h4>
                  <div className="space-y-2">
                    <div><strong>Avaliações Semanais:</strong> {plan.progress_tracking.weekly_assessments}</div>
                    <div><strong>Avaliações Mensais:</strong> {plan.progress_tracking.monthly_evaluations}</div>
                    <div><strong>Protocolos de Ajuste:</strong> {plan.progress_tracking.adjustment_protocols}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diretrizes Nutricionais */}
        <TabsContent value="nutrition">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Apple className="h-5 w-5 text-orange-600" />
                Diretrizes Nutricionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.nutrition_guidelines ? (
                <div className="space-y-6">
                  {/* Pré-treino */}
                  {plan.nutrition_guidelines.pre_workout && (
                    <div>
                      <h4 className="font-semibold text-orange-700 mb-2">🟡 Pré-Treino</h4>
                      <div className="bg-orange-50 p-3 rounded">
                        <div><strong>Timing:</strong> {plan.nutrition_guidelines.pre_workout.timing}</div>
                        <div><strong>Alimentos:</strong> {plan.nutrition_guidelines.pre_workout.foods?.join(', ')}</div>
                        <div><strong>Macros:</strong> {plan.nutrition_guidelines.pre_workout.macros}</div>
                      </div>
                    </div>
                  )}

                  {/* Pós-treino */}
                  {plan.nutrition_guidelines.post_workout && (
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2">🟢 Pós-Treino</h4>
                      <div className="bg-green-50 p-3 rounded">
                        <div><strong>Timing:</strong> {plan.nutrition_guidelines.post_workout.timing}</div>
                        <div><strong>Alimentos:</strong> {plan.nutrition_guidelines.post_workout.foods?.join(', ')}</div>
                        <div><strong>Macros:</strong> {plan.nutrition_guidelines.post_workout.macros}</div>
                      </div>
                    </div>
                  )}

                  {/* Metas Diárias */}
                  {plan.nutrition_guidelines.daily_targets && (
                    <div>
                      <h4 className="font-semibold text-blue-700 mb-2">🎯 Metas Diárias</h4>
                      <div className="bg-blue-50 p-3 rounded space-y-1">
                        <div><strong>Proteína:</strong> {plan.nutrition_guidelines.daily_targets.protein}</div>
                        <div><strong>Carboidratos:</strong> {plan.nutrition_guidelines.daily_targets.carbs}</div>
                        <div><strong>Gorduras:</strong> {plan.nutrition_guidelines.daily_targets.fats}</div>
                        <div><strong>Água:</strong> {plan.nutrition_guidelines.daily_targets.water}</div>
                      </div>
                    </div>
                  )}

                  {/* Suplementos */}
                  {plan.nutrition_guidelines.supplements && (
                    <div>
                      <h4 className="font-semibold text-purple-700 mb-2">💊 Suplementos Opcionais</h4>
                      <div className="flex flex-wrap gap-2">
                        {plan.nutrition_guidelines.supplements.map((supplement: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-purple-50 text-purple-700">
                            {supplement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Fallback para nutrition_tips
                plan.nutrition_tips && (
                  <div className="space-y-3">
                    {plan.nutrition_tips.map((tip: string, idx: number) => (
                      <div key={idx} className="border-l-4 border-orange-400 pl-4">
                        <p className="text-gray-700">{tip}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Protocolos de Recuperação */}
        <TabsContent value="recovery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-600" />
                Protocolos de Recuperação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.recovery_protocols ? (
                <div className="grid gap-4">
                  <div className="bg-red-50 p-4 rounded">
                    <h4 className="font-semibold text-red-700 mb-2">⏰ Entre Séries</h4>
                    <p>{plan.recovery_protocols.between_sets}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded">
                    <h4 className="font-semibold text-blue-700 mb-2">🔄 Entre Treinos</h4>
                    <p>{plan.recovery_protocols.between_workouts}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded">
                    <h4 className="font-semibold text-purple-700 mb-2">😴 Sono</h4>
                    <p>{plan.recovery_protocols.sleep}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded">
                    <h4 className="font-semibold text-green-700 mb-2">🧘 Gestão de Estresse</h4>
                    <p>{plan.recovery_protocols.stress_management}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Protocolos de recuperação não disponíveis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diretrizes de Segurança */}
        <TabsContent value="safety">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-yellow-600" />
                Diretrizes de Segurança
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plan.safety_guidelines ? (
                <div className="space-y-3">
                  {plan.safety_guidelines.map((guideline: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                      <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-gray-700">{guideline}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Diretrizes de segurança não disponíveis.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkoutPlanDisplay;
