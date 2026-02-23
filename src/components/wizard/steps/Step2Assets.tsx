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
import { Asset, AssetType, ClassificationLevel } from '@/types'

interface Step2AssetsProps {
  projectId: string
  profileId: string
}

const assetTypes: { value: AssetType; label: string }[] = [
  { value: 'data', label: 'Data' },
  { value: 'system', label: 'System' },
  { value: 'application', label: 'Application' },
  { value: 'network', label: 'Network' },
  { value: 'physical', label: 'Physical' },
  { value: 'service', label: 'Service' },
  { value: 'personnel', label: 'Personnel' },
]

const classificationLevels: { value: ClassificationLevel; label: string }[] = [
  { value: 'public', label: 'Public' },
  { value: 'internal', label: 'Internal' },
  { value: 'confidential', label: 'Confidential' },
  { value: 'restricted', label: 'Restricted' },
]

export function Step2Assets({ projectId, profileId }: Step2AssetsProps) {
  const supabase = createClient() as any
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    asset_type: '' as AssetType,
    owner: '',
    custodian: '',
    classification: '' as ClassificationLevel,
    confidentiality_value: 3,
    integrity_value: 3,
    availability_value: 3,
    location: '',
    retention_period: '',
    financial_impact: 3,
    reputational_impact: 3,
    legal_impact: 3,
    operational_impact: 3,
  })

  useEffect(() => {
    loadAssets()
  }, [projectId])

  const loadAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setAssets(data || [])
    } catch (error) {
      toast.error('Failed to load assets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (editingAsset) {
        const { error } = await supabase
          .from('assets')
          .update(formData)
          .eq('id', editingAsset.id)

        if (error) throw error
        toast.success('Asset updated successfully')
      } else {
        const { error } = await supabase
          .from('assets')
          .insert({
            project_id: projectId,
            created_by: profileId,
            ...formData,
          })

        if (error) throw error
        toast.success('Asset created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      loadAssets()
    } catch (error) {
      toast.error(editingAsset ? 'Failed to update asset' : 'Failed to create asset')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (asset: Asset) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const { error } = await supabase
        .from('assets')
        .update({ is_active: false })
        .eq('id', asset.id)

      if (error) throw error
      toast.success('Asset deleted successfully')
      loadAssets()
    } catch (error) {
      toast.error('Failed to delete asset')
    }
  }

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset)
    setFormData({
      name: asset.name,
      description: asset.description || '',
      asset_type: asset.asset_type,
      owner: asset.owner || '',
      custodian: asset.custodian || '',
      classification: asset.classification || 'internal',
      confidentiality_value: asset.confidentiality_value || 3,
      integrity_value: asset.integrity_value || 3,
      availability_value: asset.availability_value || 3,
      location: asset.location || '',
      retention_period: asset.retention_period || '',
      financial_impact: asset.financial_impact || 3,
      reputational_impact: asset.reputational_impact || 3,
      legal_impact: asset.legal_impact || 3,
      operational_impact: asset.operational_impact || 3,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingAsset(null)
    setFormData({
      name: '',
      description: '',
      asset_type: '' as AssetType,
      owner: '',
      custodian: '',
      classification: '' as ClassificationLevel,
      confidentiality_value: 3,
      integrity_value: 3,
      availability_value: 3,
      location: '',
      retention_period: '',
      financial_impact: 3,
      reputational_impact: 3,
      legal_impact: 3,
      operational_impact: 3,
    })
  }

  const openNewAssetDialog = () => {
    resetForm()
    setIsDialogOpen(true)
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
          Identify and profile all information assets. Each asset must have defined security attributes and impact values.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewAssetDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Asset
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="asset_type">Asset Type *</Label>
                  <Select
                    value={formData.asset_type}
                    onValueChange={(v) => setFormData({ ...formData, asset_type: v as AssetType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="classification">Classification</Label>
                  <Select
                    value={formData.classification}
                    onValueChange={(v) => setFormData({ ...formData, classification: v as ClassificationLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select classification" />
                    </SelectTrigger>
                    <SelectContent>
                      {classificationLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="owner">Owner</Label>
                  <Input
                    id="owner"
                    value={formData.owner}
                    onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="custodian">Custodian</Label>
                  <Input
                    id="custodian"
                    value={formData.custodian}
                    onChange={(e) => setFormData({ ...formData, custodian: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium mb-2">Security Attributes (CIA)</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Confidentiality (1-5)</Label>
                      <Select
                        value={String(formData.confidentiality_value)}
                        onValueChange={(v) => setFormData({ ...formData, confidentiality_value: Number(v) })}
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
                      <Label>Integrity (1-5)</Label>
                      <Select
                        value={String(formData.integrity_value)}
                        onValueChange={(v) => setFormData({ ...formData, integrity_value: Number(v) })}
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
                      <Label>Availability (1-5)</Label>
                      <Select
                        value={String(formData.availability_value)}
                        onValueChange={(v) => setFormData({ ...formData, availability_value: Number(v) })}
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
                </div>

                <div className="col-span-2">
                  <h4 className="font-medium mb-2">Impact Values</h4>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>Financial (1-5)</Label>
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
                      <Label>Reputational (1-5)</Label>
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
                      <Label>Legal (1-5)</Label>
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
                      <Label>Operational (1-5)</Label>
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
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingAsset ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No assets defined yet.</p>
            <p className="text-sm">Click &quot;Add Asset&quot; to create your first information asset.</p>
          </div>
        ) : (
          assets.map((asset) => (
            <Card key={asset.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{asset.name}</CardTitle>
                    <p className="text-sm text-muted- capitalize">{asset.asset_type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(asset)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(asset)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Classification:</span>
                    <span className="capitalize">{asset.classification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{asset.owner || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criticality:</span>
                    <span className="font-medium">{asset.overall_criticality}/5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Impact:</span>
                    <span className="font-medium">{asset.max_impact}/5</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
