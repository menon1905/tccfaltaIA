import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { useCurrency } from '../../hooks/useCurrency';
import { Tag } from 'lucide-react';

interface CategoryChartProps {
  sales: any[];
  products: any[];
}

export const CategoryChart: React.FC<CategoryChartProps> = ({ sales, products }) => {
  const { formatCurrency } = useCurrency();

  const chartData = React.useMemo(() => {
    if (!sales.length || !products.length) {
      return { labels: [], datasets: [] };
    }

    const categoryRevenue = new Map<string, number>();
    const productMap = new Map(products.map(p => [p.id, p]));

    sales.forEach(sale => {
      const product = productMap.get(sale.product_id);
      if (product && product.category && sale.total) {
        categoryRevenue.set(product.category, (categoryRevenue.get(product.category) || 0) + sale.total);
      }
    });

    const labels = Array.from(categoryRevenue.keys());
    const data = Array.from(categoryRevenue.values());

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento por Categoria',
          data,
          backgroundColor: [
            'rgba(139, 92, 246, 0.7)',
            'rgba(59, 130, 246, 0.7)',
            'rgba(16, 185, 129, 0.7)',
            'rgba(245, 158, 11, 0.7)',
            'rgba(239, 68, 68, 0.7)',
          ],
          borderColor: 'rgba(255, 255, 255, 0)',
          borderWidth: 0,
        },
      ],
    };
  }, [sales, products]);
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          boxWidth: 8,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total || 1;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Desempenho por Categoria</h3>
      <div className="h-64">
        {chartData.labels.length > 0 ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Tag className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Sem dados para exibir o desempenho por categoria.</p>
          </div>
        )}
      </div>
    </>
  );
};
