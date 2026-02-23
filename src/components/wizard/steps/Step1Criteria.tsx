"use client"

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'

interface Step1CriteriaProps {
  projectId: string
}

interface CriteriaForm {
  financial_impact_1: string
  financial_impact_2: string
  financial_impact_3: string
  financial_impact_4: string
  financial_impact_5: string
  reputational_impact_1: string
  reputational_impact_2: string
  reputational_impact_3: string
  reputational_impact_4: string
  reputational_impact_5: string
  legal_impact_1: string
  legal_impact_2: string
  legal_impact_3: string
  legal_impact_4: string
  legal_impact_5: string
  operational_impact_1: string
  operational_impact_2: string
  operational_impact_3: string
  operational_impact_4: string
  operational_impact_5: string
  likelihood_1: string
  likelihood_2: string
  likelihood_3: string
  likelihood_4: string
  likelihood_5: string
}

const defaultCriteria: CriteriaForm = {
  financial_impact_1: 'Negligible (< $1K)',
  financial_impact_2: 'Minor ($1K - $10K)',
  financial_impact_3: 'Moderate ($10K - $100K)',
  financial_impact_4: 'Major ($100K - $1M)',
  financial_impact_5: 'Catastrophic (> $1M)',
  reputational_impact_1: 'Negligible impact',
  reputational_impact_2: 'Minor negative attention',
  reputational_impact_3: 'Moderate public concern',
  reputational_impact_4: 'Major reputation damage',
  reputational_impact_5: 'Severe loss of trust',
  legal_impact_1: 'No legal implications',
  legal_impact_2: 'Minor compliance issue',
  legal_impact_3: 'Regulatory investigation',
  legal_impact_4: 'Legal proceedings',
  legal_impact_5: 'Severe penalties/criminal',
  operational_impact_1: 'Negligible disruption',
  operational_impact_2: 'Minor service degradation',
  operational_impact_3: 'Moderate disruption',
  operational_impact_4: 'Major service outage',
  operational_impact_5: 'Complete operational halt',
  likelihood_1: 'Rare (once in 5+ years)',
  likelihood_2: 'Unlikely (once in 2-5 years)',
  likelihood_3: 'Possible (once per year)',
  likelihood_4: 'Likely (multiple times per year)',
  likelihood_5: 'Almost Certain (monthly+)',
}

export function Step1Criteria({ projectId }: Step1CriteriaProps) {
  const supabase = createClient() as any
  const [criteria, setCriteria] = useState<CriteriaForm>(defaultCriteria)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [criteriaId, setCriteriaId] = useState<string | null>(null)

  useEffect(() => {
    loadCriteria()
  }, [projectId])

  const loadCriteria = async () => {
    try {
      const { data, error } = await supabase
        .from('risk_measurement_criteria')
        .select('*')
        .eq('project_id', projectId)
        .single()

      if (data) {
        setCriteria({
          financial_impact_1: data.financial_impact_1,
          financial_impact_2: data.financial_impact_2,
          financial_impact_3: data.financial_impact_3,
          financial_impact_4: data.financial_impact_4,
          financial_impact_5: data.financial_impact_5,
          reputational_impact_1: data.reputational_impact_1,
          reputational_impact_2: data.reputational_impact_2,
          reputational_impact_3: data.reputational_impact_3,
          reputational_impact_4: data.reputational_impact_4,
          reputational_impact_5: data.reputational_impact_5,
          legal_impact_1: data.legal_impact_1,
          legal_impact_2: data.legal_impact_2,
          legal_impact_3: data.legal_impact_3,
          legal_impact_4: data.legal_impact_4,
          legal_impact_5: data.legal_impact_5,
          operational_impact_1: data.operational_impact_1,
          operational_impact_2: data.operational_impact_2,
          operational_impact_3: data.operational_impact_3,
          operational_impact_4: data.operational_impact_4,
          operational_impact_5: data.operational_impact_5,
          likelihood_1: data.likelihood_1,
          likelihood_2: data.likelihood_2,
          likelihood_3: data.likelihood_3,
          likelihood_4: data.likelihood_4,
          likelihood_5: data.likelihood_5,
        })
        setCriteriaId(data.id)
      }
    } catch (error) {
      console.error('Error loading criteria:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { data: userData } = await supabase.auth.getUser()

      if (criteriaId) {
        // Update existing
        const { error } = await supabase
          .from('risk_measurement_criteria')
          .update(criteria)
          .eq('id', criteriaId)

        if (error) throw error
      } else {
        // Create new
        const { data, error } = await supabase
          .from('risk_measurement_criteria')
          .insert({
            project_id: projectId,
            created_by: userData.user?.id,
            ...criteria,
          })
          .select()
          .single()

        if (error) throw error
        if (data) setCriteriaId(data.id)
      }

      toast.success('Risk measurement criteria saved successfully')
    } catch (error) {
      toast.error('Failed to save criteria')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof CriteriaForm, value: string) => {
    setCriteria(prev => ({ ...prev, [field]: value }))
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
          Define the criteria for measuring risk impact and likelihood. These definitions will be used consistently throughout the assessment.
        </p>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Criteria
        </Button>
      </div>

      {/* Financial Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Impact Criteria</CardTitle>
          <CardDescription>Define financial impact levels (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={`financial-${level}`}>
              <Label htmlFor={`financial_impact_${level}`}>Level {level}</Label>
              <Input
                id={`financial_impact_${level}`}
                value={criteria[`financial_impact_${level}` as keyof CriteriaForm]}
                onChange={(e) => handleChange(`financial_impact_${level}` as keyof CriteriaForm, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reputational Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Reputational Impact Criteria</CardTitle>
          <CardDescription>Define reputational impact levels (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={`reputational-${level}`}>
              <Label htmlFor={`reputational_impact_${level}`}>Level {level}</Label>
              <Input
                id={`reputational_impact_${level}`}
                value={criteria[`reputational_impact_${level}` as keyof CriteriaForm]}
                onChange={(e) => handleChange(`reputational_impact_${level}` as keyof CriteriaForm, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Legal Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Legal Impact Criteria</CardTitle>
          <CardDescription>Define legal/compliance impact levels (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={`legal-${level}`}>
              <Label htmlFor={`legal_impact_${level}`}>Level {level}</Label>
              <Input
                id={`legal_impact_${level}`}
                value={criteria[`legal_impact_${level}` as keyof CriteriaForm]}
                onChange={(e) => handleChange(`legal_impact_${level}` as keyof CriteriaForm, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Operational Impact */}
      <Card>
        <CardHeader>
          <CardTitle>Operational Impact Criteria</CardTitle>
          <CardDescription>Define operational impact levels (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={`operational-${level}`}>
              <Label htmlFor={`operational_impact_${level}`}>Level {level}</Label>
              <Input
                id={`operational_impact_${level}`}
                value={criteria[`operational_impact_${level}` as keyof CriteriaForm]}
                onChange={(e) => handleChange(`operational_impact_${level}` as keyof CriteriaForm, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Likelihood */}
      <Card>
        <CardHeader>
          <CardTitle>Likelihood Criteria</CardTitle>
          <CardDescription>Define likelihood levels (1-5 scale)</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((level) => (
            <div key={`likelihood-${level}`}>
              <Label htmlFor={`likelihood_${level}`}>Level {level}</Label>
              <Input
                id={`likelihood_${level}`}
                value={criteria[`likelihood_${level}` as keyof CriteriaForm]}
                onChange={(e) => handleChange(`likelihood_${level}` as keyof CriteriaForm, e.target.value)}
                className="mt-1"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
