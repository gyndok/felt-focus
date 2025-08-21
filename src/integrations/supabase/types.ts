export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      feedback: {
        Row: {
          created_at: string
          id: string
          message: string
          reviewed_at: string | null
          reviewed_by: string | null
          type: string
          updated_at: string
          user_display_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          type: string
          updated_at?: string
          user_display_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          type?: string
          updated_at?: string
          user_display_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      poker_sessions: {
        Row: {
          buy_in: number
          cash_out: number
          created_at: string
          date: string
          duration: number
          end_time: string | null
          game_type: string
          id: string
          is_active: boolean | null
          location: string
          notes: string | null
          receipt_image_url: string | null
          stakes: string
          start_time: string | null
          started_at: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buy_in: number
          cash_out: number
          created_at?: string
          date?: string
          duration: number
          end_time?: string | null
          game_type: string
          id?: string
          is_active?: boolean | null
          location: string
          notes?: string | null
          receipt_image_url?: string | null
          stakes: string
          start_time?: string | null
          started_at?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buy_in?: number
          cash_out?: number
          created_at?: string
          date?: string
          duration?: number
          end_time?: string | null
          game_type?: string
          id?: string
          is_active?: boolean | null
          location?: string
          notes?: string | null
          receipt_image_url?: string | null
          stakes?: string
          start_time?: string | null
          started_at?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          starting_bankroll: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          starting_bankroll?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          starting_bankroll?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tournament_updates: {
        Row: {
          avg_stack: number | null
          bb_stack: number | null
          big_blind: number
          current_chips: number
          id: string
          level: number
          notes: string | null
          players_left: number | null
          small_blind: number
          timestamp: string
          tournament_id: string
        }
        Insert: {
          avg_stack?: number | null
          bb_stack?: number | null
          big_blind: number
          current_chips: number
          id?: string
          level: number
          notes?: string | null
          players_left?: number | null
          small_blind: number
          timestamp?: string
          tournament_id: string
        }
        Update: {
          avg_stack?: number | null
          bb_stack?: number | null
          big_blind?: number
          current_chips?: number
          id?: string
          level?: number
          notes?: string | null
          players_left?: number | null
          small_blind?: number
          timestamp?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_updates_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          avg_stack: number | null
          bb_stack: number | null
          big_blind: number
          buy_in: number
          created_at: string
          current_chips: number
          ended_at: string | null
          final_position: number | null
          game_type: string
          guarantee: number | null
          house_rake: number
          id: string
          is_paused: boolean
          level: number
          location: string | null
          name: string
          paused_at: string | null
          percent_paid: number | null
          players_left: number | null
          prize_won: number | null
          resumed_at: string | null
          small_blind: number
          started_at: string
          starting_chips: number
          status: string
          total_paused_duration: number | null
          total_players: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avg_stack?: number | null
          bb_stack?: number | null
          big_blind: number
          buy_in: number
          created_at?: string
          current_chips: number
          ended_at?: string | null
          final_position?: number | null
          game_type?: string
          guarantee?: number | null
          house_rake?: number
          id?: string
          is_paused?: boolean
          level?: number
          location?: string | null
          name: string
          paused_at?: string | null
          percent_paid?: number | null
          players_left?: number | null
          prize_won?: number | null
          resumed_at?: string | null
          small_blind: number
          started_at?: string
          starting_chips: number
          status?: string
          total_paused_duration?: number | null
          total_players?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avg_stack?: number | null
          bb_stack?: number | null
          big_blind?: number
          buy_in?: number
          created_at?: string
          current_chips?: number
          ended_at?: string | null
          final_position?: number | null
          game_type?: string
          guarantee?: number | null
          house_rake?: number
          id?: string
          is_paused?: boolean
          level?: number
          location?: string | null
          name?: string
          paused_at?: string | null
          percent_paid?: number | null
          players_left?: number | null
          prize_won?: number | null
          resumed_at?: string | null
          small_blind?: number
          started_at?: string
          starting_chips?: number
          status?: string
          total_paused_duration?: number | null
          total_players?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          tos_accepted_at: string | null
          tos_version: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          tos_accepted_at?: string | null
          tos_version?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          tos_accepted_at?: string | null
          tos_version?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_user_account: {
        Args: Record<PropertyKey, never> | { user_id_to_delete: string }
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
