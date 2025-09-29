import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && 
         supabaseAnonKey &&
         supabaseUrl.includes('supabase.co');
};

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO CRÍTICO: Variáveis de ambiente do Supabase não configuradas!');
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env');
}

// Create client
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Database types
export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  supplier: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  total_purchases: number;
  last_purchase?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  product_id: string;
  customer_id: string;
  quantity: number;
  unit_price: number;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  products?: Product;
  customers?: Customer;
}

export interface Purchase {
  id: string;
  product_id: string;
  quantity: number;
  unit_cost: number;
  total: number;
  supplier: string;
  status: 'pending' | 'received' | 'cancelled';
  created_at: string;
  updated_at: string;
  products?: Product;
}
