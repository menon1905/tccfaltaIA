import { useState, useEffect } from 'react';
import { Product, Sale, Purchase, Customer, AIInsight } from '../types';

// Mock data for demonstration
const generateMockProducts = (): Product[] => [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    sku: 'APL-IP15P-128',
    category: 'Eletrônicos',
    price: 6999.99,
    cost: 5500.00,
    stock: 25,
    minStock: 10,
    supplier: 'Apple Brasil',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Samsung Galaxy S24',
    sku: 'SAM-GS24-256',
    category: 'Eletrônicos',
    price: 4999.99,
    cost: 3800.00,
    stock: 8,
    minStock: 15,
    supplier: 'Samsung Brasil',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: '3',
    name: 'MacBook Air M3',
    sku: 'APL-MBA-M3-512',
    category: 'Computadores',
    price: 12999.99,
    cost: 10200.00,
    stock: 12,
    minStock: 5,
    supplier: 'Apple Brasil',
    createdAt: new Date('2024-01-20'),
  },
];

const generateMockSales = (): Sale[] => [
  {
    id: '1',
    productId: '1',
    productName: 'iPhone 15 Pro',
    quantity: 2,
    unitPrice: 6999.99,
    total: 13999.98,
    customer: 'João Silva',
    date: new Date('2024-01-25'),
    status: 'completed',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Samsung Galaxy S24',
    quantity: 1,
    unitPrice: 4999.99,
    total: 4999.99,
    customer: 'Maria Santos',
    date: new Date('2024-01-26'),
    status: 'completed',
  },
  {
    id: '3',
    productId: '3',
    productName: 'MacBook Air M3',
    quantity: 1,
    unitPrice: 12999.99,
    total: 12999.99,
    customer: 'Pedro Costa',
    date: new Date('2024-01-27'),
    status: 'pending',
  },
];

const generateMockPurchases = (): Purchase[] => [
  {
    id: '1',
    productId: '1',
    productName: 'iPhone 15 Pro',
    quantity: 50,
    unitCost: 5500.00,
    total: 275000.00,
    supplier: 'Apple Brasil',
    date: new Date('2024-01-10'),
    status: 'received',
  },
  {
    id: '2',
    productId: '2',
    productName: 'Samsung Galaxy S24',
    quantity: 30,
    unitCost: 3800.00,
    total: 114000.00,
    supplier: 'Samsung Brasil',
    date: new Date('2024-01-28'),
    status: 'pending',
  },
];

const generateMockCustomers = (): Customer[] => [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@email.com',
    phone: '(11) 99999-9999',
    company: 'Silva Tech',
    totalPurchases: 13999.98,
    lastPurchase: new Date('2024-01-25'),
    status: 'active',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@email.com',
    phone: '(11) 88888-8888',
    totalPurchases: 4999.99,
    lastPurchase: new Date('2024-01-26'),
    status: 'active',
  },
  {
    id: '3',
    name: 'Pedro Costa',
    email: 'pedro@email.com',
    phone: '(11) 77777-7777',
    company: 'Costa Ltda',
    totalPurchases: 12999.99,
    lastPurchase: new Date('2024-01-27'),
    status: 'active',
  },
];

const generateMockInsights = (): AIInsight[] => [
  {
    id: '1',
    type: 'alert',
    title: 'Estoque Baixo',
    message: 'Samsung Galaxy S24 está com estoque abaixo do mínimo',
    priority: 'high',
    category: 'Estoque',
    date: new Date(),
  },
  {
    id: '2',
    type: 'prediction',
    title: 'Previsão de Vendas',
    message: 'Baseado no histórico, você deve vender 15 unidades esta semana',
    priority: 'medium',
    category: 'Vendas',
    date: new Date(),
  },
  {
    id: '3',
    type: 'optimization',
    title: 'Otimização de Preços',
    message: 'Considere ajustar o preço do iPhone 15 Pro para aumentar a margem',
    priority: 'low',
    category: 'Financeiro',
    date: new Date(),
  },
];

export const useData = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setProducts(generateMockProducts());
      setSales(generateMockSales());
      setPurchases(generateMockPurchases());
      setCustomers(generateMockCustomers());
      setAiInsights(generateMockInsights());
      setLoading(false);
    }, 1000);
  }, []);

  return {
    products,
    sales,
    purchases,
    customers,
    aiInsights,
    loading,
    setProducts,
    setSales,
    setPurchases,
    setCustomers,
    setAiInsights,
  };
};
