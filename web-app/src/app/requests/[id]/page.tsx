'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { WorkRequest, Application } from '@/types/database'
import { getCategoryLabel, getSubcategoryLabel } from '@/constants/categories'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatDate, formatTimeAgo } from '@/lib/utils'
import { TranslatedText } from '@/components/ui/TranslatedText'
import Link from 'next/link'
import { 
  ArrowLeft,
  MapPin,
  Wallet,
  Clock,
  User,
  MessageSquare,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string
  const { language, t } = useLanguage()
  const { isAuthenticated, currentUserType, clientProfile, serviceProviderProfile } = useAuth()

  const [request, setRequest] = useState<WorkRequest | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [myApplication, setMyApplication] = useState<{ id: string; status: string; message?: string; proposed_price?: string } | null>(null)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [isStartingChat, setIsStartingChat] = useState(false)

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const { data, error } = await supabase
          .from('work_requests')
          .select(`
            *,
            client:client_profiles(id, name, surname, avatar_url)
          `)
          .eq('id', requestId)
          .single()

        if (error) throw error
        setRequest(data)

        // Check if already applied and get application status (for service providers)
        if (serviceProviderProfile) {
          const { data: appData } = await supabase
            .from('applications')
            .select('id, status, message, proposed_price')
            .eq('work_request_id', requestId)
            .eq('service_provider_id', serviceProviderProfile.id)
            .single()

          if (appData) {
            setMyApplication(appData)
          }
        }

        // Fetch applications (for request owner)
        if (clientProfile && data?.client_id === clientProfile.id) {
          const { data: appsData } = await supabase
            .from('applications')
            .select(`
              *,
              service_provider:service_provider_profiles(id, name, surname, avatar_url, average_rating, total_reviews, specialty)
            `)
            .eq('work_request_id', requestId)
            .order('created_at', { ascending: false })

          setApplications(appsData || [])
        }
      } catch (error) {
        console.error('Error fetching request:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [requestId, serviceProviderProfile, clientProfile])

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!serviceProviderProfile || !applicationMessage.trim()) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase.from('applications').insert({
        work_request_id: requestId,
        service_provider_id: serviceProviderProfile.id,
        message: applicationMessage.trim(),
        proposed_price: proposedPrice || null,
      })

      if (error) throw error
      setMyApplication({
        id: '',
        status: 'pending',
        message: applicationMessage.trim(),
        proposed_price: proposedPrice || undefined,
      })
      setShowApplicationForm(false)
    } catch (error) {
      console.error('Error applying:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isOwner = clientProfile && request?.client_id === clientProfile.id
  const canApply = currentUserType === 'service_provider' && !isOwner && !myApplication && request?.status === 'active'

  // Handle message client (for approved applications)
  const handleMessageClient = async () => {
    if (!serviceProviderProfile || !request?.client_id) return

    setIsStartingChat(true)
    try {
      // Check if conversation exists
      const { data: existingConvo } = await supabase
        .from('conversations')
        .select('id')
        .eq('service_provider_id', serviceProviderProfile.id)
        .eq('client_id', request.client_id)
        .single()

      if (existingConvo) {
        router.push(`/messages?conversation=${existingConvo.id}`)
      } else {
        // Create new conversation
        const { data: newConvo } = await supabase
          .from('conversations')
          .insert({
            service_provider_id: serviceProviderProfile.id,
            client_id: request.client_id,
          })
          .select('id')
          .single()

        if (newConvo) {
          router.push(`/messages?conversation=${newConvo.id}`)
        }
      }
    } catch (error) {
      console.error('Failed to start conversation:', error)
    } finally {
      setIsStartingChat(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'paused': return 'bg-amber-100 text-amber-700'
      case 'closed': return 'bg-red-100 text-red-700'
      case 'completed': return 'bg-primary-100 text-primary-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-700" />
      </div>
    )
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Request not found</h1>
        <Button onClick={() => router.push('/requests')}>
          Back to Requests
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          {t('common.back')}
        </button>

        {/* Request Card */}
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={cn("inline-flex px-3 py-1 rounded-full text-sm font-medium", getStatusColor(request.status))}>
              {t(`requests.${request.status}`)}
            </span>
          </div>

          {/* Category & Subcategory */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100/50 rounded-xl p-4 mb-5">
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">
              {language === 'cs' ? 'Kategorie' : 'Category'}
            </p>
            <p className="text-lg font-semibold text-primary-800">
              {getCategoryLabel(request.category, language)}
            </p>
            {request.subcategory && (
              <div className="flex flex-wrap gap-2 mt-3">
                {(Array.isArray(request.subcategory) 
                  ? request.subcategory 
                  : request.subcategory.split(',').map(s => s.trim())
                ).map((sub, index) => (
                  <span 
                    key={index}
                    className="inline-flex px-3 py-1.5 bg-white/80 text-primary-700 text-sm font-medium rounded-lg border border-primary-200 shadow-sm"
                  >
                    {getSubcategoryLabel(request.category, sub, language)}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <TranslatedText 
              text={request.description} 
              className="text-gray-900 text-lg leading-relaxed"
            />
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
            {request.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{request.location}</span>
              </div>
            )}
            {request.budget && (
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-gray-400" />
                <span>{request.budget}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>{formatDate(request.created_at, language)}</span>
            </div>
          </div>

          {/* Client Info */}
          {request.client && !isOwner && (
            <div className="pt-4 border-t border-gray-100">
              <p className="text-sm font-medium text-gray-500 mb-2">
                {language === 'cs' ? 'Zveřejněno' : 'Posted by'}
              </p>
              <Link 
                href={`/clients/${(request.client as any).id}`}
                className="flex items-center gap-3 hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden">
                  {(request.client as any).avatar_url ? (
                    <img src={(request.client as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-primary-700" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900 hover:text-primary-700">
                    {(request.client as any).name} {(request.client as any).surname}
                  </p>
                  <p className="text-sm text-gray-500">
                    {language === 'cs' ? 'Klient' : 'Client'}
                  </p>
                </div>
              </Link>
              {/* Message Client button for approved applications */}
              {myApplication?.status === 'approved' && (
                <Button 
                  className="w-full mt-3"
                  onClick={handleMessageClient}
                  disabled={isStartingChat}
                  leftIcon={isStartingChat ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                >
                  {language === 'cs' ? 'Napsat klientovi' : 'Message Client'}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Apply Section (for service providers) */}
        {canApply && !showApplicationForm && (
          <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => setShowApplicationForm(true)}
              leftIcon={<Send className="w-5 h-5" />}
            >
              {t('requests.apply')}
            </Button>
          </div>
        )}

        {/* Application Form */}
        {showApplicationForm && (
          <form onSubmit={handleApply} className="bg-white rounded-2xl shadow-card p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {language === 'cs' ? 'Vaše odpověď' : 'Your Application'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {language === 'cs' ? 'Zpráva *' : 'Message *'}
                </label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={language === 'cs' ? 'Představte se a popište, jak můžete pomoci...' : 'Introduce yourself and describe how you can help...'}
                  required
                />
              </div>
              <Input
                label={language === 'cs' ? 'Navrhovaná cena (volitelné)' : 'Proposed Price (optional)'}
                value={proposedPrice}
                onChange={(e) => setProposedPrice(e.target.value)}
                placeholder="e.g. 500 CZK"
              />
              <div className="flex gap-3">
                <Button type="submit" isLoading={isSubmitting} className="flex-1">
                  {t('common.submit')}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setShowApplicationForm(false)}>
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Application Status */}
        {myApplication && (
          <div className={cn(
            "rounded-2xl p-6 mb-6 flex items-center gap-4",
            myApplication.status === 'approved' ? "bg-green-50" :
            myApplication.status === 'rejected' ? "bg-red-50" :
            "bg-amber-50"
          )}>
            {myApplication.status === 'approved' ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : myApplication.status === 'rejected' ? (
              <XCircle className="w-8 h-8 text-red-600" />
            ) : (
              <Clock className="w-8 h-8 text-amber-600" />
            )}
            <div>
              <p className={cn(
                "font-medium",
                myApplication.status === 'approved' ? "text-green-900" :
                myApplication.status === 'rejected' ? "text-red-900" :
                "text-amber-900"
              )}>
                {myApplication.status === 'approved' 
                  ? (language === 'cs' ? 'Žádost přijata!' : 'Application Approved!')
                  : myApplication.status === 'rejected'
                  ? (language === 'cs' ? 'Žádost odmítnuta' : 'Application Rejected')
                  : (language === 'cs' ? 'Čeká na odpověď' : 'Pending Response')
                }
              </p>
              <p className={cn(
                "text-sm",
                myApplication.status === 'approved' ? "text-green-700" :
                myApplication.status === 'rejected' ? "text-red-700" :
                "text-amber-700"
              )}>
                {myApplication.status === 'approved' 
                  ? (language === 'cs' 
                    ? 'Klient přijal vaši nabídku. Můžete mu napsat zprávu.'
                    : 'The client accepted your application. You can message them now.'
                  )
                  : myApplication.status === 'rejected'
                  ? (language === 'cs' 
                    ? 'Klient bohužel vybral jiného poskytovatele.'
                    : 'The client chose a different provider.'
                  )
                  : (language === 'cs' 
                    ? 'Klient obdržel vaši odpověď. Vyčkejte na reakci.'
                    : 'The client has received your application. Wait for their response.'
                  )
                }
              </p>
            </div>
          </div>
        )}

        {/* Applications (for request owner) */}
        {isOwner && (
          <div className="bg-white rounded-2xl shadow-card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              {t('requests.applications')} ({applications.length})
            </h3>
            {applications.length > 0 ? (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div key={app.id} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        {(app.service_provider as any)?.avatar_url ? (
                          <img src={(app.service_provider as any).avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-primary-700" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {(app.service_provider as any)?.name} {(app.service_provider as any)?.surname}
                            </p>
                            <p className="text-sm text-gray-500">
                              {(app.service_provider as any)?.specialty}
                            </p>
                          </div>
                          {(app.service_provider as any)?.average_rating && (
                            <div className="flex items-center gap-1 text-primary-600">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium text-gray-900">
                                {Math.round((app.service_provider as any).average_rating * 10) / 10}
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2">{app.message}</p>
                        {app.proposed_price && (
                          <p className="text-primary-700 font-medium mt-2">
                            {language === 'cs' ? 'Navrhovaná cena:' : 'Proposed price:'} {app.proposed_price}
                          </p>
                        )}
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            leftIcon={<MessageSquare className="w-4 h-4" />}
                            onClick={() => router.push(`/messages?provider=${(app.service_provider as any)?.id}`)}
                          >
                            {t('provider.sendMessage')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                {language === 'cs' ? 'Zatím žádné reakce' : 'No applications yet'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

