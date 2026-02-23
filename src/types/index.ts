/**
 * Risk Shield System - Risk Assessment Platform
 * Application Types and Interfaces
 */

import { Database } from './database'

// =====================================================
// BASE TYPES
// =====================================================

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// =====================================================
// USER & AUTHENTICATION TYPES
// =====================================================

export type UserRole = 'admin' | 'auditor' | 'auditee'

export interface UserProfile extends Tables<'user_profiles'> {
  organization?: Organization
}

export interface Organization extends Tables<'organizations'> { }

export interface AuthSession {
  user: {
    id: string
    email: string
    role: UserRole
    organizationId: string
  } | null
}

// =====================================================
// PROJECT TYPES
// =====================================================

export type ProjectStatus = 'draft' | 'in_progress' | 'completed' | 'archived'

export interface Project extends Tables<'projects'> {
  organization?: Organization
  createdBy?: UserProfile
  assignedTo?: UserProfile
}

export interface ProjectWithProgress extends Project {
  progress: number
  completedSteps: number
  totalSteps: number
}

// =====================================================
// OCTAVE ALLEGRO STEP TYPES
// =====================================================

export const OCTAVE_STEPS = [
  { number: 1, name: 'Risk Measurement Criteria', description: 'Establish criteria for measuring risk' },
  { number: 2, name: 'Information Asset Profile', description: 'Develop information asset profile' },
  { number: 3, name: 'Identify Asset Containers', description: 'Identify information asset containers' },
  { number: 4, name: 'Areas of Concern', description: 'Identify areas of concern' },
  { number: 5, name: 'Threat Scenarios', description: 'Identify threat scenarios' },
  { number: 6, name: 'Identify Risks', description: 'Identify risks' },
  { number: 7, name: 'Analyze Risks', description: 'Analyze risks' },
  { number: 8, name: 'Mitigation Approach', description: 'Select mitigation approach' },
] as const

export type OctaveStepNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface StepStatus {
  step: OctaveStepNumber
  completed: boolean
  locked: boolean
  canAccess: boolean
}

// =====================================================
// STEP 1: RISK MEASUREMENT CRITERIA
// =====================================================

export interface RiskMeasurementCriteria extends Tables<'risk_measurement_criteria'> {
  project?: Project
}

export interface ImpactCriteria {
  level: 1 | 2 | 3 | 4 | 5
  description: string
}

export interface LikelihoodCriteria {
  level: 1 | 2 | 3 | 4 | 5
  description: string
}

// =====================================================
// STEP 2: ASSETS
// =====================================================

export type AssetType = 'data' | 'system' | 'application' | 'network' | 'physical' | 'service' | 'personnel'
export type ClassificationLevel = 'public' | 'internal' | 'confidential' | 'restricted'

export interface Asset extends Tables<'assets'> {
  project?: Project
  containers?: Container[]
}

export interface SecurityAttribute {
  name: 'confidentiality' | 'integrity' | 'availability'
  value: 1 | 2 | 3 | 4 | 5
}

// =====================================================
// STEP 3: CONTAINERS
// =====================================================

export type ContainerType = 'physical' | 'technical' | 'people' | 'process'

export interface Container extends Tables<'containers'> {
  project?: Project
  assets?: Asset[]
  concerns?: Concern[]
}

export interface AssetContainerMapping extends Tables<'asset_container_mapping'> {
  asset?: Asset
  container?: Container
}

// =====================================================
// STEP 4: CONCERNS
// =====================================================

export type ConcernCategory = 'confidentiality' | 'integrity' | 'availability' | 'compliance' | 'operational'
export type PriorityLevel = 'low' | 'medium' | 'high'

export interface Concern extends Tables<'concerns'> {
  project?: Project
  container?: Container
  threatScenarios?: ThreatScenario[]
}

// =====================================================
// STEP 5: THREAT SCENARIOS
// =====================================================

export type ThreatActorType =
  | 'external_attacker'
  | 'internal_attacker'
  | 'competitor'
  | 'nation_state'
  | 'criminal'
  | 'terrorist'
  | 'activist'
  | 'insider'
  | 'accidental'

export type CapabilityLevel = 'low' | 'medium' | 'high'

export interface ThreatScenario extends Tables<'threat_scenarios'> {
  project?: Project
  concern?: Concern
  asset?: Asset
  container?: Container
  risks?: Risk[]
}

// =====================================================
// STEP 6: RISKS
// =====================================================

export type RiskStatus = 'identified' | 'analyzed' | 'mitigating' | 'accepted' | 'transferred' | 'avoided' | 'closed'
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export interface Risk extends Tables<'risks'> {
  project?: Project
  asset?: Asset
  threatScenario?: ThreatScenario
  analysis?: RiskAnalysis
  mitigationPlan?: MitigationPlan
}

export interface RiskWithDetails extends Risk {
  assetName: string
  threatActor: string
  vulnerabilityDescription: string
  treatmentStrategy?: string
}

// =====================================================
// STEP 7: RISK ANALYSIS
// =====================================================

export interface RiskAnalysis extends Tables<'risk_analysis'> {
  risk?: Risk
  analyzedByUser?: UserProfile
}

// =====================================================
// STEP 8: MITIGATION PLANS
// =====================================================

export type TreatmentStrategy = 'mitigate' | 'transfer' | 'accept' | 'avoid'
export type MitigationStatus = 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled'
export type MitigationPriority = 'low' | 'medium' | 'high' | 'critical'

export interface MitigationPlan extends Tables<'mitigation_plans'> {
  risk?: Risk
  createdByUser?: UserProfile
}

// =====================================================
// RISK ENGINE TYPES
// =====================================================

export interface RiskCalculationInput {
  likelihood: 1 | 2 | 3 | 4 | 5
  impact: 1 | 2 | 3 | 4 | 5
}

export interface RiskCalculationResult {
  riskScore: number
  riskLevel: RiskLevel
  classification: {
    min: number
    max: number
    label: string
  }
}

export interface ImpactBreakdown {
  financial: 1 | 2 | 3 | 4 | 5
  reputational: 1 | 2 | 3 | 4 | 5
  legal: 1 | 2 | 3 | 4 | 5
  operational: 1 | 2 | 3 | 4 | 5
  max: 1 | 2 | 3 | 4 | 5
}

export interface ResidualRiskCalculation {
  inherentLikelihood: number
  inherentImpact: number
  inherentScore: number
  controlEffectiveness: number
  residualLikelihood: number
  residualImpact: number
  residualScore: number
  reductionFactor: number
}

// =====================================================
// RISK MATRIX TYPES
// =====================================================

export interface RiskMatrixCell {
  likelihood: number
  impact: number
  riskScore: number
  riskLevel: RiskLevel
  risks: Risk[]
}

export interface RiskMatrixData {
  cells: RiskMatrixCell[][]
  maxLikelihood: number
  maxImpact: number
}

// =====================================================
// RISK REGISTER TYPES
// =====================================================

export interface RiskRegisterFilter {
  riskLevel?: RiskLevel[]
  status?: RiskStatus[]
  assetType?: AssetType[]
  owner?: string[]
  dateRange?: { from: Date; to: Date }
}

export interface RiskRegisterSort {
  column: keyof RiskWithDetails
  direction: 'asc' | 'desc'
}

export interface RiskRegisterPagination {
  page: number
  pageSize: number
  total: number
}

// =====================================================
// AI SERVICE TYPES
// =====================================================

export interface AIMitigationRecommendation {
  riskId: string
  recommendations: string[]
  priority: MitigationPriority
  estimatedEffort: string
  rationale: string
}

export interface AIExecutiveSummary {
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  keyFindings: string[]
  recommendations: string[]
  overallAssessment: string
}

// =====================================================
// REPORT TYPES
// =====================================================

export interface ReportData {
  project: Project
  criteria: RiskMeasurementCriteria
  assets: Asset[]
  containers: Container[]
  concerns: Concern[]
  threatScenarios: ThreatScenario[]
  risks: Risk[]
  analyses: RiskAnalysis[]
  mitigationPlans: MitigationPlan[]
}

export interface ReportSection {
  title: string
  content: string
  order: number
}

export type FinalRiskOpinion =
  | 'Immediate Remediation Required'
  | 'High Risk Exposure'
  | 'Moderate Risk Exposure'
  | 'Acceptable Risk Level'

// =====================================================
// AUDIT LOG TYPES
// =====================================================

export interface AuditLog extends Tables<'audit_logs'> {
  user?: UserProfile
}

export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'complete_step'
  | 'generate_report'

// =====================================================
// API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    page?: number
    pageSize?: number
    total?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

// =====================================================
// FORM TYPES
// =====================================================

export interface FormField<T> {
  name: keyof T
  label: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'date' | 'checkbox'
  required?: boolean
  options?: { value: string; label: string }[]
  validation?: {
    min?: number
    max?: number
    pattern?: RegExp
    message?: string
  }
}

// =====================================================
// DASHBOARD TYPES
// =====================================================

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalRisks: number
  criticalRisks: number
  highRisks: number
  mediumRisks: number
  lowRisks: number
  risksByStatus: Record<RiskStatus, number>
  recentActivity: AuditLog[]
}

export interface RiskTrend {
  date: string
  critical: number
  high: number
  medium: number
  low: number
}
// =====================================================
// VULNERABILITY & AUDIT TYPES
// =====================================================

export interface Vulnerability extends Tables<'vulnerabilities'> { }

export interface RiskVulnerabilityMapping extends Tables<'risk_vulnerability_mapping'> {
  risk?: Risk
  vulnerability?: Vulnerability
}

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable'

export interface AuditChecklist extends Tables<'audit_checklists'> {
  project?: Project
  items?: AuditItem[]
}

export interface AuditItem extends Tables<'audit_items'> {
  checklist?: AuditChecklist
  evidence?: AuditEvidence[]
}

export interface AuditEvidence extends Tables<'audit_evidence'> {
  auditItem?: AuditItem
  attachment?: Attachment
}

export interface Attachment extends Tables<'attachments'> {
  project?: Project
  uploadedByUser?: UserProfile
}

export interface AuditFinding extends Tables<'audit_findings'> {
  project?: Project
  auditItem?: AuditItem
  affectedAsset?: Asset
}
