'use client'

import React, { useEffect } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './Button'

interface FilterOption {
  value: string
  label: string
}

interface FilterSection {
  id: string
  title: string
  type: 'single' | 'multiple' | 'range'
  options?: FilterOption[]
  min?: number
  max?: number
}

interface FilterValues {
  [key: string]: string | string[] | [number, number]
}

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  sections: FilterSection[]
  values: FilterValues
  onChange: (values: FilterValues) => void
  onReset: () => void
  onApply: () => void
  applyLabel?: string
  resetLabel?: string
}

export function FilterSheet({
  isOpen,
  onClose,
  title = 'Filters',
  sections,
  values,
  onChange,
  onReset,
  onApply,
  applyLabel = 'Apply Filters',
  resetLabel = 'Reset',
}: FilterSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleSingleSelect = (sectionId: string, value: string) => {
    onChange({
      ...values,
      [sectionId]: values[sectionId] === value ? '' : value,
    })
  }

  const handleMultipleSelect = (sectionId: string, value: string) => {
    const current = (values[sectionId] as string[]) || []
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    onChange({
      ...values,
      [sectionId]: newValues,
    })
  }

  const handleRangeChange = (sectionId: string, index: 0 | 1, value: number) => {
    const current = (values[sectionId] as [number, number]) || [0, 0]
    const newRange: [number, number] = [...current] as [number, number]
    newRange[index] = value
    onChange({
      ...values,
      [sectionId]: newRange,
    })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {sections.map((section) => (
            <div key={section.id}>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {section.title}
              </h3>

              {section.type === 'single' && section.options && (
                <div className="flex flex-wrap gap-2">
                  {section.options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSingleSelect(section.id, option.value)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                        values[section.id] === option.value
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {section.type === 'multiple' && section.options && (
                <div className="space-y-2">
                  {section.options.map((option) => {
                    const selected = ((values[section.id] as string[]) || []).includes(option.value)
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleMultipleSelect(section.id, option.value)}
                        className={cn(
                          'w-full flex items-center justify-between p-3 rounded-xl border-2 transition-colors text-left',
                          selected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {option.label}
                        </span>
                        {selected && (
                          <Check className="w-5 h-5 text-primary-600" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}

              {section.type === 'range' && (
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Min</label>
                    <input
                      type="number"
                      min={section.min}
                      max={section.max}
                      value={(values[section.id] as [number, number])?.[0] || ''}
                      onChange={(e) => handleRangeChange(section.id, 0, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder={section.min?.toString()}
                    />
                  </div>
                  <span className="text-gray-400 mt-5">—</span>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">Max</label>
                    <input
                      type="number"
                      min={section.min}
                      max={section.max}
                      value={(values[section.id] as [number, number])?.[1] || ''}
                      onChange={(e) => handleRangeChange(section.id, 1, Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                      placeholder={section.max?.toString()}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t bg-white">
          <Button variant="outline" onClick={onReset} className="flex-1">
            {resetLabel}
          </Button>
          <Button onClick={onApply} className="flex-1">
            {applyLabel}
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </>
  )
}

