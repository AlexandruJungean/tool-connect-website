'use client'

import React, { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Ban, 
  Shield, 
  ShieldOff, 
  MoreVertical, 
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  Briefcase,
} from 'lucide-react'
import { getUsers, banUser, unbanUser, toggleAdmin, deleteUser, UserWithProfiles } from '@/lib/api/admin'
import { LoadingSpinner, Button, Input } from '@/components/ui'
import { cn } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserWithProfiles[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'admins' | 'banned' | 'active'>('all')
  const [selectedUser, setSelectedUser] = useState<UserWithProfiles | null>(null)
  const [showBanModal, setShowBanModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [banReason, setBanReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const { users: data, total: count } = await getUsers(page, limit, search, filter)
      setUsers(data)
      setTotal(count)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, filter])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) {
        fetchUsers()
      } else {
        setPage(1)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleBan = async () => {
    if (!selectedUser || !banReason.trim()) return
    setActionLoading(true)
    try {
      await banUser(selectedUser.id, banReason)
      setShowBanModal(false)
      setBanReason('')
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error banning user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleUnban = async (user: UserWithProfiles) => {
    setActionLoading(true)
    try {
      await unbanUser(user.id)
      fetchUsers()
    } catch (error) {
      console.error('Error unbanning user:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  const handleToggleAdmin = async (user: UserWithProfiles) => {
    setActionLoading(true)
    try {
      await toggleAdmin(user.id, !user.is_admin)
      fetchUsers()
    } catch (error) {
      console.error('Error toggling admin:', error)
    } finally {
      setActionLoading(false)
      setOpenDropdown(null)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return
    setActionLoading(true)
    try {
      await deleteUser(selectedUser.id)
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400">Manage all users, ban/unban, and set admin permissions</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-primary-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'active', 'banned', 'admins'] as const).map((f) => (
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
          <p className="text-gray-400 text-sm">Total Users</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-green-400">{users.filter(u => !u.is_banned).length}</p>
          <p className="text-gray-400 text-sm">Active (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{users.filter(u => u.is_banned).length}</p>
          <p className="text-gray-400 text-sm">Banned (this page)</p>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-purple-400">{users.filter(u => u.is_admin).length}</p>
          <p className="text-gray-400 text-sm">Admins (this page)</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Contact</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Profiles</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Joined</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {user.client_profile?.avatar_url || user.service_provider_profile?.avatar_url ? (
                            <img
                              src={user.client_profile?.avatar_url || user.service_provider_profile?.avatar_url || ''}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {user.client_profile?.name || user.service_provider_profile?.name || 'No name'}
                            {user.is_admin && (
                              <span className="ml-2 px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded">
                                Admin
                              </span>
                            )}
                          </p>
                          <p className="text-gray-500 text-xs">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-300 text-sm">
                          <Phone className="w-4 h-4 text-gray-500" />
                          {user.phone_number}
                        </div>
                        {user.email && (
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            {user.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {user.client_profile && (
                          <span className={cn(
                            'px-2 py-1 rounded text-xs flex items-center gap-1',
                            user.client_profile.profile_completed
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          )}>
                            <UserCircle className="w-3 h-3" />
                            Client
                          </span>
                        )}
                        {user.service_provider_profile && (
                          <span className={cn(
                            'px-2 py-1 rounded text-xs flex items-center gap-1',
                            user.service_provider_profile.profile_completed
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          )}>
                            <Briefcase className="w-3 h-3" />
                            Provider
                          </span>
                        )}
                        {!user.client_profile && !user.service_provider_profile && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-400 rounded text-xs">
                            No profile
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.is_banned ? (
                        <div>
                          <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Banned
                          </span>
                          {user.banned_reason && (
                            <p className="text-gray-500 text-xs mt-1 truncate max-w-[150px]" title={user.banned_reason}>
                              {user.banned_reason}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                          className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {openDropdown === user.id && (
                          <>
                            <div className="fixed inset-0" onClick={() => setOpenDropdown(null)} />
                            <div className="absolute right-0 mt-1 w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                              {user.is_banned ? (
                                <button
                                  onClick={() => handleUnban(user)}
                                  disabled={actionLoading}
                                  className="w-full px-4 py-2 text-left text-green-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                  Unban User
                                </button>
                              ) : (
                                <button
                                  onClick={() => { setSelectedUser(user); setShowBanModal(true); setOpenDropdown(null) }}
                                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 flex items-center gap-2"
                                >
                                  <Ban className="w-4 h-4" />
                                  Ban User
                                </button>
                              )}
                              <button
                                onClick={() => handleToggleAdmin(user)}
                                disabled={actionLoading}
                                className="w-full px-4 py-2 text-left text-purple-400 hover:bg-gray-800 flex items-center gap-2"
                              >
                                {user.is_admin ? (
                                  <>
                                    <ShieldOff className="w-4 h-4" />
                                    Remove Admin
                                  </>
                                ) : (
                                  <>
                                    <Shield className="w-4 h-4" />
                                    Make Admin
                                  </>
                                )}
                              </button>
                              <div className="border-t border-gray-700 my-1" />
                              <button
                                onClick={() => { setSelectedUser(user); setShowDeleteModal(true); setOpenDropdown(null) }}
                                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-800 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete User
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
              <span className="px-4 py-2 text-white">
                Page {page} of {totalPages}
              </span>
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

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Ban User</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to ban <strong className="text-white">{selectedUser.client_profile?.name || selectedUser.service_provider_profile?.name || selectedUser.phone_number}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm mb-2">Reason for ban *</label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Enter the reason for banning this user..."
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 resize-none"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanReason('') }}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleBan}
                disabled={!banReason.trim() || actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <LoadingSpinner size="sm" />}
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete User</h3>
            <p className="text-gray-400 mb-4">
              Are you sure you want to permanently delete <strong className="text-white">{selectedUser.client_profile?.name || selectedUser.service_provider_profile?.name || selectedUser.phone_number}</strong>?
            </p>
            <p className="text-red-400 text-sm mb-4">
              This action cannot be undone. All user data including profiles, messages, and reviews will be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setSelectedUser(null) }}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <LoadingSpinner size="sm" />}
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

