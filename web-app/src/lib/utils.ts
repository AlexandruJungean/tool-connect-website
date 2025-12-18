import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale: 'en' | 'cs' = 'en'): string {
  const d = new Date(date)
  return d.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTimeAgo(date: string | Date, locale: 'en' | 'cs' = 'en'): string {
  const now = new Date()
  const d = new Date(date)
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (locale === 'cs') {
    if (diffMins < 1) return 'právě teď'
    if (diffMins < 60) return `před ${diffMins} min`
    if (diffHours < 24) return `před ${diffHours} hod`
    if (diffDays < 7) return `před ${diffDays} dny`
    return formatDate(date, locale)
  }

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return formatDate(date, locale)
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

export function getInitials(name: string, surname?: string | null): string {
  const first = name?.charAt(0)?.toUpperCase() || ''
  const last = surname?.charAt(0)?.toUpperCase() || ''
  return first + last || '?'
}

