import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tool Connect - Czech Professional Services Marketplace',
  description: 'Tool Connect is a Czech professional services marketplace connecting clients with trusted local service providers for repairs, translations, tutoring, and more. Find specialists by location and language in Czech Republic.',
  keywords: [
    'tool connect marketplace',
    'Czech service providers',
    'professional services Czech Republic',
    'find professionals',
    'repairs',
    'translations',
    'handyman Czech',
    'specialists marketplace',
    'trusted professionals Czech Republic',
    'local service marketplace',
  ],
  openGraph: {
    title: 'Tool Connect - Czech Professional Services Marketplace',
    description: 'Czech marketplace connecting clients with trusted local service providers. From home repairs to translations – find verified professionals near you.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'cs_CZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Connect - Czech Professional Services Marketplace',
    description: 'Czech marketplace connecting clients with trusted local service providers.',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

