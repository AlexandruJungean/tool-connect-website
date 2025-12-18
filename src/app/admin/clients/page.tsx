'use client'

import React, { useState, useEffect } from 'react'
import {
  Search,
  UserCircle,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Languages,
  Heart,
  MessageSquare,
  FileText,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ClientProfile {
  id: string
  user_id: string
  name: string
  surname: string | null
  avatar_url: string | null
  bio: string | null
  location: string | null
  city: string | null
  country: string | null
  languages: string[]
  profile_completed: boolean
  is_active: boolean
  created_at: string
  users?: {
    phone_number: string
    email: string | null
    is_banned: boolean
    last_active_at: string | null
  }
  _count?: {
    favorites: number
    conversations: number
    work_requests: number
  }
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<ClientProfile[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'complete' | 'incomplete' | 'active'>('all')

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('client_profiles')
        .select('*, users!inner(phone_number, email, is_banned, last_active_at)', { count: 'exact' })

      if (search) {
        query = query.or(`name.ilike.%${search}%,city.ilike.%${search}%`)
      }

      if (filter === 'complete') {
        query = query.eq('profile_completed', true)
      } else if (filter === 'incomplete') {
        query = query.eq('profile_completed', false)
      } else if (filter === 'active') {
        query = query.eq('is_active', true)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      // Get counts for each client
      const clientsWithCounts = await Promise.all((data || []).map(async (client) => {
        const [favRes, convoRes, wrRes] = await Promise.all([
          supabase.from('favorites').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
          supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
          supabase.from('work_requests').select('id', { count: 'exact', head: true }).eq('client_id', client.id),
        ])
        return {
          ...client,
          _count: {
            favorites: favRes.count || 0,
            conversations: convoRes.count || 0,
            work_requests: wrRes.count || 0,
          },
        }
      }))

      setClients(clientsWithCounts)
      setTotal(count || 0)
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClients()
  }, [page, filter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchClients()
      else setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Client Profiles</h1>
        <p className="text-gray-400">View and manage client accounts</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'complete', 'incomplete', 'active'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1) }}
              className={cn(
                'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize',
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-gray-400 text-sm">Total Clients</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{clients.filter(c => c.profile_completed).length}</p>
          <p className="text-gray-400 text-sm">Complete (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{clients.filter(c => !c.profile_completed).length}</p>
          <p className="text-gray-400 text-sm">Incomplete (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{clients.filter(c => c.is_active).length}</p>
          <p className="text-gray-400 text-sm">Active (this page)</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12">
            <UserCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No clients found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Location</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Languages</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Activity</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {client.avatar_url ? (
                            <img src={client.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{client.name} {client.surname}</p>
                          <p className="text-gray-500 text-xs">{client.users?.phone_number}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        {client.city || client.location || 'Not set'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Languages className="w-4 h-4 text-gray-500" />
                        {client.languages?.length > 0 ? client.languages.slice(0, 3).join(', ') : 'Not set'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3 text-sm">
                        <span className="flex items-center gap-1 text-red-400">
                          <Heart className="w-3 h-3" />
                          {client._count?.favorites || 0}
                        </span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <MessageSquare className="w-3 h-3" />
                          {client._count?.conversations || 0}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <FileText className="w-3 h-3" />
                          {client._count?.work_requests || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {client.profile_completed ? (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs">Complete</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-xs">Incomplete</span>
                        )}
                        {client.users?.is_banned && (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Banned</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(client.created_at).toLocaleDateString()}
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

