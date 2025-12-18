'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COUNTRY_CODES, CountryCode, DEFAULT_COUNTRY } from '@/constants/countryCodes'

interface CountryCodePickerProps {
  value: CountryCode
  onChange: (country: CountryCode) => void
  disabled?: boolean
  error?: string
}

export function CountryCodePicker({
  value,
  onChange,
  disabled = false,
  error,
}: CountryCodePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Filter countries
  const filteredCountries = COUNTRY_CODES.filter((country) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      country.name.toLowerCase().includes(query) ||
      country.dialCode.includes(query) ||
      country.code.toLowerCase().includes(query)
    )
  })

  const handleSelect = (country: CountryCode) => {
    onChange(country)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-2.5 bg-white border rounded-xl',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          'transition-colors min-w-[120px]',
          error ? 'border-red-500' : 'border-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-xl">{value.flag}</span>
        <span className="text-sm font-medium text-gray-900">{value.dialCode}</span>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 transition-transform',
          isOpen && 'transform rotate-180'
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Country list */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left',
                    value.code === country.code && 'bg-primary-50'
                  )}
                >
                  <span className="text-xl flex-shrink-0">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 truncate block">
                      {country.name}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 flex-shrink-0">
                    {country.dialCode}
                  </span>
                  {value.code === country.code && (
                    <Check className="w-4 h-4 text-primary-600 flex-shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

