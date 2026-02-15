'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/contexts/CategoriesContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LocationInput, VideoUpload } from '@/components/forms'
import { ArrowLeft, Check, Video } from 'lucide-react'
import { LoginPromptModal } from '@/components/ui/LoginPromptModal'
import { cn } from '@/lib/utils'

export default function CreateRequestPage() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const { isAuthenticated, clientProfile } = useAuth()

  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [budget, setBudget] = useState('')
  const [location, setLocation] = useState('')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const { categories, getCategoryLabel, getSubcategoryLabel } = useCategories()

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true)
    }
  }, [isAuthenticated])

  const selectedCategory = categories.find(cat => cat.value === category)
  const subcategoryOptions = selectedCategory?.subcategories || []

  const categoryOptions = categories.map(cat => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, language)
  }))

  const toggleSubcategory = (value: string) => {
    setSubcategories(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!clientProfile) {
      setError(language === 'cs' ? 'Vytvořte si nejprve profil klienta' : 'Please create a client profile first')
      return
    }

    if (!description.trim() || !category) {
      setError(language === 'cs' ? 'Vyplňte prosím všechna povinná pole' : 'Please fill in all required fields')
      return
    }

    if (subcategories.length === 0) {
      setError(language === 'cs' ? 'Vyberte alespoň jednu podkategorii' : 'Please select at least one subcategory')
      return
    }

    setIsSubmitting(true)
    try {
      const { data, error: insertError } = await supabase
        .from('work_requests')
        .insert({
          client_id: clientProfile.id,
          description: description.trim(),
          category,
          subcategory: subcategories.join(','), // Store as comma-separated string
          budget: budget || null,
          location: location || null,
          video_url: videoUrl || null,
          status: 'active',
        })
        .select()
        .single()

      if (insertError) throw insertError

      // Notify service providers with matching category
      try {
        const clientName = clientProfile.name || (language === 'cs' ? 'Klient' : 'A client')
        const shortDescription = description.trim().length > 50 
          ? description.trim().substring(0, 47) + '...' 
          : description.trim()

        // Find service providers with matching category who are active
        const { data: providers } = await supabase
          .from('service_provider_profiles')
          .select('user_id')
          .eq('category', category)
          .eq('is_visible', true)
          .eq('is_active', true)
          .eq('profile_completed', true)

        if (providers && providers.length > 0) {
          const notifications = providers.map(provider => ({
            user_id: provider.user_id,
            type: 'new_work_request',
            title: language === 'cs' ? 'Nová poptávka' : 'New Request',
            message: language === 'cs' 
              ? `${clientName} hledá pomoc: ${shortDescription}`
              : `${clientName} needs help: ${shortDescription}`,
            data: { 
              request_id: data.id,
              category,
            },
          }))

          await supabase.from('notifications').insert(notifications)
        }
      } catch (notifError) {
        // Silently fail - don't break the request creation flow
        console.error('Failed to send notifications:', notifError)
      }

      router.push(`/requests/${data.id}`)
    } catch (err: any) {
      console.error('Error creating request:', err)
      setError(err.message || (language === 'cs' ? 'Nepodařilo se vytvořit poptávku' : 'Failed to create request'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => {
          setShowLoginPrompt(false)
          if (!isAuthenticated) router.back()
        }}
        redirectTo="/requests/create"
      />

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
            {t('requests.createNew')}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {language === 'cs' ? 'Co potřebujete? *' : 'What do you need? *'}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder={language === 'cs' 
                  ? 'Popište co potřebujete...'
                  : 'Describe what you need...'
                }
                required
              />
            </div>

            {/* Category */}
            <Select
              label={`${t('search.category')} *`}
              options={categoryOptions}
              value={category}
              onChange={(val) => {
                setCategory(val)
                setSubcategories([]) // Reset subcategories when category changes
              }}
              placeholder={language === 'cs' ? 'Vyberte kategorii' : 'Select a category'}
            />

            {/* Subcategories - Multi-select */}
            {category && subcategoryOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'cs' ? 'Podkategorie *' : 'Subcategories *'}
                  <span className="text-gray-400 font-normal ml-2">
                    ({language === 'cs' ? 'vyberte jednu nebo více' : 'select one or more'})
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {subcategoryOptions.map((sub) => {
                    const isSelected = subcategories.includes(sub.value)
                    return (
                      <button
                        key={sub.value}
                        type="button"
                        onClick={() => toggleSubcategory(sub.value)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border-2",
                          isSelected
                            ? "bg-primary-100 text-primary-700 border-primary-500"
                            : "bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:bg-primary-50"
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4" />}
                        {getSubcategoryLabel(category, sub.value, language)}
                      </button>
                    )
                  })}
                </div>
                {subcategories.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    {language === 'cs' ? `Vybráno: ${subcategories.length}` : `Selected: ${subcategories.length}`}
                  </p>
                )}
              </div>
            )}

            {/* Budget */}
            <Input
              label={language === 'cs' ? 'Rozpočet (volitelné)' : 'Budget (optional)'}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder={language === 'cs' ? 'např. 500-1000 Kč' : 'e.g. 500-1000 CZK'}
            />

            {/* Location */}
            <LocationInput
              label={language === 'cs' ? 'Lokace (volitelné)' : 'Location (optional)'}
              value={location}
              onChange={(value) => setLocation(value)}
              placeholder={language === 'cs' ? 'Město nebo oblast' : 'City or area'}
            />

            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'cs' ? 'Video (volitelné)' : 'Video (optional)'}
              </label>
              <p className="text-xs text-gray-500 mb-2">
                {language === 'cs' 
                  ? 'Vytvořte krátké video, které vysvětlí, s čím potřebujete pomoci'
                  : 'Create a short video to explain what you need help with'}
              </p>
              <VideoUpload
                value={videoUrl}
                onChange={setVideoUrl}
                bucket="request-videos"
                folder={clientProfile?.id}
                maxSizeMB={50}
                maxDurationSeconds={90}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-600 text-sm">{error}</p>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="flex-1"
                size="lg"
              >
                {language === 'cs' ? 'Vytvořit poptávku' : 'Create Request'}
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
