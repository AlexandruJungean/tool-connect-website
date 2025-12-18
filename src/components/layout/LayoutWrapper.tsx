'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutWrapperProps {
  children: React.ReactNode
}

// Pages that should not show header/footer (have their own layout)
const MINIMAL_LAYOUT_PATHS = [
  '/onboarding',
  '/onboarding/client',
  '/onboarding/service-provider',
  '/admin',
]

// Marketing/landing pages with their own header/footer
const MARKETING_PATHS = [
  '/',
  '/service-providers',
  '/privacy-policy',
  '/terms-conditions',
  '/download',
]

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  
  const isMinimalLayout = MINIMAL_LAYOUT_PATHS.some(path => pathname === path || pathname.startsWith(path + '/'))
  const isMarketingPage = MARKETING_PATHS.includes(pathname)

  if (isMinimalLayout || isMarketingPage) {
    return (
      <main className="flex-1">
        {children}
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}

