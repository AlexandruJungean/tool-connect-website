import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  try {
    const { data: provider } = await supabase
      .from('service_provider_profiles')
      .select('name, surname, headline, service_category, location, average_rating, review_count, avatar_url')
      .eq('id', id)
      .single()

    if (!provider) {
      return {
        title: 'Provider Not Found',
        description: 'The requested service provider could not be found.',
      }
    }

    const fullName = `${provider.name} ${provider.surname}`
    const title = provider.headline 
      ? `${fullName} - ${provider.headline}`
      : fullName
    
    const description = `${fullName} is a trusted professional on Tool Connect. ${
      provider.location ? `Located in ${provider.location}.` : ''
    } ${
      provider.average_rating ? `Rated ${provider.average_rating.toFixed(1)}/5 with ${provider.review_count} reviews.` : ''
    } Contact now for quality service.`

    return {
      title,
      description,
      openGraph: {
        title: `${title} | Tool Connect`,
        description,
        type: 'profile',
        images: provider.avatar_url ? [{ url: provider.avatar_url }] : undefined,
      },
      twitter: {
        card: 'summary',
        title: `${title} | Tool Connect`,
        description,
        images: provider.avatar_url ? [provider.avatar_url] : undefined,
      },
      alternates: {
        canonical: `/platform/providers/${id}`,
      },
    }
  } catch (error) {
    return {
      title: 'Service Provider',
      description: 'View service provider profile on Tool Connect.',
    }
  }
}

export default function ProviderLayout({ children }: Props) {
  return children
}

