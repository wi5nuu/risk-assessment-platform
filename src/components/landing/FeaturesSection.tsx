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
        title: 'Institutional OCTAVE Framework',
        description: 'Operationalize the complete 8-step lifecycle from risk criteria to strategic mitigation.',
        icon: Layers,
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
        color: 'border-primary/20'
    },
    {
        title: 'Heuristic AI Advisor',
        description: 'Gemini-integrated intelligence providing prescriptive insights for control remediation.',
        icon: Brain,
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400',
        color: 'border-blue-500/20'
    },
    {
        title: 'High-Fidelity Internal Audit',
        description: 'Standardized checklists with cross-mapping to ISO 27001 and NIST frameworks.',
        icon: ClipboardCheck,
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
        color: 'border-purple-500/20'
    },
    {
        title: 'Central Risk Register',
        description: 'Consolidated view of all identified threats and mitigations.',
        icon: BarChart3,
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
        color: 'border-green-500/20'
    },
    {
        title: 'Enterprise RBAC Security',
        description: 'Rigorous permission hierarchy for multi-tenancy Admin, Auditor, and Executive roles.',
        icon: ShieldAlert,
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400',
        color: 'border-orange-500/20'
    },
    {
        title: 'Evidence Storage',
        description: 'Secure, encrypted vault for all audit supporting documents.',
        icon: Layers,
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400',
        color: 'border-foreground/10'
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-32 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Built for the <span className="text-primary italic">Security Elite</span></h2>
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                        Weaponize your data. Outpace the threats. Transform compliance into a competitive shield.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "group relative p-2 rounded-3xl border transition-all duration-500 hover:-translate-y-2 overflow-hidden",
                                feature.color,
                                "bg-transparent backdrop-blur-sm"
                            )}
                        >
                            <div className="aspect-[16/10] rounded-2xl overflow-hidden mb-4 relative shadow-2xl">
                                <img
                                    src={feature.image}
                                    alt={feature.title}
                                    className="w-full h-full object-cover grayscale-[80%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="p-2 rounded-lg bg-primary/20 backdrop-blur-md border border-white/10">
                                            <feature.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight text-white">
                                            {feature.title}
                                        </h3>
                                    </div>
                                    <p className="text-[11px] font-bold text-white/70 leading-relaxed line-clamp-2">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
