import { GoogleGenerativeAI } from '@google/generative-ai'
import { Risk, MitigationPlan, AIExecutiveSummary, AIMitigationRecommendation } from '@/types'

interface AIConfig {
  enabled: boolean
  apiKey?: string
  model?: string
}

// Default configuration - AI features are optional
const defaultConfig: AIConfig = {
  enabled: process.env.GOOGLE_AI_API_KEY ? true : false,
  apiKey: process.env.GOOGLE_AI_API_KEY,
  model: 'gemini-1.5-flash', // Fast and reliable model
}

/**
 * Get the Generative AI instance
 */
function getGenerativeAI(apiKey?: string) {
  const key = apiKey || process.env.GOOGLE_AI_API_KEY
  if (!key) return null
  return new GoogleGenerativeAI(key)
}

/**
 * Generate mitigation recommendations for a risk
 * AI may provide suggestions but NEVER modifies the calculated risk score
 */
export async function generateMitigationRecommendations(
  risk: Risk,
  config: AIConfig = defaultConfig
): Promise<AIMitigationRecommendation> {
  if (!config.enabled || !config.apiKey) {
    // Return default recommendations without AI
    return getDefaultMitigationRecommendations(risk)
  }

  try {
    const genAI = getGenerativeAI(config.apiKey)
    if (!genAI) return getDefaultMitigationRecommendations(risk)

    const model = genAI.getGenerativeModel({ model: config.model || 'gemini-1.5-flash' })

    const prompt = `
      As a cybersecurity expert, provide 4-6 specific mitigation recommendations for the following risk identified using OCTAVE Allegro methodology.
      
      Risk Title: ${risk.risk_title}
      Risk Level: ${risk.risk_level}
      Risk Score: ${risk.risk_score}
      Vulnerability: ${risk.vulnerability_description}
      Asset: ${risk.asset_id}
      
      Requirements:
      1. Provide a list of clear, actionable recommendations.
      2. Estimate the effort (e.g., "1-2 weeks", "2-4 months").
      3. Provide a brief rationale for these recommendations.
      4. Format the response as JSON with fields: recommendations (array of strings), priority (one of "low", "medium", "high", "critical"), estimatedEffort (string), rationale (string).
      5. Do NOT modify the risk score or level.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Attempt to parse JSON from response
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const aiResponse = JSON.parse(jsonMatch[0])
        return {
          riskId: risk.id,
          recommendations: aiResponse.recommendations || getDefaultMitigationRecommendations(risk).recommendations,
          priority: aiResponse.priority || getDefaultMitigationRecommendations(risk).priority,
          estimatedEffort: aiResponse.estimatedEffort || getEstimatedEffort(risk.risk_level),
          rationale: aiResponse.rationale || `AI-generated recommendation for ${risk.risk_level} risk.`,
        }
      }
    } catch (e) {
      console.error('Failed to parse AI response:', e)
    }
  } catch (error) {
    console.error('Gemini AI Error:', error)
  }

  return getDefaultMitigationRecommendations(risk)
}

/**
 * Get default mitigation recommendations based on risk level
 */
function getDefaultMitigationRecommendations(risk: Risk): AIMitigationRecommendation {
  const recommendations: Record<string, string[]> = {
    critical: [
      'Implement immediate containment measures',
      'Establish 24/7 monitoring',
      'Deploy additional security controls',
      'Conduct emergency response planning',
      'Escalate to executive leadership',
    ],
    high: [
      'Prioritize mitigation within 30 days',
      'Implement compensating controls',
      'Increase monitoring frequency',
      'Develop incident response procedures',
    ],
    medium: [
      'Schedule mitigation within 90 days',
      'Review and enhance existing controls',
      'Implement regular monitoring',
    ],
    low: [
      'Monitor and review periodically',
      'Implement controls as part of regular maintenance',
      'Document risk acceptance rationale if applicable',
    ],
  }

  const priorityMap: Record<string, 'critical' | 'high' | 'medium' | 'low'> = {
    critical: 'critical',
    high: 'high',
    medium: 'medium',
    low: 'low',
  }

  return {
    riskId: risk.id,
    recommendations: recommendations[risk.risk_level] || recommendations.medium,
    priority: priorityMap[risk.risk_level] || 'medium',
    estimatedEffort: getEstimatedEffort(risk.risk_level),
    rationale: `Based on ${risk.risk_level} risk level with score ${risk.risk_score}`,
  }
}

/**
 * Get estimated effort based on risk level
 */
function getEstimatedEffort(riskLevel: string): string {
  const effortMap: Record<string, string> = {
    critical: '2-4 weeks',
    high: '4-8 weeks',
    medium: '8-12 weeks',
    low: '12+ weeks',
  }
  return effortMap[riskLevel] || 'TBD'
}

/**
 * Generate executive summary
 * AI translates technical risks to management language
 */
export async function generateExecutiveSummary(
  risks: Risk[],
  config: AIConfig = defaultConfig
): Promise<AIExecutiveSummary> {
  const distribution = {
    critical: risks.filter(r => r.risk_level === 'critical').length,
    high: risks.filter(r => r.risk_level === 'high').length,
    medium: risks.filter(r => r.risk_level === 'medium').length,
    low: risks.filter(r => r.risk_level === 'low').length,
  }

  const totalRisks = risks.length

  if (config.enabled && config.apiKey && totalRisks > 0) {
    try {
      const genAI = getGenerativeAI(config.apiKey)
      if (genAI) {
        const model = genAI.getGenerativeModel({ model: config.model || 'gemini-1.5-flash' })

        const risksSummary = risks.map(r => `- ${r.risk_title} (${r.risk_level})`).join('\n')

        const prompt = `
          As a Chief Information Security Officer (CISO), provide an executive summary of the following risk assessment findings. 
          Use OCTAVE Allegro methodology context.
          
          Risk Distribution:
          - Critical: ${distribution.critical}
          - High: ${distribution.high}
          - Medium: ${distribution.medium}
          - Low: ${distribution.low}
          
          Total Risks: ${totalRisks}
          
          Specific Risks:
          ${risksSummary}
          
          Requirements:
          1. Provide 3-5 key findings in management language.
          2. Provide 3-5 high-level strategic recommendations.
          3. Provide a concise overall assessment of the organizational risk posture (max 3 sentences).
          4. Format the response as JSON with fields: keyFindings (array), recommendations (array), overallAssessment (string).
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const aiResponse = JSON.parse(jsonMatch[0])
          return {
            totalRisks,
            criticalRisks: distribution.critical,
            highRisks: distribution.high,
            mediumRisks: distribution.medium,
            lowRisks: distribution.low,
            keyFindings: aiResponse.keyFindings || generateKeyFindings(distribution, totalRisks),
            recommendations: aiResponse.recommendations || generateRecommendations(distribution),
            overallAssessment: aiResponse.overallAssessment || generateOverallAssessment(distribution),
          }
        }
      }
    } catch (error) {
      console.error('Gemini AI Executive Summary Error:', error)
    }
  }

  // Generate key findings
  const keyFindings = generateKeyFindings(distribution, totalRisks)

  // Generate recommendations
  const recommendations = generateRecommendations(distribution)

  // Generate overall assessment
  const overallAssessment = generateOverallAssessment(distribution)

  return {
    totalRisks,
    criticalRisks: distribution.critical,
    highRisks: distribution.high,
    mediumRisks: distribution.medium,
    lowRisks: distribution.low,
    keyFindings,
    recommendations,
    overallAssessment,
  }
}

/**
 * Generate key findings based on risk distribution
 */
function generateKeyFindings(
  distribution: { critical: number; high: number; medium: number; low: number },
  total: number
): string[] {
  const findings: string[] = []

  if (distribution.critical > 0) {
    findings.push(`${distribution.critical} critical risk${distribution.critical > 1 ? 's' : ''} require immediate attention and remediation.`)
  }

  if (distribution.high > 0) {
    findings.push(`${distribution.high} high-risk item${distribution.high > 1 ? 's' : ''} should be prioritized for mitigation.`)
  }

  const highRiskPercentage = total > 0 ? ((distribution.critical + distribution.high) / total) * 100 : 0
  if (highRiskPercentage > 30) {
    findings.push('High concentration of elevated risks indicates significant security exposure.')
  }

  if (distribution.medium > distribution.high + distribution.critical) {
    findings.push('Majority of risks are at medium level, indicating manageable but notable exposure.')
  }

  if (findings.length === 0) {
    findings.push('Risk profile is within acceptable parameters with primarily low-level risks.')
  }

  return findings
}

/**
 * Generate recommendations based on risk distribution
 */
function generateRecommendations(
  distribution: { critical: number; high: number; medium: number; low: number }
): string[] {
  const recommendations: string[] = []

  if (distribution.critical > 0) {
    recommendations.push('Establish emergency response procedures for critical risks')
    recommendations.push('Allocate immediate resources for critical risk remediation')
  }

  if (distribution.high > 0) {
    recommendations.push('Develop prioritized mitigation roadmap for high-risk items')
    recommendations.push('Implement additional monitoring for high-risk areas')
  }

  recommendations.push('Continue regular risk assessment cycles')
  recommendations.push('Maintain documentation of risk treatment decisions')

  return recommendations
}

/**
 * Generate overall assessment text
 */
function generateOverallAssessment(
  distribution: { critical: number; high: number; medium: number; low: number }
): string {
  if (distribution.critical > 0) {
    return 'The organization faces critical security risks requiring immediate executive attention and resource allocation.'
  }

  if (distribution.high > distribution.medium) {
    return 'The organization has elevated risk exposure that should be addressed through prioritized mitigation efforts.'
  }

  if (distribution.medium > distribution.low) {
    return 'The organization maintains moderate risk levels with opportunities for improvement through planned mitigation activities.'
  }

  return 'The organization maintains a favorable risk posture with primarily low-level risks.'
}

/**
 * Translate technical risk description to management language
 */
export function translateToManagementLanguage(technicalDescription: string): string {
  // Simple translation mapping
  const translations: Record<string, string> = {
    'SQL injection': 'Database security vulnerability that could expose sensitive information',
    'Cross-site scripting': 'Web application weakness allowing malicious code execution',
    'Unauthorized access': 'Security gap permitting unapproved system entry',
    'Data breach': 'Incident potentially exposing confidential information',
    'Malware': 'Malicious software threatening system integrity',
    'Phishing': 'Deceptive attempts to obtain sensitive credentials',
    'Denial of service': 'Attack disrupting system availability',
    'Privilege escalation': 'Unauthorized elevation of user permissions',
  }

  let managementDescription = technicalDescription

  Object.entries(translations).forEach(([technical, management]) => {
    managementDescription = managementDescription.replace(
      new RegExp(technical, 'gi'),
      management
    )
  })

  return managementDescription
}

/**
 * Check if AI features are available
 */
export function isAIAvailable(config: AIConfig = defaultConfig): boolean {
  return config.enabled && (!!config.apiKey || !!process.env.GOOGLE_AI_API_KEY)
}
