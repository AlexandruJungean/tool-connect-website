import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tool Connect',
    short_name: 'Tool Connect',
    description: 'Find trusted professionals in any field – from repairs to translations.',
    start_url: '/platform',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5B21B6',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['business', 'lifestyle', 'utilities'],
    lang: 'en',
    dir: 'ltr',
  }
}

