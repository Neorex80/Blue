/*
  # Create images table and sharing functionality

  1. New Tables
    - `generated_images`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `prompt` (text)
      - `image_url` (text)
      - `is_public` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `image_likes`
      - `id` (uuid, primary key)
      - `image_id` (uuid, references generated_images)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for CRUD operations
*/

-- Create generated_images table
CREATE TABLE generated_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  prompt text NOT NULL,
  image_url text NOT NULL,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create image_likes table
CREATE TABLE image_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_id uuid REFERENCES generated_images ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(image_id, user_id)
);

-- Enable RLS
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_likes ENABLE ROW LEVEL SECURITY;

-- Policies for generated_images
CREATE POLICY "Users can create their own images"
  ON generated_images FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own and public images"
  ON generated_images FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can update their own images"
  ON generated_images FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images"
  ON generated_images FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Policies for image_likes
CREATE POLICY "Users can like images"
  ON image_likes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view likes"
  ON image_likes FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Users can unlike images"
  ON image_likes FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Update function for generated_images
CREATE OR REPLACE FUNCTION update_generated_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for generated_images
CREATE TRIGGER update_generated_images_timestamp
BEFORE UPDATE ON generated_images
FOR EACH ROW
EXECUTE FUNCTION update_generated_images_updated_at();