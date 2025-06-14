
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingBag, Star, ExternalLink, Award, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  category: string;
  imageUrl: string;
  affiliateUrl: string;
  commission: number;
  brand: string;
  inStock: boolean;
}

interface AffiliateProgram {
  id: string;
  name: string;
  description: string;
  commission: string;
  requirements: string;
  benefits: string[];
  isActive: boolean;
}

const MarketplaceSection = () => {
  const { toast } = useToast();
  const [activeCategory, setActiveCategory] = useState('supplements');

  const products: Product[] = [
    {
      id: '1',
      name: 'Whey Protein Premium',
      description: 'Proteína de alta qualidade para ganho de massa muscular',
      price: 89.90,
      originalPrice: 120.00,
      rating: 4.8,
      reviews: 1250,
      category: 'supplements',
      imageUrl: '/placeholder.svg',
      affiliateUrl: 'https://example.com/whey-protein',
      commission: 15,
      brand: 'Growth',
      inStock: true
    },
    {
      id: '2',
      name: 'Creatina Monohidratada',
      description: 'Aumenta força e potência muscular',
      price: 45.90,
      originalPrice: 65.00,
      rating: 4.9,
      reviews: 890,
      category: 'supplements',
      imageUrl: '/placeholder.svg',
      affiliateUrl: 'https://example.com/creatina',
      commission: 12,
      brand: 'Max Titanium',
      inStock: true
    },
    {
      id: '3',
      name: 'Halter Ajustável 20kg',
      description: 'Kit de halteres com pesos ajustáveis',
      price: 299.90,
      originalPrice: 399.00,
      rating: 4.7,
      reviews: 456,
      category: 'equipment',
      imageUrl: '/placeholder.svg',
      affiliateUrl: 'https://example.com/halter',
      commission: 8,
      brand: 'Kikos',
      inStock: true
    },
    {
      id: '4',
      name: 'Camiseta Dry Fit',
      description: 'Camiseta esportiva com tecnologia dry fit',
      price: 39.90,
      originalPrice: 59.90,
      rating: 4.6,
      reviews: 234,
      category: 'clothing',
      imageUrl: '/placeholder.svg',
      affiliateUrl: 'https://example.com/camiseta',
      commission: 20,
      brand: 'Nike',
      inStock: true
    }
  ];

  const affiliatePrograms: AffiliateProgram[] = [
    {
      id: '1',
      name: 'Programa Suplementos Premium',
      description: 'Ganhe comissões vendendo os melhores suplementos do mercado',
      commission: '10-20%',
      requirements: 'Mínimo 100 seguidores',
      benefits: ['Comissões altas', 'Material promocional', 'Suporte dedicado'],
      isActive: true
    },
    {
      id: '2',
      name: 'Equipamentos Fitness',
      description: 'Equipamentos para treino em casa com ótimas comissões',
      commission: '5-15%',
      requirements: 'Cadastro aprovado',
      benefits: ['Produtos testados', 'Desconto pessoal', 'Dashboard analítico'],
      isActive: true
    },
    {
      id: '3',
      name: 'Roupas Esportivas',
      description: 'Marcas reconhecidas de vestuário fitness',
      commission: '15-25%',
      requirements: 'Perfil ativo nas redes',
      benefits: ['Produtos exclusivos', 'Campanhas sazonais', 'Bonificações'],
      isActive: true
    }
  ];

  const handleProductClick = (product: Product) => {
    // Registrar clique para analytics de afiliado
    console.log(`Produto clicado: ${product.name} - Comissão: ${product.commission}%`);
    
    toast({
      title: "Redirecionando...",
      description: `Você será direcionado para ${product.brand}`,
    });

    // Abrir link de afiliado em nova aba
    window.open(product.affiliateUrl, '_blank');
  };

  const handleJoinAffiliate = (program: AffiliateProgram) => {
    toast({
      title: "Programa de Afiliados",
      description: `Solicitação para ${program.name} enviada!`,
    });
  };

  const filteredProducts = products.filter(product => product.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
          <ShoppingBag className="h-8 w-8" />
          Marketplace Fitness
        </h2>
        <p className="text-blue-600 max-w-2xl mx-auto">
          Produtos recomendados pelos nossos especialistas. Compre com confiança e ganhe comissões como afiliado!
        </p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Seja Afiliado
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <div className="mb-6">
            <Tabs value={activeCategory} onValueChange={setActiveCategory}>
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="supplements">Suplementos</TabsTrigger>
                <TabsTrigger value="equipment">Equipamentos</TabsTrigger>
                <TabsTrigger value="clothing">Roupas</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                    <ShoppingBag className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary">{product.brand}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{product.rating}</span>
                      <span className="text-xs text-gray-500">({product.reviews})</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <CardDescription className="mb-4">{product.description}</CardDescription>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-2xl font-bold text-green-600">R$ {product.price.toFixed(2)}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">
                        R$ {product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="outline" className="text-xs">
                      Comissão: {product.commission}%
                    </Badge>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {product.inStock ? 'Em estoque' : 'Indisponível'}
                    </span>
                  </div>

                  <Button 
                    onClick={() => handleProductClick(product)}
                    className="w-full" 
                    disabled={!product.inStock}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ver Produto
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="affiliate">
          <div className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <TrendingUp className="h-6 w-6" />
                  Ganhe Dinheiro como Afiliado!
                </CardTitle>
                <CardDescription>
                  Monetize sua paixão pelo fitness. Recomende produtos que você usa e ganhe comissões em cada venda.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold">Cadastre-se</h4>
                    <p className="text-sm text-gray-600">Inscreva-se nos programas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <ShoppingBag className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold">Promova</h4>
                    <p className="text-sm text-gray-600">Compartilhe produtos</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold">Ganhe</h4>
                    <p className="text-sm text-gray-600">Receba comissões</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {affiliatePrograms.map((program) => (
                <Card key={program.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{program.name}</CardTitle>
                    <CardDescription>{program.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <span className="font-semibold text-green-600 text-xl">
                          {program.commission}
                        </span>
                        <span className="text-sm text-gray-600 ml-1">de comissão</span>
                      </div>
                      
                      <div>
                        <h5 className="font-semibold text-sm mb-1">Requisitos:</h5>
                        <p className="text-sm text-gray-600">{program.requirements}</p>
                      </div>

                      <div>
                        <h5 className="font-semibold text-sm mb-2">Benefícios:</h5>
                        <ul className="space-y-1">
                          {program.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button 
                        onClick={() => handleJoinAffiliate(program)}
                        className="w-full mt-4"
                        variant={program.isActive ? "default" : "secondary"}
                      >
                        {program.isActive ? "Participar" : "Em Breve"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceSection;
