/*
  # Create purchases table

  1. New Tables
    - `purchases`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `quantity` (integer)
      - `unit_cost` (decimal)
      - `total` (decimal)
      - `supplier` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `purchases` table
    - Add policy for authenticated users to manage purchases

  3. Foreign Keys
    - Links to products table
*/

CREATE TABLE IF NOT EXISTS purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost decimal(10,2) NOT NULL DEFAULT 0,
  total decimal(10,2) NOT NULL DEFAULT 0,
  supplier text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'received', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage purchases"
  ON purchases
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_purchases_updated_at 
  BEFORE UPDATE ON purchases 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically calculate total
CREATE OR REPLACE FUNCTION calculate_purchase_total()
RETURNS TRIGGER AS $$
BEGIN
    NEW.total = NEW.quantity * NEW.unit_cost;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_purchases_total 
  BEFORE INSERT OR UPDATE ON purchases 
  FOR EACH ROW 
  EXECUTE FUNCTION calculate_purchase_total();
