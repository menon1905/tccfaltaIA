import React, { useState } from 'react';
import { X, Package, Save, AlertCircle } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [skuError, setSkuError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '',
    cost: '',
    stock: '',
    min_stock: '',
    supplier: ''
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
      case 'category':
      case 'supplier':
        return value.trim() ? '' : 'Este campo é obrigatório.';
      case 'sku':
        if (!value) return 'O SKU é obrigatório.';
        if (!/^[A-Z0-9]+(-[A-Z0-9]+)*$/.test(value)) {
          return 'Formato inválido. Use letras maiúsculas, números e hifens.';
        }
        return '';
      case 'price':
      case 'cost':
        if (!value) return 'Este campo é obrigatório.';
        if (isNaN(parseFloat(value))) return 'Valor inválido.';
        return '';
      case 'stock':
      case 'min_stock':
        if (!value) return 'Este campo é obrigatório.';
        if (!/^\d+$/.test(value)) return 'Use apenas números inteiros.';
        return '';
      default:
        return '';
    }
  };

  const checkSkuUniqueness = async (sku: string) => {
    if (!sku || formErrors.sku) {
      setSkuError(null);
      return true;
    }
    try {
      const { data, error } = await supabase
        .from('products')
        .select('sku')
        .eq('sku', sku)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSkuError('Este SKU já está em uso.');
        return false;
      } else {
        setSkuError(null);
        return true;
      }
    } catch (err) {
      console.error('Erro ao verificar SKU:', err);
      setSkuError(null); 
      return true;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof typeof formData;
      const error = validateField(fieldName, formData[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    const isSkuValid = await checkSkuUniqueness(formData.sku);
    if (!isSkuValid) {
      setLoading(false);
      return;
    }

    try {
      if (!isSupabaseConfigured()) {
        alert('Sistema não configurado.');
        setLoading(false);
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert('Você precisa estar logado para adicionar produtos.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('products')
        .insert([{
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          price: parseFloat(formData.price),
          cost: parseFloat(formData.cost),
          stock: parseInt(formData.stock),
          min_stock: parseInt(formData.min_stock),
          supplier: formData.supplier,
          user_id: user.id
        }]);

      if (error) throw error;

      setFormData({ name: '', sku: '', category: '', price: '', cost: '', stock: '', min_stock: '', supplier: '' });
      setFormErrors({});
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key value violates unique constraint')) {
          setSkuError('Este SKU já está em uso.');
        } else {
          alert(`Erro ao adicionar produto: ${error.message}`);
        }
      } else {
        alert('Erro de conexão. Verifique se o Supabase está configurado corretamente.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (['price', 'cost'].includes(name)) {
      value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    } else if (['stock', 'min_stock'].includes(name)) {
      value = value.replace(/[^0-9]/g, '');
    } else if (name === 'sku') {
      value = value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'sku') {
      setSkuError(null);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));

    if (name === 'sku' && !error) {
      checkSkuUniqueness(value);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Adicionar Produto</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Produto *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="Ex: iPhone 15 Pro"
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
              <input
                type="text" name="sku" value={formData.sku} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.sku || skuError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="EX: ELE-IPH15-PRO"
              />
              {(formErrors.sku || skuError) && <p className="text-sm text-red-600 mt-1">{formErrors.sku || skuError}</p>}
              {!(formErrors.sku || skuError) && <p className="text-xs text-gray-500 mt-1">Use letras maiúsculas, números e hifens (ex: CAT-PROD-VAR).</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
              <select
                name="category" value={formData.category} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.category ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
              >
                <option value="">Selecione uma categoria</option>
                <option value="Eletrônicos">Eletrônicos</option>
                <option value="Computadores">Computadores</option>
                <option value="Acessórios">Acessórios</option>
                <option value="Móveis">Móveis</option>
                <option value="Roupas">Roupas</option>
              </select>
              {formErrors.category && <p className="text-sm text-red-600 mt-1">{formErrors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor *</label>
              <input
                type="text" name="supplier" value={formData.supplier} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.supplier ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="Ex: Apple Brasil"
              />
              {formErrors.supplier && <p className="text-sm text-red-600 mt-1">{formErrors.supplier}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preço de Venda *</label>
              <input
                type="text" name="price" value={formData.price} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.price ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="0.00"
              />
              {formErrors.price && <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Custo *</label>
              <input
                type="text" name="cost" value={formData.cost} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.cost ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="0.00"
              />
              {formErrors.cost && <p className="text-sm text-red-600 mt-1">{formErrors.cost}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Inicial *</label>
              <input
                type="text" name="stock" value={formData.stock} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="0"
              />
              {formErrors.stock && <p className="text-sm text-red-600 mt-1">{formErrors.stock}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo *</label>
              <input
                type="text" name="min_stock" value={formData.min_stock} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.min_stock ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}`}
                placeholder="0"
              />
              {formErrors.min_stock && <p className="text-sm text-red-600 mt-1">{formErrors.min_stock}</p>}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !!skuError || Object.values(formErrors).some(e => e)}
              className="flex items-center px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
