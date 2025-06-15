
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Lock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  condition_type: string;
  condition_value: number;
  xp_reward: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked_at?: string;
}

interface AchievementCardProps {
  achievement: Achievement;
  getRarityColor: (rarity: string) => string;
  unlocked?: boolean;
}

const AchievementCard = ({ achievement, getRarityColor, unlocked = false }: AchievementCardProps) => {
  const formatCondition = (type: string, value: number) => {
    switch (type) {
      case 'challenges_completed':
        return `Complete ${value} desafios`;
      case 'total_xp':
        return `Acumule ${value} XP`;
      case 'streak_days':
        return `Mantenha ${value} dias de sequência`;
      default:
        return `Alcance ${value}`;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`relative overflow-hidden ${unlocked ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-gray-200 bg-gray-50 opacity-75'}`}>
        {unlocked && (
          <div className="absolute top-2 right-2">
            <div className="bg-yellow-500 text-white rounded-full p-1">
              <Star className="h-4 w-4" />
            </div>
          </div>
        )}
        
        {!unlocked && (
          <div className="absolute top-2 right-2">
            <div className="bg-gray-400 text-white rounded-full p-1">
              <Lock className="h-4 w-4" />
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className={`text-3xl p-2 rounded-lg ${unlocked ? 'bg-white shadow-sm' : 'bg-gray-200'}`}>
              {achievement.icon}
            </div>
            <div className="flex-1">
              <CardTitle className={`text-lg ${unlocked ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getRarityColor(achievement.rarity)}>
                  {achievement.rarity}
                </Badge>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Trophy className="h-3 w-3" />
                  <span className="text-xs font-semibold">{achievement.xp_reward} XP</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <p className={`text-sm ${unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>

          <div className={`text-xs ${unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
            <p className="font-medium">Condição:</p>
            <p>{formatCondition(achievement.condition_type, achievement.condition_value)}</p>
          </div>

          {unlocked && achievement.unlocked_at && (
            <div className="text-xs text-green-600 font-medium">
              🎉 Desbloqueado em {formatDate(achievement.unlocked_at)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AchievementCard;
