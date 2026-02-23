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
import { Plus, Edit, Trash2, Loader2, Link2 } from 'lucide-react'
import { Container, ContainerType, Asset } from '@/types'

interface Step3ContainersProps {
  projectId: string
  profileId: string
}

const containerTypes: { value: ContainerType; label: string }[] = [
  { value: 'physical', label: 'Physical' },
  { value: 'technical', label: 'Technical' },
  { value: 'people', label: 'People' },
  { value: 'process', label: 'Process' },
]

export function Step3Containers({ projectId, profileId }: Step3ContainersProps) {
  const supabase = createClient() as any
  const [containers, setContainers] = useState<Container[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isMappingDialogOpen, setIsMappingDialogOpen] = useState(false)
  const [editingContainer, setEditingContainer] = useState<Container | null>(null)
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [linkedAssets, setLinkedAssets] = useState<string[]>([])

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    container_type: '' as ContainerType,
    location: '',
    responsible_party: '',
    security_controls: '',
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [containersRes, assetsRes] = await Promise.all([
        supabase
          .from('containers')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('assets')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
      ])

      if (containersRes.error) throw containersRes.error
      if (assetsRes.error) throw assetsRes.error

      setContainers(containersRes.data || [])
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
      if (editingContainer) {
        const { error } = await supabase
          .from('containers')
          .update(formData)
          .eq('id', editingContainer.id)

        if (error) throw error
        toast.success('Container updated successfully')
      } else {
        const { error } = await supabase
          .from('containers')
          .insert({
            project_id: projectId,
            created_by: profileId,
            ...formData,
          })

        if (error) throw error
        toast.success('Container created successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(editingContainer ? 'Failed to update container' : 'Failed to create container')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (container: Container) => {
    if (!confirm('Are you sure you want to delete this container?')) return

    try {
      const { error } = await supabase
        .from('containers')
        .update({ is_active: false })
        .eq('id', container.id)

      if (error) throw error
      toast.success('Container deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete container')
    }
  }

  const handleEdit = (container: Container) => {
    setEditingContainer(container)
    setFormData({
      name: container.name,
      description: container.description || '',
      container_type: container.container_type,
      location: container.location || '',
      responsible_party: container.responsible_party || '',
      security_controls: container.security_controls || '',
    })
    setIsDialogOpen(true)
  }

  const openMappingDialog = async (container: Container) => {
    setSelectedContainer(container)

    // Load existing mappings
    const { data } = await supabase
      .from('asset_container_mapping')
      .select('asset_id')
      .eq('container_id', container.id)

    setLinkedAssets((data as any[])?.map((m: any) => m.asset_id) || [])
    setIsMappingDialogOpen(true)
  }

  const handleToggleAsset = async (assetId: string) => {
    if (!selectedContainer) return

    const isLinked = linkedAssets.includes(assetId)

    try {
      if (isLinked) {
        // Remove mapping
        await supabase
          .from('asset_container_mapping')
          .delete()
          .eq('container_id', selectedContainer.id)
          .eq('asset_id', assetId)

        setLinkedAssets(prev => prev.filter(id => id !== assetId))
      } else {
        // Add mapping
        await supabase
          .from('asset_container_mapping')
          .insert({
            container_id: selectedContainer.id,
            asset_id: assetId,
          })

        setLinkedAssets(prev => [...prev, assetId])
      }
    } catch (error) {
      toast.error('Failed to update mapping')
    }
  }

  const resetForm = () => {
    setEditingContainer(null)
    setFormData({
      name: '',
      description: '',
      container_type: '' as ContainerType,
      location: '',
      responsible_party: '',
      security_controls: '',
    })
  }

  const openNewContainerDialog = () => {
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
          Identify containers where information assets are stored, processed, or transmitted.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewContainerDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Container
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingContainer ? 'Edit Container' : 'Add New Container'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Container Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="container_type">Container Type *</Label>
                <Select
                  value={formData.container_type}
                  onValueChange={(v) => setFormData({ ...formData, container_type: v as ContainerType })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {containerTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Data Center A, Cloud, etc."
                />
              </div>

              <div>
                <Label htmlFor="responsible_party">Responsible Party</Label>
                <Input
                  id="responsible_party"
                  value={formData.responsible_party}
                  onChange={(e) => setFormData({ ...formData, responsible_party: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="security_controls">Security Controls</Label>
                <Textarea
                  id="security_controls"
                  value={formData.security_controls}
                  onChange={(e) => setFormData({ ...formData, security_controls: e.target.value })}
                  placeholder="List existing security controls..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingContainer ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Containers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {containers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No containers defined yet.</p>
            <p className="text-sm">Click &quot;Add Container&quot; to create your first asset container.</p>
          </div>
        ) : (
          containers.map((container) => (
            <Card key={container.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                    <p className="text-sm text-muted- capitalize">{container.container_type}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openMappingDialog(container)}>
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(container)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(container)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Location:</span>
                    <span>{container.location || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Responsible:</span>
                    <span>{container.responsible_party || 'N/A'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Asset Mapping Dialog */}
      <Dialog open={isMappingDialogOpen} onOpenChange={setIsMappingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Link Assets to {selectedContainer?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {assets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => handleToggleAsset(asset.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${linkedAssets.includes(asset.id)
                  ? 'bg-primary/10 border-primary'
                  : 'hover:bg-muted'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{asset.name}</span>
                  {linkedAssets.includes(asset.id) && (
                    <span className="text-primary text-sm">Linked</span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground capitalize">{asset.asset_type}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
