'use client'

import React from 'react'
import { formatTimeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { MapPin, Calendar } from 'lucide-react'

interface ClientCardProps {
  id: string
  name: string
  surname?: string
  avatarUrl?: string
  location?: string
  memberSince?: string
  requestsCount?: number
  onClick?: () => void
  language?: 'en' | 'cs'
}

export function ClientCard({
  name,
  surname,
  avatarUrl,
  location,
  memberSince,
  requestsCount,
  onClick,
  language = 'en',
}: ClientCardProps) {
  const fullName = surname ? `${name} ${surname}` : name
  const initials = `${name[0]}${surname ? surname[0] : ''}`

  const content = (
    <div className="bg-white rounded-2xl shadow-card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center gap-3">
        <Avatar
          src={avatarUrl}
          fallbackInitials={initials}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{fullName}</h3>
          
          <div className="flex flex-wrap gap-3 mt-1 text-sm text-gray-500">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {memberSince && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>
                  {language === 'cs' ? 'Člen od' : 'Member since'} {new Date(memberSince).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {requestsCount !== undefined && (
            <p className="text-xs text-gray-400 mt-1">
              {requestsCount} {language === 'cs' ? 'požadavků' : 'requests'}
            </p>
          )}
        </div>
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

  return content
}

