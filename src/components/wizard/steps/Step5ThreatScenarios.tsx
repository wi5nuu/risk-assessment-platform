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
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import { ThreatScenario, Concern, Asset, Container, ThreatActorType } from '@/types'

interface Step5ThreatScenariosProps {
  projectId: string
}

const threatActorTypes: { value: ThreatActorType; label: string }[] = [
  { value: 'external_attacker', label: 'External Attacker' },
  { value: 'internal_attacker', label: 'Internal Attacker' },
  { value: 'competitor', label: 'Competitor' },
  { value: 'nation_state', label: 'Nation State' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'terrorist', label: 'Terrorist' },
  { value: 'activist', label: 'Activist' },
  { value: 'insider', label: 'Insider' },
  { value: 'accidental', label: 'Accidental' },
]

export function Step5ThreatScenarios({ projectId }: Step5ThreatScenariosProps) {
  const supabase = createClient() as any
  const [scenarios, setScenarios] = useState<ThreatScenario[]>([])
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [containers, setContainers] = useState<Container[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingScenario, setEditingScenario] = useState<ThreatScenario | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    concern_id: '',
    asset_id: '',
    container_id: '',
    scenario_description: '',
    threat_actor: '',
    threat_actor_type: '' as ThreatActorType,
    threat_vector: '',
    motivation: '',
    capability: '' as 'low' | 'medium' | 'high',
    likelihood: 3,
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [scenariosRes, concernsRes, assetsRes, containersRes] = await Promise.all([
        supabase
          .from('threat_scenarios')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('concerns')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
        supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
        supabase
          .from('containers')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
      ])

      if (scenariosRes.error) throw scenariosRes.error
      if (concernsRes.error) throw concernsRes.error
      if (assetsRes.error) throw assetsRes.error
      if (containersRes.error) throw containersRes.error

      setScenarios(scenariosRes.data || [])
      setConcerns(concernsRes.data || [])
      setAssets(assetsRes.data || [])
      setContainers(containersRes.data || [])
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

      if (editingScenario) {
        const { error } = await supabase
          .from('threat_scenarios')
          .update(formData)
          .eq('id', editingScenario.id)

        if (error) throw error
        toast.success('Threat scenario updated successfully')
      } else {
        const { error } = await supabase
          .from('threat_scenarios')
          .insert({
            project_id: projectId,
            created_by: userData.user?.id,
            ...formData,
          })

        if (error) throw error
        toast.success('Threat scenario created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(editingScenario ? 'Failed to update scenario' : 'Failed to create scenario')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (scenario: ThreatScenario) => {
    if (!confirm('Are you sure you want to delete this threat scenario?')) return

    try {
      const { error } = await supabase
        .from('threat_scenarios')
        .update({ is_active: false })
        .eq('id', scenario.id)

      if (error) throw error
      toast.success('Threat scenario deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete scenario')
    }
  }

  const handleEdit = (scenario: ThreatScenario) => {
    setEditingScenario(scenario)
    setFormData({
      concern_id: scenario.concern_id,
      asset_id: scenario.asset_id,
      container_id: scenario.container_id,
      scenario_description: scenario.scenario_description,
      threat_actor: scenario.threat_actor || '',
      threat_actor_type: scenario.threat_actor_type || 'external_attacker',
      threat_vector: scenario.threat_vector || '',
      motivation: scenario.motivation || '',
      capability: scenario.capability || 'medium',
      likelihood: scenario.likelihood || 3,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingScenario(null)
    setFormData({
      concern_id: '',
      asset_id: '',
      container_id: '',
      scenario_description: '',
      threat_actor: '',
      threat_actor_type: '' as ThreatActorType,
      threat_vector: '',
      motivation: '',
      capability: '' as 'low' | 'medium' | 'high',
      likelihood: 3,
    })
  }

  const openNewScenarioDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getAssetName = (assetId: string) => assets.find(a => a.id === assetId)?.name || 'Unknown'
  const getConcernDescription = (concernId: string) => concerns.find(c => c.id === concernId)?.description || 'Unknown'

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
          Develop threat scenarios based on areas of concern. Each scenario describes how a threat actor could exploit a concern.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewScenarioDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Scenario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingScenario ? 'Edit Threat Scenario' : 'Add New Threat Scenario'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="concern_id">Concern *</Label>
                  <Select
                    value={formData.concern_id}
                    onValueChange={(v) => setFormData({ ...formData, concern_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select concern" />
                    </SelectTrigger>
                    <SelectContent>
                      {concerns.map((concern) => (
                        <SelectItem key={concern.id} value={concern.id}>
                          {concern.description.substring(0, 50)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="asset_id">Target Asset *</Label>
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
                  <Label htmlFor="container_id">Container *</Label>
                  <Select
                    value={formData.container_id}
                    onValueChange={(v) => setFormData({ ...formData, container_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select container" />
                    </SelectTrigger>
                    <SelectContent>
                      {containers.map((container) => (
                        <SelectItem key={container.id} value={container.id}>
                          {container.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="threat_actor_type">Threat Actor Type</Label>
                  <Select
                    value={formData.threat_actor_type}
                    onValueChange={(v) => setFormData({ ...formData, threat_actor_type: v as ThreatActorType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {threatActorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="threat_actor">Threat Actor Name</Label>
                  <Input
                    id="threat_actor"
                    value={formData.threat_actor}
                    onChange={(e) => setFormData({ ...formData, threat_actor: e.target.value })}
                    placeholder="e.g., External hacker, Disgruntled employee"
                  />
                </div>

                <div>
                  <Label htmlFor="threat_vector">Threat Vector</Label>
                  <Input
                    id="threat_vector"
                    value={formData.threat_vector}
                    onChange={(e) => setFormData({ ...formData, threat_vector: e.target.value })}
                    placeholder="e.g., Phishing, Malware, Insider"
                  />
                </div>

                <div>
                  <Label htmlFor="capability">Capability</Label>
                  <Select
                    value={formData.capability}
                    onValueChange={(v) => setFormData({ ...formData, capability: v as 'low' | 'medium' | 'high' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select capability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="likelihood">Likelihood (1-5)</Label>
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
              </div>

              <div>
                <Label htmlFor="motivation">Motivation</Label>
                <Input
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                  placeholder="e.g., Financial gain, Revenge, Curiosity"
                />
              </div>

              <div>
                <Label htmlFor="scenario_description">Scenario Description *</Label>
                <Textarea
                  id="scenario_description"
                  value={formData.scenario_description}
                  onChange={(e) => setFormData({ ...formData, scenario_description: e.target.value })}
                  placeholder="Describe the threat scenario in detail..."
                  required
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingScenario ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scenarios List */}
      <div className="space-y-4">
        {scenarios.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No threat scenarios defined yet.</p>
            <p className="text-sm">Click &quot;Add Scenario&quot; to create threat scenarios.</p>
          </div>
        ) : (
          scenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium capitalize">
                        {scenario.threat_actor_type?.replace('_', ' ')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Likelihood: {scenario.likelihood}/5
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Capability: {scenario.capability}
                      </span>
                    </div>
                    <p className="mt-2">{scenario.scenario_description}</p>
                    <div className="mt-2 text-sm text-muted-foreground space-y-1">
                      <p>Target: {getAssetName(scenario.asset_id)}</p>
                      <p>Concern: {getConcernDescription(scenario.concern_id).substring(0, 100)}...</p>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(scenario)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(scenario)}>
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
