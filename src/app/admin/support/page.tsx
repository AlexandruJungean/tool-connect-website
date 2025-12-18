'use client'

import React, { useState, useEffect } from 'react'
import {
  HeadphonesIcon,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  User,
  Phone,
  Mail,
  Smartphone,
  MessageSquare,
} from 'lucide-react'
import { getSupportRequests, updateSupportRequest, SupportRequestAdmin } from '@/lib/api/admin'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AdminSupportPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState<SupportRequestAdmin[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | 'pending' | 'in_progress' | 'resolved' | 'closed'>('all')
  const [priority, setPriority] = useState<'all' | 'low' | 'normal' | 'high' | 'urgent'>('all')
  const [selectedRequest, setSelectedRequest] = useState<SupportRequestAdmin | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchRequests = async () => {
    setIsLoading(true)
    try {
      const { requests: data, total: count } = await getSupportRequests(page, limit, status, priority)
      setRequests(data)
      setTotal(count)
    } catch (error) {
      console.error('Error fetching support requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [page, status, priority])

  const handleUpdateRequest = async (requestId: string, updates: any) => {
    setActionLoading(true)
    try {
      await updateSupportRequest(requestId, updates)
      fetchRequests()
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(null)
      }
    } catch (error) {
      console.error('Error updating request:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Resolved
          </span>
        )
      case 'in_progress':
        return (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            In Progress
          </span>
        )
      case 'closed':
        return (
          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Closed
          </span>
        )
      default:
        return (
          <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        )
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-2 py-0.5 bg-red-500 text-white rounded text-xs">Urgent</span>
      case 'high':
        return <span className="px-2 py-0.5 bg-orange-500 text-white rounded text-xs">High</span>
      case 'normal':
        return <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs">Normal</span>
      default:
        return <span className="px-2 py-0.5 bg-gray-500 text-white rounded text-xs">Low</span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Support Requests</h1>
        <p className="text-gray-400">Manage user support tickets and inquiries</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'pending', 'in_progress', 'resolved', 'closed'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                status === s
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              )}
            >
              {s === 'in_progress' ? 'In Progress' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value as any); setPage(1) }}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
        >
          <option value="all">All Priorities</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{requests.filter(r => r.status === 'pending').length}</p>
          <p className="text-gray-400 text-sm">Pending</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{requests.filter(r => r.status === 'in_progress').length}</p>
          <p className="text-gray-400 text-sm">In Progress</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{requests.filter(r => r.status === 'resolved').length}</p>
          <p className="text-gray-400 text-sm">Resolved</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{requests.filter(r => r.priority === 'urgent').length}</p>
          <p className="text-gray-400 text-sm">Urgent</p>
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
            <HeadphonesIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No support requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Subject</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Priority</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-700/30 cursor-pointer"
                    onClick={() => { setSelectedRequest(request); setAdminNotes(request.admin_notes || '') }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.user_name || 'Anonymous'}</p>
                          <p className="text-gray-500 text-xs">{request.profile_type || 'Guest'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium truncate max-w-[200px]">{request.subject}</p>
                      <p className="text-gray-500 text-xs truncate max-w-[200px]">{request.description}</p>
                    </td>
                    <td className="px-4 py-3">
                      {getPriorityBadge(request.priority)}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-400 text-sm">{new Date(request.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateRequest(request.id, { status: 'in_progress', assigned_to: user?.id })}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg"
                          >
                            Take
                          </button>
                        )}
                        {request.status === 'in_progress' && (
                          <button
                            onClick={() => handleUpdateRequest(request.id, { status: 'resolved', resolved_at: new Date().toISOString() })}
                            disabled={actionLoading}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg"
                          >
                            Resolve
                          </button>
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
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedRequest.subject}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    {getStatusBadge(selectedRequest.status)}
                    {getPriorityBadge(selectedRequest.priority)}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="grid grid-cols-2 gap-4">
                  {selectedRequest.user_name && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-4 h-4 text-gray-500" />
                      {selectedRequest.user_name}
                    </div>
                  )}
                  {selectedRequest.user_email && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Mail className="w-4 h-4 text-gray-500" />
                      {selectedRequest.user_email}
                    </div>
                  )}
                  {selectedRequest.user_phone && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Phone className="w-4 h-4 text-gray-500" />
                      {selectedRequest.user_phone}
                    </div>
                  )}
                  {selectedRequest.device_info && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      {selectedRequest.device_info}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Description</h4>
                  <p className="text-gray-300 p-4 bg-gray-700/50 rounded-lg whitespace-pre-wrap">
                    {selectedRequest.description}
                  </p>
                </div>

                {/* Admin Notes */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Admin Notes</h4>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                    rows={3}
                  />
                  <button
                    onClick={() => handleUpdateRequest(selectedRequest.id, { admin_notes: adminNotes })}
                    disabled={actionLoading}
                    className="mt-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg"
                  >
                    Save Notes
                  </button>
                </div>

                {/* Dates */}
                <div className="flex gap-6 text-sm">
                  <div>
                    <span className="text-gray-500">Created: </span>
                    <span className="text-gray-300">{new Date(selectedRequest.created_at).toLocaleString()}</span>
                  </div>
                  {selectedRequest.resolved_at && (
                    <div>
                      <span className="text-gray-500">Resolved: </span>
                      <span className="text-gray-300">{new Date(selectedRequest.resolved_at).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-700">
                  <select
                    value={selectedRequest.priority}
                    onChange={(e) => handleUpdateRequest(selectedRequest.id, { priority: e.target.value })}
                    className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <select
                    value={selectedRequest.status}
                    onChange={(e) => {
                      const updates: any = { status: e.target.value }
                      if (e.target.value === 'in_progress') updates.assigned_to = user?.id
                      if (e.target.value === 'resolved') updates.resolved_at = new Date().toISOString()
                      handleUpdateRequest(selectedRequest.id, updates)
                    }}
                    className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

