import React, { useState } from 'react';
import { X, Users, Save } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employee?: any;
}

export const EmployeeForm: React.FC<EmployeeFormProps> = ({ isOpen, onClose, onSuccess, employee }) => {
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    department: '',
    salary: '',
    hire_date: new Date().toISOString().split('T')[0],
    address: '',
    birth_date: '',
    document_number: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      if (employee) {
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          position: employee.position || '',
          department: employee.department || '',
          salary: employee.salary?.toString() || '',
          hire_date: employee.hire_date ? employee.hire_date.split('T')[0] : new Date().toISOString().split('T')[0],
          address: employee.address || '',
          birth_date: employee.birth_date ? employee.birth_date.split('T')[0] : '',
          document_number: employee.document_number || ''
        });
      } else {
        setFormData({
          name: '', email: '', phone: '', position: '', department: '', salary: '',
          hire_date: new Date().toISOString().split('T')[0], address: '', birth_date: '', document_number: ''
        });
      }
      setFormErrors({});
    }
  }, [employee, isOpen]);

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'name':
      case 'position':
      case 'department':
      case 'hire_date':
        return value.trim() ? '' : 'Este campo é obrigatório.';
      case 'email':
        if (!value) return 'O email é obrigatório.';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Formato de email inválido.';
        return '';
      case 'phone':
        return value.trim() ? '' : 'O telefone é obrigatório.';
      case 'salary':
        if (!value) return 'O salário é obrigatório.';
        if (isNaN(parseFloat(value))) return 'Valor inválido.';
        return '';
      default:
        return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { [key: string]: string } = {};
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof typeof formData;
      if (['name', 'email', 'phone', 'position', 'department', 'salary', 'hire_date'].includes(fieldName)) {
        const error = validateField(fieldName, formData[fieldName]);
        if (error) {
          errors[fieldName] = error;
        }
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
        alert('Você precisa estar logado para gerenciar funcionários.');
        setLoading(false);
        return;
      }

      const employeeData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          position: formData.position,
          department: formData.department,
          salary: parseFloat(formData.salary),
          hire_date: formData.hire_date,
          address: formData.address || null,
          birth_date: formData.birth_date || null,
          document_number: formData.document_number || null,
          status: 'active',
      };

      const { error } = employee
        ? await supabase.from('employees').update(employeeData).eq('id', employee.id)
        : await supabase.from('employees').insert([{ ...employeeData, user_id: user.id }]);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar funcionário:', error);
      alert('Erro ao salvar funcionário. Verifique se o email já não está cadastrado.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (name === 'name') {
      value = value.replace(/[0-9]/g, '');
    } else if (name === 'salary') {
      value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    } else if (name === 'phone') {
      value = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/g, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 15);
    } else if (name === 'document_number') {
      value = value
        .replace(/\D/g, '')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        .slice(0, 14);
    }

    setFormData(prev => ({ ...prev, [name]: value }));

    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setFormErrors(prev => ({ ...prev, [name]: error }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="Ex: João Silva Santos"
              />
              {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="joao@empresa.com"
              />
              {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="(11) 99999-9999"
              />
              {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">CPF/Documento</label>
              <input
                type="text" name="document_number" value={formData.document_number} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo *</label>
              <input
                type="text" name="position" value={formData.position} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.position ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="Ex: Desenvolvedor Frontend"
              />
              {formErrors.position && <p className="text-sm text-red-600 mt-1">{formErrors.position}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamento *</label>
              <select
                name="department" value={formData.department} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.department ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              >
                <option value="">Selecione um departamento</option>
                <option value="Tecnologia">Tecnologia</option>
                <option value="Vendas">Vendas</option>
                <option value="Marketing">Marketing</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
                <option value="Operações">Operações</option>
                <option value="Atendimento">Atendimento</option>
              </select>
              {formErrors.department && <p className="text-sm text-red-600 mt-1">{formErrors.department}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salário *</label>
              <input
                type="text" name="salary" value={formData.salary} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.salary ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
                placeholder="0.00"
              />
              {formErrors.salary && <p className="text-sm text-red-600 mt-1">{formErrors.salary}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Admissão *</label>
              <input
                type="date" name="hire_date" value={formData.hire_date} onChange={handleChange} onBlur={handleBlur} required
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent ${formErrors.hire_date ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
              {formErrors.hire_date && <p className="text-sm text-red-600 mt-1">{formErrors.hire_date}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Data de Nascimento</label>
              <input
                type="date" name="birth_date" value={formData.birth_date} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Endereço</label>
            <input
              type="text" name="address" value={formData.address} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Rua, número, bairro, cidade - UF"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              Cancelar
            </button>
            <button
              type="submit" disabled={loading}
              className="flex items-center px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Salvando...' : (employee ? 'Atualizar Funcionário' : 'Salvar Funcionário')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
