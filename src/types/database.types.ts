// Supabase generated types — regeneriraj nakon svake migracije:
// (iz Claude Code) mcp__supabase__generate_typescript_types
// (iz CLI)        npx supabase gen types typescript --project-id nezvlavmduedcaiaumgi > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string
          table_name: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id: string
          table_name: string
          tenant_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string
          table_name?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          created_at: string
          created_by: string | null
          department: string | null
          equipment_type: string
          has_increased_risk: boolean
          id: string
          inspection_document_url: string | null
          inspection_interval_days: number | null
          inventory_number: string | null
          last_inspection_date: string | null
          legal_ref_code: string | null
          location: string | null
          manufacturer: string | null
          model: string | null
          name: string
          next_inspection_date: string | null
          notes: string | null
          qr_code_token: string | null
          serial_number: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          year_manufactured: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          equipment_type: string
          has_increased_risk?: boolean
          id?: string
          inspection_document_url?: string | null
          inspection_interval_days?: number | null
          inventory_number?: string | null
          last_inspection_date?: string | null
          legal_ref_code?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name: string
          next_inspection_date?: string | null
          notes?: string | null
          qr_code_token?: string | null
          serial_number?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          year_manufactured?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          department?: string | null
          equipment_type?: string
          has_increased_risk?: boolean
          id?: string
          inspection_document_url?: string | null
          inspection_interval_days?: number | null
          inventory_number?: string | null
          last_inspection_date?: string | null
          legal_ref_code?: string | null
          location?: string | null
          manufacturer?: string | null
          model?: string | null
          name?: string
          next_inspection_date?: string | null
          notes?: string | null
          qr_code_token?: string | null
          serial_number?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          year_manufactured?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      health_checks: {
        Row: {
          check_date: string
          check_type: string
          created_at: string
          created_by: string | null
          doctor_name: string | null
          document_url: string | null
          id: string
          institution: string | null
          legal_ref_code: string | null
          next_check_date: string | null
          notes: string | null
          referral_url: string | null
          restrictions: string | null
          result: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          worker_id: string
        }
        Insert: {
          check_date: string
          check_type: string
          created_at?: string
          created_by?: string | null
          doctor_name?: string | null
          document_url?: string | null
          id?: string
          institution?: string | null
          legal_ref_code?: string | null
          next_check_date?: string | null
          notes?: string | null
          referral_url?: string | null
          restrictions?: string | null
          result: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          worker_id: string
        }
        Update: {
          check_date?: string
          check_type?: string
          created_at?: string
          created_by?: string | null
          doctor_name?: string | null
          document_url?: string | null
          id?: string
          institution?: string | null
          legal_ref_code?: string | null
          next_check_date?: string | null
          notes?: string | null
          referral_url?: string | null
          restrictions?: string | null
          result?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_checks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_checks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_references: {
        Row: {
          article: string | null
          code: string
          created_at: string
          deadline_days: number | null
          deadline_description: string | null
          description: string | null
          effective_date: string | null
          id: string
          is_active: boolean
          last_verified: string | null
          module_codes: string[]
          nn_number: string | null
          source_url: string | null
          superseded_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          article?: string | null
          code: string
          created_at?: string
          deadline_days?: number | null
          deadline_description?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean
          last_verified?: string | null
          module_codes?: string[]
          nn_number?: string | null
          source_url?: string | null
          superseded_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          article?: string | null
          code?: string
          created_at?: string
          deadline_days?: number | null
          deadline_description?: string | null
          description?: string | null
          effective_date?: string | null
          id?: string
          is_active?: boolean
          last_verified?: string | null
          module_codes?: string[]
          nn_number?: string | null
          source_url?: string | null
          superseded_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          legal_ref_code: string | null
          status: string
          tenant_id: string
          title: string
          updated_at: string
          worker_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          legal_ref_code?: string | null
          status?: string
          tenant_id: string
          title: string
          updated_at?: string
          worker_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          legal_ref_code?: string | null
          status?: string
          tenant_id?: string
          title?: string
          updated_at?: string
          worker_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          created_at: string
          id: string
          is_external_specialist: boolean
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_external_specialist?: boolean
          role?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_external_specialist?: boolean
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          employee_count: number
          id: string
          industry: string | null
          name: string
          oib: string | null
          plan: string
          slug: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          employee_count?: number
          id?: string
          industry?: string | null
          name: string
          oib?: string | null
          plan?: string
          slug: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          employee_count?: number
          id?: string
          industry?: string | null
          name?: string
          oib?: string | null
          plan?: string
          slug?: string
          status?: string
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      trainings: {
        Row: {
          certificate_number: string | null
          created_at: string
          created_by: string | null
          digital_signature_at: string | null
          digital_signature_token: string | null
          document_url: string | null
          id: string
          legal_ref_code: string | null
          location: string | null
          notes: string | null
          provider: string | null
          status: string
          tenant_id: string
          training_date: string
          training_name: string
          training_type: string
          updated_at: string
          updated_by: string | null
          valid_until: string | null
          worker_id: string
        }
        Insert: {
          certificate_number?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature_at?: string | null
          digital_signature_token?: string | null
          document_url?: string | null
          id?: string
          legal_ref_code?: string | null
          location?: string | null
          notes?: string | null
          provider?: string | null
          status?: string
          tenant_id: string
          training_date: string
          training_name: string
          training_type: string
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          worker_id: string
        }
        Update: {
          certificate_number?: string | null
          created_at?: string
          created_by?: string | null
          digital_signature_at?: string | null
          digital_signature_token?: string | null
          document_url?: string | null
          id?: string
          legal_ref_code?: string | null
          location?: string | null
          notes?: string | null
          provider?: string | null
          status?: string
          tenant_id?: string
          training_date?: string
          training_name?: string
          training_type?: string
          updated_at?: string
          updated_by?: string | null
          valid_until?: string | null
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trainings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trainings_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      work_positions: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          department: string | null
          description: string | null
          hazards: string[] | null
          id: string
          is_special_conditions: boolean
          location: string | null
          name: string
          protective_measures: string[] | null
          residual_risk_level: string | null
          risk_assessment_date: string | null
          risk_assessment_next: string | null
          special_conditions_type: string[] | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          hazards?: string[] | null
          id?: string
          is_special_conditions?: boolean
          location?: string | null
          name: string
          protective_measures?: string[] | null
          residual_risk_level?: string | null
          risk_assessment_date?: string | null
          risk_assessment_next?: string | null
          special_conditions_type?: string[] | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          department?: string | null
          description?: string | null
          hazards?: string[] | null
          id?: string
          is_special_conditions?: boolean
          location?: string | null
          name?: string
          protective_measures?: string[] | null
          residual_risk_level?: string | null
          risk_assessment_date?: string | null
          risk_assessment_next?: string | null
          special_conditions_type?: string[] | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_positions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          contract_type: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          department: string | null
          email: string | null
          employment_date: string | null
          first_name: string
          gender: string | null
          id: string
          is_special_conditions: boolean | null
          last_name: string
          location: string | null
          notes: string | null
          oib: string | null
          phone: string | null
          position_id: string | null
          status: string
          tenant_id: string
          termination_date: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employment_date?: string | null
          first_name: string
          gender?: string | null
          id?: string
          is_special_conditions?: boolean | null
          last_name: string
          location?: string | null
          notes?: string | null
          oib?: string | null
          phone?: string | null
          position_id?: string | null
          status?: string
          tenant_id: string
          termination_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          contract_type?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          department?: string | null
          email?: string | null
          employment_date?: string | null
          first_name?: string
          gender?: string | null
          id?: string
          is_special_conditions?: boolean | null
          last_name?: string
          location?: string | null
          notes?: string | null
          oib?: string | null
          phone?: string | null
          position_id?: string | null
          status?: string
          tenant_id?: string
          termination_date?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workers_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "work_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      znr_specialist_clients: {
        Row: {
          accepted_at: string | null
          critical_count: number
          id: string
          invited_at: string
          specialist_user_id: string
          status: string
          tenant_id: string
          tenant_name: string
          urgent_count: number
        }
        Insert: {
          accepted_at?: string | null
          critical_count?: number
          id?: string
          invited_at?: string
          specialist_user_id: string
          status?: string
          tenant_id: string
          tenant_name: string
          urgent_count?: number
        }
        Update: {
          accepted_at?: string | null
          critical_count?: number
          id?: string
          invited_at?: string
          specialist_user_id?: string
          status?: string
          tenant_id?: string
          tenant_name?: string
          urgent_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "znr_specialist_clients_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_tenant_ids: { Args: Record<string, never>; Returns: string[] }
      auth_tenant_role: { Args: { p_tenant_id: string }; Returns: string }
      create_tenant_with_owner: {
        Args: {
          p_address?: string
          p_city?: string
          p_employee_count?: number
          p_industry?: string
          p_name: string
          p_oib?: string
        }
        Returns: {
          address: string | null
          city: string | null
          created_at: string
          employee_count: number
          id: string
          industry: string | null
          name: string
          oib: string | null
          plan: string
          slug: string
          status: string
          trial_ends_at: string | null
          updated_at: string
        }
      }
      generate_tenant_slug: { Args: { p_name: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
