"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WizardContainer } from '@/components/wizard/WizardContainer'
import { OctaveStepNumber, Project } from '@/types'
import { toast } from 'sonner'

// Step components (to be implemented)
import { Step1Criteria } from '@/components/wizard/steps/Step1Criteria'
import { Step2Assets } from '@/components/wizard/steps/Step2Assets'
import { Step3Containers } from '@/components/wizard/steps/Step3Containers'
import { Step4Concerns } from '@/components/wizard/steps/Step4Concerns'
import { Step5ThreatScenarios } from '@/components/wizard/steps/Step5ThreatScenarios'
import { Step6Risks } from '@/components/wizard/steps/Step6Risks'
import { Step7Analysis } from '@/components/wizard/steps/Step7Analysis'
import { Step8Mitigation } from '@/components/wizard/steps/Step8Mitigation'

export default function WizardPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient() as any
  const projectId = params.projectId as string

  const [project, setProject] = useState<Project | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState<OctaveStepNumber>(1)
  const [completedSteps, setCompletedSteps] = useState<OctaveStepNumber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadProject()
  }, [projectId])

  const loadProject = async () => {
    try {
      // 1. Get current auth user
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        toast.error('You must be logged in')
        router.push('/auth/login')
        return
      }

      // 2. Load user profile to get the correct profile ID (different from auth ID)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .single()

      if (profileError || !profileData) {
        console.error('Profile not found:', profileError)
        toast.error('User profile not found')
        return
      }

      setProfileId(profileData.id)

      // 3. Load project
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Project load error:', error)
        toast.error('Failed to load project')
        router.push('/dashboard')
        return
      }

      setProject(data)
      setCurrentStep(data.current_step as OctaveStepNumber)

      // Calculate completed steps
      const completed: OctaveStepNumber[] = []
      if (data.step_1_completed) completed.push(1)
      if (data.step_2_completed) completed.push(2)
      if (data.step_3_completed) completed.push(3)
      if (data.step_4_completed) completed.push(4)
      if (data.step_5_completed) completed.push(5)
      if (data.step_6_completed) completed.push(6)
      if (data.step_7_completed) completed.push(7)
      if (data.step_8_completed) completed.push(8)
      setCompletedSteps(completed)
    } catch (error) {
      console.error('Wizard initialization error:', error)
      toast.error('An error occurred during initialization')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepChange = useCallback((step: OctaveStepNumber) => {
    setCurrentStep(step)
  }, [])

  const handleCompleteStep = useCallback(async (step: OctaveStepNumber) => {
    try {
      const stepField = `step_${step}_completed`
      const { error } = await supabase
        .from('projects')
        .update({
          [stepField]: true,
          current_step: Math.min(step + 1, 8)
        })
        .eq('id', projectId)

      if (error) throw error

      setCompletedSteps(prev => [...prev, step])
      toast.success(`Step ${step} completed successfully`)
    } catch (error) {
      toast.error('Failed to complete step')
      throw error
    }
  }, [projectId, supabase])

  const handleSaveProgress = useCallback(async () => {
    setIsSaving(true)
    try {
      // Save progress logic here
      await new Promise(resolve => setTimeout(resolve, 500))
      toast.success('Progress saved')
    } catch (error) {
      toast.error('Failed to save progress')
    } finally {
      setIsSaving(false)
    }
  }, [])

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <WizardContainer
          project={project}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepChange={handleStepChange}
          onCompleteStep={handleCompleteStep}
          onSaveProgress={handleSaveProgress}
          isSaving={isSaving}
        >
          {currentStep === 1 && <Step1Criteria projectId={projectId} profileId={profileId!} />}
          {currentStep === 2 && <Step2Assets projectId={projectId} profileId={profileId!} />}
          {currentStep === 3 && <Step3Containers projectId={projectId} profileId={profileId!} />}
          {currentStep === 4 && <Step4Concerns projectId={projectId} profileId={profileId!} />}
          {currentStep === 5 && <Step5ThreatScenarios projectId={projectId} profileId={profileId!} />}
          {currentStep === 6 && <Step6Risks projectId={projectId} profileId={profileId!} />}
          {currentStep === 7 && <Step7Analysis projectId={projectId} profileId={profileId!} />}
          {currentStep === 8 && <Step8Mitigation projectId={projectId} profileId={profileId!} />}
        </WizardContainer>
      </main>
    </div>
  )
}
