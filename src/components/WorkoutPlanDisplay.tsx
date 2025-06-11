
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Copy, 
  Trash2, 
  RefreshCw, 
  Dumbbell, 
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  Clock,
  Target,
  TrendingUp,
  Apple,
  Zap,
  User,
  Calendar,
  Activity,
  Heart,
  Dumbbell as DumbbellIcon,
  Timer,
  Trophy,
  Star,
  Info,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { WorkoutPlan } from './WorkoutPlanGenerator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  onCopyPlan: () => void;
  onDeletePlan: () => void;
  onGenerateNew: () => void;
  progressMap: Map<string, boolean>;
  onProgressChange: (itemIdentifier: string, currentStatus: boolean) => void;
  onSwitchToAssistant?: () => void;
}

const WorkoutPlanDisplay = ({
  plan,
  onCopyPlan,
  onDeletePlan,
  onGenerateNew,
  progressMap,
  onProgressChange,
  onSwitchToAssistant
}: WorkoutPlanDisplayProps) => {
  const [openInstructions, setOpenInstructions] = useState<{ [key: string]: boolean }>({});

  const toggleInstructions = (exerciseIndex: number) => {
    setOpenInstructions(prev => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex]
    }));
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-800 border-green-300';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'avancado': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const parseInstructions = (instructions: string) => {
    if (!instructions) return [];
    
    const sections = [];
    
    // Detectar seções baseadas em palavras-chave em maiúsculo seguidas de dois pontos
    const sectionRegex = /([A-ZÁÊÔÇ\s]+):\s*([^A-ZÁÊÔÇ:]*(?:[a-zA-Záêôç][^A-ZÁÊÔÇ:]*)*)/g;
    let match;
    let lastIndex = 0;
    
    while ((match = sectionRegex.exec(instructions)) !== null) {
      const title = match[1].trim();
      const content = match[2].trim();
      
      // Verificar se é uma seção válida (não muito longa para o título)
      if (title.length <= 50 && content.length > 10) {
        sections.push({
          title: title,
          content: content
        });
        lastIndex = match.index + match[0].length;
      }
    }
    
    // Se não encontrou seções estruturadas, dividir em parágrafos
    if (sections.length === 0) {
      const paragraphs = instructions.split(/[.!?]\s+/).filter(p => p.trim().length > 20);
      paragraphs.forEach((paragraph, index) => {
        sections.push({
          title: `Passo ${index + 1}`,
          content: paragraph.trim() + (paragraph.endsWith('.') ? '' : '.')
        });
      });
    }
    
    return sections;
  };

  const getDifficultyIcon = (level: string) => {
    switch (level) {
      case 'iniciante': return <Star className="h-4 w-4" />;
      case 'intermediario': return <Flame className="h-4 w-4" />;
      case 'avancado': return <Trophy className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const handleMainTabSwitch = () => {
    console.log('🎯 Tentando mudar para a tab do assistente');
    
    if (onSwitchToAssistant) {
      console.log('✅ Usando callback para mudar para assistente');
      onSwitchToAssistant();
    } else {
      console.warn('❌ Callback onSwitchToAssistant não fornecido');
      // Fallback para o método anterior
      const mainTabsContainer = document.querySelector('.main-dashboard-tabs');
      console.log('📋 Container das tabs encontrado:', !!mainTabsContainer);
      
      if (mainTabsContainer) {
        const targetTrigger = mainTabsContainer.querySelector(`[value="assistant"]`) as HTMLElement;
        console.log('🎯 Trigger encontrado:', !!targetTrigger);
        
        if (targetTrigger) {
          console.log('✅ Clicando no trigger do assistente');
          targetTrigger.click();
          
          setTimeout(() => {
            const activeTab = mainTabsContainer.querySelector('[data-state="active"]');
            console.log('📊 Tab ativa após click:', activeTab?.getAttribute('value'));
          }, 100);
        } else {
          console.warn(`❌ Tab com value "assistant" não encontrada`);
          const allTriggers = mainTabsContainer.querySelectorAll('[role="tab"]');
          console.log('🔍 Todos os triggers encontrados:', allTriggers.length);
          allTriggers.forEach((trigger, index) => {
            console.log(`Tab ${index}:`, trigger.getAttribute('value'), trigger.textContent);
          });
        }
      } else {
        console.warn('❌ Container das tabs principais não encontrado');
      }
    }
  };

  const getExerciseTypeIcon = (exerciseName: string) => {
    const name = exerciseName.toLowerCase();
    if (name.includes('aquecimento') || name.includes('alongamento')) return <Zap className="h-5 w-5 text-orange-500" />;
    if (name.includes('flexão') || name.includes('supino')) return <DumbbellIcon className="h-5 w-5 text-blue-500" />;
    if (name.includes('agachamento') || name.includes('leg')) return <Activity className="h-5 w-5 text-green-500" />;
    if (name.includes('abdominal') || name.includes('prancha')) return <Target className="h-5 w-5 text-purple-500" />;
    if (name.includes('cardio') || name.includes('corrida')) return <Heart className="h-5 w-5 text-red-500" />;
    return <Dumbbell className="h-5 w-5 text-gray-500" />;
  };

  // Verificar e processar exercícios
  const exercises = plan.exercises || [];
  console.log('📊 Exercícios do plano:', exercises);

  const completedExercises = exercises.filter((_, index) => {
    const itemIdentifier = `${exercises[index].name || 'exercicio'}_${index}`;
    return progressMap.get(itemIdentifier) || false;
  }).length;

  const totalExercises = exercises.length;
  const progressPercentage = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Notificação para contatar o assistente */}
      <Card className="bg-gradient-to-r from-blue-50 via-purple-50 to-green-50 border-blue-200 shadow-md hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800 text-sm md:text-base flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  💪 Dúvidas sobre seu treino personalizado?
                </h3>
                <p className="text-blue-700 text-xs md:text-sm mt-1 leading-relaxed">
                  Nosso <strong>Personal Trainer IA</strong> está disponível 24/7 para esclarecer exercícios, 
                  técnicas avançadas e dicas personalizadas para seu perfil!
                </p>
              </div>
            </div>
            <Button 
              onClick={handleMainTabSwitch}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs md:text-sm px-3 md:px-4 py-2 flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Falar com</span> Assistente
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Treino Principal */}
      <Card className="bg-white border-green-200 shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-green-800 text-xl md:text-2xl flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-600 rounded-lg shadow-md">
                  <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-white" />
                </div>
                {plan.title}
              </CardTitle>
              <CardDescription className="text-green-700 text-sm md:text-base leading-relaxed mb-4">
                {plan.description}
              </CardDescription>
              
              {/* Badges informativos */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className={`${getDifficultyColor(plan.difficulty_level)} text-xs font-semibold px-3 py-1 border`}>
                  {getDifficultyIcon(plan.difficulty_level)}
                  <span className="ml-1">{plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}</span>
                </Badge>
                
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs font-semibold px-3 py-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {plan.duration_weeks} semanas
                </Badge>
                
                <Badge variant="outline" className="text-blue-700 border-blue-300 text-xs font-semibold px-3 py-1">
                  <Target className="h-3 w-3 mr-1" />
                  {totalExercises} exercícios
                </Badge>

                <Badge variant="outline" className="text-purple-700 border-purple-300 text-xs font-semibold px-3 py-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {progressPercentage}% concluído
                </Badge>
              </div>

              {/* Barra de progresso */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4 shadow-inner">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 shadow-md"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              
              {/* Indicador de plano gerado por IA */}
              <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Plano gerado por IA personalizada</span>
              </div>
            </div>
            
            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onCopyPlan} className="border-green-300 text-green-700 hover:bg-green-50 text-sm shadow-md hover:shadow-lg transition-all">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-sm shadow-md hover:shadow-lg transition-all">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Plano de Treino</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente seu plano de treino personalizado e todo o progresso registrado.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={onDeletePlan} className="bg-red-600 hover:bg-red-700">
                      Sim, excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              
              <Button onClick={onGenerateNew} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm shadow-md hover:shadow-lg transition-all">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Exercícios */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-green-800 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Dumbbell className="h-6 w-6 text-green-600" />
                </div>
                Exercícios do Plano Personalizado
              </h3>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-full">
                {completedExercises} de {totalExercises} concluídos
              </div>
            </div>
            
            {totalExercises === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500 mb-2">
                  <Dumbbell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                </div>
                <p className="text-gray-600">Nenhum exercício encontrado neste plano.</p>
                <Button onClick={onGenerateNew} className="mt-4">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novo Plano
                </Button>
              </div>
            ) : (
              <div className="grid gap-4">
                {exercises.map((exercise, index) => {
                  const itemIdentifier = `${exercise.name || 'exercicio'}_${index}`;
                  const isCompleted = progressMap.get(itemIdentifier) || false;
                  const instructionSections = parseInstructions(exercise.instructions || '');
                  
                  return (
                    <Card key={index} className={`border-2 transition-all duration-300 hover:shadow-lg ${
                      isCompleted 
                        ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md' 
                        : 'border-gray-200 hover:border-green-300'
                    }`}>
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex flex-col items-center gap-2">
                            <Checkbox
                              checked={isCompleted}
                              onCheckedChange={() => onProgressChange(itemIdentifier, isCompleted)}
                              className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 w-5 h-5"
                            />
                            {getExerciseTypeIcon(exercise.name || '')}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <h4 className={`font-bold text-lg ${
                                isCompleted 
                                  ? 'text-green-800 line-through opacity-75' 
                                  : 'text-gray-800'
                              }`}>
                                {exercise.name || `Exercício ${index + 1}`}
                              </h4>
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-800 border-green-300 text-xs px-2 py-1">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Concluído
                                </Badge>
                              )}
                            </div>
                            
                            {/* Métricas do exercício */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
                                <Target className="h-4 w-4 text-blue-600" />
                                <div>
                                  <span className="font-semibold text-blue-800 text-sm">Séries:</span>
                                  <span className={`ml-1 text-sm ${isCompleted ? 'text-green-700' : 'text-blue-700'}`}>
                                    {exercise.sets || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                                <Activity className="h-4 w-4 text-purple-600" />
                                <div>
                                  <span className="font-semibold text-purple-800 text-sm">Reps:</span>
                                  <span className={`ml-1 text-sm ${isCompleted ? 'text-green-700' : 'text-purple-700'}`}>
                                    {exercise.reps || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-lg border border-orange-200">
                                <Timer className="h-4 w-4 text-orange-600" />
                                <div>
                                  <span className="font-semibold text-orange-800 text-sm">Descanso:</span>
                                  <span className={`ml-1 text-sm ${isCompleted ? 'text-green-700' : 'text-orange-700'}`}>
                                    {exercise.rest || 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Instruções detalhadas com seções organizadas */}
                            {exercise.instructions && (
                              <Collapsible 
                                open={openInstructions[index]} 
                                onOpenChange={() => toggleInstructions(index)}
                              >
                                <div className="bg-gray-50 rounded-lg border border-gray-200">
                                  <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                                    <div className="flex items-center gap-2">
                                      <Info className="h-4 w-4 text-gray-600" />
                                      <span className="font-semibold text-gray-800 text-sm">Instruções Detalhadas Passo a Passo</span>
                                    </div>
                                    {openInstructions[index] ? (
                                      <ChevronUp className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4 text-gray-600" />
                                    )}
                                  </CollapsibleTrigger>
                                  
                                  <CollapsibleContent className="p-4 pt-0">
                                    <div className="space-y-4">
                                      {instructionSections.length > 0 ? (
                                        instructionSections.map((section, sectionIndex) => (
                                          <div key={sectionIndex} className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                            <div className="flex items-start gap-3">
                                              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                                                {sectionIndex + 1}
                                              </div>
                                              <div className="flex-1">
                                                <h5 className="font-bold text-blue-800 text-sm mb-2 uppercase tracking-wide">
                                                  {section.title}
                                                </h5>
                                                <p className={`text-sm leading-relaxed ${
                                                  isCompleted ? 'text-green-700' : 'text-gray-700'
                                                }`}>
                                                  {section.content}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                        ))
                                      ) : (
                                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                                          <p className={`text-sm leading-relaxed ${
                                            isCompleted ? 'text-green-700' : 'text-gray-700'
                                          }`}>
                                            {exercise.instructions}
                                          </p>
                                        </div>
                                      )}
                                      
                                      {/* Dica de consulta ao assistente */}
                                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 mt-4">
                                        <div className="flex items-center gap-2 text-blue-700 text-xs">
                                          <MessageCircle className="h-4 w-4" />
                                          <span className="font-medium">
                                            💡 Dúvidas sobre a execução? Consulte o <button 
                                              onClick={onSwitchToAssistant}
                                              className="underline hover:text-blue-800 font-semibold"
                                            >
                                              Personal Trainer IA
                                            </button> para esclarecimentos!
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CollapsibleContent>
                                </div>
                              </Collapsible>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Dicas Nutricionais */}
          {plan.nutrition_tips && plan.nutrition_tips.length > 0 && (
            <>
              <Separator className="my-8" />
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Apple className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-800">Dicas Nutricionais Personalizadas</h3>
                </div>
                
                <div className="grid gap-4">
                  {plan.nutrition_tips.map((tip, index) => (
                    <Card key={index} className="bg-gradient-to-r from-green-50 to-yellow-50 border-green-200 hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-md">
                            {index + 1}
                          </div>
                          <p className="text-green-800 text-sm leading-relaxed font-medium">{tip}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutPlanDisplay;
