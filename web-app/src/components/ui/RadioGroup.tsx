'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value: string
  onChange: (value: string) => void
  label?: string
  error?: string
  orientation?: 'horizontal' | 'vertical'
}

export function RadioGroup({
  name,
  options,
  value,
  onChange,
  label,
  error,
  orientation = 'vertical',
}: RadioGroupProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          'flex gap-3',
          orientation === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
              value === option.value
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300',
              option.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => !option.disabled && onChange(option.value)}
              disabled={option.disabled}
              className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-gray-900">
                {option.label}
              </span>
              {option.description && (
                <span className="block text-sm text-gray-500 mt-0.5">
                  {option.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}

