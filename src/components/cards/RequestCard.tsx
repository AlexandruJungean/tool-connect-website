'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Calendar, Clock, ChevronRight } from 'lucide-react'
import { formatTimeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { getCategoryLabel, getSubcategoryLabel } from '@/constants/categories'

interface RequestCardProps {
  id: string
  title: string
  description?: string
  category: string
  subcategory?: string
  location?: string
  budget?: string
  expiresAt?: string
  status: string
  createdAt: string
  applicationsCount?: number
  language?: 'en' | 'cs'
  onClick?: () => void
}

export function RequestCard({
  id,
  title,
  description,
  category,
  subcategory,
  location,
  budget,
  expiresAt,
  status,
  createdAt,
  applicationsCount,
  language = 'en',
  onClick,
}: RequestCardProps) {
  const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
    // Work request statuses
    active: 'success',
    open: 'success',
    paused: 'warning',
    in_progress: 'warning',
    closed: 'default',
    cancelled: 'default',
    completed: 'info',
    // Application statuses
    pending: 'warning',
    accepted: 'success',
    approved: 'success',
    rejected: 'default',
  }

  const statusLabels: Record<string, Record<string, string>> = {
    // Work request statuses
    active: { en: 'Active', cs: 'Aktivní' },
    open: { en: 'Open', cs: 'Otevřeno' },
    paused: { en: 'Paused', cs: 'Pozastaveno' },
    in_progress: { en: 'In Progress', cs: 'Probíhá' },
    closed: { en: 'Closed', cs: 'Uzavřeno' },
    cancelled: { en: 'Cancelled', cs: 'Zrušeno' },
    completed: { en: 'Completed', cs: 'Dokončeno' },
    // Application statuses
    pending: { en: 'Pending', cs: 'Čeká na schválení' },
    accepted: { en: 'Accepted', cs: 'Přijato' },
    approved: { en: 'Approved', cs: 'Schváleno' },
    rejected: { en: 'Rejected', cs: 'Zamítnuto' },
  }

  // Get status variant and label with fallback
  const getStatusVariant = () => statusVariants[status] || 'default'
  const getStatusLabel = () => statusLabels[status]?.[language] || status

  const content = (
    <div className="bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
          <p className="text-sm text-gray-500">
            {getCategoryLabel(category, language)}
            {subcategory && ` • ${getSubcategoryLabel(category, subcategory, language)}`}
          </p>
        </div>
        <Badge variant={getStatusVariant()}>
          {getStatusLabel()}
        </Badge>
      </div>

      {description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{description}</p>
      )}

      <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-3">
        {location && (
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span className="truncate max-w-[150px]">{location}</span>
          </div>
        )}
        {expiresAt && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(expiresAt).toLocaleDateString()}</span>
          </div>
        )}
        {budget && (
          <div className="flex items-center gap-1 font-medium text-gray-900">
            {budget}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(createdAt)}</span>
        </div>
        {applicationsCount !== undefined && (
          <span className="text-xs text-gray-500">
            {applicationsCount} {language === 'cs' ? 'přihlášek' : 'applications'}
          </span>
        )}
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left">
        {content}
      </button>
    )
  }

  return (
    <Link href={`/requests/${id}`} prefetch={false}>
      {content}
    </Link>
  )
}

