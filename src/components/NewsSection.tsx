
import { useState } from 'react';
import { Play, X, TrendingUp, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const NewsSection = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const newsItems = [
    {
      id: 1,
      title: "Novas Tendências em Treinamento Funcional",
      description: "Descubra as últimas metodologias de treino funcional que estão revolucionando o fitness.",
      date: "13 Jun 2025",
      author: "Dr. Carlos Silva",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Nutrição Esportiva: O que Mudou em 2025",
      description: "As mais recentes descobertas científicas sobre alimentação para atletas e praticantes de exercícios.",
      date: "10 Jun 2025",
      author: "Dra. Maria Santos",
      image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "IA no Fitness: Como a Tecnologia Está Transformando os Treinos",
      description: "Entenda como a inteligência artificial está personalizando e otimizando os programas de exercícios.",
      date: "08 Jun 2025",
      author: "Prof. João Oliveira",
      image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=400&h=250&fit=crop"
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {newsItems.map((news) => (
          <Card key={news.id} className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-video overflow-hidden rounded-t-lg">
              <img 
                src={news.image} 
                alt={news.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg text-gray-800 line-clamp-2">{news.title}</CardTitle>
              <CardDescription className="text-gray-600 line-clamp-3">
                {news.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>{news.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{news.date}</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700" size="sm">
                Ler Mais
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

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
