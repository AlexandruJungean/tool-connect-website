'use client'

import React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  onChange?: (value: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
}

export function Rating({
  value,
  max = 5,
  onChange,
  readonly = true,
  size = 'md',
  showValue = false,
}: RatingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating)
    }
  }

  // For readonly, display partial stars based on decimal value
  if (readonly) {
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: max }, (_, i) => i + 1).map((starIndex) => {
          // Calculate how much this star should be filled (0 to 1)
          const fill = Math.min(Math.max(value - (starIndex - 1), 0), 1)
          
          return (
            <div key={starIndex} className="relative">
              {/* Empty star (background) */}
              <Star className={cn(sizes[size], "text-gray-200 fill-gray-200")} />
              {/* Filled star (overlay with clip) */}
              {fill > 0 && (
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className={cn(sizes[size], "text-primary-600 fill-primary-600")} />
                </div>
              )}
            </div>
          )
        })}
        {showValue && (
          <span className="ml-1 text-sm font-medium text-gray-700">
            {value.toFixed(1)}
          </span>
        )}
      </div>
    )
  }

  // For editable, use clickable stars (whole numbers only)
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          className={cn(
            'focus:outline-none transition-transform hover:scale-110 cursor-pointer'
          )}
        >
          <Star
            className={cn(
              sizes[size],
              rating <= value
                ? 'fill-primary-600 text-primary-600'
                : 'fill-gray-200 text-gray-200'
            )}
          />
        </button>
      ))}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-700">
          {value.toFixed(1)}
        </span>
      )}
    </div>
  )
}
