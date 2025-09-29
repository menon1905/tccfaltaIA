import React, { useState } from 'react';
import { X, Users, Save } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: any;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ isOpen, onClose, onSuccess, customer }) => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      if (customer) {
        setFormData({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          company: customer.company || ''
        });
      } else {
        setFormData({ name: '', email: '', phone: '', company: '' });
      }
      setFormErrors({});
    }
  }, [customer, isOpen]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'O nome é obrigatório.';
      case 'email':
        if (!value) return 'O email é obrigatório.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de email inválido.';
        return '';
      case 'phone':
        return value.trim() ? '' : 'O telefone é obrigatório.';
      default:
        return '';
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

    try {
      if (!isSupabaseConfigured()) {
        alert('Sistema não configurado.');
        setLoading(false);
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        alert('Você precisa estar logado para gerenciar clientes.');
        setLoading(false);
        return;
      }

      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company || null,
        status: 'active',
      };

      const { error } = customer
        ? await supabase.from('customers').update(customerData).eq('id', customer.id)
        : await supabase.from('customers').insert([{ ...customerData, user_id: user.id }]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente. Verifique se o email já não está cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let { name, value } = e.target;

    if (name === 'name') {
      value = value.replace(/[0-9]/g, '');
    } else if (name === 'phone') {
      value = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {customer ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
            <input
              type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
              placeholder="Ex: João Silva"
            />
            {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
              placeholder="joao@email.com"
            />
            {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
            <input
              type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-orange-500'}`}
              placeholder="(11) 99999-9999"
            />
            {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Empresa (Opcional)</label>
            <input
              type="text" name="company" value={formData.company} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Nome da empresa"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex items-center px-6 py-3 text-white bg-orange-600 rounded-xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Salvando...' : (customer ? 'Atualizar Cliente' : 'Salvar Cliente')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
