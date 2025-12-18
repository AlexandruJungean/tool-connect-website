import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tool Connect - Find Trusted Professionals Anytime, Anywhere',
  description: 'Tool Connect links people with trusted professionals in any field – from repairs to translations. Find specialists by location and language in Czech Republic.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

