'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Apple, Globe, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function DownloadPage() {
  const { language } = useLanguage()
  const [platform, setPlatform] = useState<'ios' | 'android' | 'web' | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(true)

  const urls = {
    ios: 'https://apps.apple.com/us/app/tool/id6739626276',
    android: 'https://play.google.com/store/apps/details?id=com.tool.toolappconnect',
    web: '/search',
  }

  const t = {
    title: 'Tool Connect',
    subtitle: language === 'cs'
      ? 'Spojujeme lidi se spolehlivými profesionály'
      : 'Connecting people with trusted professionals worldwide',
    redirecting: language === 'cs'
      ? 'Přesměrováváme vás...'
      : 'Redirecting you...',
    chooseTitle: language === 'cs'
      ? 'Vyberte si preferovanou platformu:'
      : 'Choose your preferred platform:',
    ios: 'Download for iOS',
    iosSubtitle: 'App Store',
    android: 'Download for Android',
    androidSubtitle: 'Google Play Store',
    web: language === 'cs' ? 'Použít webovou verzi' : 'Use Web Version',
    webSubtitle: language === 'cs' ? 'Bez stahování' : 'No download required',
    backToSite: language === 'cs' ? 'Zpět na hlavní stránku' : 'Back to main site',
  }

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()
    const isIOS = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    let detectedPlatform: 'ios' | 'android' | 'web'
    if (isIOS) {
      detectedPlatform = 'ios'
    } else if (isAndroid) {
      detectedPlatform = 'android'
    } else {
      detectedPlatform = 'web'
    }

    setPlatform(detectedPlatform)

    // Redirect after a short delay
    const timer = setTimeout(() => {
      window.location.href = urls[detectedPlatform]
    }, 2000)

    // Show manual options after 5 seconds if redirect hasn't happened
    const fallbackTimer = setTimeout(() => {
      setIsRedirecting(false)
    }, 5000)

    return () => {
      clearTimeout(timer)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const getPlatformName = () => {
    switch (platform) {
      case 'ios': return 'iOS App Store'
      case 'android': return 'Google Play Store'
      case 'web': return language === 'cs' ? 'Webové aplikace' : 'Web App'
      default: return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-10 max-w-md w-full shadow-2xl animate-fade-in">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo-header.png"
            alt="Tool Connect"
            width={80}
            height={80}
            className="rounded-2xl shadow-lg"
          />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
          {t.title}
        </h1>
        <p className="text-gray-600 text-center mb-8">
          {t.subtitle}
        </p>

        {/* Redirect Message or Manual Options */}
        {isRedirecting ? (
          <div className="bg-primary-50 border border-primary-200 rounded-2xl p-6 text-center mb-8">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-700">
              {t.redirecting} {getPlatformName()}...
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-6">
              {t.chooseTitle}
            </h3>
            <div className="space-y-3">
              <a
                href={urls.ios}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl transition-all group"
              >
                <Apple className="w-8 h-8 text-gray-700 group-hover:text-primary-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.ios}</div>
                  <div className="text-sm text-gray-500">{t.iosSubtitle}</div>
                </div>
              </a>

              <a
                href={urls.android}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl transition-all group"
              >
                <svg className="w-8 h-8 text-gray-700 group-hover:text-primary-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 20.5v-17c0-.59.34-1.11.84-1.35L13.69 12l-9.85 9.85c-.5-.24-.84-.76-.84-1.35zm13.81-5.38L6.05 21.34l8.49-8.49 2.27 2.27zm3.35-4.31c.34.27.59.69.59 1.19s-.22.87-.52 1.14l-2.27 1.29-2.5-2.5 2.5-2.5 2.2 1.38zM6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z"/>
                </svg>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.android}</div>
                  <div className="text-sm text-gray-500">{t.androidSubtitle}</div>
                </div>
              </a>

              <Link
                href={urls.web}
                className="flex items-center gap-4 p-4 bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-200 rounded-xl transition-all group"
              >
                <Globe className="w-8 h-8 text-gray-700 group-hover:text-primary-600" />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">{t.web}</div>
                  <div className="text-sm text-gray-500">{t.webSubtitle}</div>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.backToSite}
          </Link>
        </div>
      </div>
    </div>
  )
}

