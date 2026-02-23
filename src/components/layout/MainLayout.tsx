"use client"

import React from 'react'
import { Sidebar } from './Sidebar'
import { MobileNav } from './MobileNav'
import { useAuth } from '@/hooks/useAuth'
import { Shield, Bell, User } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { firstName, lastName, email, organizationName, role } = useAuth()

    return (
        <div className="flex min-h-screen bg-muted/30">
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="h-16 border-b bg-card flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-2 md:gap-4">
                        <MobileNav />
                        <div>
                            <h2 className="text-sm font-semibold truncate max-w-[150px] sm:max-w-none">{organizationName || 'Assessment Platform'}</h2>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{role} Dashboard</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-muted rounded-full relative">
                            <Bell className="w-5 h-5 text-muted-foreground" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium">{firstName} {lastName}</p>
                                <p className="text-xs text-muted-foreground">{email}</p>
                            </div>
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {firstName?.[0]}{lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
