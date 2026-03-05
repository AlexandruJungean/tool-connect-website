import type { Metadata, Viewport } from 'next'
import { SEMANTIC } from '@/constants/colors'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { CategoriesProvider } from '@/contexts/CategoriesContext'
import { RequireProfile } from '@/components/auth/RequireProfile'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tool-connect.com'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: SEMANTIC.background },
    { media: '(prefers-color-scheme: dark)', color: SEMANTIC.themeColor },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Tool Connect - Czech Professional Services Marketplace',
    template: '%s | Tool Connect',
  },
  description: 'Tool Connect is a Czech professional services marketplace linking clients with trusted local service providers for repairs, translations, tutoring, and more. Find verified specialists by location and language across Czech Republic.',
  keywords: [
    'professional services marketplace',
    'Czech Republic services',
    'find professionals Czech Republic',
    'service providers marketplace',
    'repairs',
    'translations',
    'specialists',
    'trusted professionals',
    'Prague services',
    'handyman Czech',
    'freelancers',
    'local experts',
    'tool connect marketplace',
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
    title: 'Tool Connect - Czech Professional Services Marketplace',
    description: 'Czech marketplace connecting clients with trusted local service providers. From home repairs to translations – find verified professionals near you in Czech Republic.',
    url: baseUrl,
    siteName: 'Tool Connect',
    images: [
      {
        url: '/og-image.webp',
        width: 1200,
        height: 630,
        alt: 'Tool Connect - Czech Professional Services Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Connect - Czech Professional Services Marketplace',
    description: 'Czech marketplace connecting clients with trusted local service providers. Find verified professionals near you.',
    images: ['/og-image.webp'],
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
      { rel: 'mask-icon', url: '/icons/safari-pinned-tab.svg', color: SEMANTIC.themeColor },
    ],
  },
  manifest: '/manifest.webmanifest',
  category: 'business',
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${baseUrl}/#organization`,
  name: 'Tool Connect',
  legalName: 'Tool Connect',
  description: 'Tool Connect is a Czech professional services marketplace that connects clients with trusted local service providers for repairs, translations, tutoring, and more. Tool Connect is not affiliated with, endorsed by, or related to DeWalt, Stanley Black & Decker, or any power tool manufacturer.',
  url: baseUrl,
  logo: `${baseUrl}/logo.webp`,
  image: `${baseUrl}/og-image.webp`,
  email: 'info@tool-connect.com',
  foundingDate: '2024',
  foundingLocation: {
    '@type': 'Place',
    name: 'Czech Republic',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Czech Republic',
  },
  knowsAbout: [
    'Professional services marketplace',
    'Service provider matching',
    'Home repairs',
    'Translations',
    'Freelance services',
    'Local services',
  ],
  sameAs: [
    'https://facebook.com/toolconnect',
    'https://instagram.com/toolconnect',
    'https://twitter.com/toolconnect',
    'https://linkedin.com/company/toolconnect',
    'https://apps.apple.com/us/app/tool/id6739626276',
    'https://play.google.com/store/apps/details?id=com.tool.toolappconnect',
  ],
}

const webAppJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  '@id': `${baseUrl}/#webapp`,
  name: 'Tool Connect',
  description: 'A professional services marketplace connecting clients with trusted local service providers in Czech Republic. Find specialists for repairs, translations, tutoring, and more.',
  disambiguatingDescription: 'Tool Connect is an independent Czech service marketplace platform for finding local professionals. It is not related to DeWalt Tool Connect or any power tool management system.',
  url: baseUrl,
  applicationCategory: 'BusinessApplication',
  applicationSubCategory: 'Professional Services Marketplace',
  operatingSystem: 'Web, iOS, Android',
  inLanguage: ['en', 'cs'],
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
  author: organizationJsonLd,
  provider: {
    '@id': `${baseUrl}/#organization`,
  },
  countryOfOrigin: {
    '@type': 'Country',
    name: 'Czech Republic',
  },
}

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${baseUrl}/#website`,
  name: 'Tool Connect',
  alternateName: 'Tool Connect Czech Republic',
  description: 'Czech professional services marketplace for finding trusted local service providers.',
  url: baseUrl,
  inLanguage: ['en', 'cs'],
  publisher: {
    '@id': `${baseUrl}/#organization`,
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
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-NT36SNXJQV"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-NT36SNXJQV');
          `}
        </Script>

        {/* Preconnect to external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://formspree.io" />
        
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className="min-h-screen flex flex-col antialiased bg-cover bg-center bg-no-repeat bg-fixed"
        style={{ backgroundImage: "url('/background.webp')" }}
      >
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <CategoriesProvider>
                <RequireProfile>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </RequireProfile>
              </CategoriesProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
