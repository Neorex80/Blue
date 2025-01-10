/*
  # Add personas and user settings

  1. New Tables
    - `personas`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `avatar_url` (text)
      - `system_prompt` (text)
      - `model` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    - `user_settings`
      - `user_id` (uuid, primary key, references auth.users)
      - `default_model` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes
    - Add `persona_id` column to `chats` table
    
  3. Security
    - Enable RLS on new tables
    - Add policies for authenticated users
*/

-- Create personas table
CREATE TABLE personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  avatar_url text NOT NULL,
  system_prompt text NOT NULL,
  model text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_settings table
CREATE TABLE user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  default_model text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add persona_id to chats
ALTER TABLE chats ADD COLUMN persona_id uuid REFERENCES personas(id);

-- Enable RLS
ALTER TABLE personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Policies for personas
CREATE POLICY "Users can create their own personas"
  ON personas FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own personas"
  ON personas FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own personas"
  ON personas FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personas"
  ON personas FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_settings
CREATE POLICY "Users can manage their own settings"
  ON user_settings FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update function for personas
CREATE OR REPLACE FUNCTION update_persona_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for personas
CREATE TRIGGER update_persona_timestamp
BEFORE UPDATE ON personas
FOR EACH ROW
EXECUTE FUNCTION update_persona_updated_at();

-- Update function for user_settings
CREATE OR REPLACE FUNCTION update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_settings
CREATE TRIGGER update_user_settings_timestamp
BEFORE UPDATE ON user_settings
FOR EACH ROW
EXECUTE FUNCTION update_user_settings_updated_at();