import React from 'react';
import { Bar } from 'react-chartjs-2';
import { useCurrency } from '../../hooks/useCurrency';
import { Package } from 'lucide-react';

interface TopProductsChartProps {
  sales: any[];
  products: any[];
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ sales, products }) => {
  const { formatCurrency } = useCurrency();

  const chartData = React.useMemo(() => {
    if (!sales.length || !products.length) {
      return { labels: [], datasets: [] };
    }

    const productRevenue = new Map<string, number>();

    sales.forEach(sale => {
      if (sale.product_id && sale.total) {
        productRevenue.set(sale.product_id, (productRevenue.get(sale.product_id) || 0) + sale.total);
      }
    });

    const topProducts = Array.from(productRevenue.entries())
      .sort(([, revenueA], [, revenueB]) => revenueB - revenueA)
      .slice(0, 5);

    const labels = topProducts.map(([productId]) => {
      const product = products.find(p => p.id === productId);
      return product ? product.name : 'Desconhecido';
    });
    const data = topProducts.map(([, revenue]) => revenue);

    return {
      labels,
      datasets: [
        {
          label: 'Faturamento',
          data,
          backgroundColor: 'rgba(139, 92, 246, 0.6)',
          borderColor: 'rgba(139, 92, 246, 1)',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [sales, products]);

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Faturamento: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
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
      y: {
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Top 5 Produtos</h3>
      <div className="h-64">
        {chartData.labels.length > 0 ? (
          <Bar data={chartData} options={chartOptions as any} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Package className="w-10 h-10 text-slate-400 mb-2" />
            <p className="text-slate-500 dark:text-slate-400">Sem dados de vendas para exibir o ranking de produtos.</p>
          </div>
        )}
      </div>
    </>
  );
};
