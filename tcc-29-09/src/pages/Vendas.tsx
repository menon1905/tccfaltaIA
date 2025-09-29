import React, { useState } from 'react';
import { 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Plus,
  Search,
  Bot,
  Target,
  Calendar
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../hooks/useCurrency';
import { useSalesPrediction } from '../hooks/useSalesPrediction';
import { Line } from 'react-chartjs-2';
import { SaleForm } from '../components/forms/SaleForm';

export const Vendas: React.FC = () => {
  const { sales, loading, error, refetch } = useSupabaseData();
  const { formatCurrency } = useCurrency();
  const { predictionData, loading: predictionLoading } = useSalesPrediction();
  const [searchTerm, setSearchTerm] = useState('');
  const [showSaleForm, setShowSaleForm] = useState(false);

  const totalSales = sales?.length || 0;
  const totalRevenue = sales?.reduce((sum, sale) => sum + (sale.total || 0), 0) || 0;

  // Prepare chart data with predictions
  const prepareChartData = () => {
    const historicalLabels: string[] = [];
    const historicalData: number[] = [];
    const predictionLabels: string[] = [];
    const predictionDataValues: number[] = [];

    if (predictionData?.historical_data) {
      predictionData.historical_data.forEach((item) => {
        historicalLabels.push(new Date(item.date).toLocaleDateString('pt-BR'));
        historicalData.push(item.total);
      });
    }

    if (predictionData?.predictions) {
      predictionData.predictions.forEach((item) => {
        predictionLabels.push(new Date(item.date).toLocaleDateString('pt-BR'));
        predictionDataValues.push(item.predicted_value);
      });
    }

    const allLabels = [...historicalLabels, ...predictionLabels];
    
    const datasets = [
      {
        label: 'Vendas Reais',
        data: [...historicalData, ...Array(predictionLabels.length).fill(null)],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Previsão IA',
        data: [...Array(historicalLabels.length).fill(null), ...predictionDataValues],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 4,
      },
    ];

    return { labels: allLabels, datasets };
  };

  const chartData = prepareChartData();

  const aiPredictions = {
    nextWeekSales: predictionData?.predictions.slice(0, 7).reduce((sum, p) => sum + p.predicted_value, 0) || 0,
    nextMonthRevenue: predictionData?.predictions.reduce((sum, p) => sum + p.predicted_value, 0) || 0,
    confidence: predictionData?.model_info.accuracy_percentage || 0
  };

  const filteredSales = (sales || []).filter(sale =>
    (sale.customers?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sale.products?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando vendas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas</h1>
          <p className="text-gray-600 mt-1">Análise inteligente de vendas</p>
        </div>
        <button 
          onClick={() => setShowSaleForm(true)}
          className="flex items-center px-6 py-2 text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Venda
        </button>
      </div>

      {/* Métricas com IA */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Vendas Realizadas"
          value={totalSales.toString()}
          icon={ShoppingCart}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">Previsão IA</span>
            </div>
            <div className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded-full">
              {Math.round(aiPredictions.confidence)}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(aiPredictions.nextWeekSales)}
          </p>
          <p className="text-sm text-gray-600">Vendas próxima semana</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-600">Meta IA</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(aiPredictions.nextMonthRevenue)}
          </p>
          <p className="text-sm text-gray-600">Previsão próximos 30 dias</p>
        </div>
      </div>

      {/* Gráfico Principal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Vendas vs Previsão IA</h3>
            <p className="text-gray-600 mt-1">
              {predictionLoading ? 'Carregando previsões...' : 
               predictionData ? `Modelo: ${predictionData.model_info.type} (${predictionData.model_info.data_points} pontos de dados)` :
               'Dados históricos e previsões inteligentes'}
            </p>
          </div>
        </div>
        <div className="h-80">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top' as const,
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                  },
                  ticks: {
                    callback: function(value) {
                      return formatCurrency(Number(value));
                    }
                  }
                },
                x: {
                  grid: {
                    display: false,
                  },
                },
              },
              interaction: {
                intersect: false,
                mode: 'index' as const,
              },
            }} 
          />
        </div>
      </div>

      {/* Lista de Vendas */}
      <div className="bg-white rounded-2xl border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Vendas Recentes</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar vendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="space-y-4">
          {filteredSales.slice(0, 5).map((sale) => (
            <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-medium text-gray-900">{sale.customers?.name || 'Cliente não encontrado'}</p>
                <p className="text-sm text-gray-600">{sale.products?.name || 'Produto não encontrado'}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatCurrency(sale.total)}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(sale.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SaleForm
        isOpen={showSaleForm}
        onClose={() => setShowSaleForm(false)}
        onSuccess={() => {
          refetch();
          alert('Venda registrada com sucesso!');
        }}
      />
    </div>
  );
};
