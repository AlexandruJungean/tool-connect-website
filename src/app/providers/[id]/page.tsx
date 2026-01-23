'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ServiceProviderProfile, Review } from '@/types/database'
import { getCategoryLabel, getSubcategoryLabel, getLanguageLabel } from '@/constants/categories'
import { Button } from '@/components/ui/Button'
import { ImageViewer } from '@/components/ui/ImageViewer'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { TranslatedText } from '@/components/ui/TranslatedText'
import { Rating } from '@/components/ui/Rating'
import { formatTimeAgo } from '@/lib/utils'
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation'
import { 
  Star, 
  MapPin, 
  Phone, 
  MessageSquare, 
  Heart, 
  Share2, 
  ArrowLeft,
  Building2,
  User,
  Globe,
  Clock,
  Wallet,
  Flag,
  ChevronRight,
  Loader2,
  ExternalLink,
  Edit,
  BarChart3,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react'
import { getMyReviewForProvider, deleteReview as deleteReviewApi } from '@/lib/api/reviews'
import { cn } from '@/lib/utils'

export default function ProviderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const providerId = params.id as string
  const { language, t } = useLanguage()
  const { isAuthenticated, clientProfile, serviceProviderProfile, currentUserType } = useAuth()

  // Check if viewing own profile
  const isOwnProfile = currentUserType === 'service_provider' && serviceProviderProfile?.id === providerId

  const [provider, setProvider] = useState<ServiceProviderProfile | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [canEditMyReview, setCanEditMyReview] = useState(false)
  const [editTimeRemaining, setEditTimeRemaining] = useState({ days: 0, hours: 0 })
  const [showDeleteReviewDialog, setShowDeleteReviewDialog] = useState(false)
  const [isDeletingReview, setIsDeletingReview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShareToast, setShowShareToast] = useState(false)
  const [imageViewerOpen, setImageViewerOpen] = useState(false)
  const [imageViewerIndex, setImageViewerIndex] = useState(0)

  // Dynamic translation hooks - must be called unconditionally before any early returns
  const descriptionRaw = provider?.bio || provider?.about_me
  // Specialty removed - using category instead
  const categoryLabel = provider?.category ? getCategoryLabel(provider.category, language) : null

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        // Fetch provider with user's phone number
        const { data, error } = await supabase
          .from('service_provider_profiles')
          .select('*, user:user_id(phone_number)')
          .eq('id', providerId)
          .single()

        if (error) throw error
        
        // Extract phone number from joined user table
        const rawData = data as any
        const userData = rawData.user as { phone_number?: string } | null
        const providerData = {
          ...rawData,
          phone_number: userData?.phone_number || rawData.phone || rawData.phone_number,
        }
        delete providerData.user
        setProvider(providerData)

        // Fetch reviews
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            *,
            client:client_profiles(id, name, surname, avatar_url)
          `)
          .eq('service_provider_id', providerId)
          .order('created_at', { ascending: false })
          .limit(5)

        setReviews(reviewsData || [])

        // Check if favorited and fetch user's own review
        if (clientProfile && currentUserType === 'client') {
          const [favResult, myReviewResult] = await Promise.all([
            supabase
              .from('favorites')
              .select('id')
              .eq('client_id', clientProfile.id)
              .eq('service_provider_id', providerId)
              .single(),
            getMyReviewForProvider(clientProfile.id, providerId)
          ])
          
          setIsFavorite(!!favResult.data)
          setMyReview(myReviewResult.review)
          setCanEditMyReview(myReviewResult.canEdit)
          setEditTimeRemaining({ days: myReviewResult.daysRemaining, hours: myReviewResult.hoursRemaining })
        } else if (clientProfile) {
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('client_id', clientProfile.id)
            .eq('service_provider_id', providerId)
            .single()
          
          setIsFavorite(!!favData)
        }
      } catch (error) {
        console.error('Error fetching provider:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProvider()
  }, [providerId, clientProfile])

  const handleFavorite = async () => {
    if (!isAuthenticated || !clientProfile) {
      router.push('/login')
      return
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('client_id', clientProfile.id)
          .eq('service_provider_id', providerId)
      } else {
        await supabase
          .from('favorites')
          .insert({ client_id: clientProfile.id, service_provider_id: providerId })
      }
      setIsFavorite(!isFavorite)
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
  }

  const handleDeleteReview = async () => {
    if (!myReview) return
    
    setIsDeletingReview(true)
    try {
      await deleteReviewApi(myReview.id)
      setMyReview(null)
      setCanEditMyReview(false)
      setReviews(reviews.filter(r => r.id !== myReview.id))
      setShowDeleteReviewDialog(false)
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setIsDeletingReview(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/providers/${providerId}`
    const text = `Check out ${provider?.name} on Tool Connect`
    
    if (navigator.share) {
      try {
        await navigator.share({ title: text, url })
      } catch (error) {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url)
      setShowShareToast(true)
      setTimeout(() => setShowShareToast(false), 2000)
    }
  }

  const handleMessage = () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    router.push(`/messages?provider=${providerId}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Provider not found</h1>
        <Button onClick={() => router.push('/search')}>
          Back to Search
        </Button>
      </div>
    )
  }

  const rating = provider.average_rating ? Math.round(provider.average_rating * 10) / 10 : null
  const location = provider.city && provider.country 
    ? `${provider.city}, ${provider.country}`
    : provider.city || provider.country || provider.location
  
  // Get phone number - check multiple possible field names
  const phoneNumber = provider.phone || provider.phone_number || (provider as any).phone_number
  // Phone is visible if phone_visible is true (defaults to true for service providers)
  const isPhoneVisible = provider.phone_visible === true || provider.phone_visible === undefined

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-br from-primary-200 to-primary-100">
        {provider.background_image_url && (
          <img
            src={provider.background_image_url}
            alt=""
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* Share button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur rounded-full shadow-md hover:bg-white transition-colors"
        >
          <Share2 className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-24">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Avatar */}
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-lg overflow-hidden flex-shrink-0 -mt-16 sm:-mt-20 bg-white">
              {provider.avatar_url ? (
                <img
                  src={provider.avatar_url}
                  alt={provider.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-100 flex items-center justify-center">
                  <span className="text-4xl font-bold text-primary-700">
                    {provider.name?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {provider.name} {provider.surname}
                  </h1>
                  {categoryLabel && (
                    <p className="text-primary-700 font-medium">{categoryLabel}</p>
                  )}
                </div>
                <span className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                  provider.type === 'company' 
                    ? "bg-blue-100 text-blue-700" 
                    : "bg-green-100 text-green-700"
                )}>
                  {provider.type === 'company' ? <Building2 className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  {provider.type === 'company' ? t('search.company') : t('search.selfEmployed')}
                </span>
              </div>

              {provider.company_name && (
                <p className="text-gray-600 mt-1">{provider.company_name}</p>
              )}

              {/* Rating & Location */}
              <div className="flex flex-wrap items-center gap-4 mt-3">
                {rating !== null ? (
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-primary-600 fill-current" />
                    <span className="font-semibold text-gray-900">{rating}</span>
                    <span className="text-gray-500">
                      ({provider.total_reviews || 0} {t('provider.reviews')})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-400">{t('provider.noRating')}</span>
                )}

                {location && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Services */}
            {provider.category ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.services')}</h2>
                <div className="bg-primary-700 rounded-xl p-4">
                  <p className="text-white font-medium">
                    {getCategoryLabel(provider.category, language)}
                  </p>
                  {provider.services && provider.services.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {provider.services.map((service, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-white/20 text-white text-sm rounded-lg"
                        >
                          {getSubcategoryLabel(provider.category!, service, language)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.services')}</h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat služby' : 'Add services'}</span>
                </Link>
              </div>
            )}

            {/* About */}
            {descriptionRaw ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.about')}</h2>
                <TranslatedText 
                  text={descriptionRaw} 
                  className="text-gray-600 leading-relaxed"
                />
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.about')}</h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat popis' : 'Add description'}</span>
                </Link>
              </div>
            )}

            {/* Availability */}
            {(provider as any).availability ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-700" />
                    {language === 'cs' ? 'Dostupnost' : 'Availability'}
                  </h2>
                  {isOwnProfile && (
                    <Link href="/profile/edit" prefetch={false} className="text-primary-700 hover:text-primary-800 text-sm font-medium">
                      {language === 'cs' ? 'Upravit' : 'Edit'}
                    </Link>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">{(provider as any).availability}</p>
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-700" />
                  {language === 'cs' ? 'Dostupnost' : 'Availability'}
                </h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat dostupnost' : 'Add availability'}</span>
                </Link>
              </div>
            )}

            {/* Pricing */}
            {(provider.hourly_rate_min || provider.hourly_rate_max || provider.price_info) ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.pricing')}</h2>
                {(provider.hourly_rate_min || provider.hourly_rate_max) && (
                  <div className="flex items-center gap-2 text-lg">
                    <Wallet className="w-5 h-5 text-primary-700" />
                    <span className="font-semibold text-primary-700">
                      {provider.hourly_rate_min && provider.hourly_rate_max
                        ? `${provider.hourly_rate_min} - ${provider.hourly_rate_max}`
                        : provider.hourly_rate_min || provider.hourly_rate_max}
                      {' CZK'}
                    </span>
                    <span className="text-gray-500">/ {t('provider.perHour')}</span>
                  </div>
                )}
                {provider.price_info && (
                  <p className="text-gray-600 mt-3">{provider.price_info}</p>
                )}
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.pricing')}</h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat ceny' : 'Add pricing'}</span>
                </Link>
              </div>
            )}

            {/* Profile Video */}
            {provider.profile_video_url ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">
                    {language === 'cs' ? 'Video' : 'Video'}
                  </h2>
                  {isOwnProfile && (
                    <Link href="/profile/edit" prefetch={false} className="text-primary-700 hover:text-primary-800 text-sm font-medium">
                      {language === 'cs' ? 'Upravit' : 'Edit'}
                    </Link>
                  )}
                </div>
                <VideoPlayer 
                  src={provider.profile_video_url}
                  className="rounded-xl overflow-hidden"
                />
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {language === 'cs' ? 'Video' : 'Video'}
                </h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat video' : 'Add video'}</span>
                </Link>
              </div>
            )}

            {/* Work Photos */}
            {provider.additional_images && provider.additional_images.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">{t('provider.workPhotos')}</h2>
                  {isOwnProfile && (
                    <Link href="/portfolio" prefetch={false} className="text-primary-700 hover:text-primary-800 text-sm font-medium">
                      {language === 'cs' ? 'Upravit' : 'Edit'}
                    </Link>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {provider.additional_images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setImageViewerIndex(index)
                        setImageViewerOpen(true)
                      }}
                      className="relative w-full aspect-square rounded-xl overflow-hidden group"
                    >
                      <img
                        src={img}
                        alt={`Work ${index + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.workPhotos')}</h2>
                <Link href="/portfolio" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat fotky' : 'Add photos'}</span>
                </Link>
              </div>
            )}

            {/* Image Viewer Modal */}
            <ImageViewer
              images={provider.additional_images || []}
              initialIndex={imageViewerIndex}
              isOpen={imageViewerOpen}
              onClose={() => setImageViewerOpen(false)}
              alt={`${provider.name}'s work`}
            />

            {/* Languages */}
            {provider.languages && provider.languages.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">{t('provider.languages')}</h2>
                  {isOwnProfile && (
                    <Link href="/profile/edit" prefetch={false} className="text-primary-700 hover:text-primary-800 text-sm font-medium">
                      {language === 'cs' ? 'Upravit' : 'Edit'}
                    </Link>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((lang, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm"
                    >
                      {getLanguageLabel(lang, language)}
                    </span>
                  ))}
                </div>
              </div>
            ) : isOwnProfile && (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t('provider.languages')}</h2>
                <Link href="/profile/edit" prefetch={false} className="flex items-center gap-2 text-primary-700 hover:text-primary-800">
                  <Plus className="w-5 h-5" />
                  <span>{language === 'cs' ? 'Přidat jazyky' : 'Add languages'}</span>
                </Link>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">{t('provider.reviews')}</h2>
                {reviews.length > 0 && (
                  <Link href={`/providers/${providerId}/reviews`} prefetch={false} className="text-primary-700 text-sm font-medium flex items-center gap-1">
                    {t('common.seeAll')}
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              {/* User's Own Review (shown first with special styling) */}
              {currentUserType === 'client' && clientProfile && myReview && (
                <div className="mb-4 p-4 bg-primary-50 rounded-xl border-2 border-primary-400">
                  {/* Your Review Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-block px-2 py-0.5 bg-primary-200 text-primary-700 text-xs font-medium rounded-full">
                      {language === 'cs' ? 'Vaše recenze' : 'Your Review'}
                    </span>
                    {canEditMyReview && (
                      <span className="text-xs text-gray-500">
                        {language === 'cs' ? 'Můžete upravit ještě' : 'You can edit for'} {editTimeRemaining.days}d {editTimeRemaining.hours}h
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {(myReview.client?.avatar_url || clientProfile.avatar_url) ? (
                        <img 
                          src={(myReview.client?.avatar_url || clientProfile.avatar_url) ?? undefined} 
                          alt="" 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <span className="text-primary-700 font-medium">
                          {clientProfile.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900">
                          {clientProfile.name} {clientProfile.surname}
                        </p>
                        <span className="text-sm text-gray-500">
                          {formatTimeAgo(myReview.created_at, language)}
                        </span>
                      </div>
                      <div className="mt-1">
                        <Rating value={myReview.rating} size="sm" readonly />
                      </div>
                      {myReview.comment && (
                        <p className="text-gray-600 mt-2">{myReview.comment}</p>
                      )}
                    </div>
                  </div>

                  {/* Edit/Delete Actions */}
                  <div className="flex justify-end gap-4 mt-3 pt-3 border-t border-primary-200">
                    {canEditMyReview && (
                      <Link
                        href={`/providers/${providerId}/write-review`}
                        prefetch={false}
                        className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        <Pencil className="w-4 h-4" />
                        {language === 'cs' ? 'Upravit' : 'Edit'}
                      </Link>
                    )}
                    <button
                      onClick={() => setShowDeleteReviewDialog(true)}
                      className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      {language === 'cs' ? 'Smazat' : 'Delete'}
                    </button>
                  </div>
                </div>
              )}
              
              {/* Other Reviews */}
              {reviews.filter(r => r.id !== myReview?.id).length > 0 ? (
                <div className="space-y-4">
                  {reviews.filter(r => r.id !== myReview?.id).slice(0, myReview ? 2 : 3).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Link 
                          href={review.client?.id ? `/clients/${review.client.id}` : '#'}
                          className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 overflow-hidden hover:ring-2 hover:ring-primary-300 transition-all"
                        >
                          {review.client?.avatar_url ? (
                            <img src={review.client.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-primary-700 font-medium">
                              {review.client?.name?.charAt(0) || '?'}
                            </span>
                          )}
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Link 
                              href={review.client?.id ? `/clients/${review.client.id}` : '#'}
                              className="font-medium text-gray-900 hover:text-primary-700 transition-colors"
                            >
                              {review.client?.name} {review.client?.surname}
                            </Link>
                            <span className="text-sm text-gray-500">
                              {formatTimeAgo(review.created_at, language)}
                            </span>
                          </div>
                            <div className="mt-1">
                              <Rating value={review.rating} size="sm" readonly />
                            </div>
                          {review.comment && (
                            <p className="text-gray-600 mt-2">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : !myReview && (
                <p className="text-gray-500 italic">{language === 'cs' ? 'Zatím žádné recenze' : 'No reviews yet'}</p>
              )}

              {/* Show Write Review button only if:
                  - User is authenticated with a client profile
                  - This is NOT the user's own service provider profile
                  - User hasn't already written a review */}
              {isAuthenticated && clientProfile && serviceProviderProfile?.id !== providerId && !myReview && (
                <Link href={`/providers/${providerId}/write-review`} prefetch={false}>
                  <Button variant="outline" className="w-full mt-4">
                    {t('provider.writeReview')}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Column - Sticky Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-card p-6 sticky top-24">
              {isOwnProfile ? (
                <>
                  {/* Own Profile Actions */}
                  <Link href="/statistics" prefetch={false}>
                    <Button 
                      variant="outline"
                      className="w-full mb-3" 
                      size="lg"
                      leftIcon={<BarChart3 className="w-5 h-5" />}
                    >
                      {language === 'cs' ? 'Statistiky' : 'Statistics'}
                    </Button>
                  </Link>
                  <Link href="/profile/edit" prefetch={false}>
                    <Button 
                      className="w-full mb-3" 
                      size="lg"
                      leftIcon={<Edit className="w-5 h-5" />}
                    >
                      {t('profile.editProfile')}
                    </Button>
                  </Link>
                  <Link href="/settings" prefetch={false}>
                    <Button 
                      variant="ghost"
                      className="w-full" 
                      size="lg"
                    >
                      {t('nav.settings')}
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  {/* Visitor Actions */}
                  <Button 
                    className="w-full mb-3" 
                    size="lg"
                    leftIcon={<MessageSquare className="w-5 h-5" />}
                    onClick={handleMessage}
                  >
                    {t('provider.sendMessage')}
                  </Button>
                  
                  {isPhoneVisible && phoneNumber && (
                    <div className="mb-3">
                      <a href={`tel:${phoneNumber}`}>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          size="lg"
                          leftIcon={<Phone className="w-5 h-5" />}
                        >
                          {phoneNumber}
                        </Button>
                      </a>
                    </div>
                  )}

                  <Button 
                    variant={isFavorite ? 'secondary' : 'ghost'} 
                    className="w-full"
                    size="lg"
                    leftIcon={<Heart className={cn("w-5 h-5", isFavorite && "fill-current text-red-500")} />}
                    onClick={handleFavorite}
                  >
                    {isFavorite ? t('provider.removeFromFavorites') : t('provider.addToFavorites')}
                  </Button>

                  <div className="border-t border-gray-100 mt-4 pt-4">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm">
                      <Flag className="w-4 h-4" />
                      {t('provider.report')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Toast */}
      {showShareToast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          {language === 'cs' ? 'Odkaz zkopírován!' : 'Link copied!'}
        </div>
      )}

      {/* Delete Review Confirmation Dialog */}
      {showDeleteReviewDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'cs' ? 'Smazat recenzi?' : 'Delete Review?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'cs' 
                ? 'Opravdu chcete smazat tuto recenzi? Tuto akci nelze vrátit zpět.'
                : 'Are you sure you want to delete this review? This action cannot be undone.'}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteReviewDialog(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                disabled={isDeletingReview}
              >
                {language === 'cs' ? 'Zrušit' : 'Cancel'}
              </button>
              <button
                onClick={handleDeleteReview}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50"
                disabled={isDeletingReview}
              >
                {isDeletingReview ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  language === 'cs' ? 'Potvrdit' : 'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

