"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { UserRole } from '@/types'

interface AuthState {
    userId: string | null
    profileId: string | null
    email: string | null
    firstName: string | null
    lastName: string | null
    role: UserRole | null
    organizationId: string | null
    organizationName: string | null
    isLoading: boolean
}

export function useAuth() {
    const supabase = createClient() as any
    const [auth, setAuth] = useState<AuthState>({
        userId: null,
        profileId: null,
        email: null,
        firstName: null,
        lastName: null,
        role: null,
        organizationId: null,
        organizationName: null,
        isLoading: true,
    })

    useEffect(() => {
        loadAuth()
    }, [])

    const loadAuth = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setAuth(prev => ({ ...prev, isLoading: false }))
                return
            }

            // Fetch profile and organization name in one query if possible or separate
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('id, first_name, last_name, email, role, organization_id, organizations(name)')
                .eq('user_id', user.id)
                .single()

            if (profile) {
                setAuth({
                    userId: user.id,
                    profileId: profile.id,
                    email: profile.email,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    role: profile.role,
                    organizationId: profile.organization_id,
                    organizationName: profile.organizations?.name || null,
                    isLoading: false,
                })
            } else {
                setAuth(prev => ({ ...prev, userId: user.id, isLoading: false }))
            }
        } catch (err) {
            console.error('useAuth error:', err)
            setAuth(prev => ({ ...prev, isLoading: false }))
        }
    }

    return {
        ...auth,
        isAdmin: () => auth.role === 'admin',
        isAuditor: () => auth.role === 'auditor',
        isAuditee: () => auth.role === 'auditee',
        canEdit: () => auth.role === 'admin' || auth.role === 'auditor',
        canManageUsers: () => auth.role === 'admin',
    }
}
