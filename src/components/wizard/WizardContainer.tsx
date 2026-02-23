"use client"

import React, { useState, useCallback } from 'react'
import { OctaveStepNumber, Project } from '@/types'
import { WizardStepIndicator } from './WizardStepIndicator'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WizardContainerProps {
  project: Project
  children: React.ReactNode
  currentStep: OctaveStepNumber
  completedSteps: OctaveStepNumber[]
  onStepChange: (step: OctaveStepNumber) => void
  onCompleteStep: (step: OctaveStepNumber) => Promise<void>
  onSaveProgress: () => Promise<void>
  isSaving?: boolean
  className?: string
}

export function WizardContainer({
  project,
  children,
  currentStep,
  completedSteps,
  onStepChange,
  onCompleteStep,
  onSaveProgress,
  isSaving = false,
  className
}: WizardContainerProps) {
  const [isCompleting, setIsCompleting] = useState(false)

  const canGoNext = currentStep < 8
  const canGoPrevious = currentStep > 1
  const isStepCompleted = completedSteps.includes(currentStep)
  const canCompleteStep = !isStepCompleted

  const handleNext = useCallback(async () => {
    if (canGoNext) {
      // If current step is not completed, complete it first
      if (canCompleteStep) {
        await handleCompleteStep()
      }
      onStepChange((currentStep + 1) as OctaveStepNumber)
    }
  }, [canGoNext, canCompleteStep, currentStep, onStepChange])

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) {
      onStepChange((currentStep - 1) as OctaveStepNumber)
    }
  }, [canGoPrevious, currentStep, onStepChange])

  const handleCompleteStep = useCallback(async () => {
    setIsCompleting(true)
    try {
      await onCompleteStep(currentStep)
    } finally {
      setIsCompleting(false)
    }
  }, [currentStep, onCompleteStep])

  const handleStepClick = useCallback((step: OctaveStepNumber) => {
    onStepChange(step)
  }, [onStepChange])

  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold truncate max-w-[280px] sm:max-w-none">{project.name}</h1>
          <p className="text-xs md:text-sm text-muted-foreground font-medium uppercase tracking-wider">
            OCTAVE Allegro Risk Assessment
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSaveProgress}
          disabled={isSaving}
          className="w-full sm:w-auto h-9"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Progress'}
        </Button>
      </div>

      {/* Step Indicator */}
      <WizardStepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <Card>
        <CardHeader className="border-b p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-lg font-semibold">
                Step {currentStep}: {getStepName(currentStep)}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {getStepDescription(currentStep)}
              </p>
            </div>
            {isStepCompleted && (
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium w-fit">
                Completed
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {children}
        </CardContent>

        <CardFooter className="border-t p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={!canGoPrevious || isCompleting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            {canCompleteStep && (
              <Button
                onClick={handleCompleteStep}
                disabled={isCompleting}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                {isCompleting ? 'Completing...' : 'Complete Step'}
              </Button>
            )}

            {currentStep === 8 && isStepCompleted ? (
              <Button
                onClick={() => window.location.href = `/audit/${project.id}`}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-300 shadow-lg shadow-green-200"
              >
                Finish Wizard
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canGoNext || isCompleting}
                className="flex-1 sm:flex-none"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

function getStepName(step: OctaveStepNumber): string {
  const stepNames: Record<OctaveStepNumber, string> = {
    1: 'Establish Risk Measurement Criteria',
    2: 'Develop Information Asset Profile',
    3: 'Identify Information Asset Containers',
    4: 'Identify Areas of Concern',
    5: 'Identify Threat Scenarios',
    6: 'Identify Risks',
    7: 'Analyze Risks',
    8: 'Select Mitigation Approach',
  }
  return stepNames[step]
}

function getStepDescription(step: OctaveStepNumber): string {
  const stepDescriptions: Record<OctaveStepNumber, string> = {
    1: 'Define the criteria for measuring risk impact and likelihood',
    2: 'Identify and profile all information assets',
    3: 'Map assets to their storage and processing containers',
    4: 'Identify potential areas of concern for each container',
    5: 'Develop threat scenarios based on areas of concern',
    6: 'Identify and document risks from threat scenarios',
    7: 'Analyze risks and determine risk scores',
    8: 'Develop and select mitigation strategies',
  }
  return stepDescriptions[step]
}
