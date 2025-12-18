'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
}

interface MarketingHeaderProps {
  navItems?: NavItem[]
  transparent?: boolean
}

export function MarketingHeader({ navItems, transparent = false }: MarketingHeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const { language, setLanguage } = useLanguage()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const defaultNavItems: NavItem[] = [
    { label: language === 'cs' ? 'Domů' : 'Home', href: '/' },
    { label: language === 'cs' ? 'Výhody' : 'Benefits', href: '/#benefits' },
    { label: language === 'cs' ? 'Funkce' : 'Features', href: '/#features' },
    { label: language === 'cs' ? 'O nás' : 'About', href: '/#about' },
    { label: language === 'cs' ? 'Jak to funguje' : 'How It Works', href: '/#how-it-works' },
    { label: language === 'cs' ? 'Služby' : 'Services', href: '/#categories' },
    { label: language === 'cs' ? 'Stáhnout' : 'Download', href: '/#download' },
    { label: language === 'cs' ? 'Kontakt' : 'Contact', href: '/#contact' },
  ]

  const items = navItems || defaultNavItems

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled || !transparent
          ? 'bg-white shadow-md'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - swap between light/dark versions based on scroll */}
          <Link href="/">
            <Image
              src={isScrolled || !transparent ? '/logo-header.png' : '/logo-footer.png'}
              alt="Tool Connect"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary-600',
                  isScrolled || !transparent ? 'text-gray-700' : 'text-white/90 hover:text-white'
                )}
              >
                {item.label}
              </Link>
            ))}

            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  isScrolled || !transparent
                    ? 'text-gray-700 hover:bg-gray-100'
                    : 'text-white/90 hover:bg-white/10'
                )}
              >
                <Globe className="w-4 h-4" />
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg py-1 z-50">
                  <button
                    onClick={() => { setLanguage('en'); setLangMenuOpen(false) }}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100',
                      language === 'en' ? 'text-primary-600 font-medium' : 'text-gray-700'
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => { setLanguage('cs'); setLangMenuOpen(false) }}
                    className={cn(
                      'block w-full text-left px-4 py-2 text-sm hover:bg-gray-100',
                      language === 'cs' ? 'text-primary-600 font-medium' : 'text-gray-700'
                    )}
                  >
                    Čeština
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'lg:hidden p-2 rounded-lg transition-colors',
              isScrolled || !transparent
                ? 'text-gray-700 hover:bg-gray-100'
                : 'text-white hover:bg-white/10'
            )}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="py-4 space-y-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  {item.label}
                </Link>
              ))}
              <div className="border-t pt-2 mt-2 px-4">
                <button
                  onClick={() => setLanguage(language === 'cs' ? 'en' : 'cs')}
                  className="flex items-center gap-2 py-2 text-gray-700"
                >
                  <Globe className="w-4 h-4" />
                  {language === 'cs' ? 'English' : 'Čeština'}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

