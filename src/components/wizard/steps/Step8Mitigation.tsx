"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { Plus, Edit, Loader2, CheckCircle } from 'lucide-react'
import { Risk, MitigationPlan, TreatmentStrategy } from '@/types'

interface Step8MitigationProps {
  projectId: string
  profileId: string
}

const treatmentStrategies: { value: TreatmentStrategy; label: string }[] = [
  { value: 'mitigate', label: 'Mitigate - Reduce likelihood or impact' },
  { value: 'transfer', label: 'Transfer - Shift risk to third party' },
  { value: 'accept', label: 'Accept - Acknowledge and monitor' },
  { value: 'avoid', label: 'Avoid - Eliminate the risk' },
]

const mitigationPriorities = [
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const mitigationStatuses = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'implemented', label: 'Implemented' },
  { value: 'verified', label: 'Verified' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function Step8Mitigation({ projectId, profileId }: Step8MitigationProps) {
  const supabase = createClient() as any
  const [risks, setRisks] = useState<Risk[]>([])
  const [mitigationPlans, setMitigationPlans] = useState<Record<string, MitigationPlan[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [editingPlan, setEditingPlan] = useState<MitigationPlan | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    treatment_strategy: 'mitigate' as TreatmentStrategy,
    mitigation_description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    estimated_cost: '',
    implementation_timeline: '',
    responsible_party: '',
    status: 'planned' as 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled',
    planned_start_date: '',
    planned_completion_date: '',
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [risksRes, plansRes] = await Promise.all([
        supabase
          .from('risks')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('risk_score', { ascending: false }),
        supabase
          .from('mitigation_plans')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
      ])

      if (risksRes.error) throw risksRes.error
      if (plansRes.error) throw plansRes.error

      setRisks(risksRes.data || [])

      // Group plans by risk_id
      const plansByRisk: Record<string, MitigationPlan[]> = {};
      (plansRes.data as any[])?.forEach((plan: any) => {
        if (!plansByRisk[plan.risk_id]) plansByRisk[plan.risk_id] = []
        plansByRisk[plan.risk_id].push(plan)
      })
      setMitigationPlans(plansByRisk)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRisk) return

    try {
      if (!profileId) {
        toast.error('User profile not found. Please try logging in again.')
        return
      }

      const planData = {
        risk_id: selectedRisk.id,
        project_id: projectId,
        created_by: profileId,
        ...formData,
        planned_start_date: formData.planned_start_date || null,
        planned_completion_date: formData.planned_completion_date || null,
      }

      if (editingPlan) {
        const { error } = await supabase
          .from('mitigation_plans')
          .update(planData)
          .eq('id', editingPlan.id)

        if (error) throw error
        toast.success('Mitigation plan updated successfully')
      } else {
        const { error } = await supabase
          .from('mitigation_plans')
          .insert(planData)

        if (error) throw error
        toast.success('Mitigation plan created successfully')
      }

      // Update risk status
      await supabase
        .from('risks')
        .update({ status: formData.status === 'implemented' || formData.status === 'verified' ? 'mitigating' : 'analyzed' })
        .eq('id', selectedRisk.id)

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error('Failed to save mitigation plan')
    } finally {
      setIsSaving(false)
    }
  }

  const handleEdit = (risk: Risk, plan?: MitigationPlan) => {
    setSelectedRisk(risk)

    if (plan) {
      setEditingPlan(plan)
      setFormData({
        treatment_strategy: plan.treatment_strategy,
        mitigation_description: plan.mitigation_description,
        priority: plan.priority,
        estimated_cost: plan.estimated_cost || '',
        implementation_timeline: plan.implementation_timeline || '',
        responsible_party: plan.responsible_party || '',
        status: plan.status,
        planned_start_date: plan.planned_start_date || '',
        planned_completion_date: plan.planned_completion_date || '',
      })
    } else {
      setEditingPlan(null)
      resetForm()
    }

    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      treatment_strategy: 'mitigate',
      mitigation_description: '',
      priority: 'medium',
      estimated_cost: '',
      implementation_timeline: '',
      responsible_party: '',
      status: 'planned',
      planned_start_date: '',
      planned_completion_date: '',
    })
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

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'mitigate': return 'bg-blue-100 text-blue-800'
      case 'transfer': return 'bg-purple-100 text-purple-800'
      case 'accept': return 'bg-yellow-100 text-yellow-800'
      case 'avoid': return 'bg-red-100 text-red-800'
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
          Develop mitigation plans for identified risks. Select appropriate treatment strategies.
        </p>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No risks to mitigate.</p>
            <p className="text-sm">Complete previous steps to identify risks first.</p>
          </div>
        ) : (
          risks.map((risk) => {
            const plans = mitigationPlans[risk.id] || []
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
                      </div>
                      <h3 className="text-lg font-medium mt-2">{risk.risk_title}</h3>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={() => handleEdit(risk)} size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Plan
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingPlan ? 'Edit Mitigation Plan' : 'Add Mitigation Plan'} for {selectedRisk?.risk_title}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                          <div>
                            <Label htmlFor="treatment_strategy">Treatment Strategy *</Label>
                            <Select
                              value={formData.treatment_strategy}
                              onValueChange={(v) => setFormData({ ...formData, treatment_strategy: v as TreatmentStrategy })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {treatmentStrategies.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="mitigation_description">Mitigation Description *</Label>
                            <Textarea
                              id="mitigation_description"
                              value={formData.mitigation_description}
                              onChange={(e) => setFormData({ ...formData, mitigation_description: e.target.value })}
                              placeholder="Describe the mitigation action..."
                              required
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="priority">Priority</Label>
                              <Select
                                value={formData.priority}
                                onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' | 'critical' })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {mitigationPriorities.map((p) => (
                                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="status">Status</Label>
                              <Select
                                value={formData.status}
                                onValueChange={(v) => setFormData({ ...formData, status: v as 'planned' | 'in_progress' | 'implemented' | 'verified' | 'cancelled' })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {mitigationStatuses.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="estimated_cost">Estimated Cost</Label>
                              <Input
                                id="estimated_cost"
                                value={formData.estimated_cost}
                                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                                placeholder="e.g., $10,000"
                              />
                            </div>

                            <div>
                              <Label htmlFor="implementation_timeline">Timeline</Label>
                              <Input
                                id="implementation_timeline"
                                value={formData.implementation_timeline}
                                onChange={(e) => setFormData({ ...formData, implementation_timeline: e.target.value })}
                                placeholder="e.g., 3 months"
                              />
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="responsible_party">Responsible Party</Label>
                            <Input
                              id="responsible_party"
                              value={formData.responsible_party}
                              onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                              placeholder="Name or department responsible"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="planned_start_date">Planned Start Date</Label>
                              <Input
                                id="planned_start_date"
                                type="date"
                                value={formData.planned_start_date}
                                onChange={(e) => setFormData({ ...formData, planned_start_date: e.target.value })}
                              />
                            </div>

                            <div>
                              <Label htmlFor="planned_completion_date">Planned Completion Date</Label>
                              <Input
                                id="planned_completion_date"
                                type="date"
                                value={formData.planned_completion_date}
                                onChange={(e) => setFormData({ ...formData, planned_completion_date: e.target.value })}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                              Cancel
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              {editingPlan ? 'Update' : 'Create'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Existing Plans */}
                  {plans.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Mitigation Plans:</p>
                      {plans.map((plan) => (
                        <div key={plan.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStrategyColor(plan.treatment_strategy)}`}>
                              {plan.treatment_strategy}
                            </span>
                            <span className="text-sm">{plan.mitigation_description.substring(0, 60)}...</span>
                            <span className={`px-2 py-1 rounded text-xs ${plan.status === 'implemented' || plan.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
                              {plan.status}
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(risk, plan)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardHeader>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
