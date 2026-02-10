'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LocationInput } from '@/components/forms'
import { useCategories } from '@/contexts/CategoriesContext'
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  MapPin, 
  Camera,
  User,
  Phone,
  Mail,
  CheckCircle,
  Grid3X3,
  PenLine,
  Search,
  Send
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ClientProfileSetupPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { categories } = useCategories()
  const { 
    user,
    isAuthenticated, 
    isLoading: authLoading, 
    clientProfile,
    serviceProviderProfile,
    refreshProfiles,
    clearPendingProfileType,
    updateClientProfileLocal,
    switchUserType
  } = useAuth()
  
  // Check if this is the first profile setup (no other profile exists)
  // Email step should only appear for the first setup
  const isFirstSetup = !serviceProviderProfile
  
  // Progress bar shows steps up to Save (not Categories/Help Options)
  // With email: Name, Email, Phone, Location, Photo, Save = 6 steps for progress
  // Without email: Name, Phone, Location, Photo, Save = 5 steps for progress
  const PROGRESS_STEPS = isFirstSetup ? 6 : 5
  // Actual total steps including Categories and Help Options
  const TOTAL_STEPS = isFirstSetup ? 8 : 7
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profileId, setProfileId] = useState<string | null>(null)
  
  // Form state
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [email, setEmail] = useState('')
  const [phoneVisible, setPhoneVisible] = useState<boolean | null>(null)
  const [location, setLocation] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  // Categories and Help Options state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([])
  const [wantsToPostRequest, setWantsToPostRequest] = useState<boolean | null>(null)
  const [requestDescription, setRequestDescription] = useState('')
  const [requestSubmitted, setRequestSubmitted] = useState(false)

  // Translations
  const t = {
    step1: {
      title: language === 'cs' ? 'Jak vám říkají?' : 'What\'s your name?',
      namePlaceholder: language === 'cs' ? 'Jméno' : 'First name',
      surnamePlaceholder: language === 'cs' ? 'Příjmení (volitelné)' : 'Last name (optional)',
      note: language === 'cs' ? 'Toto jméno uvidí poskytovatelé služeb.' : 'This name will be visible to service providers.',
    },
    stepEmail: {
      title: language === 'cs' ? 'Jaký je váš e-mail?' : 'What\'s your email address?',
      placeholder: language === 'cs' ? 'E-mailová adresa' : 'Email address',
      note: language === 'cs' ? 'Budeme vás kontaktovat ohledně důležitých aktualizací.' : 'We\'ll contact you about important updates.',
    },
    step2: {
      title: language === 'cs' ? 'Chcete zobrazit své telefonní číslo?' : 'Do you want to show your phone number?',
      option1Title: language === 'cs' ? 'Ano, zobrazit mé číslo' : 'Yes, show my number',
      option1Note: language === 'cs' ? 'Poskytovatelé vás mohou kontaktovat přímo.' : 'Providers can contact you directly.',
      option2Title: language === 'cs' ? 'Ne, skrýt mé číslo' : 'No, hide my number',
      option2Note: language === 'cs' ? 'Komunikujte pouze přes zprávy v aplikaci.' : 'Communicate only through in-app messages.',
    },
    step3: {
      title: language === 'cs' ? 'Kde se nacházíte?' : 'Where are you located?',
      placeholder: language === 'cs' ? 'Město nebo oblast' : 'City or area',
      note: language === 'cs' ? 'Pomůže nám najít poskytovatele ve vašem okolí.' : 'Helps us find providers near you.',
      skip: language === 'cs' ? 'Přeskočit' : 'Skip',
    },
    step4: {
      title: language === 'cs' ? 'Přidejte profilovou fotku' : 'Add a profile photo',
      uploadPhoto: language === 'cs' ? 'Nahrát fotku' : 'Upload photo',
      note: language === 'cs' ? 'Profilová fotka zvyšuje důvěryhodnost.' : 'A profile photo increases trust.',
      skip: language === 'cs' ? 'Přeskočit' : 'Skip',
    },
    step5: {
      title: language === 'cs' ? 'Vše je připraveno!' : 'All set!',
      subtitle: language === 'cs' ? 'Váš profil byl vytvořen.' : 'Your profile has been created.',
      save: language === 'cs' ? 'Uložit profil' : 'Save Profile',
    },
    step6: {
      title: language === 'cs' ? 'Co hledáte?' : 'What are you looking for?',
      subtitle: language === 'cs' ? 'Vyberte kategorii služeb, které potřebujete.' : 'Select a category of services you need.',
      backToCategories: language === 'cs' ? 'Zpět na kategorie' : 'Back to categories',
    },
    step7: {
      title: language === 'cs' ? 'Jak vám můžeme pomoci?' : 'How can we help you?',
      subtitle: language === 'cs' ? 'Vyberte, jak chcete začít.' : 'Choose how you want to get started.',
      postRequest: language === 'cs' ? 'Zveřejnit poptávku' : 'Post a Request',
      postRequestDesc: language === 'cs' ? 'Popište, co potřebujete, a poskytovatelé vás kontaktují.' : 'Describe what you need and providers will contact you.',
      browseProviders: language === 'cs' ? 'Procházet poskytovatele' : 'Browse Providers',
      browseProvidersDesc: language === 'cs' ? 'Procházejte profily a kontaktujte poskytovatele přímo.' : 'Browse profiles and contact providers directly.',
      describeNeed: language === 'cs' ? 'Popište, co potřebujete:' : 'Describe what you need:',
      placeholder: language === 'cs' ? 'Např.: Hledám spolehlivou paní na hlídání na 2 odpoledne týdně...' : 'E.g.: Looking for a reliable babysitter for 2 afternoons per week...',
      postAndSearch: language === 'cs' ? 'Zveřejnit a hledat' : 'Post & Search',
      startSearching: language === 'cs' ? 'Začít hledat' : 'Start Searching',
      requestPosted: language === 'cs' ? 'Poptávka zveřejněna!' : 'Request Posted!',
      requestNote: language === 'cs' ? 'Poskytovatelé služeb ve vaší oblasti budou upozorněni.' : 'Service providers in your area will be notified.',
      viewRequests: language === 'cs' ? 'Zobrazit mé poptávky' : 'View My Requests',
    },
    common: {
      back: language === 'cs' ? 'Zpět' : 'Back',
      next: language === 'cs' ? 'Další' : 'Next',
      saving: language === 'cs' ? 'Ukládám...' : 'Saving...',
    },
  }

  // Redirect if not authenticated or already has completed client profile
  useEffect(() => {
    if (authLoading) return
    
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    // Redirect if user already has a completed client profile
    if (clientProfile?.profile_completed === true) {
      router.push('/search')
      return
    }
  }, [isAuthenticated, authLoading, clientProfile, router])

  // Don't render if user already has a completed client profile
  const hasCompletedClientProfile = clientProfile?.profile_completed === true

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
  // If isFirstSetup: 1=Name, 2=Email, 3=Phone, 4=Location, 5=Photo, 6=Save, 7=Categories, 8=HelpOptions
  // Otherwise: 1=Name, 2=Phone, 3=Location, 4=Photo, 5=Save, 6=Categories, 7=HelpOptions
  const getStepContent = () => {
    if (isFirstSetup) {
      switch (currentStep) {
        case 1: return 'name'
        case 2: return 'email'
        case 3: return 'phone'
        case 4: return 'location'
        case 5: return 'photo'
        case 6: return 'save'
        case 7: return 'categories'
        case 8: return 'helpOptions'
        default: return 'name'
      }
    } else {
      switch (currentStep) {
        case 1: return 'name'
        case 2: return 'phone'
        case 3: return 'location'
        case 4: return 'photo'
        case 5: return 'save'
        case 6: return 'categories'
        case 7: return 'helpOptions'
        default: return 'name'
      }
    }
  }

  const stepContent = getStepContent()
  const isPastProgressSteps = currentStep > PROGRESS_STEPS
  
  // Category helpers
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

  // Save profile (not complete yet - will be completed after categories/help options)
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

      // Upload avatar if selected
      let avatarUrl: string | undefined
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}/avatar-${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile)
        
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)
          avatarUrl = publicUrl
        }
      }

      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      let currentProfileId: string | null = null

      if (existingProfile) {
        // Update existing profile (not completed yet)
        const { error: updateError } = await supabase
          .from('client_profiles')
          .update({
            name: name.trim(),
            surname: surname.trim() || null,
            avatar_url: avatarUrl || null,
            location: location.trim() || null,
            phone_visible: phoneVisible ?? false,
            profile_completed: false, // Will be marked complete after categories
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProfile.id)

        if (updateError) throw updateError
        currentProfileId = existingProfile.id
      } else {
        // Create new profile (not completed yet)
        const { data: newProfile, error: insertError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: user.id,
            name: name.trim(),
            surname: surname.trim() || null,
            avatar_url: avatarUrl || null,
            location: location.trim() || null,
            phone_visible: phoneVisible ?? false,
            languages: [language === 'cs' ? 'czech' : 'english'],
            is_active: true,
            profile_completed: false, // Will be marked complete after categories
          })
          .select('id')
          .single()

        if (insertError) throw insertError
        currentProfileId = newProfile?.id || null
      }

      // Store profile ID for later use
      setProfileId(currentProfileId)
      
      // Move to categories step
      handleNext()
    } catch (err: any) {
      console.error('Error saving profile:', err)
      setError(err.message || (language === 'cs' ? 'Nepodařilo se uložit profil' : 'Failed to save profile'))
    } finally {
      setIsLoading(false)
    }
  }

  // Post a work request
  const handlePostRequest = async () => {
    if (isLoading) return

    const currentProfileId = profileId || clientProfile?.id
    if (!currentProfileId) {
      setError(language === 'cs' ? 'Profil nenalezen' : 'Profile not found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create work request
      const { error: requestError } = await supabase
        .from('work_requests')
        .insert({
          client_id: currentProfileId,
          description: requestDescription.trim(),
          category: selectedCategory || '',
          subcategory: selectedSubcategories.join(','),
          location: location || null,
          status: 'active',
        })

      if (requestError) throw requestError

      setRequestSubmitted(true)
    } catch (err: any) {
      console.error('Error posting request:', err)
      setError(err.message || (language === 'cs' ? 'Nepodařilo se zveřejnit poptávku' : 'Failed to post request'))
    } finally {
      setIsLoading(false)
    }
  }

  // Complete onboarding
  const handleCompleteOnboarding = async (options: { navigateToRequests?: boolean } = {}) => {
    const { navigateToRequests = false } = options
    
    if (isLoading) return

    if (!user) {
      setError(language === 'cs' ? 'Uživatel není přihlášen' : 'User not authenticated')
      return
    }

    const currentProfileId = profileId || clientProfile?.id
    if (!currentProfileId) {
      setError(language === 'cs' ? 'Profil nenalezen' : 'Profile not found')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // 1. First switch to client type (updates database and local state)
      // Use force=true because the clientProfile might not be in context yet
      await switchUserType('client', true)
      
      // 2. Mark profile as completed in database
      const { error: updateError } = await supabase
        .from('client_profiles')
        .update({ profile_completed: true })
        .eq('id', currentProfileId)

      if (updateError) throw updateError

      // 3. Update local state immediately
      updateClientProfileLocal({ profile_completed: true, id: currentProfileId })
      
      // 4. Clear pending profile type
      clearPendingProfileType()
      
      // 5. Refresh profiles to sync with database
      await refreshProfiles()
      
      // 6. Build destination URL with filters if navigating to search
      let destinationUrl = navigateToRequests ? '/requests' : '/search'
      
      if (!navigateToRequests && selectedCategory) {
        const params = new URLSearchParams()
        params.set('category', selectedCategory)
        if (selectedSubcategories.length > 0) {
          params.set('subcategories', selectedSubcategories.join(','))
        }
        destinationUrl = `/search?${params.toString()}`
      }
      
      // 7. Small delay to ensure state propagation, then navigate
      setTimeout(() => {
        router.replace(destinationUrl)
      }, 100)
    } catch (err: any) {
      console.error('Error completing onboarding:', err)
      setError(err.message || (language === 'cs' ? 'Nepodařilo se dokončit nastavení' : 'Failed to complete setup'))
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

  // Don't render if not authenticated or if user already has a completed client profile
  if (!isAuthenticated || hasCompletedClientProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Progress bar (only shown for steps up to Save)
  const progressStepForBar = Math.min(currentStep, PROGRESS_STEPS)
  const progress = (progressStepForBar / PROGRESS_STEPS) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* Progress Bar - only show for steps up to Save */}
        {!isPastProgressSteps && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary-700 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-600">
                {currentStep}/{PROGRESS_STEPS}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          {/* Name */}
          {stepContent === 'name' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step1.title}</h2>
              </div>
              
              <div className="space-y-4">
                <Input
                  placeholder={t.step1.namePlaceholder}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoCapitalize="words"
                />
                <Input
                  placeholder={t.step1.surnamePlaceholder}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  autoCapitalize="words"
                />
                <p className="text-sm text-gray-500 text-center">{t.step1.note}</p>
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

          {/* Phone Visibility */}
          {stepContent === 'phone' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step2.title}</h2>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setPhoneVisible(true)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    phoneVisible === true 
                      ? "border-primary-700 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      phoneVisible === true 
                        ? "border-primary-700 bg-primary-700" 
                        : "border-gray-300"
                    )}>
                      {phoneVisible === true && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.step2.option1Title}</p>
                      <p className="text-sm text-gray-500">{t.step2.option1Note}</p>
                    </div>
                  </div>
                </button>
                
                <button
                  onClick={() => setPhoneVisible(false)}
                  className={cn(
                    "w-full p-4 rounded-xl border-2 text-left transition-all",
                    phoneVisible === false 
                      ? "border-primary-700 bg-primary-50" 
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                      phoneVisible === false 
                        ? "border-primary-700 bg-primary-700" 
                        : "border-gray-300"
                    )}>
                      {phoneVisible === false && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{t.step2.option2Title}</p>
                      <p className="text-sm text-gray-500">{t.step2.option2Note}</p>
                    </div>
                  </div>
                </button>
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
                <h2 className="text-2xl font-bold text-gray-900">{t.step3.title}</h2>
              </div>
              
              <div className="space-y-4">
                <LocationInput
                  placeholder={t.step3.placeholder}
                  value={location}
                  onChange={(value) => setLocation(value)}
                />
                <p className="text-sm text-gray-500 text-center">{t.step3.note}</p>
              </div>
            </div>
          )}

          {/* Photo */}
          {stepContent === 'photo' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Camera className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step4.title}</h2>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-gray-200">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 w-10 h-10 bg-primary-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-800 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarSelect}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500 text-center">{t.step4.note}</p>
              </div>
            </div>
          )}

          {/* Save */}
          {stepContent === 'save' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.step5.title}</h2>
                <p className="text-gray-600">{t.step5.subtitle}</p>
              </div>
            </div>
          )}

          {/* Categories */}
          {stepContent === 'categories' && (
            <div className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Grid3X3 className="w-8 h-8 text-primary-700" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t.step6.title}</h2>
                <p className="text-gray-600 mt-2">{t.step6.subtitle}</p>
              </div>
              
              {!selectedCategory ? (
                // Show main categories
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => handleCategorySelect(category.value)}
                      className="p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-primary-300 transition-colors text-center"
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {language === 'cs' ? category.labelCS : category.label}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                // Show subcategories
                <div className="space-y-4">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="flex items-center gap-2 text-primary-700 font-medium hover:underline"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t.step6.backToCategories}
                  </button>
                  
                  <div className="flex flex-wrap gap-2">
                    {getSelectedCategoryData()?.subcategories.map((subcategory) => {
                      const isSelected = selectedSubcategories.includes(subcategory.value)
                      const isDisabled = !isSelected && selectedSubcategories.length >= 5
                      return (
                        <button
                          key={subcategory.value}
                          onClick={() => handleSubcategoryToggle(subcategory.value)}
                          disabled={isDisabled}
                          className={cn(
                            "px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1",
                            isSelected
                              ? "bg-primary-700 text-white"
                              : isDisabled
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          )}
                        >
                          {language === 'cs' ? subcategory.labelCS : subcategory.label}
                          {isSelected && <Check className="w-3 h-3" />}
                        </button>
                      )
                    })}
                  </div>
                  
                  {selectedSubcategories.length > 0 && (
                    <p className="text-sm text-gray-500">
                      {selectedSubcategories.length}/5 {language === 'cs' ? 'vybráno' : 'selected'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Help Options */}
          {stepContent === 'helpOptions' && (
            <>
              {requestSubmitted ? (
                // Show confirmation after posting request
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Send className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.step7.requestPosted}</h2>
                    <p className="text-gray-600">{t.step7.requestNote}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">{t.step7.title}</h2>
                    <p className="text-gray-600 mt-2">{t.step7.subtitle}</p>
                  </div>
                  
                  {/* Two option cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Post a request */}
                    <button
                      onClick={() => setWantsToPostRequest(true)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center",
                        wantsToPostRequest === true
                          ? "border-primary-700 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center mb-3",
                        wantsToPostRequest === true
                          ? "bg-primary-700"
                          : "bg-primary-100"
                      )}>
                        <PenLine className={cn(
                          "w-7 h-7",
                          wantsToPostRequest === true ? "text-white" : "text-primary-700"
                        )} />
                      </div>
                      <span className={cn(
                        "font-semibold text-sm mb-1",
                        wantsToPostRequest === true ? "text-primary-700" : "text-gray-900"
                      )}>
                        {t.step7.postRequest}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {t.step7.postRequestDesc}
                      </span>
                    </button>

                    {/* Browse providers */}
                    <button
                      onClick={() => setWantsToPostRequest(false)}
                      className={cn(
                        "p-4 rounded-xl border-2 transition-all text-center flex flex-col items-center",
                        wantsToPostRequest === false
                          ? "border-primary-700 bg-primary-50"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-14 h-14 rounded-full flex items-center justify-center mb-3",
                        wantsToPostRequest === false
                          ? "bg-primary-700"
                          : "bg-primary-100"
                      )}>
                        <Search className={cn(
                          "w-7 h-7",
                          wantsToPostRequest === false ? "text-white" : "text-primary-700"
                        )} />
                      </div>
                      <span className={cn(
                        "font-semibold text-sm mb-1",
                        wantsToPostRequest === false ? "text-primary-700" : "text-gray-900"
                      )}>
                        {t.step7.browseProviders}
                      </span>
                      <span className="text-xs text-gray-500 leading-tight">
                        {t.step7.browseProvidersDesc}
                      </span>
                    </button>
                  </div>

                  {/* Request description input - only shown when "Post request" is selected */}
                  {wantsToPostRequest === true && (
                    <div className="space-y-2 mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="block text-sm font-medium text-gray-700">
                        {t.step7.describeNeed}
                      </label>
                      <textarea
                        value={requestDescription}
                        onChange={(e) => setRequestDescription(e.target.value)}
                        placeholder={t.step7.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {/* Back button - hide on save, categories and help options steps (they have their own buttons) */}
          {stepContent !== 'save' && stepContent !== 'categories' && stepContent !== 'helpOptions' && (
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
          
          {/* Next button for steps before Save */}
          {stepContent !== 'save' && stepContent !== 'categories' && stepContent !== 'helpOptions' && (
            <Button
              onClick={handleNext}
              disabled={
                (stepContent === 'name' && !name.trim()) ||
                (stepContent === 'email' && email.length > 0 && !isValidEmail(email)) ||
                isLoading
              }
              className="flex-1"
            >
              {(stepContent === 'email' && !email) ||
               (stepContent === 'location' && !location) || 
               (stepContent === 'photo' && !avatarFile)
                ? t.step3.skip 
                : t.common.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Save Profile button */}
          {stepContent === 'save' && (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isLoading}
                className="flex-1"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.common.back}
              </Button>
              <Button
                onClick={handleSaveProfile}
                isLoading={isLoading}
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? t.common.saving : t.step5.save}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {/* Categories step - Next button when subcategories selected */}
          {stepContent === 'categories' && (
            <Button
              onClick={handleNext}
              disabled={!selectedCategory || selectedSubcategories.length === 0}
              className="flex-1"
            >
              {t.common.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Help Options step */}
          {stepContent === 'helpOptions' && (
            <>
              {requestSubmitted ? (
                // After request is submitted, show button to go to requests
                <Button
                  onClick={() => handleCompleteOnboarding({ navigateToRequests: true })}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {t.step7.viewRequests}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                // Show action button based on selection
                <Button
                  onClick={() => {
                    if (wantsToPostRequest === true) {
                      handlePostRequest()
                    } else {
                      handleCompleteOnboarding()
                    }
                  }}
                  isLoading={isLoading}
                  disabled={
                    isLoading || 
                    wantsToPostRequest === null || 
                    (wantsToPostRequest === true && !requestDescription.trim())
                  }
                  className="flex-1"
                >
                  {wantsToPostRequest === true ? t.step7.postAndSearch : t.step7.startSearching}
                  {wantsToPostRequest === true ? (
                    <Send className="w-4 h-4 ml-2" />
                  ) : (
                    <Search className="w-4 h-4 ml-2" />
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

