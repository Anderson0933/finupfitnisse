
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Video, Play, Search, Clock, Target, Zap, Heart } from 'lucide-react';

interface ExerciseVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  category: string;
  muscleGroup: string;
  equipment: string[];
  videoUrl: string;
  thumbnailUrl: string;
  instructor: string;
  views: number;
  rating: number;
}

const ExerciseVideos = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<ExerciseVideo | null>(null);

  const exerciseVideos: ExerciseVideo[] = [
    {
      id: '1',
      title: 'Agachamento Livre - Técnica Perfeita',
      description: 'Aprenda a executar o agachamento livre com a técnica correta para maximizar resultados e evitar lesões.',
      duration: '8:45',
      difficulty: 'Iniciante',
      category: 'strength',
      muscleGroup: 'Pernas',
      equipment: [],
      videoUrl: 'https://example.com/video1',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. Carlos Silva',
      views: 15420,
      rating: 4.9
    },
    {
      id: '2',
      title: 'Supino Reto - Forma e Respiração',
      description: 'Técnica completa do supino reto, incluindo posicionamento, respiração e variações.',
      duration: '12:30',
      difficulty: 'Intermediário',
      category: 'strength',
      muscleGroup: 'Peito',
      equipment: ['Barra', 'Banco'],
      videoUrl: 'https://example.com/video2',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. Ana Santos',
      views: 22100,
      rating: 4.8
    },
    {
      id: '3',
      title: 'HIIT Iniciante - 15 Minutos',
      description: 'Treino HIIT completo para iniciantes, queimando calorias em apenas 15 minutos.',
      duration: '15:00',
      difficulty: 'Iniciante',
      category: 'cardio',
      muscleGroup: 'Corpo todo',
      equipment: [],
      videoUrl: 'https://example.com/video3',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. João Oliveira',
      views: 33250,
      rating: 4.7
    },
    {
      id: '4',
      title: 'Yoga para Flexibilidade',
      description: 'Sequência de yoga focada em melhorar a flexibilidade e reduzir tensões musculares.',
      duration: '25:15',
      difficulty: 'Iniciante',
      category: 'flexibility',
      muscleGroup: 'Corpo todo',
      equipment: ['Tapete'],
      videoUrl: 'https://example.com/video4',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. Maria Costa',
      views: 18900,
      rating: 4.9
    },
    {
      id: '5',
      title: 'Deadlift - Levantamento Terra',
      description: 'Guia completo do levantamento terra, um dos exercícios mais importantes para força.',
      duration: '16:20',
      difficulty: 'Avançado',
      category: 'strength',
      muscleGroup: 'Costas',
      equipment: ['Barra', 'Anilhas'],
      videoUrl: 'https://example.com/video5',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. Pedro Lima',
      views: 28750,
      rating: 4.8
    },
    {
      id: '6',
      title: 'Cardio Dance - Queime Calorias',
      description: 'Aula de dança divertida que combina cardio com movimentos de dança.',
      duration: '30:00',
      difficulty: 'Intermediário',
      category: 'cardio',
      muscleGroup: 'Corpo todo',
      equipment: [],
      videoUrl: 'https://example.com/video6',
      thumbnailUrl: '/placeholder.svg',
      instructor: 'Prof. Lucia Fernandes',
      views: 41200,
      rating: 4.6
    }
  ];

  const categories = [
    { id: 'all', name: 'Todos', icon: Video },
    { id: 'strength', name: 'Força', icon: Zap },
    { id: 'cardio', name: 'Cardio', icon: Heart },
    { id: 'flexibility', name: 'Flexibilidade', icon: Target }
  ];

  const filteredVideos = exerciseVideos.filter(video => {
    const matchesCategory = activeCategory === 'all' || video.category === activeCategory;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante': return 'bg-green-100 text-green-700';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-700';
      case 'Avançado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const handleVideoClick = (video: ExerciseVideo) => {
    setSelectedVideo(video);
    // Em um app real, aqui abriria um modal ou player de vídeo
    console.log('Reproduzindo vídeo:', video.title);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
          <Video className="h-8 w-8" />
          Vídeos Demonstrativos
        </h2>
        <p className="text-blue-600 max-w-2xl mx-auto">
          Aprenda a técnica correta dos exercícios com nossos vídeos profissionais. Execute com segurança e maximize seus resultados!
        </p>
      </div>

      {/* Barra de pesquisa */}
      <div className="relative max-w-md mx-auto mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar exercícios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Categorias */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          );
        })}
      </div>

      {/* Grid de vídeos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader className="pb-3">
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {video.duration}
                </div>
              </div>
              
              <div className="flex justify-between items-start mb-2">
                <Badge className={getDifficultyColor(video.difficulty)}>
                  {video.difficulty}
                </Badge>
                <div className="text-xs text-gray-500">{video.views.toLocaleString()} views</div>
              </div>
            </CardHeader>
            
            <CardContent>
              <CardTitle className="text-lg mb-2 line-clamp-2">{video.title}</CardTitle>
              <CardDescription className="mb-3 line-clamp-2">{video.description}</CardDescription>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Grupo muscular:</span>
                  <Badge variant="outline" className="text-xs">{video.muscleGroup}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Instrutor:</span>
                  <span className="font-medium">{video.instructor}</span>
                </div>
                
                {video.equipment.length > 0 && (
                  <div className="flex items-start justify-between text-sm">
                    <span className="text-gray-600">Equipamentos:</span>
                    <div className="flex flex-wrap gap-1 ml-2">
                      {video.equipment.map((equipment, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {equipment}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button 
                onClick={() => handleVideoClick(video)}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Assistir Vídeo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum vídeo encontrado</h3>
          <p className="text-gray-500">
            Tente buscar por outro termo ou categoria.
          </p>
        </div>
      )}

      {/* Modal de vídeo selecionado (placeholder) */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{selectedVideo.title}</CardTitle>
                  <CardDescription>{selectedVideo.instructor}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center text-white">
                  <Play className="h-16 w-16 mx-auto mb-4" />
                  <p>Player de vídeo seria carregado aqui</p>
                  <p className="text-sm opacity-75">URL: {selectedVideo.videoUrl}</p>
                </div>
              </div>
              <p className="text-gray-700">{selectedVideo.description}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExerciseVideos;
