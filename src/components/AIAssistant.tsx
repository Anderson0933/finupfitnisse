
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, MessageCircle, User as UserIcon, Bot, Loader2 } from 'lucide-react';

interface AIAssistantProps {
  user: User | null;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant = ({ user }: AIAssistantProps) => {
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
    // Mensagem de boas-vindas
    const welcomeMessage: Message = {
      id: 'welcome',
      content: 'Olá! Sou seu assistente de fitness pessoal. Posso te ajudar com dúvidas sobre treinos, exercícios, técnicas e motivação. Como posso te ajudar hoje?',
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
      const response = await supabase.functions.invoke('chat-assistant', {
        body: { 
          message: inputMessage,
          userId: user.id,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.isUser ? 'user' : 'assistant',
            content: m.content
          }))
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data.message || 'Desculpe, não consegui processar sua mensagem.',
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
    "Como melhorar meu desempenho no treino?",
    "Dicas para ganhar massa muscular",
    "Como criar uma rotina de exercícios?",
    "Exercícios para iniciantes",
    "Como manter a motivação para treinar?"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-white border-blue-200 shadow-lg h-[70vh] flex flex-col">
        <CardHeader className="border-b border-blue-100 bg-blue-50 flex-shrink-0">
          <CardTitle className="text-blue-800 flex items-center gap-2 text-lg md:text-xl">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            Assistente Fitness IA
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!message.isUser && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-white text-gray-800 border border-blue-100'
                  }`}
                >
                  <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                  <span className={`text-xs mt-1 block ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {message.isUser && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {loading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white text-gray-800 border border-blue-100 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick questions - only show if no messages yet */}
          {messages.length <= 1 && (
            <div className="px-4 md:px-6 pb-4 bg-white border-t border-blue-100">
              <h3 className="text-blue-800 text-sm font-medium mb-3">Perguntas Rápidas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.slice(0, 4).map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputMessage(question)}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs md:text-sm h-auto py-2 px-3 whitespace-normal text-left justify-start"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input area */}
          <div className="border-t border-blue-100 p-4 md:p-6 bg-white flex-shrink-0">
            <div className="flex gap-2 md:gap-3">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua pergunta sobre fitness..."
                className="flex-1 border-blue-200 focus:border-blue-400 text-sm md:text-base"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage}
                disabled={loading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 md:px-4"
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

export default AIAssistant;
