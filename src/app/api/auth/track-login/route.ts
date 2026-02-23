import { createServerSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { Database } from '@/types/database'

export async function POST(request: Request) {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const headerList = headers()
    const forwarded = headerList.get('x-forwarded-for')
    const currentIp = forwarded ? forwarded.split(',')[0] : '127.0.0.1'

    // Fetch current profile to get last_login_ip
    // We use any cast here because of deep type mapping issues with the user_profiles table in this context
    const { data: profile, error: fetchError } = await (supabase
        .from('user_profiles' as any)
        .select('*' as any)
        .eq('user_id', user.id)
        .single() as any)

    if (fetchError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const ipChanged = profile.last_login_ip !== currentIp

    // Update last_login_ip and last_login_at
    const { error: updateError } = await (supabase
        .from('user_profiles' as any) as any)
        .update({
            last_login_ip: currentIp,
            last_login_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

    // Generate welcome message based on role and IP change
    let welcomeMessage = ''
    if (ipChanged) {
        if (profile.role === 'admin') {
            welcomeMessage = `Security Alert: New login detected from ${currentIp}. Welcome back, Administrator ${profile.first_name}.`
        } else {
            welcomeMessage = `Welcome to Risk Shield System, ${profile.first_name}! You are logged in as ${profile.role}.`
        }
    }

    return NextResponse.json({
        ipChanged,
        welcomeMessage,
        role: profile.role,
        name: profile.first_name
    })
}
