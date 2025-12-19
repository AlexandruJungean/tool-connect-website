'use client'

import React from 'react'
import Link from 'next/link'
import { ServiceProviderProfile } from '@/types/database'
import { useLanguage } from '@/contexts/LanguageContext'
import { getCategoryLabel, getSubcategoryLabel } from '@/constants/categories'
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation'
import { Star, MapPin, Building2, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProviderCardProps {
  provider: ServiceProviderProfile
  className?: string
}

export function ProviderCard({ provider, className }: ProviderCardProps) {
  const { language, t } = useLanguage()
  // Specialty removed - using category instead
  
  const rating = provider.average_rating ? Math.round(provider.average_rating * 10) / 10 : null
  const reviewCount = provider.total_reviews || 0
  const location = provider.city && provider.country 
    ? `${provider.city}, ${provider.country}`
    : provider.city || provider.country || provider.location
  
  const categoryLabel = provider.category 
    ? getCategoryLabel(provider.category, language)
    : null
  
  const services = provider.services?.slice(0, 3).map(service => 
    provider.category ? getSubcategoryLabel(provider.category, service, language) : service
  )

  return (
    <Link href={`/providers/${provider.id}`} prefetch={false}>
      <article 
        className={cn(
          "bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-card",
          "hover:shadow-elevated hover:border-primary-200 hover:-translate-y-1",
          "transition-all duration-300 cursor-pointer",
          className
        )}
      >
        {/* Background/Header Image */}
        <div className="relative h-32 bg-gradient-to-br from-primary-100 to-primary-50">
          {provider.background_image_url && (
            <img
              src={provider.background_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          {/* Type Badge */}
          <div className="absolute top-3 right-3">
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium",
              provider.type === 'company' 
                ? "bg-blue-100 text-blue-700" 
                : "bg-green-100 text-green-700"
            )}>
              {provider.type === 'company' ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
              {provider.type === 'company' ? t('search.company') : t('search.selfEmployed')}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative px-4 pb-4">
          {/* Avatar */}
          <div className="absolute -top-10 left-4">
            <div className="w-20 h-20 rounded-xl border-4 border-white shadow-md overflow-hidden bg-white">
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-700">
                    {provider.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="pt-12">
            <h3 className="font-semibold text-lg text-gray-900 truncate">
              {provider.name} {provider.surname}
            </h3>
            
            {categoryLabel && (
              <p className="text-sm text-primary-700 font-medium truncate mt-0.5">
                {categoryLabel}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              {rating !== null ? (
                <>
                  <div className="flex items-center gap-1 text-primary-600">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-semibold text-gray-900">{rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} {t('provider.reviews')})
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-400">{t('provider.noRating')}</span>
              )}
            </div>

            {/* Location */}
            {location && (
              <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}

            {/* Category & Services */}
            {(categoryLabel || services?.length) && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                {categoryLabel && (
                  <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-md">
                    {categoryLabel}
                  </span>
                )}
                {services && services.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {services.map((service, index) => (
                      <span 
                        key={index}
                        className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {service}
                      </span>
                    ))}
                    {provider.services && provider.services.length > 3 && (
                      <span className="text-xs text-gray-400">
                        +{provider.services.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Price */}
            {(provider.hourly_rate_min || provider.hourly_rate_max) && (
              <div className="mt-3 text-sm">
                <span className="font-semibold text-primary-700">
                  {provider.hourly_rate_min && provider.hourly_rate_max
                    ? `${provider.hourly_rate_min} - ${provider.hourly_rate_max}`
                    : provider.hourly_rate_min || provider.hourly_rate_max}
                  {' CZK'}
                </span>
                <span className="text-gray-500"> / {t('provider.perHour')}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}

