import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
    try {
        const { userId, email, firstName, lastName, organizationName } = await request.json()

        if (!userId || !email || !organizationName) {
            return NextResponse.json(
                { error: 'Missing required registration data' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // 1. Create organization using admin client (bypasses RLS)
        const { data: orgData, error: orgError } = await (supabase as any)
            .from('organizations')
            .insert({
                name: organizationName,
                industry: 'Technology',
                is_active: true
            })
            .select()
            .single()

        if (orgError) {
            console.error('Org creation error:', orgError)
            return NextResponse.json({ error: orgError.message }, { status: 500 })
        }

        // 2. Create user profile using admin client (bypasses RLS)
        const { error: profileError } = await (supabase as any)
            .from('user_profiles')
            .insert({
                user_id: userId,
                organization_id: orgData.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: 'admin',
                is_active: true
            })

        if (profileError) {
            console.error('Profile creation error:', profileError)
            // Note: In a production app, you might want to rollback the org creation if profile fails
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            organizationId: orgData.id
        })
    } catch (error: any) {
        console.error('Registration API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}
