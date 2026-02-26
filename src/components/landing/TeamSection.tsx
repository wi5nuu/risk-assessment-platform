"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Users, Mail, BadgeCheck, Github, Linkedin, Shield } from 'lucide-react'

const teamMembers = [
    {
        name: "WISNU ALFIAN NUR ASHAR",
        role: "Software Engineering & Cyber Security Specialist",
        nim: "001202400138"
    },
    {
        name: "MUHAMMAD ILHAM MAULANA",
        role: "Backend Developer & Web Applications Engineer",
        nim: "001202400034"
    },
    {
        name: "MUHAMMAD AHDA BRILIANTAMA (BRIAN)",
        role: "Quality Assurance & QnA Specialist",
        nim: "001202400081"
    },
    {
        name: "CHRISTOFER SOFIAN RIALDI SITOMPUL (CHRIS)",
        role: "Technical Documentation Specialist",
        nim: "001202400079"
    },
    {
        name: "RAFA BASIA HANIF",
        role: "Cybersecurity Testing Analyst",
        nim: "001202400043"
    }
]

export function TeamSection() {
    return (
        <section id="team" className="py-20 bg-white border-y border-slate-100">
            <div className="container px-4 mx-auto">
                <div className="max-w-2xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">Meet Our Team</h2>
                    <div className="h-1 w-12 bg-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {teamMembers.map((member) => (
                        <div key={member.nim} className="text-center group">
                            <div className="mb-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto group-hover:border-primary/30 transition-colors">
                                    <Users className="w-6 h-6 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mb-1 uppercase tracking-tight leading-tight">
                                {member.name}
                            </h3>
                            <p className="text-[10px] font-medium text-primary mb-2">
                                {member.role}
                            </p>
                            <div className="text-[9px] font-mono text-slate-400">
                                NIM: {member.nim}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
