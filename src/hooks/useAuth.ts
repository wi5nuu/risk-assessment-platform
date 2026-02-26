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
    avatarUrl: string | null
    role: UserRole | null
    organizationId: string | null
    organizationName: string | null
    tempPassword?: string | null
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
        avatarUrl: null,
        role: null,
        organizationId: null,
        organizationName: null,
        tempPassword: null,
        isLoading: true,
    })

    useEffect(() => {
        loadAuth()
    }, [])

    const loadAuth = async () => {
        try {
            const { data: { user }, error: userError } = await supabase.auth.getUser()
            if (userError || !user) {
                setAuth(prev => ({ ...prev, isLoading: false }))
                return
            }

            // Fetch profile
            const { data: profile, error: profileError } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .maybeSingle()

            if (profile) {
                const { data: org } = await supabase
                    .from('organizations')
                    .select('name')
                    .eq('id', profile.organization_id)
                    .maybeSingle()

                setAuth({
                    userId: user.id,
                    profileId: profile.id,
                    email: profile.email,
                    firstName: profile.first_name,
                    lastName: profile.last_name,
                    avatarUrl: profile.avatar_url,
                    role: profile.role?.toLowerCase() as UserRole,
                    organizationId: profile.organization_id,
                    organizationName: org?.name || null,
                    tempPassword: profile.temp_password,
                    isLoading: false,
                })
            } else {
                setAuth(prev => ({ ...prev, userId: user.id, isLoading: false }))
            }
        } catch (err) {
            console.error('useAuth exception:', err)
            setAuth(prev => ({ ...prev, isLoading: false }))
        }
    }

    return {
        ...auth,
        refreshAuth: loadAuth,
        isAdmin: () => auth.role?.toLowerCase() === 'admin',
        isAuditor: () => auth.role?.toLowerCase() === 'auditor',
        isAuditee: () => auth.role?.toLowerCase() === 'auditee',
        canEdit: () => {
            const r = auth.role?.toLowerCase()
            return r === 'admin' || r === 'auditor'
        },
        canManageUsers: () => auth.role?.toLowerCase() === 'admin',
    }
}
