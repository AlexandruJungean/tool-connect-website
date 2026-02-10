'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotifications } from '@/contexts/NotificationContext'
import { 
  Menu, 
  X, 
  Search, 
  MessageSquare, 
  Bell, 
  User, 
  Settings,
  LogOut,
  Heart,
  FileText,
  ChevronDown,
  Globe,
  ArrowLeftRight,
  Shield
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function Header() {
  const { isAuthenticated, isLoading, user, appUser, clientProfile, serviceProviderProfile, currentUserType, switchUserType, signOut } = useAuth()
  const { language, setLanguage, t } = useLanguage()
  const { unreadMessagesCount, unreadNotificationsCount } = useNotifications()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)

  // Check if a nav link is active based on current path
  const isLinkActive = (href: string) => {
    if (href === '/search') return pathname === '/search'
    if (href === '/messages') return pathname === '/messages'
    if (href === '/requests') return pathname === '/requests' || pathname?.startsWith('/requests/')
    if (href === '/favorites') return pathname === '/favorites'
    if (href === '/apply') return pathname === '/apply' || pathname?.startsWith('/apply/')
    // Provider profile link
    if (href.startsWith('/providers/')) return pathname === href
    if (href === '/profile') return pathname === '/profile'
    return pathname === href
  }

  // Get profile data based on current user type (fallback to client if type not set)
  const currentProfile = currentUserType === 'service_provider' 
    ? serviceProviderProfile 
    : (clientProfile || serviceProviderProfile)
  
  const profileName = currentProfile?.name
  const profileAvatar = currentProfile?.avatar_url
  
  // Check if profile is still loading (authenticated but no profile yet)
  const isProfileLoading = isAuthenticated && !clientProfile && !serviceProviderProfile && !isLoading

  // Navigation links differ based on user type
  const clientNavLinks = [
    { href: '/search', label: t('nav.search'), icon: Search },
    { href: '/favorites', label: t('profile.favorites'), icon: Heart, auth: true },
    { href: '/requests', label: t('nav.requests'), icon: FileText },
    { href: '/messages', label: t('nav.messages'), icon: MessageSquare, auth: true },
  ]

  const providerNavLinks = [
    { href: serviceProviderProfile?.id ? `/providers/${serviceProviderProfile.id}` : '/profile', label: t('nav.profile'), icon: User, auth: true },
    { href: '/apply', label: language === 'cs' ? 'Zakázky' : 'Jobs', icon: FileText, auth: true },
    { href: '/messages', label: t('nav.messages'), icon: MessageSquare, auth: true },
  ]

  const navLinks = currentUserType === 'service_provider' ? providerNavLinks : clientNavLinks

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center gap-2">
            {/* Mobile: Small icon */}
            <img
              src="/icons/icon-192.png"
              alt="Tool Connect"
              width={40}
              height={40}
              className="sm:hidden rounded-xl"
            />
            {/* Desktop: Full logo */}
            <img
              src="/logo-header.webp"
              alt="Tool Connect"
              className="hidden sm:block h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null
              const isMessages = link.href === '/messages'
              const badgeCount = isMessages ? unreadMessagesCount : 0
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                    active
                      ? "text-primary-700 bg-primary-50 font-semibold"
                      : "text-gray-600 hover:text-primary-700 hover:bg-primary-50"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span>{link.label}</span>
                  {badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-3 py-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
              >
                <Globe className="w-5 h-5" />
                <span className="text-sm font-medium uppercase">{language}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {isLangOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setIsLangOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    <button
                      onClick={() => { setLanguage('en'); setIsLangOpen(false) }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-primary-50",
                        language === 'en' && "text-primary-700 font-medium"
                      )}
                    >
                      English
                    </button>
                    <button
                      onClick={() => { setLanguage('cs'); setIsLangOpen(false) }}
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm hover:bg-primary-50",
                        language === 'cs' && "text-primary-700 font-medium"
                      )}
                    >
                      Čeština
                    </button>
                  </div>
                </>
              )}
            </div>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <Link
                  href="/notifications"
                  prefetch={false}
                  className="relative p-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors hidden sm:flex"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 hover:bg-primary-50 rounded-lg transition-colors"
                  >
                    {profileAvatar ? (
                      <img
                        src={profileAvatar}
                        alt={profileName || 'Profile'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-700" />
                      </div>
                    )}
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </button>
                  
                  {isProfileOpen && (
                    <>
                      <div className="fixed inset-0" onClick={() => setIsProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-900">
                            {isLoading || isProfileLoading ? '...' : (profileName || user?.phone || 'User')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {currentUserType === 'service_provider' 
                              ? (language === 'cs' ? 'Poskytovatel služeb' : 'Service Provider')
                              : (language === 'cs' ? 'Klient' : 'Client')
                            }
                          </p>
                        </div>
                        <Link
                          href={currentUserType === 'service_provider' && serviceProviderProfile?.id 
                            ? `/providers/${serviceProviderProfile.id}` 
                            : '/profile'
                          }
                          prefetch={false}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50"
                        >
                          <User className="w-5 h-5" />
                          {t('nav.profile')}
                        </Link>
                        <Link
                          href="/settings"
                          prefetch={false}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50"
                        >
                          <Settings className="w-5 h-5" />
                          {t('nav.settings')}
                        </Link>
                        {/* Admin Dashboard - only show for admins */}
                        {appUser?.is_admin && (
                          <Link
                            href="/admin"
                            prefetch={false}
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2 text-purple-600 hover:bg-purple-50"
                          >
                            <Shield className="w-5 h-5" />
                            {language === 'cs' ? 'Admin Panel' : 'Admin Dashboard'}
                          </Link>
                        )}
                        {/* Switch profile - only show if user has both profiles */}
                        {clientProfile && serviceProviderProfile && (
                          <button
                            onClick={() => {
                              switchUserType(currentUserType === 'service_provider' ? 'client' : 'service_provider')
                              setIsProfileOpen(false)
                            }}
                            className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-primary-50 w-full"
                          >
                            <ArrowLeftRight className="w-5 h-5" />
                            {currentUserType === 'service_provider'
                              ? (language === 'cs' ? 'Přepnout na klienta' : 'Switch to Client')
                              : (language === 'cs' ? 'Přepnout na poskytovatele' : 'Switch to Provider')
                            }
                          </button>
                        )}
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <button
                            onClick={() => { signOut(); setIsProfileOpen(false) }}
                            className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full"
                          >
                            <LogOut className="w-5 h-5" />
                            {t('nav.signOut')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-700 text-white rounded-lg hover:bg-primary-800 transition-colors"
              >
                {t('nav.signIn')}
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              if (link.auth && !isAuthenticated) return null
              const isMessages = link.href === '/messages'
              const badgeCount = isMessages ? unreadMessagesCount : 0
              const active = isLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg",
                    active
                      ? "text-primary-700 bg-primary-50 font-semibold"
                      : "text-gray-700 hover:bg-primary-50"
                  )}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="flex-1">{link.label}</span>
                  {badgeCount > 0 && (
                    <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {badgeCount > 99 ? '99+' : badgeCount}
                    </span>
                  )}
                </Link>
              )
            })}
            {/* Notifications in mobile menu */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                prefetch={false}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 rounded-lg"
              >
                <Bell className="w-5 h-5" />
                <span className="flex-1">{language === 'cs' ? 'Oznámení' : 'Notifications'}</span>
                {unreadNotificationsCount > 0 && (
                  <span className="min-w-[20px] h-5 flex items-center justify-center px-1.5 text-xs font-bold text-white bg-red-500 rounded-full">
                    {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                  </span>
                )}
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                href="/login"
                prefetch={false}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-primary-700 text-white rounded-lg"
              >
                {t('nav.signIn')}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}

