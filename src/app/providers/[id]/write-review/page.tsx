'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, TextArea, Rating, LoadingSpinner, LoginPromptModal } from '@/components/ui'
import { AlertCard } from '@/components/cards'
import { createReview, updateReview, getEditableReview, canEditReview, getEditTimeRemaining, Review } from '@/lib/api/reviews'
import { supabase } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function WriteReviewPage({ params }: Props) {
  const { id: providerId } = use(params)
  const router = useRouter()
  const { language } = useLanguage()
  const { user, clientProfile } = useAuth()

  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [existingReview, setExistingReview] = useState<Review | null>(null)
  const [editTimeRemaining, setEditTimeRemaining] = useState({ days: 0, hours: 0 })
  const [providerName, setProviderName] = useState('')

  const t = {
    title: language === 'cs' ? 'Napsat recenzi' : 'Write Review',
    editTitle: language === 'cs' ? 'Upravit recenzi' : 'Edit Review',
    ratingLabel: language === 'cs' ? 'Hodnocení' : 'Rating',
    reviewLabel: language === 'cs' ? 'Recenze (volitelné)' : 'Review (optional)',
    reviewPlaceholder: language === 'cs' 
      ? 'Sdílejte svou zkušenost s tímto poskytovatelem služeb...'
      : 'Share your experience with this service provider...',
    submit: language === 'cs' ? 'Odeslat recenzi' : 'Submit Review',
    update: language === 'cs' ? 'Aktualizovat recenzi' : 'Update Review',
    submitting: language === 'cs' ? 'Odesílání...' : 'Submitting...',
    successMessage: language === 'cs' 
      ? 'Vaše recenze byla úspěšně odeslána!'
      : 'Your review has been submitted successfully!',
    errorNoRating: language === 'cs' 
      ? 'Prosím vyberte hodnocení'
      : 'Please select a rating',
    errorNotLoggedIn: language === 'cs' 
      ? 'Pro napsání recenze se musíte přihlásit'
      : 'You must be logged in to write a review',
    errorNoProfile: language === 'cs'
      ? 'Pro napsání recenze musíte mít klientský profil'
      : 'You need a client profile to write a review',
    editTimeRemaining: language === 'cs'
      ? 'Můžete upravit tuto recenzi ještě'
      : 'You can edit this review for',
    days: language === 'cs' ? 'd' : 'd',
    hours: language === 'cs' ? 'h' : 'h',
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch provider name
        const { data: provider } = await supabase
          .from('service_provider_profiles')
          .select('name, surname')
          .eq('id', providerId)
          .single()

        if (provider) {
          setProviderName(`${provider.name || ''} ${provider.surname || ''}`.trim())
        }

        // Check for existing review
        if (clientProfile?.id) {
          const existing = await getEditableReview(clientProfile.id, providerId)
          if (existing) {
            setExistingReview(existing)
            setRating(existing.rating)
            setReviewText(existing.comment || '')
            // Calculate remaining edit time
            const { daysRemaining, hoursRemaining } = getEditTimeRemaining(existing)
            setEditTimeRemaining({ days: daysRemaining, hours: hoursRemaining })
          }
        }
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [providerId, clientProfile?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!user) {
      setError(t.errorNotLoggedIn)
      return
    }

    if (!clientProfile?.id) {
      setError(t.errorNoProfile)
      return
    }

    if (rating === 0) {
      setError(t.errorNoRating)
      return
    }

    setIsSubmitting(true)

    try {
      if (existingReview && canEditReview(existingReview)) {
        await updateReview(existingReview.id, rating, reviewText || undefined)
      } else {
        await createReview(clientProfile.id, providerId, rating, reviewText || undefined)
      }
      
      setSuccess(true)
      setTimeout(() => {
        router.push(`/providers/${providerId}`)
      }, 2000)
    } catch (err) {
      console.error('Failed to submit review:', err)
      setError(language === 'cs' 
        ? 'Nepodařilo se odeslat recenzi. Zkuste to prosím znovu.'
        : 'Failed to submit review. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user || !clientProfile) {
    return (
      <div className="min-h-screen p-4">
        <LoginPromptModal
          isOpen={true}
          onClose={() => router.back()}
          redirectTo={`/providers/${providerId}/write-review`}
        />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard variant="success" message={t.successMessage} />
      </div>
    )
  }

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
          <div>
            <h1 className="text-lg font-semibold">
              {existingReview ? t.editTitle : t.title}
            </h1>
            {providerName && (
              <p className="text-sm text-gray-500">{providerName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Edit time remaining notice */}
        {existingReview && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="text-sm text-primary-700">
              {t.editTimeRemaining} <span className="font-semibold">{editTimeRemaining.days}{t.days} {editTimeRemaining.hours}{t.hours}</span>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <AlertCard variant="error" message={error} onDismiss={() => setError(null)} />
          )}

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              {t.ratingLabel} *
            </label>
            <div className="flex justify-center">
              <Rating
                value={rating}
                onChange={setRating}
                readonly={false}
                size="lg"
              />
            </div>
          </div>

          {/* Review text */}
          <TextArea
            label={t.reviewLabel}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder={t.reviewPlaceholder}
            rows={5}
            maxLength={1000}
          />

          <div className="text-xs text-gray-400 text-right">
            {reviewText.length}/1000
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || rating === 0}
          >
            {isSubmitting 
              ? t.submitting 
              : existingReview 
                ? t.update 
                : t.submit}
          </Button>
        </form>
      </div>
    </div>
  )
}

