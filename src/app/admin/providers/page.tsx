'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Star,
  MapPin,
  Phone,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Briefcase,
  XCircle,
} from 'lucide-react'
import { getServiceProviders, toggleProviderVisibility, toggleProviderActive, setScamWarning } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { useCategories } from '@/contexts/CategoriesContext'
import { cn } from '@/lib/utils'

export default function AdminProvidersPage() {
  const { categories, getCategoryLabel } = useCategories()
  const [providers, setProviders] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState<'all' | 'active' | 'inactive' | 'hidden'>('all')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchProviders = async () => {
    setIsLoading(true)
    try {
      const { providers: data, total: count } = await getServiceProviders(page, limit, search, category, status)
      setProviders(data)
      setTotal(count)
    } catch (error) {
      console.error('Error fetching providers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [page, category, status])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchProviders()
      else setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleToggleVisibility = async (providerId: string, currentVisible: boolean) => {
    setActionLoading(true)
    try {
      await toggleProviderVisibility(providerId, !currentVisible)
      fetchProviders()
    } catch (error) {
      console.error('Error toggling visibility:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  const handleToggleActive = async (providerId: string, currentActive: boolean) => {
    setActionLoading(true)
    try {
      await toggleProviderActive(providerId, !currentActive)
      fetchProviders()
    } catch (error) {
      console.error('Error toggling active:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  const handleScamWarning = async (providerId: string, currentWarning: boolean) => {
    setActionLoading(true)
    try {
      await setScamWarning(providerId, !currentWarning)
      fetchProviders()
    } catch (error) {
      console.error('Error setting scam warning:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Service Providers</h1>
        <p className="text-gray-400">Manage service provider profiles and visibility</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, category, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        <div className="flex gap-2">
          {(['all', 'active', 'inactive', 'hidden'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize',
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No providers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Provider</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Rating</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Views</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {providers.map((provider) => (
                  <tr key={provider.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                          {provider.avatar_url ? (
                            <img src={provider.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-white font-medium">{provider.name} {provider.surname}</p>
                            {provider.scam_warning && (
                              <span title="Scam Warning">
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              </span>
                            )}
                          </div>
                          {provider.category && (
                            <p className="text-gray-400 text-sm">{provider.category}</p>
                          )}
                          {provider.type && (
                            <span className="text-xs text-gray-500 capitalize">{provider.type}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                        {getCategoryLabel(provider.category || '', 'en')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {provider.city || provider.location || 'Not set'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-white">{provider.average_rating?.toFixed(1) || '0.0'}</span>
                        <span className="text-gray-500 text-sm">({provider.total_reviews || 0})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {provider.is_active ? (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-600 text-gray-300 rounded text-xs flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Inactive
                          </span>
                        )}
                        {!provider.is_visible && (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1">
                            <EyeOff className="w-3 h-3" />
                            Hidden
                          </span>
                        )}
                        {provider.users?.is_banned && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white">{provider.profile_views_count || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center gap-2">
                        <Link
                          href={`/providers/${provider.id}`}
                          target="_blank"
                          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setOpenDropdown(openDropdown === provider.id ? null : provider.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === provider.id && (
                          <>
                            <div className="fixed inset-0" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute right-0 mt-1 top-full w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                              <button
                                onClick={() => handleToggleVisibility(provider.id, provider.is_visible)}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                              >
                                {provider.is_visible ? (
                                  <>
                                    <EyeOff className="w-4 h-4" />
                                    Hide Profile
                                  </>
                                ) : (
                                  <>
                                    <Eye className="w-4 h-4" />
                                    Show Profile
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleToggleActive(provider.id, provider.is_active)}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2"
                              >
                                {provider.is_active ? (
                                  <>
                                    <XCircle className="w-4 h-4" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="w-4 h-4" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <div className="border-t border-gray-700 my-1" />
                              <button
                                onClick={() => handleScamWarning(provider.id, provider.scam_warning)}
                                disabled={actionLoading}
                                className={cn(
                                  'w-full px-4 py-2 text-left hover:bg-gray-800 flex items-center gap-2',
                                  provider.scam_warning ? 'text-green-400' : 'text-red-400'
                                )}
                              >
                                <AlertTriangle className="w-4 h-4" />
                                {provider.scam_warning ? 'Remove Scam Warning' : 'Add Scam Warning'}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700">
            <p className="text-gray-400 text-sm">
              Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-white">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

