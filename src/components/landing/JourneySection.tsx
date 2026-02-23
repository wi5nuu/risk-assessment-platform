"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Target, Smartphone, Globe, Rocket } from 'lucide-react'

const milestones = [
    {
        year: '1999',
        title: 'Legacy Foundations',
        desc: 'Inauguration of the original OCTAVE methodology for critical infrastructure.',
        icon: Shield,
    },
    {
        year: '2007',
        title: 'Strategic Allegro',
        desc: 'Introduction of asset-centric modeling by Carnegie Mellon SEI.',
        icon: Target,
    },
    {
        year: '2018',
        title: 'Digital Resiliency',
        desc: 'Integration of automated risk mapping for hyper-scale cloud environments.',
        icon: Smartphone,
    },
    {
        year: '2022',
        title: 'Regulatory Apex',
        desc: 'Global alignment with emergent privacy laws and ISO/IEC 27001:2022 standards.',
        icon: Globe,
    },
    {
        year: '2026',
        title: 'Risk Shield Era',
        desc: 'The dawn of AI-Native Risk Intelligence for autonomous audit precision.',
        icon: Rocket,
    }
]

export function JourneySection() {
    return (
        <section id="journey" className="py-32 bg-background border-y border-white/5">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                        Jejak <span className="text-primary italic font-serif">Transformasi</span>
                    </h2>
                    <p className="text-muted-foreground text-sm max-w-lg mx-auto">
                        Evolusi metodologi risiko dari pondasi legacy hingga kecerdasan otonom masa depan.
                    </p>
                </div>

                <div className="relative">
                    {/* Simplified Connector Line */}
                    <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                        {milestones.map((ms, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="relative flex flex-col items-center text-center group"
                            >
                                {/* Year Tag */}
                                <div className="text-xs font-black text-primary mb-4 tracking-tighter bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                    {ms.year}
                                </div>

                                {/* Icon Circle */}
                                <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-6 relative z-10 group-hover:scale-110 group-hover:border-primary/30 group-hover:bg-primary/5 transition-all duration-300">
                                    <ms.icon className="w-6 h-6 text-white group-hover:text-primary transition-colors" />
                                </div>

                                {/* Content */}
                                <h3 className="text-sm font-black mb-2 tracking-tight">{ms.title}</h3>
                                <p className="text-[11px] leading-relaxed text-muted-foreground max-w-[160px]">
                                    {ms.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
