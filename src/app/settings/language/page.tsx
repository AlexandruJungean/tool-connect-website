'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

const AVAILABLE_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
]

export default function LanguageSettingsPage() {
  const router = useRouter()
  const { language, setLanguage } = useLanguage()

  const t = {
    title: language === 'cs' ? 'Jazyk' : 'Language',
    subtitle: language === 'cs' 
      ? 'Vyberte preferovaný jazyk aplikace'
      : 'Choose your preferred app language',
    selected: language === 'cs' ? 'Vybráno' : 'Selected',
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-semibold">{t.title}</h1>
            <p className="text-sm text-gray-500">{t.subtitle}</p>
          </div>
        </div>
      </div>

      {/* Language Options */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          {AVAILABLE_LANGUAGES.map((lang, index) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as 'en' | 'cs')}
              className={cn(
                'w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors',
                index !== AVAILABLE_LANGUAGES.length - 1 && 'border-b border-gray-100'
              )}
            >
              <span className="text-3xl">{lang.flag}</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{lang.nativeName}</p>
                <p className="text-sm text-gray-500">{lang.name}</p>
              </div>
              {language === lang.code && (
                <div className="flex items-center gap-2 text-primary-600">
                  <Check className="w-5 h-5" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <div className="flex gap-3">
            <Globe className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">
                {language === 'cs' 
                  ? 'Změna jazyka ovlivní texty v celé aplikaci. Uživatelský obsah zůstane v původním jazyce.'
                  : 'Changing the language will affect all text in the app. User-generated content will remain in its original language.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

