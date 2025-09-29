import React from 'react';
import { Line } from 'react-chartjs-2';
import { useCurrency } from '../../hooks/useCurrency';
import { Loader2 } from 'lucide-react';

interface PredictionData {
  predictions: { date: string; predicted_value: number; confidence_interval: { lower: number; upper: number; } }[];
  model_info: { accuracy_percentage: number; };
  historical_data: { date: string; total: number }[];
}

interface MainChartProps {
  predictionData: PredictionData | null;
}

export const MainChart: React.FC<MainChartProps> = ({ predictionData }) => {
  const { formatCurrency } = useCurrency();

  const chartData = React.useMemo(() => {
    const historicalLabels = predictionData?.historical_data.map(d => new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })) || [];
    const historicalValues = predictionData?.historical_data.map(d => d.total) || [];
    
    const predictionLabels = predictionData?.predictions.map(p => new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })) || [];
    const predictionValues = predictionData?.predictions.map(p => p.predicted_value) || [];

    return {
      labels: [...historicalLabels, ...predictionLabels],
      datasets: [
        {
          label: 'Vendas Reais',
          data: historicalValues,
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
        },
        {
          label: 'Previsão IA',
          data: [...new Array(historicalValues.length).fill(null), ...predictionValues],
          borderColor: 'rgb(16, 185, 129)',
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 3,
        },
      ],
    };
  }, [predictionData]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatCurrency(context.parsed.y);
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(203, 213, 225, 0.2)',
        },
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value, { minimumFractionDigits: 0 });
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
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">Vendas (Faturamento)</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Análise de vendas reais vs. previsões da IA para os próximos dias.</p>
      <div className="h-80">
        {!predictionData ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
              <p className="text-slate-500 dark:text-slate-400">Carregando dados de previsão...</p>
            </div>
          </div>
        ) : (
          <Line data={chartData} options={chartOptions as any} />
        )}
      </div>
    </>
  );
};
