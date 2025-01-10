/*
  # Add cascade delete for personas

  1. Changes
    - Update foreign key constraint on chats table to cascade delete when persona is deleted
    
  2. Security
    - Maintains existing RLS policies
*/

-- Drop existing foreign key constraint
ALTER TABLE chats 
DROP CONSTRAINT IF EXISTS chats_persona_id_fkey;

-- Add new constraint with cascade delete
ALTER TABLE chats
ADD CONSTRAINT chats_persona_id_fkey 
FOREIGN KEY (persona_id) 
REFERENCES personas(id) 
ON DELETE CASCADE;