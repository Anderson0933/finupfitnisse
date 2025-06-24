
import { Star, Quote, CheckCircle } from 'lucide-react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: "Maria Silva",
      age: 32,
      profession: "Advogada",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Em 2 meses perdi 8kg e ganhei muito mais disposição. A IA realmente entende o que eu preciso!",
      result: "8kg perdidos",
      timeframe: "2 meses"
    },
    {
      name: "João Santos",
      age: 28,
      profession: "Engenheiro",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Nunca consegui manter uma rotina de exercícios, mas com o FitAI Pro tudo ficou natural e divertido.",
      result: "15kg de massa muscular",
      timeframe: "4 meses"
    },
    {
      name: "Ana Costa",
      age: 35,
      profession: "Médica",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
      rating: 5,
      text: "Como médica, posso afirmar que os planos são cientificamente embasados. Resultados incríveis!",
      result: "Melhor forma física",
      timeframe: "3 meses"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-sm font-medium mb-4">
            <CheckCircle className="h-4 w-4 mr-2" />
            Resultados Reais
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Mais de <span className="gradient-text">50.000 pessoas</span>
            <span className="block">já transformaram suas vidas</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Veja o que nossos usuários estão dizendo sobre suas transformações com a IA
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
            >
              {/* Quote Icon */}
              <div className="flex justify-between items-start mb-4">
                <Quote className="h-8 w-8 text-blue-500 opacity-50" />
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
              </div>

              {/* Testimonial Text */}
              <p className="text-gray-700 mb-6 italic leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Results Badge */}
              <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-3 mb-4">
                <div className="text-center">
                  <div className="text-green-700 font-semibold">{testimonial.result}</div>
                  <div className="text-green-600 text-sm">em {testimonial.timeframe}</div>
                </div>
              </div>

              {/* User Info */}
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-200"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.profession}, {testimonial.age} anos</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">50k+</div>
            <div className="text-gray-600">Usuários Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
            <div className="text-gray-600">Taxa de Sucesso</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">4.9★</div>
            <div className="text-gray-600">Avaliação Média</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
            <div className="text-gray-600">Suporte IA</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
