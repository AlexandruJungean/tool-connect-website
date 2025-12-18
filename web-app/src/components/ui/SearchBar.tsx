'use client'

import React, { forwardRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void
  showClearButton?: boolean
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ className, value, onClear, showClearButton = true, ...props }, ref) => {
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={ref}
          type="search"
          value={value}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white',
            'placeholder:text-gray-400 text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            className
          )}
          {...props}
        />
        {showClearButton && value && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'

