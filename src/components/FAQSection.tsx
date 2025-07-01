import { useState, useMemo } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  HelpCircle, 
  MessageCircle, 
  RefreshCw, 
  Dumbbell, 
  Calendar, 
  Trophy, 
  Trash2, 
  Apple,
  CreditCard,
  Settings,
  Star,
  Zap,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchBar from './faq/SearchBar';
import CategoryFilter, { Category } from './faq/CategoryFilter';
import FAQCard, { FAQ } from './faq/FAQCard';
import PopularFAQs from './faq/PopularFAQs';

interface FAQSectionProps {
  user: User | null;
  onSwitchToAssistant?: () => void;
  onSwitchToNutrition?: () => void;
}

const FAQSection = ({ user, onSwitchToAssistant, onSwitchToNutrition }: FAQSectionProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'views'>('popular');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const categories: Category[] = [
    { id: 'primeiros-passos', name: 'Primeiros Passos', icon: Star, color: 'from-green-400 to-emerald-500', count: 4 },
    { id: 'treinos', name: 'Treinos', icon: Dumbbell, color: 'from-blue-500 to-blue-600', count: 6 },
    { id: 'nutrição', name: 'Nutrição', icon: Apple, color: 'from-green-500 to-green-600', count: 3 },
    { id: 'progresso', name: 'Progresso', icon: TrendingUp, color: 'from-purple-500 to-purple-600', count: 4 },
    { id: 'pagamento', name: 'Pagamento', icon: CreditCard, color: 'from-orange-500 to-orange-600', count: 5 },
    { id: 'técnico', name: 'Técnico', icon: Settings, color: 'from-gray-500 to-gray-600', count: 3 },
  ];

  const faqs: FAQ[] = [
    {
      id: 'finished-plan',
      question: 'Finalizei meu plano de treino, o que fazer agora?',
      answer: 'Parabéns por completar seu plano! 🎉\n\n**Próximos passos:**\n\n• **Gerar um novo plano**: Primeiro exclua seu plano atual na aba "Treinos", depois clique em "Gerar Novo Plano" para criar um programa atualizado.\n\n• **Revisar seu progresso**: Acesse a aba "Evolução" para ver como você melhorou durante as 8 semanas.\n\n• **Conversar com o assistente**: Use nossa IA para receber orientações personalizadas sobre o próximo passo.\n\n• **Definir novos objetivos**: Com base nos resultados obtidos, estabeleça metas mais desafiadoras.',
      category: 'treinos',
      tags: ['plano finalizado', 'próximos passos', 'novo plano'],
      views: 245,
      likes: 23,
      dislikes: 2,
      isPopular: true,
      hasActions: true,
      actionButtons: [
        {
          label: 'Ir para Treinos',
          onClick: () => {
            const workoutTab = document.querySelector('[data-value="workout"]') as HTMLElement;
            workoutTab?.click();
          },
          variant: 'default',
          color: 'bg-blue-600 hover:bg-blue-700 text-white'
        },
        {
          label: 'Conversar com IA',
          onClick: () => onSwitchToAssistant?.(),
          variant: 'outline',
          color: 'border-blue-200 text-blue-700 hover:bg-blue-50'
        }
      ]
    },
    {
      id: 'new-plan',
      question: 'Como gerar um novo plano de treino?',
      answer: '**Passo a passo para gerar um novo plano:**\n\n1. 📋 **Vá para a aba "Treinos"**\n2. 🗑️ **Exclua seu plano atual** clicando no botão "Excluir Plano"\n3. ✨ **Preencha o novo formulário** que aparecerá após excluir\n4. 🎯 **Defina seus objetivos atuais** - seja específico!\n5. 🤖 **Nossa IA criará** um novo programa de 8 semanas adaptado ao seu nível atual\n\n**⚠️ Importante:** É necessário excluir o plano atual antes de gerar um novo.\n\n**💡 Dica:** Baseie o novo plano nos resultados do anterior para progressão contínua.',
      category: 'treinos',
      tags: ['novo plano', 'gerar treino', 'excluir plano'],
      views: 189,
      likes: 31,
      dislikes: 1,
      isPopular: true
    },
    {
      id: 'exercise-doubts',
      question: 'Tenho dúvidas sobre como executar um exercício',
      answer: '**Para dúvidas sobre execução de exercícios:**\n\n🔍 **Consulte as instruções detalhadas**: Cada exercício tem instruções completas com:\n• Posição inicial correta\n• Movimento de execução\n• Padrão respiratório\n• Músculos trabalhados\n\n🤖 **Use o Assistente IA**: Vá para a aba "Assistente" e pergunte especificamente sobre o exercício.\n\n**Exemplos de perguntas:**\n• "Como fazer agachamento corretamente?"\n• "Qual a postura certa para flexão?"\n• "Como respirar durante o supino?"\n\n📹 **Recursos visuais**: Muitos exercícios têm demonstrações em vídeo integradas.',
      category: 'treinos',
      tags: ['execução', 'técnica', 'exercícios'],
      views: 156,
      likes: 19,
      dislikes: 3,
      actionButtons: [
        {
          label: 'Conversar com Assistente',
          onClick: () => onSwitchToAssistant?.(),
          variant: 'outline',
          color: 'border-blue-200 text-blue-700 hover:bg-blue-50'
        }
      ]
    },
    {
      id: 'modify-plan',
      question: 'Posso modificar meu plano de treino?',
      answer: '**Opções para modificar seu plano:**\n\n🤖 **Use o Assistente IA**: Pergunte sobre adaptações específicas:\n• "Como substituir exercícios que não posso fazer?"\n• "Preciso adaptar por causa de lesão"\n• "Quero focar mais em determinado músculo"\n\n🔄 **Gere um novo plano**: Se suas necessidades mudaram significativamente:\n• Exclua o atual\n• Crie um plano completamente novo\n• Atualize seus objetivos\n\n💡 **Consultoria personalizada**: Nossa assistente pode sugerir:\n• Variações de exercícios\n• Adaptações por limitações\n• Progressões avançadas',
      category: 'treinos',
      tags: ['modificar', 'adaptar', 'personalizar'],
      views: 134,
      likes: 16,
      dislikes: 2,
      actionButtons: [
        {
          label: 'Conversar com Assistente',
          onClick: () => onSwitchToAssistant?.(),
          variant: 'outline',
          color: 'border-blue-200 text-blue-700 hover:bg-blue-50'
        }
      ]
    },
    {
      id: 'progress-tracking',
      question: 'Como acompanhar meu progresso?',
      answer: '**Sistema completo de acompanhamento:**\n\n📊 **Aba Evolução**: Registre regularmente:\n• Pesos utilizados em cada exercício\n• Medidas corporais (peso, medidas)\n• Fotos de progresso\n• Sensações e energia\n\n✅ **Marque exercícios concluídos**: No seu plano, marque cada exercício após completá-lo para tracking automático.\n\n💬 **Use o chat**: Converse com a IA sobre:\n• Análise do seu progresso\n• Sugestões de melhoria\n• Ajustes necessários\n\n📈 **Seja consistente**: Registre dados semanalmente para visualizar sua evolução claramente.',
      category: 'progresso',
      tags: ['acompanhamento', 'evolução', 'métricas'],
      views: 98,
      likes: 14,
      dislikes: 1
    },
    {
      id: 'nutrition-help',
      question: 'Como obter ajuda com alimentação?',
      answer: '**Seu guia nutricional completo:**\n\n🍎 **Aba Nutrição**: Acesse nosso assistente de nutrição especializado com:\n• Planos alimentares personalizados\n• Sugestões de refeições\n• Cálculo de macronutrientes\n• Dicas de suplementação\n\n🤖 **Pergunte à IA nutricional**: Exemplos de perguntas:\n• "O que comer antes do treino?"\n• "Cardápio para ganhar massa muscular"\n• "Como calcular minha necessidade calórica?"\n• "Receitas saudáveis e práticas"\n\n🎯 **Dicas personalizadas**: Nossa IA considera:\n• Seus objetivos específicos\n• Restrições alimentares\n• Preferências pessoais\n• Rotina e estilo de vida',
      category: 'nutrição',
      tags: ['alimentação', 'dieta', 'nutrição'],
      views: 167,
      likes: 25,
      dislikes: 0,
      isPopular: true,
      actionButtons: [
        {
          label: 'Ir para Nutrição',
          onClick: () => onSwitchToNutrition?.(),
          variant: 'outline',
          color: 'border-green-200 text-green-700 hover:bg-green-50'
        }
      ]
    },
    {
      id: 'payment-issues',
      question: 'Problemas com pagamento ou assinatura',
      answer: '**Resolução de problemas de pagamento:**\n\n💳 **Aba Pagamento**: Acesse para:\n• Verificar status da assinatura\n• Atualizar método de pagamento\n• Ver histórico de cobranças\n• Gerenciar renovação automática\n\n🔄 **Problemas comuns:**\n• **PIX expirado**: Gere um novo PIX\n• **Cartão recusado**: Verifique dados ou use outro cartão\n• **Cobrança duplicada**: Entre em contato conosco\n\n📞 **Suporte especializado**: Para questões complexas:\n• Use o chat do assistente\n• Mencione "problema de pagamento"\n• Forneça detalhes específicos\n\n⚡ **Acesso imediato**: Pagamentos PIX são confirmados automaticamente.',
      category: 'pagamento',
      tags: ['pagamento', 'assinatura', 'cobrança'],
      views: 89,
      likes: 12,
      dislikes: 5
    },
    {
      id: 'app-not-working',
      question: 'O aplicativo não está funcionando',
      answer: '**Soluções para problemas técnicos:**\n\n🔄 **Primeiro, tente:**\n• Recarregar a página (F5 ou Ctrl+R)\n• Limpar cache do navegador\n• Verificar conexão com internet\n• Usar modo anônimo/privado\n\n🌐 **Navegadores recomendados:**\n• Chrome (mais recente)\n• Firefox (mais recente)\n• Safari (mais recente)\n• Edge (mais recente)\n\n📱 **No celular:**\n• Use o navegador ao invés de apps\n• Verifique se JavaScript está habilitado\n• Teste em outro dispositivo\n\n🆘 **Ainda com problemas?**\n• Descreva o erro específico\n• Mencione dispositivo e navegador usado\n• Use o assistente para suporte detalhado',
      category: 'técnico',
      tags: ['erro', 'bug', 'não funciona'],
      views: 76,
      likes: 8,
      dislikes: 2
    },
    {
      id: 'first-steps',
      question: 'Primeiros passos na plataforma - Guia completo',
      answer: '**Bem-vindo ao FitAI Pro! 🎉**\n\n**1️⃣ Complete seu perfil:**\n• Adicione informações básicas\n• Defina seus objetivos principais\n• Configure preferências de treino\n\n**2️⃣ Gere seu primeiro plano:**\n• Vá para aba "Treinos"\n• Preencha o formulário detalhadamente\n• Aguarde sua IA criar o plano personalizado\n\n**3️⃣ Explore os recursos:**\n• 🤖 **Assistente**: Tire dúvidas sobre fitness\n• 🍎 **Nutrição**: Receba orientação alimentar\n• 📊 **Evolução**: Acompanhe seu progresso\n\n**4️⃣ Comece a treinar:**\n• Siga seu plano passo a passo\n• Marque exercícios como concluídos\n• Registre pesos e progressos\n\n**💡 Dica:** Use o assistente sempre que tiver dúvidas!',
      category: 'primeiros-passos',
      tags: ['início', 'tutorial', 'primeiros passos'],
      views: 203,
      likes: 34,
      dislikes: 1,
      isPopular: true
    }
  ];

  const filteredFAQs = useMemo(() => {
    let filtered = faqs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes - b.dislikes) - (a.likes - a.dislikes));
        break;
      case 'views':
        filtered.sort((a, b) => b.views - a.views);
        break;
      case 'recent':
        // For now, keep original order as "recent"
        break;
    }

    return filtered;
  }, [searchTerm, activeCategory, sortBy]);

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectFAQ = (faqId: string) => {
    if (!openItems.includes(faqId)) {
      setOpenItems(prev => [...prev, faqId]);
    }
    // Scroll to FAQ
    setTimeout(() => {
      const element = document.getElementById(`faq-${faqId}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const getCategoryData = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return {
      gradient: category?.color || 'from-gray-500 to-gray-600',
      icon: category?.icon || HelpCircle
    };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Centro de Conhecimento FitAI
          </CardTitle>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Encontre respostas rápidas, explore dicas avançadas e domine sua jornada fitness com nossa base de conhecimento inteligente.
          </p>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <div className="space-y-6">
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar em nossa base de conhecimento..."
        />
        
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">Ordenar por:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Mais Úteis</SelectItem>
                <SelectItem value="views">Mais Vistas</SelectItem>
                <SelectItem value="recent">Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {filteredFAQs.length} dúvida{filteredFAQs.length !== 1 ? 's' : ''} encontrada{filteredFAQs.length !== 1 ? 's' : ''}
            {searchTerm && ` para "${searchTerm}"`}
            {activeCategory !== 'all' && ` na categoria "${categories.find(c => c.id === activeCategory)?.name}"`}
          </p>
          
          {(searchTerm || activeCategory !== 'all') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
              className="text-blue-600 hover:bg-blue-50"
            >
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main FAQ List */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="wait">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq) => {
                const { gradient, icon } = getCategoryData(faq.category);
                return (
                  <div key={faq.id} id={`faq-${faq.id}`}>
                    <FAQCard
                      faq={faq}
                      isOpen={openItems.includes(faq.id)}
                      onToggle={() => toggleItem(faq.id)}
                      gradient={gradient}
                      icon={icon}
                      onLike={() => {/* Handle like */}}
                      onDislike={() => {/* Handle dislike */}}
                    />
                  </div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma dúvida encontrada
                </h3>
                <p className="text-gray-600 mb-4">
                  Tente ajustar sua busca ou navegar pelas categorias.
                </p>
                <Button
                  onClick={() => onSwitchToAssistant?.()}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar com Assistente IA
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PopularFAQs faqs={faqs} onSelectFAQ={handleSelectFAQ} />
          
          {/* Quick Help */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-blue-800 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                Ajuda Rápida
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-blue-600 mb-4">
                Não encontrou o que procura? Nossa IA está sempre pronta para ajudar!
              </p>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-blue-200 text-blue-700 hover:bg-blue-50"
                  onClick={onSwitchToAssistant}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Assistente Fitness
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start border-green-200 text-green-700 hover:bg-green-50"
                  onClick={onSwitchToNutrition}
                >
                  <Apple className="h-4 w-4 mr-2" />
                  Assistente Nutricional
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{faqs.length}</div>
                  <div className="text-xs text-blue-600">Dúvidas</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{categories.length}</div>
                  <div className="text-xs text-green-600">Categorias</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {faqs.reduce((acc, faq) => acc + faq.views, 0)}
                </div>
                <div className="text-xs text-purple-600">Visualizações Totais</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;
