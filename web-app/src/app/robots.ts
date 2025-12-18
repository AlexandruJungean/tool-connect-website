import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tool-connect.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/profile/edit',
          '/profile/setup/',
          '/messages',
          '/settings',
          '/blocked-users',
          '/requests/create',
          '/requests/*/edit',
        ],
      },
    ],
    sitemap: `${baseUrl}/platform/sitemap.xml`,
  }
}

