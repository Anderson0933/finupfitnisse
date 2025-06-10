import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lightbulb, RefreshCw, Apple, Dumbbell, Heart, Zap, Target, Brain, Clock, Utensils, Droplets, Moon, FlameKindling, Shield, Quote } from 'lucide-react';

const DailyTip = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

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
    },
    {
      category: 'Recuperação',
      icon: <Moon className="h-5 w-5" />,
      title: 'Sono é ganho muscular',
      content: 'Dormir 7-9 horas é quando seus músculos realmente crescem. O descanso é parte do treino!',
      color: 'from-slate-500 to-slate-600'
    },
    {
      category: 'Treino',
      icon: <Clock className="h-5 w-5" />,
      title: 'Descanso entre séries',
      content: 'Para hipertrofia: 60-90s. Para força: 2-3min. Para resistência: 30-60s.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      category: 'Nutrição',
      icon: <Utensils className="h-5 w-5" />,
      title: 'Coma carboidratos antes',
      content: 'Consuma carboidratos 1-2 horas antes do treino para ter energia máxima nos exercícios.',
      color: 'from-green-500 to-green-600'
    },
    {
      category: 'Hidratação',
      icon: <Droplets className="h-5 w-5" />,
      title: 'Beba água durante o dia',
      content: 'Mantenha-se hidratado o dia todo. A sede já é sinal de desidratação leve!',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      category: 'Treino',
      icon: <FlameKindling className="h-5 w-5" />,
      title: 'Variedade é fundamental',
      content: 'Mude seu treino a cada 6-8 semanas para evitar adaptação e continuar progredindo.',
      color: 'from-red-500 to-red-600'
    },
    {
      category: 'Prevenção',
      icon: <Shield className="h-5 w-5" />,
      title: 'Alongue após treinar',
      content: 'Dedique 10 minutos ao alongamento pós-treino. Melhora flexibilidade e reduz dores.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      category: 'Motivação',
      icon: <Target className="h-5 w-5" />,
      title: 'Estabeleça metas pequenas',
      content: 'Divida grandes objetivos em metas semanais. Cada pequena conquista te motiva mais!',
      color: 'from-amber-500 to-amber-600'
    },
    {
      category: 'Nutrição',
      icon: <Apple className="h-5 w-5" />,
      title: 'Frutas pré-treino',
      content: 'Banana ou maçã 30min antes do treino fornecem energia rápida e natural.',
      color: 'from-lime-500 to-lime-600'
    },
    {
      category: 'Treino',
      icon: <Dumbbell className="h-5 w-5" />,
      title: 'Exercícios compostos',
      content: 'Priorizem agachamento, levantamento terra e supino. Trabalham múltiplos músculos!',
      color: 'from-violet-500 to-violet-600'
    },
    {
      category: 'Mental',
      icon: <Brain className="h-5 w-5" />,
      title: 'Música aumenta performance',
      content: 'Músicas com 120-140 BPM podem aumentar sua força e resistência em até 15%!',
      color: 'from-fuchsia-500 to-fuchsia-600'
    },
    {
      category: 'Recuperação',
      icon: <Heart className="h-5 w-5" />,
      title: 'Stress prejudica ganhos',
      content: 'Alto stress libera cortisol, que quebra músculos. Pratique relaxamento e meditação.',
      color: 'from-rose-500 to-rose-600'
    },
    {
      category: 'Nutrição',
      icon: <Zap className="h-5 w-5" />,
      title: 'Não pule refeições',
      content: 'Coma a cada 3-4 horas para manter o metabolismo ativo e evitar perda muscular.',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      category: 'Treino',
      icon: <Target className="h-5 w-5" />,
      title: 'Progresso gradual',
      content: 'Aumente peso/repetições gradualmente. Força vem com paciência e consistência.',
      color: 'from-sky-500 to-sky-600'
    },
    {
      category: 'Motivação',
      icon: <FlameKindling className="h-5 w-5" />,
      title: 'Celebre pequenas vitórias',
      content: 'Completou a semana de treinos? Parabéns! Reconheça e celebre cada conquista.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  const motivationalQuotes = [
    "A única coisa impossível é aquilo que você não tenta.",
    "Seu corpo pode aguentar. É sua mente que você precisa convencer.",
    "O progresso não é sobre perfeição, é sobre consistência.",
    "Cada gota de suor é um passo mais próximo do seu objetivo.",
    "Você é mais forte do que pensa e mais capaz do que imagina.",
    "O melhor treino é aquele que você faz, mesmo quando não quer.",
    "Transforme suas limitações em motivações.",
    "Resultados acontecem fora da sua zona de conforto.",
    "Seja paciente com o processo e orgulhoso do progresso.",
    "Sua única competição é quem você foi ontem.",
    "Disciplina é escolher entre o que você quer agora e o que mais quer.",
    "Cada repetição te aproxima da versão que você quer ser.",
    "Não conte os dias, faça os dias contarem.",
    "Força não vem do que você consegue fazer, vem de superar coisas que pensou que não conseguia.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Você não precisa ser extremo, apenas consistente.",
    "A dor que você sente hoje será a força que sentirá amanhã.",
    "Acredite em você mesmo e todo o resto se encaixará.",
    "Champions não são feitos em academias. São feitos de algo profundo - desejo, sonho e visão.",
    "O primeiro passo não te leva onde você quer ir, mas te tira de onde você está.",
    "Seja mais forte que suas desculpas.",
    "O único mau treino é aquele que não acontece.",
    "Foque no progresso, não na perfeição.",
    "Seu futuro eu está torcendo por você hoje.",
    "Desafie-se, porque ninguém mais fará isso por você.",
    "A mudança começa no fim da sua zona de conforto.",
    "Seja a energia que você quer atrair.",
    "Pequenos passos ainda são passos.",
    "Você já sobreviveu a 100% dos seus piores dias.",
    "Seja orgulhoso de cada pequena vitória.",
    "O que não te desafia, não te transforma."
  ];

  const currentTip = tips[currentTipIndex];
  const currentQuote = motivationalQuotes[currentQuoteIndex];

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const nextQuote = () => {
    setCurrentQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  // Rotacionar automaticamente a cada 24 horas baseado na data
  useEffect(() => {
    const today = new Date().getDate();
    setCurrentTipIndex(today % tips.length);
    setCurrentQuoteIndex(today % motivationalQuotes.length);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Dica do Dia */}
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

      {/* Frase Motivacional */}
      <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Quote className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-white text-lg font-bold">Motivação Diária</CardTitle>
                <p className="text-white/90 text-sm">Inspiração</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextQuote}
              className="text-white hover:bg-white/20 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <blockquote className="text-gray-800 text-lg font-medium leading-relaxed italic">
                "{currentQuote}"
              </blockquote>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyTip;
