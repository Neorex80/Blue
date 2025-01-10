export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      chats: {
        Row: {
          id: string
          user_id: string
          title: string
          model: string
          persona_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          model: string
          persona_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          model?: string
          persona_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rate_limits: {
        Row: {
          user_id: string
          image_count: number
          message_count: number
          last_image_reset: string
          last_message_reset: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          image_count?: number
          message_count?: number
          last_image_reset?: string
          last_message_reset?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          image_count?: number
          message_count?: number
          last_image_reset?: string
          last_message_reset?: string
          created_at?: string
          updated_at?: string
        }
      }
      // ... (keep other existing types)
    }
    Functions: {
      check_rate_limit: {
        Args: { p_user_id: string; p_limit_type: string }
        Returns: { allowed: boolean; remaining: number; reset_time: string }
      }
      increment_rate_limit: {
        Args: { p_user_id: string; p_limit_type: string }
        Returns: boolean
      }
    }
  }
}