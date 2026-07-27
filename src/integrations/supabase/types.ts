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
      busquedas: {
        Row: {
          anos_experiencia: number | null
          cargo: string | null
          created_at: string
          descripcion_rol: string | null
          email: string | null
          empresa: string
          estado: string
          id: string
          industria_principal: string | null
          modalidad: string | null
          nombre_contacto: string | null
          num_vacantes: number | null
          posicion_buscada: string | null
          rango_salarial: string | null
          reporte_matches_ia: string | null
          seniority: string | null
          skills_deseables: string | null
          skills_requeridos: string | null
          telefono: string | null
          ubicacion: string | null
        }
        Insert: {
          anos_experiencia?: number | null
          cargo?: string | null
          created_at?: string
          descripcion_rol?: string | null
          email?: string | null
          empresa: string
          estado?: string
          id?: string
          industria_principal?: string | null
          modalidad?: string | null
          nombre_contacto?: string | null
          num_vacantes?: number | null
          posicion_buscada?: string | null
          rango_salarial?: string | null
          reporte_matches_ia?: string | null
          seniority?: string | null
          skills_deseables?: string | null
          skills_requeridos?: string | null
          telefono?: string | null
          ubicacion?: string | null
        }
        Update: {
          anos_experiencia?: number | null
          cargo?: string | null
          created_at?: string
          descripcion_rol?: string | null
          email?: string | null
          empresa?: string
          estado?: string
          id?: string
          industria_principal?: string | null
          modalidad?: string | null
          nombre_contacto?: string | null
          num_vacantes?: number | null
          posicion_buscada?: string | null
          rango_salarial?: string | null
          reporte_matches_ia?: string | null
          seniority?: string | null
          skills_deseables?: string | null
          skills_requeridos?: string | null
          telefono?: string | null
          ubicacion?: string | null
        }
        Relationships: []
      }
      candidatos: {
        Row: {
          anos_experiencia: number | null
          created_at: string
          email: string | null
          estado: string
          id: string
          industria_principal: string | null
          link_cv: string | null
          linkedin: string | null
          nombre_completo: string
          origen: string | null
          resumen_ia: string | null
          skills: string | null
          telefono: string | null
          ubicacion: string | null
        }
        Insert: {
          anos_experiencia?: number | null
          created_at?: string
          email?: string | null
          estado?: string
          id?: string
          industria_principal?: string | null
          link_cv?: string | null
          linkedin?: string | null
          nombre_completo: string
          origen?: string | null
          resumen_ia?: string | null
          skills?: string | null
          telefono?: string | null
          ubicacion?: string | null
        }
        Update: {
          anos_experiencia?: number | null
          created_at?: string
          email?: string | null
          estado?: string
          id?: string
          industria_principal?: string | null
          link_cv?: string | null
          linkedin?: string | null
          nombre_completo?: string
          origen?: string | null
          resumen_ia?: string | null
          skills?: string | null
          telefono?: string | null
          ubicacion?: string | null
        }
        Relationships: []
      }
      compras_guia: {
        Row: {
          comprobante_url: string | null
          created_at: string
          email: string | null
          enviado: boolean
          estado: string
          fecha: string
          id: string
          monto_bs: number | null
          nombre: string | null
          referencia_pago: string | null
          respuesta_envio: string | null
          telefono: string | null
        }
        Insert: {
          comprobante_url?: string | null
          created_at?: string
          email?: string | null
          enviado?: boolean
          estado?: string
          fecha?: string
          id?: string
          monto_bs?: number | null
          nombre?: string | null
          referencia_pago?: string | null
          respuesta_envio?: string | null
          telefono?: string | null
        }
        Update: {
          comprobante_url?: string | null
          created_at?: string
          email?: string | null
          enviado?: boolean
          estado?: string
          fecha?: string
          id?: string
          monto_bs?: number | null
          nombre?: string | null
          referencia_pago?: string | null
          respuesta_envio?: string | null
          telefono?: string | null
        }
        Relationships: []
      }
      damnificados: {
        Row: {
          categoria: string | null
          correo: string | null
          cv_link: string | null
          disponibilidad: string | null
          fecha_registro: string
          id: string
          nombre_completo: string | null
          que_sabe_hacer: string | null
          telefono: string | null
          zona_ubicacion: string | null
        }
        Insert: {
          categoria?: string | null
          correo?: string | null
          cv_link?: string | null
          disponibilidad?: string | null
          fecha_registro?: string
          id?: string
          nombre_completo?: string | null
          que_sabe_hacer?: string | null
          telefono?: string | null
          zona_ubicacion?: string | null
        }
        Update: {
          categoria?: string | null
          correo?: string | null
          cv_link?: string | null
          disponibilidad?: string | null
          fecha_registro?: string
          id?: string
          nombre_completo?: string | null
          que_sabe_hacer?: string | null
          telefono?: string | null
          zona_ubicacion?: string | null
        }
        Relationships: []
      }
      matching_results: {
        Row: {
          busqueda_id: string | null
          candidato_id: string | null
          created_at: string
          id: string
          nivel_match: string | null
        }
        Insert: {
          busqueda_id?: string | null
          candidato_id?: string | null
          created_at?: string
          id?: string
          nivel_match?: string | null
        }
        Update: {
          busqueda_id?: string | null
          candidato_id?: string | null
          created_at?: string
          id?: string
          nivel_match?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matching_results_busqueda_id_fkey"
            columns: ["busqueda_id"]
            isOneToOne: false
            referencedRelation: "busquedas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matching_results_candidato_id_fkey"
            columns: ["candidato_id"]
            isOneToOne: false
            referencedRelation: "candidatos"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string
          empresa_relacionada: string | null
          id: string
          nombre: string
          rating: number
          texto: string
          tipo: string
        }
        Insert: {
          created_at?: string
          empresa_relacionada?: string | null
          id?: string
          nombre: string
          rating: number
          texto: string
          tipo: string
        }
        Update: {
          created_at?: string
          empresa_relacionada?: string | null
          id?: string
          nombre?: string
          rating?: number
          texto?: string
          tipo?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
