
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Heart, MessageCircle, ThumbsUp, Trophy } from 'lucide-react';

interface UserBadgeProps {
  type: 'expert' | 'helpful' | 'popular' | 'active' | 'loved' | 'champion';
  size?: 'sm' | 'md' | 'lg';
}

const UserBadge = ({ type, size = 'sm' }: UserBadgeProps) => {
  const badges = {
    expert: {
      icon: Crown,
      label: 'Especialista',
      color: 'bg-yellow-500',
      description: 'Usuário com conhecimento excepcional'
    },
    helpful: {
      icon: Star,
      label: 'Prestativo',
      color: 'bg-blue-500',
      description: 'Sempre ajuda outros membros'
    },
    popular: {
      icon: ThumbsUp,
      label: 'Popular',
      color: 'bg-green-500',
      description: 'Posts muito curtidos'
    },
    active: {
      icon: MessageCircle,
      label: 'Ativo',
      color: 'bg-purple-500',
      description: 'Participa ativamente da comunidade'
    },
    loved: {
      icon: Heart,
      label: 'Querido',
      color: 'bg-red-500',
      description: 'Muito amado pela comunidade'
    },
    champion: {
      icon: Trophy,
      label: 'Campeão',
      color: 'bg-orange-500',
      description: 'Top contributor do mês'
    }
  };

  const badge = badges[type];
  const Icon = badge.icon;
  
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <Badge 
      className={`${badge.color} text-white hover:opacity-80 transition-opacity`}
      title={badge.description}
    >
      <Icon className={`${sizeClasses[size]} mr-1`} />
      <span className="text-xs">{badge.label}</span>
    </Badge>
  );
};

export default UserBadge;
