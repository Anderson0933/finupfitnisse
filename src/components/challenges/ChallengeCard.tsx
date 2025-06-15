
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Clock, Target } from 'lucide-react';

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
  is_active: boolean;
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
  disabled?: boolean;
}

const ChallengeCard = ({ 
  challenge, 
  onUpdateProgress, 
  getDifficultyColor, 
  completed = false,
  disabled = false
}: ChallengeCardProps) => {
  const progressPercentage = challenge.progress 
    ? (challenge.progress.current_progress / challenge.target_value) * 100 
    : 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workout': return '🏋️';
      case 'nutrition': return '🥗';
      case 'general': return '🎯';
      default: return '📋';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'weekly': return 'bg-purple-100 text-purple-800';
      case 'monthly': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={`${completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'} transition-all duration-200 hover:shadow-md`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(challenge.category)}</span>
            <CardTitle className="text-sm font-semibold">{challenge.title}</CardTitle>
          </div>
          {completed && <Trophy className="h-4 w-4 text-yellow-500" />}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary" className={getTypeColor(challenge.type)}>
            {challenge.type}
          </Badge>
          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
            {challenge.difficulty}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">{challenge.description}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-semibold">
              {challenge.progress?.current_progress || 0}/{challenge.target_value} {challenge.target_unit}
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Target className="h-3 w-3" />
            <span>+{challenge.xp_reward} XP</span>
          </div>
          
          {!completed && (
            <Button 
              size="sm" 
              onClick={() => onUpdateProgress(challenge.id)}
              disabled={disabled || challenge.progress?.is_completed}
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {disabled ? 'Atualizando...' : '+1'}
            </Button>
          )}
        </div>

        {completed && (
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">
              ✅ Concluído
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
