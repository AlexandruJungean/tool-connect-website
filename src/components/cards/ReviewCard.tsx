'use client'

import React from 'react'
import { formatTimeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'

interface ReviewCardProps {
  id: string
  rating: number
  reviewText?: string
  createdAt: string
  reviewerName?: string
  reviewerAvatar?: string
  canEdit?: boolean
  onEdit?: () => void
  language?: 'en' | 'cs'
}

export function ReviewCard({
  rating,
  reviewText,
  createdAt,
  reviewerName,
  reviewerAvatar,
  canEdit,
  onEdit,
  language = 'en',
}: ReviewCardProps) {
  const getInitials = (name?: string) => {
    if (!name) return 'A'
    return name.split(' ').map(n => n[0]).join('').slice(0, 2)
  }

  return (
    <div className="bg-white rounded-2xl shadow-card p-4">
      <div className="flex items-start gap-3">
        <Avatar
          src={reviewerAvatar}
          fallbackInitials={getInitials(reviewerName)}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-medium text-gray-900 truncate">
              {reviewerName || (language === 'cs' ? 'Anonymní uživatel' : 'Anonymous')}
            </span>
            <span className="text-xs text-gray-400 flex-shrink-0">
              {formatTimeAgo(createdAt)}
            </span>
          </div>
          <Rating value={rating} size="sm" />
          {reviewText && (
            <p className="mt-2 text-sm text-gray-600">{reviewText}</p>
          )}
          {canEdit && onEdit && (
            <button
              onClick={onEdit}
              className="mt-2 text-sm text-primary-600 hover:text-primary-700"
            >
              {language === 'cs' ? 'Upravit' : 'Edit'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

