"use client"

import React from 'react'
import { OctaveStepNumber, OCTAVE_STEPS } from '@/types'
import { cn } from '@/lib/utils'
import { Check, Lock } from 'lucide-react'

interface WizardStepIndicatorProps {
  currentStep: OctaveStepNumber
  completedSteps: OctaveStepNumber[]
  onStepClick?: (step: OctaveStepNumber) => void
  className?: string
}

export function WizardStepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
  className
}: WizardStepIndicatorProps) {
  const isStepCompleted = (step: OctaveStepNumber) => completedSteps.includes(step)
  const isStepAccessible = (step: OctaveStepNumber) => {
    // Step 1 is always accessible
    if (step === 1) return true
    // Previous step must be completed
    return isStepCompleted((step - 1) as OctaveStepNumber)
  }
  
  const handleStepClick = (step: OctaveStepNumber) => {
    if (onStepClick && isStepAccessible(step)) {
      onStepClick(step)
    }
  }
  
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop view - horizontal */}
      <div className="hidden md:flex items-center justify-between">
        {OCTAVE_STEPS.map((step, index) => {
          const isCompleted = isStepCompleted(step.number as OctaveStepNumber)
          const isCurrent = currentStep === step.number
          const isAccessible = isStepAccessible(step.number as OctaveStepNumber)
          
          return (
            <React.Fragment key={step.number}>
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleStepClick(step.number as OctaveStepNumber)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                    isCompleted && "bg-green-500 text-white",
                    isCurrent && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2",
                    !isCompleted && !isCurrent && isAccessible && "bg-muted text-muted-foreground hover:bg-muted/80",
                    !isAccessible && "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : !isAccessible ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    step.number
                  )}
                </button>
                <span className={cn(
                  "mt-2 text-xs font-medium text-center max-w-[100px]",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.name}
                </span>
              </div>
              
              {/* Connector line */}
              {index < OCTAVE_STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  isCompleted ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </React.Fragment>
          )
        })}
      </div>
      
      {/* Mobile view - vertical */}
      <div className="md:hidden space-y-2">
        {OCTAVE_STEPS.map((step) => {
          const isCompleted = isStepCompleted(step.number as OctaveStepNumber)
          const isCurrent = currentStep === step.number
          const isAccessible = isStepAccessible(step.number as OctaveStepNumber)
          
          return (
            <button
              key={step.number}
              onClick={() => handleStepClick(step.number as OctaveStepNumber)}
              disabled={!isAccessible}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all",
                isCurrent && "bg-primary/10 border border-primary",
                !isCurrent && isCompleted && "bg-green-50 border border-green-200",
                !isCurrent && !isCompleted && isAccessible && "bg-muted hover:bg-muted/80",
                !isAccessible && "bg-gray-100 opacity-50 cursor-not-allowed"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0",
                isCompleted && "bg-green-500 text-white",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && isAccessible && "bg-muted-foreground/20 text-muted-foreground",
                !isAccessible && "bg-gray-300 text-gray-500"
              )}>
                {isCompleted ? (
                  <Check className="w-4 h-4" />
                ) : !isAccessible ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  step.number
                )}
              </div>
              <div className="flex-1 text-left">
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent ? "text-primary" : "text-foreground"
                )}>
                  Step {step.number}: {step.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
