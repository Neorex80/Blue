/*
  # Add personas and likes schema

  1. Changes
    - Add is_public column to personas table
    - Create persona_likes table
    - Add policies for public personas and likes
*/

-- Add is_public to personas if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'personas' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE personas ADD COLUMN is_public boolean DEFAULT false;
  END IF;
END $$;

-- Create persona_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS persona_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  persona_id uuid REFERENCES personas ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(persona_id, user_id)
);

-- Enable RLS on persona_likes
ALTER TABLE persona_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and create new ones
DO $$ 
BEGIN
  -- Update personas policies
  DROP POLICY IF EXISTS "Users can view public personas" ON personas;
  DROP POLICY IF EXISTS "Users can like personas" ON persona_likes;
  DROP POLICY IF EXISTS "Users can view likes" ON persona_likes;
  DROP POLICY IF EXISTS "Users can unlike personas" ON persona_likes;
END $$;

-- Create new policies
CREATE POLICY "Users can view public personas"
  ON personas FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can like personas"
  ON persona_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view likes"
  ON persona_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can unlike personas"
  ON persona_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);