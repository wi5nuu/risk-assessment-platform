/**
 * API Route: Risks
 * CRUD operations for risks with validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { riskSchema, riskUpdateSchema } from '@/lib/validation/schemas'
import { ZodError } from 'zod'

// GET /api/risks - List risks
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID required' }, { status: 400 })
    }

    const { data, error } = await (supabase as any)
      .from('risks')
      .select('*')
      .eq('project_id', projectId)
      .eq('is_active', true)
      .order('risk_score', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching risks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risks' },
      { status: 500 }
    )
  }
}

// POST /api/risks - Create risk
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Validate input
    const validatedData = riskSchema.parse(body)

    // Calculate risk score
    const maxImpact = Math.max(
      validatedData.financial_impact || 1,
      validatedData.reputational_impact || 1,
      validatedData.legal_impact || 1,
      validatedData.operational_impact || 1
    )

    const { data, error } = await (supabase as any)
      .from('risks')
      .insert({
        ...validatedData,
        impact: maxImpact,
        identified_by: user.id,
      } as any)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating risk:', error)
    return NextResponse.json(
      { error: 'Failed to create risk' },
      { status: 500 }
    )
  }
}

// PATCH /api/risks - Update risk
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Risk ID required' }, { status: 400 })
    }

    // Validate input
    const validatedData = riskUpdateSchema.parse(updateData)

    const { data, error } = await (supabase as any)
      .from('risks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error updating risk:', error)
    return NextResponse.json(
      { error: 'Failed to update risk' },
      { status: 500 }
    )
  }
}

// DELETE /api/risks - Delete risk (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Risk ID required' }, { status: 400 })
    }

    const { error } = await (supabase as any)
      .from('risks')
      .update({ is_active: false })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting risk:', error)
    return NextResponse.json(
      { error: 'Failed to delete risk' },
      { status: 500 }
    )
  }
}
