'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { LogIn, X } from 'lucide-react'
import { Button } from './Button'

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  /** Optional redirect path after login (defaults to current page) */
  redirectTo?: string
}

export function LoginPromptModal({ isOpen, onClose, redirectTo }: LoginPromptModalProps) {
  const router = useRouter()
  const { language } = useLanguage()

  if (!isOpen) return null

  const handleSignIn = () => {
    const redirect = redirectTo || window.location.pathname
    router.push(`/login?redirect=${encodeURIComponent(redirect)}`)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 relative shadow-xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <LogIn className="w-7 h-7 text-primary-700" />
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          {language === 'cs'
            ? 'Přihlaste se pro kontaktování profesionálů'
            : 'Sign in to contact professionals'}
        </h3>
        <p className="text-gray-500 text-center mb-6">
          {language === 'cs'
            ? 'Je to zdarma. Přihlaste se a spojte se s ověřenými profesionály.'
            : "It's free. Sign in and connect with trusted professionals."}
        </p>

        {/* CTA */}
        <Button
          onClick={handleSignIn}
          size="lg"
          className="w-full"
          leftIcon={<LogIn className="w-5 h-5" />}
        >
          {language === 'cs' ? 'Přihlásit se' : 'Sign In'}
        </Button>

        {/* Dismiss */}
        <button
          onClick={onClose}
          className="w-full mt-3 text-center text-sm text-gray-500 hover:text-gray-700"
        >
          {language === 'cs' ? 'Teď ne' : 'Not now'}
        </button>
      </div>
    </div>
  )
}
