/**
 * Zod Validation Schemas
 * Input validation for all forms and API requests
 */

import { z } from 'zod'

// =====================================================
// COMMON VALIDATION RULES
// =====================================================

const uuidSchema = z.string().uuid('Invalid UUID format')

const nameSchema = z
  .string()
  .min(1, 'Name is required')
  .max(255, 'Name must be less than 255 characters')

const descriptionSchema = z
  .string()
  .max(5000, 'Description must be less than 5000 characters')
  .optional()
  .nullable()

const impactScaleSchema = z.number().int().min(1).max(5)

const likelihoodScaleSchema = z.number().int().min(1).max(5)

// =====================================================
// USER SCHEMAS
// =====================================================

export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'auditor', 'viewer']),
  department: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
})

export const userInviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['admin', 'auditor', 'viewer']),
  organization_id: uuidSchema,
})

// =====================================================
// ORGANIZATION SCHEMAS
// =====================================================

export const organizationSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  industry: z.string().max(100).optional().nullable(),
  size: z.string().max(50).optional().nullable(),
  address: z.string().optional().nullable(),
  contact_email: z.string().email().optional().nullable(),
  contact_phone: z.string().max(50).optional().nullable(),
})

// =====================================================
// PROJECT SCHEMAS
// =====================================================

export const projectSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  organization_id: uuidSchema,
  assigned_to: uuidSchema.optional().nullable(),
  start_date: z.string().datetime().optional().nullable(),
  target_completion_date: z.string().datetime().optional().nullable(),
})

export const projectUpdateSchema = z.object({
  name: nameSchema.optional(),
  description: descriptionSchema,
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).optional(),
  assigned_to: uuidSchema.optional().nullable(),
  target_completion_date: z.string().datetime().optional().nullable(),
})

// =====================================================
// STEP 1: RISK MEASUREMENT CRITERIA SCHEMAS
// =====================================================

export const impactCriteriaSchema = z.object({
  level1: z.string().max(255).default('Negligible'),
  level2: z.string().max(255).default('Minor'),
  level3: z.string().max(255).default('Moderate'),
  level4: z.string().max(255).default('Major'),
  level5: z.string().max(255).default('Catastrophic'),
})

export const riskMeasurementCriteriaSchema = z.object({
  project_id: uuidSchema,
  financial_impact_1: z.string().max(255).optional(),
  financial_impact_2: z.string().max(255).optional(),
  financial_impact_3: z.string().max(255).optional(),
  financial_impact_4: z.string().max(255).optional(),
  financial_impact_5: z.string().max(255).optional(),
  reputational_impact_1: z.string().max(255).optional(),
  reputational_impact_2: z.string().max(255).optional(),
  reputational_impact_3: z.string().max(255).optional(),
  reputational_impact_4: z.string().max(255).optional(),
  reputational_impact_5: z.string().max(255).optional(),
  legal_impact_1: z.string().max(255).optional(),
  legal_impact_2: z.string().max(255).optional(),
  legal_impact_3: z.string().max(255).optional(),
  legal_impact_4: z.string().max(255).optional(),
  legal_impact_5: z.string().max(255).optional(),
  operational_impact_1: z.string().max(255).optional(),
  operational_impact_2: z.string().max(255).optional(),
  operational_impact_3: z.string().max(255).optional(),
  operational_impact_4: z.string().max(255).optional(),
  operational_impact_5: z.string().max(255).optional(),
  likelihood_1: z.string().max(255).optional(),
  likelihood_2: z.string().max(255).optional(),
  likelihood_3: z.string().max(255).optional(),
  likelihood_4: z.string().max(255).optional(),
  likelihood_5: z.string().max(255).optional(),
})

// =====================================================
// STEP 2: ASSET SCHEMAS
// =====================================================

export const assetSchema = z.object({
  project_id: uuidSchema,
  name: nameSchema,
  description: descriptionSchema,
  asset_type: z.enum(['data', 'system', 'application', 'network', 'physical', 'service', 'personnel']),
  owner: z.string().max(255).optional().nullable(),
  custodian: z.string().max(255).optional().nullable(),
  classification: z.enum(['public', 'internal', 'confidential', 'restricted']).optional().nullable(),
  confidentiality_value: impactScaleSchema.optional().nullable(),
  integrity_value: impactScaleSchema.optional().nullable(),
  availability_value: impactScaleSchema.optional().nullable(),
  location: z.string().max(255).optional().nullable(),
  retention_period: z.string().max(100).optional().nullable(),
  financial_impact: impactScaleSchema.optional().nullable(),
  reputational_impact: impactScaleSchema.optional().nullable(),
  legal_impact: impactScaleSchema.optional().nullable(),
  operational_impact: impactScaleSchema.optional().nullable(),
})

export const assetUpdateSchema = assetSchema.partial().omit({ project_id: true })

// =====================================================
// STEP 3: CONTAINER SCHEMAS
// =====================================================

export const containerSchema = z.object({
  project_id: uuidSchema,
  name: nameSchema,
  description: descriptionSchema,
  container_type: z.enum(['physical', 'technical', 'people', 'process']),
  location: z.string().max(255).optional().nullable(),
  responsible_party: z.string().max(255).optional().nullable(),
  security_controls: z.string().max(5000).optional().nullable(),
})

export const containerUpdateSchema = containerSchema.partial().omit({ project_id: true })

export const assetContainerMappingSchema = z.object({
  asset_id: uuidSchema,
  container_id: uuidSchema,
  relationship_type: z.enum(['stored_in', 'processed_in', 'transmitted_via', 'accessed_from']).default('stored_in'),
})

// =====================================================
// STEP 4: CONCERN SCHEMAS
// =====================================================

export const concernSchema = z.object({
  project_id: uuidSchema,
  container_id: uuidSchema,
  description: z.string().min(1, 'Description is required').max(5000),
  concern_category: z.enum(['confidentiality', 'integrity', 'availability', 'compliance', 'operational']).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
})

export const concernUpdateSchema = concernSchema.partial().omit({ project_id: true, container_id: true })

// =====================================================
// STEP 5: THREAT SCENARIO SCHEMAS
// =====================================================

export const threatScenarioSchema = z.object({
  project_id: uuidSchema,
  concern_id: uuidSchema,
  asset_id: uuidSchema,
  container_id: uuidSchema,
  scenario_description: z.string().min(1, 'Scenario description is required').max(5000),
  threat_actor: z.string().max(255).optional().nullable(),
  threat_actor_type: z.enum([
    'external_attacker', 'internal_attacker', 'competitor', 'nation_state',
    'criminal', 'terrorist', 'activist', 'insider', 'accidental'
  ]).optional().nullable(),
  threat_vector: z.string().max(255).optional().nullable(),
  motivation: z.string().max(500).optional().nullable(),
  capability: z.enum(['low', 'medium', 'high']).optional().nullable(),
  likelihood: likelihoodScaleSchema.optional().nullable(),
})

export const threatScenarioUpdateSchema = threatScenarioSchema.partial().omit({ 
  project_id: true, 
  concern_id: true, 
  asset_id: true, 
  container_id: true 
})

// =====================================================
// STEP 6: RISK SCHEMAS
// =====================================================

export const riskSchema = z.object({
  project_id: uuidSchema,
  asset_id: uuidSchema,
  threat_scenario_id: uuidSchema,
  risk_title: z.string().min(1, 'Risk title is required').max(255),
  risk_description: descriptionSchema,
  vulnerability_description: z.string().min(1, 'Vulnerability description is required').max(5000),
  likelihood: likelihoodScaleSchema,
  impact: impactScaleSchema,
  financial_impact: impactScaleSchema.optional().nullable(),
  reputational_impact: impactScaleSchema.optional().nullable(),
  legal_impact: impactScaleSchema.optional().nullable(),
  operational_impact: impactScaleSchema.optional().nullable(),
  owner: z.string().max(255).optional().nullable(),
  review_date: z.string().datetime().optional().nullable(),
})

export const riskUpdateSchema = riskSchema.partial().omit({
  project_id: true,
  asset_id: true,
  threat_scenario_id: true,
})

// =====================================================
// STEP 7: RISK ANALYSIS SCHEMAS
// =====================================================

export const riskAnalysisSchema = z.object({
  risk_id: uuidSchema,
  project_id: uuidSchema,
  existing_controls: z.string().max(5000).optional().nullable(),
  control_effectiveness: impactScaleSchema.optional().nullable(),
  residual_likelihood: likelihoodScaleSchema.optional().nullable(),
  residual_impact: impactScaleSchema.optional().nullable(),
  root_cause_analysis: z.string().max(5000).optional().nullable(),
  potential_consequences: z.string().max(5000).optional().nullable(),
  affected_stakeholders: z.string().max(5000).optional().nullable(),
})

export const riskAnalysisUpdateSchema = riskAnalysisSchema.partial().omit({
  risk_id: true,
  project_id: true,
})

// =====================================================
// STEP 8: MITIGATION PLAN SCHEMAS
// =====================================================

export const mitigationPlanSchema = z.object({
  risk_id: uuidSchema,
  project_id: uuidSchema,
  treatment_strategy: z.enum(['mitigate', 'transfer', 'accept', 'avoid']),
  mitigation_description: z.string().min(1, 'Mitigation description is required').max(5000),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  estimated_cost: z.string().max(100).optional().nullable(),
  implementation_timeline: z.string().max(100).optional().nullable(),
  responsible_party: z.string().max(255).optional().nullable(),
  planned_start_date: z.string().datetime().optional().nullable(),
  planned_completion_date: z.string().datetime().optional().nullable(),
})

export const mitigationPlanUpdateSchema = mitigationPlanSchema.partial().omit({
  risk_id: true,
  project_id: true,
})

// =====================================================
// RISK CALCULATION SCHEMAS
// =====================================================

export const riskCalculationSchema = z.object({
  likelihood: likelihoodScaleSchema,
  impact: impactScaleSchema,
})

export const residualRiskCalculationSchema = z.object({
  inherent_likelihood: likelihoodScaleSchema,
  inherent_impact: impactScaleSchema,
  control_effectiveness: impactScaleSchema,
})

// =====================================================
// WIZARD STEP SCHEMAS
// =====================================================

export const wizardStepCompletionSchema = z.object({
  project_id: uuidSchema,
  step: z.number().int().min(1).max(8),
  completed: z.boolean(),
})

// =====================================================
// REPORT SCHEMAS
// =====================================================

export const reportGenerationSchema = z.object({
  project_id: uuidSchema,
  report_type: z.enum(['executive', 'detailed', 'technical']),
  include_sections: z.array(z.string()).optional(),
})

// =====================================================
// API REQUEST SCHEMAS
// =====================================================

export const apiPaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  page_size: z.number().int().min(1).max(100).default(20),
})

export const apiFilterSchema = z.object({
  risk_level: z.array(z.enum(['low', 'medium', 'high', 'critical'])).optional(),
  status: z.array(z.string()).optional(),
  asset_type: z.array(z.string()).optional(),
  date_from: z.string().datetime().optional(),
  date_to: z.string().datetime().optional(),
})

export const apiSortSchema = z.object({
  column: z.string(),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

// =====================================================
// TYPE EXPORTS
// =====================================================

export type UserProfileInput = z.infer<typeof userProfileSchema>
export type OrganizationInput = z.infer<typeof organizationSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type AssetInput = z.infer<typeof assetSchema>
export type ContainerInput = z.infer<typeof containerSchema>
export type ConcernInput = z.infer<typeof concernSchema>
export type ThreatScenarioInput = z.infer<typeof threatScenarioSchema>
export type RiskInput = z.infer<typeof riskSchema>
export type RiskAnalysisInput = z.infer<typeof riskAnalysisSchema>
export type MitigationPlanInput = z.infer<typeof mitigationPlanSchema>
