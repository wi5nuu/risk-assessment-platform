/**
 * PDF Report Generator
 * Generates enterprise-grade risk assessment reports
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ReportData, FinalRiskOpinion, Risk } from '@/types'
import { formatDate } from '@/lib/utils'
import { calculateRiskDistribution, determineFinalOpinion } from '@/lib/risk-engine'

/**
 * Generate comprehensive risk assessment report
 */
export async function generateRiskAssessmentReport(
  data: ReportData,
  type: 'executive' | 'detailed' | 'technical' = 'executive'
): Promise<Blob> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.width

  // Header
  generateHeader(doc, data)

  // Executive Summary
  generateExecutiveSummary(doc, data)

  // Scope and Methodology
  generateMethodologySection(doc)

  if (type === 'detailed' || type === 'technical') {
    // Asset Profile
    generateAssetProfile(doc, data)

    // Risk Analysis
    generateRiskAnalysis(doc, data)

    // Risk Matrix
    await generateRiskMatrixImage(doc, data)
  }

  // Risk Register
  generateRiskRegister(doc, data)

  // Mitigation Plan
  generateMitigationPlan(doc, data)

  // Final Opinion
  generateFinalOpinion(doc, data)

  // Footer
  generateFooter(doc)

  return doc.output('blob')
}

/**
 * Generate report header
 */
function generateHeader(doc: jsPDF, data: ReportData) {
  const pageWidth = doc.internal.pageSize.width

  // Platform Branding
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text('RISK SHIELD SYSTEM', pageWidth / 2, 15, { align: 'center' })

  // Title
  doc.setFontSize(24)
  doc.setTextColor(0, 0, 0)
  doc.text('Security Risk Assessment', pageWidth / 2, 30, { align: 'center' })

  // Subtitle
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.text(data.project.name, pageWidth / 2, 45, { align: 'center' })

  // Report info
  doc.setFontSize(10)
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 20, 60)
  doc.text(`Methodology: OCTAVE Allegro`, 20, 68)
  doc.text(`Status: ${data.project.status}`, 20, 76)

  // Line separator
  doc.setDrawColor(200, 200, 200)
  doc.line(20, 85, pageWidth - 20, 85)
}

/**
 * Generate executive summary section
 */
function generateExecutiveSummary(doc: jsPDF, data: ReportData) {
  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Executive Summary', 20, 100)

  const distribution = calculateRiskDistribution(data.risks)
  const finalOpinion = determineFinalOpinion(distribution)

  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)

  const summaryText = `
This risk assessment was conducted following the OCTAVE Allegro methodology to identify 
and evaluate information security risks facing the organization.

Key Findings:
• Total Risks Identified: ${data.risks.length}
• Critical Risks: ${distribution.critical}
• High Risks: ${distribution.high}
• Medium Risks: ${distribution.medium}
• Low Risks: ${distribution.low}

Overall Assessment: ${finalOpinion}
  `.trim()

  const splitText = doc.splitTextToSize(summaryText, 170)
  doc.text(splitText, 20, 115)
}

/**
 * Generate methodology section
 */
function generateMethodologySection(doc: jsPDF) {
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Methodology', 20, 30)

  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)

  const methodologyText = `
OCTAVE Allegro (Operationally Critical Threat, Asset, and Vulnerability Evaluation) 
is a risk assessment methodology developed by Carnegie Mellon University's 
Software Engineering Institute.

The assessment followed all 8 steps of the OCTAVE Allegro methodology:

1. Establish Risk Measurement Criteria
   - Defined impact criteria across four dimensions: Financial, Reputational, 
     Legal, and Operational
   - Established likelihood criteria on a 1-5 scale

2. Develop Information Asset Profile
   - Identified and cataloged all critical information assets
   - Assessed security attributes (Confidentiality, Integrity, Availability)

3. Identify Information Asset Containers
   - Mapped assets to their storage and processing locations
   - Documented existing security controls

4. Identify Areas of Concern
   - Documented potential weaknesses and vulnerabilities
   - Categorized concerns by security attribute

5. Identify Threat Scenarios
   - Developed realistic threat scenarios
   - Assessed threat actor capabilities and motivations

6. Identify Risks
   - Linked vulnerabilities to threats and assets
   - Calculated risk scores using Likelihood × Impact formula

7. Analyze Risks
   - Evaluated existing controls
   - Calculated residual risk

8. Select Mitigation Approach
   - Developed treatment strategies
   - Created implementation plans
  `.trim()

  const splitText = doc.splitTextToSize(methodologyText, 170)
  doc.text(splitText, 20, 50)
}

/**
 * Generate asset profile section
 */
function generateAssetProfile(doc: jsPDF, data: ReportData) {
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Information Asset Profile', 20, 30)

  const assetData = data.assets.map(asset => [
    asset.name,
    asset.asset_type,
    asset.classification || 'N/A',
    asset.overall_criticality?.toString() || 'N/A',
    asset.owner || 'N/A',
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Asset Name', 'Type', 'Classification', 'Criticality', 'Owner']],
    body: assetData,
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60] },
  })
}

/**
 * Generate risk analysis section
 */
function generateRiskAnalysis(doc: jsPDF, data: ReportData) {
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Risk Analysis', 20, 30)

  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)
  doc.text(`Total Risks Analyzed: ${data.risks.length}`, 20, 45)
}

/**
 * Generate risk matrix image
 */
async function generateRiskMatrixImage(doc: jsPDF, data: ReportData) {
  // This would generate a visual risk matrix
  // For now, we'll create a text-based representation

  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text('Risk Matrix', 20, 60)

  // Create a simple text matrix
  const matrix: string[][] = []
  for (let l = 5; l >= 1; l--) {
    const row: string[] = [`L${l}`]
    for (let i = 1; i <= 5; i++) {
      const score = l * i
      const count = data.risks.filter(r => r.likelihood === l && r.impact === i).length
      row.push(count > 0 ? `${score}(${count})` : `${score}`)
    }
    matrix.push(row)
  }

  autoTable(doc, {
    startY: 70,
    head: [['', 'I1', 'I2', 'I3', 'I4', 'I5']],
    body: matrix,
    theme: 'grid',
    headStyles: { fillColor: [80, 80, 80] },
    styles: { fontSize: 9, cellPadding: 3 },
  })

  doc.setFontSize(9)
  doc.text('L = Likelihood, I = Impact. Numbers in parentheses indicate risk count.', 20, 160)
}

/**
 * Generate risk register table
 */
function generateRiskRegister(doc: jsPDF, data: ReportData) {
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Risk Register', 20, 30)

  const riskData = data.risks.map(risk => [
    risk.risk_title.substring(0, 30),
    risk.risk_score.toString(),
    risk.risk_level.toUpperCase(),
    risk.likelihood.toString(),
    risk.impact.toString(),
    risk.status,
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Risk', 'Score', 'Level', 'L', 'I', 'Status']],
    body: riskData,
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60] },
    styles: { fontSize: 9 },
  })
}

/**
 * Generate mitigation plan section
 */
function generateMitigationPlan(doc: jsPDF, data: ReportData) {
  if (data.mitigationPlans.length === 0) return

  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Mitigation Plan', 20, 30)

  const mitigationData = data.mitigationPlans.map(plan => [
    plan.treatment_strategy.toUpperCase(),
    plan.mitigation_description.substring(0, 40),
    plan.priority.toUpperCase(),
    plan.status,
    plan.responsible_party || 'TBD',
  ])

  autoTable(doc, {
    startY: 40,
    head: [['Strategy', 'Description', 'Priority', 'Status', 'Owner']],
    body: mitigationData,
    theme: 'striped',
    headStyles: { fillColor: [60, 60, 60] },
    styles: { fontSize: 9 },
  })
}

/**
 * Generate final opinion section
 */
function generateFinalOpinion(doc: jsPDF, data: ReportData) {
  doc.addPage()

  doc.setFontSize(16)
  doc.setTextColor(0, 0, 0)
  doc.text('Final Risk Opinion', 20, 30)

  const distribution = calculateRiskDistribution(data.risks)
  const finalOpinion = determineFinalOpinion(distribution)

  // Color code based on opinion
  let opinionColor: [number, number, number] = [0, 128, 0] // Green
  if (finalOpinion === 'Immediate Remediation Required') {
    opinionColor = [255, 0, 0] // Red
  } else if (finalOpinion === 'High Risk Exposure') {
    opinionColor = [255, 165, 0] // Orange
  } else if (finalOpinion === 'Moderate Risk Exposure') {
    opinionColor = [255, 255, 0] // Yellow
  }

  doc.setFillColor(...opinionColor)
  doc.rect(20, 45, 170, 30, 'F')

  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.text(finalOpinion, 105, 65, { align: 'center' })

  doc.setFontSize(11)
  doc.setTextColor(60, 60, 60)

  const opinionText = getOpinionDescription(finalOpinion)
  const splitText = doc.splitTextToSize(opinionText, 170)
  doc.text(splitText, 20, 95)
}

/**
 * Get description for final opinion
 */
function getOpinionDescription(opinion: string): string {
  const descriptions: Record<string, string> = {
    'Immediate Remediation Required':
      'The organization faces critical security risks that require immediate attention and resource allocation. ' +
      'Executive leadership should be informed, and emergency response procedures should be activated.',
    'High Risk Exposure':
      'The organization has elevated risk exposure that should be addressed through prioritized mitigation efforts. ' +
      'Risk treatment plans should be developed and implemented within defined timeframes.',
    'Moderate Risk Exposure':
      'The organization maintains moderate risk levels with opportunities for improvement through planned mitigation activities. ' +
      'Continue monitoring and implement controls as scheduled.',
    'Acceptable Risk Level':
      'The organization maintains a favorable risk posture with primarily low-level risks. ' +
      'Continue regular risk assessment cycles and maintain current security controls.',
  }

  return descriptions[opinion] || 'Risk assessment completed. Review findings and implement recommendations.'
}

/**
 * Generate report footer
 */
function generateFooter(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `OCTAVE Allegro Risk Assessment Report - Page ${i} of ${pageCount}`,
      20,
      doc.internal.pageSize.height - 10
    )
    doc.text(
      'Confidential - For Internal Use Only',
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    )
  }
}

/**
 * Download report as PDF
 */
export async function downloadReport(
  data: ReportData,
  filename?: string
): Promise<void> {
  const blob = await generateRiskAssessmentReport(data)
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename || `risk-assessment-${data.project.name}-${formatDate(new Date().toISOString())}.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
