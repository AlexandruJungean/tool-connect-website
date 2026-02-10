'use client'

import React, { useState, useEffect } from 'react'
import {
  Star,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  Trash2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  service_provider_id: string
  client_id: string
  rating: number
  comment: string | null
  created_at: string
  client?: {
    name: string
    surname: string | null
    avatar_url: string | null
  }
  provider?: {
    name: string
    surname: string | null
    avatar_url: string | null
    category: string | null
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const limit = 20
  const totalPages = Math.ceil(total / limit)

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      let query = supabase
        .from('reviews')
        .select(`
          *,
          client:client_profiles!client_id(name, surname, avatar_url),
          provider:service_provider_profiles!service_provider_id(name, surname, avatar_url, category)
        `, { count: 'exact' })

      if (ratingFilter !== null) {
        query = query.eq('rating', ratingFilter)
      }

      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      setReviews(data || [])
      setTotal(count || 0)
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [page, ratingFilter])

  const handleDelete = async (id: string) => {
    setActionLoading(true)
    try {
      await supabase.from('reviews').delete().eq('id', id)
      setDeleteId(null)
      fetchReviews()
    } catch (error) {
      console.error('Error deleting review:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              'w-4 h-4',
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <p className="text-gray-400">View and manage service provider reviews</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setRatingFilter(null); setPage(1) }}
          className={cn(
            'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
            ratingFilter === null
              ? 'bg-primary-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
          )}
        >
          All
        </button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => { setRatingFilter(r); setPage(1) }}
            className={cn(
              'px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1',
              ratingFilter === r
                ? 'bg-primary-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            )}
          >
            {r} <Star className="w-3 h-3 fill-current" />
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-white">{total}</p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>
        {[5, 4, 3, 2, 1].map((r) => (
          <div key={r} className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className={cn(
              'text-2xl font-bold',
              r >= 4 ? 'text-green-400' : r === 3 ? 'text-yellow-400' : 'text-red-400'
            )}>
              {reviews.filter(rev => rev.rating === r).length}
            </p>
            <div className="flex justify-center mt-1">{renderStars(r)}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No reviews found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Provider</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Rating</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Comment</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Date</th>
                  <th className="text-left px-4 py-3 text-gray-400 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                          {review.client?.avatar_url ? (
                            <img src={review.client.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <p className="text-white font-medium">
                          {[review.client?.name, review.client?.surname].filter(Boolean).join(' ') || 'Anonymous'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center overflow-hidden">
                          {review.provider?.avatar_url ? (
                            <img src={review.provider.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Briefcase className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{review.provider?.name} {review.provider?.surname}</p>
                          {review.provider?.category && (
                            <p className="text-gray-500 text-xs">{review.provider.category}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-sm truncate max-w-[250px]">
                        {review.comment || <span className="text-gray-500 italic">No comment</span>}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(review.id)}
                        className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Delete Review?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete this review? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <LoadingSpinner size="sm" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

