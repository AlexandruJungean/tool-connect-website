'use client'

import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ServiceProviderProfile } from '@/types/database'
import { ProviderCard } from '@/components/cards/ProviderCard'
import { Button, LoadingSpinner, EmptyState } from '@/components/ui'
import { Heart, Search, Building2, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type FilterType = 'all' | 'self_employed' | 'company'

export default function FavoritesPage() {
  const { language, t } = useLanguage()
  const { isAuthenticated, isLoading: authLoading, clientProfile } = useAuth()

  const [favorites, setFavorites] = useState<ServiceProviderProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<FilterType>('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login?redirect=/favorites'
    }
  }, [isAuthenticated, authLoading])

  // Fetch favorites when authenticated
  useEffect(() => {
    if (authLoading || !isAuthenticated || !clientProfile) return

    const fetchFavorites = async () => {
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select(`
            service_provider_id,
            service_provider:service_provider_profiles(*)
          `)
          .eq('client_id', clientProfile.id)

        if (error) throw error

        const providers = data
          ?.map((fav: any) => fav.service_provider)
          .filter((p: any) => p !== null) || []

        setFavorites(providers)
      } catch (error) {
        console.error('Error fetching favorites:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFavorites()
  }, [isAuthenticated, authLoading, clientProfile])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  // Split favorites by type
  const selfEmployedProviders = favorites.filter(p => p.type === 'self-employed' || !p.type)
  const companyProviders = favorites.filter(p => p.type === 'company')

  // Get filtered list based on selected filter
  const getFilteredProviders = () => {
    switch (filter) {
      case 'self_employed':
        return selfEmployedProviders
      case 'company':
        return companyProviders
      default:
        return favorites
    }
  }

  const filteredProviders = getFilteredProviders()

  const filterOptions: { value: FilterType; label: string; icon: typeof User; count: number }[] = [
    { 
      value: 'all', 
      label: language === 'cs' ? 'Všichni' : 'All',
      icon: Heart,
      count: favorites.length
    },
    { 
      value: 'self_employed', 
      label: language === 'cs' ? 'OSVČ' : 'Self-employed',
      icon: User,
      count: selfEmployedProviders.length
    },
    { 
      value: 'company', 
      label: language === 'cs' ? 'Firmy' : 'Companies',
      icon: Building2,
      count: companyProviders.length
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('profile.favorites')}</h1>

        {/* Filter Tabs */}
        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                  filter === option.value
                    ? "bg-primary-700 text-white"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                )}
              >
                <option.icon className="w-4 h-4" />
                {option.label}
                <span className={cn(
                  "px-1.5 py-0.5 rounded-full text-xs",
                  filter === option.value
                    ? "bg-white/20 text-white"
                    : "bg-gray-100 text-gray-600"
                )}>
                  {option.count}
                </span>
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProviders.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          // Has favorites but none match the current filter
          <EmptyState
            icon={filter === 'company' ? Building2 : User}
            title={language === 'cs' 
              ? `Žádní ${filter === 'company' ? 'firemní' : 'OSVČ'} poskytovatelé`
              : `No ${filter === 'company' ? 'company' : 'self-employed'} providers`
            }
            description={language === 'cs' 
              ? 'Zkuste změnit filtr nebo přidejte více poskytovatelů do oblíbených'
              : 'Try changing the filter or add more providers to your favorites'
            }
            action={
              <Button variant="secondary" onClick={() => setFilter('all')}>
                {language === 'cs' ? 'Zobrazit všechny' : 'Show All'}
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={Heart}
            title={language === 'cs' ? 'Žádní oblíbení poskytovatelé' : 'No favorite providers yet'}
            description={language === 'cs' 
              ? 'Začněte přidáváním poskytovatelů do oblíbených'
              : 'Start adding providers to your favorites'
            }
            action={
              <Link href="/search" prefetch={false}>
                <Button leftIcon={<Search className="w-5 h-5" />}>
                  {t('nav.search')}
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}

