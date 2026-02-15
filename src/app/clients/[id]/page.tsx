'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Briefcase, 
  MessageCircle, 
  Flag, 
  Phone, 
  Globe, 
  CheckCircle, 
  XCircle,
  Star,
  Loader2,
  Edit,
  Settings,
  LogOut,
  ArrowRight
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button, LoadingSpinner, Avatar, Badge, EmptyState } from '@/components/ui'
import { Rating } from '@/components/ui/Rating'
import { AlertCard, RequestCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'
import { isBlockedByOrBlocking } from '@/lib/api/blocks'
import { getReviewsByClientId, ReviewWithProvider } from '@/lib/api/reviews'
import { formatTimeAgo } from '@/lib/utils'
import { getLanguageLabel } from '@/constants/categories'

interface ClientProfile {
  id: string
  user_id: string
  name: string
  surname?: string
  avatar_url?: string
  location?: string
  phone_number?: string
  phone_visible?: boolean
  languages?: string[]
  is_active?: boolean
  created_at: string
}

interface WorkRequest {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  location?: string
  budget?: string
  expires_at?: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
}

interface Props {
  params: Promise<{ id: string }>
}

export default function ClientProfilePage({ params }: Props) {
  const { id: clientId } = use(params)
  const router = useRouter()
  const { language, t: langT } = useLanguage()
  const { user, serviceProviderProfile, clientProfile: ownClientProfile, currentUserType, setCurrentUserType, signOut } = useAuth()

  const [client, setClient] = useState<ClientProfile | null>(null)
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [clientReviews, setClientReviews] = useState<ReviewWithProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isBlocked, setIsBlocked] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)

  // Check if viewing own profile
  const isOwnProfile = ownClientProfile?.id === clientId

  const t = {
    title: language === 'cs' ? 'Profil klienta' : 'Client Profile',
    memberSince: language === 'cs' ? 'Členem od' : 'Member since',
    memberFor: language === 'cs' ? 'Členem' : 'Member for',
    requests: language === 'cs' ? 'Požadavky' : 'Requests',
    openRequests: language === 'cs' ? 'Otevřené požadavky' : 'Open Requests',
    noRequests: language === 'cs' ? 'Žádné požadavky' : 'No Requests',
    noRequestsDesc: language === 'cs' 
      ? 'Tento klient zatím nevytvořil žádné požadavky'
      : 'This client hasn\'t created any requests yet',
    message: language === 'cs' ? 'Napsat zprávu' : 'Send Message',
    report: language === 'cs' ? 'Nahlásit' : 'Report',
    notFound: language === 'cs' ? 'Klient nenalezen' : 'Client not found',
    blocked: language === 'cs' 
      ? 'Tento profil není dostupný'
      : 'This profile is not available',
    phoneNumber: language === 'cs' ? 'Telefonní číslo' : 'Phone Number',
    languages: language === 'cs' ? 'Jazyky' : 'Languages',
    accountStatus: language === 'cs' ? 'Stav účtu' : 'Account Status',
    activeAccount: language === 'cs' ? 'Aktivní účet' : 'Active Account',
    inactiveAccount: language === 'cs' ? 'Neaktivní účet' : 'Inactive Account',
    reviewsSent: language === 'cs' ? 'Odeslané recenze' : 'Reviews Sent',
    noReviewsSent: language === 'cs' ? 'Zatím žádné recenze' : 'No reviews sent yet',
    reviewTo: language === 'cs' ? 'Recenze pro' : 'Review for',
    editProfile: language === 'cs' ? 'Upravit profil' : 'Edit Profile',
    settings: language === 'cs' ? 'Nastavení' : 'Settings',
    switchToProvider: language === 'cs' ? 'Přepnout na poskytovatele' : 'Switch to Provider',
    signOut: language === 'cs' ? 'Odhlásit se' : 'Sign Out',
    myProfile: language === 'cs' ? 'Můj profil' : 'My Profile',
  }

  // Check if user has a service provider profile to switch to
  const hasProviderProfile = !!serviceProviderProfile

  // Handle switching to provider profile
  const handleSwitchToProvider = () => {
    if (serviceProviderProfile) {
      setCurrentUserType('service_provider')
      router.push(`/providers/${serviceProviderProfile.id}`)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if blocked
        if (user) {
          const blocked = await isBlockedByOrBlocking(user.id, clientId)
          if (blocked) {
            setIsBlocked(true)
            setIsLoading(false)
            return
          }
        }

        // Fetch client profile with phone number from users table
        const { data: clientData, error: clientError } = await supabase
          .from('client_profiles')
          .select('*, users:user_id(phone_number)')
          .eq('id', clientId)
          .single()

        if (clientError) throw clientError

        // Extract phone_number from joined users table
        const rawData = clientData as any
        const userData = rawData.users as { phone_number?: string } | null
        const { users, ...profileData } = rawData
        const clientWithPhone = {
          ...profileData,
          phone_number: userData?.phone_number,
        } as ClientProfile

        setClient(clientWithPhone)

        // Fetch client's open requests
        const { data: requestsData } = await supabase
          .from('work_requests')
          .select('*')
          .eq('client_id', clientId)
          .eq('status', 'open')
          .order('created_at', { ascending: false })
          .limit(10)

        setRequests((requestsData || []) as WorkRequest[])

        // Fetch reviews sent by this client
        const reviews = await getReviewsByClientId(clientId)
        setClientReviews(reviews)
      } catch (err) {
        console.error('Failed to fetch client:', err)
        setError(t.notFound)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [clientId, user, t.notFound])

  const handleMessage = async () => {
    if (!serviceProviderProfile || !client) return

    setIsStartingChat(true)
    try {
      // Check if conversation exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('service_provider_id', serviceProviderProfile.id)
        .eq('client_id', clientId)
        .single()

      if (existingConvo) {
        router.push(`/messages?conversation=${existingConvo.id}`)
      } else {
        // Create new conversation
        const { data: newConvo } = await supabase
          .from('conversations')
          .insert({
            service_provider_id: serviceProviderProfile.id,
            client_id: clientId,
          })
          .select('id')
          .single()

        if (newConvo) {
          router.push(`/messages?conversation=${newConvo.id}`)
        }
      }
    } catch (err) {
      console.error('Failed to start conversation:', err)
    } finally {
      setIsStartingChat(false)
    }
  }

  // Calculate member duration
  const getMemberDuration = (createdAt: string) => {
    const created = new Date(createdAt)
    const now = new Date()
    const diffMs = now.getTime() - created.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays < 30) {
      return language === 'cs' ? `${diffDays} dní` : `${diffDays} days`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return language === 'cs' ? `${months} měsíců` : `${months} months`
    } else {
      const years = Math.floor(diffDays / 365)
      return language === 'cs' ? `${years} let` : `${years} years`
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard variant="warning" message={t.blocked} />
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <AlertCard variant="error" message={error || t.notFound} />
      </div>
    )
  }

  const fullName = client.surname 
    ? `${client.name} ${client.surname}` 
    : client.name

  // Phone is visible if:
  // 1. Viewing own profile, OR
  // 2. Current user is a service provider (has service provider profile) AND phone_visible is true
  // Note: Other clients cannot see the phone number even if phone_visible is true
  const showPhone = client.phone_number && (
    isOwnProfile || 
    (currentUserType === 'service_provider' && serviceProviderProfile && client.phone_visible)
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold">{isOwnProfile ? t.myProfile : t.title}</h1>
          </div>
          {user && !isOwnProfile && (
            <button
              onClick={() => router.push(`/report?userId=${client.user_id}`)}
              className="p-2 hover:bg-gray-100 rounded-full"
              title={t.report}
            >
              <Flag className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-sm pb-6">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col items-center pt-6">
            <Avatar
              src={client.avatar_url}
              fallbackInitials={`${client.name?.[0] || ''}${client.surname?.[0] || ''}`}
              size="xl"
            />
            <h2 className="text-xl font-bold text-gray-900 mt-4">{fullName}</h2>
            
            <div className="flex flex-wrap justify-center gap-4 mt-3 text-sm text-gray-500">
              {client.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{client.location}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{t.memberFor} {getMemberDuration(client.created_at)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile ? (
              <div className="flex gap-3 mt-6">
                <Link href="/profile/edit">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    {t.editProfile}
                  </Button>
                </Link>
              </div>
            ) : serviceProviderProfile && (
              <div className="flex gap-3 mt-6">
                <Button onClick={handleMessage} disabled={isStartingChat}>
                  {isStartingChat ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  {t.message}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Phone Number */}
        {showPhone && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.phoneNumber}</h3>
            <a 
              href={`tel:${client.phone_number}`}
              className="flex items-center gap-3 p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
            >
              <Phone className="w-5 h-5 text-primary-700" />
              <span className="font-medium text-primary-700">{client.phone_number}</span>
            </a>
          </div>
        )}

        {/* Languages */}
        {client.languages && client.languages.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.languages}</h3>
            <div className="flex flex-wrap gap-2">
              {client.languages.map((lang, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium"
                >
                  <Globe className="w-4 h-4" />
                  {getLanguageLabel(lang, language)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Account Status */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.accountStatus}</h3>
          <div className="flex items-center gap-2">
            {client.is_active !== false ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-gray-700">{t.activeAccount}</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-gray-700">{t.inactiveAccount}</span>
              </>
            )}
          </div>
        </div>

        {/* Reviews Sent by Client */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">
            {t.reviewsSent} ({clientReviews.length})
          </h3>
          
          {clientReviews.length > 0 ? (
            <div className="space-y-4">
              {clientReviews.map((review) => (
                <div key={review.id} className="border border-gray-100 rounded-lg p-4">
                  {/* Header with rating */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                        {client.avatar_url ? (
                          <img 
                            src={client.avatar_url} 
                            alt="" 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <span className="text-primary-700 font-medium">
                            {client.name?.[0] || '?'}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{fullName}</p>
                        <Rating value={review.rating} size="sm" readonly />
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatTimeAgo(review.created_at, language)}
                    </span>
                  </div>

                  {/* Review for provider */}
                  {review.provider && (
                    <Link
                      href={`/providers/${review.provider.id}`}
                      className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-700 mb-2"
                    >
                      <span>{t.reviewTo}</span>
                      <span className="font-medium text-primary-700">
                        {review.provider.name} {review.provider.surname}
                      </span>
                    </Link>
                  )}

                  {/* Comment */}
                  {review.comment && (
                    <p className="text-gray-600 text-sm leading-relaxed mt-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">{t.noReviewsSent}</p>
          )}
        </div>

        {/* Open Requests */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t.openRequests}
            {requests.length > 0 && (
              <Badge className="ml-2" variant="info">{requests.length}</Badge>
            )}
          </h3>

          {requests.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t.noRequests}
              description={t.noRequestsDesc}
            />
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestCard
                  key={request.id}
                  id={request.id}
                  title={request.title}
                  description={request.description}
                  category={request.category}
                  subcategory={request.subcategory}
                  location={request.location}
                  budget={request.budget}
                  expiresAt={request.expires_at}
                  status={request.status}
                  createdAt={request.created_at}
                  language={language as 'en' | 'cs'}
                />
              ))}
            </div>
          )}
        </div>

        {/* Profile Management Options (only for own profile) */}
        {isOwnProfile && (
          <div className="bg-white rounded-xl shadow-sm divide-y divide-gray-100">
            <Link 
              href="/settings" 
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">{t.settings}</span>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </Link>

            {hasProviderProfile && (
              <button 
                onClick={handleSwitchToProvider}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-primary-700" />
                  </div>
                  <span className="font-medium text-gray-900">{t.switchToProvider}</span>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400" />
              </button>
            )}

            <button 
              onClick={handleSignOut}
              className="w-full flex items-center justify-between p-4 hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOut className="w-5 h-5 text-red-600" />
                </div>
                <span className="font-medium text-red-600">{t.signOut}</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
