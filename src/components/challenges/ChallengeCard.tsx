
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Calendar, Timer, Plus, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  category: 'workout' | 'nutrition' | 'general';
  target_value: number;
  target_unit: string;
  xp_reward: number;
  difficulty: 'easy' | 'medium' | 'hard';
  start_date: string;
  end_date: string;
  progress?: {
    current_progress: number;
    is_completed: boolean;
  };
}

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdateProgress: (challengeId: string, increment?: number) => void;
  getDifficultyColor: (difficulty: string) => string;
  completed?: boolean;
}

const ChallengeCard = ({ challenge, onUpdateProgress, getDifficultyColor, completed = false }: ChallengeCardProps) => {
  const progress = challenge.progress || { current_progress: 0, is_completed: false };
  const progressPercentage = (progress.current_progress / challenge.target_value) * 100;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return '💪';
      case 'nutrition': return '🍎';
      case 'general': return '🎯';
      default: return '🎯';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'daily': return <Calendar className="h-4 w-4" />;
      case 'weekly': return <Timer className="h-4 w-4" />;
      case 'monthly': return <Target className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getDaysRemaining = () => {
    const endDate = new Date(challenge.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${completed ? 'border-green-200 bg-green-50' : 'hover:shadow-lg transition-shadow'}`}>
        {completed && (
          <div className="absolute top-2 right-2">
            <div className="bg-green-500 text-white rounded-full p-1">
              <Check className="h-4 w-4" />
            </div>
          </div>
        )}
        
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
              <div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getTypeIcon(challenge.type)}
                  <span className="text-xs text-gray-500 capitalize">{challenge.type}</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-yellow-600">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">{challenge.xp_reward} XP</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 text-sm">{challenge.description}</p>

          {/* Barra de Progresso */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">
                {progress.current_progress}/{challenge.target_value} {challenge.target_unit}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Informações adicionais */}
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Termina em {getDaysRemaining()} dias</span>
            {progress.is_completed && (
              <span className="text-green-600 font-medium">✅ Concluído</span>
            )}
          </div>

          {/* Botão de ação */}
          {!progress.is_completed && (
            <Button
              onClick={() => onUpdateProgress(challenge.id)}
              className="w-full"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Registrar Progresso
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChallengeCard;
