import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
    try {
        const { fullName, studentId, email } = await req.json()

        if (!fullName || !studentId || !email) {
            return NextResponse.json(
                { error: 'All fields are required: Full Name, Student ID, and Email.' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Validate against report_authorized_users table
        const { data: authorizedUser, error } = await supabase
            .from('report_authorized_users' as any)
            .select('*')
            .eq('full_name', fullName.trim())
            .eq('student_id', studentId.trim())
            .eq('email', email.trim().toLowerCase())
            .maybeSingle() as any

        if (error) {
            console.error('Validation query error:', error)
            return NextResponse.json(
                { error: 'System error during validation. Please try again.' },
                { status: 500 }
            )
        }

        if (!authorizedUser) {
            return NextResponse.json(
                { error: 'Identity verification failed. Your credentials do not match any authorized team member.' },
                { status: 403 }
            )
        }

        // Log the download
        const forwarded = req.headers.get('x-forwarded-for')
        const ip = forwarded?.split(',')[0]?.trim() || 'unknown'

        await supabase
            .from('report_downloads' as any)
            .insert({
                authorized_user_id: authorizedUser.id,
                full_name: authorizedUser.full_name,
                student_id: authorizedUser.student_id,
                email: authorizedUser.email,
                ip_address: ip,
            } as any)

        return NextResponse.json({
            success: true,
            user: {
                fullName: authorizedUser.full_name,
                studentId: authorizedUser.student_id,
            }
        })
    } catch (err: any) {
        console.error('Validate report access error:', err)
        return NextResponse.json(
            { error: 'Internal server error.' },
            { status: 500 }
        )
    }
}
