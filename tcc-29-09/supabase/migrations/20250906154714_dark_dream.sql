/*
  # Insert sample data for STOKLY ERP

  1. Sample Data
    - Products (iPhone, Samsung, MacBook)
    - Customers (João, Maria, Pedro)
    - Sales transactions
    - Purchase orders
    - AI insights

  2. Purpose
    - Populate database with realistic test data
    - Demonstrate system functionality
    - Enable immediate testing
*/

-- Insert sample products
INSERT INTO products (name, sku, category, price, cost, stock, min_stock, supplier) VALUES
('iPhone 15 Pro', 'APL-IP15P-128', 'Eletrônicos', 6999.99, 5500.00, 25, 10, 'Apple Brasil'),
('Samsung Galaxy S24', 'SAM-GS24-256', 'Eletrônicos', 4999.99, 3800.00, 8, 15, 'Samsung Brasil'),
('MacBook Air M3', 'APL-MBA-M3-512', 'Computadores', 12999.99, 10200.00, 12, 5, 'Apple Brasil'),
('AirPods Pro', 'APL-APP-PRO', 'Acessórios', 1999.99, 1400.00, 30, 20, 'Apple Brasil'),
('Galaxy Watch 6', 'SAM-GW6-44', 'Acessórios', 1899.99, 1300.00, 15, 10, 'Samsung Brasil');

-- Insert sample customers
INSERT INTO customers (name, email, phone, company, total_purchases, last_purchase, status) VALUES
('João Silva', 'joao@email.com', '(11) 99999-9999', 'Silva Tech', 13999.98, now() - interval '5 days', 'active'),
('Maria Santos', 'maria@email.com', '(11) 88888-8888', 'Inovação Digital', 4999.99, now() - interval '3 days', 'active'),
('Pedro Costa', 'pedro@email.com', '(11) 77777-7777', 'Costa Ltda', 12999.99, now() - interval '1 day', 'active'),
('Ana Oliveira', 'ana@email.com', '(11) 66666-6666', '', 1999.99, now() - interval '10 days', 'active');

-- Insert sample sales (using product and customer IDs)
WITH product_data AS (
  SELECT id, name FROM products WHERE sku IN ('APL-IP15P-128', 'SAM-GS24-256', 'APL-MBA-M3-512', 'APL-APP-PRO')
),
customer_data AS (
  SELECT id, name FROM customers WHERE email IN ('joao@email.com', 'maria@email.com', 'pedro@email.com', 'ana@email.com')
)
INSERT INTO sales (product_id, customer_id, quantity, unit_price, status, created_at) 
SELECT 
  p.id,
  c.id,
  CASE 
    WHEN p.name = 'iPhone 15 Pro' THEN 2
    WHEN p.name = 'Samsung Galaxy S24' THEN 1
    WHEN p.name = 'MacBook Air M3' THEN 1
    ELSE 1
  END,
  CASE 
    WHEN p.name = 'iPhone 15 Pro' THEN 6999.99
    WHEN p.name = 'Samsung Galaxy S24' THEN 4999.99
    WHEN p.name = 'MacBook Air M3' THEN 12999.99
    WHEN p.name = 'AirPods Pro' THEN 1999.99
  END,
  'completed',
  now() - interval '1 day' * (random() * 30)
FROM product_data p
CROSS JOIN customer_data c
WHERE (p.name = 'iPhone 15 Pro' AND c.name = 'João Silva')
   OR (p.name = 'Samsung Galaxy S24' AND c.name = 'Maria Santos')
   OR (p.name = 'MacBook Air M3' AND c.name = 'Pedro Costa')
   OR (p.name = 'AirPods Pro' AND c.name = 'Ana Oliveira');

-- Insert sample purchases
WITH product_data AS (
  SELECT id, name FROM products WHERE sku IN ('APL-IP15P-128', 'SAM-GS24-256', 'APL-MBA-M3-512')
)
INSERT INTO purchases (product_id, quantity, unit_cost, supplier, status, created_at)
SELECT 
  p.id,
  CASE 
    WHEN p.name = 'iPhone 15 Pro' THEN 50
    WHEN p.name = 'Samsung Galaxy S24' THEN 30
    WHEN p.name = 'MacBook Air M3' THEN 20
  END,
  CASE 
    WHEN p.name = 'iPhone 15 Pro' THEN 5500.00
    WHEN p.name = 'Samsung Galaxy S24' THEN 3800.00
    WHEN p.name = 'MacBook Air M3' THEN 10200.00
  END,
  CASE 
    WHEN p.name LIKE '%Apple%' OR p.name LIKE '%iPhone%' OR p.name LIKE '%MacBook%' THEN 'Apple Brasil'
    WHEN p.name LIKE '%Samsung%' THEN 'Samsung Brasil'
    ELSE 'Fornecedor Geral'
  END,
  CASE 
    WHEN random() > 0.7 THEN 'received'
    ELSE 'pending'
  END,
  now() - interval '1 day' * (random() * 15)
FROM product_data p;

-- Insert sample AI insights
INSERT INTO ai_insights (type, title, message, priority, category, is_read) VALUES
('alert', 'Estoque Baixo Detectado', 'Samsung Galaxy S24 está com estoque abaixo do mínimo recomendado. Sugerimos reposição imediata.', 'high', 'Estoque', false),
('prediction', 'Previsão de Vendas', 'Com base no histórico, prevemos 18 vendas na próxima semana com 87% de confiança.', 'medium', 'Vendas', false),
('optimization', 'Oportunidade de Margem', 'Ajustar preço do iPhone 15 Pro pode aumentar margem em 12% sem impactar vendas.', 'medium', 'Financeiro', false),
('suggestion', 'Novo Fornecedor', 'Identificamos fornecedor alternativo para AirPods Pro com 8% de economia.', 'low', 'Compras', true),
('alert', 'Meta de Vendas', 'Você está 23% acima da meta mensal. Excelente performance!', 'low', 'Vendas', false);
