'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LoadingSpinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { ArrowRight, LogOut } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { 
    isAuthenticated, 
    isLoading, 
    clientProfile, 
    serviceProviderProfile, 
    pendingProfileType,
    needsProfileSetup,
    signOut
  } = useAuth()

  const t = {
    welcome: language === 'cs' ? 'Pojďme vás zaregistrovat!' : "Let's get you onboarded!",
    subtitle: language === 'cs'
      ? 'Za pár kroků si nastavíte svůj profil a budete moci začít.'
      : "In just a few steps you'll set up your profile and be ready to go.",
    start: language === 'cs' ? 'Začít' : "Let's start",
    logout: language === 'cs' ? 'Odhlásit se' : 'Sign out',
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!isLoading && isAuthenticated && !needsProfileSetup) {
      const hasProviderProfile = serviceProviderProfile?.profile_completed
      const hasClientProfile = clientProfile?.profile_completed
      
      if (hasProviderProfile) {
        router.push(`/providers/${serviceProviderProfile?.id}`)
      } else if (hasClientProfile) {
        router.push('/search')
      }
    }
  }, [isLoading, isAuthenticated, needsProfileSetup, clientProfile, serviceProviderProfile, router])

  const handleStart = () => {
    if (pendingProfileType === 'client') {
      router.push('/onboarding/client')
    } else if (pendingProfileType === 'service_provider') {
      router.push('/onboarding/service-provider')
    } else {
      router.push('/onboarding/service-provider')
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto px-6 text-center">
        <img 
          src="/icons/icon-192.png" 
          alt="Tool Connect" 
          className="w-24 h-24 rounded-2xl mx-auto mb-8"
        />

        <p className="text-lg text-gray-500 mb-1">
          {language === 'cs' ? 'Vítejte v Tool' : 'Welcome to Tool'}
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {t.welcome}
        </h1>
        <p className="text-gray-500 mb-10">
          {t.subtitle}
        </p>

        <Button
          onClick={handleStart}
          className="w-full h-14 text-lg"
        >
          {t.start}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 mt-6 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </div>
  )
}
