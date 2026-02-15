'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Linkedin, Apple, Smartphone, Globe } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export function MarketingFooter() {
  const { language } = useLanguage()

  const t = {
    tagline: language === 'cs' 
      ? 'Spojujeme lidi se spolehlivými profesionály.' 
      : 'Connecting people with trusted professionals worldwide.',
    quickLinks: language === 'cs' ? 'Rychlé odkazy' : 'Quick Links',
    home: language === 'cs' ? 'Domů' : 'Home',
    benefits: language === 'cs' ? 'Výhody' : 'Benefits',
    features: language === 'cs' ? 'Funkce' : 'Features',
    howItWorks: language === 'cs' ? 'Jak to funguje' : 'How It Works',
    services: language === 'cs' ? 'Služby' : 'Services',
    serviceProvidersGuide: language === 'cs' ? 'Průvodce pro poskytovatele' : 'Service Providers Guide',
    support: language === 'cs' ? 'Podpora' : 'Support',
    contactSupport: language === 'cs' ? 'Kontaktovat podporu' : 'Contact Support',
    privacyPolicy: language === 'cs' ? 'Zásady ochrany osobních údajů' : 'Privacy Policy',
    termsConditions: language === 'cs' ? 'Podmínky použití' : 'Terms and Conditions',
    followUs: language === 'cs' ? 'Sledujte nás' : 'Follow Us',
    copyright: `© ${new Date().getFullYear()} Tool Connect. ${language === 'cs' ? 'Všechna práva vyhrazena.' : 'All rights reserved.'}`,
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo & Tagline */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.webp"
                alt="Tool Connect"
                width={160}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm">{t.tagline}</p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.quickLinks}</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">{t.home}</Link></li>
              <li><Link href="/#benefits" className="text-gray-400 hover:text-white transition-colors">{t.benefits}</Link></li>
              <li><Link href="/#features" className="text-gray-400 hover:text-white transition-colors">{t.features}</Link></li>
              <li><Link href="/#how-it-works" className="text-gray-400 hover:text-white transition-colors">{t.howItWorks}</Link></li>
              <li><Link href="/#categories" className="text-gray-400 hover:text-white transition-colors">{t.services}</Link></li>
              <li><Link href="/service-providers" className="text-gray-400 hover:text-white transition-colors">{t.serviceProvidersGuide}</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.support}</h4>
            <ul className="space-y-2">
              <li><Link href="/#contact" className="text-gray-400 hover:text-white transition-colors">{t.contactSupport}</Link></li>
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">{t.privacyPolicy}</Link></li>
              <li><Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors">{t.termsConditions}</Link></li>
            </ul>
          </div>

          {/* Social & Apps */}
          <div>
            <h4 className="font-semibold text-lg mb-4">{t.followUs}</h4>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.facebook.com/profile.php?id=61572803991796"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/toolappconnect/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/tool-connect/about/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
            <div className="flex gap-3">
              <a
                href="https://apps.apple.com/us/app/tool/id6739626276"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Apple className="w-5 h-5" />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.tool.toolappconnect"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Smartphone className="w-5 h-5" />
              </a>
              <Link
                href="/search"
                className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Globe className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-500 text-sm">
          {t.copyright}
        </div>
      </div>
    </footer>
  )
}

