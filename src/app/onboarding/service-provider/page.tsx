'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LocationInput, ImageUpload, VideoUpload } from '@/components/forms'
import { LANGUAGES } from '@/constants/categories'
import { useCategories } from '@/contexts/CategoriesContext'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MapPin, 
  Camera,
  User,
  Building2,
  Briefcase,
  Languages,
  FileText,
  DollarSign,
  Mail,
  CheckCircle,
  Rocket,
  Image as ImageIcon,
  Video,
  Plus,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ServiceProviderProfileSetupPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { categories } = useCategories()
  const { 
    user,
    isAuthenticated, 
    isLoading: authLoading, 
    serviceProviderProfile,
    clientProfile,
    refreshProfiles,
    clearPendingProfileType,
    updateServiceProviderProfileLocal,
    switchUserType
  } = useAuth()
  
  // Check if this is the first profile setup (no other profile exists)
  // Email step should only appear for the first setup
  const isFirstSetup = !clientProfile
  
  // Total steps: 12 if first setup (with email step), 11 otherwise
  // Steps: Type, Name, Email?, IČO, Location, Categories, Languages, About, Pricing, Photos, WorkPhotos, Complete
  const TOTAL_STEPS = isFirstSetup ? 12 : 11
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form state
  const [accountType, setAccountType] = useState<'company' | 'self-employed' | null>(null)
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [ico, setIco] = useState('')
  const [location, setLocation] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [speaksCzech, setSpeaksCzech] = useState(false)
  const [speaksEnglish, setSpeaksEnglish] = useState(false)
  const [otherLanguages, setOtherLanguages] = useState<string[]>([])
  const [aboutMe, setAboutMe] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  // Currency is now fixed to CZK
  const priceCurrency = 'CZK'
  const [pricePeriod, setPricePeriod] = useState<'hour' | 'day' | 'project'>('hour')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  // New media state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [profileVideoUrl, setProfileVideoUrl] = useState<string | null>(null)
  const [workPhotoUrls, setWorkPhotoUrls] = useState<string[]>([])

  // Translations
  const t = {
    step1: {
      title: language === 'cs' ? 'Jste firma nebo živnostník?' : 'Are you a company or self-employed?',
      company: language === 'cs' ? 'Firma' : 'Company',
      selfEmployed: language === 'cs' ? 'Živnostník' : 'Self-employed',
    },
    step2: {
      titleCompany: language === 'cs' ? 'Jak se jmenuje vaše firma?' : 'What\'s your company name?',
      titleSelfEmployed: language === 'cs' ? 'Jak vám říkají?' : 'What\'s your name?',
      companyPlaceholder: language === 'cs' ? 'Název firmy' : 'Company name',
      namePlaceholder: language === 'cs' ? 'Jméno' : 'First name',
      surnamePlaceholder: language === 'cs' ? 'Příjmení' : 'Last name',
    },
    stepEmail: {
      title: language === 'cs' ? 'Jaký je váš e-mail?' : 'What\'s your email address?',
      placeholder: language === 'cs' ? 'E-mailová adresa' : 'Email address',
      note: language === 'cs' ? 'Budeme vás kontaktovat ohledně důležitých aktualizací.' : 'We\'ll contact you about important updates.',
    },
    step3: {
      title: language === 'cs' ? 'Zadejte své IČO (volitelné)' : 'Enter your IČO (optional)',
      placeholder: 'IČO',
      note: language === 'cs' ? 'Pomáhá klientům ověřit vaši firmu.' : 'IČO is a Czech business identification number. Helps clients verify your business.',
    },
    step4: {
      title: language === 'cs' ? 'Kde působíte?' : 'Where do you operate?',
      placeholder: language === 'cs' ? 'Město nebo oblast' : 'City or area',
    },
    step5: {
      title: language === 'cs' ? 'V čem se specializujete?' : 'What do you specialize in?',
      subtitle: language === 'cs' ? 'Vyberte kategorii a až 5 podkategorií' : 'Select a category and up to 5 subcategories',
    },
    step6: {
      title: language === 'cs' ? 'Jakými jazyky mluvíte?' : 'What languages do you speak?',
      czech: language === 'cs' ? 'Čeština' : 'Czech',
      english: language === 'cs' ? 'Angličtina' : 'English',
      otherLanguages: language === 'cs' ? 'Další jazyky' : 'Other Languages',
      selectOther: language === 'cs' ? 'Vyberte další jazyky...' : 'Select other languages...',
      maxLanguages: language === 'cs' ? 'Maximálně 5 jazyků celkem' : 'Maximum 5 languages total',
    },
    step7: {
      title: language === 'cs' ? 'Řekněte něco o sobě' : 'Tell us about yourself',
      placeholder: language === 'cs' ? 'Popište své zkušenosti, dovednosti a co vás odlišuje od ostatních...' : 'Describe your experience, skills, and what makes you stand out...',
    },
    step8: {
      title: language === 'cs' ? 'Jaké jsou vaše ceny?' : 'What are your rates?',
      startingFrom: language === 'cs' ? 'Cena od' : 'Starting from',
      perHour: language === 'cs' ? 'Za hodinu' : 'Per hour',
      perDay: language === 'cs' ? 'Za den' : 'Per day',
      perProject: language === 'cs' ? 'Za projekt' : 'Per project',
    },
    step9: {
      title: language === 'cs' ? 'Přidejte své fotky' : 'Add your photos',
      subtitle: language === 'cs' ? 'Kvalitní fotky zvyšují důvěryhodnost profilu.' : 'Quality photos increase profile trust.',
      profilePhoto: language === 'cs' ? 'Profilová fotka' : 'Profile photo',
      backgroundPhoto: language === 'cs' ? 'Úvodní fotka' : 'Background photo',
    },
    step10: {
      title: language === 'cs' ? 'Ukažte svou práci' : 'Showcase your work',
      subtitle: language === 'cs' ? 'Přidejte video a fotky své práce.' : 'Add a video and photos of your work.',
      profileVideo: language === 'cs' ? 'Profilové video' : 'Profile video',
      videoHint: language === 'cs' ? 'Max 90 sekund. Představte se nebo ukažte svou práci!' : 'Max 90 seconds. Introduce yourself or show your work!',
      workPhotos: language === 'cs' ? 'Fotky práce' : 'Work photos',
      addPhoto: language === 'cs' ? 'Přidat fotku' : 'Add photo',
    },
    step11: {
      title: language === 'cs' ? 'Gratulujeme!' : 'Congratulations!',
      subtitle: language === 'cs' ? 'Váš profil poskytovatele služeb byl vytvořen.' : 'Your service provider profile has been created.',
      save: language === 'cs' ? 'Zobrazit můj profil' : 'View my profile',
    },
    common: {
      back: language === 'cs' ? 'Zpět' : 'Back',
      next: language === 'cs' ? 'Další' : 'Next',
      skip: language === 'cs' ? 'Přeskočit' : 'Skip',
      saving: language === 'cs' ? 'Ukládám...' : 'Saving...',
    },
  }

  // Redirect if not authenticated or already has completed service provider profile
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Redirect if user already has a completed service provider profile
    if (serviceProviderProfile?.profile_completed === true) {
      router.push(`/providers/${serviceProviderProfile.id}`)
      return
    }
  }, [isAuthenticated, authLoading, serviceProviderProfile, router])

  // Don't render if user already has a completed service provider profile
  const hasCompletedProviderProfile = serviceProviderProfile?.profile_completed === true

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push('/onboarding')
    }
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleCategorySelect = (categoryValue: string) => {
    if (selectedCategory === categoryValue) {
      setSelectedCategory(null)
      setSelectedSubcategories([])
    } else {
      setSelectedCategory(categoryValue)
      setSelectedSubcategories([])
    }
  }

  const handleSubcategoryToggle = (subcategoryValue: string) => {
    setSelectedSubcategories(prev => {
      if (prev.includes(subcategoryValue)) {
        return prev.filter(s => s !== subcategoryValue)
      } else if (prev.length < 5) {
        return [...prev, subcategoryValue]
      }
      return prev
    })
  }

  const getSelectedCategoryData = () => {
    return categories.find(cat => cat.value === selectedCategory)
  }

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Email validation helper
  const isValidEmail = (emailToCheck: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailToCheck)
  }

  // Helper to get step content based on whether email step is included
  // If isFirstSetup: 1=Type, 2=Name, 3=Email, 4=IČO, 5=Location, 6=Categories, 7=Languages, 8=About, 9=Pricing, 10=Photos, 11=WorkPhotos, 12=Complete
  // Otherwise: 1=Type, 2=Name, 3=IČO, 4=Location, 5=Categories, 6=Languages, 7=About, 8=Pricing, 9=Photos, 10=WorkPhotos, 11=Complete
  const getStepContent = () => {
    if (isFirstSetup) {
      switch (currentStep) {
        case 1: return 'accountType'
        case 2: return 'name'
        case 3: return 'email'
        case 4: return 'ico'
        case 5: return 'location'
        case 6: return 'categories'
        case 7: return 'languages'
        case 8: return 'about'
        case 9: return 'pricing'
        case 10: return 'photos'
        case 11: return 'workPhotos'
        case 12: return 'complete'
        default: return 'accountType'
      }
    } else {
      switch (currentStep) {
        case 1: return 'accountType'
        case 2: return 'name'
        case 3: return 'ico'
        case 4: return 'location'
        case 5: return 'categories'
        case 6: return 'languages'
        case 7: return 'about'
        case 8: return 'pricing'
        case 9: return 'photos'
        case 10: return 'workPhotos'
        case 11: return 'complete'
        default: return 'accountType'
      }
    }
  }

  const stepContent = getStepContent()

  const handleSaveProfile = async () => {
    if (!user) {
      setError(language === 'cs' ? 'Uživatel není přihlášen' : 'User not authenticated')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Save email to users table if provided (only for first setup)
      if (isFirstSetup && email.trim() && isValidEmail(email.trim())) {
        await supabase
          .from('users')
          .update({ email: email.trim() })
          .eq('id', user.id)
      }

      // Avatar URL is now set directly by ImageUpload component
      const finalAvatarUrl = avatarUrl || undefined

      // Specialty removed - using category instead

      // Get languages array
      const languages: string[] = []
      if (speaksCzech) languages.push('czech')
      if (speaksEnglish) languages.push('english')
      languages.push(...otherLanguages)

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('service_provider_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let profileId: string

      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('service_provider_profiles')
          .update({
            name: name.trim(),
            surname: surname.trim() || null,
            // specialty removed - using category instead
            type: accountType || 'self-employed',
            ico: ico.trim() || null,
            location: location.trim() || null,
            category: selectedCategory || null,
            services: selectedSubcategories,
            languages,
            about_me: aboutMe.trim() || null,
            hourly_rate_min: priceFrom ? parseFloat(priceFrom) : null,
            price_currency: priceCurrency,
            price_period: pricePeriod,
            avatar_url: finalAvatarUrl || null,
            background_image_url: backgroundUrl || null,
            profile_video_url: profileVideoUrl || null,
            additional_images: workPhotoUrls.length > 0 ? workPhotoUrls : null,
            is_visible: true,
            is_active: true,
            profile_completed: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)

        if (updateError) throw updateError
        profileId = existingProfile.id
      } else {
        // Create new profile
        const { data: newProfile, error: insertError } = await supabase
          .from('service_provider_profiles')
          .insert({
            user_id: user.id,
            name: name.trim(),
            surname: surname.trim() || null,
            // specialty removed - using category instead
            type: accountType || 'self-employed',
            ico: ico.trim() || null,
            location: location.trim() || null,
            category: selectedCategory || null,
            services: selectedSubcategories,
            languages,
            about_me: aboutMe.trim() || null,
            hourly_rate_min: priceFrom ? parseFloat(priceFrom) : null,
            price_currency: priceCurrency,
            price_period: pricePeriod,
            avatar_url: finalAvatarUrl || null,
            background_image_url: backgroundUrl || null,
            profile_video_url: profileVideoUrl || null,
            additional_images: workPhotoUrls.length > 0 ? workPhotoUrls : null,
            is_visible: true,
            is_active: true,
            profile_completed: true,
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        profileId = newProfile.id
      }

      // 1. First switch to service provider type (updates database and local state)
      // Use force=true because the serviceProviderProfile might not be in context yet
      await switchUserType('service_provider', true)
      
      // 2. Update local state immediately
      updateServiceProviderProfileLocal({ profile_completed: true, id: profileId })
      
      // 3. Clear pending profile type
      clearPendingProfileType()
      
      // 4. Refresh profiles to sync with database
      await refreshProfiles()
      
      // 5. Move to success screen
      handleNext()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || (language === 'cs' ? 'Nepodařilo se uložit profil' : 'Failed to save profile'))
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Don't render if not authenticated or if user already has a completed service provider profile
  if (!isAuthenticated || hasCompletedProviderProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Progress bar
  const progress = (currentStep / TOTAL_STEPS) * 100
  const selectedCategoryData = getSelectedCategoryData()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-700 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {currentStep}/{TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* Account Type */}
          {stepContent === 'accountType' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step1.title}</h2>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setAccountType('company')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                    accountType === 'company' 
                      ? "border-primary-700 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    accountType === 'company' ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-900">{t.step1.company}</span>
                </button>
                
                <button
                  onClick={() => setAccountType('self-employed')}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4",
                    accountType === 'self-employed' 
                      ? "border-primary-700 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center",
                    accountType === 'self-employed' ? "bg-primary-700 text-white" : "bg-gray-100 text-gray-600"
                  )}>
                    <User className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-gray-900">{t.step1.selfEmployed}</span>
                </button>
              </div>
            </div>
          )}

          {/* Name */}
          {stepContent === 'name' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {accountType === 'company' ? t.step2.titleCompany : t.step2.titleSelfEmployed}
                </h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder={accountType === 'company' ? t.step2.companyPlaceholder : t.step2.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoCapitalize="words"
                />
                {accountType === 'self-employed' && (
                  <Input
                    placeholder={t.step2.surnamePlaceholder}
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    autoCapitalize="words"
                  />
                )}
              </div>
            </div>
          )}

          {/* Email (only for first setup) */}
          {stepContent === 'email' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.stepEmail.title}</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder={t.stepEmail.placeholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  autoCapitalize="none"
                />
                <p className="text-sm text-gray-500 text-center">{t.stepEmail.note}</p>
              </div>
            </div>
          )}

          {/* IČO */}
          {stepContent === 'ico' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step3.title}</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder={t.step3.placeholder}
                  value={ico}
                  onChange={(e) => setIco(e.target.value)}
                  type="text"
                  inputMode="numeric"
                />
                <p className="text-sm text-gray-500 text-center">{t.step3.note}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {stepContent === 'location' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step4.title}</h2>
              </div>
              
              <LocationInput
                placeholder={t.step4.placeholder}
                value={location}
                onChange={(value) => setLocation(value)}
              />
            </div>
          )}

          {/* Categories */}
          {stepContent === 'categories' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.step5.title}</h2>
                <p className="text-gray-600">{t.step5.subtitle}</p>
              </div>
              
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all text-center"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {language === 'cs' ? category.labelCS : category.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-primary-700 font-medium mb-4 hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {language === 'cs' ? selectedCategoryData?.labelCS : selectedCategoryData?.label}
                  </button>
                  
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedSubcategories.length}/5 {language === 'cs' ? 'vybráno' : 'selected'}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto">
                    {selectedCategoryData?.subcategories.map((subcategory) => {
                      const isSelected = selectedSubcategories.includes(subcategory.value)
                      const isDisabled = !isSelected && selectedSubcategories.length >= 5
                      
                      return (
                        <button
                          key={subcategory.value}
                          onClick={() => handleSubcategoryToggle(subcategory.value)}
                          disabled={isDisabled}
                          className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                            isSelected 
                              ? "bg-primary-700 text-white" 
                              : isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {language === 'cs' ? subcategory.labelCS : subcategory.label}
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Languages */}
          {stepContent === 'languages' && (() => {
            const MAX_LANGUAGES = 5
            const mainLanguagesCount = (speaksCzech ? 1 : 0) + (speaksEnglish ? 1 : 0)
            const totalLanguagesCount = mainLanguagesCount + otherLanguages.length
            const remainingSlots = MAX_LANGUAGES - totalLanguagesCount
            const maxOtherSelections = MAX_LANGUAGES - mainLanguagesCount
            const canToggleCzech = speaksCzech || remainingSlots > 0
            const canToggleEnglish = speaksEnglish || remainingSlots > 0
            
            const otherLanguageOptions = LANGUAGES.filter(
              lang => lang.value !== 'czech' && lang.value !== 'english'
            )
            
            const handleToggleCzech = () => {
              if (speaksCzech) {
                setSpeaksCzech(false)
              } else if (canToggleCzech) {
                setSpeaksCzech(true)
              }
            }
            
            const handleToggleEnglish = () => {
              if (speaksEnglish) {
                setSpeaksEnglish(false)
              } else if (canToggleEnglish) {
                setSpeaksEnglish(true)
              }
            }
            
            const handleToggleOtherLanguage = (langValue: string) => {
              if (otherLanguages.includes(langValue)) {
                setOtherLanguages(otherLanguages.filter(l => l !== langValue))
              } else if (otherLanguages.length < maxOtherSelections) {
                setOtherLanguages([...otherLanguages, langValue])
              }
            }
            
            return (
              <div className="space-y-6">
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Languages className="w-8 h-8 text-primary-700" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">{t.step6.title}</h2>
                  <p className="text-sm text-gray-500 mt-2">
                    {totalLanguagesCount}/{MAX_LANGUAGES} {t.step6.maxLanguages}
                  </p>
                </div>
                
                {/* Main languages */}
                <div className="space-y-3">
                  <button
                    onClick={handleToggleCzech}
                    disabled={!canToggleCzech && !speaksCzech}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                      speaksCzech 
                        ? "border-primary-700 bg-primary-50" 
                        : "border-gray-200 hover:border-gray-300",
                      !canToggleCzech && !speaksCzech && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="font-medium text-gray-900">CZ {t.step6.czech}</span>
                    {speaksCzech && <Check className="w-5 h-5 text-primary-700" />}
                  </button>
                  
                  <button
                    onClick={handleToggleEnglish}
                    disabled={!canToggleEnglish && !speaksEnglish}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between",
                      speaksEnglish 
                        ? "border-primary-700 bg-primary-50" 
                        : "border-gray-200 hover:border-gray-300",
                      !canToggleEnglish && !speaksEnglish && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="font-medium text-gray-900">EN {t.step6.english}</span>
                    {speaksEnglish && <Check className="w-5 h-5 text-primary-700" />}
                  </button>
                </div>

                {/* Other languages */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t.step6.otherLanguages}
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto">
                    {otherLanguageOptions.map((lang) => {
                      const isSelected = otherLanguages.includes(lang.value)
                      const isDisabled = !isSelected && otherLanguages.length >= maxOtherSelections
                      
                      return (
                        <button
                          key={lang.value}
                          onClick={() => handleToggleOtherLanguage(lang.value)}
                          disabled={isDisabled}
                          className={cn(
                            "px-3 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1",
                            isSelected 
                              ? "bg-primary-700 text-white" 
                              : isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {language === 'cs' ? lang.labelCS : lang.label}
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* About Me */}
          {stepContent === 'about' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step7.title}</h2>
              </div>
              
              <div>
                <textarea
                  placeholder={t.step7.placeholder}
                  value={aboutMe}
                  onChange={(e) => setAboutMe(e.target.value.slice(0, 1000))}
                  className="w-full h-40 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 text-right mt-1">
                  {aboutMe.length}/1000
                </p>
              </div>
            </div>
          )}

          {/* Pricing */}
          {stepContent === 'pricing' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step8.title}</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.step8.startingFrom}
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="number"
                      placeholder="0"
                      value={priceFrom}
                      onChange={(e) => setPriceFrom(e.target.value)}
                      className="flex-1"
                    />
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl text-gray-600">
                      CZK
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {(['hour', 'day', 'project'] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setPricePeriod(period)}
                      className={cn(
                        "flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all",
                        pricePeriod === period
                          ? "bg-primary-700 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      )}
                    >
                      {period === 'hour' ? t.step8.perHour : 
                       period === 'day' ? t.step8.perDay : 
                       t.step8.perProject}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Photos - Avatar & Background */}
          {stepContent === 'photos' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step9.title}</h2>
                <p className="text-gray-600 mt-2">{t.step9.subtitle}</p>
              </div>
              
              <div className="space-y-6">
                {/* Profile Photo */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.step9.profilePhoto}
                  </label>
                  <ImageUpload
                    value={avatarUrl}
                    onChange={setAvatarUrl}
                    bucket="avatars"
                    folder={user?.id}
                    aspectRatio="square"
                    maxSizeMB={5}
                  />
                </div>

                {/* Background Photo */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.step9.backgroundPhoto}
                  </label>
                  <ImageUpload
                    value={backgroundUrl}
                    onChange={setBackgroundUrl}
                    bucket="backgrounds"
                    folder={user?.id}
                    aspectRatio="video"
                    maxSizeMB={10}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Work Photos & Video */}
          {stepContent === 'workPhotos' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step10.title}</h2>
                <p className="text-gray-600 mt-2">{t.step10.subtitle}</p>
              </div>
              
              <div className="space-y-6">
                {/* Profile Video */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.step10.profileVideo}
                  </label>
                  <VideoUpload
                    value={profileVideoUrl}
                    onChange={setProfileVideoUrl}
                    bucket="videos"
                    folder={user?.id}
                    maxSizeMB={50}
                    maxDurationSeconds={90}
                  />
                  <p className="text-xs text-gray-500 mt-1">{t.step10.videoHint}</p>
                </div>

                {/* Work Photos */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    {t.step10.workPhotos} ({workPhotoUrls.length}/5)
                  </label>
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
                        folder={user?.id}
                        aspectRatio="square"
                        maxSizeMB={5}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Complete / Success */}
          {stepContent === 'complete' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Rocket className="w-12 h-12 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.step11.title}</h2>
                <p className="text-gray-600">{t.step11.subtitle}</p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {stepContent !== 'complete' && (
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.back}
            </Button>
          )}
          
          {stepContent === 'workPhotos' ? (
            <Button
              onClick={handleSaveProfile}
              isLoading={isLoading}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? t.common.saving : (language === 'cs' ? 'Dokončit' : 'Complete')}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : currentStep < TOTAL_STEPS ? (
            <Button
              onClick={handleNext}
              disabled={
                (stepContent === 'accountType' && !accountType) ||
                (stepContent === 'name' && !name.trim()) ||
                (stepContent === 'email' && email.length > 0 && !isValidEmail(email)) ||
                (stepContent === 'categories' && (!selectedCategory || selectedSubcategories.length === 0)) ||
                (stepContent === 'languages' && !speaksCzech && !speaksEnglish && otherLanguages.length === 0) ||
                isLoading
              }
              className="flex-1"
            >
              {(stepContent === 'email' && !email) ||
               (stepContent === 'ico' && !ico) || 
               (stepContent === 'location' && !location) || 
               (stepContent === 'about' && !aboutMe) ||
               (stepContent === 'pricing' && !priceFrom) ||
               (stepContent === 'photos' && !avatarUrl && !backgroundUrl)
                ? t.common.skip 
                : t.common.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : stepContent === 'complete' ? (
            <Button
              onClick={() => {
                // Profile already saved at workPhotos step
                // Just navigate to the profile
                if (serviceProviderProfile?.id) {
                  router.push(`/providers/${serviceProviderProfile.id}`)
                } else {
                  router.push('/search')
                }
              }}
              className="flex-1"
            >
              {t.step11.save}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}

