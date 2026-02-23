/**
 * OCTAVE Allegro Risk Assessment Platform
 * Database Types - Generated from Supabase Schema
 */

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
      organizations: {
        Row: {
          id: string
          name: string
          description: string | null
          industry: string | null
          size: string | null
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          industry?: string | null
          size?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          industry?: string | null
          size?: string | null
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          first_name: string
          last_name: string
          email: string
          role: 'admin' | 'auditor' | 'auditee'
          department: string | null
          phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          first_name: string
          last_name: string
          email: string
          role: 'admin' | 'auditor' | 'auditee'
          department?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          first_name?: string
          last_name?: string
          email?: string
          role?: 'admin' | 'auditor' | 'viewer'
          department?: string | null
          phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          status: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step: number
          step_1_completed: boolean
          step_2_completed: boolean
          step_3_completed: boolean
          step_4_completed: boolean
          step_5_completed: boolean
          step_6_completed: boolean
          step_7_completed: boolean
          step_8_completed: boolean
          created_by: string
          assigned_to: string | null
          start_date: string | null
          target_completion_date: string | null
          actual_completion_date: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step?: number
          step_1_completed?: boolean
          step_2_completed?: boolean
          step_3_completed?: boolean
          step_4_completed?: boolean
          step_5_completed?: boolean
          step_6_completed?: boolean
          step_7_completed?: boolean
          step_8_completed?: boolean
          created_by: string
          assigned_to?: string | null
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          status?: 'draft' | 'in_progress' | 'completed' | 'archived'
          current_step?: number
          step_1_completed?: boolean
          step_2_completed?: boolean
          step_3_completed?: boolean
          step_4_completed?: boolean
          step_5_completed?: boolean
          step_6_completed?: boolean
          step_7_completed?: boolean
          step_8_completed?: boolean
          created_by?: string
          assigned_to?: string | null
          start_date?: string | null
          target_completion_date?: string | null
          actual_completion_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
      }
      risk_measurement_criteria: {
        Row: {
          id: string
          project_id: string
          financial_impact_1: string
          financial_impact_2: string
          financial_impact_3: string
          financial_impact_4: string
          financial_impact_5: string
          reputational_impact_1: string
          reputational_impact_2: string
          reputational_impact_3: string
          reputational_impact_4: string
          reputational_impact_5: string
          legal_impact_1: string
          legal_impact_2: string
          legal_impact_3: string
          legal_impact_4: string
          legal_impact_5: string
          operational_impact_1: string
          operational_impact_2: string
          operational_impact_3: string
          operational_impact_4: string
          operational_impact_5: string
          likelihood_1: string
          likelihood_2: string
          likelihood_3: string
          likelihood_4: string
          likelihood_5: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          financial_impact_1?: string
          financial_impact_2?: string
          financial_impact_3?: string
          financial_impact_4?: string
          financial_impact_5?: string
          reputational_impact_1?: string
          reputational_impact_2?: string
          reputational_impact_3?: string
          reputational_impact_4?: string
          reputational_impact_5?: string
          legal_impact_1?: string
          legal_impact_2?: string
          legal_impact_3?: string
          legal_impact_4?: string
          legal_impact_5?: string
          operational_impact_1?: string
          operational_impact_2?: string
          operational_impact_3?: string
          operational_impact_4?: string
          operational_impact_5?: string
          likelihood_1?: string
          likelihood_2?: string
          likelihood_3?: string
          likelihood_4?: string
          likelihood_5?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          financial_impact_1?: string
          financial_impact_2?: string
          financial_impact_3?: string
          financial_impact_4?: string
          financial_impact_5?: string
          reputational_impact_1?: string
          reputational_impact_2?: string
          reputational_impact_3?: string
          reputational_impact_4?: string
          reputational_impact_5?: string
          legal_impact_1?: string
          legal_impact_2?: string
          legal_impact_3?: string
          legal_impact_4?: string
          legal_impact_5?: string
          operational_impact_1?: string
          operational_impact_2?: string
          operational_impact_3?: string
          operational_impact_4?: string
          operational_impact_5?: string
          likelihood_1?: string
          likelihood_2?: string
          likelihood_3?: string
          likelihood_4?: string
          likelihood_5?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      assets: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          asset_type: 'data' | 'system' | 'application' | 'network' | 'physical' | 'service' | 'personnel'
          owner: string | null
          custodian: string | null
          classification: 'public' | 'internal' | 'confidential' | 'restricted' | null
          confidentiality_value: number | null
          integrity_value: number | null
          availability_value: number | null
          overall_criticality: number | null
          location: string | null
          retention_period: string | null
          financial_impact: number | null
          reputational_impact: number | null
          legal_impact: number | null
          operational_impact: number | null
          max_impact: number | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          asset_type: 'data' | 'system' | 'application' | 'network' | 'physical' | 'service' | 'personnel'
          owner?: string | null
          custodian?: string | null
          classification?: 'public' | 'internal' | 'confidential' | 'restricted' | null
          confidentiality_value?: number | null
          integrity_value?: number | null
          availability_value?: number | null
          location?: string | null
          retention_period?: string | null
          financial_impact?: number | null
          reputational_impact?: number | null
          legal_impact?: number | null
          operational_impact?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          asset_type?: 'data' | 'system' | 'application' | 'network' | 'physical' | 'service' | 'personnel'
          owner?: string | null
          custodian?: string | null
          classification?: 'public' | 'internal' | 'confidential' | 'restricted' | null
          confidentiality_value?: number | null
          integrity_value?: number | null
          availability_value?: number | null
          location?: string | null
          retention_period?: string | null
          financial_impact?: number | null
          reputational_impact?: number | null
          legal_impact?: number | null
          operational_impact?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
      }
      containers: {
        Row: {
          id: string
          project_id: string
          name: string
          description: string | null
          container_type: 'physical' | 'technical' | 'people' | 'process'
          location: string | null
          responsible_party: string | null
          security_controls: string | null
          created_by: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          description?: string | null
          container_type: 'physical' | 'technical' | 'people' | 'process'
          location?: string | null
          responsible_party?: string | null
          security_controls?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          description?: string | null
          container_type?: 'physical' | 'technical' | 'people' | 'process'
          location?: string | null
          responsible_party?: string | null
          security_controls?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
      }
      asset_container_mapping: {
        Row: {
          id: string
          asset_id: string
          container_id: string
          relationship_type: 'stored_in' | 'processed_in' | 'transmitted_via' | 'accessed_from'
          created_at: string
        }
        Insert: {
          id?: string
          asset_id: string
          container_id: string
          relationship_type?: 'stored_in' | 'processed_in' | 'transmitted_via' | 'accessed_from'
          created_at?: string
        }
        Update: {
          id?: string
          asset_id?: string
          container_id?: string
          relationship_type?: 'stored_in' | 'processed_in' | 'transmitted_via' | 'accessed_from'
          created_at?: string
        }
      }
      concerns: {
        Row: {
          id: string
          project_id: string
          container_id: string
          description: string
          concern_category: 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'operational' | null
          priority: 'low' | 'medium' | 'high'
          identified_by: string | null
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          container_id: string
          description: string
          concern_category?: 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'operational' | null
          priority?: 'low' | 'medium' | 'high'
          identified_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          container_id?: string
          description?: string
          concern_category?: 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'operational' | null
          priority?: 'low' | 'medium' | 'high'
          identified_by?: string | null
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      threat_scenarios: {
        Row: {
          id: string
          project_id: string
          concern_id: string
          asset_id: string
          container_id: string
          scenario_description: string
          threat_actor: string | null
          threat_actor_type: 'external_attacker' | 'internal_attacker' | 'competitor' | 'nation_state' | 'criminal' | 'terrorist' | 'activist' | 'insider' | 'accidental' | null
          threat_vector: string | null
          motivation: string | null
          capability: 'low' | 'medium' | 'high' | null
          likelihood: number | null
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          concern_id: string
          asset_id: string
          container_id: string
          scenario_description: string
          threat_actor?: string | null
          threat_actor_type?: 'external_attacker' | 'internal_attacker' | 'competitor' | 'nation_state' | 'criminal' | 'terrorist' | 'activist' | 'insider' | 'accidental' | null
          threat_vector?: string | null
          motivation?: string | null
          capability?: 'low' | 'medium' | 'high' | null
          likelihood?: number | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          concern_id?: string
          asset_id?: string
          container_id?: string
          scenario_description?: string
          threat_actor?: string | null
          threat_actor_type?: 'external_attacker' | 'internal_attacker' | 'competitor' | 'nation_state' | 'criminal' | 'terrorist' | 'activist' | 'insider' | 'accidental' | null
          threat_vector?: string | null
          motivation?: string | null
          capability?: 'low' | 'medium' | 'high' | null
          likelihood?: number | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      risks: {
        Row: {
          id: string
          project_id: string
          asset_id: string
          threat_scenario_id: string
          risk_title: string
          risk_description: string | null
          vulnerability_description: string
          likelihood: number
          impact: number
          risk_score: number
          risk_level: 'low' | 'medium' | 'high' | 'critical'
          financial_impact: number | null
          reputational_impact: number | null
          legal_impact: number | null
          operational_impact: number | null
          status: 'identified' | 'analyzed' | 'mitigating' | 'accepted' | 'transferred' | 'avoided' | 'closed'
          owner: string | null
          identified_by: string
          identified_at: string
          review_date: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          project_id: string
          asset_id: string
          threat_scenario_id: string
          risk_title: string
          risk_description?: string | null
          vulnerability_description: string
          likelihood: number
          impact: number
          financial_impact?: number | null
          reputational_impact?: number | null
          legal_impact?: number | null
          operational_impact?: number | null
          status?: 'identified' | 'analyzed' | 'mitigating' | 'accepted' | 'transferred' | 'avoided' | 'closed'
          owner?: string | null
          identified_by: string
          identified_at?: string
          review_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          project_id?: string
          asset_id?: string
          threat_scenario_id?: string
          risk_title?: string
          risk_description?: string | null
          vulnerability_description?: string
          likelihood?: number
          impact?: number
          financial_impact?: number | null
          reputational_impact?: number | null
          legal_impact?: number | null
          operational_impact?: number | null
          status?: 'identified' | 'analyzed' | 'mitigating' | 'accepted' | 'transferred' | 'avoided' | 'closed'
          owner?: string | null
          identified_by?: string
          identified_at?: string
          review_date?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          is_active?: boolean
        }
      }
      risk_analysis: {
        Row: {
          id: string
          risk_id: string
          project_id: string
          existing_controls: string | null
          control_effectiveness: number | null
          residual_likelihood: number | null
          residual_impact: number | null
          residual_risk_score: number | null
          root_cause_analysis: string | null
          potential_consequences: string | null
          affected_stakeholders: string | null
          analyzed_by: string
          analyzed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          risk_id: string
          project_id: string
          existing_controls?: string | null
          control_effectiveness?: number | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          root_cause_analysis?: string | null
          potential_consequences?: string | null
          affected_stakeholders?: string | null
          analyzed_by: string
          analyzed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          risk_id?: string
          project_id?: string
          existing_controls?: string | null
          control_effectiveness?: number | null
          residual_likelihood?: number | null
          residual_impact?: number | null
          root_cause_analysis?: string | null
          potential_consequences?: string | null
          affected_stakeholders?: string | null
          analyzed_by?: string
          analyzed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      mitigation_plans: {
        Row: {
          id: string
          risk_id: string
          project_id: string
          treatment_strategy: 'mitigate' | 'transfer' | 'accept' | 'avoid'
          mitigation_description: string
          priority: 'low' | 'medium' | 'high' | 'critical'
          estimated_cost: string | null
          implementation_timeline: string | null
          responsible_party: string | null
          status: 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled'
          planned_start_date: string | null
          planned_completion_date: string | null
          actual_start_date: string | null
          actual_completion_date: string | null
          effectiveness_rating: number | null
          lessons_learned: string | null
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          risk_id: string
          project_id: string
          treatment_strategy: 'mitigate' | 'transfer' | 'accept' | 'avoid'
          mitigation_description: string
          priority?: 'low' | 'medium' | 'high' | 'critical'
          estimated_cost?: string | null
          implementation_timeline?: string | null
          responsible_party?: string | null
          status?: 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled'
          planned_start_date?: string | null
          planned_completion_date?: string | null
          actual_start_date?: string | null
          actual_completion_date?: string | null
          effectiveness_rating?: number | null
          lessons_learned?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          risk_id?: string
          project_id?: string
          treatment_strategy?: 'mitigate' | 'transfer' | 'accept' | 'avoid'
          mitigation_description?: string
          priority?: 'low' | 'medium' | 'high' | 'critical'
          estimated_cost?: string | null
          implementation_timeline?: string | null
          responsible_party?: string | null
          status?: 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled'
          planned_start_date?: string | null
          planned_completion_date?: string | null
          actual_start_date?: string | null
          actual_completion_date?: string | null
          effectiveness_rating?: number | null
          lessons_learned?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          organization_id: string | null
          project_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          old_values: Json | null
          new_values: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          project_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          organization_id?: string | null
          project_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          old_values?: Json | null
          new_values?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: string
          project_id: string
          entity_type: string
          entity_id: string
          file_name: string
          file_type: string | null
          file_size: number | null
          storage_path: string
          uploaded_by: string
          created_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          entity_type: string
          entity_id: string
          file_name: string
          file_type?: string | null
          file_size?: number | null
          storage_path: string
          uploaded_by: string
          created_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          entity_type?: string
          entity_id?: string
          file_name?: string
          file_type?: string | null
          file_size?: number | null
          storage_path?: string
          uploaded_by?: string
          created_at?: string
          deleted_at?: string | null
        }
      }
      assessment_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          version_name: string | null
          change_summary: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          version_name?: string | null
          change_summary?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          version_number?: number
          version_name?: string | null
          change_summary?: string | null
          created_by?: string
          created_at?: string
        }
      }
      vulnerabilities: {
        Row: {
          id: string
          category: string
          name: string
          description: string | null
          suggested_impact: number | null
          suggested_likelihood: number | null
          audit_checklist_item: string | null
          created_at: string
          is_active: boolean
        }
        Insert: {
          id?: string
          category: string
          name: string
          description?: string | null
          suggested_impact?: number | null
          suggested_likelihood?: number | null
          audit_checklist_item?: string | null
          created_at?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          category?: string
          name?: string
          description?: string | null
          suggested_impact?: number | null
          suggested_likelihood?: number | null
          audit_checklist_item?: string | null
          created_at?: string
          is_active?: boolean
        }
      }
      risk_vulnerability_mapping: {
        Row: {
          risk_id: string
          vulnerability_id: string
        }
        Insert: {
          risk_id: string
          vulnerability_id: string
        }
        Update: {
          risk_id?: string
          vulnerability_id?: string
        }
      }
      audit_checklists: {
        Row: {
          id: string
          project_id: string
          framework: string
          status: string | null
          compliance_score: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          framework: string
          status?: string | null
          compliance_score?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          framework?: string
          status?: string | null
          compliance_score?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_items: {
        Row: {
          id: string
          checklist_id: string
          category: string | null
          control_title: string
          control_description: string | null
          compliance_status: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | null
          auditor_comments: string | null
          source: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          checklist_id: string
          category?: string | null
          control_title: string
          control_description?: string | null
          compliance_status?: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | null
          auditor_comments?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          checklist_id?: string
          category?: string | null
          control_title?: string
          control_description?: string | null
          compliance_status?: 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable' | null
          auditor_comments?: string | null
          source?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      audit_evidence: {
        Row: {
          id: string
          audit_item_id: string
          attachment_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          audit_item_id: string
          attachment_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          audit_item_id?: string
          attachment_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      audit_findings: {
        Row: {
          id: string
          project_id: string
          audit_item_id: string
          issue: string
          risk_description: string
          affected_asset_id: string | null
          recommendation: string | null
          severity: 'low' | 'medium' | 'high' | 'critical' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          audit_item_id: string
          issue: string
          risk_description: string
          affected_asset_id?: string | null
          recommendation?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          audit_item_id?: string
          issue?: string
          risk_description?: string
          affected_asset_id?: string | null
          recommendation?: string | null
          severity?: 'low' | 'medium' | 'high' | 'critical' | null
          created_at?: string
          updated_at?: string
        }
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
  }
}
