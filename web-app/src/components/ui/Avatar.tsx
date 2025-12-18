'use client'

import React from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AvatarProps {
  src?: string | null
  alt?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackInitials?: string
}

export function Avatar({
  src,
  alt = 'Avatar',
  size = 'md',
  className,
  fallbackInitials,
}: AvatarProps) {
  const sizes = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  }

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  }

  if (src) {
    return (
      <div className={cn('relative rounded-full overflow-hidden bg-gray-100', sizes[size], className)}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
    )
  }

  if (fallbackInitials) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-medium',
          sizes[size],
          textSizes[size],
          className
        )}
      >
        {fallbackInitials.slice(0, 2).toUpperCase()}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gray-100',
        sizes[size],
        className
      )}
    >
      <User className={cn('text-gray-400', iconSizes[size])} />
    </div>
  )
}

