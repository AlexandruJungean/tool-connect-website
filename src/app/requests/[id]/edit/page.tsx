'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, TextArea, Select, LoadingSpinner } from '@/components/ui'
import { LocationInput } from '@/components/forms'
import { AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'
import { SERVICE_CATEGORIES, getCategoryLabel, getSubcategoryLabel } from '@/constants/categories'
import { cn } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default function EditRequestPage({ params }: Props) {
  const { id: requestId } = use(params)
  const router = useRouter()
  const { language } = useLanguage()
  const { clientProfile, isLoading: authLoading, isAuthenticated } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [location, setLocation] = useState('')
  const [budget, setBudget] = useState('')

  const t = {
    title: language === 'cs' ? 'Upravit poptávku' : 'Edit Request',
    descriptionLabel: language === 'cs' ? 'Co potřebujete?' : 'What do you need?',
    descriptionPlaceholder: language === 'cs' 
      ? 'Popište svůj požadavek podrobněji...'
      : 'Describe your request in detail...',
    categoryLabel: language === 'cs' ? 'Kategorie' : 'Category',
    subcategoryLabel: language === 'cs' ? 'Podkategorie' : 'Subcategories',
    subcategoryHint: language === 'cs' ? 'vyberte jednu nebo více' : 'select one or more',
    locationLabel: language === 'cs' ? 'Místo' : 'Location',
    budgetLabel: language === 'cs' ? 'Rozpočet (volitelné)' : 'Budget (optional)',
    budgetPlaceholder: language === 'cs' ? 'Např. 5000 Kč' : 'E.g. €500',
    save: language === 'cs' ? 'Uložit změny' : 'Save Changes',
    saving: language === 'cs' ? 'Ukládání...' : 'Saving...',
    successMessage: language === 'cs' 
      ? 'Požadavek byl úspěšně aktualizován!'
      : 'Request updated successfully!',
    errorNotOwner: language === 'cs' 
      ? 'Nemáte oprávnění upravovat tento požadavek'
      : 'You don\'t have permission to edit this request',
    selectCategory: language === 'cs' ? 'Vyberte kategorii' : 'Select category',
    selectSubcategory: language === 'cs' ? 'Vyberte alespoň jednu podkategorii' : 'Select at least one subcategory',
  }

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) return

    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('work_requests')
          .select('*')
          .eq('id', requestId)
          .single()

        if (error) throw error

        // Check ownership
        if (data.client_id !== clientProfile?.id) {
          setError(t.errorNotOwner)
          return
        }

        setDescription(data.description || '')
        setCategory(data.category || '')
        // Parse subcategories from comma-separated string
        setSubcategories(data.subcategory ? data.subcategory.split(',').filter((s: string) => s.trim()) : [])
        setLocation(data.location || '')
        setBudget(data.budget || '')
      } catch (err) {
        console.error('Failed to fetch request:', err)
        setError(language === 'cs' 
          ? 'Nepodařilo se načíst požadavek'
          : 'Failed to load request')
      } finally {
        setIsLoading(false)
      }
    }

    if (clientProfile) {
      fetchRequest()
    } else if (!isAuthenticated) {
      // Only show error if auth is done AND user is not authenticated
      setIsLoading(false)
      setError(language === 'cs' 
        ? 'Pro úpravu požadavku se musíte přihlásit'
        : 'You must be logged in to edit a request')
    }
  }, [requestId, clientProfile, authLoading, isAuthenticated, language, t.errorNotOwner])

  const toggleSubcategory = (value: string) => {
    setSubcategories(prev => 
      prev.includes(value) 
        ? prev.filter(s => s !== value)
        : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!description.trim()) {
      setError(language === 'cs' ? 'Vyplňte popis' : 'Description is required')
      return
    }

    if (!category) {
      setError(language === 'cs' ? 'Vyberte kategorii' : 'Category is required')
      return
    }

    if (subcategories.length === 0) {
      setError(language === 'cs' ? 'Vyberte alespoň jednu podkategorii' : 'Select at least one subcategory')
      return
    }

    setIsSubmitting(true)

    try {
      const { data, error: updateError } = await supabase
        .from('work_requests')
        .update({
          description: description.trim(),
          category,
          subcategory: subcategories.join(','), // Store as comma-separated string
          location: location.trim() || null,
          budget: budget.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', requestId)
        .eq('client_id', clientProfile?.id) // RLS: ensure client owns this request
        .select()

      if (updateError) {
        console.error('Supabase update error:', updateError)
        throw new Error(updateError.message)
      }

      if (!data || data.length === 0) {
        throw new Error('No rows updated - you may not have permission to edit this request')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/requests/${requestId}`)
      }, 1500)
    } catch (err: any) {
      console.error('Failed to update request:', err)
      setError(err.message || (language === 'cs' 
        ? 'Nepodařilo se aktualizovat požadavek'
        : 'Failed to update request'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const categoryOptions = SERVICE_CATEGORIES.map((cat) => ({
    value: cat.value,
    label: getCategoryLabel(cat.value, language as 'en' | 'cs'),
  }))

  const selectedCategoryData = SERVICE_CATEGORIES.find((c) => c.value === category)
  const subcategoryOptions = selectedCategoryData?.subcategories || []

  // Show loading while auth is loading OR while fetching request data
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AlertCard variant="success" message={t.successMessage} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
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

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <AlertCard variant="error" message={error} onDismiss={() => setError(null)} />
          )}

          <TextArea
            label={t.descriptionLabel}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.descriptionPlaceholder}
            rows={4}
          />

          <Select
            label={t.categoryLabel}
            value={category}
            onChange={(value) => {
              setCategory(value)
              setSubcategories([]) // Reset subcategories when category changes
            }}
            options={[
              { value: '', label: t.selectCategory },
              ...categoryOptions,
            ]}
            required
          />

          {/* Subcategories - Multi-select */}
          {subcategoryOptions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.subcategoryLabel} *
                <span className="text-gray-400 font-normal ml-2">
                  ({t.subcategoryHint})
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
                      {getSubcategoryLabel(category, sub.value, language as 'en' | 'cs')}
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

          <LocationInput
            label={t.locationLabel}
            value={location}
            onChange={setLocation}
          />

          <Input
            label={t.budgetLabel}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder={t.budgetPlaceholder}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.saving : t.save}
          </Button>
        </form>
      </div>
    </div>
  )
}
