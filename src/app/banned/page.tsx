'use client'

import React from 'react'
import { ShieldX, Mail, ExternalLink } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui'
import { APP_URLS } from '@/constants/urls'

export default function BannedPage() {
  const { language } = useLanguage()
  const { signOut } = useAuth()

  const t = {
    title: language === 'cs' ? 'Účet pozastaven' : 'Account Suspended',
    description: language === 'cs'
      ? 'Váš účet byl pozastaven z důvodu porušení podmínek používání. Pokud si myslíte, že se jedná o chybu, kontaktujte náš tým podpory.'
      : 'Your account has been suspended due to violation of our terms of service. If you believe this is an error, please contact our support team.',
    reason: language === 'cs' ? 'Důvod:' : 'Reason:',
    contact: language === 'cs' ? 'Kontaktovat podporu' : 'Contact Support',
    logout: language === 'cs' ? 'Odhlásit se' : 'Log Out',
    termsLink: language === 'cs' ? 'Zobrazit podmínky používání' : 'View Terms of Service',
    commonReasons: language === 'cs' ? 'Časté důvody pozastavení' : 'Common reasons for suspension',
    reasons: language === 'cs' 
      ? [
          'Porušení komunitních pravidel',
          'Opakované stížnosti od uživatelů',
          'Podvodné nebo klamavé chování',
          'Nevhodný obsah',
        ]
      : [
          'Violation of community guidelines',
          'Repeated complaints from users',
          'Fraudulent or deceptive behavior',
          'Inappropriate content',
        ],
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center p-6">
      {/* Icon */}
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
        <ShieldX className="w-10 h-10 text-red-600" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900 text-center mb-4">
        {t.title}
      </h1>

      {/* Description */}
      <p className="text-gray-600 text-center max-w-md mb-8">
        {t.description}
      </p>

      {/* Common Reasons */}
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mb-8">
        <h3 className="font-medium text-gray-900 mb-3">{t.commonReasons}:</h3>
        <ul className="space-y-2">
          {t.reasons.map((reason, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <a
          href={`mailto:${APP_URLS.supportEmail}?subject=Account Suspension Appeal`}
          className="w-full"
        >
          <Button className="w-full">
            <Mail className="w-4 h-4 mr-2" />
            {t.contact}
          </Button>
        </a>

        <a
          href={APP_URLS.termsOfService}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-sm text-primary-600 hover:text-primary-700 flex items-center justify-center gap-1"
        >
          {t.termsLink}
          <ExternalLink className="w-3 h-3" />
        </a>

        <Button variant="outline" onClick={handleLogout} className="mt-4">
          {t.logout}
        </Button>
      </div>
    </div>
  )
}

