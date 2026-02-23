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
import { Plus, Edit, Trash2, Loader2, Calculator } from 'lucide-react'
import { Risk, ThreatScenario, Asset } from '@/types'
import { calculateRiskScore, determineRiskLevel } from '@/lib/risk-engine'

interface Step6RisksProps {
  projectId: string
}

export function Step6Risks({ projectId }: Step6RisksProps) {
  const supabase = createClient() as any
  const [risks, setRisks] = useState<Risk[]>([])
  const [scenarios, setScenarios] = useState<ThreatScenario[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRisk, setEditingRisk] = useState<Risk | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    asset_id: '',
    threat_scenario_id: '',
    risk_title: '',
    risk_description: '',
    vulnerability_description: '',
    likelihood: 3,
    impact: 3,
    financial_impact: 3,
    reputational_impact: 3,
    legal_impact: 3,
    operational_impact: 3,
    owner: '',
    review_date: '',
  })

  const [calculatedScore, setCalculatedScore] = useState(9)
  const [calculatedLevel, setCalculatedLevel] = useState('medium')

  useEffect(() => {
    loadData()
  }, [projectId])

  useEffect(() => {
    // Calculate risk score when likelihood or impact changes
    const maxImpact = Math.max(
      formData.financial_impact,
      formData.reputational_impact,
      formData.legal_impact,
      formData.operational_impact
    )
    const score = calculateRiskScore(formData.likelihood, maxImpact)
    setCalculatedScore(score)
    setCalculatedLevel(determineRiskLevel(score))
  }, [formData.likelihood, formData.financial_impact, formData.reputational_impact, formData.legal_impact, formData.operational_impact])

  const loadData = async () => {
    try {
      const [risksRes, scenariosRes, assetsRes] = await Promise.all([
        supabase
          .from('risks')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('risk_score', { ascending: false }),
        supabase
          .from('threat_scenarios')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
        supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
      ])

      if (risksRes.error) throw risksRes.error
      if (scenariosRes.error) throw scenariosRes.error
      if (assetsRes.error) throw assetsRes.error

      setRisks(risksRes.data || [])
      setScenarios(scenariosRes.data || [])
      setAssets(assetsRes.data || [])
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      const maxImpact = Math.max(
        formData.financial_impact,
        formData.reputational_impact,
        formData.legal_impact,
        formData.operational_impact
      )

      const riskData = {
        ...formData,
        impact: maxImpact,
      }

      if (editingRisk) {
        const { error } = await supabase
          .from('risks')
          .update(riskData)
          .eq('id', editingRisk.id)

        if (error) throw error
        toast.success('Risk updated successfully')
      } else {
        const { error } = await supabase
          .from('risks')
          .insert({
            project_id: projectId,
            identified_by: userData.user?.id,
            ...riskData,
          })

        if (error) throw error
        toast.success('Risk created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(editingRisk ? 'Failed to update risk' : 'Failed to create risk')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (risk: Risk) => {
    if (!confirm('Are you sure you want to delete this risk?')) return

    try {
      const { error } = await supabase
        .from('risks')
        .update({ is_active: false })
        .eq('id', risk.id)

      if (error) throw error
      toast.success('Risk deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete risk')
    }
  }

  const handleEdit = (risk: Risk) => {
    setEditingRisk(risk)
    setFormData({
      asset_id: risk.asset_id,
      threat_scenario_id: risk.threat_scenario_id,
      risk_title: risk.risk_title,
      risk_description: risk.risk_description || '',
      vulnerability_description: risk.vulnerability_description,
      likelihood: risk.likelihood,
      impact: risk.impact,
      financial_impact: risk.financial_impact || 3,
      reputational_impact: risk.reputational_impact || 3,
      legal_impact: risk.legal_impact || 3,
      operational_impact: risk.operational_impact || 3,
      owner: risk.owner || '',
      review_date: risk.review_date || '',
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingRisk(null)
    setFormData({
      asset_id: '',
      threat_scenario_id: '',
      risk_title: '',
      risk_description: '',
      vulnerability_description: '',
      likelihood: 3,
      impact: 3,
      financial_impact: 3,
      reputational_impact: 3,
      legal_impact: 3,
      operational_impact: 3,
      owner: '',
      review_date: '',
    })
  }

  const openNewRiskDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getAssetName = (assetId: string) => assets.find(a => a.id === assetId)?.name || 'Unknown'
  const getScenarioDescription = (scenarioId: string) => {
    const scenario = scenarios.find(s => s.id === scenarioId)
    return scenario ? scenario.scenario_description.substring(0, 50) + '...' : 'Unknown'
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
          Identify and document risks based on threat scenarios. Risk scores are calculated automatically.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewRiskDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Risk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRisk ? 'Edit Risk' : 'Add New Risk'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="risk_title">Risk Title *</Label>
                  <Input
                    id="risk_title"
                    value={formData.risk_title}
                    onChange={(e) => setFormData({ ...formData, risk_title: e.target.value })}
                    required
                    placeholder="e.g., Unauthorized access to customer database"
                  />
                </div>

                <div>
                  <Label htmlFor="asset_id">Affected Asset *</Label>
                  <Select
                    value={formData.asset_id}
                    onValueChange={(v) => setFormData({ ...formData, asset_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="threat_scenario_id">Threat Scenario *</Label>
                  <Select
                    value={formData.threat_scenario_id}
                    onValueChange={(v) => setFormData({ ...formData, threat_scenario_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarios.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {getScenarioDescription(scenario.id)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="vulnerability_description">Vulnerability Description *</Label>
                  <Textarea
                    id="vulnerability_description"
                    value={formData.vulnerability_description}
                    onChange={(e) => setFormData({ ...formData, vulnerability_description: e.target.value })}
                    required
                    placeholder="Describe the vulnerability that could be exploited..."
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="risk_description">Risk Description</Label>
                  <Textarea
                    id="risk_description"
                    value={formData.risk_description}
                    onChange={(e) => setFormData({ ...formData, risk_description: e.target.value })}
                    placeholder="Additional details about the risk..."
                  />
                </div>

                <div>
                  <Label>Likelihood</Label>
                  <Select
                    value={String(formData.likelihood)}
                    onValueChange={(v) => setFormData({ ...formData, likelihood: Number(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Owner</Label>
                  <Input
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                    placeholder="Risk owner name"
                  />
                </div>
              </div>

              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Impact Values (Max will be used)
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs">Financial</Label>
                    <Select
                      value={String(formData.financial_impact)}
                      onValueChange={(v) => setFormData({ ...formData, financial_impact: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Reputational</Label>
                    <Select
                      value={String(formData.reputational_impact)}
                      onValueChange={(v) => setFormData({ ...formData, reputational_impact: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Legal</Label>
                    <Select
                      value={String(formData.legal_impact)}
                      onValueChange={(v) => setFormData({ ...formData, legal_impact: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">Operational</Label>
                    <Select
                      value={String(formData.operational_impact)}
                      onValueChange={(v) => setFormData({ ...formData, operational_impact: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Calculated Risk Score:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold">{calculatedScore}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getRiskLevelColor(calculatedLevel)}`}>
                      {calculatedLevel}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingRisk ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No risks identified yet.</p>
            <p className="text-sm">Click &quot;Add Risk&quot; to identify risks from threat scenarios.</p>
          </div>
        ) : (
          risks.map((risk) => (
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
                      <span className="text-sm text-muted-foreground capitalize">
                        Status: {risk.status}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium mt-2">{risk.risk_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Asset: {getAssetName(risk.asset_id)}
                    </p>
                    <p className="mt-2 text-sm">{risk.vulnerability_description}</p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(risk)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(risk)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
