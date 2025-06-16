
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AffiliatePromoBanner = () => {
  const navigate = useNavigate();

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Gift className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">
                Programa de Afiliados FitAI Pro
              </h3>
              <p className="text-gray-600 mb-2">
                Indique amigos e ganhe dinheiro com cada assinatura!
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <DollarSign className="h-3 w-3 mr-1" />
                  15% de comissão
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  R$ 10,49 por indicação
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  Saque via PIX
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="text-center md:text-right">
            <Button 
              onClick={() => navigate('/affiliate')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Seja um Afiliado
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              Comece a ganhar hoje mesmo!
            </p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-blue-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold text-blue-600">1. Cadastre-se</p>
              <p className="text-sm text-gray-600">Crie sua conta de afiliado gratuita</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600">2. Compartilhe</p>
              <p className="text-sm text-gray-600">Use seu link único de indicação</p>
            </div>
            <div>
              <p className="font-semibold text-blue-600">3. Ganhe</p>
              <p className="text-sm text-gray-600">Receba via PIX em até 3 dias</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AffiliatePromoBanner;
