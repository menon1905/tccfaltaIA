import React from 'react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useSalesPrediction } from '../hooks/useSalesPrediction';
import { DollarSign, ShoppingCart, Users, Package, Loader2 } from 'lucide-react';

import { MetricCard } from '../components/Dashboard/MetricCard';
import { MainChart } from '../components/Dashboard/MainChart';
import { TopProductsChart } from '../components/Dashboard/TopProductsChart';
import { CategoryChart } from '../components/Dashboard/CategoryChart';
import { AIInsights } from '../components/Dashboard/AIInsights';

export const Dashboard: React.FC = () => {
  const { products, sales, customers, loading: dataLoading } = useSupabaseData();
  const { predictionData, loading: predictionLoading } = useSalesPrediction();

  const loading = dataLoading || predictionLoading;

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalSalesCount = sales.length;
  const totalCustomers = customers.length;
  const totalProducts = products.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-slate-600 dark:text-slate-400">Analisando dados e preparando seu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Dashboard IA</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Faturamento Total" value={new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalRevenue)} icon={DollarSign} description="Receita de todas as vendas" color="bg-green-100 text-green-600" />
        <MetricCard title="Total de Vendas" value={totalSalesCount.toString()} icon={ShoppingCart} description="Número de transações concluídas" color="bg-blue-100 text-blue-600" />
        <MetricCard title="Clientes Ativos" value={totalCustomers.toString()} icon={Users} description="Clientes cadastrados no sistema" color="bg-orange-100 text-orange-600" />
        <MetricCard title="Produtos em Estoque" value={totalProducts.toString()} icon={Package} description="Itens únicos no inventário" color="bg-purple-100 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <MainChart predictionData={predictionData} />
        </div>
        <div className="lg:col-span-1">
          <AIInsights sales={sales} products={products} customers={customers} predictionData={predictionData} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <TopProductsChart sales={sales} products={products} />
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
          <CategoryChart sales={sales} products={products} />
        </div>
      </div>
    </div>
  );
};
