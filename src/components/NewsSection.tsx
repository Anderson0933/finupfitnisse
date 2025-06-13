
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

  // URLs de feeds RSS de sites de fitness não concorrentes
  const rssSources = [
    'https://rss.cnn.com/rss/edition.rss',
    'https://feeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
    'https://www.bodybuilding.com/rss/latest-articles.xml'
  ];

  useEffect(() => {
    const fetchNews = async () => {
      setIsLoading(true);
      try {
        // Usando um serviço gratuito de proxy RSS para converter RSS em JSON
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss&api_key=your_api_key&count=6`
        );
        
        if (response.ok) {
          const data = await response.json();
          const formattedNews: NewsItem[] = data.items?.slice(0, 6).map((item: any, index: number) => ({
            id: `news-${index}`,
            title: item.title || 'Título não disponível',
            description: item.description?.replace(/<[^>]*>/g, '').substring(0, 150) + '...' || 'Descrição não disponível',
            date: new Date(item.pubDate || Date.now()).toLocaleDateString('pt-BR'),
            author: item.author || 'Redação',
            image: item.enclosure?.link || item.thumbnail || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
            url: item.link || '#',
            source: 'CNN Health'
          })) || [];
          
          setNewsItems(formattedNews);
        } else {
          // Fallback para notícias estáticas se a API falhar
          setNewsItems(getStaticNews());
        }
      } catch (error) {
        console.log('Erro ao buscar notícias, usando conteúdo estático:', error);
        setNewsItems(getStaticNews());
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  const getStaticNews = (): NewsItem[] => [
    {
      id: '1',
      title: "Novas Descobertas sobre Exercícios de Alta Intensidade",
      description: "Pesquisadores descobrem que treinos HIIT de 15 minutos podem ser tão efetivos quanto sessões de 45 minutos de exercício moderado.",
      date: new Date().toLocaleDateString('pt-BR'),
      author: "Dr. Carlos Silva",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop",
      url: "https://www.healthline.com/health/fitness/hiit-workouts",
      source: "Healthline"
    },
    {
      id: '2',
      title: "Nutrição Pós-Treino: O que a Ciência Diz",
      description: "Novos estudos revelam a janela ideal para consumo de proteínas após o exercício e seu impacto na recuperação muscular.",
      date: new Date(Date.now() - 86400000).toLocaleDateString('pt-BR'),
      author: "Dra. Maria Santos",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop",
      url: "https://www.medicalnewstoday.com/articles/post-workout-nutrition",
      source: "Medical News Today"
    },
    {
      id: '3',
      title: "Benefícios da Meditação para Atletas",
      description: "Como a prática da mindfulness está sendo integrada no treinamento de atletas profissionais para melhorar performance.",
      date: new Date(Date.now() - 172800000).toLocaleDateString('pt-BR'),
      author: "Prof. João Oliveira",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop",
      url: "https://www.psychologytoday.com/us/blog/the-mindful-body/meditation-athletes",
      source: "Psychology Today"
    },
    {
      id: '4',
      title: "Tendências em Equipamentos de Fitness 2025",
      description: "Conheça as inovações tecnológicas que estão revolucionando os equipamentos de academia e exercícios em casa.",
      date: new Date(Date.now() - 259200000).toLocaleDateString('pt-BR'),
      author: "Ana Costa",
      image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=250&fit=crop",
      url: "https://www.shape.com/fitness/trends/fitness-equipment-trends",
      source: "Shape Magazine"
    },
    {
      id: '5',
      title: "Sono e Recuperação Muscular",
      description: "A importância do sono de qualidade para o crescimento muscular e recuperação após treinos intensos.",
      date: new Date(Date.now() - 345600000).toLocaleDateString('pt-BR'),
      author: "Dr. Pedro Almeida",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400&h=250&fit=crop",
      url: "https://www.sleepfoundation.org/physical-health/sleep-and-muscle-recovery",
      source: "Sleep Foundation"
    },
    {
      id: '6',
      title: "Hidratação Durante Exercícios",
      description: "Diretrizes atualizadas sobre hidratação antes, durante e após atividades físicas intensas.",
      date: new Date(Date.now() - 432000000).toLocaleDateString('pt-BR'),
      author: "Dra. Sofia Lima",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=250&fit=crop",
      url: "https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256",
      source: "Mayo Clinic"
    }
  ];

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
                    className="text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4" />
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
