/**
 * Supabase Middleware for Route Protection
 * Handles authentication and authorization
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

  // Validate key format
  if (supabaseKey && !supabaseKey.startsWith('eyJ')) {
    console.error(
      'CRITICAL AUTH ERROR: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is invalid (it looks like a Stripe key). ' +
      'Authentication will NEVER work with this key. Please use the Supabase Anon key starting with eyJ.'
    )
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name)
          if (cookie) {
          }
          return cookie?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError && authError.message !== 'Auth session missing!') {
    console.warn('Middleware auth check error:', authError.message)
  }


  return { supabaseResponse, user }
}

// Role-based access control helper
export function checkRoleAccess(
  userRole: string | null,
  requiredRoles: string[]
): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole)
}

// Protected route matcher
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/projects',
  '/wizard',
  '/risk-register',
  '/reports',
  '/settings',
  '/admin',
  '/audit',
  '/ai-advisor',
]

export const ADMIN_ROUTES = [
  '/admin',
  '/admin/organization',
  '/admin/users',
]

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}
