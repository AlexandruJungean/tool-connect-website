'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'en' | 'cs'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.requests': 'Requests',
    'nav.messages': 'Messages',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.submit': 'Submit',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.noResults': 'No results found',
    'common.seeAll': 'See All',
    'common.seeMore': 'See More',
    'common.seeLess': 'See Less',
    
    // Search
    'search.title': 'Find Service Providers',
    'search.placeholder': 'Search by name, service, or keyword...',
    'search.category': 'Category',
    'search.subcategory': 'Subcategory',
    'search.location': 'Location',
    'search.providerType': 'Provider Type',
    'search.languages': 'Languages',
    'search.minRating': 'Minimum Rating',
    'search.applyFilters': 'Apply Filters',
    'search.clearFilters': 'Clear Filters',
    'search.results': 'results',
    'search.allCategories': 'All Categories',
    'search.allSubcategories': 'All Subcategories',
    'search.anyType': 'Any Type',
    'search.company': 'Company',
    'search.selfEmployed': 'Self-Employed',
    
    // Provider
    'provider.rating': 'Rating',
    'provider.reviews': 'reviews',
    'provider.noRating': 'No rating yet',
    'provider.services': 'Services',
    'provider.about': 'About',
    'provider.pricing': 'Pricing',
    'provider.perHour': 'per hour',
    'provider.languages': 'Languages',
    'provider.portfolio': 'Portfolio',
    'provider.contact': 'Contact',
    'provider.sendMessage': 'Send Message',
    'provider.call': 'Call',
    'provider.addToFavorites': 'Add to Favorites',
    'provider.removeFromFavorites': 'Remove from Favorites',
    'provider.share': 'Share',
    'provider.report': 'Report',
    'provider.writeReview': 'Write a Review',
    'provider.workPhotos': 'Work Photos',
    
    // Requests
    'requests.title': 'Work Requests',
    'requests.createNew': 'Create Request',
    'requests.myRequests': 'My Requests',
    'requests.browseRequests': 'Browse Requests',
    'requests.all': 'All',
    'requests.active': 'Active',
    'requests.paused': 'Paused',
    'requests.closed': 'Closed',
    'requests.completed': 'Completed',
    'requests.apply': 'Apply',
    'requests.applied': 'Applied',
    'requests.applications': 'Applications',
    'requests.noRequests': 'No work requests yet',
    
    // Messages
    'messages.title': 'Messages',
    'messages.noConversations': 'No conversations yet',
    'messages.typeMessage': 'Type a message...',
    'messages.send': 'Send',
    
    // Profile
    'profile.editProfile': 'Edit Profile',
    'profile.favorites': 'Favorites',
    'profile.settings': 'Settings',
    'profile.myReviews': 'My Reviews',
    'profile.switchToClient': 'Switch to Client',
    'profile.switchToProvider': 'Switch to Provider',
    'profile.noFavoriteProviders': 'No favorite providers yet',
    'profile.addProvidersToFavorites': 'Browse and add service providers to your favorites',
    
    // Notifications
    'notifications.title': 'Notifications',
    'notifications.noNotifications': 'No notifications',
    'notifications.infoMessage': 'You will receive notifications here',
    'notifications.markAllRead': 'Mark all as read',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.phoneNumber': 'Phone Number',
    'auth.verificationCode': 'Verification Code',
    'auth.sendCode': 'Send Code',
    'auth.verify': 'Verify',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.haveAccount': 'Already have an account?',
    
    // Footer
    'footer.about': 'About',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.contact': 'Contact',
    'footer.downloadApp': 'Download App',
  },
  cs: {
    // Navigation
    'nav.home': 'Domů',
    'nav.search': 'Hledat',
    'nav.requests': 'Poptávky',
    'nav.messages': 'Zprávy',
    'nav.profile': 'Profil',
    'nav.settings': 'Nastavení',
    'nav.signIn': 'Přihlásit se',
    'nav.signOut': 'Odhlásit se',
    
    // Common
    'common.loading': 'Načítání...',
    'common.error': 'Došlo k chybě',
    'common.save': 'Uložit',
    'common.cancel': 'Zrušit',
    'common.delete': 'Smazat',
    'common.edit': 'Upravit',
    'common.back': 'Zpět',
    'common.next': 'Další',
    'common.submit': 'Odeslat',
    'common.search': 'Hledat',
    'common.filter': 'Filtr',
    'common.noResults': 'Nebyly nalezeny žádné výsledky',
    'common.seeAll': 'Zobrazit vše',
    'common.seeMore': 'Zobrazit více',
    'common.seeLess': 'Zobrazit méně',
    
    // Search
    'search.title': 'Najít poskytovatele služeb',
    'search.placeholder': 'Hledat podle jména, služby nebo klíčového slova...',
    'search.category': 'Kategorie',
    'search.subcategory': 'Podkategorie',
    'search.location': 'Lokace',
    'search.providerType': 'Typ poskytovatele',
    'search.languages': 'Jazyky',
    'search.minRating': 'Minimální hodnocení',
    'search.applyFilters': 'Použít filtry',
    'search.clearFilters': 'Vymazat filtry',
    'search.results': 'výsledků',
    'search.allCategories': 'Všechny kategorie',
    'search.allSubcategories': 'Všechny podkategorie',
    'search.anyType': 'Jakýkoliv typ',
    'search.company': 'Společnost',
    'search.selfEmployed': 'OSVČ',
    
    // Provider
    'provider.rating': 'Hodnocení',
    'provider.reviews': 'recenzí',
    'provider.noRating': 'Zatím bez hodnocení',
    'provider.services': 'Služby',
    'provider.about': 'O mně',
    'provider.pricing': 'Ceník',
    'provider.perHour': 'za hodinu',
    'provider.languages': 'Jazyky',
    'provider.portfolio': 'Portfolio',
    'provider.contact': 'Kontakt',
    'provider.sendMessage': 'Poslat zprávu',
    'provider.call': 'Zavolat',
    'provider.addToFavorites': 'Přidat do oblíbených',
    'provider.removeFromFavorites': 'Odebrat z oblíbených',
    'provider.share': 'Sdílet',
    'provider.report': 'Nahlásit',
    'provider.writeReview': 'Napsat recenzi',
    'provider.workPhotos': 'Fotografie prací',
    
    // Requests
    'requests.title': 'Pracovní poptávky',
    'requests.createNew': 'Vytvořit poptávku',
    'requests.myRequests': 'Moje poptávky',
    'requests.browseRequests': 'Procházet poptávky',
    'requests.all': 'Všechny',
    'requests.active': 'Aktivní',
    'requests.paused': 'Pozastaveno',
    'requests.closed': 'Uzavřeno',
    'requests.completed': 'Dokončeno',
    'requests.apply': 'Reagovat',
    'requests.applied': 'Reagováno',
    'requests.applications': 'Reakce',
    'requests.noRequests': 'Zatím žádné poptávky',
    
    // Messages
    'messages.title': 'Zprávy',
    'messages.noConversations': 'Zatím žádné konverzace',
    'messages.typeMessage': 'Napište zprávu...',
    'messages.send': 'Odeslat',
    
    // Profile
    'profile.editProfile': 'Upravit profil',
    'profile.favorites': 'Oblíbené',
    'profile.settings': 'Nastavení',
    'profile.myReviews': 'Moje recenze',
    'profile.switchToClient': 'Přepnout na klienta',
    'profile.switchToProvider': 'Přepnout na poskytovatele',
    'profile.noFavoriteProviders': 'Zatím žádní oblíbení poskytovatelé',
    'profile.addProvidersToFavorites': 'Procházejte a přidávejte poskytovatele služeb do oblíbených',
    
    // Notifications
    'notifications.title': 'Oznámení',
    'notifications.noNotifications': 'Žádná oznámení',
    'notifications.infoMessage': 'Zde budete dostávat oznámení',
    'notifications.markAllRead': 'Označit vše jako přečtené',
    
    // Auth
    'auth.signIn': 'Přihlásit se',
    'auth.signUp': 'Registrovat se',
    'auth.phoneNumber': 'Telefonní číslo',
    'auth.verificationCode': 'Ověřovací kód',
    'auth.sendCode': 'Odeslat kód',
    'auth.verify': 'Ověřit',
    'auth.forgotPassword': 'Zapomenuté heslo?',
    'auth.noAccount': 'Nemáte účet?',
    'auth.haveAccount': 'Již máte účet?',
    
    // Footer
    'footer.about': 'O nás',
    'footer.privacy': 'Zásady ochrany osobních údajů',
    'footer.terms': 'Podmínky',
    'footer.contact': 'Kontakt',
    'footer.downloadApp': 'Stáhnout aplikaci',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('cs')

  useEffect(() => {
    // Load saved language preference
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'cs')) {
      setLanguageState(saved)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

