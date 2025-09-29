/*
  # Create AI insights table

  1. New Tables
    - `ai_insights`
      - `id` (uuid, primary key)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `priority` (text)
      - `category` (text)
      - `is_read` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_insights` table
    - Add policy for authenticated users to manage AI insights
*/

CREATE TABLE IF NOT EXISTS ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('alert', 'suggestion', 'prediction', 'optimization')),
  title text NOT NULL,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  category text NOT NULL DEFAULT 'general',
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage AI insights"
  ON ai_insights
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE TRIGGER update_ai_insights_updated_at 
  BEFORE UPDATE ON ai_insights 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
