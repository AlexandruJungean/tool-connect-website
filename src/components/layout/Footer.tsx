'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import { Apple, PlayCircle, Globe, Facebook, Instagram, Linkedin } from 'lucide-react'

export function Footer() {
  const { t } = useLanguage()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo-footer.png"
                alt="Tool Connect"
                className="h-10 w-auto"
              />
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Connecting people with trusted professionals worldwide.
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=61572803991796"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/toolappconnect/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/tool-connect/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search" prefetch={false} className="text-sm hover:text-primary-400 transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link href="/requests" prefetch={false} className="text-sm hover:text-primary-400 transition-colors">
                  {t('nav.requests')}
                </Link>
              </li>
              <li>
                <a href="/" className="text-sm hover:text-primary-400 transition-colors">
                  {t('nav.home')}
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <a href="/privacy-policy.html" className="text-sm hover:text-primary-400 transition-colors">
                  {t('footer.privacy')}
                </a>
              </li>
              <li>
                <a href="/terms-conditions.html" className="text-sm hover:text-primary-400 transition-colors">
                  {t('footer.terms')}
                </a>
              </li>
              <li>
                <a href="mailto:info@tool-connect.com" className="text-sm hover:text-primary-400 transition-colors">
                  {t('footer.contact')}
                </a>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div>
            <h4 className="font-semibold text-white mb-4">{t('footer.downloadApp')}</h4>
            <div className="space-y-2">
              <a
                href="https://apps.apple.com/us/app/tool/id6739626276"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Apple className="w-6 h-6" />
                <div className="text-sm">
                  <div className="text-xs text-gray-400">Download on the</div>
                  <div className="font-medium text-white">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <PlayCircle className="w-6 h-6" />
                <div className="text-sm">
                  <div className="text-xs text-gray-400">Get it on</div>
                  <div className="font-medium text-white">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Tool Connect. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

