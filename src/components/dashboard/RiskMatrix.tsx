"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Risk {
    id: string
    risk_title: string
    likelihood: number
    impact: number
    risk_score: number
    risk_level: string
}

interface RiskMatrixProps {
    risks: Risk[]
}

export function RiskMatrix({ risks }: RiskMatrixProps) {
    // 5x5 Grid (Likelihood 1-5, Impact 1-5)
    const likelihoods = [5, 4, 3, 2, 1]
    const impacts = [1, 2, 3, 4, 5]

    const getCellColor = (likelihood: number, impact: number) => {
        const score = likelihood * impact
        if (score >= 16) return 'bg-red-500 hover:bg-red-600'
        if (score >= 11) return 'bg-orange-500 hover:bg-orange-600'
        if (score >= 6) return 'bg-amber-400 hover:bg-amber-500'
        return 'bg-emerald-500 hover:bg-emerald-600'
    }

    const getRisksInCell = (likelihood: number, impact: number) => {
        return risks.filter(r => r.likelihood === likelihood && r.impact === impact)
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col">
                <div className="grid grid-cols-[30px_1fr] gap-4">
                    {/* Y-Axis Label (Likelihood) */}
                    <div className="flex flex-col justify-between py-8 text-[10px] font-black uppercase text-slate-400 [writing-mode:vertical-lr] rotate-180 items-center tracking-widest">
                        Likelihood
                    </div>

                    <div className="space-y-2">
                        {/* Grid */}
                        <div className="grid grid-cols-5 gap-2 aspect-square md:aspect-auto md:h-[300px]">
                            {likelihoods.map((l) => (
                                impacts.map((i) => {
                                    const cellRisks = getRisksInCell(l, i)
                                    const hasRisks = cellRisks.length > 0

                                    return (
                                        <TooltipProvider key={`${l}-${i}`}>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "relative rounded-lg transition-all duration-300 flex items-center justify-center cursor-default group",
                                                            getCellColor(l, i),
                                                            !hasRisks && "opacity-20 hover:opacity-100"
                                                        )}
                                                    >
                                                        {hasRisks && (
                                                            <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-white shadow-sm group-hover:scale-125 transition-transform">
                                                                {cellRisks.length}
                                                            </div>
                                                        )}
                                                        {/* Cell Indicator for empty cells on hover */}
                                                        {!hasRisks && (
                                                            <span className="text-[8px] font-bold text-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                {l}x{i}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-slate-900 border-none text-white p-3 rounded-xl shadow-2xl">
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                            L: {l} / I: {i} (Score: {l * i})
                                                        </p>
                                                        {hasRisks ? (
                                                            <ul className="space-y-1">
                                                                {cellRisks.slice(0, 3).map(r => (
                                                                    <li key={r.id} className="text-xs font-bold leading-tight line-clamp-1">• {r.risk_title}</li>
                                                                ))}
                                                                {cellRisks.length > 3 && (
                                                                    <li className="text-[10px] italic text-slate-500">And {cellRisks.length - 3} more...</li>
                                                                )}
                                                            </ul>
                                                        ) : (
                                                            <p className="text-xs font-medium italic text-slate-500">No risks identified in this quadrant</p>
                                                        )}
                                                    </div>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })
                            ))}
                        </div>

                        {/* X-Axis Labels (Impact) */}
                        <div className="grid grid-cols-5 gap-2 text-center py-2">
                            {impacts.map(i => (
                                <div key={i} className="text-[10px] font-black text-slate-400">I:{i}</div>
                            ))}
                        </div>
                        <div className="text-[10px] font-black uppercase text-slate-400 text-center tracking-widest">
                            Impact Assessment
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-6 border-t pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Low</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-tighter text-slate-500 italic">Critical</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
