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
        image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=400',
        color: 'border-primary/20'
    },
    {
        title: 'Precision Audit',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400',
        color: 'border-blue-500/20'
    },
    {
        title: 'Cyber Intelligence',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=400',
        color: 'border-purple-500/20'
    },
    {
        title: 'Strategic Analytics',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=400',
        color: 'border-green-500/20'
    },
    {
        title: 'Modern Stack',
        image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400',
        color: 'border-orange-500/20'
    },
    {
        title: 'Transparent Trust',
        image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=400',
        color: 'border-foreground/10'
    }
]

export function FeaturesSection() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
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
                                <div className="absolute bottom-4 left-4">
                                    <h3 className="text-xl font-black tracking-tight text-white">
                                        {feature.title}
                                    </h3>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
