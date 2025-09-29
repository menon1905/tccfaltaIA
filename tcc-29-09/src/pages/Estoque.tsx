import React, { useState } from 'react';
import { 
  Package, 
  AlertTriangle, 
  DollarSign, 
  Plus,
  Search,
  Bot,
  Target,
  Sparkles,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { ProductForm } from '../components/forms/ProductForm';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useCurrency } from '../hooks/useCurrency';

export const Estoque: React.FC = () => {
  const { products, loading, error, refetch } = useSupabaseData();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const totalProducts = products?.length || 0;
  const lowStockProducts = (products || []).filter(p => p.stock <= p.min_stock).length;
  const totalValue = (products || []).reduce((sum, product) => sum + (product.price * product.stock), 0);

  // IA Predictions
  const aiPredictions = {
    reorderSuggestions: 3,
    costSavings: 2500,
    efficiency: 91
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o produto "${productName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingProductId(productId);

    try {
      if (!isSupabaseConfigured()) {
        alert('Sistema não configurado. Entre em contato com o suporte.');
        return;
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Produto excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      if (error instanceof Error) {
        if (error.message.includes('foreign key constraint')) {
          alert('Não é possível excluir este produto pois ele possui vendas ou compras associadas.');
        } else {
          alert(`Erro ao excluir produto: ${error.message}`);
        }
      } else {
        alert('Erro ao excluir produto. Tente novamente.');
      }
    } finally {
      setDeletingProductId(null);
    }
  };
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estoque</h1>
          <p className="text-gray-600 mt-1">Controle inteligente de inventário</p>
        </div>
        <button 
          onClick={() => setShowProductForm(true)}
          className="flex items-center px-6 py-2 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Produto
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Produtos"
          value={totalProducts.toString()}
          icon={Package}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Produtos em Falta"
          value={lowStockProducts.toString()}
          icon={AlertTriangle}
          iconColor="text-orange-600"
        />
        <MetricCard
          title="Valor Total"
          value={formatCurrency(totalValue)}
          icon={DollarSign}
          iconColor="text-green-600"
        />
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Otimização IA</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-1">
            {formatCurrency(aiPredictions.costSavings)}
          </p>
          <p className="text-sm text-gray-600">Economia potencial</p>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Produtos</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center bg-gray-50 rounded-2xl p-8 sm:p-12 mt-8">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Seu estoque está vazio!</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Cadastre seus produtos para começar a gerenciar seu inventário.
            </p>
            <button 
              onClick={() => setShowProductForm(true)}
              className="flex items-center mx-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Primeiro Produto
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Table Header for larger screens */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-gray-500 uppercase">
              <div className="col-span-4">Produto</div>
              <div className="col-span-2">Estoque</div>
              <div className="col-span-2">Preço</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Ações</div>
            </div>
            {filteredProducts.map((product) => (
              <div key={product.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                <div className="col-span-1 md:col-span-4 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex-shrink-0 items-center justify-center hidden sm:flex">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-600">{product.sku}</p>
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="md:hidden text-xs text-gray-500 mb-1">Estoque</p>
                  <p className={`font-semibold ${product.stock <= product.min_stock ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="md:hidden text-xs text-gray-500 mb-1">Preço</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </p>
                </div>
                <div className="col-span-1 md:col-span-2">
                  <p className="md:hidden text-xs text-gray-500 mb-1">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      product.stock <= product.min_stock
                        ? 'bg-red-100 text-red-800'
                        : product.stock <= product.min_stock * 2
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {product.stock <= product.min_stock
                      ? 'Baixo'
                      : product.stock <= product.min_stock * 2
                      ? 'Médio'
                      : 'Normal'}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2 flex justify-end items-center space-x-2">
                  <button
                    onClick={() => handleDeleteProduct(product.id, product.name)}
                    disabled={deletingProductId === product.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Excluir produto"
                  >
                    {deletingProductId === product.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProductForm
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSuccess={() => {
          refetch();
          alert('Produto adicionado com sucesso!');
        }}
      />
    </div>
  );
};
