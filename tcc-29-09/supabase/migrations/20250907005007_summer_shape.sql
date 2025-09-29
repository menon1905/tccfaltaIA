/*
  # Update RLS Policies for Development

  1. Security Updates
    - Update RLS policies to allow authenticated users
    - Add policies for all CRUD operations
    - Ensure proper access control

  2. Tables Updated
    - products: Allow authenticated users to manage products
    - customers: Allow authenticated users to manage customers  
    - sales: Allow authenticated users to manage sales
    - purchases: Allow authenticated users to manage purchases
    - ai_insights: Allow authenticated users to manage insights
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage products" ON products;
DROP POLICY IF EXISTS "Users can manage customers" ON customers;
DROP POLICY IF EXISTS "Users can manage sales" ON sales;
DROP POLICY IF EXISTS "Users can manage purchases" ON purchases;
DROP POLICY IF EXISTS "Users can manage AI insights" ON ai_insights;

-- Products policies
CREATE POLICY "Enable all operations for authenticated users" ON products
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Customers policies  
CREATE POLICY "Enable all operations for authenticated users" ON customers
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Sales policies
CREATE POLICY "Enable all operations for authenticated users" ON sales
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Purchases policies
CREATE POLICY "Enable all operations for authenticated users" ON purchases
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- AI Insights policies
CREATE POLICY "Enable all operations for authenticated users" ON ai_insights
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable anonymous access for development (optional)
-- Uncomment these if you want to allow anonymous access

-- CREATE POLICY "Enable all operations for anonymous users" ON products
--   FOR ALL TO anon
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable all operations for anonymous users" ON customers
--   FOR ALL TO anon
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable all operations for anonymous users" ON sales
--   FOR ALL TO anon
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable all operations for anonymous users" ON purchases
--   FOR ALL TO anon
--   USING (true)
--   WITH CHECK (true);

-- CREATE POLICY "Enable all operations for anonymous users" ON ai_insights
--   FOR ALL TO anon
--   USING (true)
--   WITH CHECK (true);
