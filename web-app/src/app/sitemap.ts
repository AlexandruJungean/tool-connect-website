import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tool-connect.com'
  const platformUrl = `${baseUrl}/platform`

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: platformUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${platformUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${platformUrl}/requests`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    {
      url: `${platformUrl}/welcome`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${platformUrl}/onboarding`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Dynamic provider pages
  let providerPages: MetadataRoute.Sitemap = []
  try {
    const { data: providers } = await supabase
      .from('service_provider_profiles')
      .select('id, updated_at')
      .eq('is_active', true)
      .limit(1000)

    if (providers) {
      providerPages = providers.map((provider) => ({
        url: `${platformUrl}/providers/${provider.id}`,
        lastModified: new Date(provider.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching providers for sitemap:', error)
  }

  // Dynamic request pages (public ones)
  let requestPages: MetadataRoute.Sitemap = []
  try {
    const { data: requests } = await supabase
      .from('work_requests')
      .select('id, updated_at')
      .eq('status', 'open')
      .limit(500)

    if (requests) {
      requestPages = requests.map((request) => ({
        url: `${platformUrl}/requests/${request.id}`,
        lastModified: new Date(request.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.6,
      }))
    }
  } catch (error) {
    console.error('Error fetching requests for sitemap:', error)
  }

  return [...staticPages, ...providerPages, ...requestPages]
}

