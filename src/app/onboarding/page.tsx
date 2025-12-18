'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { LoadingSpinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Search, Briefcase, Info, Check, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserTypeOption = 'client' | 'service_provider'

interface UserTypeCardProps {
  type: UserTypeOption
  title: string
  description: string
  icon: React.ReactNode
  selected: boolean
  onSelect: () => void
}

function UserTypeCard({ title, description, icon, selected, onSelect }: UserTypeCardProps) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left",
        "hover:border-primary-300 hover:bg-primary-50/50",
        selected 
          ? "border-primary-700 bg-primary-50" 
          : "border-gray-200 bg-white"
      )}
    >
      <div className={cn(
        "w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
        selected 
          ? "bg-primary-700 text-white" 
          : "bg-primary-100 text-primary-700"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-lg mb-1 transition-colors",
          selected ? "text-primary-700" : "text-gray-900"
        )}>
          {title}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
      </div>
      <div className={cn(
        "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all",
        selected 
          ? "bg-primary-700 border-primary-700" 
          : "border-gray-300"
      )}>
        {selected && <Check className="w-4 h-4 text-white" />}
      </div>
    </button>
  )
}

export default function OnboardingPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { 
    isAuthenticated, 
    isLoading, 
    clientProfile, 
    serviceProviderProfile, 
    setPendingProfileType,
    needsProfileSetup,
    signOut
  } = useAuth()
  
  const [selectedType, setSelectedType] = useState<UserTypeOption | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Translations
  const t = {
    welcome: language === 'cs' ? 'Vítejte v Tool Connect!' : 'Welcome to Tool Connect!',
    howToUse: language === 'cs' ? 'Jak chcete používat aplikaci?' : 'How would you like to use the app?',
    lookingForServices: language === 'cs' ? 'Hledám služby' : 'Looking for services',
    lookingForServicesDesc: language === 'cs' 
      ? 'Chci najít a kontaktovat poskytovatele služeb pro své projekty.'
      : 'I want to find and contact service providers for my projects.',
    serviceProvider: language === 'cs' ? 'Nabízím služby' : 'Offering services',
    serviceProviderDesc: language === 'cs'
      ? 'Jsem profesionál a chci nabízet své služby klientům.'
      : 'I\'m a professional and want to offer my services to clients.',
    canChangeLater: language === 'cs' 
      ? 'Tento výběr můžete později změnit v nastavení. Můžete mít oba typy profilů.'
      : 'You can change this later in settings. You can have both profile types.',
    continue: language === 'cs' ? 'Pokračovat' : 'Continue',
    selectOption: language === 'cs' ? 'Prosím vyberte možnost' : 'Please select an option',
    logout: language === 'cs' ? 'Odhlásit se' : 'Log out',
  }

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Redirect if user already has completed profiles
  useEffect(() => {
    if (!isLoading && isAuthenticated && !needsProfileSetup) {
      // User already has completed profiles, redirect to main app
      const hasClientProfile = clientProfile?.profile_completed
      const hasProviderProfile = serviceProviderProfile?.profile_completed
      
      if (hasProviderProfile) {
        router.push(`/providers/${serviceProviderProfile?.id}`)
      } else if (hasClientProfile) {
        router.push('/search')
      }
    }
  }, [isLoading, isAuthenticated, needsProfileSetup, clientProfile, serviceProviderProfile, router])

  const handleContinue = async () => {
    if (!selectedType) {
      setError(t.selectOption)
      return
    }
    
    setError(null)
    
    // Set the pending profile type
    setPendingProfileType(selectedType)
    
    // Navigate to the appropriate setup screen
    if (selectedType === 'client') {
      router.push('/onboarding/client')
    } else {
      router.push('/onboarding/service-provider')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <img 
            src="/icons/icon-192.png" 
            alt="Tool Connect" 
            className="w-20 h-20 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.welcome}
          </h1>
          <p className="text-lg text-gray-600">
            {t.howToUse}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Options */}
        <div className="space-y-4 mb-8">
          <UserTypeCard
            type="client"
            title={t.lookingForServices}
            description={t.lookingForServicesDesc}
            icon={<Search className="w-7 h-7" />}
            selected={selectedType === 'client'}
            onSelect={() => setSelectedType('client')}
          />

          <UserTypeCard
            type="service_provider"
            title={t.serviceProvider}
            description={t.serviceProviderDesc}
            icon={<Briefcase className="w-7 h-7" />}
            selected={selectedType === 'service_provider'}
            onSelect={() => setSelectedType('service_provider')}
          />
        </div>

        {/* Info Note */}
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-8">
          <Info className="w-4 h-4" />
          <span>{t.canChangeLater}</span>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedType}
          className="w-full h-14 text-lg"
        >
          {t.continue}
        </Button>

        {/* Logout Button */}
        <button
          onClick={signOut}
          className="w-full flex items-center justify-center gap-2 mt-4 py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          {t.logout}
        </button>
      </div>
    </div>
  )
}
