'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Briefcase, Search, Filter } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner, EmptyState, SearchBar, Tabs } from '@/components/ui'
import { RequestCard, AlertCard } from '@/components/cards'
import { supabase } from '@/lib/supabase'
import { useCategories } from '@/contexts/CategoriesContext'

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
  client_id: string
}

interface Application {
  id: string
  work_request_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  work_request?: WorkRequest
}

export default function ApplyPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const { categories, getCategoryLabel } = useCategories()
  const { serviceProviderProfile } = useAuth()

  const [activeTab, setActiveTab] = useState<'browse' | 'applied'>('browse')
  const [requests, setRequests] = useState<WorkRequest[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  // Initialize with provider's category so it's pre-selected
  const [selectedCategory, setSelectedCategory] = useState<string>(
    serviceProviderProfile?.category || ''
  )

  const t = {
    title: language === 'cs' ? 'Najít práci' : 'Find Work',
    browse: language === 'cs' ? 'Procházet' : 'Browse',
    applied: language === 'cs' ? 'Přihlášené' : 'Applied',
    emptyBrowse: language === 'cs' ? 'Žádné dostupné požadavky' : 'No Available Requests',
    emptyBrowseDesc: language === 'cs' 
      ? 'Zatím nejsou žádné otevřené pracovní požadavky ve vaší kategorii'
      : 'There are no open work requests in your category yet',
    emptyApplied: language === 'cs' ? 'Žádné přihlášky' : 'No Applications',
    emptyAppliedDesc: language === 'cs' 
      ? 'Zatím jste se nepřihlásili k žádným požadavkům'
      : 'You haven\'t applied to any requests yet',
    searchPlaceholder: language === 'cs' ? 'Hledat požadavky...' : 'Search requests...',
    allCategories: language === 'cs' ? 'Všechny kategorie' : 'All Categories',
    noProviderProfile: language === 'cs' 
      ? 'Pro procházení požadavků potřebujete profil poskytovatele'
      : 'You need a provider profile to browse requests',
  }

  const fetchRequests = useCallback(async () => {
    if (!serviceProviderProfile) return

    setIsLoading(true)
    try {
      let query = supabase
        .from('work_requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false })

      // Filter by category if selected or use provider's category
      const categoryFilter = selectedCategory || serviceProviderProfile.category
      if (categoryFilter) {
        query = query.eq('category', categoryFilter)
      }

      const { data, error } = await query

      if (error) throw error
      setRequests((data || []) as WorkRequest[])
    } catch (err) {
      console.error('Failed to fetch requests:', err)
    } finally {
      setIsLoading(false)
    }
  }, [serviceProviderProfile, selectedCategory])

  const fetchApplications = useCallback(async () => {
    if (!serviceProviderProfile) return

    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          work_requests (*)
        `)
        .eq('service_provider_id', serviceProviderProfile.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      const apps = (data || []).map((app: Record<string, unknown>) => ({
        ...app,
        work_request: app.work_requests as WorkRequest,
      })) as Application[]
      
      setApplications(apps)
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    }
  }, [serviceProviderProfile])

  // Set provider's category when profile loads
  useEffect(() => {
    if (serviceProviderProfile?.category && !selectedCategory) {
      setSelectedCategory(serviceProviderProfile.category)
    }
  }, [serviceProviderProfile?.category, selectedCategory])

  useEffect(() => {
    if (activeTab === 'browse') {
      fetchRequests()
    } else {
      fetchApplications()
    }
  }, [activeTab, fetchRequests, fetchApplications])

  const filteredRequests = requests.filter((request) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      request.title.toLowerCase().includes(query) ||
      request.description?.toLowerCase().includes(query) ||
      request.location?.toLowerCase().includes(query)
    )
  })

  const categoryOptions = [
    { value: '', label: t.allCategories },
    ...categories.map((cat) => ({
      value: cat.value,
      label: getCategoryLabel(cat.value, language as 'en' | 'cs'),
    })),
  ]

  if (!serviceProviderProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <AlertCard variant="info" message={t.noProviderProfile} />
      </div>
    )
  }

  const tabs = [
    { id: 'browse', label: t.browse, count: filteredRequests.length },
    { id: 'applied', label: t.applied, count: applications.length },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 mb-4">{t.title}</h1>
          
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={(id) => setActiveTab(id as 'browse' | 'applied')}
            variant="pills"
          />
        </div>
      </div>

      {/* Filters (Browse tab only) */}
      {activeTab === 'browse' && (
        <div className="bg-white border-b">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3">
            <div className="flex-1">
              <SearchBar
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder={t.searchPlaceholder}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : activeTab === 'browse' ? (
          filteredRequests.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={t.emptyBrowse}
              description={t.emptyBrowseDesc}
            />
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
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
          )
        ) : applications.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title={t.emptyApplied}
            description={t.emptyAppliedDesc}
            actionLabel={t.browse}
            onAction={() => setActiveTab('browse')}
          />
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              app.work_request && (
                <RequestCard
                  key={app.id}
                  id={app.work_request.id}
                  title={app.work_request.title}
                  description={app.work_request.description}
                  category={app.work_request.category}
                  subcategory={app.work_request.subcategory}
                  location={app.work_request.location}
                  budget={app.work_request.budget}
                  expiresAt={app.work_request.expires_at}
                  status={app.work_request.status}
                  createdAt={app.work_request.created_at}
                  language={language as 'en' | 'cs'}
                />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

