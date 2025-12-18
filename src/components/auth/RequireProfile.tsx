'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui'

interface RequireProfileProps {
  children: React.ReactNode
}

// Pages that don't require authentication at all (public viewing)
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/about',
  '/contact',
  '/privacy',
  '/privacy-policy',
  '/terms',
  '/terms-conditions',
  '/service-providers',
  '/download',
  '/welcome',
]

// Admin paths have their own authentication handling
const ADMIN_PATHS = ['/admin']

// Onboarding paths - always accessible for authenticated users needing setup
const ONBOARDING_PATHS = [
  '/onboarding',
  '/onboarding/client',
  '/onboarding/service-provider',
]

// Check if path is a public path (no auth required)
const isPublicPath = (pathname: string) => {
  return PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
}

// Check if path is an admin path (has own auth handling)
const isAdminPath = (pathname: string) => {
  return ADMIN_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
}

// Check if path is an onboarding path
const isOnboardingPath = (pathname: string) => {
  return ONBOARDING_PATHS.some(path => pathname === path)
}

export function RequireProfile({ children }: RequireProfileProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    isAuthenticated, 
    isLoading, 
    needsProfileSetup,
    clientProfile,
    serviceProviderProfile
  } = useAuth()

  useEffect(() => {
    // Don't redirect while still loading
    if (isLoading) return
    
    // Public paths don't require any checks
    if (isPublicPath(pathname)) return
    
    // Admin paths have their own auth handling
    if (isAdminPath(pathname)) return
    
    // If on onboarding path, don't redirect
    if (isOnboardingPath(pathname)) return
    
    // If authenticated and needs profile setup, redirect to onboarding
    if (isAuthenticated && needsProfileSetup) {
      // Check if there's a pending profile type to go directly to that setup
      const hasNoProfiles = !clientProfile && !serviceProviderProfile
      
      if (hasNoProfiles) {
        router.push('/onboarding')
      } else if (clientProfile && !clientProfile.profile_completed) {
        router.push('/onboarding/client')
      } else if (serviceProviderProfile && !serviceProviderProfile.profile_completed) {
        router.push('/onboarding/service-provider')
      } else {
        router.push('/onboarding')
      }
    }
  }, [isLoading, isAuthenticated, needsProfileSetup, pathname, router, clientProfile, serviceProviderProfile])

  // Show loading while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If authenticated, needs profile setup, and NOT on an allowed path, show loading while redirecting
  if (isAuthenticated && needsProfileSetup && !isPublicPath(pathname) && !isAdminPath(pathname) && !isOnboardingPath(pathname)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return <>{children}</>
}
