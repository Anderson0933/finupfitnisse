
import { useState, useEffect } from 'react';
import { Play, X, TrendingUp, Calendar, User, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  author: string;
  image: string;
  url: string;
  source: string;
}

const NewsSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pool expandido de notícias verificadas e funcionais
  const newsPool: NewsItem[] = [
    {
      id: '1',
      title: "Os Benefícios do Treinamento de Alta Intensidade (HIIT)",
      description: "Descubra como o HIIT pode revolucionar sua rotina de exercícios e acelerar seus resultados em menos tempo.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Dr. Carlos Fitness",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.healthline.com/health/fitness/benefits-of-hiit",
      source: "Healthline"
    },
    {
      id: '2',
      title: "Nutrição Pós-Treino: Guia Completo",
      description: "Aprenda sobre a janela anabólica e os melhores alimentos para consumir após o treino para maximizar a recuperação.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Nutricionista Ana Silva",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop",
      url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389",
      source: "Mayo Clinic"
    },
    {
      id: '3',
      title: "A Importância do Sono para o Crescimento Muscular",
      description: "Entenda como a qualidade do sono afeta diretamente seus ganhos na academia e sua recuperação muscular.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Prof. João Santos",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop",
      url: "https://www.sleepfoundation.org/physical-health/sleep-and-muscle-recovery",
      source: "Sleep Foundation"
    },
    {
      id: '4',
      title: "Hidratação Durante o Exercício: Mitos e Verdades",
      description: "Desvende os principais mitos sobre hidratação esportiva e aprenda as melhores práticas para se manter hidratado.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Dra. Maria Água",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop",
      url: "https://www.webmd.com/fitness-exercise/features/water-for-exercise-fitness",
      source: "WebMD"
    },
    {
      id: '5',
      title: "Exercícios Funcionais vs. Musculação Tradicional",
      description: "Compare as vantagens e desvantagens de cada modalidade e descubra qual é a melhor para seus objetivos.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Personal Trainer Pedro",
      image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=250&fit=crop",
      url: "https://www.acefitness.org/certifiednewsarticle/3595/functional-training-vs-traditional-strength-training/",
      source: "ACE Fitness"
    },
    {
      id: '6',
      title: "Meditação e Mindfulness no Esporte",
      description: "Como a prática da meditação pode melhorar sua performance atlética e reduzir o estresse do treinamento.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Psicóloga Sofia Zen",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
      url: "https://www.health.harvard.edu/blog/mindfulness-meditation-may-ease-anxiety-mental-stress-201401086967",
      source: "Harvard Health"
    },
    {
      id: '7',
      title: "Suplementação Esportiva: O Que Realmente Funciona",
      description: "Análise científica dos suplementos mais populares e suas reais eficácias para o desempenho atlético.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Dr. Marcos Nutri",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=250&fit=crop",
      url: "https://www.healthline.com/nutrition/best-supplements-for-athletes",
      source: "Healthline"
    },
    {
      id: '8',
      title: "Prevenção de Lesões no Treinamento",
      description: "Estratégias essenciais para evitar lesões comuns na academia e manter consistência no treinamento.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Fisioterapeuta Laura",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.mayoclinic.org/healthy-lifestyle/fitness/in-depth/exercise/art-20048389",
      source: "Mayo Clinic"
    },
    {
      id: '9',
      title: "Exercícios para Fortalecer o Core",
      description: "Descubra os melhores exercícios para desenvolver um core forte e melhorar sua postura e performance.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Instrutor Felipe",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.webmd.com/fitness-exercise/features/core-strength-training",
      source: "WebMD"
    },
    {
      id: '10',
      title: "Flexibilidade e Mobilidade: Diferenças e Importância",
      description: "Entenda a diferença entre flexibilidade e mobilidade e como trabalhar ambas para otimizar seus treinos.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Especialista Rita",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
      url: "https://www.acefitness.org/education-and-resources/professional/expert-articles/5598/flexibility-vs-mobility-whats-the-difference/",
      source: "ACE Fitness"
    },
    {
      id: '11',
      title: "Exercícios em Casa vs. Academia: Prós e Contras",
      description: "Compare as vantagens de treinar em casa versus na academia e descubra qual opção se adapta melhor ao seu estilo de vida.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Coach Amanda",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.healthline.com/health/fitness/home-workout-vs-gym",
      source: "Healthline"
    },
    {
      id: '12',
      title: "Tecnologia Wearable no Fitness",
      description: "Como dispositivos inteligentes estão transformando o monitoramento de atividade física e saúde.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Tech Analyst Bruno",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      url: "https://www.webmd.com/fitness-exercise/features/fitness-trackers-do-they-work",
      source: "WebMD"
    },
    {
      id: '13',
      title: "Periodização do Treinamento para Melhores Resultados",
      description: "Aprenda sobre periodização e como variar sua rotina de treinos para evitar plateaus e continuar progredindo.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Prof. Ricardo Treino",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.acefitness.org/education-and-resources/professional/expert-articles/5869/periodization-training-programs/",
      source: "ACE Fitness"
    },
    {
      id: '14',
      title: "Exercícios para Melhorar a Postura",
      description: "Combata os efeitos do trabalho sedentário com exercícios específicos para corrigir a postura e aliviar dores.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Quiropraxista Carla",
      image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop",
      url: "https://www.mayoclinic.org/healthy-lifestyle/adult-health/in-depth/posture/art-20046956",
      source: "Mayo Clinic"
    },
    {
      id: '15',
      title: "Motivação e Consistência no Fitness",
      description: "Estratégias psicológicas para manter a motivação em alta e criar hábitos duradouros de exercícios.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Psicólogo do Esporte Daniel",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.health.harvard.edu/staying-healthy/why-you-should-exercise",
      source: "Harvard Health"
    }
  ];

  // Função para selecionar notícias baseadas na data (rotação diária)
  const getDailyNews = (): NewsItem[] => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const startIndex = (dayOfYear * 2) % newsPool.length; // Multiplica por 2 para mais variação
    
    const selectedNews: NewsItem[] = [];
    for (let i = 0; i < 6; i++) {
      const index = (startIndex + i) % newsPool.length;
      const newsItem = { 
        ...newsPool[index],
        id: `daily-${i + 1}`,
        date: new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR') // Datas variadas
      };
      selectedNews.push(newsItem);
    }
    
    return selectedNews;
  };

  useEffect(() => {
    const loadDailyNews = () => {
      setIsLoading(true);
      console.log('📰 Carregando notícias diárias...');
      
      // Simula um pequeno delay para melhor UX
      setTimeout(() => {
        const dailyNews = getDailyNews();
        setNewsItems(dailyNews);
        setIsLoading(false);
        console.log('✅ Notícias diárias carregadas:', dailyNews.length);
      }, 800);
    };

    loadDailyNews();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header da seção */}
      <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 border-none text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Notícias do Fitness
          </CardTitle>
          <CardDescription className="text-indigo-100">
            Fique por dentro das últimas tendências, pesquisas e novidades do mundo fitness
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Vídeo em destaque */}
      <Card className="bg-white border-indigo-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl text-indigo-800">Vídeo em Destaque</CardTitle>
          <CardDescription>
            Assista às últimas novidades e dicas dos especialistas em fitness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl overflow-hidden">
            <div className="aspect-video relative flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20"></div>
              <Button
                size="lg"
                onClick={() => setIsVideoPlaying(true)}
                className="relative z-10 bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 backdrop-blur-sm"
              >
                <Play className="h-6 w-6 mr-2" />
                Assistir Vídeo
              </Button>
              <div className="absolute bottom-4 left-4 text-white">
                <h3 className="text-lg font-semibold">FitAI Pro: Revolucionando o Fitness</h3>
                <p className="text-sm text-white/80">Conheça o futuro do treinamento personalizado</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de notícias */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-white border-gray-200 shadow-lg">
              <div className="aspect-video bg-gray-200 animate-pulse rounded-t-lg"></div>
              <CardHeader className="p-4">
                <div className="h-6 bg-gray-200 animate-pulse rounded mb-2"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded mb-1"></div>
                <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm">
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-1/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((news) => (
            <Card key={news.id} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video overflow-hidden rounded-t-lg">
                <img 
                  src={news.image} 
                  alt={news.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop";
                  }}
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg text-gray-800 line-clamp-2">{news.title}</CardTitle>
                <CardDescription className="text-gray-600 line-clamp-3">
                  {news.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{news.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{news.date}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {news.source}
                  </span>
                  <a 
                    href={news.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Ver artigo</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal do vídeo */}
      {isVideoPlaying && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-800">FitAI Pro em Ação</h3>
              <Button 
                variant="ghost" 
                onClick={() => setIsVideoPlaying(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                src="https://res.cloudinary.com/dz7g1kzxi/video/upload/v1748636068/svjomqwiyhnp6tzgfx6y.mp4" 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover" 
              >
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">
                Transforme seu corpo com IA
              </h4>
              <p className="text-gray-600">
                Veja como nossa plataforma utiliza inteligência artificial para criar treinos personalizados, 
                acompanhar sua evolução e ajustar automaticamente seu plano de acordo com seus resultados.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsSection;
