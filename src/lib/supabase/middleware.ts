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

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser()

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
]

export const ADMIN_ROUTES = [
  '/settings/organization',
  '/settings/users',
]

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

export function isAdminRoute(pathname: string): boolean {
  return ADMIN_ROUTES.some(route => pathname.startsWith(route))
}
