/**
 * Risk Engine Unit Tests
 * Comprehensive test coverage for risk calculation functions
 */

import {
  calculateRiskScore,
  determineRiskLevel,
  calculateResidualRisk,
  validateLikelihood,
  validateImpact,
  validateRiskScore,
  calculateMaxImpact,
  generateRiskMatrix,
  determineFinalOpinion,
  RISK_CONSTANTS,
  RISK_CLASSIFICATIONS,
} from '@/lib/risk-engine'
import { ImpactBreakdown } from '@/types'

// =====================================================
// VALIDATION TESTS
// =====================================================

describe('Validation Functions', () => {
  describe('validateLikelihood', () => {
    it('should return true for valid likelihood values (1-5)', () => {
      expect(validateLikelihood(1)).toBe(true)
      expect(validateLikelihood(3)).toBe(true)
      expect(validateLikelihood(5)).toBe(true)
    })
    
    it('should return false for invalid likelihood values', () => {
      expect(validateLikelihood(0)).toBe(false)
      expect(validateLikelihood(6)).toBe(false)
      expect(validateLikelihood(-1)).toBe(false)
      expect(validateLikelihood(3.5)).toBe(false)
    })
  })
  
  describe('validateImpact', () => {
    it('should return true for valid impact values (1-5)', () => {
      expect(validateImpact(1)).toBe(true)
      expect(validateImpact(3)).toBe(true)
      expect(validateImpact(5)).toBe(true)
    })
    
    it('should return false for invalid impact values', () => {
      expect(validateImpact(0)).toBe(false)
      expect(validateImpact(6)).toBe(false)
      expect(validateImpact(-1)).toBe(false)
      expect(validateImpact(2.5)).toBe(false)
    })
  })
  
  describe('validateRiskScore', () => {
    it('should return true for valid risk scores (1-25)', () => {
      expect(validateRiskScore(1)).toBe(true)
      expect(validateRiskScore(15)).toBe(true)
      expect(validateRiskScore(25)).toBe(true)
    })
    
    it('should return false for invalid risk scores', () => {
      expect(validateRiskScore(0)).toBe(false)
      expect(validateRiskScore(26)).toBe(false)
      expect(validateRiskScore(-5)).toBe(false)
    })
  })
})

// =====================================================
// CALCULATION TESTS
// =====================================================

describe('Risk Score Calculation', () => {
  describe('calculateRiskScore', () => {
    it('should calculate correct risk score (Likelihood × Impact)', () => {
      expect(calculateRiskScore(1, 1)).toBe(1)
      expect(calculateRiskScore(3, 3)).toBe(9)
      expect(calculateRiskScore(5, 5)).toBe(25)
      expect(calculateRiskScore(2, 4)).toBe(8)
    })
    
    it('should throw error for invalid likelihood', () => {
      expect(() => calculateRiskScore(0, 3)).toThrow()
      expect(() => calculateRiskScore(6, 3)).toThrow()
    })
    
    it('should throw error for invalid impact', () => {
      expect(() => calculateRiskScore(3, 0)).toThrow()
      expect(() => calculateRiskScore(3, 6)).toThrow()
    })
  })
  
  describe('determineRiskLevel', () => {
    it('should classify low risk (1-5)', () => {
      expect(determineRiskLevel(1)).toBe('low')
      expect(determineRiskLevel(5)).toBe('low')
    })
    
    it('should classify medium risk (6-10)', () => {
      expect(determineRiskLevel(6)).toBe('medium')
      expect(determineRiskLevel(10)).toBe('medium')
    })
    
    it('should classify high risk (11-15)', () => {
      expect(determineRiskLevel(11)).toBe('high')
      expect(determineRiskLevel(15)).toBe('high')
    })
    
    it('should classify critical risk (16-25)', () => {
      expect(determineRiskLevel(16)).toBe('critical')
      expect(determineRiskLevel(25)).toBe('critical')
    })
    
    it('should throw error for invalid risk score', () => {
      expect(() => determineRiskLevel(0)).toThrow()
      expect(() => determineRiskLevel(26)).toThrow()
    })
  })
  
  describe('calculateMaxImpact', () => {
    it('should return maximum impact value', () => {
      const impact: ImpactBreakdown = {
        financial: 2,
        reputational: 4,
        legal: 3,
        operational: 2,
        max: 4,
      }
      expect(calculateMaxImpact(impact)).toBe(4)
    })
    
    it('should handle all equal values', () => {
      const impact: ImpactBreakdown = {
        financial: 3,
        reputational: 3,
        legal: 3,
        operational: 3,
        max: 3,
      }
      expect(calculateMaxImpact(impact)).toBe(3)
    })
  })
})

// =====================================================
// RESIDUAL RISK TESTS
// =====================================================

describe('Residual Risk Calculation', () => {
  describe('calculateResidualRisk', () => {
    it('should calculate residual risk with effective controls', () => {
      const result = calculateResidualRisk(4, 4, 5) // High effectiveness
      
      expect(result.inherentScore).toBe(16)
      expect(result.residualScore).toBeLessThan(result.inherentScore)
      expect(result.reductionFactor).toBeGreaterThan(0)
    })
    
    it('should calculate residual risk with ineffective controls', () => {
      const result = calculateResidualRisk(4, 4, 1) // Low effectiveness
      
      expect(result.inherentScore).toBe(16)
      expect(result.residualScore).toBeCloseTo(result.inherentScore)
    })
    
    it('should throw error for invalid control effectiveness', () => {
      expect(() => calculateResidualRisk(3, 3, 0)).toThrow()
      expect(() => calculateResidualRisk(3, 3, 6)).toThrow()
    })
    
    it('should ensure residual values are at least 1', () => {
      const result = calculateResidualRisk(5, 5, 5)
      
      expect(result.residualLikelihood).toBeGreaterThanOrEqual(1)
      expect(result.residualImpact).toBeGreaterThanOrEqual(1)
    })
  })
})

// =====================================================
// RISK MATRIX TESTS
// =====================================================

describe('Risk Matrix Generation', () => {
  describe('generateRiskMatrix', () => {
    it('should generate 25 cells (5x5)', () => {
      const matrix = generateRiskMatrix()
      expect(matrix).toHaveLength(25)
    })
    
    it('should have correct score range', () => {
      const matrix = generateRiskMatrix()
      const scores = matrix.map(cell => cell.score)
      
      expect(Math.min(...scores)).toBe(1)
      expect(Math.max(...scores)).toBe(25)
    })
    
    it('should have correct risk levels', () => {
      const matrix = generateRiskMatrix()
      
      // Check some specific cells
      const lowRiskCell = matrix.find(c => c.score === 2)
      expect(lowRiskCell?.level).toBe('low')
      
      const criticalRiskCell = matrix.find(c => c.score === 20)
      expect(criticalRiskCell?.level).toBe('critical')
    })
  })
})

// =====================================================
// FINAL OPINION TESTS
// =====================================================

describe('Final Opinion Determination', () => {
  describe('determineFinalOpinion', () => {
    it('should return "Immediate Remediation Required" for any critical risks', () => {
      const result = determineFinalOpinion({
        critical: 1,
        high: 0,
        medium: 5,
        low: 10,
      })
      expect(result).toBe('Immediate Remediation Required')
    })
    
    it('should return "High Risk Exposure" for dominant high risks', () => {
      const result = determineFinalOpinion({
        critical: 0,
        high: 10,
        medium: 5,
        low: 2,
      })
      expect(result).toBe('High Risk Exposure')
    })
    
    it('should return "Moderate Risk Exposure" for dominant medium risks', () => {
      const result = determineFinalOpinion({
        critical: 0,
        high: 2,
        medium: 8,
        low: 3,
      })
      expect(result).toBe('Moderate Risk Exposure')
    })
    
    it('should return "Acceptable Risk Level" for only low risks', () => {
      const result = determineFinalOpinion({
        critical: 0,
        high: 0,
        medium: 0,
        low: 10,
      })
      expect(result).toBe('Acceptable Risk Level')
    })
    
    it('should handle empty risk distribution', () => {
      const result = determineFinalOpinion({
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      })
      expect(result).toBe('Acceptable Risk Level')
    })
  })
})

// =====================================================
// BOUNDARY TESTS
// =====================================================

describe('Boundary Tests', () => {
  it('should handle minimum values correctly', () => {
    const score = calculateRiskScore(1, 1)
    expect(score).toBe(1)
    expect(determineRiskLevel(score)).toBe('low')
  })
  
  it('should handle maximum values correctly', () => {
    const score = calculateRiskScore(5, 5)
    expect(score).toBe(25)
    expect(determineRiskLevel(score)).toBe('critical')
  })
  
  it('should handle boundary risk scores', () => {
    expect(determineRiskLevel(5)).toBe('low')
    expect(determineRiskLevel(6)).toBe('medium')
    expect(determineRiskLevel(10)).toBe('medium')
    expect(determineRiskLevel(11)).toBe('high')
    expect(determineRiskLevel(15)).toBe('high')
    expect(determineRiskLevel(16)).toBe('critical')
  })
})

// =====================================================
// CONSTANTS TESTS
// =====================================================

describe('Risk Constants', () => {
  it('should have correct constant values', () => {
    expect(RISK_CONSTANTS.MIN_LIKELIHOOD).toBe(1)
    expect(RISK_CONSTANTS.MAX_LIKELIHOOD).toBe(5)
    expect(RISK_CONSTANTS.MIN_IMPACT).toBe(1)
    expect(RISK_CONSTANTS.MAX_IMPACT).toBe(5)
    expect(RISK_CONSTANTS.MIN_RISK_SCORE).toBe(1)
    expect(RISK_CONSTANTS.MAX_RISK_SCORE).toBe(25)
  })
  
  it('should have correct classification ranges', () => {
    expect(RISK_CLASSIFICATIONS.LOW).toEqual({ min: 1, max: 5, label: 'Low', color: '#22c55e' })
    expect(RISK_CLASSIFICATIONS.MEDIUM).toEqual({ min: 6, max: 10, label: 'Medium', color: '#eab308' })
    expect(RISK_CLASSIFICATIONS.HIGH).toEqual({ min: 11, max: 15, label: 'High', color: '#f97316' })
    expect(RISK_CLASSIFICATIONS.CRITICAL).toEqual({ min: 16, max: 25, label: 'Critical', color: '#ef4444' })
  })
})
