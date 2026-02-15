'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CountryCodePicker } from '@/components/ui/CountryCodePicker'
import { DEFAULT_COUNTRY, CountryCode } from '@/constants/countryCodes'
import { ArrowRight, ArrowLeft, CheckCircle, Loader2, Search, Briefcase, Eye, Pencil } from 'lucide-react'

type UserRole = 'client' | 'service-provider' | null

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { language, t } = useLanguage()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  
  const [step, setStep] = useState<'role' | 'phone' | 'verify'>('role')
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(DEFAULT_COUNTRY)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Role-specific content
  const roleContent = {
    client: {
      title: language === 'cs' ? 'Najděte svého specialistu' : 'Find Your Specialist',
      subtitle: language === 'cs' 
        ? 'Zadejte své telefonní číslo a začněte se spojovat s ověřenými profesionály.'
        : 'Enter your phone number to start connecting with trusted professionals.',
    },
    'service-provider': {
      title: language === 'cs' ? 'Rozšiřte své podnikání' : 'Grow Your Business',
      subtitle: language === 'cs' 
        ? 'Zadejte své telefonní číslo a začněte oslovovat nové klienty.'
        : 'Enter your phone number to start reaching new clients.',
    },
  }

  // Redirect authenticated users away from login
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const redirectTo = searchParams.get('redirect') || '/search'
      window.location.href = redirectTo
    }
  }, [isAuthenticated, authLoading, searchParams])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  // Format phone number for API (without spaces)
  const getCleanPhoneNumber = (): string => {
    const cleaned = phoneNumber.replace(/\D/g, '')
    return `${selectedCountry.dialCode}${cleaned}`
  }

  // Format phone number as user types: XXX XXX XXX
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '')
    let formatted = cleaned
    if (cleaned.length > 3) {
      formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    }
    if (cleaned.length > 6) {
      formatted = `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)}`
    }
    setPhoneNumber(formatted)
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!phoneNumber.trim()) {
      setError(language === 'cs' ? 'Zadejte telefonní číslo' : 'Please enter a phone number')
      return
    }
    
    setIsLoading(true)

    try {
      const formattedPhone = getCleanPhoneNumber()
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      })

      if (error) throw error
      setStep('verify')
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const formattedPhone = getCleanPhoneNumber()
      
      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: verificationCode,
        type: 'sms',
      })

      if (error) throw error
      const redirectTo = searchParams.get('redirect') || '/search'
      window.location.href = redirectTo
    } catch (error: any) {
      setError(error.message || 'Invalid verification code')
    } finally {
      setIsLoading(false)
    }
  }
  
  const displayPhoneNumber = `${selectedCountry.dialCode} ${phoneNumber}`

  const handleSelectRole = (role: UserRole) => {
    setUserRole(role)
    setStep('phone')
  }

  const handleBrowseAsGuest = () => {
    router.push('/search')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50 px-4 pb-12">
      <div className="w-full max-w-md">
        {/* Continue exploring link */}
        <button
          onClick={handleBrowseAsGuest}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary-700 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'cs' ? 'Pokračovat v procházení' : 'Continue exploring'}
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/icons/icon-192.png"
            alt="Tool Connect"
            className="w-24 h-24 rounded-2xl mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900">Tool Connect</h1>
          <p className="text-gray-600 mt-2">
            {step === 'role' 
              ? (language === 'cs' ? 'Jak chcete používat Tool Connect?' : 'How would you like to use Tool Connect?')
              : userRole 
                ? roleContent[userRole].subtitle
                : (language === 'cs' ? 'Přihlaste se ke svému účtu' : 'Sign in to your account')
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card p-8">
          {step === 'role' ? (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
                {language === 'cs' ? 'Přihlásit se jako' : 'Sign in as'}
              </h2>

              {/* Sign in as Client */}
              <button
                type="button"
                onClick={() => handleSelectRole('client')}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Search className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">
                    {language === 'cs' ? 'Hledám specialistu' : 'Sign in as Client'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {language === 'cs' ? 'Najděte ověřené profesionály' : 'Find trusted professionals'}
                  </p>
                </div>
              </button>

              {/* Sign in as Service Provider */}
              <button
                type="button"
                onClick={() => handleSelectRole('service-provider')}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-lg">
                    {language === 'cs' ? 'Nabízím služby' : 'Sign in as Service Provider'}
                  </p>
                  <p className="text-white/80 text-sm">
                    {language === 'cs' ? 'Ať vás klienti osloví' : 'Let clients reach you'}
                  </p>
                </div>
              </button>

            </div>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendCode}>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {userRole ? roleContent[userRole].title : t('auth.signIn')}
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('auth.phoneNumber')}
                </label>
                <div className="flex">
                  <CountryCodePicker
                    selectedCountry={selectedCountry}
                    onSelect={setSelectedCountry}
                  />
                  <input
                    type="tel"
                    placeholder="123 456 789"
                    value={phoneNumber}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    maxLength={11}
                    className="flex-1 px-4 py-2.5 bg-white border border-l-0 border-gray-200 rounded-r-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent tracking-wide"
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-sm text-red-600">{error}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full mt-6"
                size="lg"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-5 h-5" />}
              >
                {t('auth.sendCode')}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-6">
                {language === 'cs' 
                  ? 'Zašleme vám SMS s ověřovacím kódem'
                  : "We'll send you an SMS with a verification code"
                }
              </p>

              <button
                type="button"
                onClick={() => {
                  setStep('role')
                  setUserRole(null)
                }}
                className="w-full mt-4 text-center text-sm text-primary-700 hover:text-primary-800"
              >
                {language === 'cs' ? 'Změnit typ účtu' : 'Change account type'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify}>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {language === 'cs' ? 'Zadejte kód' : 'Enter Code'}
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  {language === 'cs' 
                    ? `Kód byl odeslán na`
                    : `Code sent to`
                  }
                </p>
                {/* Phone number + change link — clearly clickable */}
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone')
                    setVerificationCode('')
                    setError('')
                  }}
                  className="inline-flex items-center gap-1.5 mt-1 text-primary-700 hover:text-primary-800 font-semibold"
                >
                  <span>{displayPhoneNumber}</span>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              <Input
                label={t('auth.verificationCode')}
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-2xl tracking-widest"
                error={error}
              />

              <Button 
                type="submit" 
                className="w-full mt-6"
                size="lg"
                isLoading={isLoading}
              >
                {t('auth.verify')}
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep('phone')
                  setVerificationCode('')
                  setError('')
                }}
                className="w-full mt-4 flex items-center justify-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'cs' ? 'Změnit telefonní číslo' : 'Change phone number'}
              </button>
            </form>
          )}
        </div>

        {/* Footer links */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            {language === 'cs' 
              ? 'Pokračováním souhlasíte s našimi'
              : 'By continuing, you agree to our'
            }
            {' '}
            <a href="/terms-conditions.html" className="text-primary-700 hover:underline">
              {language === 'cs' ? 'podmínkami' : 'Terms'}
            </a>
            {' '}&{' '}
            <a href="/privacy-policy.html" className="text-primary-700 hover:underline">
              {language === 'cs' ? 'zásadami ochrany osobních údajů' : 'Privacy Policy'}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}

