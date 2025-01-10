/*
  # Update default model for user settings
  
  1. Changes
    - Updates the default value for default_model column in user_settings table
    - Updates existing records to use the new default model
  
  2. Notes
    - Safe migration that preserves existing data
    - Only updates default value and existing records
*/

-- Update existing records to use new default model
UPDATE user_settings 
SET default_model = 'mixtral-8x7b-32768'
WHERE default_model = 'gemma-7b-it';

-- Update the default value for new records
ALTER TABLE user_settings 
ALTER COLUMN default_model SET DEFAULT 'mixtral-8x7b-32768';