'use client'

import React, { useState, useRef, useEffect } from 'react'
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes'
import { ChevronDown, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CountryCodePickerProps {
  selectedCountry: CountryCode
  onSelect: (country: CountryCode) => void
  disabled?: boolean
}

export function CountryCodePicker({ 
  selectedCountry, 
  onSelect,
  disabled = false 
}: CountryCodePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const filteredCountries = COUNTRY_CODES.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.dialCode.includes(searchQuery) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelect = (country: CountryCode) => {
    onSelect(country)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "flex items-center gap-2 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-l-xl",
          "hover:bg-gray-100 transition-colors min-w-[100px]",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="text-xl">{selectedCountry.flag}</span>
        <span className="text-gray-700 font-medium">{selectedCountry.dialCode}</span>
        <ChevronDown className={cn(
          "w-4 h-4 text-gray-500 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          {/* Search */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search country..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleSelect(country)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors",
                    country.code === selectedCountry.code && "bg-primary-50"
                  )}
                >
                  <span className="text-xl">{country.flag}</span>
                  <span className="flex-1 text-gray-900">{country.name}</span>
                  <span className="text-gray-500 text-sm">{country.dialCode}</span>
                  {country.code === selectedCountry.code && (
                    <span className="w-2 h-2 rounded-full bg-primary-600" />
                  )}
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

