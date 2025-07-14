export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          created_at: string
          description: string
          icon: string
          id: string
          rarity: string
          title: string
          xp_reward: number
        }
        Insert: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description: string
          icon?: string
          id?: string
          rarity?: string
          title: string
          xp_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          created_at?: string
          description?: string
          icon?: string
          id?: string
          rarity?: string
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      ai_conversations: {
        Row: {
          conversation_type: string | null
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          conversation_type?: string | null
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenges: {
        Row: {
          category: string
          created_at: string
          created_for_user: string | null
          description: string
          difficulty: string
          end_date: string
          id: string
          is_active: boolean
          start_date: string
          target_unit: string
          target_value: number
          title: string
          type: string
          updated_at: string
          xp_reward: number
        }
        Insert: {
          category?: string
          created_at?: string
          created_for_user?: string | null
          description: string
          difficulty?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_unit?: string
          target_value?: number
          title: string
          type?: string
          updated_at?: string
          xp_reward?: number
        }
        Update: {
          category?: string
          created_at?: string
          created_for_user?: string | null
          description?: string
          difficulty?: string
          end_date?: string
          id?: string
          is_active?: boolean
          start_date?: string
          target_unit?: string
          target_value?: number
          title?: string
          type?: string
          updated_at?: string
          xp_reward?: number
        }
        Relationships: []
      }
      forum_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      forum_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          category_id: string
          content: string
          created_at: string
          id: string
          is_closed: boolean | null
          is_pinned: boolean | null
          likes_count: number | null
          replies_count: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_closed?: boolean | null
          is_pinned?: boolean | null
          likes_count?: number | null
          replies_count?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_reply_likes: {
        Row: {
          created_at: string
          id: string
          reply_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reply_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reply_likes_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          email: string
          generated_images: string[] | null
          id: string
          payment_id: string | null
          payment_status: string | null
          selected_styles: string[]
          status: string
          updated_at: string | null
          uploaded_photos: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          generated_images?: string[] | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          selected_styles: string[]
          status?: string
          updated_at?: string | null
          uploaded_photos?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          generated_images?: string[] | null
          id?: string
          payment_id?: string | null
          payment_status?: string | null
          selected_styles?: string[]
          status?: string
          updated_at?: string | null
          uploaded_photos?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      plan_progress: {
        Row: {
          created_at: string
          id: number
          is_completed: boolean
          item_identifier: string
          plan_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_completed?: boolean
          item_identifier: string
          plan_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          is_completed?: boolean
          item_identifier?: string
          plan_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promoters: {
        Row: {
          company: string | null
          created_at: string
          deactivated_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          promoter_code: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          deactivated_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
          promoter_code: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          deactivated_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          promoter_code?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          affiliate_id: string | null
          conversion_date: string | null
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          conversion_date?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          conversion_date?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number | null
          asaas_customer_id: string | null
          created_at: string | null
          expires_at: string | null
          id: string
          payment_id: string | null
          payment_method: string | null
          referral_code: string | null
          referred_by_affiliate_id: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          asaas_customer_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          referral_code?: string | null
          referred_by_affiliate_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          asaas_customer_id?: string | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          payment_id?: string | null
          payment_method?: string | null
          referral_code?: string | null
          referred_by_affiliate_id?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string
          current_progress: number
          id: string
          is_completed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string
          current_progress?: number
          id?: string
          is_completed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_gamification: {
        Row: {
          achievements_unlocked: string[]
          best_streak: number
          created_at: string
          current_level: number
          current_streak: number
          fitness_category: string
          last_activity_date: string | null
          last_challenge_request: string | null
          total_workouts_completed: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_unlocked?: string[]
          best_streak?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          fitness_category?: string
          last_activity_date?: string | null
          last_challenge_request?: string | null
          total_workouts_completed?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_unlocked?: string[]
          best_streak?: number
          created_at?: string
          current_level?: number
          current_streak?: number
          fitness_category?: string
          last_activity_date?: string | null
          last_challenge_request?: string | null
          total_workouts_completed?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding_status: {
        Row: {
          completed_checklist_steps: string[]
          created_at: string
          dismissed_contextual_tips: string[]
          has_seen_tour: boolean
          hide_checklist: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_checklist_steps?: string[]
          created_at?: string
          dismissed_contextual_tips?: string[]
          has_seen_tour?: boolean
          hide_checklist?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_checklist_steps?: string[]
          created_at?: string
          dismissed_contextual_tips?: string[]
          has_seen_tour?: boolean
          hide_checklist?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          age: number | null
          created_at: string | null
          fitness_goals: Json | null
          fitness_level: string | null
          full_name: string | null
          gender: string | null
          health_conditions: Json | null
          height: number | null
          id: string
          preferences: Json | null
          updated_at: string | null
          user_id: string
          weight: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string | null
          fitness_goals?: Json | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          health_conditions?: Json | null
          height?: number | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id: string
          weight?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string | null
          fitness_goals?: Json | null
          fitness_level?: string | null
          full_name?: string | null
          gender?: string | null
          health_conditions?: Json | null
          height?: number | null
          id?: string
          preferences?: Json | null
          updated_at?: string | null
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          arm_circumference: number | null
          body_fat_percentage: number | null
          chest_circumference: number | null
          created_at: string | null
          date: string
          energy_level: number | null
          id: string
          muscle_mass: number | null
          notes: string | null
          photos: Json | null
          sleep_quality: number | null
          stress_level: number | null
          thigh_circumference: number | null
          user_id: string
          waist_circumference: number | null
          weight: number | null
          workout_intensity: number | null
          workout_plan_id: string | null
        }
        Insert: {
          arm_circumference?: number | null
          body_fat_percentage?: number | null
          chest_circumference?: number | null
          created_at?: string | null
          date: string
          energy_level?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          photos?: Json | null
          sleep_quality?: number | null
          stress_level?: number | null
          thigh_circumference?: number | null
          user_id: string
          waist_circumference?: number | null
          weight?: number | null
          workout_intensity?: number | null
          workout_plan_id?: string | null
        }
        Update: {
          arm_circumference?: number | null
          body_fat_percentage?: number | null
          chest_circumference?: number | null
          created_at?: string | null
          date?: string
          energy_level?: number | null
          id?: string
          muscle_mass?: number | null
          notes?: string | null
          photos?: Json | null
          sleep_quality?: number | null
          stress_level?: number | null
          thigh_circumference?: number | null
          user_id?: string
          waist_circumference?: number | null
          weight?: number | null
          workout_intensity?: number | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_workout_plans: {
        Row: {
          created_at: string
          id: string
          plan_data: Json
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          plan_data: Json
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          plan_data?: Json
          user_id?: string
        }
        Relationships: []
      }
      workout_plan_queue: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          estimated_completion_time: string | null
          id: string
          position_in_queue: number | null
          request_data: Json
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_time?: string | null
          id?: string
          position_in_queue?: number | null
          request_data: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          estimated_completion_time?: string | null
          id?: string
          position_in_queue?: number | null
          request_data?: Json
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          description: string | null
          difficulty_level: string | null
          duration_weeks: number | null
          exercises: Json
          id: string
          nutrition_tips: Json | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          exercises?: Json
          id?: string
          nutrition_tips?: Json | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_weeks?: number | null
          exercises?: Json
          id?: string
          nutrition_tips?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_to_workout_queue: {
        Args: { p_user_id: string; p_request_data: Json }
        Returns: {
          id: string
          status: string
          position_in_queue: number
        }[]
      }
      cleanup_expired_accounts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_user_queue_items: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_promoter_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_active_subscription: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      is_active_promoter: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      process_referral_conversion: {
        Args: { p_referred_user_id: string; p_subscription_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
