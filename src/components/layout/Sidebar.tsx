"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    ShieldAlert,
    ClipboardCheck,
    Settings,
    Users,
    Building2,
    FileText,
    Brain
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

interface SidebarProps {
    isMobile?: boolean
    onMobileClose?: () => void
}

export function Sidebar({ isMobile, onMobileClose }: SidebarProps) {
    const pathname = usePathname()
    const { role, isAdmin } = useAuth()

    const navItems = [
        {
            label: 'Main',
            items: [
                { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
                { name: 'Risk Assessment', href: '/projects', icon: ShieldAlert },
                { name: 'Security Audit', href: '/audit', icon: ClipboardCheck },
            ]
        },
        {
            label: 'AI & Reporting',
            items: [
                { name: 'AI Security Advisor', href: '/ai-advisor', icon: Brain },
                { name: 'Risk Register', href: '/risk-register', icon: FileText },
            ]
        }
    ]

    if (isAdmin()) {
        navItems.push({
            label: 'Admin',
            items: [
                { name: 'Users Management', href: '/admin/users', icon: Users },
                { name: 'Organization Profile', href: '/admin/organization', icon: Building2 },
            ]
        })
    }

    return (
        <div className={cn(
            "border-r bg-card h-screen sticky top-0 overflow-y-auto",
            isMobile ? "w-full shadow-2xl" : "w-64 hidden md:block"
        )}>
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary">
                    <ShieldAlert className="w-6 h-6" />
                    <span>CYBER 2</span>
                </Link>
            </div>
            <nav className="px-4 space-y-8">
                {navItems.map((group) => (
                    <div key={group.label} className="space-y-4">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                            {group.label}
                        </h4>
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => onMobileClose?.()}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground font-medium shadow-sm"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </nav>
        </div>
    )
}
