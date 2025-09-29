import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  DollarSign, 
  Search, 
  Filter, 
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  Trash2,
  Edit,
  Eye
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { EmployeeForm } from '../components/forms/EmployeeForm';
import { useCurrency } from '../hooks/useCurrency';
import { useEmployeeData } from '../hooks/useEmployeeData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const RH: React.FC = () => {
  const { employees, loading, refetch } = useEmployeeData();
  const { formatCurrency } = useCurrency();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [showEmployeeDetails, setShowEmployeeDetails] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);

  const totalEmployees = employees?.length || 0;
  const activeEmployees = (employees || []).filter(e => e.status === 'active').length;
  const totalSalaries = (employees || []).reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const departments = [...new Set((employees || []).map(e => e.department))].length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'terminated': return 'Desligado';
      default: return status;
    }
  };

  const filteredEmployees = (employees || []).filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const uniqueDepartments = [...new Set((employees || []).map(e => e.department))];

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetails(true);
  };

  const handleEditEmployee = (employee: any) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleDeleteEmployee = async (employeeId: string, employeeName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o funcionário "${employeeName}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setDeletingEmployeeId(employeeId);

    try {
      if (!isSupabaseConfigured()) {
        alert('Sistema não configurado. Entre em contato com o suporte.');
        return;
      }

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', employeeId);

      if (error) throw error;

      alert('Funcionário excluído com sucesso!');
      refetch();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      if (error instanceof Error) {
        alert(`Erro ao excluir funcionário: ${error.message}`);
      } else {
        alert('Erro ao excluir funcionário. Tente novamente.');
      }
    } finally {
      setDeletingEmployeeId(null);
    }
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recursos Humanos</h1>
          <p className="text-gray-600">Gestão completa de funcionários e equipes</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Relatórios
          </button>
          <button 
            onClick={() => setShowEmployeeForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Novo Funcionário
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total de Funcionários"
          value={totalEmployees.toString()}
          icon={Users}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Funcionários Ativos"
          value={activeEmployees.toString()}
          icon={Users}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Folha de Pagamento"
          value={formatCurrency(totalSalaries)}
          icon={DollarSign}
          iconColor="text-purple-600"
        />
        <MetricCard
          title="Departamentos"
          value={departments.toString()}
          icon={Building2}
          iconColor="text-orange-600"
        />
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou cargo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="terminated">Desligados</option>
          </select>
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os Departamentos</option>
            {uniqueDepartments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Employee List */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {totalEmployees === 0 ? 'Nenhum funcionário cadastrado' : 'Nenhum funcionário encontrado'}
            </h3>
            <p className="text-gray-600 mb-6">
              {totalEmployees === 0 
                ? 'Comece adicionando seus primeiros funcionários ao sistema.'
                : 'Tente ajustar os filtros ou termos de busca.'
              }
            </p>
            {totalEmployees === 0 && (
              <button 
                onClick={() => setShowEmployeeForm(true)}
                className="flex items-center mx-auto px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Adicionar Primeiro Funcionário
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        {employee.position} - {employee.department}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {getStatusText(employee.status)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye 
                          className="w-4 h-4" 
                          onClick={() => handleViewEmployee(employee)}
                        />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Edit 
                          className="w-4 h-4" 
                          onClick={() => handleEditEmployee(employee)}
                        />
                      </button>
                      <button 
                        onClick={() => handleDeleteEmployee(employee.id, employee.name)}
                        disabled={deletingEmployeeId === employee.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingEmployeeId === employee.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {employee.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {employee.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    Admissão: {new Date(employee.hire_date).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {employee.address || 'Endereço não informado'}
                  </div>
                  <div className="font-semibold text-blue-600">
                    {formatCurrency(employee.salary || 0)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EmployeeForm
        isOpen={showEmployeeForm}
        onClose={() => {
          setShowEmployeeForm(false);
          setEditingEmployee(null);
        }}
        onSuccess={() => {
          refetch();
          alert(editingEmployee ? 'Funcionário atualizado com sucesso!' : 'Funcionário adicionado com sucesso!');
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />

      {/* Modal de Detalhes do Funcionário */}
      {showEmployeeDetails && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedEmployee.name}</h2>
                  <p className="text-gray-600">{selectedEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmployeeDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedEmployee.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <p className="text-gray-900">{selectedEmployee.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                  <p className="text-gray-900">{selectedEmployee.department}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salário</label>
                  <p className="text-gray-900 font-semibold">{formatCurrency(selectedEmployee.salary || 0)}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Admissão</label>
                  <p className="text-gray-900">{new Date(selectedEmployee.hire_date).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                  <p className="text-gray-900">
                    {selectedEmployee.birth_date 
                      ? new Date(selectedEmployee.birth_date).toLocaleDateString('pt-BR')
                      : 'Não informado'
                    }
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CPF/Documento</label>
                  <p className="text-gray-900">{selectedEmployee.document_number || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEmployee.status)}`}>
                    {getStatusText(selectedEmployee.status)}
                  </span>
                </div>
              </div>
            </div>

            {selectedEmployee.address && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <p className="text-gray-900">{selectedEmployee.address}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => {
                  setShowEmployeeDetails(false);
                  handleEditEmployee(selectedEmployee);
                }}
                className="flex items-center px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => setShowEmployeeDetails(false)}
                className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
