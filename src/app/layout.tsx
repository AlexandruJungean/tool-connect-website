import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { RequireProfile } from '@/components/auth/RequireProfile'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tool-connect.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#5B21B6' },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Tool Connect - Find Trusted Professionals',
    template: '%s | Tool Connect',
  },
  description: 'Tool Connect links people with trusted professionals in any field – from repairs to translations. Find specialists by location and language in Czech Republic.',
  keywords: [
    'professionals',
    'services',
    'repairs',
    'translations',
    'specialists',
    'trusted',
    'Czech Republic',
    'Prague',
    'service providers',
    'handyman',
    'freelancers',
    'experts',
  ],
  authors: [{ name: 'Tool Connect' }],
  creator: 'Tool Connect',
  publisher: 'Tool Connect',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'en': '/',
      'cs': '/?lang=cs',
    },
  },
  openGraph: {
    title: 'Tool Connect - Find Trusted Professionals',
    description: 'Connect with verified professionals for any service. From home repairs to language lessons – find the right expert near you.',
    url: baseUrl,
    siteName: 'Tool Connect',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tool Connect - Find Trusted Professionals',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Connect - Find Trusted Professionals',
    description: 'Connect with verified professionals for any service. Find the right expert near you.',
    images: ['/og-image.png'],
    creator: '@toolconnect',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: '#5B21B6' },
    ],
  },
  manifest: '/manifest.webmanifest',
  category: 'business',
}

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Tool Connect',
  description: 'Find trusted professionals in any field – from repairs to translations.',
  url: baseUrl,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CZK',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '1250',
  },
  author: {
    '@type': 'Organization',
    name: 'Tool Connect',
    url: baseUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <RequireProfile>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </RequireProfile>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
