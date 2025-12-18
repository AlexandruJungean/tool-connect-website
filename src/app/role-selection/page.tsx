'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { User, Briefcase, ArrowRight } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui'

export default function RoleSelectionPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { clientProfile, serviceProviderProfile, currentUserType, switchUserType } = useAuth()

  const t = {
    title: language === 'cs' ? 'Vyberte svůj profil' : 'Select Your Profile',
    subtitle: language === 'cs' 
      ? 'Jak chcete dnes používat Tool Connect?'
      : 'How would you like to use Tool Connect today?',
    client: language === 'cs' ? 'Klient' : 'Client',
    clientDesc: language === 'cs' 
      ? 'Hledám poskytovatele služeb pro svůj projekt'
      : 'I\'m looking for service providers for my project',
    provider: language === 'cs' ? 'Poskytovatel služeb' : 'Service Provider',
    providerDesc: language === 'cs' 
      ? 'Nabízím své služby a hledám nové zakázky'
      : 'I offer my services and looking for new jobs',
    createClient: language === 'cs' ? 'Vytvořit klientský profil' : 'Create Client Profile',
    createProvider: language === 'cs' ? 'Stát se poskytovatelem' : 'Become a Provider',
    current: language === 'cs' ? 'Aktuální' : 'Current',
  }

  const handleSelectClient = () => {
    if (clientProfile) {
      switchUserType('client')
      router.push('/search')
    } else {
      router.push('/profile/setup/client')
    }
  }

  const handleSelectProvider = () => {
    if (serviceProviderProfile) {
      switchUserType('service_provider')
      router.push('/profile')
    } else {
      router.push('/profile/setup/provider')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-gray-600">{t.subtitle}</p>
        </div>

        {/* Role Cards */}
        <div className="w-full max-w-md space-y-4">
          {/* Client Option */}
          <button
            onClick={handleSelectClient}
            className="w-full bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left border-2 border-transparent hover:border-primary-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-7 h-7 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">{t.client}</h2>
                  {currentUserType === 'client' && clientProfile && (
                    <Badge variant="primary" size="sm">{t.current}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{t.clientDesc}</p>
                {!clientProfile && (
                  <span className="text-sm text-primary-600 font-medium">
                    {t.createClient}
                  </span>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors mt-1" />
            </div>
          </button>

          {/* Provider Option */}
          <button
            onClick={handleSelectProvider}
            className="w-full bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all text-left border-2 border-transparent hover:border-primary-200 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Briefcase className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-semibold text-gray-900">{t.provider}</h2>
                  {currentUserType === 'service_provider' && serviceProviderProfile && (
                    <Badge variant="primary" size="sm">{t.current}</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-2">{t.providerDesc}</p>
                {!serviceProviderProfile && (
                  <span className="text-sm text-primary-600 font-medium">
                    {t.createProvider}
                  </span>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors mt-1" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

