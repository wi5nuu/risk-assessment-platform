"use client"

import React from 'react'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { LandingFooter } from '@/components/landing/LandingFooter'
import { LandingBackground } from '@/components/landing/LandingBackground'
import { FileText, Book, Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function DocsPage() {
    return (
        <div className="relative min-h-screen flex flex-col pt-32">
            <LandingBackground />
            <LandingHeader />

            <main className="flex-1 container mx-auto px-6 py-20">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-16"
                    >
                        <h1 className="text-4xl md:text-6xl font-black mb-6">Documentation</h1>
                        <p className="text-xl text-muted-foreground">Everything you need to master OCTAVE Allegro with Risk Shield System.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                            { title: 'Getting Started', desc: 'Learn the basics of OCTAVE Allegro framework.', icon: Book },
                            { title: 'Asset Profiling', desc: 'How to identify and prioritize your critical assets.', icon: Shield },
                            { title: 'Risk Scenarios', desc: 'Modeling threat scenarios with precision.', icon: Zap },
                            { title: 'API Reference', desc: 'Integrate Risk Shield with your enterprise tools.', icon: FileText },
                        ].map((doc, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <doc.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground">{doc.desc}</p>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 rounded-[3rem] bg-primary text-primary-foreground text-center shadow-2xl overflow-hidden relative">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black mb-4">Want a guided tour?</h2>
                            <p className="mb-8 opacity-90">Schedule a demo with our security engineers for a full methodology walkthrough.</p>
                            <button className="px-8 py-4 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-transform">
                                Book a Demo
                            </button>
                        </div>
                    </div>
                </div>
            </main>

            <LandingFooter />
        </div>
    )
}
