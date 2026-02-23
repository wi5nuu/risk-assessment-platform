"use client"

import React from 'react'
import {
    ShieldAlert,
    ClipboardCheck,
    Brain,
    BarChart3,
    Github,
    Layers
} from 'lucide-react'
import { cn } from '@/lib/utils'

const features = [
    {
        title: 'Dynamic Risk Engine',
        description: 'Elite-tier risk profiling using the NIST OCTAVE Allegro methodology framework.',
        icon: ShieldAlert,
        color: 'text-primary',
        glow: 'shadow-primary/20'
    },
    {
        title: 'Precision Audit',
        description: 'Next-gen automated checklists for forensic-grade vulnerability tracking.',
        icon: ClipboardCheck,
        color: 'text-blue-500',
        glow: 'shadow-blue-500/20'
    },
    {
        title: 'Cyber Intelligence',
        description: 'Contextual remediation advice powered by state-of-the-art AI logic engines.',
        icon: Brain,
        color: 'text-purple-500',
        glow: 'shadow-purple-500/20'
    },
    {
        title: 'Strategic Analytics',
        description: 'Executive dashboards visualizing organizational health and real-time posture.',
        icon: BarChart3,
        color: 'text-green-500',
        glow: 'shadow-green-500/20'
    },
    {
        title: 'Modern Stack',
        description: 'Precision engineered with Next.js 14 and Supabase for zero-latency operations.',
        icon: Layers,
        color: 'text-orange-500',
        glow: 'shadow-orange-500/20'
    },
    {
        title: 'Transparent Trust',
        description: 'Security through transparency with our open-core architectural philosophy.',
        icon: Github,
        color: 'text-foreground',
        glow: 'shadow-foreground/20'
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-24">
                    <h2 className="text-5xl font-black tracking-tight mb-6">Built for the <span className="text-primary italic">Security Elite</span></h2>
                    <p className="text-xl text-muted-foreground font-medium">
                        Weaponize your data. Outpace the threats. Transform compliance from a checklist into a competitive shield.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className="group relative p-8 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-2xl hover:bg-white/10 transition-all duration-500 shadow-2xl hover:-translate-y-2 overflow-hidden"
                        >
                            {/* Inner Glow Background */}
                            <div className={cn(
                                "absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-full",
                                feature.glow.replace('shadow-', 'bg-')
                            )} />

                            <div className={cn(
                                "w-16 h-16 rounded-2xl bg-black/40 flex items-center justify-center mb-8 border border-white/5 group-hover:border-white/20 transition-all duration-500 shadow-2xl group-hover:scale-110",
                                feature.glow
                            )}>
                                <feature.icon className={cn("w-8 h-8", feature.color)} />
                            </div>

                            <h3 className="text-2xl font-black tracking-tight mb-4 group-hover:text-primary transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground/80 leading-relaxed font-medium">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
