import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tool Connect - Trusted Professionals',
  description: 'Tool Connect links people with trusted professionals in any field – from repairs to translations. Find specialists by location and language in Czech Republic.',
  keywords: [
    'tool connect',
    'service providers',
    'professionals',
    'Czech Republic',
    'repairs',
    'translations',
    'handyman',
    'specialists',
    'trusted professionals',
  ],
  openGraph: {
    title: 'Tool Connect - Trusted Professionals',
    description: 'Connect with verified professionals for any service. From home repairs to language lessons – find the right expert near you.',
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'cs_CZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tool Connect - Trusted Professionals',
    description: 'Connect with verified professionals for any service.',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

