import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  salary: number;
  hire_date: string;
  status: 'active' | 'inactive' | 'terminated';
  address: string;
  birth_date: string;
  document_number: string;
  created_at: string;
  updated_at: string;
}

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = async () => {
    try {
      if (!isSupabaseConfigured()) {
        setEmployees([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setEmployees([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não configurado - usando dados vazios');
      setLoading(false);
      return;
    }
    
    try {
      await fetchEmployees();
    } catch (err) {
      console.error('Error fetching employee data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    const employeesSubscription = supabase
      .channel('employees_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        fetchEmployees();
      })
      .subscribe();

    return () => {
      employeesSubscription.unsubscribe();
    };
  }, []);

  return {
    employees,
    loading,
    error,
    refetch: fetchAllData,
    setEmployees,
  };
};
