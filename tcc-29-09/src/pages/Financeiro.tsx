import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  PieChart,
  Calendar,
  Download,
  Filter,
  Plus,
  BarChart3
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../hooks/useCurrency';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

export const Financeiro: React.FC = () => {
  const { sales, purchases, loading } = useSupabaseData();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [period, setPeriod] = useState('month');

  const totalRevenue = (sales || []).reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalExpenses = (purchases || []).reduce((sum, purchase) => sum + (purchase.total || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const hasData = (sales || []).length > 0 || (purchases || []).length > 0;

  const handleGoToSales = () => {
    navigate('/vendas');
  };

  const handleGoToPurchases = () => {
    navigate('/compras');
  };
  // Dados para gráficos - apenas se houver dados reais
  const revenueExpensesData = {
    labels: hasData ? ['Período Atual'] : ['Sem Dados'],
    datasets: [
      {
        label: 'Receita',
        data: hasData ? [totalRevenue] : [0],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Despesas',
        data: hasData ? [totalExpenses] : [0],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Gráfico de fluxo de caixa
  const cashFlowData = {
    labels: hasData ? ['Resultado'] : ['Sem Dados'],
    datasets: [
      {
        label: 'Fluxo de Caixa',
        data: hasData ? [netProfit] : [0],
        backgroundColor: (ctx: any) => {
          const value = ctx.parsed?.y;
          return value >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
        },
        borderColor: (ctx: any) => {
          const value = ctx.parsed?.y;
          return value >= 0 ? 'rgb(16, 185, 129)' : 'rgb(239, 68, 68)';
        },
        borderWidth: 1,
      },
    ],
  };

  // Distribuição de despesas - apenas se houver dados
  const expenseDistributionData = {
    labels: hasData ? ['Compras de Produtos'] : ['Sem Dados'],
    datasets: [
      {
        data: hasData ? [totalExpenses] : [0],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Se não há dados, mostrar estado inicial
  if (!hasData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        </div>

        {/* Métricas zeradas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Receita Total"
            value="R$ 0,00"
            subtitle="Nenhuma venda registrada"
            icon={DollarSign}
            iconColor="text-green-600"
          />
          <MetricCard
            title="Despesas Total"
            value="R$ 0,00"
            subtitle="Nenhuma compra registrada"
            icon={CreditCard}
            iconColor="text-red-600"
          />
          <MetricCard
            title="Lucro Líquido"
            value="R$ 0,00"
            subtitle="Receita - Despesas"
            icon={BarChart3}
            iconColor="text-blue-600"
          />
          <MetricCard
            title="Margem de Lucro"
            value="0%"
            subtitle="Lucratividade"
            icon={PieChart}
            iconColor="text-purple-600"
          />
        </div>

        {/* Estado vazio */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Bem-vindo ao Módulo Financeiro
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Para começar a ver dados financeiros, você precisa registrar algumas vendas e compras no sistema.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleGoToSales}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Venda
            </button>
            <button 
              onClick={handleGoToPurchases}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Compra
            </button>
          </div>
        </div>

        {/* Dicas para começar */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3">💡 Como começar:</h4>
          <ul className="space-y-2 text-blue-800">
            <li>• <strong>1.</strong> Cadastre produtos no módulo de Estoque</li>
            <li>• <strong>2.</strong> Adicione clientes no módulo CRM</li>
            <li>• <strong>3.</strong> Registre suas primeiras vendas</li>
            <li>• <strong>4.</strong> Cadastre compras de fornecedores</li>
            <li>• <strong>5.</strong> Acompanhe seus dados financeiros aqui</li>
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <div className="flex items-center space-x-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </button>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Exportar Relatório
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Receita Total"
          value={formatCurrency(totalRevenue)}
          subtitle="Vendas realizadas"
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Despesas Total"
          value={formatCurrency(totalExpenses)}
          subtitle="Gastos do período"
          icon={CreditCard}
          iconColor="text-red-600"
        />
        <MetricCard
          title="Lucro Líquido"
          value={formatCurrency(netProfit)}
          subtitle="Receita - Despesas"
          icon={netProfit >= 0 ? TrendingUp : TrendingDown}
          iconColor={netProfit >= 0 ? 'text-green-600' : 'text-red-600'}
        />
        <MetricCard
          title="Margem de Lucro"
          value={`${profitMargin.toFixed(1)}%`}
          subtitle="Lucratividade"
          icon={PieChart}
          iconColor="text-blue-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Receita vs Despesas</h3>
            <Calendar className="w-5 h-5 text-gray-500" />
          </div>
          <Line data={revenueExpensesData} options={chartOptions} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Fluxo de Caixa</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <Bar data={cashFlowData} options={chartOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Análise Financeira Detalhada</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Resumo Financeiro</h4>
              {[
                { name: 'Receita Total', value: 100, amount: totalRevenue },
                { name: 'Despesas Total', value: totalExpenses > 0 ? (totalExpenses / Math.max(totalRevenue, totalExpenses)) * 100 : 0, amount: totalExpenses },
                { name: 'Lucro Líquido', value: Math.abs(netProfit) > 0 ? (Math.abs(netProfit) / Math.max(totalRevenue, Math.abs(netProfit))) * 100 : 0, amount: netProfit },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(category.amount)}
                    </p>
                    <div className="w-20 bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className="bg-purple-500 h-1.5 rounded-full" 
                        style={{ width: `${Math.min(category.value, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Metas Financeiras</h4>
              {[
                { name: 'Meta de Receita', current: totalRevenue, target: 50000 },
                { name: 'Meta de Lucro', current: Math.max(netProfit, 0), target: 15000 },
                { name: 'Controle de Custos', current: totalRevenue > 0 ? Math.min((totalExpenses / totalRevenue) * 100, 100) : 0, target: 70 },
              ].map((goal, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{goal.name}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {goal.name.includes('Controle') 
                        ? `${goal.current}%` 
                        : formatCurrency(goal.current)
                      }
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Meta: {goal.name.includes('Controle') 
                      ? `${goal.target}%` 
                      : formatCurrency(goal.target)
                    }
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Distribuição de Despesas</h3>
          <div className="flex justify-center mb-4">
            <div className="w-48 h-48">
              <Doughnut 
                data={expenseDistributionData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>
          {hasData && (
            <div className="space-y-3">
              {expenseDistributionData.labels.map((label, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-900">
                    {totalExpenses > 0 ? `${((expenseDistributionData.datasets[0].data[index] / totalExpenses) * 100).toFixed(0)}%` : '0%'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
