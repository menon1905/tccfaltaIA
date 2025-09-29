/*
  # Update RLS Policies for User Data Isolation

  1. Security Changes
    - Update all RLS policies to filter data by authenticated user
    - Ensure each user can only access their own data
    - Remove anonymous access policies for production security

  2. Tables Updated
    - products: Only show products created by the authenticated user
    - customers: Only show customers created by the authenticated user  
    - sales: Only show sales created by the authenticated user
    - purchases: Only show purchases created by the authenticated user
    - ai_insights: Only show insights for the authenticated user

  3. User Identification
    - Uses auth.uid() to identify the current user
    - Adds user_id column to tables that don't have it
*/

-- Add user_id columns to tables that don't have them
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE customers ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE sales ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE ai_insights ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update existing records to have the current user_id (for development)
-- In production, this should be done more carefully
UPDATE products SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE customers SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE sales SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE purchases SET user_id = auth.uid() WHERE user_id IS NULL;
UPDATE ai_insights SET user_id = auth.uid() WHERE user_id IS NULL;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow anon users to select products" ON products;
DROP POLICY IF EXISTS "Allow anon users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to select products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to delete products" ON products;

DROP POLICY IF EXISTS "Allow anon users to select customers" ON customers;
DROP POLICY IF EXISTS "Allow anon users to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to select customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to insert customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to update customers" ON customers;
DROP POLICY IF EXISTS "Allow authenticated users to delete customers" ON customers;

DROP POLICY IF EXISTS "Allow anon users to select sales" ON sales;
DROP POLICY IF EXISTS "Allow anon users to insert sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to select sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to insert sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to update sales" ON sales;
DROP POLICY IF EXISTS "Allow authenticated users to delete sales" ON sales;

DROP POLICY IF EXISTS "Allow anon users to select purchases" ON purchases;
DROP POLICY IF EXISTS "Allow anon users to insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to select purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to insert purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to update purchases" ON purchases;
DROP POLICY IF EXISTS "Allow authenticated users to delete purchases" ON purchases;

DROP POLICY IF EXISTS "Allow anon users to select ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Allow anon users to insert ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Allow authenticated users to select ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Allow authenticated users to insert ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Allow authenticated users to update ai_insights" ON ai_insights;
DROP POLICY IF EXISTS "Allow authenticated users to delete ai_insights" ON ai_insights;

-- Create new user-isolated policies for PRODUCTS
CREATE POLICY "Users can view own products"
  ON products FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new user-isolated policies for CUSTOMERS
CREATE POLICY "Users can view own customers"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own customers"
  ON customers FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new user-isolated policies for SALES
CREATE POLICY "Users can view own sales"
  ON sales FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales"
  ON sales FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales"
  ON sales FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales"
  ON sales FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new user-isolated policies for PURCHASES
CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON purchases FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own purchases"
  ON purchases FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own purchases"
  ON purchases FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create new user-isolated policies for AI_INSIGHTS
CREATE POLICY "Users can view own ai_insights"
  ON ai_insights FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ai_insights"
  ON ai_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ai_insights"
  ON ai_insights FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ai_insights"
  ON ai_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to automatically set user_id on insert
CREATE OR REPLACE FUNCTION set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically set user_id
DROP TRIGGER IF EXISTS set_user_id_products ON products;
CREATE TRIGGER set_user_id_products
  BEFORE INSERT ON products
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_customers ON customers;
CREATE TRIGGER set_user_id_customers
  BEFORE INSERT ON customers
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_sales ON sales;
CREATE TRIGGER set_user_id_sales
  BEFORE INSERT ON sales
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_purchases ON purchases;
CREATE TRIGGER set_user_id_purchases
  BEFORE INSERT ON purchases
  FOR EACH ROW EXECUTE FUNCTION set_user_id();

DROP TRIGGER IF EXISTS set_user_id_ai_insights ON ai_insights;
CREATE TRIGGER set_user_id_ai_insights
  BEFORE INSERT ON ai_insights
  FOR EACH ROW EXECUTE FUNCTION set_user_id();
