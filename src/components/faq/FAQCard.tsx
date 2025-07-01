
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ThumbsUp, ThumbsDown, Eye, MessageCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  views: number;
  likes: number;
  dislikes: number;
  isPopular?: boolean;
  hasActions?: boolean;
  actionButtons?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline';
    color?: string;
  }>;
  relatedFAQs?: string[];
}

interface FAQCardProps {
  faq: FAQ;
  isOpen: boolean;
  onToggle: () => void;
  onLike?: () => void;
  onDislike?: () => void;
  gradient: string;
  icon: any;
}

const FAQCard = ({ faq, isOpen, onToggle, onLike, onDislike, gradient, icon: IconComponent }: FAQCardProps) => {
  const [userVote, setUserVote] = useState<'like' | 'dislike' | null>(null);

  const handleLike = () => {
    if (userVote === 'like') {
      setUserVote(null);
    } else {
      setUserVote('like');
      onLike?.();
    }
  };

  const handleDislike = () => {
    if (userVote === 'dislike') {
      setUserVote(null);
    } else {
      setUserVote('dislike');
      onDislike?.();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isOpen ? 'ring-2 ring-blue-200' : ''
      }`}>
        <Collapsible open={isOpen} onOpenChange={onToggle}>
          <CollapsibleTrigger asChild>
            <div className="w-full p-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className={`w-10 h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {faq.isPopular && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0">
                          <Star className="h-3 w-3 mr-1 fill-current" />
                          Popular
                        </Badge>
                      )}
                      <div className="flex items-center text-xs text-gray-500 gap-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {faq.views}
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {faq.likes}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-base font-semibold text-gray-900 leading-tight">
                      {faq.question}
                    </h3>
                    
                    <div className="flex flex-wrap gap-1 mt-2">
                      {faq.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {faq.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{faq.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-gray-500 transition-transform" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500 transition-transform" />
                  )}
                </div>
              </div>
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <div className="ml-13">
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                          {faq.answer}
                        </p>
                      </div>
                      
                      {faq.actionButtons && (
                        <div className="mt-6 flex flex-wrap gap-3">
                          {faq.actionButtons.map((button, index) => (
                            <Button
                              key={index}
                              size="sm"
                              variant={button.variant || 'outline'}
                              onClick={button.onClick}
                              className={button.color || ''}
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              {button.label}
                            </Button>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-gray-600">Esta resposta foi útil?</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleLike}
                              className={`h-8 px-3 ${
                                userVote === 'like' ? 'bg-green-100 text-green-700' : 'hover:bg-green-50'
                              }`}
                            >
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              {faq.likes + (userVote === 'like' ? 1 : 0)}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleDislike}
                              className={`h-8 px-3 ${
                                userVote === 'dislike' ? 'bg-red-100 text-red-700' : 'hover:bg-red-50'
                              }`}
                            >
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              {faq.dislikes + (userVote === 'dislike' ? 1 : 0)}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </motion.div>
  );
};

export default FAQCard;
