
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Cloud, CloudRain, Sun, CloudSnow, Zap, Dumbbell, Home, MapPin, RefreshCw } from 'lucide-react';

const WeatherWidget = () => {
  const [weatherData, setWeatherData] = useState({
    temperature: 0,
    condition: 'clear',
    location: 'São Paulo',
    humidity: 0,
    loading: true,
    error: false
  });

  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Simulação de dados do clima (você pode integrar com uma API real depois)
  const mockWeatherData = [
    { temp: 25, condition: 'sunny', location: 'São Paulo', humidity: 60 },
    { temp: 18, condition: 'rainy', location: 'São Paulo', humidity: 85 },
    { temp: 15, condition: 'cloudy', location: 'São Paulo', humidity: 70 },
    { temp: 12, condition: 'cold', location: 'São Paulo', humidity: 45 }
  ];

  const workoutSuggestions = {
    sunny: [
      { title: 'Treino ao Ar Livre', description: 'Aproveite o sol para correr no parque ou fazer exercícios na praia!', icon: <Sun className="h-5 w-5" /> },
      { title: 'Caminhada Matinal', description: 'Perfeito para uma caminhada energizante sob o sol.', icon: <Sun className="h-5 w-5" /> }
    ],
    rainy: [
      { title: 'Treino Indoor', description: 'Está chovendo? Que tal um treino em casa ou na academia?', icon: <Home className="h-5 w-5" /> },
      { title: 'Yoga & Alongamento', description: 'Dia perfeito para relaxar com yoga e meditação.', icon: <Dumbbell className="h-5 w-5" /> }
    ],
    cloudy: [
      { title: 'Treino Funcional', description: 'Tempo nublado é ideal para treinos funcionais!', icon: <Dumbbell className="h-5 w-5" /> },
      { title: 'Musculação', description: 'Foque na musculação sem se preocupar com o calor.', icon: <Zap className="h-5 w-5" /> }
    ],
    cold: [
      { title: 'Aquecimento Extra', description: 'Tempo frio pede um aquecimento mais longo e treino intenso!', icon: <Zap className="h-5 w-5" /> },
      { title: 'Treino HIIT', description: 'Aqueça o corpo com exercícios de alta intensidade.', icon: <Dumbbell className="h-5 w-5" /> }
    ]
  };

  useEffect(() => {
    // Simular carregamento de dados do clima
    const loadWeather = () => {
      setWeatherData(prev => ({ ...prev, loading: true }));
      
      setTimeout(() => {
        const randomWeather = mockWeatherData[Math.floor(Math.random() * mockWeatherData.length)];
        setWeatherData({
          temperature: randomWeather.temp,
          condition: randomWeather.condition,
          location: randomWeather.location,
          humidity: randomWeather.humidity,
          loading: false,
          error: false
        });
      }, 1000);
    };

    loadWeather();
  }, []);

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'sunny': return <Sun className="h-8 w-8 text-yellow-500" />;
      case 'rainy': return <CloudRain className="h-8 w-8 text-blue-500" />;
      case 'cloudy': return <Cloud className="h-8 w-8 text-gray-500" />;
      case 'cold': return <CloudSnow className="h-8 w-8 text-blue-300" />;
      default: return <Sun className="h-8 w-8 text-yellow-500" />;
    }
  };

  const getWeatherColor = (condition: string) => {
    switch (condition) {
      case 'sunny': return 'from-yellow-500 to-orange-500';
      case 'rainy': return 'from-blue-500 to-blue-600';
      case 'cloudy': return 'from-gray-500 to-gray-600';
      case 'cold': return 'from-blue-400 to-indigo-500';
      default: return 'from-yellow-500 to-orange-500';
    }
  };

  const getCurrentSuggestions = () => {
    return workoutSuggestions[weatherData.condition as keyof typeof workoutSuggestions] || workoutSuggestions.sunny;
  };

  const nextSuggestion = () => {
    const suggestions = getCurrentSuggestions();
    setCurrentSuggestionIndex((prev) => (prev + 1) % suggestions.length);
  };

  const refreshWeather = () => {
    setWeatherData(prev => ({ ...prev, loading: true }));
    setTimeout(() => {
      const randomWeather = mockWeatherData[Math.floor(Math.random() * mockWeatherData.length)];
      setWeatherData({
        temperature: randomWeather.temp,
        condition: randomWeather.condition,
        location: randomWeather.location,
        humidity: randomWeather.humidity,
        loading: false,
        error: false
      });
      setCurrentSuggestionIndex(0);
    }, 1000);
  };

  if (weatherData.loading) {
    return (
      <Card className="bg-white border-gray-200 shadow-lg">
        <CardContent className="p-6">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSuggestion = getCurrentSuggestions()[currentSuggestionIndex];
  const weatherColor = getWeatherColor(weatherData.condition);

  return (
    <Card className="bg-white border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${weatherColor} text-white relative`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              {getWeatherIcon(weatherData.condition)}
            </div>
            <div>
              <CardTitle className="text-white text-lg font-bold">Clima & Treino</CardTitle>
              <div className="flex items-center gap-1 text-white/90 text-sm">
                <MapPin className="h-3 w-3" />
                <span>{weatherData.location}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{weatherData.temperature}°</div>
            <div className="text-white/90 text-sm">{weatherData.humidity}% umidade</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Sugestão de Treino */}
          <div className={`p-4 rounded-lg bg-gradient-to-r ${weatherColor} bg-opacity-10 border border-opacity-20`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {currentSuggestion.icon}
                <h3 className="font-bold text-gray-800">{currentSuggestion.title}</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSuggestion}
                className="text-gray-600 hover:bg-gray-100"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-gray-700">{currentSuggestion.description}</p>
          </div>

          {/* Ações */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={refreshWeather}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button
              className={`bg-gradient-to-r ${weatherColor} text-white hover:opacity-90`}
            >
              <Dumbbell className="h-4 w-4 mr-2" />
              Começar Treino
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
