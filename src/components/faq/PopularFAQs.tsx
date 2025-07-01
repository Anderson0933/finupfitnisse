
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Star, Eye, ThumbsUp } from 'lucide-react';
import { FAQ } from './FAQCard';

interface PopularFAQsProps {
  faqs: FAQ[];
  onSelectFAQ: (faqId: string) => void;
}

const PopularFAQs = ({ faqs, onSelectFAQ }: PopularFAQsProps) => {
  const popularFAQs = faqs
    .filter(faq => faq.isPopular || faq.views > 100 || faq.likes > 5)
    .slice(0, 3);

  if (popularFAQs.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-orange-800 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          Dúvidas em Alta
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {popularFAQs.map((faq, index) => (
          <div
            key={faq.id}
            className="bg-white/80 backdrop-blur-sm rounded-lg p-4 hover:bg-white/90 transition-all cursor-pointer group"
            onClick={() => onSelectFAQ(faq.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black border-0 text-xs">
                    #{index + 1}
                  </Badge>
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                </div>
                <h4 className="font-medium text-gray-900 text-sm leading-tight group-hover:text-orange-700 transition-colors">
                  {faq.question}
                </h4>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
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
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4 border-orange-200 text-orange-700 hover:bg-orange-50"
          onClick={() => {/* Ver todas as populares */}}
        >
          Ver Todas as Populares
        </Button>
      </CardContent>
    </Card>
  );
};

export default PopularFAQs;
