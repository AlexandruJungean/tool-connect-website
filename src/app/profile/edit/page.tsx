'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { LANGUAGES, getLanguageLabel } from '@/constants/categories'
import { useCategories } from '@/contexts/CategoriesContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LocationInput, ImageUpload, VideoUpload } from '@/components/forms'
import { ArrowLeft, Save, Loader2, Camera, X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EditProfilePage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { 
    isAuthenticated, 
    clientProfile, 
    serviceProviderProfile, 
    currentUserType,
    refreshProfiles
  } = useAuth()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Form fields
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [location, setLocation] = useState('')
  // Specialty field removed - using category instead
  const [category, setCategory] = useState('')
  const [aboutMe, setAboutMe] = useState('')
  const [availability, setAvailability] = useState('')
  const [priceMin, setPriceMin] = useState('')
  // Currency is now fixed to CZK
  const currency = 'CZK'
  const [pricePeriod, setPricePeriod] = useState<'hour' | 'day' | 'week' | 'month'>('hour')
  const [priceInfo, setPriceInfo] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([])
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  
  // Media fields
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [profileVideoUrl, setProfileVideoUrl] = useState<string | null>(null)
  const [workPhotoUrls, setWorkPhotoUrls] = useState<string[]>([])

  const { categories, getCategoryLabel } = useCategories()
  const isProvider = currentUserType === 'service_provider'
  const profile = isProvider ? serviceProviderProfile : clientProfile

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Load current profile data
    if (profile) {
      setName(profile.name || '')
      setSurname((profile as any).surname || '')
      
      if (isProvider && serviceProviderProfile) {
        setLocation(serviceProviderProfile.location || '')
        // Specialty field removed
        setCategory(serviceProviderProfile.category || '')
        setAboutMe(serviceProviderProfile.about_me || serviceProviderProfile.bio || '')
        setAvailability((serviceProviderProfile as any).availability || '')
        setPriceMin(serviceProviderProfile.hourly_rate_min?.toString() || '')
        // Currency is fixed to CZK
        const dbPeriod = serviceProviderProfile.price_period as string | null | undefined
        setPricePeriod(
          dbPeriod === 'hour' || dbPeriod === 'day' || dbPeriod === 'week' || dbPeriod === 'month'
            ? dbPeriod : 'hour'
        )
        setPriceInfo(serviceProviderProfile.price_info || '')
        setSelectedLanguages(serviceProviderProfile.languages || [])
        setSelectedServices(serviceProviderProfile.services || [])
        // Media
        setAvatarUrl(serviceProviderProfile.avatar_url || null)
        setBackgroundUrl(serviceProviderProfile.background_image_url || null)
        setProfileVideoUrl(serviceProviderProfile.profile_video_url || null)
        setWorkPhotoUrls(serviceProviderProfile.additional_images || [])
      } else if (clientProfile) {
        setLocation(clientProfile.location || '')
        setSelectedLanguages(clientProfile.languages || [])
        setAvatarUrl(clientProfile.avatar_url || null)
      }
    }
  }, [isAuthenticated, profile, isProvider])

  const selectedCategory = categories.find(cat => cat.value === category)
  const subcategories = selectedCategory?.subcategories || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      if (isProvider && serviceProviderProfile) {
        const { error: updateError } = await supabase
          .from('service_provider_profiles')
          .update({
            name,
            surname,
            location,
            // specialty removed - using category instead
            category,
            about_me: aboutMe,
            availability: availability.trim() || null,
            hourly_rate_min: priceMin ? parseFloat(priceMin) : null,
            price_currency: currency,
            price_period: pricePeriod,
            price_info: priceInfo || null,
            languages: selectedLanguages,
            services: selectedServices,
            avatar_url: avatarUrl,
            background_image_url: backgroundUrl,
            profile_video_url: profileVideoUrl,
            additional_images: workPhotoUrls.length > 0 ? workPhotoUrls : null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', serviceProviderProfile.id)

        if (updateError) throw updateError
      } else if (clientProfile) {
        const { error: updateError } = await supabase
          .from('client_profiles')
          .update({
            name,
            surname,
            location,
            languages: selectedLanguages,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', clientProfile.id)

        if (updateError) throw updateError
      }

      await refreshProfiles()
      setSuccess(language === 'cs' ? 'Profil byl úspěšně aktualizován!' : 'Profile updated successfully!')
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const MAX_LANGUAGES = 5
  const MAX_SERVICES = 5

  const toggleLanguage = (lang: string) => {
    if (selectedLanguages.includes(lang)) {
      setSelectedLanguages(selectedLanguages.filter(l => l !== lang))
    } else if (selectedLanguages.length < MAX_LANGUAGES) {
      setSelectedLanguages([...selectedLanguages, lang])
    }
  }

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service))
    } else if (selectedServices.length < MAX_SERVICES) {
      setSelectedServices([...selectedServices, service])
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const categoryOptions = categories.map(cat => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, language)
  }))

  // Currency is fixed to CZK, no options needed

  const periodOptions = [
    { value: 'hour', label: language === 'cs' ? 'Hodina' : 'Hour' },
    { value: 'day', label: language === 'cs' ? 'Den' : 'Day' },
    { value: 'week', label: language === 'cs' ? 'Týden' : 'Week' },
    { value: 'month', label: language === 'cs' ? 'Měsíc' : 'Month' },
  ]

  return (
    <div className="min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        <div className="bg-white rounded-2xl shadow-card p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            {t('profile.editProfile')}
          </h1>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Photo & Background - Side by side */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Profile Photo - Smaller */}
              <div className="w-32 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'cs' ? 'Profilová fotka' : 'Profile Photo'}
                </label>
                <ImageUpload
                  value={avatarUrl}
                  onChange={setAvatarUrl}
                  bucket="avatars"
                  folder={serviceProviderProfile?.id || clientProfile?.id}
                  aspectRatio="square"
                  maxSizeMB={5}
                />
              </div>

              {/* Background Photo - Provider only */}
              {isProvider && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Úvodní fotka' : 'Cover Photo'}
                  </label>
                  <ImageUpload
                    value={backgroundUrl}
                    onChange={setBackgroundUrl}
                    bucket="backgrounds"
                    folder={serviceProviderProfile?.id}
                    aspectRatio="video"
                    maxSizeMB={10}
                  />
                </div>
              )}
            </div>

            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label={language === 'cs' ? 'Jméno *' : 'First Name *'}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={language === 'cs' ? 'Příjmení' : 'Last Name'}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>

            {/* Location */}
            <LocationInput
              label={t('search.location')}
              value={location}
              onChange={(value) => setLocation(value)}
              placeholder={language === 'cs' ? 'Město, Země' : 'City, Country'}
            />

            {/* Provider-specific fields */}
            {isProvider && (
              <>
                {/* Specialty field removed - category is used instead */}

                <Select
                  label={t('search.category')}
                  options={categoryOptions}
                  value={category}
                  onChange={(val) => {
                    setCategory(val)
                    setSelectedServices([])
                  }}
                  placeholder={language === 'cs' ? 'Vyberte kategorii' : 'Select a category'}
                />

                {category && subcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('provider.services')}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      {selectedServices.length}/{MAX_SERVICES} {language === 'cs' ? 'vybráno' : 'selected'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {subcategories.map((sub) => {
                        const isSelected = selectedServices.includes(sub.value)
                        const isDisabled = !isSelected && selectedServices.length >= MAX_SERVICES
                        return (
                          <button
                            key={sub.value}
                            type="button"
                            onClick={() => toggleService(sub.value)}
                            disabled={isDisabled}
                            className={cn(
                              "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                              isSelected
                                ? "bg-primary-700 text-white border-primary-700"
                                : isDisabled
                                  ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                  : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                            )}
                          >
                            {language === 'cs' ? sub.labelCS : sub.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {t('provider.about')}
                  </label>
                  <textarea
                    value={aboutMe}
                    onChange={(e) => setAboutMe(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    placeholder={language === 'cs' ? 'Řekněte něco o sobě a svých službách...' : 'Tell us about yourself and your services...'}
                  />
                </div>

                {/* Availability Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'cs' ? 'Dostupnost' : 'Availability'}
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    {language === 'cs' 
                      ? 'Dejte klientům vědět, kdy jste k dispozici'
                      : 'Let clients know when you are available'}
                  </p>
                  <textarea
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value.slice(0, 200))}
                    placeholder={language === 'cs'
                      ? 'např. Jsem k dispozici pouze mezi 17:00 a 19:00'
                      : 'e.g. I am available only in between 5 and 7 PM'}
                    rows={3}
                    maxLength={200}
                    className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-500 text-right mt-1">{availability.length}/200</p>
                </div>

                {/* Pricing */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('provider.pricing')}
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <Input
                      label={language === 'cs' ? 'Cena' : 'Price'}
                      placeholder="0"
                      type="text"
                      inputMode="numeric"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value.replace(/\D/g, ''))}
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {language === 'cs' ? 'Měna' : 'Currency'}
                      </label>
                      <div className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600">
                        CZK (Kč)
                      </div>
                    </div>
                    <Select
                      label={language === 'cs' ? 'Za' : 'Per'}
                      options={periodOptions}
                      value={pricePeriod}
                      onChange={(val) => setPricePeriod(val as 'hour' | 'day' | 'week' | 'month')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {language === 'cs' ? 'Dodatečné informace o ceně' : 'Additional price info'}
                    </label>
                    <textarea
                      value={priceInfo}
                      onChange={(e) => setPriceInfo(e.target.value)}
                      rows={2}
                      maxLength={100}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      placeholder={language === 'cs' ? 'např. Cena závisí na složitosti projektu...' : 'e.g. Price depends on project complexity...'}
                    />
                    <p className="text-xs text-gray-500 text-right mt-1">{priceInfo.length}/100</p>
                  </div>
                </div>
              </>
            )}

            {/* Languages */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('search.languages')}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {selectedLanguages.length}/{MAX_LANGUAGES} {language === 'cs' ? 'vybráno' : 'selected'}
              </p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguages.includes(lang.value)
                  const isDisabled = !isSelected && selectedLanguages.length >= MAX_LANGUAGES
                  return (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => toggleLanguage(lang.value)}
                      disabled={isDisabled}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-lg border transition-colors",
                        isSelected
                          ? "bg-primary-700 text-white border-primary-700"
                          : isDisabled
                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300"
                      )}
                    >
                      {getLanguageLabel(lang.value, language)}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Profile Video - Provider only (at bottom) */}
            {isProvider && (
              <>
                <hr className="border-gray-200" />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'cs' ? 'Profilové video' : 'Profile Video'}
                  </label>
                  <VideoUpload
                    value={profileVideoUrl}
                    onChange={setProfileVideoUrl}
                    bucket="videos"
                    folder={serviceProviderProfile?.id}
                    maxSizeMB={50}
                    maxDurationSeconds={90}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'cs' 
                      ? 'Max 90 sekund. Představte se nebo ukažte svou práci!' 
                      : 'Max 90 seconds. Introduce yourself or show your work!'}
                  </p>
                </div>
              </>
            )}

            {/* Work Photos - Provider only (at bottom) */}
            {isProvider && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'cs' ? 'Fotky práce' : 'Work Photos'} ({workPhotoUrls.length}/5)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  {language === 'cs' 
                    ? 'Přidejte až 5 fotek vaší práce' 
                    : 'Add up to 5 photos of your work'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {workPhotoUrls.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <img src={url} alt={`Work ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setWorkPhotoUrls(prev => prev.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  ))}
                  {workPhotoUrls.length < 5 && (
                    <ImageUpload
                      value={null}
                      onChange={(url) => {
                        if (url) setWorkPhotoUrls(prev => [...prev, url])
                      }}
                      bucket="work-photos"
                      folder={serviceProviderProfile?.id}
                      aspectRatio="square"
                      maxSizeMB={5}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isLoading}
                className="flex-1"
                size="lg"
                leftIcon={<Save className="w-5 h-5" />}
              >
                {t('common.save')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                size="lg"
              >
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

