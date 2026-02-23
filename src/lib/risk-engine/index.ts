/**
 * OCTAVE Allegro Risk Engine
 * Pure function module for risk calculations
 * 
 * Risk Score Formula: Risk Score = Likelihood × Impact
 * Impact = Maximum value among Financial, Reputational, Legal, Operational
 * 
 * Risk Classification:
 * 1–5   → Low
 * 6–10  → Medium
 * 11–15 → High
 * 16–25 → Critical
 */

import {
  RiskCalculationInput,
  RiskCalculationResult,
  ImpactBreakdown,
  ResidualRiskCalculation,
  RiskLevel,
  FinalRiskOpinion,
} from '@/types'

// =====================================================
// CONSTANTS
// =====================================================

export const RISK_CONSTANTS = {
  MIN_LIKELIHOOD: 1,
  MAX_LIKELIHOOD: 5,
  MIN_IMPACT: 1,
  MAX_IMPACT: 5,
  MIN_RISK_SCORE: 1,
  MAX_RISK_SCORE: 25,
} as const

export const RISK_CLASSIFICATIONS = {
  LOW: { min: 1, max: 5, label: 'Low', color: '#22c55e' },
  MEDIUM: { min: 6, max: 10, label: 'Medium', color: '#eab308' },
  HIGH: { min: 11, max: 15, label: 'High', color: '#f97316' },
  CRITICAL: { min: 16, max: 25, label: 'Critical', color: '#ef4444' },
} as const

// =====================================================
// VALIDATION FUNCTIONS
// =====================================================

/**
 * Validates likelihood value is within acceptable range
 */
export function validateLikelihood(likelihood: number): boolean {
  return (
    Number.isInteger(likelihood) &&
    likelihood >= RISK_CONSTANTS.MIN_LIKELIHOOD &&
    likelihood <= RISK_CONSTANTS.MAX_LIKELIHOOD
  )
}

/**
 * Validates impact value is within acceptable range
 */
export function validateImpact(impact: number): boolean {
  return (
    Number.isInteger(impact) &&
    impact >= RISK_CONSTANTS.MIN_IMPACT &&
    impact <= RISK_CONSTANTS.MAX_IMPACT
  )
}

/**
 * Validates risk score is within acceptable range
 */
export function validateRiskScore(score: number): boolean {
  return (
    Number.isInteger(score) &&
    score >= RISK_CONSTANTS.MIN_RISK_SCORE &&
    score <= RISK_CONSTANTS.MAX_RISK_SCORE
  )
}

/**
 * Validates all impact values
 */
export function validateImpactBreakdown(impact: ImpactBreakdown): boolean {
  return (
    validateImpact(impact.financial) &&
    validateImpact(impact.reputational) &&
    validateImpact(impact.legal) &&
    validateImpact(impact.operational)
  )
}

// =====================================================
// CALCULATION FUNCTIONS
// =====================================================

/**
 * Calculates the maximum impact from impact breakdown
 * Formula: Impact = MAX(Financial, Reputational, Legal, Operational)
 */
export function calculateMaxImpact(impact: ImpactBreakdown): 1 | 2 | 3 | 4 | 5 {
  const max = Math.max(
    impact.financial,
    impact.reputational,
    impact.legal,
    impact.operational
  )
  return Math.min(Math.max(max, 1), 5) as 1 | 2 | 3 | 4 | 5
}

/**
 * Calculates risk score
 * Formula: Risk Score = Likelihood × Impact
 */
export function calculateRiskScore(
  likelihood: number,
  impact: number
): number {
  if (!validateLikelihood(likelihood)) {
    throw new Error(
      `Invalid likelihood value: ${likelihood}. Must be between ${RISK_CONSTANTS.MIN_LIKELIHOOD} and ${RISK_CONSTANTS.MAX_LIKELIHOOD}`
    )
  }
  
  if (!validateImpact(impact)) {
    throw new Error(
      `Invalid impact value: ${impact}. Must be between ${RISK_CONSTANTS.MIN_IMPACT} and ${RISK_CONSTANTS.MAX_IMPACT}`
    )
  }
  
  return likelihood * impact
}

/**
 * Determines risk level from risk score
 */
export function determineRiskLevel(score: number): RiskLevel {
  if (!validateRiskScore(score)) {
    throw new Error(
      `Invalid risk score: ${score}. Must be between ${RISK_CONSTANTS.MIN_RISK_SCORE} and ${RISK_CONSTANTS.MAX_RISK_SCORE}`
    )
  }
  
  if (score <= RISK_CLASSIFICATIONS.LOW.max) return 'low'
  if (score <= RISK_CLASSIFICATIONS.MEDIUM.max) return 'medium'
  if (score <= RISK_CLASSIFICATIONS.HIGH.max) return 'high'
  return 'critical'
}

/**
 * Main risk calculation function
 * Returns complete risk calculation result
 */
export function calculateRisk(
  input: RiskCalculationInput
): RiskCalculationResult {
  const riskScore = calculateRiskScore(input.likelihood, input.impact)
  const riskLevel = determineRiskLevel(riskScore)
  
  let classification
  switch (riskLevel) {
    case 'low':
      classification = RISK_CLASSIFICATIONS.LOW
      break
    case 'medium':
      classification = RISK_CLASSIFICATIONS.MEDIUM
      break
    case 'high':
      classification = RISK_CLASSIFICATIONS.HIGH
      break
    case 'critical':
      classification = RISK_CLASSIFICATIONS.CRITICAL
      break
  }
  
  return {
    riskScore,
    riskLevel,
    classification,
  }
}

/**
 * Calculates residual risk after applying controls
 */
export function calculateResidualRisk(
  inherentLikelihood: number,
  inherentImpact: number,
  controlEffectiveness: number
): ResidualRiskCalculation {
  if (!validateLikelihood(inherentLikelihood)) {
    throw new Error(`Invalid inherent likelihood: ${inherentLikelihood}`)
  }
  
  if (!validateImpact(inherentImpact)) {
    throw new Error(`Invalid inherent impact: ${inherentImpact}`)
  }
  
  if (controlEffectiveness < 1 || controlEffectiveness > 5) {
    throw new Error(
      `Invalid control effectiveness: ${controlEffectiveness}. Must be between 1 and 5`
    )
  }
  
  const inherentScore = inherentLikelihood * inherentImpact
  
  // Calculate reduction factor based on control effectiveness
  // Effectiveness 1 = 0% reduction, 5 = 80% reduction
  const reductionFactor = (controlEffectiveness - 1) * 0.2
  
  // Apply reduction to likelihood (controls primarily reduce likelihood)
  let residualLikelihood = Math.round(
    inherentLikelihood * (1 - reductionFactor)
  )
  residualLikelihood = Math.max(residualLikelihood, 1)
  
  // Impact may also be slightly reduced by controls
  let residualImpact = Math.round(inherentImpact * (1 - reductionFactor * 0.3))
  residualImpact = Math.max(residualImpact, 1)
  
  const residualScore = residualLikelihood * residualImpact
  
  return {
    inherentLikelihood,
    inherentImpact,
    inherentScore,
    controlEffectiveness,
    residualLikelihood,
    residualImpact,
    residualScore,
  }
}

// =====================================================
// RISK MATRIX FUNCTIONS
// =====================================================

/**
 * Generates the complete 5x5 risk matrix
 */
export function generateRiskMatrix(): Array<{
  likelihood: number
  impact: number
  score: number
  level: RiskLevel
}> {
  const matrix: Array<{
    likelihood: number
    impact: number
    score: number
    level: RiskLevel
  }> = []
  
  for (let likelihood = 5; likelihood >= 1; likelihood--) {
    for (let impact = 1; impact <= 5; impact++) {
      const score = likelihood * impact
      matrix.push({
        likelihood,
        impact,
        score,
        level: determineRiskLevel(score),
      })
    }
  }
  
  return matrix
}

/**
 * Gets cell color for risk matrix
 */
export function getRiskMatrixCellColor(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return RISK_CLASSIFICATIONS.LOW.color
    case 'medium':
      return RISK_CLASSIFICATIONS.MEDIUM.color
    case 'high':
      return RISK_CLASSIFICATIONS.HIGH.color
    case 'critical':
      return RISK_CLASSIFICATIONS.CRITICAL.color
    default:
      return '#6b7280'
  }
}

// =====================================================
// FINAL OPINION FUNCTIONS
// =====================================================

/**
 * Determines final risk opinion based on risk distribution
 */
export function determineFinalOpinion(riskDistribution: {
  critical: number
  high: number
  medium: number
  low: number
}): FinalRiskOpinion {
  const { critical, high, medium, low } = riskDistribution
  const total = critical + high + medium + low
  
  if (total === 0) {
    return 'Acceptable Risk Level'
  }
  
  // If any critical risks exist
  if (critical > 0) {
    return 'Immediate Remediation Required'
  }
  
  // If high risks are dominant
  if (high > medium && high > low) {
    return 'High Risk Exposure'
  }
  
  // If medium risks are dominant or equal to high
  if (medium >= high && medium > low) {
    return 'Moderate Risk Exposure'
  }
  
  // Only low risks
  return 'Acceptable Risk Level'
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Gets risk level display name
 */
export function getRiskLevelDisplay(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'Low Risk'
    case 'medium':
      return 'Medium Risk'
    case 'high':
      return 'High Risk'
    case 'critical':
      return 'Critical Risk'
    default:
      return 'Unknown'
  }
}

/**
 * Gets risk level badge class
 */
export function getRiskLevelBadgeClass(level: RiskLevel): string {
  switch (level) {
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'critical':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Sorts risks by risk score (descending)
 */
export function sortRisksByScore<T extends { risk_score: number }>(
  risks: T[]
): T[] {
  return [...risks].sort((a, b) => b.risk_score - a.risk_score)
}

/**
 * Filters risks by level
 */
export function filterRisksByLevel<T extends { risk_level: RiskLevel }>(
  risks: T[],
  level: RiskLevel
): T[] {
  return risks.filter(risk => risk.risk_level === level)
}

/**
 * Calculates risk distribution statistics
 */
export function calculateRiskDistribution<T extends { risk_level: RiskLevel }>(
  risks: T[]
): { critical: number; high: number; medium: number; low: number } {
  return {
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length,
  }
}
