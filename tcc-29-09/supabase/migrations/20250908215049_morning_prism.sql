/*
  # Create employees table

  1. New Tables
    - `employees`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `email` (text, unique, required)
      - `phone` (text)
      - `position` (text, required)
      - `department` (text, required)
      - `salary` (numeric, required)
      - `hire_date` (date, required)
      - `address` (text)
      - `birth_date` (date)
      - `document_number` (text)
      - `status` (text, default 'active')
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `employees` table
    - Add policies for authenticated users to manage their own employees
    - Add trigger functions for automatic user_id and updated_at

  3. Constraints
    - Status must be one of: 'active', 'inactive', 'terminated'
    - Email must be unique
    - Foreign key relationship with auth.users
*/

-- Create the employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  position text NOT NULL,
  department text NOT NULL,
  salary numeric(10,2) NOT NULL DEFAULT 0,
  hire_date date NOT NULL,
  address text DEFAULT '',
  birth_date date,
  document_number text DEFAULT '',
  status text DEFAULT 'active' NOT NULL,
  user_id uuid DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT employees_status_check CHECK (status IN ('active', 'inactive', 'terminated'))
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'employees_user_id_fkey'
  ) THEN
    ALTER TABLE public.employees 
    ADD CONSTRAINT employees_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own employees"
  ON public.employees
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own employees"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own employees"
  ON public.employees
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own employees"
  ON public.employees
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create trigger function for setting user_id (if not exists)
CREATE OR REPLACE FUNCTION public.set_user_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.user_id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function for updating updated_at (if not exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'set_user_id_employees'
  ) THEN
    CREATE TRIGGER set_user_id_employees
      BEFORE INSERT ON public.employees
      FOR EACH ROW
      EXECUTE FUNCTION public.set_user_id();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_employees_updated_at'
  ) THEN
    CREATE TRIGGER update_employees_updated_at
      BEFORE UPDATE ON public.employees
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
