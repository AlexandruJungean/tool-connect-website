'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Camera, Briefcase, MapPin, Languages, DollarSign } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, TextArea, Select, LoadingSpinner } from '@/components/ui'
import { ImageUpload, LocationInput } from '@/components/forms'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'
import { LANGUAGES } from '@/constants/categories'
import { useCategories } from '@/contexts/CategoriesContext'
import { ACCOUNT_TYPES, CURRENCIES } from '@/constants/optionSets'

const STEPS = ['basics', 'category', 'details', 'pricing'] as const
type Step = typeof STEPS[number]

export default function ProviderProfileSetupPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, refreshProfile } = useAuth()
  const { categories, getCategoryLabel, getSubcategoryLabel } = useCategories()

  const [currentStep, setCurrentStep] = useState<Step>('basics')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [subcategories, setSubcategories] = useState<string[]>([])
  // Specialty field removed - using category instead
  const [aboutMe, setAboutMe] = useState('')
  const [availability, setAvailability] = useState('')
  const [location, setLocation] = useState('')
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['english'])
  const [accountType, setAccountType] = useState('self-employed')
  const [hourlyRateMin, setHourlyRateMin] = useState('')
  const [hourlyRateMax, setHourlyRateMax] = useState('')
  // Currency is now fixed to CZK
  const currency = 'CZK'

  const t = {
    title: language === 'cs' ? 'Vytvořit profil poskytovatele' : 'Create Provider Profile',
    step1: language === 'cs' ? 'Základní informace' : 'Basic Info',
    step2: language === 'cs' ? 'Kategorie' : 'Category',
    step3: language === 'cs' ? 'Podrobnosti' : 'Details',
    step4: language === 'cs' ? 'Ceník' : 'Pricing',
    name: language === 'cs' ? 'Jméno' : 'First Name',
    surname: language === 'cs' ? 'Příjmení' : 'Last Name',
    avatar: language === 'cs' ? 'Profilová fotka' : 'Profile Photo',
    background: language === 'cs' ? 'Úvodní obrázek' : 'Cover Image',
    category: language === 'cs' ? 'Kategorie' : 'Category',
    subcategories: language === 'cs' ? 'Služby' : 'Services',
    // Specialty field removed
    aboutMe: language === 'cs' ? 'O mně' : 'About Me',
    aboutMePlaceholder: language === 'cs' 
      ? 'Popište své zkušenosti, dovednosti a co vás odlišuje...'
      : 'Describe your experience, skills, and what makes you stand out...',
    availability: language === 'cs' ? 'Dostupnost' : 'Availability',
    availabilityHint: language === 'cs' 
      ? 'Dejte klientům vědět, kdy jste k dispozici'
      : 'Let clients know when you are available',
    availabilityPlaceholder: language === 'cs'
      ? 'např. Jsem k dispozici pouze mezi 17:00 a 19:00'
      : 'e.g. I am available only in between 5 and 7 PM',
    location: language === 'cs' ? 'Lokalita' : 'Location',
    languages: language === 'cs' ? 'Jazyky' : 'Languages',
    accountType: language === 'cs' ? 'Typ účtu' : 'Account Type',
    hourlyRate: language === 'cs' ? 'Hodinová sazba' : 'Hourly Rate',
    min: language === 'cs' ? 'Od' : 'From',
    max: language === 'cs' ? 'Do' : 'To',
    currency: language === 'cs' ? 'Měna' : 'Currency',
    next: language === 'cs' ? 'Další' : 'Next',
    back: language === 'cs' ? 'Zpět' : 'Back',
    finish: language === 'cs' ? 'Dokončit' : 'Finish',
    selectCategory: language === 'cs' ? 'Vyberte kategorii' : 'Select category',
    requiredFields: language === 'cs' ? 'Vyplňte všechna povinná pole' : 'Please fill in all required fields',
  }

  const stepIndex = STEPS.indexOf(currentStep)

  const categoryOptions = categories.map((cat) => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, language as 'en' | 'cs'),
  }))

  const selectedCategoryData = categories.find((c) => c.value === category)
  const subcategoryOptions = selectedCategoryData?.subcategories || []

  const toggleSubcategory = (value: string) => {
    setSubcategories((prev) =>
      prev.includes(value)
        ? prev.filter((s) => s !== value)
        : [...prev, value]
    )
  }

  const toggleLanguage = (value: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(value)
        ? prev.filter((l) => l !== value)
        : [...prev, value]
    )
  }

  const validateStep = (): boolean => {
    setError(null)
    switch (currentStep) {
      case 'basics':
        if (!name.trim() || !surname.trim()) {
          setError(t.requiredFields)
          return false
        }
        break
      case 'category':
        if (!category) {
          setError(language === 'cs' ? 'Vyberte kategorii' : 'Please select a category')
          return false
        }
        break
      case 'details':
        if (!location.trim()) {
          setError(language === 'cs' ? 'Zadejte lokalitu' : 'Please enter your location')
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    const nextIndex = stepIndex + 1
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = stepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex])
    }
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    if (!user) {
      setError(language === 'cs' ? 'Přihlaste se prosím' : 'Please log in')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: insertError } = await supabase
        .from('service_provider_profiles')
        .insert({
          user_id: user.id,
          name: name.trim(),
          surname: surname.trim(),
          avatar_url: avatarUrl,
          background_image_url: backgroundUrl,
          category,
          services: subcategories.join(','),
          // specialty removed - using category instead
          about_me: aboutMe.trim(),
          availability: availability.trim() || null,
          location: location.trim(),
          languages: selectedLanguages,
          account_type: accountType,
          hourly_rate_min: hourlyRateMin ? parseFloat(hourlyRateMin) : null,
          hourly_rate_max: hourlyRateMax ? parseFloat(hourlyRateMax) : null,
          currency,
          profile_completed: true,
        })

      if (insertError) throw insertError

      await refreshProfile()
      router.push('/profile')
    } catch (err) {
      console.error('Failed to create profile:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se vytvořit profil. Zkuste to prosím znovu.'
        : 'Failed to create profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={t.name}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label={t.surname}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
              />
            </div>
            <ImageUpload
              label={t.avatar}
              value={avatarUrl}
              onChange={setAvatarUrl}
              bucket="avatars"
              aspectRatio="square"
            />
            <ImageUpload
              label={t.background}
              value={backgroundUrl}
              onChange={setBackgroundUrl}
              bucket="backgrounds"
              aspectRatio="cover"
            />
          </div>
        )

      case 'category':
        return (
          <div className="space-y-6">
            <Select
              label={t.category}
              value={category}
              onChange={(value) => {
                setCategory(value)
                setSubcategories([])
              }}
              options={[
                { value: '', label: t.selectCategory },
                ...categoryOptions,
              ]}
              required
            />

            {subcategoryOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.subcategories}
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategoryOptions.map((sub) => (
                    <button
                      key={sub.value}
                      type="button"
                      onClick={() => toggleSubcategory(sub.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        subcategories.includes(sub.value)
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {getSubcategoryLabel(category, sub.value, language as 'en' | 'cs')}
                      {subcategories.includes(sub.value) && (
                        <Check className="w-4 h-4 inline-block ml-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specialty field removed - category is used instead */}
          </div>
        )

      case 'details':
        return (
          <div className="space-y-6">
            <TextArea
              label={t.aboutMe}
              value={aboutMe}
              onChange={(e) => setAboutMe(e.target.value)}
              placeholder={t.aboutMePlaceholder}
              rows={5}
            />

            {/* Availability Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t.availability}
              </label>
              <p className="text-xs text-gray-500 mb-2">{t.availabilityHint}</p>
              <textarea
                value={availability}
                onChange={(e) => setAvailability(e.target.value.slice(0, 200))}
                placeholder={t.availabilityPlaceholder}
                rows={3}
                maxLength={200}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 text-right mt-1">{availability.length}/200</p>
            </div>

            <LocationInput
              label={t.location}
              value={location}
              onChange={setLocation}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.languages}
              </label>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.slice(0, 10).map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => toggleLanguage(lang.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLanguages.includes(lang.value)
                        ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {language === 'cs' ? lang.labelCS : lang.label}
                  </button>
                ))}
              </div>
            </div>

            <Select
              label={t.accountType}
              value={accountType}
              onChange={(value) => setAccountType(value)}
              options={ACCOUNT_TYPES.map((type) => ({
                value: type.value,
                label: language === 'cs' ? type.labelCS : type.label,
              }))}
            />
          </div>
        )

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label={`${t.hourlyRate} (${t.min})`}
                type="number"
                value={hourlyRateMin}
                onChange={(e) => setHourlyRateMin(e.target.value)}
                placeholder="0"
              />
              <Input
                label={`${t.hourlyRate} (${t.max})`}
                type="number"
                value={hourlyRateMax}
                onChange={(e) => setHourlyRateMax(e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.currency}
              </label>
              <div className="px-4 py-2 border border-gray-300 rounded-xl text-gray-600">
                Kč CZK
              </div>
            </div>
          </div>
        )
    }
  }

  const stepLabels = [t.step1, t.step2, t.step3, t.step4]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">{t.title}</h1>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index <= stepIndex
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < stepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-full h-1 mx-2 ${
                      index < stepIndex ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                    style={{ width: '60px' }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            {stepLabels.map((label, i) => (
              <span key={i} className={i === stepIndex ? 'text-primary-600 font-medium' : ''}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {error && (
          <AlertCard variant="error" message={error} onDismiss={() => setError(null)} className="mb-6" />
        )}

        {renderStep()}

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {stepIndex > 0 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.back}
            </Button>
          )}
          {stepIndex < STEPS.length - 1 ? (
            <Button onClick={handleNext} className="flex-1">
              {t.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <LoadingSpinner size="sm" /> : t.finish}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

