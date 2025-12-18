import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Service Providers',
  description: 'Search and browse trusted professionals in your area. Filter by category, location, language, and more. Find the perfect expert for your needs.',
  openGraph: {
    title: 'Find Service Providers | Tool Connect',
    description: 'Search and browse trusted professionals in your area.',
    type: 'website',
  },
  alternates: {
    canonical: '/search',
  },
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

