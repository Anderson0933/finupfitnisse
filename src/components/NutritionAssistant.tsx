
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, Apple, User as UserIcon, Bot, Loader2 } from 'lucide-react';

interface NutritionAssistantProps {
  user: User | null;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const NutritionAssistant = ({ user }: NutritionAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mensagem de boas-vindas com funcionalidades
    const welcomeMessage: Message = {
      id: 'welcome',
      content: 'Olá! Sou sua assistente de nutrição personalizada. Posso te ajudar com:\n\n🍎 Planos alimentares personalizados\n🥗 Dicas de alimentação saudável\n📊 Contagem de calorias e macronutrientes\n🍳 Receitas saudáveis e práticas\n💊 Orientações sobre suplementação\n\nComo posso te ajudar hoje com sua alimentação?',
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !user) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await supabase.functions.invoke('nutrition-assistant', {
        body: { 
          message: inputMessage,
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro na comunicação",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "Criar um plano alimentar para ganho de massa",
    "Receitas saudáveis para o café da manhã",
    "Como calcular minhas calorias diárias?",
    "Alimentos ricos em proteína",
    "Dicas para reduzir o açúcar da dieta",
    "Suplementos para iniciantes"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gradient-to-br from-orange-600/20 to-red-600/20 border-white/20 backdrop-blur-sm h-[70vh] flex flex-col">
        <CardHeader className="border-b border-white/10 flex-shrink-0">
          <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center">
              <Apple className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            Nutricionista Virtual
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 ${
                    message.isUser
                      ? 'bg-green-600 text-white ml-auto'
                      : 'bg-white/10 text-white backdrop-blur-sm border border-white/20'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-1 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.isUser && (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white/10 text-white backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Analisando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions - only show if no messages yet */}
          {messages.length <= 1 && (
            <div className="px-4 md:px-6 pb-4">
              <h3 className="text-white text-sm font-medium mb-3">Perguntas Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.slice(0, 6).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(question)}
                    className="border-white/20 text-white hover:bg-white/10 text-xs md:text-sm h-auto py-2 px-3 whitespace-normal text-left justify-start"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-white/10 p-4 md:p-6 flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre nutrição..."
                className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:border-orange-400 text-sm md:text-base"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-orange-600 hover:bg-orange-700 text-white px-3 md:px-4"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Enviar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAssistant;
