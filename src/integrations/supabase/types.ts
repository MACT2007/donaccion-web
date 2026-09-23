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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaigns: {
        Row: {
          accepts_goods: boolean
          category_id: string | null
          created_at: string
          description: string
          donors_count: number
          ends_at: string | null
          goal_amount: number
          id: string
          image_key: string
          is_featured: boolean
          is_urgent: boolean
          location: string
          organization: string
          raised_amount: number
          slug: string
          status: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          accepts_goods?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          donors_count?: number
          ends_at?: string | null
          goal_amount?: number
          id?: string
          image_key?: string
          is_featured?: boolean
          is_urgent?: boolean
          location?: string
          organization?: string
          raised_amount?: number
          slug: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
        }
        Update: {
          accepts_goods?: boolean
          category_id?: string | null
          created_at?: string
          description?: string
          donors_count?: number
          ends_at?: string | null
          goal_amount?: number
          id?: string
          image_key?: string
          is_featured?: boolean
          is_urgent?: boolean
          location?: string
          organization?: string
          raised_amount?: number
          slug?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          accent: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          needs: string[]
          slug: string
          sort_order: number
        }
        Insert: {
          accent?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name: string
          needs?: string[]
          slug: string
          sort_order?: number
        }
        Update: {
          accent?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          needs?: string[]
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string | null
          created_at: string
          donor_email: string
          donor_name: string
          goods_description: string
          id: string
          is_anonymous: boolean
          is_recurring: boolean
          kind: string
          message: string
          status: string
          user_id: string | null
        }
        Insert: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string
          donor_name?: string
          goods_description?: string
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          kind?: string
          message?: string
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string | null
          created_at?: string
          donor_email?: string
          donor_name?: string
          goods_description?: string
          id?: string
          is_anonymous?: boolean
          is_recurring?: boolean
          kind?: string
          message?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      drop_off_points: {
        Row: {
          address: string
          city: string
          hours: string
          id: string
          name: string
          phone: string
          sort_order: number
        }
        Insert: {
          address: string
          city: string
          hours?: string
          id?: string
          name: string
          phone?: string
          sort_order?: number
        }
        Update: {
          address?: string
          city?: string
          hours?: string
          id?: string
          name?: string
          phone?: string
          sort_order?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          id: string
          question: string
          sort_order: number
          topic: string
        }
        Insert: {
          answer: string
          id?: string
          question: string
          sort_order?: number
          topic?: string
        }
        Update: {
          answer?: string
          id?: string
          question?: string
          sort_order?: number
          topic?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          initials: string
          name: string
          quote: string
          role: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          initials?: string
          name: string
          quote: string
          role?: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          initials?: string
          name?: string
          quote?: string
          role?: string
          sort_order?: number
        }
        Relationships: []
      }
      transparency_reports: {
        Row: {
          admin_pct: number
          description: string
          fundraising_pct: number
          id: string
          programs_pct: number
          title: string
          total_beneficiaries: number
          total_raised: number
          year: number
        }
        Insert: {
          admin_pct?: number
          description?: string
          fundraising_pct?: number
          id?: string
          programs_pct?: number
          title: string
          total_beneficiaries?: number
          total_raised?: number
          year: number
        }
        Update: {
          admin_pct?: number
          description?: string
          fundraising_pct?: number
          id?: string
          programs_pct?: number
          title?: string
          total_beneficiaries?: number
          total_raised?: number
          year?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      volunteers: {
        Row: {
          availability: string
          city: string
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string
          skills: string
          user_id: string | null
        }
        Insert: {
          availability?: string
          city?: string
          created_at?: string
          email: string
          id?: string
          message?: string
          name: string
          phone?: string
          skills?: string
          user_id?: string | null
        }
        Update: {
          availability?: string
          city?: string
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string
          skills?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
