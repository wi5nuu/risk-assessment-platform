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

  // AI Strategic Insights (If available)
  if (data.aiAnalysis) {
    generateAIInsights(doc, data)
  }

  // Add Page Frame (Subtle)
  generatePageFrames(doc)

  // Footer
  generateFooter(doc)

  return doc.output('blob')
}

/**
 * Add a subtle professional frame to all pages
 */
function generatePageFrames(doc: jsPDF) {
  const pageCount = doc.getNumberOfPages()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setDrawColor(241, 245, 249) // Slate-100
    doc.setLineWidth(0.1)
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20)
  }
}

/**
 * Generate report header
 */
function generateHeader(doc: jsPDF, data: ReportData) {
  const pageWidth = doc.internal.pageSize.width

  // Platform Branding
  doc.setFillColor(15, 23, 42) // Slate-900
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setFontSize(10)
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.text('RISK SHIELD SYSTEM', 20, 25)

  doc.setFontSize(8)
  doc.setTextColor(200, 200, 200)
  doc.setFont('helvetica', 'normal')
  doc.text('CONFIDENTIAL SECURITY REPORT', pageWidth - 20, 25, { align: 'right' })

  // Main Category
  doc.setFontSize(22)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('Security Risk Assessment', 20, 60)

  // Project Name
  doc.setFontSize(14)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text(data.project.name, 20, 72)

  // Metadata Table Info
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  const metaY = 85
  doc.text(`Project ID: ${data.project.id.slice(0, 8).toUpperCase()}`, 20, metaY)
  doc.text(`Generated: ${formatDate(new Date().toISOString())}`, 80, metaY)
  doc.text(`Methodology: OCTAVE Allegro`, 140, metaY)

  // Line separator
  doc.setDrawColor(226, 232, 240) // Slate-200
  doc.setLineWidth(0.5)
  doc.line(20, 95, pageWidth - 20, 95)
}

/**
 * Generate executive summary section
 */
function generateExecutiveSummary(doc: jsPDF, data: ReportData) {
  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('1. Executive Summary', 20, 110)

  const distribution = calculateRiskDistribution(data.risks)
  const finalOpinion = determineFinalOpinion(distribution)

  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85)
  doc.setFont('helvetica', 'normal')

  const summaryIntro = `This comprehensive security risk assessment was conducted using the OCTAVE Allegro methodology. The objective was to identify, analyze, and prioritize information security assets and their associated threat scenarios.`
  const splitIntro = doc.splitTextToSize(summaryIntro, 170)
  doc.text(splitIntro, 20, 120)

  // Key Statistics Box
  doc.setFillColor(248, 250, 252)
  doc.rect(20, 135, 170, 45, 'F')
  doc.setDrawColor(226, 232, 240)
  doc.rect(20, 135, 170, 45, 'S')

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.text('RISK METRICS OVERVIEW', 25, 145)

  doc.setFont('helvetica', 'normal')
  doc.text(`Total Risks Identified: ${data.risks.length}`, 30, 155)
  doc.text(`Critical Severity: ${distribution.critical}`, 30, 162)
  doc.text(`High Severity: ${distribution.high}`, 30, 169)

  doc.text(`Medium Severity: ${distribution.medium}`, 110, 155)
  doc.text(`Low Severity: ${distribution.low}`, 110, 162)
  doc.text(`Overall Posture: ${finalOpinion}`, 110, 169)
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

  doc.setFontSize(14)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('Final Risk Opinion', 20, 30)

  const distribution = calculateRiskDistribution(data.risks)
  const finalOpinion = determineFinalOpinion(distribution)

  // Color code based on opinion
  let opinionColor: [number, number, number] = [16, 185, 129] // Emerald-500
  if (finalOpinion === 'Immediate Remediation Required') {
    opinionColor = [239, 68, 68] // Red-500
  } else if (finalOpinion === 'High Risk Exposure') {
    opinionColor = [249, 115, 22] // Orange-500
  } else if (finalOpinion === 'Moderate Risk Exposure') {
    opinionColor = [234, 179, 8] // Yellow-500
  }

  // Modern Opinion Card
  doc.setDrawColor(...opinionColor)
  doc.setLineWidth(2)
  doc.line(20, 40, 20, 70)

  doc.setFillColor(248, 250, 252)
  doc.rect(21, 40, 169, 30, 'F')

  doc.setFontSize(12)
  doc.setTextColor(...opinionColor)
  doc.setFont('helvetica', 'bold')
  doc.text(finalOpinion.toUpperCase(), 30, 52)

  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.setFont('helvetica', 'normal')
  doc.text('Assessor Final Recommendation', 30, 62)

  const opinionText = getOpinionDescription(finalOpinion)
  const splitText = doc.splitTextToSize(opinionText, 170)
  doc.text(splitText, 20, 85)

  // Signature Area
  doc.setFontSize(9)
  doc.text('Authorized Signature:', 20, 130)
  doc.line(20, 150, 80, 150)
  doc.text('Chief Information Security Officer (CISO)', 20, 155)
}

/**
 * Generate AI Insights section
 */
/**
 * Generate AI Insights section
 */
function generateAIInsights(doc: jsPDF, data: ReportData) {
  if (!data.aiAnalysis) return

  doc.addPage()
  const pageWidth = doc.internal.pageSize.width
  const pageHeight = doc.internal.pageSize.height

  // Professional Header for AI Section
  doc.setFillColor(248, 250, 252) // Slate-50 Header
  doc.rect(0, 0, pageWidth, 45, 'F')

  doc.setFontSize(20)
  doc.setTextColor(15, 23, 42) // Slate-900
  doc.setFont('helvetica', 'bold')
  doc.text('AI Strategic Intelligence', 20, 30)

  doc.setFontSize(9)
  doc.setTextColor(59, 130, 246) // Blue-500
  doc.setFont('helvetica', 'bold')
  doc.text('PREMIUM GENERATIVE SECURITY ANALYSIS', 20, 40)

  // 1. Strategic Executive Summary
  let yPos = 60
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('1. STRATEGIC EXECUTIVE SUMMARY', 20, yPos)

  yPos += 10
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(51, 65, 85) // Slate-600

  const summaryText = data.aiAnalysis.summary
  const splitSummary = doc.splitTextToSize(summaryText, 170)
  doc.text(splitSummary, 20, yPos)

  // Calculate next Y position based on summary length
  yPos += (splitSummary.length * 5) + 15

  // 2. Critical Priorities
  if (yPos > pageHeight - 40) { doc.addPage(); yPos = 30; }
  doc.setFontSize(12)
  doc.setTextColor(15, 23, 42)
  doc.setFont('helvetica', 'bold')
  doc.text('2. CRITICAL PRIORITIES & ANALOGIES', 20, yPos)

  yPos += 10

  data.aiAnalysis.priorities.forEach((p, idx) => {
    // Check for page break
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 30
    }

    // Priority Card
    doc.setFillColor(241, 245, 249) // Slate-100
    doc.rect(20, yPos, 170, 45, 'F')
    doc.setDrawColor(226, 232, 240) // Slate-200
    doc.rect(20, yPos, 170, 45, 'S')

    doc.setFontSize(8)
    doc.setTextColor(59, 130, 246)
    doc.text(`PRIORITY #${p.id} | SEVERITY: ${p.severity.toUpperCase()}`, 25, yPos + 10)

    doc.setFontSize(10)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text(p.title, 25, yPos + 20)

    doc.setFontSize(9)
    doc.setTextColor(71, 85, 105)
    doc.setFont('helvetica', 'italic')
    const analogyLines = doc.splitTextToSize(`"${p.analogy}"`, 160)
    doc.text(analogyLines, 25, yPos + 30)

    yPos += 55
    doc.setFont('helvetica', 'normal')
  })

  // 3. Strategic Roadmap
  if (data.aiAnalysis.strategic_roadmap) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = 30
    } else {
      yPos += 10
    }

    doc.setFontSize(12)
    doc.setTextColor(15, 23, 42)
    doc.setFont('helvetica', 'bold')
    doc.text('3. MANAGEMENT STRATEGIC ROADMAP', 20, yPos)

    yPos += 10
    data.aiAnalysis.strategic_roadmap.forEach((step, idx) => {
      if (yPos > pageHeight - 20) { doc.addPage(); yPos = 30; }

      doc.setFillColor(248, 250, 252)
      doc.rect(20, yPos, 170, 12, 'F')

      doc.setFontSize(9)
      doc.setTextColor(59, 130, 246)
      doc.setFont('helvetica', 'bold')
      doc.text(`${idx + 1}`, 25, yPos + 8)

      doc.setTextColor(51, 65, 85)
      doc.setFont('helvetica', 'normal')
      doc.text(step, 35, yPos + 8)

      yPos += 15
    })
  }
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

    // "Simple but Powerful" Pagination Logic
    const pageLabel = pageCount === 1 ? 'Page 1' : `Page ${i} of ${pageCount}`

    doc.text(
      `OCTAVE Allegro Risk Assessment | ${pageLabel}`,
      20,
      doc.internal.pageSize.height - 15
    )

    doc.text(
      'CONFIDENTIAL | RISK SHIELD SYSTEM',
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 15,
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
