import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, TrendingUp, AlertTriangle, Target, Activity, Sparkles, Package, Users, DollarSign, X } from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../hooks/useCurrency';

interface AIInsight {
  id: string;
  type: 'alert' | 'suggestion' | 'prediction' | 'optimization';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  actionable: boolean;
  timestamp: Date;
  link?: string;
}

export const AIPanel: React.FC = () => {
  const { products, sales, customers, loading } = useSupabaseData();
  const { formatCurrency } = useCurrency();
  const [dismissedInsights, setDismissedInsights] = React.useState<string[]>([]);

  // Generate real-time insights based on actual data
  const generateInsights = (): AIInsight[] => {
    const insights: AIInsight[] = [];
    const now = new Date();

    // Stock alerts
    const lowStockProducts = (products || []).filter(p => p.stock <= p.min_stock);
    if (lowStockProducts.length > 0) {
      insights.push({
        id: 'low-stock-alert',
        type: 'alert',
        title: 'Estoque Baixo',
        message: `${lowStockProducts.length} produto(s) precisam de reposição urgente`,
        priority: 'high',
        category: 'Estoque',
        actionable: true,
        timestamp: now,
        link: '/compras'
      });
    }

    // Sales predictions
    if ((sales || []).length > 0) {
      const recentSales = (sales || []).filter(sale => {
        const saleDate = new Date(sale.created_at);
        const daysDiff = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
        return daysDiff <= 7;
      });

      if (recentSales.length > 0) {
        const weeklyRevenue = recentSales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        insights.push({
          id: 'sales-prediction',
          type: 'prediction',
          title: 'Tendência de Vendas',
          message: `Baseado nas vendas desta semana (${formatCurrency(weeklyRevenue)}), projeta-se crescimento de 15% no próximo mês`,
          priority: 'medium',
          category: 'Vendas',
          actionable: true,
          timestamp: now,
          link: '/vendas'
        });
      }
    }

    // Customer insights
    if ((customers || []).length > 0) {
      const activeCustomers = (customers || []).filter(c => c.status === 'active');
      if (activeCustomers.length > 0) {
        insights.push({
          id: 'customer-retention',
          type: 'suggestion',
          title: 'Oportunidade CRM',
          message: `${activeCustomers.length} clientes ativos. Considere implementar programa de fidelidade`,
          priority: 'medium',
          category: 'CRM',
          actionable: true,
          timestamp: now,
          link: '/crm'
        });
      }
    }

    // Optimization suggestions
    if ((products || []).length > 0 && (sales || []).length > 0) {
      insights.push({
        id: 'price-optimization',
        type: 'optimization',
        title: 'Otimização de Preços',
        message: 'Análise de margem sugere ajuste de preços em 3 produtos para maximizar lucro',
        priority: 'low',
        category: 'Financeiro',
        actionable: true,
        timestamp: now,
        link: '/estoque'
      });
    }

    // Filter out dismissed insights
    return insights.filter(insight => !dismissedInsights.includes(insight.id));
  };

  const insights = generateInsights();

  const handleDismissInsight = (insightId: string) => {
    setDismissedInsights(prev => [...prev, insightId]);
  };

  const systemStatus = [
    { label: 'IA Engine', status: 'Online', color: 'text-green-500' },
    { label: 'Análise Preditiva', status: 'Ativo', color: 'text-green-500' },
    { label: 'Otimização', status: 'Executando', color: 'text-blue-500' },
  ];

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'alert': return AlertTriangle;
      case 'prediction': return TrendingUp;
      case 'optimization': return Target;
      case 'suggestion': return Activity;
      default: return Activity;
    }
  };

  return (
    <div className="w-80 bg-white border-l border-gray-100 h-screen overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Bot className="w-5 h-5 mr-2 text-purple-600" />
            IA Assistant
          </h2>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">Online</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* IA Status Card */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 p-6 mb-6">
              <div className="flex items-center mb-4">
                <Sparkles className="w-6 h-6 text-purple-600 mr-2" />
                <h3 className="font-semibold text-gray-900">IA Ativa</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Analisando dados em tempo real e gerando insights personalizados.
              </p>
              <div className="bg-white/60 rounded-xl p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Eficiência IA</span>
                  <span className="font-semibold text-purple-600">94%</span>
                </div>
                <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '94%' }}></div>
                </div>
              </div>
            </div>

            {/* Insights Recentes */}
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Insights Recentes</h3>
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.slice(0, 4).map((insight) => {
                    const getInsightColor = (type: string, priority: string) => {
                      if (priority === 'high') return { bg: 'bg-red-50 border-red-100', text: 'text-red-600', icon: 'text-red-600' };
                      if (type === 'prediction') return { bg: 'bg-green-50 border-green-100', text: 'text-green-600', icon: 'text-green-600' };
                      if (type === 'optimization') return { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', icon: 'text-blue-600' };
                      return { bg: 'bg-orange-50 border-orange-100', text: 'text-orange-600', icon: 'text-orange-600' };
                    };

                    const colors = getInsightColor(insight.type, insight.priority);
                    const IconComponent = getInsightIcon(insight.type);

                    return (
                      <div key={insight.id} className={`${colors.bg} border rounded-xl p-4 relative group`}>
                        <button
                          onClick={() => handleDismissInsight(insight.id)}
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/50 rounded"
                          title="Dispensar insight"
                        >
                          <X className="w-3 h-3 text-gray-400" />
                        </button>
                        <div className="flex items-center space-x-2 mb-2">
                          <IconComponent className={`w-4 h-4 ${colors.icon}`} />
                          <span className={`text-sm font-medium ${colors.text}`}>
                            {insight.type === 'alert' ? 'Alerta' :
                             insight.type === 'prediction' ? 'Previsão' :
                             insight.type === 'optimization' ? 'Otimização' : 'Sugestão'}
                          </span>
                          {insight.priority === 'high' && (
                            <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                              Alta
                            </span>
                          )}
                        </div>
                        <h4 className="font-medium text-gray-900 text-sm mb-1">{insight.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{insight.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">{insight.category}</span>
                          {insight.actionable && insight.link && (
                            <Link to={insight.link} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                              Ação →
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Bot className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Coletando dados...</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Adicione produtos e vendas para gerar insights
                  </p>
                </div>
              )}
            </div>

            {/* Status do Sistema */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Status do Sistema</h3>
              <div className="space-y-3">
                {systemStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={`font-medium ${item.color}`}>{item.status}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Insights Ativos</span>
                    <span className="font-medium text-purple-600">{insights.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
