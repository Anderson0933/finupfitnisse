
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dumbbell, Apple, CreditCard, Settings, Star, Zap, HelpCircle, Trophy } from 'lucide-react';

export interface Category {
  id: string;
  name: string;
  icon: any;
  color: string;
  count: number;
}

interface CategoryFilterProps {
  categories: Category[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

const CategoryFilter = ({ categories, activeCategory, setActiveCategory }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <Button
        variant={activeCategory === 'all' ? 'default' : 'outline'}
        onClick={() => setActiveCategory('all')}
        className={`h-10 px-4 rounded-full transition-all duration-300 ${
          activeCategory === 'all' 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105' 
            : 'hover:bg-blue-50 hover:border-blue-300'
        }`}
      >
        <HelpCircle className="h-4 w-4 mr-2" />
        Todas
        <Badge variant="secondary" className="ml-2 bg-white/20 text-current">
          {categories.reduce((acc, cat) => acc + cat.count, 0)}
        </Badge>
      </Button>
      
      {categories.map((category) => {
        const IconComponent = category.icon;
        const isActive = activeCategory === category.id;
        
        return (
          <Button
            key={category.id}
            variant={isActive ? 'default' : 'outline'}
            onClick={() => setActiveCategory(category.id)}
            className={`h-10 px-4 rounded-full transition-all duration-300 ${
              isActive 
                ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105` 
                : 'hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <IconComponent className="h-4 w-4 mr-2" />
            {category.name}
            <Badge variant="secondary" className="ml-2 bg-white/20 text-current">
              {category.count}
            </Badge>
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
