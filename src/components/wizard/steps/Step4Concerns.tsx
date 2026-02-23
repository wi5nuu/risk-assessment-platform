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
import { Concern, Container, ConcernCategory } from '@/types'

interface Step4ConcernsProps {
  projectId: string
  profileId: string
}

const concernCategories: { value: ConcernCategory; label: string }[] = [
  { value: 'confidentiality', label: 'Confidentiality' },
  { value: 'integrity', label: 'Integrity' },
  { value: 'availability', label: 'Availability' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'operational', label: 'Operational' },
]

export function Step4Concerns({ projectId, profileId }: Step4ConcernsProps) {
  const supabase = createClient() as any
  const [concerns, setConcerns] = useState<Concern[]>([])
  const [containers, setContainers] = useState<Container[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingConcern, setEditingConcern] = useState<Concern | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    container_id: '',
    description: '',
    concern_category: '' as ConcernCategory,
    priority: 'medium' as 'low' | 'medium' | 'high',
  })

  useEffect(() => {
    loadData()
  }, [projectId])

  const loadData = async () => {
    try {
      const [concernsRes, containersRes] = await Promise.all([
        supabase
          .from('concerns')
          .select('*, containers(name)')
          .eq('project_id', projectId)
          .eq('is_active', true)
          .order('created_at', { ascending: false }),
        supabase
          .from('containers')
          .select('*')
          .eq('project_id', projectId)
          .eq('is_active', true),
      ])

      if (concernsRes.error) throw concernsRes.error
      if (containersRes.error) throw containersRes.error

      setConcerns(concernsRes.data || [])
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
      if (editingConcern) {
        const { error } = await supabase
          .from('concerns')
          .update(formData)
          .eq('id', editingConcern.id)

        if (error) throw error
        toast.success('Concern updated successfully')
      } else {
        const { error } = await supabase
          .from('concerns')
          .insert({
            project_id: projectId,
            identified_by: profileId,
            ...formData,
          })

        if (error) throw error
        toast.success('Concern added successfully')
      }

      setIsDialogOpen(false)
      resetForm()
      loadData()
    } catch (error) {
      toast.error(editingConcern ? 'Failed to update concern' : 'Failed to create concern')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (concern: Concern) => {
    if (!confirm('Are you sure you want to delete this concern?')) return

    try {
      const { error } = await supabase
        .from('concerns')
        .update({ is_active: false })
        .eq('id', concern.id)

      if (error) throw error
      toast.success('Concern deleted successfully')
      loadData()
    } catch (error) {
      toast.error('Failed to delete concern')
    }
  }

  const handleEdit = (concern: Concern) => {
    setEditingConcern(concern)
    setFormData({
      container_id: concern.container_id,
      description: concern.description,
      concern_category: concern.concern_category || 'confidentiality',
      priority: concern.priority,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingConcern(null)
    setFormData({
      container_id: '',
      description: '',
      concern_category: '' as ConcernCategory,
      priority: 'medium',
    })
  }

  const openNewConcernDialog = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const getContainerName = (containerId: string) => {
    return containers.find(c => c.id === containerId)?.name || 'Unknown'
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
          Identify areas of concern for each container. These represent potential weaknesses or issues.
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewConcernDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Add Concern
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingConcern ? 'Edit Concern' : 'Add New Concern'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <Label htmlFor="concern_category">Category</Label>
                <Select
                  value={formData.concern_category}
                  onValueChange={(v) => setFormData({ ...formData, concern_category: v as ConcernCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {concernCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v as 'low' | 'medium' | 'high' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the area of concern..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingConcern ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Concerns List */}
      <div className="space-y-4">
        {concerns.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            <p>No concerns defined yet.</p>
            <p className="text-sm">Click &quot;Add Concern&quot; to identify areas of concern.</p>
          </div>
        ) : (
          concerns.map((concern) => (
            <Card key={concern.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${concern.priority === 'high' ? 'bg-red-100 text-red-800' :
                        concern.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                        {concern.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground capitalize">
                        {concern.concern_category}
                      </span>
                    </div>
                    <p className="mt-2">{concern.description}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Container: {getContainerName(concern.container_id)}
                    </p>
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(concern)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(concern)}>
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
