
import { useState, useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Send, Apple, Bot, User as UserIcon } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface NutritionAssistantProps {
  user: User | null;
}

const NutritionAssistant = ({ user }: NutritionAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadNutritionConversation();
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadNutritionConversation = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('conversation_type', 'nutrition')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (data) {
      setConversationId(data.id);
      setMessages(data.messages || []);
    } else {
      // Criar nova conversa de nutrição
      const { data: newConversation } = await supabase
        .from('ai_conversations')
        .insert([{
          user_id: user.id,
          conversation_type: 'nutrition',
          messages: [{
            role: 'assistant',
            content: 'Olá! Sou sua assistente de nutrição personalizada. Posso te ajudar com:\n\n🥗 Planos alimentares personalizados\n🍎 Dicas de alimentação saudável\n📊 Contagem de calorias e macronutrientes\n🥘 Receitas saudáveis e práticas\n💡 Orientações sobre suplementação\n\nComo posso te ajudar hoje com sua alimentação?',
            timestamp: new Date()
          }]
        }])
        .select()
        .single();

      if (newConversation) {
        setConversationId(newConversation.id);
        setMessages(newConversation.messages);
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !user || !conversationId) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await supabase.functions.invoke('nutrition-assistant', {
        body: { 
          message: input,
          conversationHistory: updatedMessages
        }
      });

      if (response.error) throw response.error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Salvar conversa atualizada
      await supabase
        .from('ai_conversations')
        .update({ messages: finalMessages })
        .eq('id', conversationId);

    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
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
    "Como calcular minhas calorias diárias?",
    "Receitas de café da manhã saudável",
    "Alimentos para ganhar massa muscular",
    "Plano alimentar para perder peso",
    "Lanches saudáveis pré-treino"
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Assistente de Nutrição IA</h2>
      
      <Card className="glass border-white/20 h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Apple className="h-5 w-5" />
            Nutricionista Virtual
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-white/10 text-white border border-white/20'
                }`}>
                  <div className="flex items-start gap-2">
                    {message.role === 'assistant' ? (
                      <Apple className="h-4 w-4 mt-1 text-green-400" />
                    ) : (
                      <UserIcon className="h-4 w-4 mt-1" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-lg border border-white/20">
                  <div className="flex items-center gap-2 text-white">
                    <Apple className="h-4 w-4 text-green-400" />
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 border-t border-white/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Pergunte sobre nutrição, receitas, dietas..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                disabled={loading}
              />
              <Button 
                onClick={sendMessage} 
                disabled={loading || !input.trim()}
                className="glow-button"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-white/20">
        <CardHeader>
          <CardTitle className="text-white text-lg">Perguntas Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-left justify-start"
                onClick={() => setInput(question)}
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NutritionAssistant;
