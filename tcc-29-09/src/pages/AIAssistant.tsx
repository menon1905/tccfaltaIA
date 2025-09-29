import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, User, Loader2, Sparkles } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
}

export const AIAssistant: React.FC = () => {
  const { products, sales, customers, loading: dataLoading } = useSupabaseData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dataLoading && messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          type: 'ai',
          content: 'Olá! Sou seu assistente de IA. Faça uma pergunta sobre suas vendas, estoque ou clientes para começar.',
        },
      ]);
    }
  }, [dataLoading, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiThinking]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAiThinking) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsAiThinking(true);

    try {
      // Gather context
      const context = {
        totalProducts: products?.length || 0,
        totalSales: sales?.length || 0,
        totalCustomers: customers?.length || 0,
        totalRevenue: sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0,
        lowStockProductsCount: products?.filter(p => p.stock <= p.min_stock).length || 0,
      };

      // Invoke Edge Function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt: inputValue, context },
      });

      if (error) {
        throw new Error(error.message);
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: data.reply || 'Não consegui processar sua solicitação. Tente novamente.',
      };
      setMessages(prev => [...prev, aiResponse]);

    } catch (err) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: `Ocorreu um erro ao contatar a IA. Verifique se sua chave de API da OpenAI está configurada corretamente nas secrets do Supabase. (Erro: ${err instanceof Error ? err.message : 'Desconhecido'})`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiThinking(false);
    }
  };

  const quickActions = [
    'Analise minhas vendas do último mês.',
    'Quais produtos estão com estoque baixo?',
    'Me dê 3 sugestões para aumentar meu faturamento.',
    'Qual o perfil do meu cliente principal?',
  ];

  return (
    <div className="flex flex-col h-full p-4 bg-gray-50 dark:bg-slate-900">
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Bot className="w-6 h-6 mr-2 text-purple-600" />
            Assistente IA
          </h1>
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-6">
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.type === 'ai' ? 'bg-purple-100 dark:bg-purple-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                {message.type === 'ai' ? <Bot className="w-5 h-5 text-purple-600" /> : <User className="w-5 h-5 text-blue-600" />}
              </div>
              <div className={`p-3 rounded-lg max-w-lg ${message.type === 'ai' ? 'bg-slate-100 dark:bg-slate-700' : 'bg-purple-600 text-white'}`}>
                <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br />') }} />
              </div>
            </div>
          ))}
          {isAiThinking && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-purple-600" />
              </div>
              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                <span className="text-sm text-slate-600 dark:text-slate-300">Pensando...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {messages.length <= 1 && (
           <div className="p-4">
             <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 flex items-center"><Sparkles className="w-4 h-4 mr-2 text-yellow-500" />Sugestões</h3>
             <div className="grid grid-cols-2 gap-2">
               {quickActions.map(action => (
                 <button key={action} onClick={() => setInputValue(action)} className="text-left text-sm p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                   {action}
                 </button>
               ))}
             </div>
           </div>
        )}

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Faça uma pergunta..."
              className="flex-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAiThinking}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
