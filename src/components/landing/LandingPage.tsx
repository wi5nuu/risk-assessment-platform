"use client"

import React from 'react'
import { LandingHeader } from './LandingHeader'
import { HeroSection } from './HeroSection'
import { FeaturesSection } from './FeaturesSection'
import { MethodologySection } from './MethodologySection'
import { CTASection, LandingFooter } from './LandingFooter'
import { LandingBackground } from './LandingBackground'

export function LandingPage() {
    return (
        <div className="relative flex flex-col min-h-screen selection:bg-primary/30 scroll-smooth">
            <LandingBackground />
            <LandingHeader />
            <main className="flex-1">
                <HeroSection />
                <FeaturesSection />
                <MethodologySection />
                <CTASection />
            </main>
            <LandingFooter />

            <style jsx global>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes reverse-spin {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
                .animate-reverse-spin {
                    animation: reverse-spin 15s linear infinite;
                }
                .perspective-1000 {
                    perspective: 1000px;
                }
            `}</style>
        </div>
    )
}
