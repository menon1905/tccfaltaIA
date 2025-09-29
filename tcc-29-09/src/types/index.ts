export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  supplier: string;
  createdAt: Date;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  customer: string;
  date: Date;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Purchase {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
  supplier: string;
  date: Date;
  status: 'pending' | 'received' | 'cancelled';
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  totalPurchases: number;
  lastPurchase: Date;
  status: 'active' | 'inactive';
}

export interface AIInsight {
  id: string;
  type: 'alert' | 'suggestion' | 'prediction' | 'optimization';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  date: Date;
}
