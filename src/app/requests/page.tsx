'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { WorkRequest } from '@/types/database'
import { useCategories } from '@/contexts/CategoriesContext'
import { Button, LoadingSpinner, EmptyState, LoginPromptModal } from '@/components/ui'
import { formatTimeAgo } from '@/lib/utils'
import { 
  Plus, 
  MapPin, 
  Wallet, 
  Clock, 
  ChevronRight,
  FileText,
  Trash2,
  Users,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

type StatusFilter = 'all' | 'active' | 'paused' | 'closed' | 'completed'

interface WorkRequestWithCount extends WorkRequest {
  application_count?: number
}

export default function RequestsPage() {
  const { language, t } = useLanguage()
  const { isAuthenticated, isLoading: authLoading, currentUserType, clientProfile } = useAuth()
  const { getCategoryLabel } = useCategories()

  const [requests, setRequests] = useState<WorkRequestWithCount[]>([])
  const [publicRequests, setPublicRequests] = useState<WorkRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  // Determine if we're in "my requests" mode (authenticated client) or public browse mode
  const isMyRequestsMode = isAuthenticated && currentUserType === 'client' && !!clientProfile

  // Fetch requests — either client's own or all active (public)
  useEffect(() => {
    if (authLoading) return

    const fetchRequests = async () => {
      setIsLoading(true)
      setError(null)
      try {
        if (isMyRequestsMode && clientProfile) {
          // Authenticated client — fetch their own requests
          const { data, error: fetchError } = await supabase
            .from('work_requests')
            .select('*')
            .eq('client_id', clientProfile.id)
            .order('created_at', { ascending: false })

          if (fetchError) throw fetchError

          // Fetch application counts for each request
          const requestsWithCounts = await Promise.all(
            (data || []).map(async (request) => {
              const { count } = await supabase
                .from('work_request_applications')
                .select('*', { count: 'exact', head: true })
                .eq('work_request_id', request.id)

              return { ...request, application_count: count || 0 }
            })
          )

          setRequests(requestsWithCounts)
        } else {
          // Guest or SP — fetch all active public requests
          const { data, error: fetchError } = await supabase
            .from('work_requests')
            .select(`*, client:client_profiles(id, name, surname, avatar_url)`)
            .eq('status', 'active')
            .order('created_at', { ascending: false })
            .limit(50)

          if (fetchError) throw fetchError
          setPublicRequests(data || [])
        }
      } catch (err: any) {
        console.error('Error fetching requests:', err)
        setError(err.message || 'Failed to load requests')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequests()
  }, [clientProfile, isAuthenticated, authLoading, isMyRequestsMode])

  // Handle delete request
  const handleDelete = async (requestId: string) => {
    setIsDeleting(true)
    try {
      const { error: deleteError } = await supabase
        .from('work_requests')
        .delete()
        .eq('id', requestId)
        .eq('client_id', clientProfile?.id) // Extra safety check

      if (deleteError) throw deleteError

      setRequests(prev => prev.filter(r => r.id !== requestId))
      setDeleteRequestId(null)
    } catch (err: any) {
      console.error('Error deleting request:', err)
      setError(err.message || 'Failed to delete request')
    } finally {
      setIsDeleting(false)
    }
  }

  // Filter requests by status
  const filteredRequests = requests.filter(request => {
    if (statusFilter === 'all') return true
    return request.status === statusFilter
  })

  // Get counts for each status
  const statusCounts = {
    all: requests.length,
    active: requests.filter(r => r.status === 'active').length,
    paused: requests.filter(r => r.status === 'paused').length,
    closed: requests.filter(r => r.status === 'closed').length,
    completed: requests.filter(r => r.status === 'completed').length,
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return t('requests.active')
      case 'paused': return t('requests.paused')
      case 'closed': return t('requests.closed')
      case 'completed': return t('requests.completed')
      default: return status
    }
  }

  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: t('requests.all') },
    { value: 'active', label: t('requests.active') },
    { value: 'paused', label: t('requests.paused') },
    { value: 'closed', label: t('requests.closed') },
    { value: 'completed', label: t('requests.completed') },
  ]

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Public browse mode (guest or SP)
  if (!isMyRequestsMode) {
    return (
      <div className="min-h-screen">
        <LoginPromptModal
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          redirectTo="/requests"
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'cs' ? 'Poptávky' : 'Requests'}
              </h1>
              <p className="text-gray-500 mt-1">
                {language === 'cs'
                  ? 'Aktivní poptávky od klientů'
                  : 'Active requests from clients'}
              </p>
            </div>
            <Button
              leftIcon={<Plus className="w-5 h-5" />}
              onClick={() => {
                if (!isAuthenticated) {
                  setShowLoginPrompt(true)
                } else {
                  window.location.href = '/requests/create'
                }
              }}
            >
              {t('requests.createNew')}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : publicRequests.length > 0 ? (
            <div className="flex flex-col gap-3">
              {publicRequests.map((request) => (
                <Link key={request.id} href={`/requests/${request.id}`} prefetch={false}>
                  <div className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Description */}
                        <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                          {request.description}
                        </p>

                        {/* Category */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-md">
                            {getCategoryLabel(request.category, language)}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {request.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{request.location}</span>
                            </div>
                          )}
                          {request.budget && (
                            <div className="flex items-center gap-1">
                              <Wallet className="w-4 h-4" />
                              <span>{request.budget}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(request.created_at, language)}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title={language === 'cs' ? 'Zatím žádné poptávky' : 'No requests yet'}
              description={language === 'cs'
                ? 'Momentálně nejsou žádné aktivní poptávky'
                : 'There are no active requests at the moment'}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'cs' ? 'Moje poptávky' : 'My Requests'}
          </h1>
          <Link href="/requests/create" prefetch={false}>
            <Button leftIcon={<Plus className="w-5 h-5" />}>
              {t('requests.createNew')}
            </Button>
          </Link>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setStatusFilter(option.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                statusFilter === option.value
                  ? "bg-primary-700 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300"
              )}
            >
              {option.label}
              <span className={cn(
                "px-1.5 py-0.5 rounded-full text-xs",
                statusFilter === option.value
                  ? "bg-white/20 text-white"
                  : "bg-gray-100 text-gray-600"
              )}>
                {statusCounts[option.value]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="flex flex-col gap-3">
            {filteredRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md hover:border-primary-200 transition-all">
                <Link href={`/requests/${request.id}`} prefetch={false}>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Status Badge */}
                        <span className={cn("inline-block px-2 py-1 rounded-md text-xs font-medium mb-2", getStatusColor(request.status))}>
                          {getStatusLabel(request.status)}
                        </span>

                        {/* Description */}
                        <p className="text-gray-900 font-medium line-clamp-2 mb-2">
                          {request.description}
                        </p>

                        {/* Category */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded-md">
                            {getCategoryLabel(request.category, language)}
                          </span>
                        </div>

                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          {request.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{request.location}</span>
                            </div>
                          )}
                          {request.budget && (
                            <div className="flex items-center gap-1">
                              <Wallet className="w-4 h-4" />
                              <span>{request.budget}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{formatTimeAgo(request.created_at, language)}</span>
                          </div>
                          {/* Application count */}
                          {(request.application_count ?? 0) > 0 && (
                            <div className="flex items-center gap-1 text-primary-700 font-medium">
                              <Users className="w-4 h-4" />
                              <span>
                                {request.application_count} {language === 'cs' ? 'zájemců' : 'applicants'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    </div>
                  </div>
                </Link>

                {/* Actions */}
                <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
                  <Link href={`/requests/${request.id}/edit`} prefetch={false}>
                    <Button variant="ghost" size="sm">
                      {language === 'cs' ? 'Upravit' : 'Edit'}
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                    onClick={(e) => {
                      e.preventDefault()
                      setDeleteRequestId(request.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : requests.length > 0 ? (
          // Has requests but none match filter
          <EmptyState
            icon={FileText}
            title={language === 'cs' 
              ? `Žádné ${getStatusLabel(statusFilter).toLowerCase()} poptávky`
              : `No ${getStatusLabel(statusFilter).toLowerCase()} requests`
            }
            description={language === 'cs' 
              ? 'Zkuste změnit filtr stavu'
              : 'Try changing the status filter'
            }
            action={
              <Button variant="secondary" onClick={() => setStatusFilter('all')}>
                {language === 'cs' ? 'Zobrazit vše' : 'Show All'}
              </Button>
            }
          />
        ) : (
          // No requests at all
          <EmptyState
            icon={FileText}
            title={language === 'cs' ? 'Žádné poptávky' : 'No requests yet'}
            description={language === 'cs' 
              ? 'Vytvořte svou první pracovní poptávku a najděte poskytovatele služeb'
              : 'Create your first work request and find service providers'
            }
            action={
              <Link href="/requests/create" prefetch={false}>
                <Button leftIcon={<Plus className="w-5 h-5" />}>
                  {t('requests.createNew')}
                </Button>
              </Link>
            }
          />
        )}

        {/* Floating Create Button (mobile) */}
        <Link 
          href="/requests/create"
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-800 transition-colors md:hidden"
        >
          <Plus className="w-6 h-6" />
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteRequestId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
              {language === 'cs' ? 'Smazat poptávku?' : 'Delete request?'}
            </h3>
            <p className="text-gray-600 text-center mb-6">
              {language === 'cs' 
                ? 'Tato akce je nevratná. Poptávka bude trvale odstraněna.'
                : 'This action cannot be undone. The request will be permanently deleted.'
              }
            </p>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setDeleteRequestId(null)}
                disabled={isDeleting}
              >
                {language === 'cs' ? 'Zrušit' : 'Cancel'}
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                onClick={() => handleDelete(deleteRequestId)}
                isLoading={isDeleting}
              >
                {language === 'cs' ? 'Smazat' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
