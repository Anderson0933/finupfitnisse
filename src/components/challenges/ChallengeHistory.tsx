
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Award, Calendar, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ChallengeCard from './ChallengeCard';

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
    completed_at?: string;
  };
}

interface ChallengeHistoryProps {
  completedChallenges: Challenge[];
  onUpdateProgress: (challengeId: string, increment?: number) => void;
  getDifficultyColor: (difficulty: string) => string;
  disabled?: boolean;
}

const ITEMS_PER_PAGE = 6;

const ChallengeHistory = ({ 
  completedChallenges, 
  onUpdateProgress, 
  getDifficultyColor, 
  disabled = false 
}: ChallengeHistoryProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Filtrar por período
  const filterByPeriod = (challenges: Challenge[]) => {
    if (selectedPeriod === 'all') return challenges;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return challenges.filter(challenge => {
      if (!challenge.progress?.completed_at) return false;
      
      const completedDate = new Date(challenge.progress.completed_at);
      
      switch (selectedPeriod) {
        case 'today':
          return completedDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return completedDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return completedDate >= monthAgo;
        default:
          return true;
      }
    });
  };

  const filteredChallenges = filterByPeriod(completedChallenges);
  const totalPages = Math.ceil(filteredChallenges.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentChallenges = filteredChallenges.slice(startIndex, endIndex);

  // Estatísticas do histórico
  const stats = {
    total: completedChallenges.length,
    totalXP: completedChallenges.reduce((sum, challenge) => sum + challenge.xp_reward, 0),
    thisWeek: filterByPeriod(completedChallenges.filter(c => {
      if (!c.progress?.completed_at) return false;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(c.progress.completed_at) >= weekAgo;
    })).length,
  };

  if (completedChallenges.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-green-500" />
            Histórico de Desafios
            <Badge variant="secondary" className="ml-2">
              {stats.total}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {stats.totalXP} XP Total
              </span>
              <span>{stats.thisWeek} esta semana</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Filtros de Período */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPeriod === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedPeriod('all');
                setCurrentPage(1);
              }}
            >
              Todos
            </Button>
            <Button
              variant={selectedPeriod === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedPeriod('today');
                setCurrentPage(1);
              }}
            >
              Hoje
            </Button>
            <Button
              variant={selectedPeriod === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedPeriod('week');
                setCurrentPage(1);
              }}
            >
              Esta Semana
            </Button>
            <Button
              variant={selectedPeriod === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedPeriod('month');
                setCurrentPage(1);
              }}
            >
              Este Mês
            </Button>
          </div>

          {filteredChallenges.length > 0 ? (
            <>
              {/* Lista de Desafios com Scroll */}
              <ScrollArea className="h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  {currentChallenges.map((challenge) => (
                    <div key={challenge.id} className="relative">
                      <ChallengeCard
                        challenge={challenge}
                        onUpdateProgress={onUpdateProgress}
                        getDifficultyColor={getDifficultyColor}
                        completed
                        disabled={disabled}
                      />
                      {challenge.progress?.completed_at && (
                        <div className="absolute top-2 right-2">
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(new Date(challenge.progress.completed_at), 'dd/MM', { locale: ptBR })}
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => setCurrentPage(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {/* Resumo da Página Atual */}
              <div className="text-center text-sm text-gray-500">
                Mostrando {startIndex + 1} - {Math.min(endIndex, filteredChallenges.length)} de {filteredChallenges.length} desafios
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum desafio concluído no período selecionado.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ChallengeHistory;
