import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Work Requests',
  description: 'Browse work requests from clients looking for professionals. Find opportunities that match your skills and apply today.',
  openGraph: {
    title: 'Work Requests | Tool Connect',
    description: 'Browse work requests from clients looking for professionals.',
    type: 'website',
  },
  alternates: {
    canonical: '/requests',
  },
}

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

