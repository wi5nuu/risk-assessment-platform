"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskRegister } from '@/components/risk/RiskRegister'
import { RiskMatrix } from '@/components/risk/RiskMatrix'
import { RiskWithDetails, Risk } from '@/types'
import { Loader2, ArrowLeft, Download } from 'lucide-react'
import { toast } from 'sonner'

export default function RiskRegisterPage() {
  const supabase = createClient() as any
  const [risks, setRisks] = useState<Risk[]>([])
  const [risksWithDetails, setRisksWithDetails] = useState<RiskWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    loadProjects()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      loadRisks(selectedProject)
    }
  }, [selectedProject])

  const loadProjects = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('user_id', userData.user.id)
        .single()

      if (!profile) return

      const { data } = await supabase
        .from('projects')
        .select('id, name')
        .eq('organization_id', profile.organization_id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      setProjects(data || [])
      if (data && data.length > 0) {
        setSelectedProject(data[0].id)
      }
    } catch (error) {
      toast.error('Failed to load projects')
    }
  }

  const loadRisks = async (projectId: string) => {
    setIsLoading(true)
    try {
      const { data: risksData, error } = await supabase
        .from('risks')
        .select(`
          *,
          assets:asset_id(name),
          threat_scenarios:threat_scenario_id(threat_actor, scenario_description),
          mitigation_plans:mitigation_plans(id, treatment_strategy)
        `)
        .eq('project_id', projectId)
        .eq('is_active', true)
        .order('risk_score', { ascending: false })

      if (error) throw error

      setRisks(risksData || [])

      // Transform to RiskWithDetails
      const withDetails: RiskWithDetails[] = (risksData || []).map((risk: any) => ({
        ...risk,
        assetName: risk.assets?.name || 'Unknown',
        threatActor: risk.threat_scenarios?.threat_actor || 'Unknown',
        vulnerabilityDescription: risk.vulnerability_description,
        treatmentStrategy: risk.mitigation_plans?.[0]?.treatment_strategy,
      }))

      setRisksWithDetails(withDetails)
    } catch (error) {
      toast.error('Failed to load risks')
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    // Export to CSV
    const headers = ['Risk ID', 'Title', 'Asset', 'Threat Actor', 'Likelihood', 'Impact', 'Score', 'Level', 'Status', 'Owner']
    const rows = risksWithDetails.map(risk => [
      risk.id,
      risk.risk_title,
      risk.assetName,
      risk.threatActor,
      risk.likelihood,
      risk.impact,
      risk.risk_score,
      risk.risk_level,
      risk.status,
      risk.owner || 'Unassigned',
    ])

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `risk-register-${selectedProject}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading && !selectedProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Risk Register</h1>
                <p className="text-sm text-muted-foreground">
                  Enterprise risk management view
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Risk Matrix */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Risk Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <RiskMatrix risks={risks} readOnly />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Risk Register Table */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Register</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : (
                  <RiskRegister risks={risksWithDetails} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
