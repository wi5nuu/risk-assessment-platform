import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createServerSupabaseClient } from '@/lib/supabase/server'

// Helper to verify admin role
async function verifyAdmin() {
    try {
        const supabase = await createServerSupabaseClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            console.error('verifyAdmin: Auth failed', authError?.message || 'No user')
            return null
        }

        const adminClient = createAdminClient() as any
        const { data: profile, error: profileError } = await adminClient
            .from('user_profiles')
            .select('role, organization_id')
            .eq('user_id', user.id)
            .single()

        if (profileError || !profile) {
            console.error('verifyAdmin: Profile fetch failed', profileError)
            return null
        }

        if (profile.role !== 'admin') {
            console.warn(`verifyAdmin: User ${user.id} has role ${profile.role}, not admin`)
            return null
        }

        return { userId: user.id, orgId: profile.organization_id }
    } catch (err) {
        console.error('verifyAdmin: Unexpected error', err)
        return null
    }
}

// GET: List users in organization
export async function GET(request: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const supabase = createAdminClient() as any
    const { data, error } = await supabase
        .from('user_profiles')
        .select(`
            *,
            temp_password
        `)
        .eq('organization_id', admin.orgId)
        .order('created_at', { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ users: data })
}

// POST: Create a new user (Auditor or Auditee)
export async function POST(request: NextRequest) {
    console.log('POST /api/admin/users: Starting user creation')
    const admin = await verifyAdmin()
    if (!admin) {
        console.error('POST /api/admin/users: verifyAdmin failed')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, firstName, lastName, role, inviteOnly } = body
    console.log(`POST /api/admin/users: ${inviteOnly ? 'Inviting' : 'Creating'} ${role} user: ${email}`)

    if (!email || (!password && !inviteOnly) || !firstName || !lastName || !role) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['auditor', 'auditee'].includes(role)) {
        return NextResponse.json({ error: 'Invalid role. Must be auditor or auditee.' }, { status: 400 })
    }

    const supabase = createAdminClient() as any

    let userId: string

    if (inviteOnly) {
        // Invite via email
        const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
            redirectTo: `${request.nextUrl.origin}/auth/callback`,
            data: {
                first_name: firstName,
                last_name: lastName,
                role: role,
            }
        })

        if (inviteError) {
            console.error('POST /api/admin/users: Invite failed', inviteError)
            return NextResponse.json({ error: inviteError.message }, { status: 500 })
        }
        userId = inviteData.user.id
    } else {
        // 1. Create auth user with password
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        })

        if (authError) {
            console.error('POST /api/admin/users: Auth creation failed', authError)
            return NextResponse.json({ error: authError.message }, { status: 500 })
        }
        userId = authData.user.id
    }

    console.log(`POST /api/admin/users: Auth user ${inviteOnly ? 'invited' : 'created'}: ${userId}`)

    // 2. Create user profile
    const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
            user_id: userId,
            organization_id: admin.orgId,
            first_name: firstName,
            last_name: lastName,
            email,
            role,
            is_active: true,
            temp_password: inviteOnly ? null : password,
        })

    if (profileError) {
        console.error('POST /api/admin/users: Profile creation failed', profileError)
        // Rollback: delete auth user
        await supabase.auth.admin.deleteUser(userId)
        return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    console.log('POST /api/admin/users: Success')
    return NextResponse.json({ success: true, userId: userId })
}

// PATCH: Update user role or status
export async function PATCH(request: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const { profileId, role, is_active, password } = await request.json()
    if (!profileId) return NextResponse.json({ error: 'Missing profileId' }, { status: 400 })

    const supabase = createAdminClient() as any

    // Verify user belongs to same org
    const { data: target } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('id', profileId)
        .single()

    if (!target || target.organization_id !== admin.orgId) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updates: any = {}
    if (role && ['admin', 'auditor', 'auditee'].includes(role)) updates.role = role
    if (typeof is_active === 'boolean') updates.is_active = is_active
    if (password) updates.temp_password = password

    // If password provided, update auth user
    if (password) {
        const { data: userData } = await supabase
            .from('user_profiles')
            .select('user_id')
            .eq('id', profileId)
            .single()

        if (userData) {
            const { error: authError } = await supabase.auth.admin.updateUserById(
                userData.user_id,
                { password: password }
            )
            if (authError) {
                console.error('PATCH /api/admin/users: Password update failed', authError)
                return NextResponse.json({ error: 'Auth update failed: ' + authError.message }, { status: 500 })
            }
        }
    }

    const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', profileId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
