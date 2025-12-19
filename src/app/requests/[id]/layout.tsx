import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const { data: request } = await supabase
      .from('work_requests')
      .select('title, description, service_category, location, budget_min, budget_max, currency, status')
      .eq('id', id)
      .single()

    if (!request) {
      return {
        title: 'Request Not Found',
        description: 'The requested work request could not be found.',
      }
    }

    const budgetText = request.budget_min && request.budget_max
      ? `Budget: ${request.budget_min}-${request.budget_max} CZK`
      : ''

    const description = `${request.description?.slice(0, 150) || request.title}${
      request.location ? ` Location: ${request.location}.` : ''
    } ${budgetText}`

    return {
      title: request.title,
      description,
      openGraph: {
        title: `${request.title} | Tool Connect`,
        description,
        type: 'article',
      },
      twitter: {
        card: 'summary',
        title: `${request.title} | Tool Connect`,
        description,
      },
      alternates: {
        canonical: `/requests/${id}`,
      },
      robots: request.status === 'open' ? {
        index: true,
        follow: true,
      } : {
        index: false,
        follow: false,
      },
    }
  } catch (error) {
    return {
      title: 'Work Request',
      description: 'View work request details on Tool Connect.',
    }
  }
}

export default function RequestLayout({ children }: Props) {
  return children
}

