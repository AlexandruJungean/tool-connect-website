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
    { label: language === 'cs' ? 'Tool na webu' : 'Tool on web', href: '/search' },
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
              src={isScrolled || !transparent ? '/logo-header.webp' : '/logo-footer.webp'}
              alt="Tool Connect"
              width={160}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center flex-1">
            {items.map((item) => (
              // Make the primary CTA ("Tool on web") more visible
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  item.href === '/search'
                    ? cn(
                        'font-semibold tracking-wide transition-all duration-300',
                        'px-5 py-2.5 rounded-full',
                        // Dynamic sizing/visibility: larger at top, tighter after scroll
                        isScrolled || !transparent ? 'text-base' : 'text-lg',
                        isScrolled || !transparent
                          ? 'text-primary-700 bg-primary-50 hover:bg-primary-100 ring-1 ring-primary-100 shadow-sm'
                          : 'text-white bg-white/15 hover:bg-white/25 border border-white/25 backdrop-blur-sm shadow-md drop-shadow'
                      )
                    : cn(
                        'text-sm font-medium transition-colors px-4 py-2 rounded-lg',
                        isScrolled || !transparent
                          ? 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                      )
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Language Switcher */}
          <div className="hidden lg:flex items-center">
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

