import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Bot, ArrowRight, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';

interface Recommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  link: string;
}

export const AIRecommendations: React.FC = () => {
  const { products, sales, customers, loading: dataLoading } = useSupabaseData();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [implementedRecs, setImplementedRecs] = useState<string[]>([]);

  useEffect(() => {
    if (!dataLoading) {
      fetchRecommendations();
    }
  }, [dataLoading]);

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    setError(null);

    try {
      const context = {
        totalProducts: products?.length || 0,
        totalSales: sales?.length || 0,
        totalCustomers: customers?.length || 0,
        totalRevenue: sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0,
        lowStockProductsCount: products?.filter(p => p.stock <= p.min_stock).length || 0,
        products: products?.slice(0, 10).map(p => ({ name: p.name, stock: p.stock, min_stock: p.min_stock })),
      };

      const prompt = `Baseado no contexto de negócio fornecido, gere 3 a 5 recomendações de negócio acionáveis. Para cada recomendação, forneça um título, uma descrição, uma prioridade ('high', 'medium', 'low'), uma categoria (ex: 'Estoque', 'Vendas', 'Marketing', 'Financeiro') e um link de rota do app ('/estoque', '/vendas', '/crm', '/financeiro'). Responda APENAS com um array JSON válido.

Exemplo de formato de resposta:
[
  {
    "id": "rec-1",
    "priority": "high",
    "category": "Estoque",
    "title": "Reposição Urgente de Estoque",
    "description": "Existem produtos com estoque abaixo do mínimo. Reponha-os para evitar perda de vendas.",
    "link": "/compras"
  }
]`;

      const { data, error: functionError } = await supabase.functions.invoke('ai-assistant', {
        body: { prompt, context },
      });

      if (functionError) throw functionError;

      const parsedRecs = JSON.parse(data.reply);
      setRecommendations(parsedRecs);

    } catch (err) {
      console.error('Erro ao buscar recomendações:', err);
      setError('Não foi possível gerar as recomendações da IA. Verifique a configuração da sua chave de API.');
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleImplementRecommendation = (recId: string, link: string) => {
    setImplementedRecs(prev => [...prev, recId]);
    navigate(link);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  const getPriorityText = (priority: string) => {
    switch (priority) {
        case 'high': return 'Alta';
        case 'medium': return 'Média';
        case 'low': return 'Baixa';
        default: return 'Normal';
    }
  };

  const activeRecommendations = recommendations.filter(rec => !implementedRecs.includes(rec.id));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Sparkles className="w-7 h-7 text-purple-600 mr-3" />
            Recomendações da IA
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Ações inteligentes e personalizadas para impulsionar seu negócio.</p>
        </div>
        <button
          onClick={fetchRecommendations}
          disabled={loadingRecs}
          className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          {loadingRecs ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Gerar Novas Recomendações
        </button>
      </div>

      {loadingRecs && (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">A IA está analisando seus dados e gerando recomendações...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="font-semibold text-red-800 dark:text-red-200">Ocorreu um erro</p>
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {!loadingRecs && !error && (
        <>
          {activeRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col justify-between hover:shadow-lg transition-shadow">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{rec.category}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                        Prioridade {getPriorityText(rec.priority)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">{rec.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{rec.description}</p>
                  </div>
                  <button
                    onClick={() => handleImplementRecommendation(rec.id, rec.link)}
                    className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-medium transition-colors"
                  >
                    Implementar Recomendação <ArrowRight className="w-4 h-4 ml-2" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center bg-green-50 dark:bg-green-900/50 border border-green-200 dark:border-green-800 rounded-2xl p-12">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 dark:text-green-200 mb-2">Tudo em ordem!</h3>
              <p className="text-green-800 dark:text-green-300">Nenhuma recomendação crítica no momento. A IA continuará monitorando seus dados.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
