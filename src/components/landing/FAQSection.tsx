"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle } from 'lucide-react'

const faqs = [
    {
        question: "How does the OCTAVE Allegro architecture guarantee assessment accuracy?",
        answer: "OCTAVE Allegro operates on an asset-centric model developed by SEI. This methodology eliminates subjective bias by mapping 'Information Assets' into eight strategic steps that integrate threat identification, vulnerability analysis, and operational impact quantitatively."
    },
    {
        question: "How does the platform handle the privacy of sensitive audit data?",
        answer: "We implement the 'Offline AI Integrity' philosophy. All of our AI reasoning engines run autonomously within an encrypted sandbox. No information sovereignty metadata is sent to the public cloud for model training, ensuring full compliance with Zero-Trust standards."
    },
    {
        question: "Do the generated reports meet ISO/IEC 27001:2022 standards?",
        answer: "Yes. Every audit in Risk Shield is mathematically mapped to ISO 27001:2022, NIST Cybersecurity Framework, and local regulations such as the PDP Law. The generated PDF reports include risk impact analysis, mitigation priorities, and technical control *Checklists* ready for external audits."
    },
    {
        question: "How does the system manage the scalability of risk assessments?",
        answer: "Through an enterprise-level Role-Based Access Control (RBAC) architecture, the platform supports multi-stakeholder collaboration. Auditors can delegate evidence collection to asset owners while maintaining data integrity through an immutable *audit trail*."
    },
    {
        question: "What is the competitive advantage of using Risk Shield for an organization?",
        answer: "Risk Shield transforms risk management from a cost center into a strategic asset. With *real-time* visibility into security maturity posture, organizations can precisely allocate resources to areas with the highest risk profiles, significantly accelerating regulatory compliance."
    }
]

export function FAQSection() {
    return (
        <section id="faq" className="py-32 bg-background relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 opacity-30" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full -z-10 opacity-30" />

            <div className="container mx-auto px-6">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                            <HelpCircle className="w-3 h-3" />
                            Security Wisdom
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                            Frequently Asked <span className="text-primary">Questions</span>
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            Everything you need to know about our AI privacy and GRC methodology.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Accordion type="single" collapsible className="w-full">
                            {faqs.map((faq, i) => (
                                <AccordionItem key={i} value={`item-${i}`} className="px-2">
                                    <AccordionTrigger className="text-sm md:text-base">
                                        {faq.question}
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        {faq.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                        className="mt-16 p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center"
                    >
                        <p className="text-sm font-bold text-muted-foreground">
                            Have other questions? Contact our team of compliance experts for free.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
