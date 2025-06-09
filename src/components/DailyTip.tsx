
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Apple, Dumbbell, Heart, Zap, Target, Brain } from 'lucide-react';

const DailyTip = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const tips = [
    {
      category: 'Treino',
      icon: <Dumbbell className="h-5 w-5" />,
      title: 'Aquecimento é fundamental',
      content: 'Sempre faça 5-10 minutos de aquecimento antes de treinar. Isso reduz o risco de lesões em até 50%!',
      color: 'from-blue-500 to-blue-600'
    },
    {
      category: 'Nutrição',
      icon: <Apple className="h-5 w-5" />,
      title: 'Hidratação pós-treino',
      content: 'Beba água com limão após o treino. Ajuda na recuperação muscular e repõe eletrólitos naturalmente.',
      color: 'from-green-500 to-green-600'
    },
    {
      category: 'Motivação',
      icon: <Heart className="h-5 w-5" />,
      title: 'Progresso não é linear',
      content: 'Seus resultados podem variar dia a dia. O importante é a consistência ao longo das semanas!',
      color: 'from-pink-500 to-pink-600'
    },
    {
      category: 'Treino',
      icon: <Target className="h-5 w-5" />,
      title: 'Qualidade sobre quantidade',
      content: 'Melhor fazer 3 séries com técnica perfeita do que 5 séries com execução ruim.',
      color: 'from-orange-500 to-orange-600'
    },
    {
      category: 'Nutrição',
      icon: <Zap className="h-5 w-5" />,
      title: 'Proteína pós-treino',
      content: 'Consuma proteína até 2 horas após o treino para maximizar a síntese de proteínas musculares.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      category: 'Mental',
      icon: <Brain className="h-5 w-5" />,
      title: 'Visualização funciona',
      content: 'Visualize seus exercícios antes de executá-los. Isso melhora a coordenação e força neural.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ];

  const currentTip = tips[currentTipIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  // Rotacionar automaticamente a cada 24 horas baseado na data
  useEffect(() => {
    const today = new Date().getDate();
    setCurrentTipIndex(today % tips.length);
  }, []);

  return (
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${currentTip.color} text-white relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Lightbulb className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-white text-lg font-bold">Dica do Dia</CardTitle>
              <p className="text-white/90 text-sm">{currentTip.category}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextTip}
            className="text-white hover:bg-white/20 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${currentTip.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
            {currentTip.icon}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg mb-2">{currentTip.title}</h3>
            <p className="text-gray-600 leading-relaxed">{currentTip.content}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyTip;
