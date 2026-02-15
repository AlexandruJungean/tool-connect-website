'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Review, ServiceProviderProfile } from '@/types/database'
import { formatTimeAgo } from '@/lib/utils'
import { Rating } from '@/components/ui/Rating'
import { ArrowLeft, Star, Loader2, Pencil, Trash2 } from 'lucide-react'
import { getMyReviewForProvider, deleteReview, canEditReview } from '@/lib/api/reviews'

export default function ProviderReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string
  const { language, t } = useLanguage()
  const { clientProfile, currentUserType } = useAuth()

  const [provider, setProvider] = useState<ServiceProviderProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [canEditMyReview, setCanEditMyReview] = useState(false)
  const [editTimeRemaining, setEditTimeRemaining] = useState({ days: 0, hours: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const translations = {
    yourReview: language === 'cs' ? 'Vaše recenze' : 'Your Review',
    editReview: language === 'cs' ? 'Upravit' : 'Edit',
    deleteReview: language === 'cs' ? 'Smazat' : 'Delete',
    deleteConfirmTitle: language === 'cs' ? 'Smazat recenzi?' : 'Delete Review?',
    deleteConfirmMessage: language === 'cs' 
      ? 'Opravdu chcete smazat tuto recenzi? Tuto akci nelze vrátit zpět.'
      : 'Are you sure you want to delete this review? This action cannot be undone.',
    cancel: language === 'cs' ? 'Zrušit' : 'Cancel',
    confirm: language === 'cs' ? 'Potvrdit' : 'Confirm',
    editTimeRemaining: language === 'cs' ? 'Můžete upravit ještě' : 'You can edit for',
    days: language === 'cs' ? 'd' : 'd',
    hours: language === 'cs' ? 'h' : 'h',
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch provider
        const { data: providerData } = await supabase
          .from('service_provider_profiles')
          .select('id, name, surname, average_rating, total_reviews')
          .eq('id', providerId)
          .single()

        if (providerData) {
          setProvider(providerData as ServiceProviderProfile)
        }

        // Fetch all reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            *,
            client:client_profiles(id, name, surname, avatar_url)
          `)
          .eq('service_provider_id', providerId)
          .order('created_at', { ascending: false })

        setReviews(reviewsData || [])

        // Check for user's own review
        if (clientProfile?.id && currentUserType === 'client') {
          const { review, canEdit, daysRemaining, hoursRemaining } = await getMyReviewForProvider(
            clientProfile.id,
            providerId
          )
          setMyReview(review)
          setCanEditMyReview(canEdit)
          setEditTimeRemaining({ days: daysRemaining, hours: hoursRemaining })
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [providerId, clientProfile?.id, currentUserType])

  const handleDeleteReview = async () => {
    if (!myReview) return
    
    setIsDeleting(true)
    try {
      await deleteReview(myReview.id)
      setMyReview(null)
      setReviews(reviews.filter(r => r.id !== myReview.id))
      setShowDeleteConfirm(false)
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  // Calculate average from actual reviews (more accurate than database field)
  const calculatedAverage = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null
  const rating = calculatedAverage ? Math.round(calculatedAverage * 10) / 10 : null
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length
  }))
  const maxCount = Math.max(...ratingDistribution.map(r => r.count), 1)

  // Filter out user's own review from the main list (it will be shown separately)
  const otherReviews = myReview 
    ? reviews.filter(r => r.id !== myReview.id)
    : reviews

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'cs' ? 'Recenze' : 'Reviews'}
            {provider && ` - ${provider.name} ${provider.surname || ''}`}
          </h1>

          {/* Rating Summary */}
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-gray-900">{rating?.toFixed(1) || '-'}</div>
              <div className="flex items-center justify-center mt-2">
                <Rating value={rating || 0} size="md" readonly />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {reviews.length} {t('provider.reviews')}
              </p>
            </div>

            {/* Distribution */}
            <div className="flex-1 space-y-2">
              {ratingDistribution.map(({ stars, count }) => (
                <div key={stars} className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 w-8">{stars}</span>
                  <Star className="w-4 h-4 text-primary-600 fill-current" />
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-600 rounded-full"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {/* User's Own Review (shown first with special styling) */}
          {myReview && (
            <div className="bg-white rounded-xl shadow-card p-5 border-2 border-primary-400">
              {/* Your Review Badge */}
              <div className="flex items-center justify-between mb-3">
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                  {translations.yourReview}
                </span>
                {canEditMyReview && (
                  <span className="text-xs text-gray-500">
                    {translations.editTimeRemaining} {editTimeRemaining.days}{translations.days} {editTimeRemaining.hours}{translations.hours}
                  </span>
                )}
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {(myReview.client?.avatar_url || clientProfile?.avatar_url) ? (
                    <img 
                      src={(myReview.client?.avatar_url || clientProfile?.avatar_url) ?? undefined} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <span className="text-primary-700 font-semibold">
                      {myReview.client?.name?.charAt(0) || clientProfile?.name?.charAt(0) || '?'}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900">
                      {myReview.client?.name || clientProfile?.name} {myReview.client?.surname || clientProfile?.surname}
                    </p>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(myReview.created_at, language)}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Rating value={myReview.rating} size="sm" readonly />
                  </div>
                  {myReview.comment && (
                    <p className="text-gray-600 mt-3 leading-relaxed">
                      {myReview.comment}
                    </p>
                  )}
                </div>
              </div>

              {/* Edit/Delete Actions */}
              <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-gray-100">
                {canEditMyReview && (
                  <button
                    onClick={() => router.push(`/providers/${providerId}/write-review`)}
                    className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <Pencil className="w-4 h-4" />
                    {translations.editReview}
                  </button>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                  {translations.deleteReview}
                </button>
              </div>
            </div>
          )}

          {/* Other Reviews */}
          {otherReviews.length > 0 ? (
            otherReviews.map((review) => {
              const anonymousName = language === 'cs' ? 'Anonymní uživatel' : 'Anonymous'
              const clientHref = review.client?.id ? `/clients/${review.client.id}` : null
              const reviewerNameRaw = [review.client?.name, review.client?.surname].filter(Boolean).join(' ').trim()
              const reviewerName = reviewerNameRaw || anonymousName
              const reviewerInitial = (review.client?.name?.trim()?.charAt(0) || reviewerName.charAt(0) || 'A').toUpperCase()

              return (
                <div key={review.id} className="bg-white rounded-xl shadow-card p-5">
                  <div className="flex items-start gap-4">
                    {clientHref ? (
                      <Link
                        href={clientHref}
                        className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-primary-300 transition-all"
                      >
                        {review.client?.avatar_url ? (
                          <img
                            src={review.client.avatar_url}
                            alt=""
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-primary-700 font-semibold">
                            {reviewerInitial}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        <span className="text-primary-700 font-semibold">
                          {reviewerInitial}
                        </span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        {clientHref ? (
                          <Link
                            href={clientHref}
                            className="font-medium text-gray-900 hover:text-primary-700 transition-colors"
                          >
                            {reviewerName}
                          </Link>
                        ) : (
                          <span className="font-medium text-gray-900">
                            {reviewerName}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(review.created_at, language)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <Rating value={review.rating} size="sm" readonly />
                      </div>
                      {review.comment && (
                        <p className="text-gray-600 mt-3 leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          ) : !myReview && (
            <div className="text-center py-12">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {language === 'cs' ? 'Zatím žádné recenze' : 'No reviews yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {translations.deleteConfirmTitle}
            </h3>
            <p className="text-gray-600 mb-6">
              {translations.deleteConfirmMessage}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={isDeleting}
              >
                {translations.cancel}
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : translations.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
