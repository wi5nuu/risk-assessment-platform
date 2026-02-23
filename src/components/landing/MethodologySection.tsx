"use client"

import React from 'react'
import { CheckCircle2, Search, Target, ShieldCheck, Activity } from 'lucide-react'

const steps = [
    { num: '01', title: 'Measurement', icon: Target },
    { num: '02', title: 'Profiling', icon: Search },
    { num: '03', title: 'Containment', icon: ShieldCheck },
    { num: '04', title: 'Exposure', icon: Activity },
]

export function MethodologySection() {
    return (
        <section id="methodology" className="py-32 relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-20 items-center">
                    <div className="lg:w-1/2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6">
                            Scientific Methodology
                        </div>
                        <h2 className="text-5xl font-black tracking-tight mb-8 leading-[1.1]">The OCTAVE Allegro <br /> <span className="text-primary underline decoration-primary/20 decoration-8 underline-offset-8 font-serif italic">Advantage</span></h2>
                        <p className="text-xl text-muted-foreground font-medium mb-12 max-w-xl">
                            Standardized precision from Carnegie Mellon SEI. We replace guesswork with mathematically sound NIST-aligned structural integrity.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                                "Evidence-based decision logic",
                                "Quantitative impact mapping",
                                "Continuous posture monitoring",
                                "Global compliance alignment"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 group p-2 rounded-xl transition-colors hover:bg-white/5">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <span className="font-bold tracking-tight">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="lg:w-1/2 relative">
                        {/* Circle Visualization */}
                        <div className="relative w-full aspect-square max-w-md mx-auto">
                            <div className="absolute inset-0 border-[40px] border-white/5 rounded-full animate-spin-slow" />
                            <div className="absolute inset-[40px] border-[2px] border-dashed border-primary/20 rounded-full animate-reverse-spin" />

                            {/* Step Icons along the circle */}
                            {steps.map((step, i) => {
                                const angles = [0, 90, 180, 270];
                                const angle = angles[i];
                                return (
                                    <div
                                        key={i}
                                        className="absolute w-24 h-24 bg-background border border-white/10 rounded-3xl flex flex-col items-center justify-center shadow-2xl p-2 transition-transform hover:scale-110 z-10"
                                        style={{
                                            top: `${50 + 45 * Math.sin(angle * Math.PI / 180)}%`,
                                            left: `${50 + 45 * Math.cos(angle * Math.PI / 180)}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        <step.icon className="w-8 h-8 text-primary mb-2" />
                                        <span className="text-[10px] font-black uppercase text-muted-foreground">{step.title}</span>
                                    </div>
                                )
                            })}

                            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                <div className="text-center p-6 rounded-full bg-primary/10 backdrop-blur-3xl border border-primary/20 scale-125">
                                    <ShieldCheck className="w-16 h-16 text-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
