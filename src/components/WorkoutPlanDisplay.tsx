
import React from 'react';
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
  Apple
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

interface WorkoutPlanDisplayProps {
  plan: WorkoutPlan;
  onCopyPlan: () => void;
  onDeletePlan: () => void;
  onGenerateNew: () => void;
  progressMap: Map<string, boolean>;
  onProgressChange: (itemIdentifier: string, currentStatus: boolean) => void;
}

const WorkoutPlanDisplay = ({
  plan,
  onCopyPlan,
  onDeletePlan,
  onGenerateNew,
  progressMap,
  onProgressChange
}: WorkoutPlanDisplayProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'iniciante': return 'bg-green-100 text-green-800';
      case 'intermediario': return 'bg-yellow-100 text-yellow-800';
      case 'avancado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleMainTabSwitch = (tabValue: string) => {
    const mainTabs = document.querySelector('.main-dashboard-tabs');
    if (mainTabs) {
      const targetTrigger = mainTabs.querySelector(`[value="${tabValue}"]`) as HTMLElement;
      if (targetTrigger) {
        targetTrigger.click();
      } else {
        console.warn(`Tab with value "${tabValue}" not found`);
      }
    } else {
      console.warn('Main dashboard tabs not found');
    }
  };

  return (
    <div className="space-y-6">
      {/* Notificação para contatar o assistente */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-800 text-sm md:text-base">
                  💪 Tem dúvidas sobre seu treino?
                </h3>
                <p className="text-blue-700 text-xs md:text-sm mt-1">
                  Nosso Personal Trainer IA está disponível 24/7 para esclarecer exercícios, técnicas e dicas personalizadas!
                </p>
              </div>
            </div>
            <Button 
              onClick={() => handleMainTabSwitch('assistant')}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm px-3 md:px-4 py-2 flex-shrink-0"
            >
              <MessageCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
              <span className="hidden sm:inline">Falar com</span> Assistente
              <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 md:ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plano de Treino */}
      <Card className="bg-white border-green-200 shadow-lg">
        <CardHeader className="bg-green-50">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-green-800 text-xl md:text-2xl flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                {plan.title}
              </CardTitle>
              <CardDescription className="text-green-700 text-sm md:text-base">
                {plan.description}
              </CardDescription>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className={`${getDifficultyColor(plan.difficulty_level)} text-xs`}>
                  📊 {plan.difficulty_level.charAt(0).toUpperCase() + plan.difficulty_level.slice(1)}
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {plan.duration_weeks} semanas
                </Badge>
                <Badge variant="outline" className="text-green-700 border-green-300 text-xs">
                  <Target className="h-3 w-3 mr-1" />
                  {plan.exercises?.length || 0} exercícios
                </Badge>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={onCopyPlan} className="border-green-300 text-green-700 hover:bg-green-50 text-sm">
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-50 text-sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Plano de Treino</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso excluirá permanentemente seu plano de treino e todo o progresso registrado.
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
              
              <Button onClick={onGenerateNew} className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Novo Plano
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Exercícios */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Exercícios do Plano
            </h3>
            
            <div className="space-y-4">
              {plan.exercises?.map((exercise, index) => {
                const itemIdentifier = `${exercise.name}_${index}`;
                const isCompleted = progressMap.get(itemIdentifier) || false;
                
                return (
                  <Card key={index} className={`border transition-all duration-200 ${isCompleted ? 'bg-green-50 border-green-200' : 'border-gray-200'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={isCompleted}
                          onCheckedChange={() => onProgressChange(itemIdentifier, isCompleted)}
                          className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium mb-2 ${isCompleted ? 'text-green-800 line-through' : 'text-gray-800'}`}>
                            {exercise.name}
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-600">Séries:</span>
                              <span className={isCompleted ? 'text-green-700' : 'text-gray-800'}>{exercise.sets}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-600">Reps:</span>
                              <span className={isCompleted ? 'text-green-700' : 'text-gray-800'}>{exercise.reps}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="font-medium text-gray-600">Descanso:</span>
                              <span className={isCompleted ? 'text-green-700' : 'text-gray-800'}>{exercise.rest}</span>
                            </div>
                          </div>
                          
                          <p className={`text-sm leading-relaxed ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                            {exercise.instructions}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Dicas Nutricionais */}
          {plan.nutrition_tips && plan.nutrition_tips.length > 0 && (
            <>
              <Separator className="my-6" />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                  <Apple className="h-5 w-5" />
                  Dicas Nutricionais
                </h3>
                <div className="space-y-3">
                  {plan.nutrition_tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <span className="text-green-600 font-bold text-sm mt-1">{index + 1}.</span>
                      <p className="text-green-800 text-sm leading-relaxed">{tip}</p>
                    </div>
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
