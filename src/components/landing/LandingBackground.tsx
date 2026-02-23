"use client"

import React from 'react'

export function LandingBackground() {
    return (
        <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-background">
            {/* Mesh Gradients / Animated Blobs */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse transition-all duration-1000" />
            <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[100px] rounded-full animate-pulse delay-700 transition-all duration-1000" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 blur-[80px] rounded-full transition-all duration-1000" />

            {/* Subtle Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                    backgroundSize: '40px 40px'
                }}
            />

            {/* Noise Texture */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    )
}
