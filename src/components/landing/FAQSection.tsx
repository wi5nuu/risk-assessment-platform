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
        question: "Bagaimana arsitektur OCTAVE Allegro menjamin akurasi penilaian?",
        answer: "OCTAVE Allegro beroperasi pada model aset-sentris yang dikembangkan oleh SEI. Metodologi ini menghilangkan bias subjektif dengan memetakan 'Information Assets' ke dalam delapan langkah strategis yang mengintegrasika identifikasi ancaman, analisis kerentanan, dan dampak operasional secara kuantitatif."
    },
    {
        question: "Bagaimana platform menangani privasi data audit yang sensitif?",
        answer: "Kami mengimplementasikan filosofi 'Offline AI Integrity'. Seluruh mesin penalaran AI kami berjalan secara otonom dalam sandbox terenkripsi. Tidak ada metadata kedaulatan informasi yang dikirim ke cloud publik untuk pelatihan model, memastikan kepatuhan penuh terhadap standar Zero-Trust."
    },
    {
        question: "Apakah laporan yang dihasilkan memenuhi standar ISO/IEC 27001:2022?",
        answer: "Ya. Setiap audit dalam Risk Shield dipetakan secara matematis ke kontrol ISO 27001:2022, NIST Cybersecurity Framework, dan regulasi lokal seperti UU PDP. Laporan PDF yang dihasilkan mencakup analisis dampak risiko, prioritas mitigasi, dan *Checklist* kontrol teknis yang siap untuk audit eksternal."
    },
    {
        question: "Bagaimana sistem mengelola skalabilitas penilaian risiko?",
        answer: "Melalui arsitektur Role-Based Access Control (RBAC) tingkat enterprise, platform mendukung kolaborasi multi-stakeholder. Auditor dapat mendelegasikan pengumpulan bukti ke pemilik aset sambil tetap menjaga integritas data melalui jalur audit (*audit trail*) yang tidak dapat dirubah."
    },
    {
        question: "Apa keunggulan kompetitif menggunakan Risk Shield bagi organisasi?",
        answer: "Risk Shield mentransformasi manajemen risiko dari pusat biaya menjadi aset strategis. Dengan visibilitas *real-time* terhadap postur maturitas keamanan, organisasi dapat mengalokasikan sumber daya secara presisi pada area dengan profil risiko tertinggi, mempercepat kepatuhan regulasi secara signifikan."
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
                            Pertanyaan <span className="text-primary">Umum</span>
                        </h2>
                        <p className="text-muted-foreground font-medium">
                            Segala yang perlu Anda ketahui tentang privasi AI dan metodologi GRC kami.
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
                            Punya pertanyaan lain? Hubungi tim pakar kepatuhan kami secara gratis.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
