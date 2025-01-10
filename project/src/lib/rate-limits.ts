import { supabase } from './supabase';

export async function checkRateLimit(limitType: 'image' | 'message'): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: Date;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('check_rate_limit', {
        p_user_id: user.id,
        p_limit_type: limitType
      });

    if (error) throw error;

    return {
      allowed: data.allowed,
      remaining: data.remaining,
      resetTime: new Date(data.reset_time)
    };
  } catch (error) {
    console.error('Error checking rate limit:', error);
    throw error;
  }
}

export async function incrementRateLimit(limitType: 'image' | 'message'): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('increment_rate_limit', {
        p_user_id: user.id,
        p_limit_type: limitType
      });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error incrementing rate limit:', error);
    throw error;
  }
}