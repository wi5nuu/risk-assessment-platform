"use client"

import React from 'react'
import { Risk, RiskLevel } from '@/types'
import { 
  generateRiskMatrix, 
  getRiskMatrixCellColor, 
  determineRiskLevel 
} from '@/lib/risk-engine'
import { cn } from '@/lib/utils'

interface RiskMatrixProps {
  risks: Risk[]
  onCellClick?: (likelihood: number, impact: number, risks: Risk[]) => void
  className?: string
  readOnly?: boolean
}

interface MatrixCell {
  likelihood: number
  impact: number
  score: number
  level: RiskLevel
  risks: Risk[]
}

export function RiskMatrix({ 
  risks, 
  onCellClick, 
  className,
  readOnly = false 
}: RiskMatrixProps) {
  // Generate the base matrix structure
  const baseMatrix = generateRiskMatrix()
  
  // Group risks by their likelihood and impact
  const risksByPosition = risks.reduce((acc, risk) => {
    const key = `${risk.likelihood}-${risk.impact}`
    if (!acc[key]) acc[key] = []
    acc[key].push(risk)
    return acc
  }, {} as Record<string, Risk[]>)
  
  // Build the matrix with actual risks
  const matrix: MatrixCell[] = baseMatrix.map(cell => ({
    ...cell,
    risks: risksByPosition[`${cell.likelihood}-${cell.impact}`] || []
  }))
  
  // Group by likelihood for rows (5 to 1)
  const likelihoodLevels = [5, 4, 3, 2, 1]
  const impactLevels = [1, 2, 3, 4, 5]
  
  const getCell = (likelihood: number, impact: number): MatrixCell => {
    return matrix.find(c => c.likelihood === likelihood && c.impact === impact) || {
      likelihood,
      impact,
      score: likelihood * impact,
      level: determineRiskLevel(likelihood * impact),
      risks: []
    }
  }
  
  const handleCellClick = (cell: MatrixCell) => {
    if (!readOnly && onCellClick) {
      onCellClick(cell.likelihood, cell.impact, cell.risks)
    }
  }
  
  return (
    <div className={cn("w-full", className)}>
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">Risk Matrix</h3>
        <p className="text-sm text-muted-foreground">
          Likelihood vs Impact Analysis
        </p>
      </div>
      
      <div className="flex">
        {/* Y-axis label */}
        <div className="flex items-center mr-4">
          <span 
            className="text-sm font-medium text-muted-foreground whitespace-nowrap"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            Likelihood
          </span>
        </div>
        
        <div className="flex-1">
          {/* Matrix grid */}
          <div className="grid grid-cols-6 gap-1">
            {/* Header row - Impact labels */}
            <div className="w-12"></div>
            {impactLevels.map(impact => (
              <div 
                key={`impact-${impact}`}
                className="text-center text-xs font-medium text-muted-foreground py-1"
              >
                {impact}
              </div>
            ))}
            
            {/* Matrix rows */}
            {likelihoodLevels.map(likelihood => (
              <React.Fragment key={`row-${likelihood}`}>
                {/* Likelihood label */}
                <div className="flex items-center justify-center text-xs font-medium text-muted-foreground w-12">
                  {likelihood}
                </div>
                
                {/* Cells */}
                {impactLevels.map(impact => {
                  const cell = getCell(likelihood, impact)
                  const hasRisks = cell.risks.length > 0
                  
                  return (
                    <div
                      key={`cell-${likelihood}-${impact}`}
                      onClick={() => handleCellClick(cell)}
                      className={cn(
                        "relative h-16 rounded-md flex flex-col items-center justify-center transition-all",
                        !readOnly && "cursor-pointer hover:opacity-80",
                        hasRisks && "ring-2 ring-offset-1 ring-primary"
                      )}
                      style={{ backgroundColor: getRiskMatrixCellColor(cell.level) }}
                    >
                      <span className="text-white font-bold text-lg">
                        {cell.score}
                      </span>
                      {hasRisks && (
                        <span className="text-white text-xs font-medium">
                          {cell.risks.length} risk{cell.risks.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
          
          {/* X-axis label */}
          <div className="text-center mt-2">
            <span className="text-sm font-medium text-muted-foreground">
              Impact
            </span>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {[
          { level: 'low' as RiskLevel, label: 'Low (1-5)', color: '#22c55e' },
          { level: 'medium' as RiskLevel, label: 'Medium (6-10)', color: '#eab308' },
          { level: 'high' as RiskLevel, label: 'High (11-15)', color: '#f97316' },
          { level: 'critical' as RiskLevel, label: 'Critical (16-25)', color: '#ef4444' },
        ].map(item => (
          <div key={item.level} className="flex items-center gap-2">
            <div 
              className="w-4 h-4 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
