import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const useSupabaseData = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      if (!isSupabaseConfigured()) return;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      if (!isSupabaseConfigured()) return;
      
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setCustomers([]);
    }
  };

  const fetchSales = async () => {
    try {
      if (!isSupabaseConfigured()) return;
      
      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          products (name, sku),
          customers (name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setSales(data || []);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setSales([]);
    }
  };

  const fetchPurchases = async () => {
    try {
      if (!isSupabaseConfigured()) return;
      
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          products (name, sku)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPurchases(data || []);
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setPurchases([]);
    }
  };

  const fetchAIInsights = async () => {
    try {
      if (!isSupabaseConfigured()) return;
      
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setAiInsights(data || []);
    } catch (err) {
      console.error('Error fetching AI insights:', err);
      setAiInsights([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    
    if (!isSupabaseConfigured()) {
      console.warn('Supabase não configurado - usando dados vazios');
      setLoading(false);
      return;
    }
    
    try {
      await Promise.all([
        fetchProducts(),
        fetchCustomers(),
        fetchSales(),
        fetchPurchases(),
        fetchAIInsights()
      ]);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    
    const productsSubscription = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        fetchProducts();
      })
      .subscribe();

    const salesSubscription = supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        fetchSales();
      })
      .subscribe();

    const insightsSubscription = supabase
      .channel('ai_insights_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ai_insights' }, () => {
        fetchAIInsights();
      })
      .subscribe();

    return () => {
      productsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
      insightsSubscription.unsubscribe();
    };
  }, []);

  return {
    products,
    customers,
    sales,
    purchases,
    aiInsights,
    loading,
    error,
    refetch: fetchAllData,
    setProducts,
    setCustomers,
    setSales,
    setPurchases,
    setAiInsights,
  };
};
