import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, Save } from 'lucide-react';
import { useCurrency } from '../../hooks/useCurrency';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SaleForm: React.FC<SaleFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { formatCurrency } = useCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [formData, setFormData] = useState({
    product_id: '',
    customer_id: '',
    quantity: '1'
  });

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchCustomers();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock')
        .gt('stock', 0)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isSupabaseConfigured()) {
        alert('Sistema não configurado. Entre em contato com o suporte.');
        setLoading(false);
        return;
      }

      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert('Você precisa estar logado para registrar vendas.');
        setLoading(false);
        return;
      }

      const selectedProduct = products.find(p => p.id === formData.product_id);
      if (!selectedProduct) throw new Error('Produto não encontrado');

      const quantity = parseInt(formData.quantity);
      if (quantity > selectedProduct.stock) {
        alert('Quantidade maior que o estoque disponível');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('sales')
        .insert([{
          product_id: formData.product_id,
          customer_id: formData.customer_id,
          quantity: quantity,
          unit_price: selectedProduct.price,
          status: 'completed',
          user_id: user.id
        }]);

      if (error) throw error;

      // Atualizar estoque do produto
      const { error: stockError } = await supabase
        .from('products')
        .update({ stock: selectedProduct.stock - quantity })
        .eq('id', formData.product_id);

      if (stockError) {
        console.error('Erro ao atualizar estoque:', stockError);
        // Continua mesmo se não conseguir atualizar o estoque
      }

      // Reset form
      setFormData({
        product_id: '',
        customer_id: '',
        quantity: '1'
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar venda:', error);
      alert('Erro ao registrar venda. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const selectedProduct = products.find(p => p.id === formData.product_id);
  const total = selectedProduct ? selectedProduct.price * parseInt(formData.quantity || '1') : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Nova Venda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cliente *
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione um cliente</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </option>
              ))}
            </select>
            {customers.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhum cliente encontrado. Cadastre clientes primeiro.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produto *
            </label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">Selecione um produto</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatCurrency(product.price)} (Estoque: {product.stock})
                </option>
              ))}
            </select>
            {products.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">
                Nenhum produto com estoque encontrado. Cadastre produtos primeiro.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantidade *
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="1"
              max={selectedProduct?.stock || 999}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            {selectedProduct && (
              <p className="text-sm text-gray-500 mt-1">
                Estoque disponível: {selectedProduct.stock} unidades
              </p>
            )}
          </div>

          {total > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Total da Venda:</span>
                <span className="text-lg font-bold text-green-900">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.product_id || !formData.customer_id}
              className="flex items-center px-6 py-3 text-white bg-green-600 rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Salvando...' : 'Registrar Venda'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
