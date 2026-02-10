'use client'

import React, { useState, useEffect } from 'react'
import {
  FileText,
  Search,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Eye,
} from 'lucide-react'
import { getWorkRequests } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { useCategories } from '@/contexts/CategoriesContext'
import { cn } from '@/lib/utils'

export default function AdminWorkRequestsPage() {
  const { getCategoryLabel } = useCategories()
  const [requests, setRequests] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | 'active' | 'paused' | 'closed' | 'completed'>('all')
  const [selectedRequest, setSelectedRequest] = useState<any>(null)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const { requests: data, total: count } = await getWorkRequests(page, limit, status)
      setRequests(data)
      setTotal(count)
    } catch (error) {
      console.error('Error fetching work requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [page, status])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        )
      case 'completed':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Completed
          </span>
        )
      case 'paused':
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1 w-fit">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Closed
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Work Requests</h1>
        <p className="text-gray-400">View and manage client work requests</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'active', 'paused', 'completed', 'closed'] as const).map((s) => (
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

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-gray-400 text-sm">Total Requests</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{requests.filter(r => r.status === 'active').length}</p>
          <p className="text-gray-400 text-sm">Active (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{requests.filter(r => r.status === 'completed').length}</p>
          <p className="text-gray-400 text-sm">Completed (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-gray-400">{requests.filter(r => r.status === 'closed').length}</p>
          <p className="text-gray-400 text-sm">Closed (this page)</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No work requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Description</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Budget</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Created</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {request.client?.avatar_url ? (
                            <img src={request.client.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-white font-medium">{request.client?.name} {request.client?.surname}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                          {getCategoryLabel(request.category, 'en')}
                        </span>
                        <p className="text-gray-500 text-xs mt-1">{request.subcategory}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-sm truncate max-w-[200px]">{request.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {request.city || request.location || 'Not set'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        {request.budget || 'Not set'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(request.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-white">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg text-white"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Work Request Details</h3>
                <div className="mt-2">{getStatusBadge(selectedRequest.status)}</div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-gray-400 text-sm mb-2">Client</h4>
                <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                    {selectedRequest.client?.avatar_url ? (
                      <img src={selectedRequest.client.avatar_url} alt="" className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedRequest.client?.name} {selectedRequest.client?.surname}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Category</h4>
                  <p className="text-white">{getCategoryLabel(selectedRequest.category, 'en')}</p>
                  <p className="text-gray-500 text-sm">{selectedRequest.subcategory}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Budget</h4>
                  <p className="text-white">{selectedRequest.budget || 'Not specified'}</p>
                </div>
              </div>

              <div>
                <h4 className="text-gray-400 text-sm mb-2">Description</h4>
                <p className="text-gray-300 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Location</h4>
                  <p className="text-white">{selectedRequest.city || selectedRequest.location || 'Not set'}</p>
                </div>
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Created</h4>
                  <p className="text-white">{new Date(selectedRequest.created_at).toLocaleString()}</p>
                </div>
              </div>

              {selectedRequest.expires_at && (
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Expires</h4>
                  <p className="text-white">{new Date(selectedRequest.expires_at).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

