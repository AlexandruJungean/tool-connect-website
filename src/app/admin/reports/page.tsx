'use client'

import React, { useState, useEffect } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  MoreVertical,
  Eye,
  Ban,
} from 'lucide-react'
import { getReports, updateReportStatus, Report } from '@/lib/api/admin'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AdminReportsPage() {
  const { user } = useAuth()
  const [reports, setReports] = useState<Report[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<'all' | 'pending' | 'reviewed' | 'dismissed'>('all')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchReports = async () => {
    setIsLoading(true)
    try {
      const { reports: data, total: count } = await getReports(page, limit, status)
      setReports(data)
      setTotal(count)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [page, status])

  const handleUpdateStatus = async (reportId: string, newStatus: 'reviewed' | 'dismissed') => {
    if (!user) return
    setActionLoading(true)
    try {
      await updateReportStatus(reportId, newStatus, user.id)
      fetchReports()
      setSelectedReport(null)
    } catch (error) {
      console.error('Error updating report:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'reviewed':
        return (
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" />
            Reviewed
          </span>
        )
      case 'dismissed':
        return (
          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" />
            Dismissed
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-400">Review and manage user reports against service providers</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'reviewed', 'dismissed'] as const).map((s) => (
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
            {s === 'pending' && reports.filter(r => !r.status || r.status === 'pending').length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {reports.filter(r => !r.status || r.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Reporter</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Reported Provider</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Reason</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {report.reporter?.avatar_url ? (
                            <img src={report.reporter.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {report.reporter?.name} {report.reporter?.surname}
                          </p>
                          <p className="text-gray-500 text-xs">Client</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                          {report.reported_provider?.avatar_url ? (
                            <img src={report.reported_provider.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {report.reported_provider?.name} {report.reported_provider?.surname}
                          </p>
                          <p className="text-gray-500 text-xs">{report.reported_provider?.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-white text-sm font-medium">{report.reason}</p>
                      {report.details && (
                        <p className="text-gray-400 text-xs mt-1 truncate max-w-[200px]" title={report.details}>
                          {report.details}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-400 text-sm">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(report.created_at).toLocaleTimeString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(!report.status || report.status === 'pending') && (
                          <button
                            onClick={() => setOpenDropdown(openDropdown === report.id ? null : report.id)}
                            className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        )}
                        {openDropdown === report.id && (
                          <>
                            <div className="fixed inset-0" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute right-0 mt-1 top-full w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'reviewed')}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-green-400 hover:bg-gray-800 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Reviewed
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-gray-400 hover:bg-gray-800 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4" />
                                Dismiss Report
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

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Report Details</h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg text-gray-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Reporter */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Reporter</h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                      {selectedReport.reporter?.avatar_url ? (
                        <img src={selectedReport.reporter.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {selectedReport.reporter?.name} {selectedReport.reporter?.surname}
                      </p>
                      <p className="text-gray-400 text-sm">Client</p>
                    </div>
                  </div>
                </div>

                {/* Reported Provider */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Reported Provider</h4>
                  <div className="flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-gray-600 flex items-center justify-center overflow-hidden">
                      {selectedReport.reported_provider?.avatar_url ? (
                        <img src={selectedReport.reported_provider.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Briefcase className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium">
                        {selectedReport.reported_provider?.name} {selectedReport.reported_provider?.surname}
                      </p>
                      <p className="text-gray-400 text-sm">{selectedReport.reported_provider?.specialty}</p>
                    </div>
                    <a
                      href={`/providers/${selectedReport.reported_service_provider_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg"
                    >
                      View Profile
                    </a>
                  </div>
                </div>

                {/* Report Details */}
                <div>
                  <h4 className="text-gray-400 text-sm mb-2">Reason</h4>
                  <p className="text-white p-3 bg-gray-700/50 rounded-lg">{selectedReport.reason}</p>
                </div>

                {selectedReport.details && (
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Additional Details</h4>
                    <p className="text-gray-300 p-3 bg-gray-700/50 rounded-lg whitespace-pre-wrap">
                      {selectedReport.details}
                    </p>
                  </div>
                )}

                {/* Status & Date */}
                <div className="flex gap-4">
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Status</h4>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Reported On</h4>
                    <p className="text-white text-sm">
                      {new Date(selectedReport.created_at).toLocaleString()}
                    </p>
                  </div>
                  {selectedReport.reviewed_at && (
                    <div>
                      <h4 className="text-gray-400 text-sm mb-2">Reviewed On</h4>
                      <p className="text-white text-sm">
                        {new Date(selectedReport.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {(!selectedReport.status || selectedReport.status === 'pending') && (
                  <div className="flex gap-3 pt-4 border-t border-gray-700">
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'dismissed')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Dismiss
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(selectedReport.id, 'reviewed')}
                      disabled={actionLoading}
                      className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      {actionLoading && <LoadingSpinner size="sm" />}
                      <CheckCircle className="w-4 h-4" />
                      Mark Reviewed
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

