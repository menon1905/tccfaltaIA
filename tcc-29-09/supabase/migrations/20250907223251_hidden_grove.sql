/*
  # Fix RLS Policies for Insert Operations

  1. Security Updates
    - Drop existing restrictive policies
    - Create new policies that allow INSERT operations for authenticated users
    - Ensure all tables have proper INSERT policies
    - Add policies for SELECT, UPDATE, DELETE operations as well

  2. Tables Updated
    - products: Allow all operations for authenticated users
    - customers: Allow all operations for authenticated users  
    - sales: Allow all operations for authenticated users
    - purchases: Allow all operations for authenticated users
    - ai_insights: Allow all operations for authenticated users
*/

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON products;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON customers;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON sales;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON purchases;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON ai_insights;

-- Products table policies
CREATE POLICY "Allow authenticated users to select products"
  ON products
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Customers table policies
CREATE POLICY "Allow authenticated users to select customers"
  ON customers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert customers"
  ON customers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update customers"
  ON customers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete customers"
  ON customers
  FOR DELETE
  TO authenticated
  USING (true);

-- Sales table policies
CREATE POLICY "Allow authenticated users to select sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (true);

-- Purchases table policies
CREATE POLICY "Allow authenticated users to select purchases"
  ON purchases
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert purchases"
  ON purchases
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update purchases"
  ON purchases
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete purchases"
  ON purchases
  FOR DELETE
  TO authenticated
  USING (true);

-- AI Insights table policies
CREATE POLICY "Allow authenticated users to select ai_insights"
  ON ai_insights
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert ai_insights"
  ON ai_insights
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update ai_insights"
  ON ai_insights
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete ai_insights"
  ON ai_insights
  FOR DELETE
  TO authenticated
  USING (true);

-- Also add policies for anon users in case we need them for development
CREATE POLICY "Allow anon users to select products"
  ON products
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert products"
  ON products
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to select customers"
  ON customers
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert customers"
  ON customers
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to select sales"
  ON sales
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert sales"
  ON sales
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to select purchases"
  ON purchases
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert purchases"
  ON purchases
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anon users to select ai_insights"
  ON ai_insights
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow anon users to insert ai_insights"
  ON ai_insights
  FOR INSERT
  TO anon
  WITH CHECK (true);
