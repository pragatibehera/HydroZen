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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          points: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          points?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      points_transactions: {
        Row: {
          id: string
          user_id: string
          points: number
          reason: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          points: number
          reason: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          points?: number
          reason?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          title: string
          description: string
          points: number
          icon: string | null
          condition_type: string
          condition_value: number
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          earned_at: string
        }
      }
      community_challenges: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          points: number
          status: string
        }
      }
      challenge_participants: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          joined_at: string
          completed_at: string | null
          points_earned: number
        }
      }
    }
    Functions: {
      get_community_stats: {
        Args: Record<string, never>
        Returns: {
          total_users: number
          total_water_saved: number
          total_leaks_reported: number
          total_challenges_completed: number
          top_savers: Json
        }
      }
    }
  }
}