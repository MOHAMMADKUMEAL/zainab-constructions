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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      agreement_payments: {
        Row: {
          agreement_id: string
          amount: number
          created_at: string
          id: string
          notes: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          user_id: string
        }
        Insert: {
          agreement_id: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          user_id?: string
        }
        Update: {
          agreement_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agreement_payments_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "property_agreements"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["expense_category"]
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string
          plot_length: number | null
          plot_width: number | null
          project_id: string
          rate_per_sqft: number | null
          user_id: string
        }
        Insert: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string
          plot_length?: number | null
          plot_width?: number | null
          project_id: string
          rate_per_sqft?: number | null
          user_id?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["expense_category"]
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string
          plot_length?: number | null
          plot_width?: number | null
          project_id?: string
          rate_per_sqft?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_investors: {
        Row: {
          amount: number
          created_at: string
          id: string
          investment_id: string
          investor_name: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          investment_id: string
          investor_name: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          investment_id?: string
          investor_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_investors_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          created_at: string
          id: string
          location: string
          notes: string
          purchase_amount: number
          purchase_date: string | null
          sold_amount: number | null
          sold_date: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string
          notes?: string
          purchase_amount?: number
          purchase_date?: string | null
          sold_amount?: number | null
          sold_date?: string | null
          title: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          location?: string
          notes?: string
          purchase_amount?: number
          purchase_date?: string | null
          sold_amount?: number | null
          sold_date?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          direction: string
          expense_id: string | null
          id: string
          notes: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          project_id: string
          screenshot_path: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          direction?: string
          expense_id?: string | null
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          project_id: string
          screenshot_path?: string
          user_id?: string
        }
        Update: {
          amount?: number
          created_at?: string
          direction?: string
          expense_id?: string | null
          id?: string
          notes?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          project_id?: string
          screenshot_path?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_notes: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_notes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          budget: number
          client_name: string
          created_at: string
          id: string
          location: string
          notes: string
          phone: string
          project_name: string
          start_date: string | null
          status: Database["public"]["Enums"]["project_status"]
          user_id: string
        }
        Insert: {
          budget?: number
          client_name?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string
          phone?: string
          project_name: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          user_id?: string
        }
        Update: {
          budget?: number
          client_name?: string
          created_at?: string
          id?: string
          location?: string
          notes?: string
          phone?: string
          project_name?: string
          start_date?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          user_id?: string
        }
        Relationships: []
      }
      property_agreements: {
        Row: {
          agreement_date: string
          created_at: string
          description: string
          document_path: string
          id: string
          investment_id: string | null
          notes: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          property_name: string
          total_amount: number
          user_id: string
        }
        Insert: {
          agreement_date?: string
          created_at?: string
          description?: string
          document_path?: string
          id?: string
          investment_id?: string | null
          notes?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          property_name: string
          total_amount?: number
          user_id?: string
        }
        Update: {
          agreement_date?: string
          created_at?: string
          description?: string
          document_path?: string
          id?: string
          investment_id?: string | null
          notes?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          property_name?: string
          total_amount?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_agreements_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      expense_category:
        | "material"
        | "labour"
        | "plumber"
        | "electrician"
        | "painter"
        | "tiles"
        | "transport"
        | "other"
        | "goundi"
        | "shentring_mestri"
        | "tiles_fitter"
        | "tiles_material"
      payment_method: "cash" | "upi" | "bank_transfer" | "cheque"
      project_status: "planning" | "running" | "completed" | "on_hold"
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
    Enums: {
      expense_category: [
        "material",
        "labour",
        "plumber",
        "electrician",
        "painter",
        "tiles",
        "transport",
        "other",
        "goundi",
        "shentring_mestri",
        "tiles_fitter",
        "tiles_material",
      ],
      payment_method: ["cash", "upi", "bank_transfer", "cheque"],
      project_status: ["planning", "running", "completed", "on_hold"],
    },
  },
} as const
