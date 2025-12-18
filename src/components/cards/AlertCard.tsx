'use client'

import React from 'react'
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AlertCardProps {
  variant: 'error' | 'success' | 'warning' | 'info'
  title?: string
  message: string
  onDismiss?: () => void
  className?: string
}

export function AlertCard({
  variant,
  title,
  message,
  onDismiss,
  className,
}: AlertCardProps) {
  const variants = {
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: AlertCircle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
  }

  const currentVariant = variants[variant]
  const Icon = currentVariant.icon

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        currentVariant.bg,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', currentVariant.iconColor)} />
        <div className="flex-1">
          {title && (
            <h4 className={cn('font-medium mb-1', currentVariant.titleColor)}>
              {title}
            </h4>
          )}
          <p className={cn('text-sm', currentVariant.textColor)}>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 hover:bg-white/50 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  )
}

// Convenience components
export function ErrorCard(props: Omit<AlertCardProps, 'variant'>) {
  return <AlertCard {...props} variant="error" />
}

export function SuccessCard(props: Omit<AlertCardProps, 'variant'>) {
  return <AlertCard {...props} variant="success" />
}

export function WarningCard(props: Omit<AlertCardProps, 'variant'>) {
  return <AlertCard {...props} variant="warning" />
}

export function InfoCard(props: Omit<AlertCardProps, 'variant'>) {
  return <AlertCard {...props} variant="info" />
}

