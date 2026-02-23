"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Edit, Loader2, TrendingDown } from 'lucide-react'
import { Risk, RiskAnalysis } from '@/types'
import { calculateResidualRisk } from '@/lib/risk-engine'

interface Step7AnalysisProps {
  projectId: string
  profileId: string
}

export function Step7Analysis({ projectId, profileId }: Step7AnalysisProps) {
  const supabase = createClient() as any
  const [risks, setRisks] = useState<Risk[]>([])
  const [analyses, setAnalyses] = useState<Record<string, RiskAnalysis>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [analysisId, setAnalysisId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    existing_controls: '',
    control_effectiveness: 3,
    root_cause_analysis: '',
    potential_consequences: '',
    affected_stakeholders: '',
  })

  const [residualRisk, setResidualRisk] = useState({
    inherentScore: 0,
    residualScore: 0,
    reduction: 0,
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  useEffect(() => {
    if (selectedRisk) {
      const result = calculateResidualRisk(
        selectedRisk.likelihood,
        selectedRisk.impact,
        formData.control_effectiveness
      )
      setResidualRisk({
        inherentScore: result.inherentScore,
        residualScore: result.residualScore,
        reduction: Math.round(((result.inherentScore - result.residualScore) / result.inherentScore) * 100) || 0,
      })
    }
  }, [formData.control_effectiveness, selectedRisk])

  const loadData = async () => {
    try {
      const [risksRes, analysesRes] = await Promise.all([
        supabase
          .from('risks')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('risk_score', { ascending: false }),
        supabase
          .from('risk_analysis')
          .select('*')
          .eq('project_id', projectId),
      ])

      if (risksRes.error) throw risksRes.error
      if (analysesRes.error) throw analysesRes.error

      setRisks(risksRes.data || [])

      // Convert array to record
      const analysesRecord: Record<string, RiskAnalysis> = {};
      (analysesRes.data as any[])?.forEach((analysis: any) => {
        analysesRecord[analysis.risk_id] = analysis
      })
      setAnalyses(analysesRecord)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRisk) return

    setIsSaving(true)

    try {
      const analysisData = {
        risk_id: selectedRisk.id,
        project_id: projectId,
        analyzed_by: profileId, // Changed to use profileId prop
        ...formData,
      }

      if (analysisId) { // Changed from existingAnalysis
        const { error } = await supabase
          .from('risk_analysis')
          .update(analysisData)
          .eq('id', analysisId) // Changed to use analysisId

        if (error) throw error
        toast.success('Analysis updated successfully') // Updated toast message
      } else {
        const { data, error } = await supabase // Added data to capture inserted record
          .from('risk_analysis')
          .insert(analysisData)
          .select() // Added select to return the inserted record
          .single() // Added single to get a single record

        if (error) throw error
        toast.success('Analysis saved successfully') // Updated toast message
        if (data) setAnalysisId(data.id) // Set analysisId for subsequent updates
      }

      // Update risk status to analyzed
      await supabase
        .from('risks')
        .update({ status: 'analyzed' })
        .eq('id', selectedRisk.id)

      setIsDialogOpen(false)
      loadData()
    } catch (error: any) {
      console.error('Error saving analysis:', error)
      toast.error(error.message || 'Failed to save analysis')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (risk: Risk) => {
    setSelectedRisk(risk)
    const existingAnalysis = analyses[risk.id]

    if (existingAnalysis) {
      setAnalysisId(existingAnalysis.id)
      setFormData({
        existing_controls: existingAnalysis.existing_controls || '',
        control_effectiveness: existingAnalysis.control_effectiveness || 3,
        root_cause_analysis: existingAnalysis.root_cause_analysis || '',
        potential_consequences: existingAnalysis.potential_consequences || '',
        affected_stakeholders: existingAnalysis.affected_stakeholders || '',
      })
    } else {
      setAnalysisId(null)
      setFormData({
        existing_controls: '',
        control_effectiveness: 3,
        root_cause_analysis: '',
        potential_consequences: '',
        affected_stakeholders: '',
      })
    }

    setIsDialogOpen(true)
  }

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-muted-foreground">
          Analyze identified risks, assess existing controls, and calculate residual risk.
        </p>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No risks to analyze.</p>
            <p className="text-sm">Complete Step 6 to identify risks first.</p>
          </div>
        ) : (
          risks.map((risk) => {
            const analysis = analyses[risk.id]
            return (
              <Card key={risk.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskLevelColor(risk.risk_level)}`}>
                          {risk.risk_level}
                        </span>
                        <span className="text-lg font-semibold">
                          Score: {risk.risk_score}
                        </span>
                        {analysis && (
                          <span className="text-sm text-green-600 flex items-center gap-1">
                            <TrendingDown className="w-4 h-4" />
                            Residual: {analysis.residual_risk_score}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-medium mt-2">{risk.risk_title}</h3>

                      {analysis ? (
                        <div className="mt-3 space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Existing Controls:</span> {analysis.existing_controls || 'None documented'}</p>
                          <p><span className="text-muted-foreground">Control Effectiveness:</span> {analysis.control_effectiveness}/5</p>
                          <p><span className="text-muted-foreground">Root Cause:</span> {analysis.root_cause_analysis || 'Not analyzed'}</p>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-orange-600">Analysis pending</p>
                      )}
                    </div>
                    <div className="flex gap-1 ml-4">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(risk)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Analyze Risk: {selectedRisk?.risk_title}</DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                              <Label htmlFor="existing_controls">Existing Controls</Label>
                              <Textarea
                                id="existing_controls"
                                value={formData.existing_controls}
                                onChange={(e) => setFormData({ ...formData, existing_controls: e.target.value })}
                                placeholder="List existing security controls..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="control_effectiveness">Control Effectiveness (1-5)</Label>
                              <Select
                                value={String(formData.control_effectiveness)}
                                onValueChange={(v) => setFormData({ ...formData, control_effectiveness: Number(v) })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {[1, 2, 3, 4, 5].map((n) => (
                                    <SelectItem key={n} value={String(n)}>{n} - {n === 1 ? 'Ineffective' : n === 5 ? 'Highly Effective' : ''}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="root_cause_analysis">Root Cause Analysis</Label>
                              <Textarea
                                id="root_cause_analysis"
                                value={formData.root_cause_analysis}
                                onChange={(e) => setFormData({ ...formData, root_cause_analysis: e.target.value })}
                                placeholder="Analyze the root cause of this risk..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="potential_consequences">Potential Consequences</Label>
                              <Textarea
                                id="potential_consequences"
                                value={formData.potential_consequences}
                                onChange={(e) => setFormData({ ...formData, potential_consequences: e.target.value })}
                                placeholder="Describe potential consequences if risk materializes..."
                                rows={3}
                              />
                            </div>

                            <div>
                              <Label htmlFor="affected_stakeholders">Affected Stakeholders</Label>
                              <Textarea
                                id="affected_stakeholders"
                                value={formData.affected_stakeholders}
                                onChange={(e) => setFormData({ ...formData, affected_stakeholders: e.target.value })}
                                placeholder="List stakeholders who would be affected..."
                                rows={2}
                              />
                            </div>

                            <div className="border rounded-lg p-4 bg-muted/50">
                              <h4 className="font-medium mb-2">Residual Risk Calculation</h4>
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-sm text-muted-foreground">Inherent Risk</p>
                                  <p className="text-xl font-bold">{residualRisk.inherentScore}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Residual Risk</p>
                                  <p className="text-xl font-bold text-green-600">{residualRisk.residualScore}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-muted-foreground">Reduction</p>
                                  <p className="text-xl font-bold text-green-600">{residualRisk.reduction}%</p>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Analysis
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
