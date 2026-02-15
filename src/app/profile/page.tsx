'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { useCategories } from '@/contexts/CategoriesContext'
import { Button } from '@/components/ui/Button'
import { 
  User, 
  Settings, 
  Star, 
  Edit, 
  MapPin,
  Phone,
  Globe,
  Building2,
  ArrowRight,
  LogOut,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ProfilePage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { getCategoryLabel } = useCategories()
  const { 
    isAuthenticated,
    isLoading,
    user, 
    clientProfile, 
    serviceProviderProfile, 
    currentUserType, 
    setCurrentUserType,
    signOut 
  } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login?redirect=/profile'
    }
  }, [isAuthenticated, isLoading])

  // Redirect users to their full profile view
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (currentUserType === 'service_provider' && serviceProviderProfile?.id) {
        router.replace(`/providers/${serviceProviderProfile.id}`)
      } else if (currentUserType === 'client' && clientProfile?.id) {
        router.replace(`/clients/${clientProfile.id}`)
      }
    }
  }, [isLoading, isAuthenticated, currentUserType, serviceProviderProfile, clientProfile, router])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const isProvider = currentUserType === 'service_provider'
  const profile = isProvider ? serviceProviderProfile : clientProfile
  const hasOtherProfile = isProvider ? !!clientProfile : !!serviceProviderProfile

  const handleSwitchProfile = () => {
    if (isProvider && clientProfile) {
      setCurrentUserType('client')
    } else if (!isProvider && serviceProviderProfile) {
      setCurrentUserType('service_provider')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.name || 'Profile'}
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-primary-700" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-900">
                {profile?.name} {(profile as any)?.surname}
              </h1>
              <p className="text-primary-700 font-medium">
                {isProvider 
                  ? (serviceProviderProfile?.category ? getCategoryLabel(serviceProviderProfile.category, language) : t('search.selfEmployed'))
                  : (language === 'cs' ? 'Klient' : 'Client')
                }
              </p>
              {isProvider && serviceProviderProfile?.category && (
                <span className="inline-block mt-2 px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-md">
                  {getCategoryLabel(serviceProviderProfile.category, language)}
                </span>
              )}
            </div>
            <Link href="/profile/edit" prefetch={false}>
              <Button variant="outline" size="sm" leftIcon={<Edit className="w-4 h-4" />}>
                {t('profile.editProfile')}
              </Button>
            </Link>
          </div>

          {/* Stats for Provider */}
          {isProvider && serviceProviderProfile && (
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-primary-600">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="text-xl font-bold text-gray-900">
                    {serviceProviderProfile.average_rating 
                      ? Math.round(serviceProviderProfile.average_rating * 10) / 10 
                      : '-'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{t('provider.rating')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {serviceProviderProfile.total_reviews || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">{t('provider.reviews')}</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-gray-900">
                  {serviceProviderProfile.profile_views_count || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'cs' ? 'Zobrazení' : 'Views'}
                </p>
              </div>
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
            {user?.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{user.phone}</span>
              </div>
            )}
            {(profile as any)?.location && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{(profile as any).location}</span>
              </div>
            )}
            {isProvider && serviceProviderProfile?.type && (
              <div className="flex items-center gap-3 text-gray-600">
                {serviceProviderProfile.type === 'company' 
                  ? <Building2 className="w-5 h-5 text-gray-400" />
                  : <User className="w-5 h-5 text-gray-400" />
                }
                <span>
                  {serviceProviderProfile.type === 'company' 
                    ? t('search.company') 
                    : t('search.selfEmployed')
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-2xl shadow-card divide-y divide-gray-100">
          <Link href="/settings" prefetch={false} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-gray-600" />
              </div>
              <span className="font-medium text-gray-900">{t('nav.settings')}</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>

          {hasOtherProfile && (
            <button 
              onClick={handleSwitchProfile}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary-700" />
                </div>
                <span className="font-medium text-gray-900">
                  {isProvider ? t('profile.switchToClient') : t('profile.switchToProvider')}
                </span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </button>
          )}

          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <span className="font-medium text-red-600">{t('nav.signOut')}</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}

