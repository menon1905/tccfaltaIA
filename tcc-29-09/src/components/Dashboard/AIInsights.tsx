import React from 'react';
import { Bot, TrendingUp, Package, Users, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { Link } from 'react-router-dom';

interface AIInsightsProps {
  sales: any[];
  products: any[];
  customers: any[];
  predictionData: any;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ sales, products, predictionData }) => {
  const { formatCurrency } = useCurrency();

  const insights = React.useMemo(() => {
    const generatedInsights = [];

    // Sales Prediction Insight
    if (predictionData?.predictions?.length > 0) {
      const nextWeekRevenue = predictionData.predictions.slice(0, 7).reduce((sum: number, p: any) => sum + p.predicted_value, 0);
      generatedInsights.push({
        id: 'sales-prediction',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-100 dark:bg-green-900/50',
        title: 'Previsão de Vendas',
        description: `A IA prevê um faturamento de ${formatCurrency(nextWeekRevenue)} para os próximos 7 dias.`,
        link: '/vendas'
      });
    }

    // Low Stock Insight
    const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
    if (lowStockProducts.length > 0) {
      generatedInsights.push({
        id: 'low-stock',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100 dark:bg-orange-900/50',
        title: 'Alerta de Estoque Baixo',
        description: `${lowStockProducts.length} produto(s) precisam de reposição urgente para evitar perda de vendas.`,
        link: '/estoque'
      });
    }
    
    // Best selling product
    if (sales.length > 0 && products.length > 0) {
        const productRevenue = new Map<string, number>();
        sales.forEach(sale => {
            productRevenue.set(sale.product_id, (productRevenue.get(sale.product_id) || 0) + sale.total);
        });
        const topProductEntry = Array.from(productRevenue.entries()).sort((a, b) => b[1] - a[1])[0];
        if (topProductEntry) {
            const topProduct = products.find(p => p.id === topProductEntry[0]);
            if (topProduct) {
                generatedInsights.push({
                    id: 'top-product',
                    icon: Package,
                    color: 'text-purple-600',
                    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
                    title: 'Produto em Destaque',
                    description: `"${topProduct.name}" é seu produto mais vendido. Considere criar uma campanha para ele.`,
                    link: '/estoque'
                });
            }
        }
    }

    // Default insight if empty
    if (generatedInsights.length === 0) {
      generatedInsights.push({
        id: 'get-started',
        icon: Sparkles,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100 dark:bg-blue-900/50',
        title: 'Comece a Usar a IA',
        description: 'Adicione vendas e produtos para que a IA comece a gerar insights personalizados para o seu negócio.',
        link: '/vendas'
      });
    }

    return generatedInsights;
  }, [sales, products, predictionData, formatCurrency]);

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 h-full">
      <div className="flex items-center space-x-3 mb-6">
        <Bot className="w-6 h-6 text-purple-600" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Insights da IA</h2>
      </div>
      <div className="space-y-4">
        {insights.map(insight => {
          const Icon = insight.icon;
          return (
            <div key={insight.id} className={`p-4 rounded-lg ${insight.bgColor}`}>
              <div className="flex items-start space-x-3">
                <Icon className={`w-5 h-5 mt-1 flex-shrink-0 ${insight.color}`} />
                <div>
                  <h4 className={`font-semibold mb-1 ${insight.color}`}>{insight.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{insight.description}</p>
                  <Link to={insight.link} className={`inline-flex items-center text-sm font-medium mt-2 ${insight.color}`}>
                    Ver mais <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
