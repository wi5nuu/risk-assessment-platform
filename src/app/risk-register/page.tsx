"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RiskRegister } from '@/components/risk/RiskRegister'
import { RiskMatrix } from '@/components/risk/RiskMatrix'
import { RiskWithDetails, Risk } from '@/types'
import { Loader2, ArrowLeft, Download, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { MainLayout } from '@/components/layout/MainLayout'

export default function RiskRegisterPage() {
  // ... (keep state and effects same)
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
      <MainLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Risk Register</h1>
              <p className="text-muted-foreground text-sm">Enterprise risk management view</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <Button variant="outline" onClick={handleExport} size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk Matrix */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Distribution</CardTitle>
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
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Identified Risks</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : risksWithDetails.length === 0 ? (
                  <div className="text-center py-16 px-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-8 h-8 text-muted-foreground opacity-20" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">No Risks Identified Yet</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-2">
                      This project doesn't have any risks recorded. Please complete the Risk Assessment Wizard or check if your data is in another project.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
                      <Link href={`/wizard/${selectedProject}`}>
                        <Button className="font-bold">
                          Start Assessment Wizard
                        </Button>
                      </Link>
                      <p className="text-xs text-muted-foreground italic">
                        Tip: Check the project selector above
                      </p>
                    </div>
                  </div>
                ) : (
                  <RiskRegister risks={risksWithDetails} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
