/*
  # Add Subscription System

  1. New Tables
    - `subscriptions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `plan` (text: 'free', 'pro', 'enterprise')
      - `status` (text: 'active', 'cancelled', 'expired')
      - `current_period_start` (timestamptz)
      - `current_period_end` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `rate_limits`
      - `user_id` (uuid, references auth.users)
      - `image_count` (integer)
      - `message_count` (integer)
      - `last_image_reset` (timestamptz)
      - `last_message_reset` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Functions
    - `check_rate_limit`: Checks if a user has exceeded their rate limit
    - `increment_rate_limit`: Increments the rate limit counter for a user
    - `reset_rate_limits`: Resets rate limits based on time intervals
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  plan text NOT NULL DEFAULT 'free',
  status text NOT NULL DEFAULT 'active',
  current_period_start timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz NOT NULL DEFAULT now() + interval '1 month',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_plan CHECK (plan IN ('free', 'pro', 'enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'cancelled', 'expired'))
);

-- Create rate_limits table
CREATE TABLE IF NOT EXISTS rate_limits (
  user_id uuid PRIMARY KEY REFERENCES auth.users,
  image_count integer DEFAULT 0,
  message_count integer DEFAULT 0,
  last_image_reset timestamptz DEFAULT now(),
  last_message_reset timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own rate limits"
  ON rate_limits FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id uuid,
  p_limit_type text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription record;
  v_rate_limit record;
  v_limit integer;
  v_reset_interval interval;
  v_last_reset timestamptz;
  v_count integer;
BEGIN
  -- Get user's subscription
  SELECT * INTO v_subscription
  FROM subscriptions
  WHERE user_id = p_user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- Set limits based on subscription plan
  IF p_limit_type = 'image' THEN
    CASE COALESCE(v_subscription.plan, 'free')
      WHEN 'free' THEN
        v_limit := 10;
        v_reset_interval := interval '12 hours';
      WHEN 'pro' THEN
        v_limit := 100;
        v_reset_interval := interval '24 hours';
      WHEN 'enterprise' THEN
        v_limit := -1; -- Unlimited
        v_reset_interval := interval '24 hours';
    END CASE;
  ELSE -- message
    CASE COALESCE(v_subscription.plan, 'free')
      WHEN 'free' THEN
        v_limit := 10;
        v_reset_interval := interval '1 hour';
      WHEN 'pro' THEN
        v_limit := -1; -- Unlimited
        v_reset_interval := interval '1 hour';
      WHEN 'enterprise' THEN
        v_limit := -1; -- Unlimited
        v_reset_interval := interval '1 hour';
    END CASE;
  END IF;

  -- Get or create rate limit record
  INSERT INTO rate_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT * INTO v_rate_limit
  FROM rate_limits
  WHERE user_id = p_user_id;

  -- Check if reset is needed
  IF p_limit_type = 'image' THEN
    v_last_reset := v_rate_limit.last_image_reset;
    v_count := v_rate_limit.image_count;
    
    IF now() - v_last_reset >= v_reset_interval THEN
      UPDATE rate_limits
      SET image_count = 0,
          last_image_reset = now()
      WHERE user_id = p_user_id;
      v_count := 0;
    END IF;
  ELSE
    v_last_reset := v_rate_limit.last_message_reset;
    v_count := v_rate_limit.message_count;
    
    IF now() - v_last_reset >= v_reset_interval THEN
      UPDATE rate_limits
      SET message_count = 0,
          last_message_reset = now()
      WHERE user_id = p_user_id;
      v_count := 0;
    END IF;
  END IF;

  -- Check if limit is reached
  RETURN json_build_object(
    'allowed', v_limit = -1 OR v_count < v_limit,
    'remaining', CASE WHEN v_limit = -1 THEN -1 ELSE v_limit - v_count END,
    'reset_time', v_last_reset + v_reset_interval
  );
END;
$$;

-- Create function to increment rate limit
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_user_id uuid,
  p_limit_type text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO rate_limits (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_limit_type = 'image' THEN
    UPDATE rate_limits
    SET image_count = image_count + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
  ELSE
    UPDATE rate_limits
    SET message_count = message_count + 1,
        updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  RETURN true;
END;
$$;

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limits_updated_at
  BEFORE UPDATE ON rate_limits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();