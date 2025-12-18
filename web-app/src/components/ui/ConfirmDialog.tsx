'use client'

import React from 'react'
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  const icons = {
    default: Info,
    danger: XCircle,
    warning: AlertTriangle,
    success: CheckCircle,
  }

  const iconColors = {
    default: 'text-blue-500 bg-blue-100',
    danger: 'text-red-500 bg-red-100',
    warning: 'text-yellow-500 bg-yellow-100',
    success: 'text-green-500 bg-green-100',
  }

  const buttonVariants = {
    default: 'primary' as const,
    danger: 'danger' as const,
    warning: 'primary' as const,
    success: 'primary' as const,
  }

  const Icon = icons[variant]

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center">
        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-4 ${iconColors[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

