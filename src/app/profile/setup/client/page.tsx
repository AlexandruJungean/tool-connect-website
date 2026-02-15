'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, LoadingSpinner } from '@/components/ui'
import { ImageUpload, LocationInput } from '@/components/forms'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'

const STEPS = ['basics', 'photo'] as const
type Step = typeof STEPS[number]

export default function ClientProfileSetupPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { user, refreshProfile } = useAuth()

  const [currentStep, setCurrentStep] = useState<Step>('basics')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [surname, setSurname] = useState('')
  const [location, setLocation] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  const t = {
    title: language === 'cs' ? 'Vytvořit klientský profil' : 'Create Client Profile',
    step1: language === 'cs' ? 'Základní informace' : 'Basic Info',
    step2: language === 'cs' ? 'Profilová fotka' : 'Profile Photo',
    name: language === 'cs' ? 'Jméno' : 'First Name',
    surname: language === 'cs' ? 'Příjmení' : 'Last Name',
    location: language === 'cs' ? 'Lokalita (volitelné)' : 'Location (optional)',
    avatar: language === 'cs' ? 'Profilová fotka (volitelné)' : 'Profile Photo (optional)',
    avatarHint: language === 'cs' 
      ? 'Přidejte fotku, aby vás poskytovatelé mohli lépe identifikovat'
      : 'Add a photo so providers can better identify you',
    next: language === 'cs' ? 'Další' : 'Next',
    back: language === 'cs' ? 'Zpět' : 'Back',
    finish: language === 'cs' ? 'Dokončit' : 'Finish',
    skip: language === 'cs' ? 'Přeskočit' : 'Skip',
    requiredFields: language === 'cs' ? 'Vyplňte jméno a příjmení' : 'Please fill in your name',
  }

  const stepIndex = STEPS.indexOf(currentStep)

  const validateStep = (): boolean => {
    setError(null)
    if (currentStep === 'basics') {
      if (!name.trim() || !surname.trim()) {
        setError(t.requiredFields)
        return false
      }
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
    if (!user) {
      setError(language === 'cs' ? 'Přihlaste se prosím' : 'Please log in')
      return
    }

    setIsSubmitting(true)

    try {
      const { error: insertError } = await supabase
        .from('client_profiles')
        .insert({
          user_id: user.id,
          name: name.trim(),
          surname: surname.trim(),
          location: location.trim() || null,
          avatar_url: avatarUrl,
        })

      if (insertError) throw insertError

      await refreshProfile()
      router.push('/search')
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
            <LocationInput
              label={t.location}
              value={location}
              onChange={setLocation}
            />
          </div>
        )

      case 'photo':
        return (
          <div className="space-y-4">
            <ImageUpload
              label={t.avatar}
              value={avatarUrl}
              onChange={setAvatarUrl}
              bucket="avatars"
              aspectRatio="square"
            />
            <p className="text-sm text-gray-500 text-center">{t.avatarHint}</p>
          </div>
        )
    }
  }

  const stepLabels = [t.step1, t.step2]

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
          <div className="flex items-center justify-center mb-2">
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
                    className={`w-16 h-1 mx-2 ${
                      index < stepIndex ? 'bg-primary-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-20 text-xs text-gray-500">
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
          {currentStep === 'photo' ? (
            <>
              <Button variant="outline" onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {t.skip}
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex-1">
                {isSubmitting ? <LoadingSpinner size="sm" /> : t.finish}
              </Button>
            </>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              {t.next}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

