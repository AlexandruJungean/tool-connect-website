'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { MapPin, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { searchPlaces, PlacePrediction } from '@/lib/googlePlaces'

interface LocationInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}

export function LocationInput({
  value,
  onChange,
  label,
  placeholder = 'Enter location...',
  error,
  disabled = false,
}: LocationInputProps) {
  const [inputValue, setInputValue] = useState(value)
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setInputValue(newValue)
      onChange(newValue)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      if (newValue.length >= 2) {
        setIsLoading(true)
        debounceRef.current = setTimeout(async () => {
          try {
            const results = await searchPlaces(newValue)
            setSuggestions(results)
            setShowSuggestions(true)
          } catch (err) {
            console.error('Failed to fetch suggestions:', err)
          } finally {
            setIsLoading(false)
          }
        }, 300)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    },
    [onChange]
  )

  const handleSelectSuggestion = useCallback(
    (suggestion: PlacePrediction) => {
      setInputValue(suggestion.description)
      onChange(suggestion.description)
      setSuggestions([])
      setShowSuggestions(false)
    },
    [onChange]
  )

  const handleClear = useCallback(() => {
    setInputValue('')
    onChange('')
    setSuggestions([])
    setShowSuggestions(false)
  }, [onChange])

  return (
    <div className="w-full" ref={wrapperRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full pl-10 pr-10 py-3 rounded-xl border bg-white text-gray-900',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed',
            error ? 'border-red-500' : 'border-gray-200'
          )}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {inputValue && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3"
              >
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </p>
                  <p className="text-xs text-gray-500">
                    {suggestion.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

