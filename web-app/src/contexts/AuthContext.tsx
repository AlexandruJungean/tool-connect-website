'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useRef, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { ClientProfile, ServiceProviderProfile, User as AppUser } from '@/types/database'

type UserType = 'client' | 'service_provider' | null
type PendingProfileType = 'client' | 'service_provider' | null

const PENDING_PROFILE_TYPE_KEY = 'tool-connect-pending-profile-type'

interface AuthContextType {
  user: User | null
  session: Session | null
  appUser: AppUser | null
  clientProfile: ClientProfile | null
  serviceProviderProfile: ServiceProviderProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  currentUserType: UserType
  pendingProfileType: PendingProfileType
  needsProfileSetup: boolean
  profileTypeNeedingSetup: PendingProfileType
  setCurrentUserType: (type: UserType) => void
  setPendingProfileType: (type: PendingProfileType) => void
  clearPendingProfileType: () => void
  switchUserType: (type: 'client' | 'service_provider', force?: boolean) => Promise<void>
  signOut: () => Promise<void>
  refreshProfiles: () => Promise<void>
  refreshProfile: () => Promise<void>
  updateClientProfileLocal: (updates: Partial<ClientProfile>) => void
  updateServiceProviderProfileLocal: (updates: Partial<ServiceProviderProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [appUser, setAppUser] = useState<AppUser | null>(null)
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [serviceProviderProfile, setServiceProviderProfile] = useState<ServiceProviderProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentUserType, setCurrentUserType] = useState<UserType>(null)
  const [pendingProfileType, setPendingProfileTypeState] = useState<PendingProfileType>(null)
  
  // Track initialization state
  const initializingRef = useRef(false)
  const initializedRef = useRef(false)

  // Load pending profile type from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PENDING_PROFILE_TYPE_KEY)
      if (stored === 'client' || stored === 'service_provider') {
        setPendingProfileTypeState(stored)
      }
    }
  }, [])

  // Set pending profile type (persists to localStorage)
  const setPendingProfileType = useCallback((type: PendingProfileType) => {
    setPendingProfileTypeState(type)
    if (typeof window !== 'undefined') {
      if (type) {
        localStorage.setItem(PENDING_PROFILE_TYPE_KEY, type)
      } else {
        localStorage.removeItem(PENDING_PROFILE_TYPE_KEY)
      }
    }
  }, [])

  // Clear pending profile type
  const clearPendingProfileType = useCallback(() => {
    setPendingProfileTypeState(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(PENDING_PROFILE_TYPE_KEY)
    }
  }, [])

  // Optimistic update functions
  const updateClientProfileLocal = useCallback((updates: Partial<ClientProfile>) => {
    setClientProfile(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const updateServiceProviderProfileLocal = useCallback((updates: Partial<ServiceProviderProfile>) => {
    setServiceProviderProfile(prev => prev ? { ...prev, ...updates } : null)
  }, [])

  const fetchProfiles = useCallback(async (userId: string, preserveUserType = false): Promise<{
    appUser: AppUser | null
    clientProfile: ClientProfile | null
    serviceProviderProfile: ServiceProviderProfile | null
  }> => {
    let fetchedAppUser: AppUser | null = null
    let fetchedClientProfile: ClientProfile | null = null
    let fetchedServiceProviderProfile: ServiceProviderProfile | null = null

    try {
      // Fetch app user from users table first (this contains preferred_profile_type)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (!userError && userData) {
        fetchedAppUser = userData as AppUser
      }

      // Fetch client profile
      const { data: clientData } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (clientData) {
        fetchedClientProfile = clientData as ClientProfile
      }

      // Fetch service provider profile
      const { data: providerData } = await supabase
        .from('service_provider_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (providerData) {
        fetchedServiceProviderProfile = providerData as ServiceProviderProfile
      }

      // Update state
      setAppUser(fetchedAppUser)
      setClientProfile(fetchedClientProfile)
      setServiceProviderProfile(fetchedServiceProviderProfile)

      // Determine user type based on:
      // 1. If preserveUserType is true, keep current type
      // 2. Otherwise, use preferred_profile_type from user record
      // 3. Fall back to available profiles
      if (!preserveUserType) {
        // Check user's preferred profile type from the database
        // The database might store 'client' | 'service_provider' or 'service-provider' (normalize)
        const preferredType = fetchedAppUser?.preferred_profile_type as string | undefined
        const normalizedPreferred = preferredType?.includes('provider') ? 'service_provider' : preferredType
        
        if (normalizedPreferred === 'service_provider' && fetchedServiceProviderProfile?.profile_completed) {
          setCurrentUserType('service_provider')
        } else if (normalizedPreferred === 'client' && fetchedClientProfile?.profile_completed) {
          setCurrentUserType('client')
        } else if (fetchedClientProfile?.profile_completed && !fetchedServiceProviderProfile?.profile_completed) {
          setCurrentUserType('client')
        } else if (fetchedServiceProviderProfile?.profile_completed && !fetchedClientProfile?.profile_completed) {
          setCurrentUserType('service_provider')
        } else if (fetchedClientProfile?.profile_completed) {
          // Default to client if has both profiles and no preference
          setCurrentUserType('client')
        }
      }

      return {
        appUser: fetchedAppUser,
        clientProfile: fetchedClientProfile,
        serviceProviderProfile: fetchedServiceProviderProfile
      }
    } catch (error) {
      console.error('Error fetching profiles:', error)
      return {
        appUser: null,
        clientProfile: null,
        serviceProviderProfile: null
      }
    }
  }, [])

  const refreshProfiles = useCallback(async () => {
    if (user) {
      // Preserve the current user type when refreshing profiles
      await fetchProfiles(user.id, true)
    }
  }, [user, fetchProfiles])

  // Alias for refreshProfiles for consistency
  const refreshProfile = refreshProfiles

  const switchUserType = useCallback(async (type: 'client' | 'service_provider', force: boolean = false) => {
    // Validate the user has the profile for this type (unless force is true - used during onboarding)
    if (!force) {
      if (type === 'client' && !clientProfile) return
      if (type === 'service_provider' && !serviceProviderProfile) return
    }
    
    // Update local state immediately
    setCurrentUserType(type)
    
    // Save preference to database
    // Note: Database stores 'service-provider' (with hyphen), but app uses 'service_provider' (with underscore)
    if (user) {
      try {
        const dbType = type === 'service_provider' ? 'service-provider' : type
        const { error } = await supabase
          .from('users')
          .update({ 
            preferred_profile_type: dbType,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
        
        if (error) {
          console.error('Error saving profile type preference:', error)
        } else {
          // Update local appUser state (keep internal format)
          setAppUser(prev => prev ? { ...prev, preferred_profile_type: type } : null)
        }
      } catch (error) {
        console.error('Error switching user type:', error)
      }
    }
  }, [user, clientProfile, serviceProviderProfile])

  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      // Prevent double initialization
      if (initializingRef.current || initializedRef.current) return
      initializingRef.current = true
      
      try {
        // First, try to get the session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }
        
        if (!isMounted) return
        
        if (currentSession?.user) {
          setSession(currentSession)
          setUser(currentSession.user)
          
          // Wait for profiles to be fetched before setting isLoading to false
          await fetchProfiles(currentSession.user.id)
        } else {
          setSession(null)
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        if (isMounted) {
          initializingRef.current = false
          initializedRef.current = true
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return
        
        // Skip if we're still initializing
        if (initializingRef.current) return
        
        // Handle sign out
        if (!newSession) {
          setSession(null)
          setUser(null)
          setAppUser(null)
          setClientProfile(null)
          setServiceProviderProfile(null)
          setCurrentUserType(null)
          return
        }
        
        // For SIGNED_IN events, fetch all data
        if (event === 'SIGNED_IN') {
          setIsLoading(true)
          setSession(newSession)
          setUser(newSession.user)
          await fetchProfiles(newSession.user.id)
          setIsLoading(false)
        } else if (event === 'TOKEN_REFRESHED') {
          // For token refresh, just update session, don't refetch profiles
          setSession(newSession)
          setUser(newSession.user)
        } else if (event === 'USER_UPDATED') {
          // For user updates, refresh profiles
          setSession(newSession)
          setUser(newSession.user)
          await fetchProfiles(newSession.user.id, true)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchProfiles])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setAppUser(null)
    setClientProfile(null)
    setServiceProviderProfile(null)
    setCurrentUserType(null)
    clearPendingProfileType()
  }, [clearPendingProfileType])

  // Determine if user needs profile setup
  // User needs setup if:
  // 1. Authenticated but has no completed profiles at all
  // 2. Has pending profile type that doesn't have a completed profile
  // 3. Has an incomplete profile (profile_completed === false)
  const hasCompletedClientProfile = clientProfile?.profile_completed === true
  const hasCompletedServiceProviderProfile = serviceProviderProfile?.profile_completed === true
  const hasNoCompletedProfiles = !hasCompletedClientProfile && !hasCompletedServiceProviderProfile
  
  // Check for new user flow (selected a role but doesn't have a completed profile for that role)
  const needsNewProfileSetup = !!pendingProfileType && (
    (pendingProfileType === 'client' && !hasCompletedClientProfile) ||
    (pendingProfileType === 'service_provider' && !hasCompletedServiceProviderProfile)
  )
  
  const needsProfileSetup = !!session && !isLoading && (
    needsNewProfileSetup || hasNoCompletedProfiles
  )
  
  // Determine which profile type needs setup
  const profileTypeNeedingSetup: PendingProfileType = 
    (pendingProfileType === 'client' && !hasCompletedClientProfile) ? 'client' :
    (pendingProfileType === 'service_provider' && !hasCompletedServiceProviderProfile) ? 'service_provider' :
    null

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        appUser,
        clientProfile,
        serviceProviderProfile,
        isLoading,
        isAuthenticated: !!user,
        currentUserType,
        pendingProfileType,
        needsProfileSetup,
        profileTypeNeedingSetup,
        setCurrentUserType,
        setPendingProfileType,
        clearPendingProfileType,
        switchUserType,
        signOut,
        refreshProfiles,
        refreshProfile,
        updateClientProfileLocal,
        updateServiceProviderProfileLocal,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
