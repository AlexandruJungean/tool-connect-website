'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { getSearchLogs, getPopularSearchCategories, SearchLogEntry, CategoryStats } from '@/lib/api/admin'
import { LoadingSpinner } from '@/components/ui'
import { getCategoryLabel } from '@/constants/categories'
import { cn } from '@/lib/utils'

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

export default function AdminSearchLogsPage() {
  const [logs, setLogs] = useState<SearchLogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [popularCategories, setPopularCategories] = useState<CategoryStats[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)

  const limit = 50
  const totalPages = Math.ceil(total / limit)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [logsData, categoriesData] = await Promise.all([
        getSearchLogs(page, limit),
        getPopularSearchCategories(),
      ])
      setLogs(logsData.logs)
      setTotal(logsData.total)
      setPopularCategories(categoriesData)
    } catch (error) {
      console.error('Error fetching search logs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const formatTime = (date: string) => {
    const d = new Date(date)
    return d.toLocaleString()
  }

  // Calculate stats
  const avgResults = logs.length > 0 
    ? Math.round(logs.reduce((sum, log) => sum + (log.results_count || 0), 0) / logs.length)
    : 0

  const zeroResultSearches = logs.filter(log => log.results_count === 0).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Search Logs</h1>
        <p className="text-gray-400">Analyze user search patterns and behavior</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{total.toLocaleString()}</p>
          <p className="text-gray-400 text-sm">Total Searches</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{avgResults}</p>
          <p className="text-gray-400 text-sm">Avg Results</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{zeroResultSearches}</p>
          <p className="text-gray-400 text-sm">Zero Results (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{popularCategories.length}</p>
          <p className="text-gray-400 text-sm">Categories Searched</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Categories */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Most Searched Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={popularCategories.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="category" 
                  stroke="#9ca3af" 
                  fontSize={10} 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tickFormatter={(v) => getCategoryLabel(v, 'en').slice(0, 12)}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value) => [value as number, 'Searches']}
                  labelFormatter={(label) => getCategoryLabel(String(label), 'en')}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Search Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={popularCategories.slice(0, 8) as any[]}
                  dataKey="count"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ percent }: { percent?: number }) => `${((percent || 0) * 100).toFixed(0)}%`}
                >
                  {popularCategories.slice(0, 8).map((entry, index) => (
                    <Cell key={entry.category} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  formatter={(value, name) => [value as number, getCategoryLabel(String(name), 'en')]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {popularCategories.slice(0, 6).map((cat, idx) => (
              <div key={cat.category} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="text-gray-400">{getCategoryLabel(cat.category, 'en').slice(0, 15)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Searches Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No search logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Subcategory</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Keywords</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Results</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      {log.category ? (
                        <span className="px-2 py-1 bg-primary-500/20 text-primary-400 rounded text-xs">
                          {getCategoryLabel(log.category, 'en')}
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-300 text-sm">{log.subcategory || '-'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {log.location ? (
                        <div className="flex items-center gap-1 text-gray-300 text-sm">
                          <MapPin className="w-3 h-3 text-gray-500" />
                          {log.location}
                          {log.max_distance && <span className="text-gray-500">({log.max_distance}km)</span>}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {log.keywords ? (
                        <span className="text-gray-300 text-sm">"{log.keywords}"</span>
                      ) : (
                        <span className="text-gray-500 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-medium',
                        log.results_count === 0 ? 'text-red-400' : 'text-green-400'
                      )}>
                        {log.results_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {formatTime(log.created_at)}
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
    </div>
  )
}

