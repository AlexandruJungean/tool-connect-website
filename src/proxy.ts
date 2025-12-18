/**
 * Next.js 16 Proxy Configuration
 * Replaces middleware.ts - handles request interception at the edge
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Get response
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // NOTE: Authentication for protected routes is handled client-side in each page
  // Server-side auth checks are unreliable because:
  // 1. Supabase cookie names are project-specific (sb-<project-ref>-auth-token)
  // 2. Client-side auth provides better UX with loading states
  // Protected pages: /profile, /messages, /favorites, /notifications, /settings
  // Each page checks isAuthenticated from AuthContext and redirects if needed

  // Handle locale detection for language
  const acceptLanguage = request.headers.get('accept-language')
  const prefersCzech = acceptLanguage?.includes('cs') || acceptLanguage?.includes('Czech')
  
  // Set language cookie if not present
  if (!request.cookies.get('language')) {
    response.cookies.set('language', prefersCzech ? 'cs' : 'en', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  return response
}

// Configure which paths the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - API routes that handle their own auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

