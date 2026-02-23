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

// GET organization
export async function GET(request: NextRequest) {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })

    const supabase = createAdminClient() as any
    const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', admin.orgId)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ organization: data })
}

// PATCH: update organization
export async function PATCH(request: NextRequest) {
    console.log('PATCH /api/admin/organization: Starting update')
    const admin = await verifyAdmin()
    if (!admin) {
        console.error('PATCH /api/admin/organization: verifyAdmin failed')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    try {
        const body = await request.json()
        console.log(`PATCH /api/admin/organization: Updating org ${admin.orgId}`)

        // Define fields we expect in the DB
        const validFields = ['name', 'industry', 'size', 'address', 'city', 'country', 'website', 'contact_email', 'contact_phone', 'exposure_level']
        const updates: any = {}

        validFields.forEach(field => {
            if (field in body) {
                updates[field] = body[field]
            }
        })

        // Module 2 Requirement: Determine exposure level automatically
        if (updates.industry || updates.size) {
            const industry = (updates.industry || '').toLowerCase()
            const size = (updates.size || '').toLowerCase()

            let level = 'Low'

            if (industry.includes('tech') || industry.includes('finan') || industry.includes('bank') || industry.includes('cyber')) {
                level = 'High'
            } else if (industry.includes('health') || industry.includes('gov') || industry.includes('educat')) {
                level = 'Medium'
            }

            if (size.includes('500') || size.includes('1000') || size.includes('large')) {
                level = level === 'Low' ? 'Medium' : (level === 'Medium' ? 'High' : 'Critical')
            }

            updates.exposure_level = level
        }

        console.log('PATCH /api/admin/organization: Filtered updates:', updates)

        const supabase = createAdminClient() as any

        const { error } = await supabase
            .from('organizations')
            .update(updates)
            .eq('id', admin.orgId)

        if (error) {
            console.error('PATCH /api/admin/organization: DB Update failed', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        console.log('PATCH /api/admin/organization: Success')
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('PATCH /api/admin/organization: Unexpected error', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
