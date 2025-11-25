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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      academy_applications: {
        Row: {
          application_name: string
          course_id: string | null
          course_name: string
          created_at: string | null
          created_by: string | null
          description: string | null
          duration: string
          id: string
          updated_at: string | null
        }
        Insert: {
          application_name: string
          course_id?: string | null
          course_name: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          application_name?: string
          course_id?: string | null
          course_name?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_applications_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_complaints: {
        Row: {
          complaint_from: string | null
          complaint_text: string
          complaint_to: string | null
          created_at: string | null
          date: string
          id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          complaint_from?: string | null
          complaint_text: string
          complaint_to?: string | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          complaint_from?: string | null
          complaint_text?: string
          complaint_to?: string | null
          created_at?: string | null
          date?: string
          id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_complaints_complaint_from_fkey"
            columns: ["complaint_from"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_complaints_complaint_to_fkey"
            columns: ["complaint_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_daily_work_updates: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string | null
          id: string
          updated_at: string | null
          work_description: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          updated_at?: string | null
          work_description: string
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string | null
          id?: string
          updated_at?: string | null
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_daily_work_updates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_payments: {
        Row: {
          amount: number
          batch_id: string | null
          course_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          payment_code: string
          payment_date: string
          payment_method: string | null
          status: Database["public"]["Enums"]["payment_status"] | null
          student_id: string | null
        }
        Insert: {
          amount: number
          batch_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code: string
          payment_date?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
        }
        Update: {
          amount?: number
          batch_id?: string | null
          course_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_code?: string
          payment_date?: string
          payment_method?: string | null
          status?: Database["public"]["Enums"]["payment_status"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_payments_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_payments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          balance: number | null
          created_at: string | null
          entity_id: string
          id: string
          parent_account_id: string | null
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          balance?: number | null
          created_at?: string | null
          entity_id: string
          id?: string
          parent_account_id?: string | null
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          balance?: number | null
          created_at?: string | null
          entity_id?: string
          id?: string
          parent_account_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "accounts_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          entity_id: string | null
          id: string
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          id?: string
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          entity_id: string | null
          expires_at: string | null
          id: string
          priority: string | null
          published_at: string | null
          published_by: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          entity_id?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          entity_id?: string | null
          expires_at?: string | null
          id?: string
          priority?: string | null
          published_at?: string | null
          published_by?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_assignments: {
        Row: {
          asset_id: string
          assigned_date: string
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          returned_date: string | null
        }
        Insert: {
          asset_id: string
          assigned_date: string
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          returned_date?: string | null
        }
        Update: {
          asset_id?: string
          assigned_date?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          returned_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_assignments_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_maintenance: {
        Row: {
          asset_id: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          maintenance_date: string
          maintenance_type: string
          performed_by: string | null
        }
        Insert: {
          asset_id: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_date: string
          maintenance_type: string
          performed_by?: string | null
        }
        Update: {
          asset_id?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          maintenance_date?: string
          maintenance_type?: string
          performed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_maintenance_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          asset_code: string
          category: string
          created_at: string | null
          current_value: number | null
          entity_id: string
          id: string
          location: string | null
          name: string
          purchase_cost: number | null
          purchase_date: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          asset_code: string
          category: string
          created_at?: string | null
          current_value?: number | null
          entity_id: string
          id?: string
          location?: string | null
          name: string
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          asset_code?: string
          category?: string
          created_at?: string | null
          current_value?: number | null
          entity_id?: string
          id?: string
          location?: string | null
          name?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      batches: {
        Row: {
          batch_code: string
          batch_name: string
          course_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          max_students: number | null
          schedule: string | null
          start_date: string
          status: Database["public"]["Enums"]["status_type"] | null
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          batch_code: string
          batch_name: string
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_students?: number | null
          schedule?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["status_type"] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          batch_code?: string
          batch_name?: string
          course_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          max_students?: number | null
          schedule?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "batches_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "it_trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          address: string | null
          category: string | null
          contact_info: string | null
          created_at: string | null
          full_name: string
          id: string
        }
        Insert: {
          address?: string | null
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          full_name: string
          id?: string
        }
        Update: {
          address?: string | null
          category?: string | null
          contact_info?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          allocated_amount: number
          category: string
          created_at: string | null
          entity_id: string
          fiscal_year: number
          id: string
          spent_amount: number | null
        }
        Insert: {
          allocated_amount: number
          category: string
          created_at?: string | null
          entity_id: string
          fiscal_year: number
          id?: string
          spent_amount?: number | null
        }
        Update: {
          allocated_amount?: number
          category?: string
          created_at?: string | null
          entity_id?: string
          fiscal_year?: number
          id?: string
          spent_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      bugs: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          project_id: string
          reported_by: string | null
          severity: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          project_id?: string
          reported_by?: string | null
          severity?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bugs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "it_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bugs_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          batch_id: string | null
          certificate_number: string
          course_id: string | null
          created_at: string | null
          id: string
          issue_date: string
          status: Database["public"]["Enums"]["status_type"] | null
          student_id: string | null
        }
        Insert: {
          batch_id?: string | null
          certificate_number: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          issue_date: string
          status?: Database["public"]["Enums"]["status_type"] | null
          student_id?: string | null
        }
        Update: {
          batch_id?: string | null
          certificate_number?: string
          course_id?: string | null
          created_at?: string | null
          id?: string
          issue_date?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          capacity: number | null
          class_name: string
          course_id: string
          created_at: string | null
          end_date: string | null
          id: string
          instructor_id: string | null
          schedule: string | null
          start_date: string
        }
        Insert: {
          capacity?: number | null
          class_name: string
          course_id: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          schedule?: string | null
          start_date: string
        }
        Update: {
          capacity?: number | null
          class_name?: string
          course_id?: string
          created_at?: string | null
          end_date?: string | null
          id?: string
          instructor_id?: string | null
          schedule?: string | null
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "classes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      consultancy_clients: {
        Row: {
          address: string | null
          client_code: string
          company_name: string
          contact_person: string
          created_at: string | null
          email: string | null
          id: string
          industry: string | null
          phone: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          address?: string | null
          client_code: string
          company_name: string
          contact_person: string
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          address?: string | null
          client_code?: string
          company_name?: string
          contact_person?: string
          created_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      consultancy_projects: {
        Row: {
          budget: number | null
          client_id: string
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_code: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"] | null
        }
        Insert: {
          budget?: number | null
          client_id: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_code: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"] | null
        }
        Update: {
          budget?: number | null
          client_id?: string
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_code?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "consultancy_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consultancy_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          client_id: string
          contract_number: string
          contract_value: number
          created_at: string | null
          end_date: string
          id: string
          project_id: string | null
          start_date: string
          status: Database["public"]["Enums"]["status_type"] | null
          terms: string | null
        }
        Insert: {
          client_id: string
          contract_number: string
          contract_value: number
          created_at?: string | null
          end_date: string
          id?: string
          project_id?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["status_type"] | null
          terms?: string | null
        }
        Update: {
          client_id?: string
          contract_number?: string
          contract_value?: number
          created_at?: string | null
          end_date?: string
          id?: string
          project_id?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          terms?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "consultancy_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "consultancy_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      coordinators: {
        Row: {
          category_name: string
          coordinator_name: string
          created_at: string | null
          description: string | null
          entity_id: string
          id: string
          updated_at: string | null
        }
        Insert: {
          category_name: string
          coordinator_name: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          id?: string
          updated_at?: string | null
        }
        Update: {
          category_name?: string
          coordinator_name?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coordinators_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          certification_available: boolean | null
          course_code: string
          course_level: string | null
          created_at: string | null
          description: string | null
          duration_weeks: number | null
          entity_id: string | null
          fees: number | null
          id: string
          name: string
          prerequisites: string[] | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          certification_available?: boolean | null
          course_code: string
          course_level?: string | null
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          entity_id?: string | null
          fees?: number | null
          id?: string
          name: string
          prerequisites?: string[] | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          certification_available?: boolean | null
          course_code?: string
          course_level?: string | null
          created_at?: string | null
          description?: string | null
          duration_weeks?: number | null
          entity_id?: string | null
          fees?: number | null
          id?: string
          name?: string
          prerequisites?: string[] | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      crops: {
        Row: {
          created_at: string | null
          crop_name: string
          harvest_season: string | null
          id: string
          planting_season: string | null
          variety: string | null
        }
        Insert: {
          created_at?: string | null
          crop_name: string
          harvest_season?: string | null
          id?: string
          planting_season?: string | null
          variety?: string | null
        }
        Update: {
          created_at?: string | null
          crop_name?: string
          harvest_season?: string | null
          id?: string
          planting_season?: string | null
          variety?: string | null
        }
        Relationships: []
      }
      daily_work_updates: {
        Row: {
          created_at: string | null
          date: string
          employee_id: string | null
          hours_spent: number
          id: string
          is_reviewed: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["work_status"]
          updated_at: string | null
          user_id: string
          work_description: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          employee_id?: string | null
          hours_spent: number
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          updated_at?: string | null
          user_id: string
          work_description: string
        }
        Update: {
          created_at?: string | null
          date?: string
          employee_id?: string | null
          hours_spent?: number
          id?: string
          is_reviewed?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["work_status"]
          updated_at?: string | null
          user_id?: string
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_work_updates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_widgets: {
        Row: {
          configuration: Json | null
          created_at: string | null
          id: string
          position: number | null
          user_id: string
          widget_type: string
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          position?: number | null
          user_id: string
          widget_type: string
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          id?: string
          position?: number | null
          user_id?: string
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_widgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          created_at: string | null
          deliverable_name: string
          description: string | null
          due_date: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          created_at?: string | null
          deliverable_name: string
          description?: string | null
          due_date: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          created_at?: string | null
          deliverable_name?: string
          description?: string | null
          due_date?: string
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "consultancy_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          entity_id: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          name: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          name?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          created_at: string | null
          donation_date: string
          donor_email: string | null
          donor_name: string
          donor_phone: string | null
          id: string
          notes: string | null
          project_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          donation_date: string
          donor_email?: string | null
          donor_name: string
          donor_phone?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          donation_date?: string
          donor_email?: string | null
          donor_name?: string
          donor_phone?: string | null
          id?: string
          notes?: string | null
          project_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "foundation_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_functions: {
        Row: {
          assigned_date: string | null
          created_at: string | null
          employee_id: string
          function: Database["public"]["Enums"]["employee_function"]
          id: string
          is_primary: boolean | null
          updated_at: string | null
        }
        Insert: {
          assigned_date?: string | null
          created_at?: string | null
          employee_id: string
          function: Database["public"]["Enums"]["employee_function"]
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
        }
        Update: {
          assigned_date?: string | null
          created_at?: string | null
          employee_id?: string
          function?: Database["public"]["Enums"]["employee_function"]
          id?: string
          is_primary?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_functions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          additional_entity_id: string | null
          created_at: string | null
          department_id: string | null
          employee_code: string
          entity_id: string
          hire_date: string
          id: string
          position_id: string | null
          profile_id: string
          residence_type: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          additional_entity_id?: string | null
          created_at?: string | null
          department_id?: string | null
          employee_code: string
          entity_id: string
          hire_date: string
          id?: string
          position_id?: string | null
          profile_id: string
          residence_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          additional_entity_id?: string | null
          created_at?: string | null
          department_id?: string | null
          employee_code?: string
          entity_id?: string
          hire_date?: string
          id?: string
          position_id?: string | null
          profile_id?: string
          residence_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_additional_entity_id_fkey"
            columns: ["additional_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          class_id: string
          created_at: string | null
          enrollment_date: string
          id: string
          status: Database["public"]["Enums"]["status_type"] | null
          student_id: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          enrollment_date: string
          id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          student_id: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          enrollment_date?: string
          id?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      entities: {
        Row: {
          code: Database["public"]["Enums"]["entity_code"]
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          name: string
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          code: Database["public"]["Enums"]["entity_code"]
          color: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          name: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          code?: Database["public"]["Enums"]["entity_code"]
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_id: string
          expense_date: string
          id: string
          receipt_url: string | null
        }
        Insert: {
          amount: number
          approved_by?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_id: string
          expense_date: string
          id?: string
          receipt_url?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_id?: string
          expense_date?: string
          id?: string
          receipt_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_activities: {
        Row: {
          activity_date: string
          activity_type: string
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          performed_by: string | null
          plot_id: string
        }
        Insert: {
          activity_date: string
          activity_type: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          plot_id: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          performed_by?: string | null
          plot_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_activities_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_activities_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_equipment: {
        Row: {
          created_at: string | null
          equipment_name: string
          equipment_type: string
          id: string
          purchase_date: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          created_at?: string | null
          equipment_name: string
          equipment_type: string
          id?: string
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          created_at?: string | null
          equipment_name?: string
          equipment_type?: string
          id?: string
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      farm_plots: {
        Row: {
          area_hectares: number
          created_at: string | null
          id: string
          location: string | null
          name: string
          plot_code: string
          soil_type: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          area_hectares: number
          created_at?: string | null
          id?: string
          location?: string | null
          name: string
          plot_code: string
          soil_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          area_hectares?: number
          created_at?: string | null
          id?: string
          location?: string | null
          name?: string
          plot_code?: string
          soil_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      foundation_projects: {
        Row: {
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          name: string
          project_code: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"] | null
          updated_at: string | null
        }
        Insert: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name: string
          project_code: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Update: {
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          name?: string
          project_code?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      grades: {
        Row: {
          assessment_date: string
          assessment_name: string
          created_at: string | null
          enrollment_id: string
          grade: string | null
          id: string
          max_score: number
          score: number | null
        }
        Insert: {
          assessment_date: string
          assessment_name: string
          created_at?: string | null
          enrollment_id: string
          grade?: string | null
          id?: string
          max_score: number
          score?: number | null
        }
        Update: {
          assessment_date?: string
          assessment_name?: string
          created_at?: string | null
          enrollment_id?: string
          grade?: string | null
          id?: string
          max_score?: number
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
        ]
      }
      harvests: {
        Row: {
          created_at: string | null
          crop_id: string
          harvest_date: string
          id: string
          plot_id: string
          quality_grade: string | null
          quantity: number
          unit: string
        }
        Insert: {
          created_at?: string | null
          crop_id: string
          harvest_date: string
          id?: string
          plot_id: string
          quality_grade?: string | null
          quantity: number
          unit: string
        }
        Update: {
          created_at?: string | null
          crop_id?: string
          harvest_date?: string
          id?: string
          plot_id?: string
          quality_grade?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "harvests_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      hostel_payments: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          payment_date: string
          payment_mode: string | null
          pending_amount: number
          received_amount: number
          received_by: string | null
          resident_id: string
          resident_type: string
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          pending_amount: number
          received_amount: number
          received_by?: string | null
          resident_id: string
          resident_type: string
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          payment_date?: string
          payment_mode?: string | null
          pending_amount?: number
          received_amount?: number
          received_by?: string | null
          resident_id?: string
          resident_type?: string
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      impact_metrics: {
        Row: {
          created_at: string | null
          id: string
          measurement_date: string
          metric_name: string
          metric_value: number
          notes: string | null
          project_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          measurement_date: string
          metric_name: string
          metric_value: number
          notes?: string | null
          project_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          measurement_date?: string
          metric_name?: string
          metric_value?: number
          notes?: string | null
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "foundation_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_candidates: {
        Row: {
          address: string | null
          course_id: string | null
          created_at: string | null
          duration_unit: string | null
          duration_value: number | null
          email: string | null
          fees: number | null
          gender: string | null
          id: string
          image_url: string | null
          incharge_person_id: string | null
          joining_date: string | null
          mode: string | null
          name: string
          password: string | null
          phone: string | null
          status: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          address?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          email?: string | null
          fees?: number | null
          gender?: string | null
          id?: string
          image_url?: string | null
          incharge_person_id?: string | null
          joining_date?: string | null
          mode?: string | null
          name: string
          password?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          address?: string | null
          course_id?: string | null
          created_at?: string | null
          duration_unit?: string | null
          duration_value?: number | null
          email?: string | null
          fees?: number | null
          gender?: string | null
          id?: string
          image_url?: string | null
          incharge_person_id?: string | null
          joining_date?: string | null
          mode?: string | null
          name?: string
          password?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "internship_candidates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internship_candidates_incharge_person_id_fkey"
            columns: ["incharge_person_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      internship_enquiries: {
        Row: {
          address: string | null
          college_name: string | null
          comments: string | null
          created_at: string | null
          department: string | null
          description: string | null
          email: string | null
          enquiry_date: string
          follow_status: string | null
          follow_up_date: string | null
          id: string
          mode_status: string | null
          name: string
          passout_year: string | null
          phone: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          college_name?: string | null
          comments?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          email?: string | null
          enquiry_date?: string
          follow_status?: string | null
          follow_up_date?: string | null
          id?: string
          mode_status?: string | null
          name: string
          passout_year?: string | null
          phone: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          college_name?: string | null
          comments?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          email?: string | null
          enquiry_date?: string
          follow_status?: string | null
          follow_up_date?: string | null
          id?: string
          mode_status?: string | null
          name?: string
          passout_year?: string | null
          phone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      internship_payments: {
        Row: {
          candidate_id: string | null
          created_at: string | null
          id: string
          notes: string | null
          paid_amount: number
          payment_date: string
          payment_mode: string | null
          pending_amount: number
          receipt_id: string
          received_by: string | null
          total_amount: number
        }
        Insert: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_amount: number
          payment_date?: string
          payment_mode?: string | null
          pending_amount: number
          receipt_id: string
          received_by?: string | null
          total_amount: number
        }
        Update: {
          candidate_id?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_date?: string
          payment_mode?: string | null
          pending_amount?: number
          receipt_id?: string
          received_by?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "internship_payments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "internship_candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          entity_id: string
          id: string
          item_code: string
          name: string
          reorder_level: number | null
          unit: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          id?: string
          item_code: string
          name: string
          reorder_level?: number | null
          unit: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          id?: string
          item_code?: string
          name?: string
          reorder_level?: number | null
          unit?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_locations: {
        Row: {
          address: string | null
          created_at: string | null
          entity_id: string
          id: string
          name: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          entity_id: string
          id?: string
          name: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          entity_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_locations_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string | null
          customer_name: string
          due_date: string
          entity_id: string
          id: string
          invoice_date: string
          invoice_number: string
          status: Database["public"]["Enums"]["payment_status"] | null
          subtotal: number
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          due_date: string
          entity_id: string
          id?: string
          invoice_date: string
          invoice_number: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          subtotal: number
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          due_date?: string
          entity_id?: string
          id?: string
          invoice_date?: string
          invoice_number?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      it_clients: {
        Row: {
          client_code: string
          company_name: string
          contact_person: string | null
          created_at: string | null
          email: string | null
          id: string
          phone: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          client_code: string
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          client_code?: string
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      it_projects: {
        Row: {
          client_id: string
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          name: string
          project_code: string
          start_date: string
          status: Database["public"]["Enums"]["project_status"] | null
          technology_stack: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name: string
          project_code: string
          start_date: string
          status?: Database["public"]["Enums"]["project_status"] | null
          technology_stack?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          name?: string
          project_code?: string
          start_date?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          technology_stack?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "it_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "it_clients"
            referencedColumns: ["id"]
          },
        ]
      }
      it_trainers: {
        Row: {
          created_at: string | null
          email: string | null
          employee_id: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_external: boolean | null
          phone: string | null
          specialization: string
          status: Database["public"]["Enums"]["status_type"] | null
          trainer_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          full_name: string
          hourly_rate?: number | null
          id?: string
          is_external?: boolean | null
          phone?: string | null
          specialization: string
          status?: Database["public"]["Enums"]["status_type"] | null
          trainer_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_external?: boolean | null
          phone?: string | null
          specialization?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          trainer_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "it_trainers_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_definitions: {
        Row: {
          created_at: string | null
          description: string | null
          entity_id: string | null
          id: string
          kpi_name: string
          target_value: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          kpi_name: string
          target_value?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          kpi_name?: string
          target_value?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kpi_definitions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      kpi_values: {
        Row: {
          created_at: string | null
          id: string
          kpi_id: string
          measurement_date: string
          notes: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          kpi_id: string
          measurement_date: string
          notes?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          id?: string
          kpi_id?: string
          measurement_date?: string
          notes?: string | null
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "kpi_values_kpi_id_fkey"
            columns: ["kpi_id"]
            isOneToOne: false
            referencedRelation: "kpi_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock: {
        Row: {
          animal_type: string
          breed: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          plot_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          tag_number: string
        }
        Insert: {
          animal_type: string
          breed?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          plot_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          tag_number: string
        }
        Update: {
          animal_type?: string
          breed?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          plot_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          tag_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "livestock_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "farm_plots"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          created_at: string | null
          id: string
          machine_code: string
          name: string
          production_line_id: string | null
          purchase_date: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          machine_code: string
          name: string
          production_line_id?: string | null
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          machine_code?: string
          name?: string
          production_line_id?: string | null
          purchase_date?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "machines_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          completed_date: string | null
          created_at: string | null
          id: string
          machine_id: string
          maintenance_type: string
          notes: string | null
          scheduled_date: string
        }
        Insert: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          machine_id: string
          maintenance_type: string
          notes?: string | null
          scheduled_date: string
        }
        Update: {
          completed_date?: string | null
          created_at?: string | null
          id?: string
          machine_id?: string
          maintenance_type?: string
          notes?: string | null
          scheduled_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_details: {
        Row: {
          created_at: string | null
          date: string
          hours: string
          id: string
          meeting_for: string
          participants: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          hours: string
          id?: string
          meeting_for: string
          participants: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          hours?: string
          id?: string
          meeting_for?: string
          participants?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          created_at: string | null
          id: string
          read: boolean | null
          recipient_id: string
          sender_id: string
          subject: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id: string
          sender_id: string
          subject?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          recipient_id?: string
          sender_id?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          product_id: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "trading_products"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll: {
        Row: {
          allowances: number | null
          basic_salary: number
          created_at: string | null
          deductions: number | null
          employee_id: string
          id: string
          net_salary: number
          payment_date: string | null
          period_end: string
          period_start: string
          status: Database["public"]["Enums"]["payment_status"] | null
        }
        Insert: {
          allowances?: number | null
          basic_salary: number
          created_at?: string | null
          deductions?: number | null
          employee_id: string
          id?: string
          net_salary: number
          payment_date?: string | null
          period_end: string
          period_start: string
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Update: {
          allowances?: number | null
          basic_salary?: number
          created_at?: string | null
          deductions?: number | null
          employee_id?: string
          id?: string
          net_salary?: number
          payment_date?: string | null
          period_end?: string
          period_start?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          department_id: string | null
          description: string | null
          entity_id: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          entity_id: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          description?: string | null
          entity_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "positions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      production_lines: {
        Row: {
          capacity_per_hour: number | null
          created_at: string | null
          description: string | null
          id: string
          line_code: string
          name: string
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          capacity_per_hour?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          line_code: string
          name: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          capacity_per_hour?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          line_code?: string
          name?: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      production_orders: {
        Row: {
          completion_date: string | null
          created_at: string | null
          id: string
          order_number: string
          product_name: string
          production_line_id: string
          quantity: number
          start_date: string
          status: Database["public"]["Enums"]["order_status"] | null
        }
        Insert: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          order_number: string
          product_name: string
          production_line_id: string
          quantity: number
          start_date: string
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Update: {
          completion_date?: string | null
          created_at?: string | null
          id?: string
          order_number?: string
          product_name?: string
          production_line_id?: string
          quantity?: number
          start_date?: string
          status?: Database["public"]["Enums"]["order_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "production_orders_production_line_id_fkey"
            columns: ["production_line_id"]
            isOneToOne: false
            referencedRelation: "production_lines"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          dob: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          primary_entity_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          primary_entity_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          dob?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          primary_entity_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_primary_entity_id_fkey"
            columns: ["primary_entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: string
          expected_delivery: string | null
          id: string
          order_date: string
          po_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          supplier_id: string
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id: string
          expected_delivery?: string | null
          id?: string
          order_date: string
          po_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id: string
          total_amount: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string
          expected_delivery?: string | null
          id?: string
          order_date?: string
          po_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          supplier_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_checks: {
        Row: {
          check_date: string
          created_at: string | null
          id: string
          inspector_id: string | null
          notes: string | null
          pass_fail: string
          production_order_id: string
        }
        Insert: {
          check_date: string
          created_at?: string | null
          id?: string
          inspector_id?: string | null
          notes?: string | null
          pass_fail: string
          production_order_id: string
        }
        Update: {
          check_date?: string
          created_at?: string | null
          id?: string
          inspector_id?: string | null
          notes?: string | null
          pass_fail?: string
          production_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quality_checks_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quality_checks_production_order_id_fkey"
            columns: ["production_order_id"]
            isOneToOne: false
            referencedRelation: "production_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          created_at: string | null
          id: string
          material_code: string
          name: string
          reorder_level: number | null
          stock_quantity: number | null
          unit: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          material_code: string
          name: string
          reorder_level?: number | null
          stock_quantity?: number | null
          unit: string
        }
        Update: {
          created_at?: string | null
          id?: string
          material_code?: string
          name?: string
          reorder_level?: number | null
          stock_quantity?: number | null
          unit?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: string | null
          id: string
          parameters: Json | null
          report_name: string
          report_type: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          id?: string
          parameters?: Json | null
          report_name: string
          report_type: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string | null
          id?: string
          parameters?: Json | null
          report_name?: string
          report_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      repositories: {
        Row: {
          created_at: string | null
          id: string
          platform: string | null
          project_id: string
          repo_name: string
          repo_url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          platform?: string | null
          project_id: string
          repo_name: string
          repo_url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          platform?: string | null
          project_id?: string
          repo_name?: string
          repo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "repositories_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "it_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      retail_locations: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          location_name: string
          manager_id: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          location_name: string
          manager_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          location_name?: string
          manager_id?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "retail_locations_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          role_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          role_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      roriri_all_enquiries: {
        Row: {
          category: string | null
          created_at: string | null
          date: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      roriri_project_details: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          duration_unit: string
          duration_value: number
          id: string
          project_name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          duration_unit: string
          duration_value: number
          id?: string
          project_name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          duration_unit?: string
          duration_value?: number
          id?: string
          project_name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roriri_project_details_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roriri_project_details_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      roriri_project_enquiry: {
        Row: {
          client_name: string
          company: string | null
          created_at: string | null
          date: string
          enquiry_code: string
          enquiry_for: string
          id: string
          phone: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          client_name: string
          company?: string | null
          created_at?: string | null
          date?: string
          enquiry_code: string
          enquiry_for: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          client_name?: string
          company?: string | null
          created_at?: string | null
          date?: string
          enquiry_code?: string
          enquiry_for?: string
          id?: string
          phone?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_orders: {
        Row: {
          created_at: string | null
          customer_id: string
          delivery_date: string | null
          id: string
          order_date: string
          order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          delivery_date?: string | null
          id?: string
          order_date: string
          order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          delivery_date?: string | null
          id?: string
          order_date?: string
          order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "sales_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "trading_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          hourly_rate: number | null
          id: string
          service_name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          service_name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          hourly_rate?: number | null
          id?: string
          service_name?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier: string | null
          created_at: string | null
          delivery_address: string | null
          id: string
          order_id: string
          shipment_date: string
          status: string | null
          tracking_number: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          order_id: string
          shipment_date: string
          status?: string | null
          tracking_number?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string | null
          delivery_address?: string | null
          id?: string
          order_id?: string
          shipment_date?: string
          status?: string | null
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "sales_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      sports_events: {
        Row: {
          created_at: string | null
          description: string | null
          event_date: string
          event_name: string
          event_type: string
          id: string
          location: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_date: string
          event_name: string
          event_type: string
          id?: string
          location?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
        }
        Relationships: []
      }
      sports_teams: {
        Row: {
          coach_id: string | null
          created_at: string | null
          id: string
          sport_type: string
          team_name: string
        }
        Insert: {
          coach_id?: string | null
          created_at?: string | null
          id?: string
          sport_type: string
          team_name: string
        }
        Update: {
          coach_id?: string | null
          created_at?: string | null
          id?: string
          sport_type?: string
          team_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sports_teams_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          created_at: string | null
          end_date: string
          goals: string | null
          id: string
          project_id: string
          sprint_number: number
          start_date: string
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          created_at?: string | null
          end_date: string
          goals?: string | null
          id?: string
          project_id: string
          sprint_number: number
          start_date: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          created_at?: string | null
          end_date?: string
          goals?: string | null
          id?: string
          project_id?: string
          sprint_number?: number
          start_date?: string
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "it_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          item_id: string
          location_id: string
          movement_type: string
          notes: string | null
          quantity: number
          reference_number: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id: string
          location_id: string
          movement_type: string
          notes?: string | null
          quantity: number
          reference_number?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          item_id?: string
          location_id?: string
          movement_type?: string
          notes?: string | null
          quantity?: number
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "inventory_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          enrollment_date: string
          full_name: string
          gender: string | null
          guardian_name: string | null
          guardian_phone: string | null
          id: string
          password: string | null
          phone: string | null
          residence_type: string | null
          status: Database["public"]["Enums"]["status_type"] | null
          student_code: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrollment_date: string
          full_name: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          password?: string | null
          phone?: string | null
          residence_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          student_code: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          enrollment_date?: string
          full_name?: string
          gender?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          id?: string
          password?: string | null
          phone?: string | null
          residence_type?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
          student_code?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subjects: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          hours: number | null
          id: string
          status: string
          subject_code: string
          subject_name: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          status?: string
          subject_code: string
          subject_name: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          hours?: number | null
          id?: string
          status?: string
          subject_code?: string
          subject_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subjects_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          created_at: string | null
          email: string | null
          entity_id: string
          id: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          entity_id: string
          id?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string | null
          entity_id?: string
          id?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          learning_objectives: string | null
          pdf_url: string | null
          resources: string | null
          subject_id: string
          topic: string
          updated_at: string | null
          week_number: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          learning_objectives?: string | null
          pdf_url?: string | null
          resources?: string | null
          subject_id: string
          topic: string
          updated_at?: string | null
          week_number: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          learning_objectives?: string | null
          pdf_url?: string | null
          resources?: string | null
          subject_id?: string
          topic?: string
          updated_at?: string | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string | null
          id: string
          priority: string | null
          project_id: string
          sprint_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          project_id: string
          sprint_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          priority?: string | null
          project_id?: string
          sprint_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "it_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      timesheets: {
        Row: {
          billable: boolean | null
          created_at: string | null
          description: string | null
          employee_id: string
          hours_worked: number
          id: string
          project_id: string
          work_date: string
        }
        Insert: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          employee_id: string
          hours_worked: number
          id?: string
          project_id: string
          work_date: string
        }
        Update: {
          billable?: boolean | null
          created_at?: string | null
          description?: string | null
          employee_id?: string
          hours_worked?: number
          id?: string
          project_id?: string
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "timesheets_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timesheets_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "consultancy_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_customers: {
        Row: {
          address: string | null
          created_at: string | null
          customer_code: string
          customer_type: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_code: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_code?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
      trading_products: {
        Row: {
          category: string
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          product_code: string
          status: Database["public"]["Enums"]["status_type"] | null
          stock_quantity: number | null
          unit_price: number
        }
        Insert: {
          category: string
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          product_code: string
          status?: Database["public"]["Enums"]["status_type"] | null
          stock_quantity?: number | null
          unit_price: number
        }
        Update: {
          category?: string
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          product_code?: string
          status?: Database["public"]["Enums"]["status_type"] | null
          stock_quantity?: number | null
          unit_price?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          created_at: string | null
          created_by: string | null
          description: string | null
          entity_id: string
          id: string
          reference_number: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          account_id: string
          amount: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_id: string
          id?: string
          reference_number?: string | null
          transaction_date: string
          transaction_type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          account_id?: string
          amount?: number
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          entity_id?: string
          id?: string
          reference_number?: string | null
          transaction_date?: string
          transaction_type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          entity_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_tasks: {
        Row: {
          assigned_by: string | null
          assigned_to: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          entity_id: string | null
          id: string
          priority: Database["public"]["Enums"]["task_priority"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entity_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_by?: string | null
          assigned_to?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          entity_id?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["task_priority"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_tasks_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "entities"
            referencedColumns: ["id"]
          },
        ]
      }
      volunteers: {
        Row: {
          availability: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          skills: string | null
          status: Database["public"]["Enums"]["status_type"] | null
        }
        Insert: {
          availability?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          skills?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Update: {
          availability?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          skills?: string | null
          status?: Database["public"]["Enums"]["status_type"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_entity_access: {
        Args: { _entity_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "admin"
        | "manager"
        | "staff"
        | "viewer"
        | "trainer"
        | "trainee"
        | "hr"
        | "developer"
      employee_function:
        | "administrator"
        | "trainer"
        | "developer"
        | "supervisor"
        | "director"
        | "labor"
        | "system_admin"
        | "devops_engineer"
        | "accountant"
        | "hr_specialist"
        | "business_development"
        | "finance_specialist"
        | "marketing_specialist"
        | "project_manager"
        | "consultant"
        | "analyst"
        | "coordinator"
        | "specialist"
        | "engineer"
        | "technician"
      entity_code:
        | "academy"
        | "foundation"
        | "farm"
        | "consultancy"
        | "trading"
        | "automation"
        | "it_company"
        | "tours_travels"
        | "builders"
        | "it_academy"
      order_status:
        | "draft"
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      project_status:
        | "planning"
        | "in_progress"
        | "on_hold"
        | "completed"
        | "cancelled"
      status_type: "active" | "inactive" | "pending" | "archived"
      task_priority: "low" | "medium" | "high"
      task_status: "pending" | "in_progress" | "completed"
      transaction_type: "income" | "expense" | "transfer"
      work_status: "completed" | "in_progress" | "pending"
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
      app_role: [
        "admin",
        "manager",
        "staff",
        "viewer",
        "trainer",
        "trainee",
        "hr",
        "developer",
      ],
      employee_function: [
        "administrator",
        "trainer",
        "developer",
        "supervisor",
        "director",
        "labor",
        "system_admin",
        "devops_engineer",
        "accountant",
        "hr_specialist",
        "business_development",
        "finance_specialist",
        "marketing_specialist",
        "project_manager",
        "consultant",
        "analyst",
        "coordinator",
        "specialist",
        "engineer",
        "technician",
      ],
      entity_code: [
        "academy",
        "foundation",
        "farm",
        "consultancy",
        "trading",
        "automation",
        "it_company",
        "tours_travels",
        "builders",
        "it_academy",
      ],
      order_status: [
        "draft",
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      payment_status: ["pending", "paid", "overdue", "cancelled"],
      project_status: [
        "planning",
        "in_progress",
        "on_hold",
        "completed",
        "cancelled",
      ],
      status_type: ["active", "inactive", "pending", "archived"],
      task_priority: ["low", "medium", "high"],
      task_status: ["pending", "in_progress", "completed"],
      transaction_type: ["income", "expense", "transfer"],
      work_status: ["completed", "in_progress", "pending"],
    },
  },
} as const
